# Database Backup & Restore

This project includes automated scripts for backing up and restoring your database data.

## 📦 Backup Script (`prisma/backup.js`)

Creates a complete backup of all database tables with their relationships.

### Usage

```bash
# Create a new backup
npm run backup
# or
node prisma/backup.js
```

### What it does:
- Exports all data from all tables to JSON files
- Preserves relationships and foreign keys
- Saves backups in `backups/YYYY-MM-DDTHH-MM-SS-SSSZ/` directory
- Creates metadata file with backup information

### Output Structure:
```
backups/
└── 2024-01-15T10-30-00-000Z/
    ├── backup-info.json
    ├── user.json
    ├── customer.json
    ├── product.json
    └── ... (all tables)
```

## 🔄 Restore Script (`prisma/restore.js`)

Restores data from a backup directory.

### Usage

```bash
# List available backups
npm run restore list
# or
node prisma/restore.js list

# Restore from specific backup
npm run restore restore backups/2024-01-15T10-30-00-000Z
# or
node prisma/restore.js restore backups/2024-01-15T10-30-00-000Z
```

### What it does:
- Reads backup files and restores data
- Handles foreign key relationships properly
- Uses upsert to avoid duplicates
- Preserves existing data (doesn't delete unless specified)

## 🛠️ Database Reset Workflow

When you need to reinitialize schemas while preserving data:

```bash
# 1. Backup current data
npm run backup

# 2. Reset database and apply new schema
npx prisma migrate reset --force

# 3. Seed with default data
npm run seed

# 4. Restore your backed up data (if needed)
npm run restore restore <backup-path>
```

### Automated Reset Script

```bash
# Backup, reset, and seed in one command
npm run db:reset
```

## 📋 Supported Tables

The scripts handle all tables in your schema:

- User, Customer, Address
- Farmer, Vendor, Category
- Product, Image, Warehouse
- InventoryItem, PincodeData
- Offer, Event, Review
- Order, OrderItem

## ⚠️ Important Notes

1. **Backup First**: Always backup before schema changes
2. **Foreign Keys**: Restore handles dependencies in correct order
3. **Duplicates**: Uses upsert to handle existing records
4. **Relationships**: Nested relations are handled appropriately
5. **Timestamps**: Created/updated timestamps are regenerated

## 🔧 Manual Usage

```bash
# Direct script execution
node prisma/backup.js
node prisma/restore.js list
node prisma/restore.js restore path/to/backup
```