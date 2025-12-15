# Database Documentation

Complete guide to the TeamOrbit database - architecture, operations, and migrations.

## 🗄️ Database Overview

TeamOrbit uses **PostgreSQL** with a multi-schema architecture for tenant isolation.

### Database Structure

```
PostgreSQL Database: teamorbit
├── main                    # Global system data
│   ├── user           # User accounts
│   ├── lookup_type        # Reference data categories
│   ├── lookup             # Reference data values
│   ├── tenant             # Tenant organizations
│   └── user_role_xref     # User-role relationships
├── tenant_1               # Tenant 1's data
│   ├── chat_channel
│   ├── chat_message
│   └── chat_channel_user_xref
└── tenant_2               # Tenant 2's data
    └── ...
```

## 🚀 Quick Start

### Running Migrations

```bash
# Run all migrations
npm run migrate

# Migrations are automatically applied to:
# 1. Main schema (global data)
# 2. Tenant schemaAndTypes (tenant-specific data)
```

### Seeding Database

```bash
# Populate with initial data
npm run seed

# This creates:
# - User roles (PLATFORM_SUPER_ADMIN, PLATFORM_ADMIN, etc.)
# - User statuses (PENDING, ACTIVE, etc.)
# - Tenant statuses (ACTIVE, INACTIVE, etc.)
# - Chat types (DIRECT, GROUP, etc.)
```

## 📊 Main Schema Tables

### user

Stores user accounts and profiles.

**Key Fields:**

- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `firstName`, `lastName` - User name
- `title`, `gender`, `bloodGroup`, `marriedStatus` - Profile data
- `is_active` - Soft delete flag
- `created_at`, `updated_at` - Timestamps

### tenant

Stores tenant organizations.

**Key Fields:**

- `id` - Primary key
- `name` - Tenant name
- `email`, `phone` - Contact info
- `address`, `website` - Additional details
- `status` - Tenant status (ACTIVE, INACTIVE, SUSPENDED)
- `created_at`, `updated_at` - Timestamps

### lookup_type & lookup

Reference data system for dropdowns and enums.

**Lookup Types:**

- `USER_ROLE` - System roles
- `USER_STATUS` - User statuses
- `TENANT_STATUS` - Tenant statuses
- `CHAT_TYPE` - Chat channel types

## 📊 Tenant Schema Tables

### chat_channel

Chat channels for direct and group conversations.

**Key Fields:**

- `id` - Primary key
- `name` - Channel name
- `type` - Channel type (DIRECT, GROUP, BROADCAST)
- `created_by` - User ID (references main.user)
- `created_at`, `updated_at` - Timestamps

### chat_message

Messages within chat channels.

**Key Fields:**

- `id` - Primary key
- `channel_id` - References chat_channel
- `sender_id` - User ID (references main.user)
- `message` - Message content
- `message_type` - Type (TEXT, IMAGE, FILE)
- `created_at` - Timestamp

## 🔍 Common Queries

### Get User with Roles

```sql
SELECT
  u.*,
  JSON_AGG(JSON_BUILD_OBJECT(
    'id', r.id,
    'name', r.name,
    'label', r.label
  )) AS roles
FROM user u
LEFT JOIN user_role_xref urx ON u.id = urx."userId"
LEFT JOIN lookup r ON urx."roleId" = r.id
WHERE u.id = 1
GROUP BY u.id;
```

### Get All Lookup Data

```sql
SELECT
  lt.id,
  lt.key,
  lt.name,
  JSON_AGG(JSON_BUILD_OBJECT(
    'id', l.id,
    'key', l.key,
    'name', l.name,
    'label', l.label
  ) ORDER BY l.sort_order) AS lookups
FROM lookup_type lt
LEFT JOIN lookup l ON lt.id = l."lookupTypeId"
GROUP BY lt.id
ORDER BY lt.key;
```

---

## 🔄 Database Migrations

### Migration System Overview

The TeamOrbit backend uses a custom migration system that supports:

- **Multi-schema migrations** (main and tenant schemaAndTypes)
- **Mixed migration types** (SQL and TypeScript)
- **Version control** with comprehensive tracking
- **Rollback support** for safe deployments

### Migration Structure

```
src/database/migrations/
├── main/                           # Main schema migrations
│   ├── 001-main-create-tables.do.sql
│   └── 002-main-initial-lookup-data.ts
└── tenant/                         # Tenant schema migrations
    └── 001-tenant-create-tables.do.sql
```

### Migration Entry Point

The migration system is managed by `src/database/dbMigrate.ts`:

