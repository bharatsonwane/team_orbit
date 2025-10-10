# Middleware Documentation

Middleware components handle cross-cutting concerns in the TeamOrbit backend, including authentication, validation, database connections, and error handling.

## 📁 Middleware Files

```
src/middleware/
├── authRoleMiddleware.ts       # JWT authentication and authorization
├── dbClientMiddleware.ts       # Database connection injection
├── validationMiddleware.ts     # Request validation with Zod
├── errorMiddleware.ts          # Global error handling
└── RouteRegistrar.ts           # Route registration and OpenAPI generation
```

## 🔒 Authentication Middleware

### `authRoleMiddleware.ts`

Handles JWT authentication and role-based authorization.

#### Key Interfaces

```typescript
interface JwtTokenPayload {
  userId: number;
  email: string;
  userRoles: Array<{
    id: number;
    name: string;
    label: string;
    lookupTypeId: number;
  }>;
}

interface AuthenticatedRequest extends Request {
  user?: JwtTokenPayload;
  mainPool: PoolClient;
  tenantPool?: PoolClient;
}
```

#### Usage

```typescript
// Require any authenticated user
router.get("/profile", authRoleMiddleware(), getUserProfile);

// Require specific roles
router.post(
  "/admin/action",
  authRoleMiddleware(
    userRoleKeys.PLATFORM_SUPER_ADMIN,
    userRoleKeys.PLATFORM_ADMIN
  ),
  adminAction
);
```

#### Features

- JWT token validation
- Role-based access control
- User data injection into request
- Comprehensive error handling

## 🗄️ Database Client Middleware

### `dbClientMiddleware.ts`

Automatically injects database connections into requests.

#### Functionality

```typescript
export async function dbClientMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Initialize database connections
  req.mainPool = await db.getSchemaPool("main");

  // Optional: Add tenant pool if needed
  if (tenantId) {
    req.tenantPool = await db.getSchemaPool(`tenant_${tenantId}`);
  }

  next();
}
```

#### Usage

```typescript
// Applied globally to /api routes
app.use("/api", dbClientMiddleware, apiRoutes);

// Available in controllers
export const getUser = async (req: AuthenticatedRequest, res, next) => {
  const user = await UserService.getUserById(id, req.mainPool);
};
```

## ✅ Validation Middleware

### `validationMiddleware.ts`

Validates requests using Zod schemas.

#### Usage

```typescript
// Applied automatically via RouteRegistrar
registrar.post("/create", {
  requestSchema: {
    bodySchema: createUserSchema,
    querySchema: paginationSchema,
    paramsSchema: idParamsSchema,
  },
  controller: createUser,
});
```

#### Features

- Body validation
- Query parameter validation
- URL parameter validation
- Detailed error messages
- Type-safe validation

#### Example

```typescript
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});

// Validation middleware automatically:
// 1. Parses the request body
// 2. Validates against schema
// 3. Returns 400 error if invalid
// 4. Passes validated data to controller
```

## ❌ Error Middleware

### `errorMiddleware.ts`

Centralized error handling for the application.

#### Global Error Handler

```typescript
export const globalErrorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error("Global error handler:", {
    error: error.message,
    stack: error.stack,
    path: req.path,
  });

  if (error instanceof HttpError) {
    res.status(error.status).json({
      success: false,
      message: error.message,
      statusCode: error.status,
    });
  } else if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.errors,
    });
  } else {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
```

#### 404 Handler

```typescript
export const routeNotFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
};
```

#### Usage

```typescript
// Applied at the end of middleware stack
app.use(routeNotFoundMiddleware);
app.use(globalErrorMiddleware);
```

## 🛣️ Route Registrar

### `RouteRegistrar.ts`

Sophisticated route registration with automatic OpenAPI documentation.

#### Class Structure

```typescript
class RouteRegistrar {
  public router: Router;
  private basePath: string;
  private tags: string[];

  constructor({ basePath = "", tags = [] }: ConstructorOptions) {
    this.router = express.Router();
    this.basePath = basePath;
    this.tags = tags;
  }

  registerRoute(method: string, path: string, options: RouteOptions): void;
  get(path: string, options: RouteOptions): void;
  post(path: string, options: RouteOptions): void;
  put(path: string, options: RouteOptions): void;
  delete(path: string, options: RouteOptions): void;
  patch(path: string, options: RouteOptions): void;
}
```

#### Features

- Automatic route registration
- OpenAPI documentation generation
- Request validation integration
- Middleware chaining
- Security configuration

#### Usage Example

```typescript
import RouteRegistrar from "../middleware/RouteRegistrar";
import { authRoleMiddleware } from "../middleware/authRoleMiddleware";

const registrar = new RouteRegistrar({
  basePath: "/api/user",
  tags: ["User"],
});

// Public endpoint
registrar.post("/login", {
  requestSchema: { bodySchema: loginSchema },
  responseSchemas: [{ statusCode: 200, schema: userSchema }],
  controller: userLogin,
});

// Protected endpoint
registrar.get("/profile", {
  middleware: [authRoleMiddleware()],
  controller: getUserProfile,
  oasSchema: getUserProfileOASSchema,
});

// Role-restricted endpoint
registrar.post("/admin/create", {
  middleware: [
    authRoleMiddleware(
      userRoleKeys.PLATFORM_SUPER_ADMIN,
      userRoleKeys.PLATFORM_ADMIN
    ),
  ],
  requestSchema: { bodySchema: createUserSchema },
  controller: createUser,
});

export default registrar;
```

