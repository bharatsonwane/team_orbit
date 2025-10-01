# Services Documentation

Services contain business logic and data processing in the TeamOrbit backend. They follow a class-based pattern with static methods.

## 📁 Service Files

```
src/services/
├── user.service.ts         # User business logic
├── tenant.service.ts       # Tenant logic
├── lookup.service.ts       # Reference data logic
└── chat.service.ts         # Chat messaging logic
```

## 🎯 Service Pattern

Services in TeamOrbit use class-based static methods:

```typescript
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { HttpError } from '../utils/httpError';

export default class ExampleService {
  // Constructor is required but not used for static methods
  constructor(reqObj: any) {}

  static async methodName(data: any, mainPool: Pool): Promise<ReturnType> {
    try {
      // 1. Validate input
      if (!data) {
        throw new HttpError('Data is required', 400);
      }

      // 2. Perform business logic
      const result = await mainPool.query('SELECT * FROM table WHERE id = $1', [data.id]);

      // 3. Process and return data
      return result.rows[0];
    } catch (error) {
      // 4. Log and handle errors
      logger.error('Error in methodName:', error);
      throw error;
    }
  }
}
```

## 📚 Service Reference

### User Service (`user.service.ts`)

Handles user-related business logic and database operations.

#### Methods

**`getUserById(id: string, mainPool: Pool): Promise<User | null>`**
- Retrieves user by ID with roles
- Performs JSON aggregation for role data
- Returns null if user not found or inactive

```typescript
const user = await UserService.getUserById('1', req.mainPool);
```

**`createUserProfile(userData: any, mainPool: Pool): Promise<User>`**
- Creates new user account
- Hashes password with bcrypt (12 rounds)
- Assigns default role (PLATFORM_USER)
- Uses transactions for data integrity

```typescript
const newUser = await UserService.createUserProfile({
  email: 'user@example.com',
  password: 'password123',
  first_name: 'John',
  last_name: 'Doe'
}, req.mainPool);
```

**`updateUserProfile(userId: string, updateData: any, mainPool: Pool): Promise<User>`**
- Updates user profile fields
- Validates allowed fields
- Returns updated user data

```typescript
const updated = await UserService.updateUserProfile('1', {
  first_name: 'Jane',
  married_status: 'Married'
}, req.mainPool);
```

**`updateUserPassword(userId: string, currentPassword: string, newPassword: string, mainPool: Pool): Promise<void>`**
- Validates current password
- Hashes new password
- Updates password in database

```typescript
await UserService.updateUserPassword('1', 'oldpass', 'newpass', req.mainPool);
```

**`getAllUsers(mainPool: Pool): Promise<User[]>`**
- Retrieves all active users
- Includes role information
- Orders by creation date

```typescript
const users = await UserService.getAllUsers(req.mainPool);
```

**`authenticateUser(email: string, password: string, mainPool: Pool): Promise<AuthResult>`**
- Validates email and password
- Retrieves user with roles
- Returns user data and JWT token

```typescript
const { user, token } = await UserService.authenticateUser(
  'user@example.com',
  'password123',
  req.mainPool
);
```

### Tenant Service (`tenant.service.ts`)

Manages tenant organizations and their data.

#### Methods

**`createTenant(tenantData: any, mainPool: Pool): Promise<Tenant>`**
- Creates new tenant organization
- Creates tenant schema
- Sets up initial tenant configuration
- Returns created tenant

```typescript
const tenant = await TenantService.createTenant({
  name: 'Acme Corp',
  contact_email: 'admin@acme.com',
  description: 'Leading tech company'
}, req.mainPool);
```

**`getTenantById(id: string, mainPool: Pool): Promise<Tenant | null>`**
- Retrieves tenant by ID
- Returns null if not found

```typescript
const tenant = await TenantService.getTenantById('1', req.mainPool);
```

