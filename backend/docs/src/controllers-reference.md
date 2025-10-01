# Controllers Documentation

Controllers handle HTTP requests and responses in the TeamOrbit backend. They act as the entry point for API requests and delegate business logic to services.

## 📁 Controller Files

```
src/controllers/
├── user.controller.ts      # User management endpoints
├── tenant.controller.ts    # Tanant endpoints
├── lookup.controller.ts    # Reference data endpoints
└── chat.controller.ts      # Chat messaging endpoints
```

## 🎯 Controller Pattern

Controllers in TeamOrbit follow a consistent pattern:

```typescript
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authRoleMiddleware';
import ServiceName from '../services/service.service';
import { HttpError } from '../utils/httpError';

export const controllerFunction = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extract data from request
    const data = req.body;
    const userId = req.user?.id;
    
    // 2. Call service layer
    const result = await ServiceName.methodName(data, req.mainPool);
    
    // 3. Return response
    res.status(200).json({
      success: true,
      message: 'Operation successful',
      data: result
    });
  } catch (error) {
    // 4. Pass errors to global error handler
    next(error);
  }
};
```

## 📚 Controller Reference

### User Controller (`user.controller.ts`)

Handles user authentication and profile management.

#### Authentication Endpoints

**`userLogin`** - Authenticate user and generate JWT token
```typescript
export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>
```

**`userSignup`** - Register new user account
```typescript
export const userSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>
```

**`signoutUser`** - Sign out current user
```typescript
export const signoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>
```

#### Profile Management

**`getUserProfile`** - Get authenticated user's profile
```typescript
export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void>
```

**`getUsers`** - Get all users (authenticated)
```typescript
export const getUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void>
```

**`getUserById`** - Get specific user by ID
```typescript
export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void>
```

**`createUserProfile`** - Create new user profile
```typescript
export const createUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>
```

**`updateUserProfile`** - Update user profile
```typescript
export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void>
```

**`updateUserPassword`** - Update user password
```typescript
export const updateUserPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void>
```

### Tenant Controller (`tenant.controller.ts`)

Manages tenant organizations and their users.

**`createTenant`** - Create new tenant
```typescript
export const createTenant = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void>
```

**`getTenants`** - Get all tenants
```typescript
export const getTenants = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void>
```

**`getTenantById`** - Get specific tenant
```typescript
export const getTenantById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void>
```

**`updateTenant`** - Update tenant information
```typescript
export const updateTenant = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void>
```

**`getTenantUsers`** - Get all users in a tenant
```typescript
export const getTenantUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void>
```

### Lookup Controller (`lookup.controller.ts`)

Handles reference data (lookup tables).

**`retrieveLookupList`** - Get all lookup data
```typescript
export const retrieveLookupList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>
```

**`getLookupTypeById`** - Get specific lookup type with values
```typescript
export const getLookupTypeById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>
```

### Chat Controller (`chat.controller.ts`)

Manages chat messages between users.

**`getMessagesByChatChannel`** - Get messages between users
```typescript
export const getMessagesByChatChannel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>
```

**`sendMessage`** - Send a chat message
```typescript
export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>
```

## 🔧 Controller Guidelines

### 1. Request Handling

```typescript
// ✅ Good: Use AuthenticatedRequest for protected endpoints
export const protectedEndpoint = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id; // Type-safe user access
  const pool = req.mainPool; // Database connection available
};

// ✅ Good: Use Request for public endpoints
export const publicEndpoint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // No authentication required
};
```

### 2. Data Extraction

```typescript
// ✅ Good: Extract and validate data
const { email, password } = req.body;
const { id } = req.params;
const { page, limit } = req.query;

// Validation is handled by middleware (Zod schemas)
```

### 3. Service Calls

```typescript
// ✅ Good: Pass database connection to services
const result = await UserService.getUserById(id, req.mainPool);

// For tenant-specific operations
const messages = await ChatService.getMessages(channelId, req.tenantPool);
```

### 4. Response Format

