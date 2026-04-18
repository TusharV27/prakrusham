import 'dotenv/config';
import prisma from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';

const BACKUP_DIR = 'backups';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

async function backupData() {
  console.log('🚀 Starting database backup...');

  // Create backup directory
  const backupPath = path.join(process.cwd(), BACKUP_DIR, TIMESTAMP);
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }

  const backupInfo = {
    timestamp: new Date().toISOString(),
    tables: [],
    recordCounts: {},
  };

  try {
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
      console.log(`📦 Backing up ${table}...`);

      try {
        // model name in client follows camelCase (lower first letter)
        const modelName = table.charAt(0).toLowerCase() + table.slice(1);
        
        if (!prisma[modelName]) {
          console.warn(`⚠️  Model ${modelName} not found in Prisma client`);
          continue;
        }

        // Get all records for this table
        const records = await prisma[modelName].findMany({
          include: getIncludeForTable(table),
        });

        // Save to JSON file
        const filePath = path.join(backupPath, `${table.toLowerCase()}.json`);
        fs.writeFileSync(filePath, JSON.stringify(records, null, 2));

        backupInfo.tables.push(table);
        backupInfo.recordCounts[table] = records.length;

        console.log(`✅ ${table}: ${records.length} records backed up`);
      } catch (error) {
        console.warn(`⚠️  Failed to backup ${table}:`, error.message);
        // Continue with other tables
      }
    }

    // Save backup metadata
    const metadataPath = path.join(backupPath, 'backup-info.json');
    fs.writeFileSync(metadataPath, JSON.stringify(backupInfo, null, 2));

    console.log('🎉 Backup completed successfully!');
    console.log(`📁 Backup saved to: ${backupPath}`);
    console.log(`📊 Total records backed up: ${Object.values(backupInfo.recordCounts).reduce((a, b) => a + b, 0)}`);

    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to get include objects for related data
function getIncludeForTable(table) {
  const includes = {
    User: {
      customer: true,
      farmer: true,
    },
    Customer: {
      user: true,
      addresses: true,
      orders: true,
    },
    Address: {
      customer: true,
    },
    Farmer: {
      user: true,
      products: true,
      images: true,
      reviews: {
        include: {
          author: true,
          product: true,
        },
      },
    },
    Vendor: {
      products: true,
      images: true,
      reviews: {
        include: {
          author: true,
          product: true,
        },
      },
    },
    Category: {
      products: true,
    },
    Product: {
      category: true,
      vendor: true,
      farmer: {
        include: {
          user: true,
        },
      },
      images: true,
      variants: true,
      inventoryItems: {
        include: {
          warehouse: true,
        },
      },
      offers: true,
      reviews: {
        include: {
          author: true,
        },
      },
    },
    ProductVariant: {
      product: true,
      inventoryItems: true,
    },
    Image: {
      product: true,
      farmer: true,
      vendor: true,
      warehouse: true,
      event: true,
    },
    Warehouse: {
      images: true,
      inventoryItems: {
        include: {
          product: true,
        },
      },
    },
    InventoryItem: {
      product: true,
      warehouse: true,
    },
    Offer: {
      products: true,
    },
    Review: {
      author: true,
      product: true,
      farmer: true,
      vendor: true,
    },
    Order: {
      customer: {
        include: {
          user: true,
        },
      },
    },
    ShippingProfile: {
      zones: {
        include: {
          rates: true,
        },
      },
    },
    ShippingZone: {
      rates: true,
    },
    MetaobjectDefinition: {
      fields: true,
    },
    Metaobject: {
      definition: true,
    },
    Article: {
      author: true,
      blog: true,
      metafields: true,
    },
    Blog: {
      articles: true,
      metafields: true,
    },
    Page: {
      metafields: true,
    },
    Customer: {
      user: true,
      addresses: true,
      orders: true,
      customerMetafields: true,
    },
    Order: {
      customer: {
        include: {
          user: true,
        },
      },
      metafields: true,
    },
    ProductVariant: {
      product: true,
      inventoryItems: true,
      metafields: true,
    },
    Farmer: {
      user: true,
      products: true,
      images: true,
      metafields: true,
      reviews: {
        include: {
          author: true,
          product: true,
        },
      },
    },
    Vendor: {
      products: true,
      images: true,
      metafields: true,
      reviews: {
        include: {
          author: true,
          product: true,
        },
      },
    },
  };

  return includes[table] || {};
}

// Run backup if called directly
const currentFilePath = new URL(import.meta.url).pathname;
const normalizedCurrentPath = process.platform === 'win32' ? currentFilePath.substring(1).replace(/\//g, '\\') : currentFilePath;
const normalizedArgPath = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (normalizedArgPath === path.resolve(normalizedCurrentPath)) {

  backupData()
    .then(() => {
      console.log('✅ Backup script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Backup script failed:', error);
      process.exit(1);
    });
}

export default backupData;