# Schema Migration Guide

## Overview

This document outlines the recent schema changes made to align the frontend with the updated database structure and backend API.

## Key Changes

### 1. Constants Structure Update

#### Before
```typescript
export const roleKeys = {
  platformSuperAdmin: 'USER_ROLE_PLATFORM_SUPER_ADMIN',
  platformAdmin: 'USER_ROLE_PLATFORM_ADMIN',
  // ... other roles
};
```

#### After
```typescript
export const lookupTypeKeys = {
  USER_ROLE: 'USER_ROLE',
  USER_STATUS: 'USER_STATUS',
  TENANT_STATUS: 'TENANT_STATUS',
  CHAT_TYPE: 'CHAT_TYPE',
};

export const userRoleKeys = {
  ANY: 'ANY',
  USER_ROLE_PLATFORM_SUPER_ADMIN: 'USER_ROLE_PLATFORM_SUPER_ADMIN',
  USER_ROLE_PLATFORM_ADMIN: 'USER_ROLE_PLATFORM_ADMIN',
  USER_ROLE_PLATFORM_USER: 'USER_ROLE_PLATFORM_USER',
  USER_ROLE_TENANT_ADMIN: 'USER_ROLE_TENANT_ADMIN',
  USER_ROLE_TENANT_MANAGER: 'USER_ROLE_TENANT_MANAGER',
  USER_ROLE_TENANT_USER: 'USER_ROLE_TENANT_USER',
};

export const userStatusKeys = {
  USER_STATUS_PENDING: 'USER_STATUS_PENDING',
  USER_STATUS_ACTIVE: 'USER_STATUS_ACTIVE',
  USER_STATUS_DEACTIVATED: 'USER_STATUS_DEACTIVATED',
  USER_STATUS_ARCHIVED: 'USER_STATUS_ARCHIVED',
};
```

### 2. User Schema Changes

#### Before
```typescript
export const userSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  // ... other fields
  userStatus: z.string(), // String status
  userRoles: z.array(z.string()), // Array of role strings
});
```

#### After
```typescript
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  role: userRoleSchema, // Single role from enum
  created_at: z.string(),
  updated_at: z.string(),
});
```

### 3. Role-Based Access Control

#### Before
```typescript
// Using simple string roles
const allowedRoles = ['ADMIN', 'USER'];
```

#### After
```typescript
// Using structured role constants
const allowedRoles = [
  userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
  userRoleKeys.USER_ROLE_TENANT_USER
];
```

## Migration Steps

### For Developers

1. **Update Imports**
   ```typescript
   // Before
   import { roleKeys } from '@/utils/constants';
   
   // After
   import { userRoleKeys } from '@/utils/constants';
   ```

2. **Update Role References**
   ```typescript
   // Before
   authRoles: [roleKeys.platformAdmin]
   
   // After
   authRoles: [userRoleKeys.USER_ROLE_PLATFORM_ADMIN]
   ```

3. **Update User Type Usage**
   ```typescript
   // Before
   const user: User = {
     id: 123,
     firstName: 'John',
     lastName: 'Doe',
     userStatus: 'active',
   };
   
   // After
   const user: User = {
     id: '123',
     first_name: 'John',
     last_name: 'Doe',
     role: userRoleKeys.USER_ROLE_TENANT_USER,
   };
   ```

## Database Alignment

### Backend Changes
- User roles are now stored as lookup references with IDs
- Status fields use `statusId` instead of string values
- Lookup tables provide centralized role and status management

### Frontend Adaptations
- Constants now match backend lookup structure
- User schema aligns with API response format
- Role checking uses consistent naming convention

## Benefits

1. **Consistency**: Frontend and backend use identical role/status identifiers
2. **Type Safety**: Stronger typing with enum-based role definitions
3. **Maintainability**: Centralized lookup management
4. **Scalability**: Easy to add new roles and statuses through database

## Testing

After implementing these changes:

1. Verify role-based route access works correctly
2. Test user authentication and authorization flows  
3. Confirm API requests use correct field names
4. Validate form submissions with new schema structure

## Related Files

- `frontend/src/utils/constants.ts` - Updated constants
- `frontend/src/schemas/user.ts` - Updated user schema
- `frontend/src/components/AppRouter.tsx` - Route configuration
- `backend/src/utils/constants.ts` - Backend constants (reference)
- `backend/src/schemas/user.schema.ts` - Backend user schema (reference)
