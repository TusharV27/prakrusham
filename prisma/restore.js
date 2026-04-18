import 'dotenv/config';
import prisma from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';

async function restoreData(backupPath) {
  console.log('🚀 Starting database restore...');

  if (!backupPath) {
    console.error('❌ Please provide a backup path');
    console.log('Usage: node prisma/restore.js <backup-directory>');
    process.exit(1);
  }

  const fullBackupPath = path.resolve(backupPath);

  if (!fs.existsSync(fullBackupPath)) {
    console.error(`❌ Backup directory not found: ${fullBackupPath}`);
    process.exit(1);
  }

  try {
    // Read backup metadata
    const metadataPath = path.join(fullBackupPath, 'backup-info.json');
    if (!fs.existsSync(metadataPath)) {
      console.error('❌ Backup metadata not found');
      process.exit(1);
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    console.log(`📅 Restoring backup from: ${metadata.timestamp}`);
    console.log(`📊 Total records to restore: ${Object.values(metadata.recordCounts).reduce((a, b) => a + b, 0)}`);

    // Tables in order of dependencies (parents first for foreign keys)
    const tables = [
      // Level 0: Independent or Base
      'User',
      'StoreSetting',
      'PincodeData',
      'Category',
      'Warehouse',
      'ShippingProfile',
      'LocalDeliverySetting',
      'LocalPickupSetting',
      'ShippingPackage',
      'Blog',
      'Page',
      'Contact',
      'MetafieldDefinition',
      'MetaobjectDefinition',
      'Translation',

      // Level 1: Depends on Level 0
      'Customer',
      'Farmer',
      'Vendor',
      'Offer',
      'Event',
      'MetaobjectField',
      'ShippingZone',

      // Level 2: Depends on Levels 0-1
      'Address',
      'Article',
      'Metaobject',
      'Product',
      'Area',
      'ShippingRate',

      // Level 3: Depends on Levels 0-2
      'ProductVariant',
      'ProductMetafield',
      'CategoryMetafield',
      'CustomerMetafield',
      'BlogMetafield',
      'ArticleMetafield',
      'PageMetafield',
      'ProductRequest',
      'Image',
      'Review',

      // Level 4: Depends on Levels 0-3
      'InventoryItem',
      'Order',
      'Cart',
      'Wishlist',
      'FarmerMetafield',
      'VendorMetafield',
      'WarehouseMetafield',
      'ProductVariantMetafield',

      // Level 5: Depends on Levels 0-4
      'OrderItem',
      'CartItem',
      'WishlistItem',
      'UserOtp',
      'OrderMetafield',
    ];

    for (const table of tables) {
      const filePath = path.join(fullBackupPath, `${table.toLowerCase()}.json`);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${table} - backup file not found`);
        continue;
      }

      console.log(`📦 Restoring ${table}...`);

      const records = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (records.length === 0) {
        console.log(`⚠️  No records to restore for ${table}`);
        continue;
      }

      // Clear existing data (optional - uncomment if you want to replace all data)
      // await prisma[table.toLowerCase()].deleteMany();

      // Restore records
      for (const record of records) {
        try {
          // Remove createdAt/updatedAt to let Prisma handle them
          const { createdAt, updatedAt, ...data } = record;

          // Handle nested relations
          const processedData = processRecordForRestore(table, data);

          // model name in client follows camelCase (lower first letter)
          const modelName = table.charAt(0).toLowerCase() + table.slice(1);

          if (!prisma[modelName]) {
            console.warn(`⚠️  Model ${modelName} not found in Prisma client`);
            continue;
          }

          await prisma[modelName].upsert({
            where: getUniqueKey(table, data),
            update: processedData,
            create: processedData,
          });
        } catch (error) {
          console.warn(`⚠️  Failed to restore ${table} record:`, error.message);
          // Continue with other records
        }
      }

      console.log(`✅ ${table}: ${records.length} records restored`);
    }

    console.log('🎉 Restore completed successfully!');
  } catch (error) {
    console.error('❌ Restore failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to get unique key for upsert
function getUniqueKey(table, data) {
  // Since we have IDs for all records in the backup, using ID is the most robust way to upsert
  return { id: data.id };
}

// Helper function to process records for restore (handle relations)
function processRecordForRestore(table, data) {
  const processed = { ...data };
  
  // List of fields that are actually scalars but might be null
  // We want to keep these if the schema allows them to be null
  const allowedNulls = [
    'shortDesc', 'description', 'compareAtPrice', 'costPerItem', 
    'sku', 'barcode', 'weight', 'categoryId', 'vendorId', 'farmerId',
    'locationName', 'address', 'area', 'landmark', 'addressLine2', 'phone', 'profileImage', 'name'
  ];

  for (const key in processed) {
    const value = processed[key];
    
    // Remove relation arrays that were included in the backup
    if (Array.isArray(value)) {
      delete processed[key];
      continue;
    }

    // Special handling for null relations that are NOT the foreign key itself
    // e.g., 'customer: null' in User backup
    const relationFields = {
      User: ['customer', 'farmer', 'articles', 'cart', 'reviews', 'wishlist'],
      Customer: ['user', 'addresses', 'orders'],
      Address: ['customer'],
      Product: ['category', 'vendor', 'farmer', 'productRequests', 'inventoryItems', 'images', 'offers', 'reviews', 'variants', 'orderItems', 'cartItems', 'wishlistItems', 'shippingProfile', 'metafields'],
      Category: ['products'],
      Farmer: ['user', 'products', 'images', 'reviews'],
      Vendor: ['products', 'images', 'reviews', 'productRequests'],
      Image: ['product', 'farmer', 'event', 'warehouse', 'vendor', 'offer'],
      Review: ['author', 'product', 'farmer', 'vendor'],
      Warehouse: ['images', 'inventoryItems'],
      InventoryItem: ['product', 'variant', 'warehouse'],
      Order: ['customer', 'items', 'metafields'],
      Offer: ['products', 'images'],
      ProductVariant: ['product', 'inventoryItems', 'metafields'],
      OrderItem: ['order', 'product'],
      Article: ['author', 'blog', 'metafields'],
      Blog: ['articles', 'metafields'],
      Page: ['metafields'],
      Cart: ['user', 'items'],
      CartItem: ['cart', 'product'],
      Wishlist: ['user', 'items'],
      WishlistItem: ['wishlist', 'product'],
      ShippingProfile: ['products', 'zones'],
      ShippingZone: ['profile', 'rates'],
      ShippingRate: ['zone'],
      MetaobjectDefinition: ['fields', 'metaobjects'],
      MetaobjectField: ['definition'],
      Metaobject: ['definition'],
      ProductMetafield: ['product'],
      CategoryMetafield: ['category'],
      CustomerMetafield: ['customer'],
      BlogMetafield: ['blog'],
      ArticleMetafield: ['article'],
      PageMetafield: ['page'],
      ProductVariantMetafield: ['variant'],
      OrderMetafield: ['order'],
      FarmerMetafield: ['farmer'],
      VendorMetafield: ['vendor'],
      WarehouseMetafield: ['warehouse'],
    };

    if (relationFields[table] && relationFields[table].includes(key)) {
      delete processed[key];
    }
  }

  return processed;
}


// List available backups
function listBackups() {
  const backupDir = path.join(process.cwd(), 'backups');

  if (!fs.existsSync(backupDir)) {
    console.log('📁 No backups found');
    return;
  }

  const backups = fs.readdirSync(backupDir)
    .filter(dir => fs.statSync(path.join(backupDir, dir)).isDirectory())
    .sort()
    .reverse();

  if (backups.length === 0) {
    console.log('📁 No backups found');
    return;
  }

  console.log('📁 Available backups:');
  backups.forEach((backup, index) => {
    const metadataPath = path.join(backupDir, backup, 'backup-info.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      const totalRecords = Object.values(metadata.recordCounts).reduce((a, b) => a + b, 0);
      console.log(`${index + 1}. ${backup} - ${totalRecords} records`);
    } else {
      console.log(`${index + 1}. ${backup} - (metadata missing)`);
    }
  });
}

// CLI interface
const command = process.argv[2];
const backupPath = process.argv[3];

if (command === 'list') {
  listBackups();
} else if (command === 'restore' && backupPath) {
  restoreData(backupPath)
    .then(() => {
      console.log('✅ Restore script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Restore script failed:', error);
      process.exit(1);
    });
} else {
  console.log('📋 Database Backup/Restore Tool');
  console.log('');
  console.log('Usage:');
  console.log('  node prisma/backup.js              # Create new backup');
  console.log('  node prisma/restore.js list        # List available backups');
  console.log('  node prisma/restore.js restore <path>  # Restore from backup');
  console.log('');
  console.log('Examples:');
  console.log('  node prisma/backup.js');
  console.log('  node prisma/restore.js list');
  console.log('  node prisma/restore.js restore backups/2024-01-15T10-30-00-000Z');
  process.exit(1);
}

export default restoreData;