**`getAllTenants(mainPool: Pool): Promise<Tenant[]>`**
- Gets all tenants
- Orders by name

```typescript
const tenants = await TenantService.getAllTenants(req.mainPool);
```

**`updateTenant(id: string, updateData: any, mainPool: Pool): Promise<Tenant>`**
- Updates tenant information
- Validates fields
- Returns updated tenant

```typescript
const updated = await TenantService.updateTenant('1', {
  name: 'Updated Name',
  status: 'ACTIVE'
}, req.mainPool);
```

**`getTenantUsers(tenantId: string, mainPool: Pool): Promise<User[]>`**
- Gets all users belonging to tenant
- Includes user roles
- Filters active users

```typescript
const users = await TenantService.getTenantUsers('1', req.mainPool);
```

### Lookup Service (`lookup.service.ts`)

Handles reference data (lookup tables).

#### Methods

**`getAllLookupData(mainPool: Pool): Promise<LookupType[]>`**
- Retrieves all lookup types with values
- Groups lookups by type
- Orders by sort_order

```typescript
const lookups = await LookupService.getAllLookupData(req.mainPool);
```

**`getLookupTypeById(id: string, mainPool: Pool): Promise<LookupType | null>`**
- Gets specific lookup type with values
- Returns null if not found

```typescript
const lookupType = await LookupService.getLookupTypeById('1', req.mainPool);
```

**`getLookupByKey(key: string, mainPool: Pool): Promise<Lookup | null>`**
- Gets lookup value by key
- Used for system lookups

```typescript
const userRole = await LookupService.getLookupByKey('PLATFORM_USER', req.mainPool);
```

### Chat Service (`chat.service.ts`)

Manages chat messages and channels.

#### Methods

**`getMessagesByChatChannel(senderId: string, receiverId: string, tenantPool: Pool): Promise<Message[]>`**
- Retrieves messages between users
- Orders by timestamp
- Includes sender information

```typescript
const messages = await ChatService.getMessagesByChatChannel(
  '1',
  '2',
  req.tenantPool
);
```

**`sendMessage(messageData: any, tenantPool: Pool): Promise<Message>`**
- Saves new chat message
- Validates message data
- Returns created message

```typescript
const message = await ChatService.sendMessage({
  sender_id: 1,
  receiver_id: 2,
  message: 'Hello!',
  message_type: 'TEXT'
}, req.tenantPool);
```

**`createChatChannel(channelData: any, tenantPool: Pool): Promise<Channel>`**
- Creates new chat channel
- Sets up channel permissions
- Returns created channel

```typescript
const channel = await ChatService.createChatChannel({
  name: 'Team Chat',
  type: 'GROUP'
}, req.tenantPool);
```

## 🔧 Service Guidelines

### 1. Class Structure

```typescript
// ✅ Good: Class-based with static methods
export default class ServiceName {
  constructor(reqObj: any) {}
  
  static async methodName(data: any, pool: Pool): Promise<ReturnType> {
    // Implementation
  }
}

// ❌ Bad: Object-based exports
export const serviceName = {
  methodName: async (data: any) => {
    // Implementation
  }
};
```

### 2. Database Pool Injection

```typescript
// ✅ Good: Inject pool as parameter
static async getData(id: string, mainPool: Pool): Promise<Data> {
  const result = await mainPool.query('SELECT * FROM table WHERE id = $1', [id]);
  return result.rows[0];
}

// ❌ Bad: Import pool directly
import db from '../database/db';
static async getData(id: string): Promise<Data> {
  const pool = db.getDbPool();
  // ...
}
```

### 3. Error Handling

```typescript
// ✅ Good: Specific error handling with HttpError
static async createUser(data: any, mainPool: Pool): Promise<User> {
  try {
    if (!data.email) {
      throw new HttpError('Email is required', 400);
    }
    
    const existing = await mainPool.query(
      'SELECT id FROM app_user WHERE email = $1',
      [data.email]
    );
    
    if (existing.rows.length > 0) {
      throw new HttpError('User already exists', 409);
    }
    
    // Create user
    return user;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
}
```

