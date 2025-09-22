# Backend Schema Migration Guide

## Overview

This document outlines the database schema changes and backend service updates made to support the new lookup-based role and status management system.

## Database Schema Changes

### 1. New Lookup Tables

#### `lookup_type` Table
```sql
CREATE TABLE lookup_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,        -- e.g., 'USER_ROLE', 'USER_STATUS'
    label VARCHAR(255) NOT NULL,              -- e.g., 'User Role', 'User Status'
    "isSystem" BOOLEAN NOT NULL,              -- System values that cannot be deleted
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    -- ... audit fields
);
```

#### `lookup` Table
```sql
CREATE TABLE lookup (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,        -- e.g., 'USER_ROLE_PLATFORM_ADMIN'
    label VARCHAR(255) NOT NULL,              -- e.g., 'Platform Admin'
    "isSystem" BOOLEAN,                       -- System values that cannot be deleted
    "sortOrder" INT DEFAULT 0,                -- For ordering items within a type
    "lookupTypeId" INT NOT NULL,              -- Foreign key to lookup_type
    -- ... audit fields
    CONSTRAINT fk_lookup_lookup_type FOREIGN KEY ("lookupTypeId") REFERENCES lookup_type (id)
);
```

### 2. Updated User Table

#### Before
```sql
CREATE TABLE app_user (
    -- ... other fields
    userStatus VARCHAR(50),  -- String status
    -- ... 
);
```

#### After
```sql
CREATE TABLE app_user (
    -- ... other fields
    "statusId" INT NOT NULL,  -- Foreign key to lookup table
    CONSTRAINT fk_user_user_status FOREIGN KEY ("statusId") REFERENCES lookup (id)
);
```

### 3. User Role Relationship

#### Before
```sql
-- Roles stored as simple strings or separate role table
```

#### After
```sql
CREATE TABLE user_role_xref (
    id SERIAL PRIMARY KEY,
    "userId" INT NOT NULL,
    "roleId" INT NOT NULL,    -- References lookup table
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_user_role_xref_user FOREIGN KEY ("userId") REFERENCES app_user (id),
    CONSTRAINT fk_user_role_xref_role FOREIGN KEY ("roleId") REFERENCES lookup (id)
);
```

## Service Layer Changes

### 1. Lookup Service Updates

#### New Methods
```typescript
// Get lookup data by name (instead of label)
static async getLookupDataByName(lookupName: string): Promise<Lookup>

// Updated queries to include name field
SELECT l.id, l.name, l.label, l."lookupTypeId", lt.name as typeName
FROM lookup_type lt
INNER JOIN lookup l ON lt.id = l."lookupTypeId"
WHERE l.name = $1;
```

#### Updated Constants
```typescript
// Before
export const lookupTypeKeys = {
  userRole: 'userRole',
  userStatus: 'userStatus',
};

// After  
export const lookupTypeKeys = {
  USER_ROLE: 'USER_ROLE',
  USER_STATUS: 'USER_STATUS',
  TENANT_STATUS: 'TENANT_STATUS',
  CHAT_TYPE: 'CHAT_TYPE',
};
```

### 2. User Service Updates

#### Schema Changes
```typescript
interface UserProfile {
  // ... other fields
  statusId: number;  // Changed from userStatus: string
  userRoles?: Array<{
    id: number;
    name: string;      // Added name field
    label: string;
    lookupTypeId: number;
  }>;
}
```

#### Query Updates
```typescript
// Before
SELECT up."userStatus", ...

// After  
SELECT up."statusId", ...

// Role queries now include name field
JSON_BUILD_OBJECT(
  'id', l.id,
  'name', l.name,        // Added
  'label', l.label,
  'lookupTypeId', l."lookupTypeId"
)
```

### 3. Migration Data

#### Initial Lookup Types
```typescript
const lookupData = [
  {
    name: 'USER_ROLE',
    label: 'User Role', 
    isSystem: true,
    lookups: [
      { name: 'USER_ROLE_PLATFORM_SUPER_ADMIN', label: 'Platform Super Admin', isSystem: true },
      { name: 'USER_ROLE_PLATFORM_ADMIN', label: 'Platform Admin', isSystem: true },
      // ... other roles
    ]
  },
  {
    name: 'USER_STATUS',
    label: 'User Status',
    isSystem: true, 
    lookups: [
      { name: 'USER_STATUS_PENDING', label: 'Pending', isSystem: true },
      { name: 'USER_STATUS_ACTIVE', label: 'Active', isSystem: true },
      // ... other statuses
    ]
  }
];
```

## API Changes

### 1. User Endpoints

#### Response Format Changes
```typescript
// Before
{
  id: 123,
  firstName: "John",
  lastName: "Doe", 
  userStatus: "active",
  userRoles: ["admin", "user"]
}

// After
{
  id: 123,
  firstName: "John",
  lastName: "Doe",
  statusId: 5,  // References lookup table
  userRoles: [
    {
      id: 1,
      name: "USER_ROLE_PLATFORM_ADMIN",
      label: "Platform Admin", 
      lookupTypeId: 1
    }
  ]
}
```

### 2. Lookup Endpoints

#### New Endpoints
- `GET /api/lookups` - Get all lookup types with their values
- `GET /api/lookups/:typeId` - Get specific lookup type values

## Security Improvements

### 1. SQL Injection Prevention
```typescript
// Before (vulnerable)
const query = `SELECT * FROM users WHERE status = '${status}'`;

// After (parameterized)
const query = `SELECT * FROM users WHERE "statusId" = $1`;
const result = await client.query(query, [statusId]);
```

### 2. Role Validation
```typescript
// Roles are now validated against lookup table
const validRoles = await Lookup.getUserRoleIds();
if (!validRoles.includes(roleId)) {
  throw new Error('Invalid role');
}
```

## Migration Steps

### 1. Database Migration
1. Run `001-main-create-tables.do.sql` to create new schema
2. Run `002-main-initial-lookup-data.ts` to populate lookup data

### 2. Service Updates
1. Update all service methods to use `statusId` instead of status strings
2. Update queries to use parameterized statements
3. Add `name` field to all lookup-related responses

### 3. Testing
1. Verify all migrations run successfully
2. Test user creation with new role/status system
3. Validate API responses match new schema
4. Test role-based authorization

## Benefits

1. **Data Integrity**: Foreign key constraints ensure valid roles/statuses
2. **Performance**: Integer lookups faster than string comparisons  
3. **Maintainability**: Centralized role/status management
4. **Security**: Parameterized queries prevent SQL injection
5. **Scalability**: Easy to add new roles/statuses without code changes

## Related Files

- `backend/src/database/migrations/` - Database migration files
- `backend/src/services/lookup.service.ts` - Lookup service implementation
- `backend/src/services/user.service.ts` - Updated user service
- `backend/src/utils/constants.ts` - Updated constants
- `backend/src/schemas/` - Updated schema definitions