```typescript
import { DbMigrationManager } from "./dbMigrationManager";

async function runMigrations() {
  const migrationManager = new DbMigrationManager();

  try {
    // Run main schema migrations
    await migrationManager.runMigrationForSchema("main");

    // Run tenant schema migrations
    await migrationManager.runMigrationForSchema("tenant");

    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}
```

## 📝 Creating Migrations

### 1. SQL Migrations

Create SQL migration files for schema changes:

```sql
-- src/database/migrations/main/003-add-user-profile-fields.do.sql
-- Add new fields to user profile table

ALTER TABLE user
ADD COLUMN phone VARCHAR(20),
ADD COLUMN address TEXT,
ADD COLUMN date_of_birth DATE;

-- Create index for phone number
CREATE INDEX idx_user_phone ON user(phone);

-- Add comment
COMMENT ON COLUMN user.phone IS 'User phone number';
COMMENT ON COLUMN user.address IS 'User address';
COMMENT ON COLUMN user.date_of_birth IS 'User date of birth';
```

**SQL Migration Guidelines:**

- Use descriptive filenames with sequence numbers
- Include comments explaining the changes
- Use transactions for multiple operations
- Always include rollback instructions in comments

### 2. TypeScript Migrations

Create TypeScript migrations for complex operations or data manipulation:

```typescript
// src/database/migrations/main/004-update-user-roles.ts
import { Pool } from "pg";
import logger from "../../utils/logger";

export async function up(pool: Pool): Promise<void> {
  try {
    logger.info("Starting user role migration...");

    // Update existing users with default roles
    await pool.query(`
      INSERT INTO user_role_xref ("userId", "roleId")
      SELECT u.id, r.id
      FROM user u
      CROSS JOIN lookup r
      WHERE r.key = 'PLATFORM_USER'
      AND NOT EXISTS (
        SELECT 1 FROM user_role_xref urx 
        WHERE urx."userId" = u.id
      )
    `);

    logger.info("User role migration completed");
  } catch (error) {
    logger.error("User role migration failed:", error);
    throw error;
  }
}

export async function down(pool: Pool): Promise<void> {
  try {
    logger.info("Rolling back user role migration...");

    // Remove the default roles that were added
    await pool.query(`
      DELETE FROM user_role_xref
      WHERE "roleId" IN (
        SELECT id FROM lookup WHERE key = 'PLATFORM_USER'
      )
    `);

    logger.info("User role migration rollback completed");
  } catch (error) {
    logger.error("User role migration rollback failed:", error);
    throw error;
  }
}
```

**TypeScript Migration Guidelines:**

- Export `up` and `down` functions
- Use proper error handling and logging
- Include rollback logic in the `down` function
- Use parameterized queries to prevent SQL injection

## 🏗️ Migration Examples

### Example 1: Adding New Table

```sql
-- src/database/migrations/main/005-create-notifications-table.do.sql
CREATE TABLE notification (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES user(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_notification_user_id ON notification(user_id);
CREATE INDEX idx_notification_is_read ON notification(is_read);
CREATE INDEX idx_notification_created_at ON notification(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_updated_at
  BEFORE UPDATE ON notification
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Example 2: Data Migration

```typescript
// src/database/migrations/main/006-migrate-user-preferences.ts
import { Pool } from "pg";
import logger from "../../utils/logger";

