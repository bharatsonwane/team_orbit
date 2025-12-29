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
import { Pool } from "pg";
import { logger } from "../utils/logger";
import { HttpError } from "../utils/httpError";

export default class ExampleService {
  // Constructor is required but not used for static methods
  constructor(reqObj: any) {}

  static async methodName(data: any, mainPool: Pool): Promise<ReturnType> {
    try {
      // 1. Validate input
      if (!data) {
        throw new HttpError("Data is required", 400);
      }

      // 2. Perform business logic
      const result = await mainPool.query("SELECT * FROM table WHERE id = $1", [
        data.id,
      ]);

      // 3. Process and return data
      return result.rows[0];
    } catch (error) {
      // 4. Log and handle errors
      logger.error("Error in methodName:", error);
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

- Retrieves user by ID with roles and tenant information
- Performs JSON aggregation for role data
- Includes tenant name and label via LEFT JOIN
- Returns null if user not found or inactive

```typescript
const user = await UserService.getUserById("1", req.mainPool);
// Returns user with: id, title, firstName, lastName, ..., tenantId, tenantName, tenantLabel, roles[]
```

**`createUserProfile(userData: any, mainPool: Pool): Promise<User>`**

- Creates new user account
- Hashes password with bcrypt (12 rounds)
- Assigns default role (PLATFORM_USER)
- Uses transactions for data integrity

```typescript
const newUser = await UserService.createUserProfile(
  {
    email: "user@example.com",
    password: "password123",
    firstName: "John",
    lastName: "Doe",
  },
  req.mainPool
);
```

**`updateUserProfile(userId: string, updateData: any, mainPool: Pool): Promise<User>`**

- Updates user profile fields
- Validates allowed fields
- Returns updated user data

```typescript
const updated = await UserService.updateUserProfile(
  "1",
  {
    firstName: "Jane",
    marriedStatus: "Married",
  },
  req.mainPool
);
```

**`updateUserPassword(userId: string, currentPassword: string, newPassword: string, mainPool: Pool): Promise<void>`**

- Validates current password
- Hashes new password
- Updates password in database

```typescript
await UserService.updateUserPassword("1", "oldpass", "newpass", req.mainPool);
```

**`getUsers(mainPool: Pool, filters?: UserFilters): Promise<User[]>`**

- Retrieves users with optional filtering
- Supports filtering by:
  - `roleCategory`: "PLATFORM" or "TENANT"
  - `tenantId`: Numeric tenant ID
  - `searchTerm`: Search by name or email (case-insensitive, uses LIKE)
- Includes detailed role information for each user
- Orders by creation date (newest first)

**UserFilters Interface:**

```typescript
interface UserFilters {
  roleCategory?: 'PLATFORM' | 'TENANT';
  tenantId?: number;
  searchTerm?: string;
}
```

**Usage Examples:**

```typescript
// Get all users (no filtering)
const allUsers = await UserService.getUsers(req.mainPool);

// Get platform users only
const platformUsers = await UserService.getUsers(req.mainPool, {
  roleCategory: 'PLATFORM',
});

// Get tenant users for a specific tenant
const tenantUsers = await UserService.getUsers(req.mainPool, {
  roleCategory: 'TENANT',
  tenantId: 8,
});

// Search users by name/email
const searchResults = await UserService.getUsers(req.mainPool, {
  searchTerm: 'john',
});
```

**SQL Implementation:**

The service uses SQL JOIN with role filtering:

```sql
SELECT
  u.id,
  u.title,
  u."firstName",
  u."lastName",
  u.email,
  u.phone,
  u."tenantId",
  u."statusId",
  ls.name as "statusName",
  ls.label as "statusLabel",
  u."isArchived",
  u."createdAt",
  u."updatedAt",
  COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', lr.id,
        'name', lr.name,
        'label', lr.label,
        'lookupTypeId', lr."lookupTypeId",
        'isSystem', lr."isSystem"
      )
    ) FILTER (WHERE lr.id IS NOT NULL),
    '[]'
  ) AS roles
FROM user u
LEFT JOIN user_roles_xref urx ON u.id = urx."userId"
LEFT JOIN lookup lr ON urx."roleId" = lr.id
LEFT JOIN lookup ls ON u."statusId" = ls.id
WHERE u."isArchived" = false
  AND (${filters.roleCategory ? "lr.name LIKE '" + filters.roleCategory + "_%'" : '1=1'})
  AND (${filters.tenantId ? 'u."tenantId" = ' + filters.tenantId : '1=1'})
  AND (${filters.searchTerm ? "(u.\"firstName\" ILIKE '%" + filters.searchTerm + "%' OR u.\"lastName\" ILIKE '%" + filters.searchTerm + "%' OR u.email ILIKE '%" + filters.searchTerm + "%')" : '1=1'})
GROUP BY u.id, ls.name, ls.label
ORDER BY u."createdAt" DESC
```

**Role Filtering Logic:**

- `roleCategory="PLATFORM"`: Filters users with roles starting with "PLATFORM_" (e.g., PLATFORM_SUPER_ADMIN, PLATFORM_ADMIN)
- `roleCategory="TENANT"`: Filters users with roles starting with "TENANT_" (e.g., TENANT_ADMIN, TENANT_MANAGER, TENANT_USER)

**`authenticateUser(email: string, password: string, mainPool: Pool): Promise<AuthResult>`**

- Validates email and password
- Retrieves user with roles
- Returns user data and JWT token

```typescript
const { user, token } = await UserService.authenticateUser(
  "user@example.com",
  "password123",
  req.mainPool
);
```

**`getUserContacts(dbClient: dbClientPool, userId: number): Promise<UserContacts>`**

- Retrieves user contact information from tenant schema
- Uses `dbClient.tenantPool` for tenant-specific data access
- Returns structured contact data (personalEmail, personalPhone, etc.)

```typescript
const contacts = await UserService.getUserContacts(req.dbClient, userId);
```

**`saveUserContacts(dbClient: dbClientPool, { userId, contactData }): Promise<void>`**

- Saves/updates user contact information
- Uses `dbClient.tenantPool` for tenant-specific data access
- Handles upsert logic for contact types
- Uses transactions for data integrity

```typescript
await UserService.saveUserContacts(req.dbClient, {
  userId: 123,
  contactData: {
    personalEmail: "user@example.com",
    personalPhone: "+1234567890",
    alternativePhone: "+0987654321",
    emergencyPhone1: "+1111111111",
    emergencyPhone2: "+2222222222"
  }
});
```

**`saveUserJobDetails(dbClient: dbClientPool, { userId, jobData }): Promise<void>`**

- Saves/updates user job details information
- Uses `dbClient.tenantPool` for tenant-specific data access
- Handles upsert logic for job details
- Uses transactions for data integrity
- Validates required userId parameter
- Uses `buildUpdateFields` helper for efficient updates

```typescript
await UserService.saveUserJobDetails(req.dbClient, {
  userId: 123,
  jobData: {
    hiringDate: "2024-01-15",
    joiningDate: "2024-02-01",
    probationPeriodMonths: 6,
    designation: "Software Engineer",
    department: "Engineering",
    ctc: 75000.00
  }
});
```

**`getUserJobDetails(dbClient: dbClientPool, userId: number): Promise<SaveUserJobDetailsSchema | null>`**

- Retrieves user job details by userId
- Uses `dbClient.tenantPool` for tenant-specific data access
- Returns null if no job details found
- Includes all job-related fields

```typescript
const jobDetails = await UserService.getUserJobDetails(req.dbClient, userId);
// Returns: { hiringDate, joiningDate, probationPeriodMonths, designation, department, ctc } | null
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
const tenant = await TenantService.createTenant(
  {
    name: "Acme Corp",
    email: "admin@acme.com",
    description: "Leading tech company",
  },
  req.mainPool
);
```

**`getTenantById(id: string, mainPool: Pool): Promise<Tenant | null>`**

- Retrieves tenant by ID
- Returns null if not found

```typescript
const tenant = await TenantService.getTenantById("1", req.mainPool);
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
const updated = await TenantService.updateTenant(
  "1",
  {
    name: "Updated Name",
    status: "ACTIVE",
  },
  req.mainPool
);
```

**Note on Tenant Users:**

The `getTenantUsers` method has been **removed** from TenantService. To retrieve users for a specific tenant, use the `UserService.getUsers()` method with appropriate filters:

```typescript
// Get all users for a specific tenant
const tenantUsers = await UserService.getUsers(req.mainPool, {
  tenantId: 8,
  roleCategory: 'TENANT',
});
```

This provides a unified approach to user retrieval across both platform and tenant contexts.

### Tenant Lookup Service (`tenantLookup.service.ts`)

Manages tenant-specific lookup data (designations, departments, etc.).

#### Methods

**`retrieveTenantLookupList(dbClient: dbClientPool): Promise<TenantLookupTypeWithLookups[]>`**

- Retrieves all tenant lookup types with their associated lookup items
- Uses `dbClient.tenantPool` for tenant-specific data access
- Performs JSON aggregation for efficient data retrieval
- Returns structured lookup data grouped by type

```typescript
const tenantLookups = await TenantLookupService.retrieveTenantLookupList(req.dbClient);
// Returns: [{ id, name, label, lookups: [{ id, name, label, ... }] }]
```

**`getTenantLookupTypeById(dbClient: dbClientPool, id: number): Promise<TenantLookupType | null>`**

- Retrieves specific tenant lookup type by ID with its lookup items
- Uses `dbClient.tenantPool` for tenant-specific data access
- Returns null if lookup type not found
- Includes all associated lookup items

```typescript
const lookupType = await TenantLookupService.getTenantLookupTypeById(req.dbClient, 1);
// Returns: { id, name, label, lookups: [{ id, name, label, ... }] } | null
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
const lookupType = await LookupService.getLookupTypeById("1", req.mainPool);
```

**`getLookupByKey(key: string, mainPool: Pool): Promise<Lookup | null>`**

- Gets lookup value by key
- Used for system lookups

```typescript
const userRole = await LookupService.getLookupByKey(
  "PLATFORM_USER",
  req.mainPool
);
```

### Chat Service (`chat.service.ts`)

Manages chat messages and channels.

#### Methods

**`getMessagesByChatChannel(senderUserId: string, receiverId: string, tenantPool: Pool): Promise<Message[]>`**

- Retrieves messages between users
- Orders by timestamp
- Includes sender information

```typescript
const messages = await ChatService.getMessagesByChatChannel(
  "1",
  "2",
  req.tenantPool
);
```

**`sendMessage(messageData: any, tenantPool: Pool): Promise<Message>`**

- Saves new chat message
- Validates message data
- Returns created message

```typescript
const message = await ChatService.sendMessage(
  {
    sender_id: 1,
    receiver_id: 2,
    message: "Hello!",
    message_type: "TEXT",
  },
  req.tenantPool
);
```

**`createChatChannel(channelData: any, tenantPool: Pool): Promise<Channel>`**

- Creates new chat channel
- Sets up channel permissions
- Returns created channel

```typescript
const channel = await ChatService.createChatChannel(
  {
    name: "Team Chat",
    type: "GROUP",
  },
  req.tenantPool
);
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
  },
};
```

### 2. Database Pool Injection

```typescript
// ✅ Good: Inject pool as parameter
static async getData(id: string, mainPool: Pool): Promise<Data> {
  const result = await mainPool.query('SELECT * FROM table WHERE id = $1', [id]);
  return result.rows[0];
}

// ✅ Good: Use dbClient for tenant-specific operations
static async getTenantData(dbClient: dbClientPool, userId: number): Promise<Data> {
  const result = await dbClient.tenantPool!.query('SELECT * FROM tenant_table WHERE "userId" = $1', [userId]);
  return result?.rows[0];
}

// ❌ Bad: Import pool directly
import db from '../database/db';
static async getData(id: string): Promise<Data> {
  const pool = db.getDbPool();
  // ...
}
```

### 3. Tenant-Specific Data Access Pattern

For operations that require tenant-specific data (like user contacts, job details), use the `dbClient` pattern:

```typescript
// ✅ Good: Use dbClient.tenantPool for tenant data
static async saveUserContacts(
  dbClient: dbClientPool,
  { userId, contactData }: { userId: number; contactData: SaveUserContactsSchema }
): Promise<void> {
  try {
    // Start transaction on tenant pool
    await dbClient.tenantPool!.query(dbTransactionKeys.BEGIN);
    
    // Perform tenant-specific operations
    await dbClient.tenantPool!.query(
      'INSERT INTO user_contacts ("userId", "contactTypeId", value) VALUES ($1, $2, $3)',
      [userId, contactTypeId, contactData.personalEmail]
    );
    
    // Commit transaction
    await dbClient.tenantPool!.query(dbTransactionKeys.COMMIT);
  } catch (error) {
    await dbClient.tenantPool!.query(dbTransactionKeys.ROLLBACK);
    throw error;
  }
}

// ❌ Bad: Manual tenant pool management
static async saveUserContacts(userId: number, contactData: any, mainPool: Pool): Promise<void> {
  // Get tenant ID
  const userResult = await mainPool.query('SELECT "tenantId" FROM users WHERE id = $1', [userId]);
  const tenantId = userResult.rows[0].tenantId;
  
  // Manually get tenant pool
  const tenantSchemaName = schemaNames.tenantSchemaName(tenantId.toString());
  const tenantPool = await db.getSchemaPool(tenantSchemaName);
  
  // Use tenant pool...
}
```

### 4. Error Handling

```typescript
// ✅ Good: Specific error handling with HttpError
static async createUser(data: any, mainPool: Pool): Promise<User> {
  try {
    if (!data.email) {
      throw new HttpError('Email is required', 400);
    }

    const existing = await mainPool.query(
      'SELECT id FROM user WHERE email = $1',
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

### 5. Transactions

```typescript
// ✅ Good: Use transactions for multi-step operations
static async createUserWithRole(userData: any, mainPool: Pool): Promise<User> {
  const client = await mainPool.connect();
  try {
    await client.query('BEGIN');

    // Create user
    const userResult = await client.query(
      'INSERT INTO user (email, password) VALUES ($1, $2) RETURNING *',
      [userData.email, hashedPassword]
    );

    // Assign role
    await client.query(
      'INSERT INTO user_roles_xref ("userId", "roleId") VALUES ($1, $2)',
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

### 6. Query Optimization

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
    FROM user u
    LEFT JOIN user_roles_xref urx ON u.id = urx."userId"
    LEFT JOIN lookup r ON urx."roleId" = r.id
    WHERE u.id = $1
    GROUP BY u.id
  `;

  const result = await mainPool.query(query, [id]);
  return result.rows[0];
}

// ❌ Bad: Multiple separate queries (N+1 problem)
static async getUserWithRoles(id: string, mainPool: Pool): Promise<User> {
  const user = await mainPool.query('SELECT * FROM user WHERE id = $1', [id]);
  const roles = await mainPool.query(
    'SELECT r.* FROM lookup r JOIN user_roles_xref urx ON r.id = urx."roleId" WHERE urx."userId" = $1',
    [id]
  );
  return { ...user.rows[0], roles: roles.rows };
}
```

### 7. Logging

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
import { Pool } from "pg";
import { logger } from "../utils/logger";
import { HttpError } from "../utils/httpError";

export default class ExampleService {
  constructor(reqObj: any) {}

  static async create(data: any, mainPool: Pool): Promise<any> {
    try {
      // Validate input
      if (!data.name) {
        throw new HttpError("Name is required", 400);
      }

      // Check duplicates
      const existing = await mainPool.query(
        "SELECT id FROM examples WHERE name = $1",
        [data.name]
      );

      if (existing.rows.length > 0) {
        throw new HttpError("Example already exists", 409);
      }

      // Create record
      const result = await mainPool.query(
        "INSERT INTO examples (name, description) VALUES ($1, $2) RETURNING *",
        [data.name, data.description]
      );

      logger.info("Example created", { id: result.rows[0].id });
      return result.rows[0];
    } catch (error) {
      logger.error("Error creating example:", error);
      throw error;
    }
  }

  static async getAll(mainPool: Pool): Promise<any[]> {
    try {
      const result = await mainPool.query(
        "SELECT * FROM examples ORDER BY created_at DESC"
      );
      return result.rows;
    } catch (error) {
      logger.error("Error fetching examples:", error);
      throw new HttpError("Failed to fetch examples", 500);
    }
  }

  static async getById(id: string, mainPool: Pool): Promise<any | null> {
    try {
      const result = await mainPool.query(
        "SELECT * FROM examples WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Error fetching example:", error);
      throw new HttpError("Failed to fetch example", 500);
    }
  }

  static async update(id: string, data: any, mainPool: Pool): Promise<any> {
    try {
      const result = await mainPool.query(
        "UPDATE examples SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
        [data.name, data.description, id]
      );

      if (result.rows.length === 0) {
        throw new HttpError("Example not found", 404);
      }

      logger.info("Example updated", { id });
      return result.rows[0];
    } catch (error) {
      logger.error("Error updating example:", error);
      throw error;
    }
  }

  static async delete(id: string, mainPool: Pool): Promise<void> {
    try {
      const result = await mainPool.query(
        "DELETE FROM examples WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        throw new HttpError("Example not found", 404);
      }

      logger.info("Example deleted", { id });
    } catch (error) {
      logger.error("Error deleting example:", error);
      throw error;
    }
  }
}
```

### Step 2: Use in Controller

```typescript
// src/controllers/example.controller.ts
import ExampleService from "../services/example.service";

export const createExample = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const example = await ExampleService.create(req.body, req.mainPool);
    res.status(201).json({
      success: true,
      message: "Example created successfully",
      data: { example },
    });
  } catch (error) {
    next(error);
  }
};
```

## 🧪 Testing Services

```typescript
// tests/unit/services/user.service.test.ts
import UserService from "../../../src/services/user.service";
import { Pool } from "pg";

describe("UserService", () => {
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
      connect: jest.fn(),
    } as any;
  });

  describe("getUserById", () => {
    it("should return user with roles", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        roles: [{ id: 1, name: "USER" }],
      };

      mockPool.query.mockResolvedValue({ rows: [mockUser] } as any);

      const result = await UserService.getUserById("1", mockPool);

      expect(result).toEqual(mockUser);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        ["1"]
      );
    });

    it("should return null for non-existent user", async () => {
      mockPool.query.mockResolvedValue({ rows: [] } as any);

      const result = await UserService.getUserById("999", mockPool);

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
