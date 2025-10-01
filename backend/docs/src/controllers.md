# Controllers Documentation

Controllers handle HTTP requests and responses, acting as the entry point for API requests and delegating business logic to services.

## 📁 Controller Files

```
src/controllers/
├── user.controller.ts      # User authentication & management
├── tenant.controller.ts    # Tenant organizations
├── lookup.controller.ts    # Reference data
└── chat.controller.ts      # Chat messaging
```

## 🎯 Controller Pattern

```typescript
export const controllerFunction = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await ServiceName.methodName(req.db, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

## 📚 Controller Reference

### User Controller (`user.controller.ts`)
**Authentication:**
- `userLogin` - Authenticate user and generate JWT token
- `userSignup` - Register new user account  
- `signoutUser` - Sign out current user

**Profile Management:**
- `getUserProfile` - Get authenticated user's profile
- `getUsers` - Get all users (authenticated)
- `getUserById` - Get specific user by ID
- `createUserProfile` - Create new user profile
- `updateUserProfile` - Update user profile
- `updateUserPassword` - Update user password

### Tenant Controller (`tenant.controller.ts`)
- `createTenant` - Create new tenant
- `getTenants` - Get all tenants
- `getTenantById` - Get specific tenant
- `updateTenant` - Update tenant information
- `getTenantUsers` - Get all users in a tenant

### Lookup Controller (`lookup.controller.ts`)
- `retrieveLookupList` - Get all lookup data
- `getLookupTypeById` - Get specific lookup type with values

### Chat Controller (`chat.controller.ts`)
- `getMessagesByChatChannel` - Get messages between users
- `sendMessage` - Send a chat message

## 🔧 Controller Guidelines

### Request Types
- **`AuthenticatedRequest`** - For protected endpoints (includes `req.user` and `req.db`)
- **`Request`** - For public endpoints

### Data Extraction
```typescript
const { email, password } = req.body;
const { id } = req.params;
const { page, limit } = req.query;
```

### Service Calls
```typescript
const result = await UserService.getUserById(req.db, id);
```

### Response Format
```typescript
res.status(200).json({ success: true, data: result });
```

### Error Handling
```typescript
try {
  // Controller logic
} catch (error) {
  next(error); // Global error middleware handles it
}
```

## 📝 Creating New Controllers

### Basic Controller
```typescript
export const createExample = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await ExampleService.create(req.db, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

### Route Registration
```typescript
registrar.post('/create', {
  requestSchema: { bodySchema: exampleSchema },
  middleware: [authRoleMiddleware()],
  controller: createExample,
});
```

## 📚 Related Documentation

- [Services](services.md) - Business logic layer
- [Middleware](middleware.md) - Request processing
- [API](api.md) - Endpoint documentation