export async function up(pool: Pool): Promise<void> {
  try {
    logger.info("Starting user preferences migration...");

    // Create preferences table
    await pool.query(`
      CREATE TABLE user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES user(id),
        theme VARCHAR(20) DEFAULT 'light',
        language VARCHAR(10) DEFAULT 'en',
        notifications_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrate existing user data
    await pool.query(`
      INSERT INTO user_preferences (user_id, theme, language, notifications_enabled)
      SELECT 
        id as user_id,
        'light' as theme,
        'en' as language,
        TRUE as notifications_enabled
      FROM user
      WHERE is_active = TRUE
    `);

    logger.info("User preferences migration completed");
  } catch (error) {
    logger.error("User preferences migration failed:", error);
    throw error;
  }
}

export async function down(pool: Pool): Promise<void> {
  try {
    logger.info("Rolling back user preferences migration...");

    await pool.query("DROP TABLE IF EXISTS user_preferences CASCADE");

    logger.info("User preferences migration rollback completed");
  } catch (error) {
    logger.error("User preferences migration rollback failed:", error);
    throw error;
  }
}
```

### Example 3: Tenant Schema Migration

```sql
-- src/database/migrations/tenant/002-add-chat-attachments.do.sql
-- Add file attachments to chat messages

ALTER TABLE chat_message
ADD COLUMN attachment_url VARCHAR(500),
ADD COLUMN attachment_type VARCHAR(50),
ADD COLUMN attachment_size INTEGER;

-- Create index for attachment queries
CREATE INDEX idx_chat_message_attachment ON chat_message(attachment_url)
WHERE attachment_url IS NOT NULL;

-- Add constraints
ALTER TABLE chat_message
ADD CONSTRAINT chk_attachment_size
CHECK (attachment_size IS NULL OR attachment_size > 0);
```

## 🔄 Migration Workflow

### Development Workflow

1. **Create Migration File**

   ```bash
   # Create new migration file
   touch src/database/migrations/main/007-your-migration-name.sql
   ```

2. **Write Migration Code**

   ```sql
   -- Add your SQL or TypeScript code
   ```

3. **Test Migration Locally**

   ```bash
   # Run migration
   npm run migrate

   # Verify schema changes
   psql -d teamorbit -c "\d user"
   ```

### Production Deployment

1. **Backup Database**

   ```bash
   pg_dump -h localhost -U teamorbit -d teamorbit > backup_before_migration.sql
   ```

2. **Deploy Migration**

   ```bash
   npm run migrate
   ```

3. **Verify Migration**

   ```bash
   # Check application health
   curl http://localhost:5100/health

   # Verify schema changes
   psql -h localhost -U teamorbit -d teamorbit -c "\d user"
   ```

4. **Monitor Application**
   ```bash
   # Check logs for any issues
   tail -f logs/application.log
   ```

## 🚨 Migration Best Practices

### 1. Idempotent Migrations

```sql
-- Good: Check if column exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user' AND column_name = 'phone'
  ) THEN
    ALTER TABLE user ADD COLUMN phone VARCHAR(20);
  END IF;
END $$;
```

### 2. Backward Compatible Changes

```sql
-- Good: Add nullable column first
ALTER TABLE user ADD COLUMN new_field VARCHAR(100);

-- Later migration: Populate data
UPDATE user SET new_field = 'default_value' WHERE new_field IS NULL;

-- Final migration: Make NOT NULL
ALTER TABLE user ALTER COLUMN new_field SET NOT NULL;
```

### 3. Proper Indexing

```sql
-- Create indexes after data migration
CREATE INDEX CONCURRENTLY idx_large_table_new_column
ON large_table(new_column);
```

### 4. Use Transactions

```sql
BEGIN;

-- Multiple operations
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
UPDATE users SET email_verified = TRUE WHERE email_confirmed_at IS NOT NULL;

COMMIT;
```

## 🔒 Security

### Connection Management

- **Main Pool**: Global connection for main schema
- **Tenant Pools**: Isolated connections per tenant
- **Automatic Injection**: Middleware provides pools to controllers

### Data Isolation

- **Schema Separation**: Each tenant has isolated schema
- **Cross-Schema References**: Users in main, data in tenant schemaAndTypes
- **No Direct Access**: All queries through connection pools

## 🔧 Configuration

Environment variables for database:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=teamorbit
DB_USER=postgres
DB_PASSWORD=your_password
```

## 🧪 Testing

### Test Database Setup

```bash
# Create test database
createdb teamorbit_test

# Run migrations
DB_NAME=teamorbit_test npm run migrate

# Run seeds
DB_NAME=teamorbit_test npm run seed
```

### Testing Migrations

```bash
# Test migration
npm run migrate

# Test with different data
# ... manual testing ...

# If needed, rollback (implement down functions)
# Manual rollback by running SQL
```

## 🔍 Troubleshooting

### Common Issues

1. **Migration Already Applied**

   ```
   Error: Migration 001-main-create-tables already applied
   ```

   **Solution**: Check migration tracking table or remove duplicate migration

2. **Schema Not Found**

   ```
   Error: schema "tenant_123" does not exist
   ```

   **Solution**: Ensure tenant schema exists before running tenant migrations

3. **Permission Denied**
   ```
   Error: permission denied for table user
   ```
   **Solution**: Check database user permissions and grant necessary privileges

### Debugging Migrations

1. **Enable Verbose Logging**

   ```typescript
   // Add to migration
   logger.info("Starting migration step 1...");
   await pool.query("SELECT 1");
   logger.info("Migration step 1 completed");
   ```

2. **Test Individual SQL Statements**
   ```sql
   -- Test individual SQL statements
   SELECT * FROM information_schema.tables WHERE table_name = 'new_table';
   ```

---

**Related Documentation:**

- [Architecture](../architecture.md) - Database architecture overview
- [API Documentation](api.md) - API endpoints using the database
- [Services](services.md) - Database access patterns