### 4. Transactions

```typescript
// ✅ Good: Use transactions for multi-step operations
static async createUserWithRole(userData: any, mainPool: Pool): Promise<User> {
  const client = await mainPool.connect();
  try {
    await client.query('BEGIN');
    
    // Create user
    const userResult = await client.query(
      'INSERT INTO app_user (email, password) VALUES ($1, $2) RETURNING *',
      [userData.email, hashedPassword]
    );
    
    // Assign role
    await client.query(
      'INSERT INTO user_role_xref ("userId", "roleId") VALUES ($1, $2)',
      [userResult.rows[0].id, roleId]
    );
    
    await client.query('COMMIT');
    return userResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### 5. Query Optimization

```typescript
// ✅ Good: Use JSON aggregation for related data
static async getUserWithRoles(id: string, mainPool: Pool): Promise<User> {
  const query = `
    SELECT 
      u.*,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', r.id,
            'name', r.name,
            'label', r.label
          )
        ) FILTER (WHERE r.id IS NOT NULL),
        '[]'
      ) AS roles
    FROM app_user u
    LEFT JOIN user_role_xref urx ON u.id = urx."userId"
    LEFT JOIN lookup r ON urx."roleId" = r.id
    WHERE u.id = $1
    GROUP BY u.id
  `;
  
  const result = await mainPool.query(query, [id]);
  return result.rows[0];
}