```typescript
// ✅ Good: Consistent response structure
res.status(200).json({
  success: true,
  message: 'Operation successful',
  data: {
    user: userData
  }
});

// ✅ Good: Empty data responses
res.status(200).json({
  success: true,
  message: 'Signed out successfully'
});
```

### 5. Error Handling

```typescript
// ✅ Good: Pass errors to global handler
try {
  const result = await SomeService.doSomething(data, req.mainPool);
  res.status(200).json({ success: true, data: result });
} catch (error) {
  next(error); // Global error middleware handles it
}

// ✅ Good: Throw specific errors
if (!user) {
  throw new HttpError('User not found', 404);
}

if (!hasPermission) {
  throw new HttpError('Insufficient permissions', 403);
}
```

## 📝 Creating New Controllers

### Step 1: Define Controller Function

```typescript
// src/controllers/example.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authRoleMiddleware';
import ExampleService from '../services/example.service';
import { HttpError } from '../utils/httpError';

export const createExample = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new HttpError('Authentication required', 401);
    }
    
    const result = await ExampleService.create(data, req.mainPool);
    
    res.status(201).json({
      success: true,
      message: 'Example created successfully',
      data: { example: result }
    });
  } catch (error) {
    next(error);
  }
};

export const getExamples = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const examples = await ExampleService.getAll(req.mainPool);
    
    res.status(200).json({
      success: true,
      message: 'Examples retrieved successfully',
      data: { examples }
    });
  } catch (error) {
    next(error);
  }
};
```

### Step 2: Register in Routes

```typescript
// src/routes/example.routes.ts
import RouteRegistrar from '../middleware/RouteRegistrar';
import { authRoleMiddleware } from '../middleware/authRoleMiddleware';
import { createExample, getExamples } from '../controllers/example.controller';
import { exampleSchema } from '../schemas/example.schema';

const registrar = new RouteRegistrar({
  basePath: '/api/example',
  tags: ['Example'],
});

registrar.post('/create', {
  requestSchema: { bodySchema: exampleSchema },
  middleware: [authRoleMiddleware()],
  controller: createExample,
});

registrar.get('/list', {
  middleware: [authRoleMiddleware()],
  controller: getExamples,
});

export default registrar;
```

## 🧪 Testing Controllers

```typescript
// tests/unit/controllers/user.controller.test.ts
import { getUserProfile } from '../../../src/controllers/user.controller';
import UserService from '../../../src/services/user.service';

jest.mock('../../../src/services/user.service');

describe('User Controller', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockReq = {
      user: { id: 1, email: 'test@example.com' },
      mainPool: {} as any,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should get user profile successfully', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);

    await getUserProfile(mockReq as any, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: expect.any(String),
      data: expect.objectContaining({ user: mockUser }),
    });
  });
});
```

## 🔍 Common Patterns

### Pagination

```typescript
export const getPagedResults = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    const { items, total } = await Service.getPaginated(
      { limit, offset },
      req.mainPool
    );
    
    res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
```

### File Upload

```typescript
export const uploadFile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file; // From multer middleware
    
    if (!file) {
      throw new HttpError('No file provided', 400);
    }
    
    const result = await FileService.upload(file, req.mainPool);
    
    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: { file: result },
    });
  } catch (error) {
    next(error);
  }
};
```

### Bulk Operations

```typescript
export const bulkCreate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const items = req.body.items; // Array of items
    
    if (!Array.isArray(items) || items.length === 0) {
      throw new HttpError('Items array is required', 400);
    }
    
    const results = await Service.bulkCreate(items, req.mainPool);
    
    res.status(201).json({
      success: true,
      message: `${results.length} items created successfully`,
      data: { items: results },
    });
  } catch (error) {
    next(error);
  }
};
```

## 📚 Related Documentation

- [Services Documentation](../services/README.md)
- [Middleware Documentation](../middleware/README.md)
- [API Reference](../../api/README.md)
- [Development Guide](../../development/README.md)

---

**Next**: [Services Documentation](../services/README.md)