## 🔧 Creating Custom Middleware

### Example: Request Logging Middleware

```typescript
// src/middleware/requestLoggingMiddleware.ts
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const requestLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("user-agent"),
    });
  });

  next();
};
```

### Example: Rate Limiting Middleware

```typescript
// src/middleware/rateLimitMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError";

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimitMiddleware = (
  maxRequests: number = 100,
  windowMs: number = 60000
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip;
    const now = Date.now();

    const requestData = requestCounts.get(ip) || {
      count: 0,
      resetTime: now + windowMs,
    };

    if (now > requestData.resetTime) {
      requestData.count = 0;
      requestData.resetTime = now + windowMs;
    }

    requestData.count++;
    requestCounts.set(ip, requestData);

    if (requestData.count > maxRequests) {
      throw new HttpError("Too many requests", 429);
    }

    res.setHeader("X-RateLimit-Limit", maxRequests.toString());
    res.setHeader(
      "X-RateLimit-Remaining",
      (maxRequests - requestData.count).toString()
    );
    res.setHeader("X-RateLimit-Reset", requestData.resetTime.toString());

    next();
  };
};
```

### Example: Tenant Context Middleware

```typescript
// src/middleware/tenantContextMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError";
import db from "../database/db";

export const tenantContextMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.headers["x-tenant-id"] as string;

    if (!tenantId) {
      throw new HttpError("Tenant ID is required", 400);
    }

    // Verify tenant exists and is active
    const tenant = await db
      .getDbPool()
      .query("SELECT id, status FROM tenant WHERE id = $1", [tenantId]);

    if (tenant.rows.length === 0) {
      throw new HttpError("Tenant not found", 404);
    }

    if (tenant.rows[0].status !== "ACTIVE") {
      throw new HttpError("Tenant is not active", 403);
    }

    // Inject tenant pool
    req.tenantPool = await db.getSchemaPool(`tenant_${tenantId}`);
    req.tenantId = tenantId;

    next();
  } catch (error) {
    next(error);
  }
};
```

## 📊 Middleware Execution Order

```
Request
  │
  ├── CORS Middleware
  │
  ├── Helmet (Security Headers)
  │
  ├── Morgan (Request Logging)
  │
  ├── Body Parser (JSON/URL Encoded)
  │
  ├── Database Client Middleware
  │     └── Injects: req.mainPool, req.tenantPool
  │
  ├── Route Handler
  │     │
  │     ├── Validation Middleware
  │     │     └── Validates: body, query, params
  │     │
  │     ├── Authentication Middleware
  │     │     └── Validates: JWT, injects user
  │     │
  │     ├── Authorization Middleware
  │     │     └── Checks: user roles
  │     │
  │     └── Controller
  │
  ├── 404 Handler (if no route matched)
  │
  └── Global Error Handler
```

## 🧪 Testing Middleware

```typescript
// tests/unit/middleware/authRoleMiddleware.test.ts
import { authRoleMiddleware } from "../../../src/middleware/authRoleMiddleware";
import jwt from "jsonwebtoken";

describe("Auth Role Middleware", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
      mainPool: {} as any,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it("should authenticate valid token", async () => {
    const token = jwt.sign(
      { userId: 1, email: "test@example.com", userRoles: [] },
      process.env.JWT_SECRET!
    );

    mockReq.headers.authorization = `Bearer ${token}`;

    const middleware = authRoleMiddleware();
    await middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user.userId).toBe(1);
  });

  it("should reject invalid token", async () => {
    mockReq.headers.authorization = "Bearer invalid_token";

    const middleware = authRoleMiddleware();
    await middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should check required roles", async () => {
    const token = jwt.sign(
      {
        userId: 1,
        email: "test@example.com",
        userRoles: [{ name: "PLATFORM_USER" }],
      },
      process.env.JWT_SECRET!
    );

    mockReq.headers.authorization = `Bearer ${token}`;

    const middleware = authRoleMiddleware("PLATFORM_ADMIN");
    await middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403 })
    );
  });
});
```

## 📚 Best Practices

### 1. Error Handling in Middleware

```typescript
// ✅ Good: Pass errors to next
export const myMiddleware = async (req, res, next) => {
  try {
    // Middleware logic
    next();
  } catch (error) {
    next(error); // Let global handler deal with it
  }
};

// ❌ Bad: Handle errors in middleware
export const myMiddleware = async (req, res, next) => {
  try {
    // Middleware logic
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
```

### 2. Async Middleware

```typescript
// ✅ Good: Properly handle async operations
export const asyncMiddleware = async (req, res, next) => {
  try {
    await someAsyncOperation();
    next();
  } catch (error) {
    next(error);
  }
};
```

### 3. Middleware Dependencies

```typescript
// ✅ Good: Clear dependency requirements
export const authMiddleware = (req, res, next) => {
  if (!req.mainPool) {
    throw new Error("Database connection required");
  }
  // Continue with auth logic
};
```

## 📚 Related Documentation

- [Controllers Documentation](../controllers/README.md)
- [Services Documentation](../services/README.md)
- [Architecture Overview](../architecture.md)
- [Development Guide](../../development/README.md)

---

**Next**: [Schemas Documentation](../schemas/README.md)