// ❌ Bad: Multiple separate queries (N+1 problem)
static async getUserWithRoles(id: string, mainPool: Pool): Promise<User> {
  const user = await mainPool.query('SELECT * FROM app_user WHERE id = $1', [id]);
  const roles = await mainPool.query(
    'SELECT r.* FROM lookup r JOIN user_role_xref urx ON r.id = urx."roleId" WHERE urx."userId" = $1',
    [id]
  );
  return { ...user.rows[0], roles: roles.rows };
}
```

### 6. Logging

```typescript
// ✅ Good: Structured logging with context
static async importantOperation(data: any, mainPool: Pool): Promise<Result> {
  try {
    logger.info('Starting important operation', {
      operation: 'importantOperation',
      dataId: data.id
    });
    
    const result = await performOperation();
    
    logger.info('Important operation completed', {
      operation: 'importantOperation',
      resultId: result.id
    });
    
    return result;
  } catch (error) {
    logger.error('Important operation failed', {
      operation: 'importantOperation',
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

## 📝 Creating New Services

### Step 1: Create Service File

```typescript
// src/services/example.service.ts
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { HttpError } from '../utils/httpError';

export default class ExampleService {
  constructor(reqObj: any) {}

  static async create(data: any, mainPool: Pool): Promise<any> {
    try {
      // Validate input
      if (!data.name) {
        throw new HttpError('Name is required', 400);
      }

      // Check duplicates
      const existing = await mainPool.query(
        'SELECT id FROM examples WHERE name = $1',
        [data.name]
      );

      if (existing.rows.length > 0) {
        throw new HttpError('Example already exists', 409);
      }

      // Create record
      const result = await mainPool.query(
        'INSERT INTO examples (name, description) VALUES ($1, $2) RETURNING *',
        [data.name, data.description]
      );

      logger.info('Example created', { id: result.rows[0].id });
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating example:', error);
      throw error;
    }
  }

  static async getAll(mainPool: Pool): Promise<any[]> {
    try {
      const result = await mainPool.query(
        'SELECT * FROM examples ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching examples:', error);
      throw new HttpError('Failed to fetch examples', 500);
    }
  }

  static async getById(id: string, mainPool: Pool): Promise<any | null> {
    try {
      const result = await mainPool.query(
        'SELECT * FROM examples WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching example:', error);
      throw new HttpError('Failed to fetch example', 500);
    }
  }

  static async update(id: string, data: any, mainPool: Pool): Promise<any> {
    try {
      const result = await mainPool.query(
        'UPDATE examples SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [data.name, data.description, id]
      );

      if (result.rows.length === 0) {
        throw new HttpError('Example not found', 404);
      }

      logger.info('Example updated', { id });
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating example:', error);
      throw error;
    }
  }

  static async delete(id: string, mainPool: Pool): Promise<void> {
    try {
      const result = await mainPool.query(
        'DELETE FROM examples WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        throw new HttpError('Example not found', 404);
      }

      logger.info('Example deleted', { id });
    } catch (error) {
      logger.error('Error deleting example:', error);
      throw error;
    }
  }
}
```

### Step 2: Use in Controller

```typescript
// src/controllers/example.controller.ts
import ExampleService from '../services/example.service';

export const createExample = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const example = await ExampleService.create(req.body, req.mainPool);
    res.status(201).json({
      success: true,
      message: 'Example created successfully',
      data: { example }
    });
  } catch (error) {
    next(error);
  }
};
```

## 🧪 Testing Services

```typescript
// tests/unit/services/user.service.test.ts
import UserService from '../../../src/services/user.service';
import { Pool } from 'pg';

describe('UserService', () => {
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
    } as any;
  });

  describe('getUserById', () => {
    it('should return user with roles', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        roles: [{ id: 1, name: 'USER' }]
      };

      mockPool.query.mockResolvedValue({ rows: [mockUser] } as any);

      const result = await UserService.getUserById('1', mockPool);

      expect(result).toEqual(mockUser);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['1']
      );
    });

    it('should return null for non-existent user', async () => {
      mockPool.query.mockResolvedValue({ rows: [] } as any);

      const result = await UserService.getUserById('999', mockPool);

      expect(result).toBeNull();
    });
  });
});
```

## 🔍 Common Patterns

### Pagination

```typescript
static async getPaginated(
  options: { limit: number; offset: number },
  mainPool: Pool
): Promise<{ items: any[]; total: number }> {
  try {
    const countResult = await mainPool.query('SELECT COUNT(*) FROM table');
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await mainPool.query(
      'SELECT * FROM table ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [options.limit, options.offset]
    );

    return {
      items: dataResult.rows,
      total
    };
  } catch (error) {
    logger.error('Error in pagination:', error);
    throw new HttpError('Failed to fetch paginated data', 500);
  }
}
```

### Soft Delete

```typescript
static async softDelete(id: string, mainPool: Pool): Promise<void> {
  try {
    const result = await mainPool.query(
      'UPDATE table SET is_deleted = true, deleted_at = NOW() WHERE id = $1 AND is_deleted = false RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new HttpError('Record not found or already deleted', 404);
    }

    logger.info('Record soft deleted', { id });
  } catch (error) {
    logger.error('Error in soft delete:', error);
    throw error;
  }
}
```

### Bulk Operations

```typescript
static async bulkCreate(items: any[], mainPool: Pool): Promise<any[]> {
  const client = await mainPool.connect();
  try {
    await client.query('BEGIN');

    const created = [];
    for (const item of items) {
      const result = await client.query(
        'INSERT INTO table (name, value) VALUES ($1, $2) RETURNING *',
        [item.name, item.value]
      );
      created.push(result.rows[0]);
    }

    await client.query('COMMIT');
    logger.info('Bulk create completed', { count: created.length });
    return created;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Bulk create failed:', error);
    throw new HttpError('Bulk create failed', 500);
  } finally {
    client.release();
  }
}
```

## 📚 Related Documentation

- [Controllers Documentation](../controllers/README.md)
- [Database Documentation](../database/README.md)
- [Utils Documentation](../utils/README.md)
- [Development Guide](../../development/README.md)

---

**Next**: [Middleware Documentation](../middleware/README.md)
