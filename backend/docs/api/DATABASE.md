# Database Schema Documentation

Complete database schema and relationship documentation for the TeamOrbit backend.

## 🗄️ Database Overview

The TeamOrbit backend uses PostgreSQL as the primary database with the following characteristics:

- **Database Engine:** PostgreSQL 12+
- **Connection Pooling:** Advanced pg library with connection pooling
- **Migration System:** Multi-schema migration management with dbMigrationManager
- **Schema Support:** Separate main and tenant schemas for multi-tenancy
- **Migration Types:** Support for both SQL (.sql) and TypeScript (.ts) migrations
- **Seeding:** Comprehensive database seeding for development and testing

## 📊 Database Schema

### App User Table

Stores comprehensive user account information with enhanced profile data and authentication.

**Table Structure:**
- Primary user identification and authentication data
- Comprehensive profile information with ENUM constraints
- Tenant relationship for multi-tenancy support
- Status tracking with predefined user states
- Audit timestamps for creation and modification tracking

**Key Features:**
- Enhanced profile fields including title, middle name, maiden name
- Demographic information (gender, date of birth, blood group, marital status)
- Biography field for user descriptions
- ENUM types for data consistency and validation
- Unique constraints on email and phone for account security
- Foreign key relationship to tenant table
- Flexible user status system using ENUM values

**Column Details:**

- `id` - Primary key, auto-incrementing integer
- `title` - User title using title_enum (Mr, Mrs, Ms)
- `firstName` - User's first name (camelCase for consistency)
- `lastName` - User's last name (camelCase for consistency)
- `middleName` - Optional middle name
- `maidenName` - Optional maiden name for married users
- `gender` - Gender using gender_enum (Male, Female, Other)
- `dob` - Date of birth
- `bloodGroup` - Blood group using blood_group_enum (A+, A-, B+, B-, AB+, AB-, O+, O-)
- `marriedStatus` - Marital status using married_status_enum (Single, Married, Divorced, Widowed)
- `email` - Unique email address for authentication
- `phone` - Unique phone number
- `password` - Hashed password for authentication
- `bio` - User biography or description text
- `userStatus` - User status using user_status_enum (Pending, Active, Archived, Suspended)
- `tenantId` - Foreign key reference to tenant table for multi-tenancy
- `createdAt` - Account creation timestamp
- `updatedAt` - Last modification timestamp

### Chat Messages Table

Stores chat messages between users.

```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  media_url VARCHAR(500),
  message_type VARCHAR(50) DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**

- `id` - Primary key, auto-incrementing
- `sender_id` - Foreign key to app_user table
- `receiver_id` - Foreign key to app_user table
- `message` - Message content
- `media_url` - URL to attached media file
- `message_type` - Type of message (text, image, file)
- `is_read` - Read status flag
- `created_at` - Message creation timestamp

### Chat Channels Table

Stores chat channel information for group chats.

```sql
CREATE TABLE chat_channels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**

- `id` - Primary key, auto-incrementing
- `name` - Channel name
- `description` - Channel description
- `created_by` - Foreign key to app_user table
- `is_private` - Privacy flag
- `created_at` - Channel creation timestamp
- `updated_at` - Last update timestamp

### Channel Participants Table

Junction table for many-to-many relationship between users and chat channels.

```sql
CREATE TABLE channel_participants (
  id SERIAL PRIMARY KEY,
  channel_id INTEGER NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);
```

**Columns:**

- `id` - Primary key, auto-incrementing
- `channel_id` - Foreign key to chat_channels table
- `user_id` - Foreign key to users table
- `joined_at` - When user joined the channel
- `UNIQUE(channel_id, user_id)` - Prevents duplicate participants

## 🔗 Relationships

### One-to-Many Relationships

#### Users → Chat Messages

- One user can send many messages
- One user can receive many messages
- Foreign keys: `sender_id`, `receiver_id`

#### Users → Chat Channels

- One user can create many channels
- Foreign key: `created_by`

### Many-to-Many Relationships

#### Users ↔ Chat Channels (via Channel Participants)

- One user can be in many channels
- One channel can have many users
- Junction table: `channel_participants`

#### Users ↔ Roles (via User Role Cross-Reference)

- One user can have multiple roles
- One role can be assigned to multiple users
- Junction table: `user_role_xref`
- Role definitions stored in `lookup` table with specific lookup types
- Enables flexible permission and access control systems

**Role System Architecture:**
- Roles are defined as lookup entries with role-specific lookup types
- User-role assignments tracked through cross-reference table
- Supports dynamic role assignment and removal
- Query optimization through JSON aggregation for role data retrieval
- Enables conditional role inclusion in user data responses

## 📈 Indexes

### Primary Indexes

- `users.id` - Primary key
- `chat_messages.id` - Primary key
- `chat_channels.id` - Primary key
- `channel_participants.id` - Primary key

### Unique Indexes

- `users.email` - Unique email constraint
- `channel_participants(channel_id, user_id)` - Unique participant constraint

### Performance Indexes

```sql
-- Chat messages performance indexes
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_receiver_id ON chat_messages(receiver_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Channel participants indexes
CREATE INDEX idx_channel_participants_channel_id ON channel_participants(channel_id);
CREATE INDEX idx_channel_participants_user_id ON channel_participants(user_id);

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

## 🔄 Database Migrations

### Migration System

The project uses a custom migration system built with TypeScript and Umzug.

### Migration Files

Located in `src/database/migrations/`:

```
migrations/
├── 001_create_users.ts
├── 002_create_chat_messages.ts
├── 003_create_chat_channels.ts
└── 004_create_channel_participants.ts
```

### Running Migrations

```bash
# Run all pending migrations
npm run migrate

# Run specific migration
npx ts-node src/database/migrate.ts --migration 001_create_users

# Rollback last migration
npx ts-node src/database/migrate.ts --rollback
```

### Migration Example

```typescript
// src/database/migrations/001_create_users.ts
import { Migration } from '../migrate';

export const up = async (migration: Migration) => {
  await migration.createTable('users', {
    id: 'SERIAL PRIMARY KEY',
    email: 'VARCHAR(255) UNIQUE NOT NULL',
    password: 'VARCHAR(255) NOT NULL',
    first_name: 'VARCHAR(100)',
    last_name: 'VARCHAR(100)',
    role: "VARCHAR(50) DEFAULT 'user'",
    is_active: 'BOOLEAN DEFAULT true',
    last_login: 'TIMESTAMP',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()',
  });
};

export const down = async (migration: Migration) => {
  await migration.dropTable('users');
};
```

## 🌱 Database Seeding

### Seed Data

Located in `src/database/seed/`:

```
seed/
├── seed.ts
├── users.seed.ts
├── chat_channels.seed.ts
└── chat_messages.seed.ts
```

### Running Seeds

```bash
# Run all seed files
npm run seed

# Run specific seed file
npx ts-node src/database/seed/users.seed.ts
```

### Seed Example

```typescript
// src/database/seed/users.seed.ts
import { db } from '../db';
import bcrypt from 'bcryptjs';

export const seedUsers = async () => {
  const users = [
    {
      email: 'admin@teamorbit.com',
      password: await bcrypt.hash('admin123', 10),
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
    },
    {
      email: 'user@teamorbit.com',
      password: await bcrypt.hash('user123', 10),
      first_name: 'Regular',
      last_name: 'User',
      role: 'user',
    },
  ];

  for (const user of users) {
    await db.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
      [user.email, user.password, user.first_name, user.last_name, user.role]
    );
  }
};
```

## 🔧 Database Configuration

### Connection Pool

```typescript
// src/database/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'teamorbit',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

export { pool as db };
```

### Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=teamorbit
DB_USER=postgres
DB_PASSWORD=your_password

# Connection Pool
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
```

## 📊 Query Examples

### Common Queries

#### Get User with Messages

```sql
SELECT
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  COUNT(cm.id) as message_count
FROM users u
LEFT JOIN chat_messages cm ON u.id = cm.sender_id
WHERE u.is_active = true
GROUP BY u.id, u.email, u.first_name, u.last_name
ORDER BY message_count DESC;
```

#### Get Recent Messages

```sql
SELECT
  cm.id,
  cm.message,
  cm.created_at,
  sender.first_name as sender_name,
  receiver.first_name as receiver_name
FROM chat_messages cm
JOIN users sender ON cm.sender_id = sender.id
JOIN users receiver ON cm.receiver_id = receiver.id
WHERE cm.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY cm.created_at DESC
LIMIT 50;
```

#### Get User's Chat Channels

```sql
SELECT
  cr.id,
  cr.name,
  cr.description,
  cr.created_at,
  COUNT(rp.user_id) as participant_count
FROM chat_channels cr
JOIN channel_participants rp ON cr.id = rp.channel_id
WHERE rp.user_id = $1
GROUP BY cr.id, cr.name, cr.description, cr.created_at
ORDER BY cr.created_at DESC;
```

## 🔒 Security Considerations

### Data Protection

- Passwords are hashed using bcrypt with salt rounds
- Sensitive data is not logged
- Database connections use SSL in production
- Input validation prevents SQL injection

### Access Control

- Row-level security can be implemented
- Database users have minimal required permissions
- Connection pooling prevents connection exhaustion
- Regular security updates for PostgreSQL

## 📈 Performance Optimization

### Query Optimization

- Use appropriate indexes for frequently queried columns
- Implement pagination for large result sets
- Use connection pooling to manage database connections
- Monitor slow queries and optimize them

### Monitoring

- Track database performance metrics
- Monitor connection pool usage
- Set up alerts for database issues
- Regular database maintenance and cleanup

## 🧪 Testing

### Test Database

```bash
# Create test database
createdb teamorbit_test

# Run migrations on test database
NODE_ENV=test npm run migrate

# Run tests
npm test
```

### Test Data

- Use separate test database
- Seed test data for each test
- Clean up test data after tests
- Use transactions for test isolation

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pg Library Documentation](https://node-postgres.com/)
- [Database Migration Best Practices](https://www.prisma.io/dataguide/types/relational/what-are-database-migrations)
- [SQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
