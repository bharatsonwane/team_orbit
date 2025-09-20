# Middleware Architecture

Comprehensive documentation for the TeamOrbit backend middleware stack.

## 🏗️ Middleware Overview

The TeamOrbit backend implements a sophisticated middleware stack that handles cross-cutting concerns including database connection management, authentication, validation, error handling, and response formatting.

## 🔧 Middleware Stack Order

```typescript
// server.ts - Middleware execution order
app.use(helmet());                    // Security headers
app.use(cors({ origin: '*', credentials: true })); // CORS configuration
app.use(morgan('combined'));          // Request logging
app.use(express.json());              // JSON body parsing
app.use(express.urlencoded({ extended: true })); // URL-encoded parsing
app.use('/api', dbClientMiddleware, apiRoutes);  // Database connection + API routes
app.use('/docs', openApiRoutes);      // API documentation routes
// Health check endpoint
app.get('/health', healthCheckHandler);
// Routes...
app.use(validationMiddleware);        // Request validation (route-specific)
app.use(authRoleMiddleware);          // Authentication & authorization (route-specific)
app.use(routeNotFoundMiddleware);     // 404 handler for undefined routes
app.use(globalErrorMiddleware);       // Global error handler
```

## 🗄️ Database Client Middleware

### Purpose
Automatically injects database connections into request objects for multi-schema support.

### Implementation
```typescript
// src/middleware/dbClientMiddleware.ts
export interface dbClientPool {
  mainPool: PoolClient;
  tenantPool?: PoolClient;
}

declare global {
  namespace Express {
    interface Request {
      db: dbClientPool;
    }
  }
}

export async function dbClientMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const tenantSchemaName = req.headers['x-tenant-schema'] as string | undefined;

  try {
    // Initialize the db object on the request
    req.db = {} as dbClientPool;
    
    // Always get a pool for the main schema
    req.db.mainPool = await db.getSchemaPool('main');

    // Get tenant-specific schema pool if provided
    if (tenantSchemaName) {
      req.db.tenantPool = await db.getSchemaPool(`tenant_${tenantSchemaName}`);
    }

    // Comprehensive connection cleanup with double-release prevention
    let isReleased = false;
    
    const cleanup = () => {
      if (isReleased) return; // Prevent double release
      isReleased = true;
      
      try {
        if (
          req.db.tenantPool?.release &&
          typeof req.db.tenantPool?.release === 'function'
        ) {
          req.db.tenantPool.release(true);
        }
        if (
          req.db.mainPool?.release &&
          typeof req.db.mainPool?.release === 'function'
        ) {
          req.db.mainPool.release(true);
        }
      } catch (releaseError) {
        logger.error('Error releasing database connections:', releaseError);
      }
    };

    // Listen to multiple events for comprehensive cleanup
    res.on('finish', cleanup); // Normal response completion
    res.on('close', cleanup);  // Connection closed/aborted
    res.on('error', cleanup);  // Response errors

    next();
  } catch (err: unknown) {
    const error = err as DatabaseError;
    logger.error('dbClientMiddleware error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
    });
    
    res.status(500).json({
      error: 'Database connection error',
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal server error',
    });
  }
}
```

### Usage in Controllers
```typescript
export const getLookupList = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Access main database pool
    const results = await req.db.mainPool.query('SELECT * FROM lookup_type');
    
    // Access tenant database pool (if available)
    if (req.db.tenantPool) {
      const tenantData = await req.db.tenantPool.query('SELECT * FROM tenant_data');
    }
    
    res.status(200).json({
      success: true,
      data: results.rows
    });
  } catch (error) {
    next(error); // Pass error to global error handler
  }
};
```

### Features
- **Multi-schema Support:** Automatic tenant schema detection via headers
- **Connection Pooling:** Efficient database connection management
- **Automatic Cleanup:** Connections released when response completes
- **Error Handling:** Graceful degradation with detailed error logging
- **TypeScript Integration:** Full type safety with interface extensions

## 🔒 Authentication & Role Middleware

### Purpose
Handles JWT token validation and role-based access control.

### Implementation
```typescript
// src/middleware/authRoleMiddleware.ts
export interface AuthenticatedRequest extends Request {
  user?: JwtTokenPayload;
}

export interface JwtTokenPayload {
  userId: number;
  email: string;
  userRoles: Array<{
    id: number;
    label: string;
    lookupTypeId: number;
  }>;
}

export const authRoleMiddleware = (...allowedRoles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const bearerToken = req.headers['authorization'];

    if (!bearerToken) {
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }

    try {
      // if the token is in the format "Bearer <token>", extract the token if not use the token as is
      const token = bearerToken.split(' ')?.[1] || bearerToken;

      // Validate the token
      const decodedJwt = (await validateJwtToken(token)) as JwtTokenPayload;
      req.user = decodedJwt;

      // Extract user roles from the decodedJwt token
      const userRoles =
        typeof decodedJwt === 'object' ? decodedJwt?.userRoles : null;

      // If no specific roles are required, proceed to the next middleware
      if (allowedRoles.length === 0) {
        next();
        return;
      }

      if (
        !userRoles ||
        !userRoles.some((role: { label: string }) =>
          allowedRoles.includes(role.label)
        )
      ) {
        res
          .status(403)
          .json({ message: 'Access forbidden: Insufficient permissions.' });
        return;
      }

      // Proceed to the next middleware
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid token.' });
      return;
    }
  };
};
```

### Usage
```typescript
// Protect routes with authentication only (no specific roles required)
registrar.get('/profile', {
  middleware: [authRoleMiddleware()],
  controller: getUserProfile,
});

// Protect routes with specific role requirements
registrar.get('/admin/users', {
  middleware: [authRoleMiddleware('admin', 'superadmin')],
  controller: getAllUsers,
});

// Multiple roles allowed
registrar.post('/moderate', {
  middleware: [authRoleMiddleware('admin', 'moderator')],
  controller: moderateContent,
});

// Using in controller functions
export const getUserProfile = async (
  req: AuthenticatedRequest, // Use AuthenticatedRequest type
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId; // Access authenticated user data
    
    if (!userId) {
      throw { statusCode: 401, message: 'User not authenticated' };
    }

    // Use userId for business logic
    const userData = await User.getUserById(req.db, { userId });
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};
```

## ✅ Validation Middleware

### Purpose
Validates request data using Zod schemas with comprehensive error reporting.

### Implementation
```typescript
// src/middleware/validationMiddleware.ts
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: formattedErrors
          }
        });
        return;
      }

      logger.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Internal validation error' }
      });
    }
  };
};

// Query parameter validation
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Query validation failed',
            details: error.errors
          }
        });
        return;
      }
      next(error);
    }
  };
};

// Path parameter validation
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Parameter validation failed',
            details: error.errors
          }
        });
        return;
      }
      next(error);
    }
  };
};
```

### Usage with Schemas
```typescript
// Define validation schemas
const createUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100)
});

const getUserParamsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number)
});

// Apply validation to routes
router.post('/users', 
  validateRequest(createUserSchema), 
  createUser
);

router.get('/users/:id', 
  validateParams(getUserParamsSchema), 
  getUserById
);
```

## 🚨 Global Error Handler Middleware

### Purpose
Centralized error handling with comprehensive logging and consistent response format.

### Implementation
```typescript
// src/middleware/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { HttpError } from '../utils/httpError';

/**
 * 404 Not Found middleware
 * This should be placed after all routes but before the error handler
 */
export const routeNotFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new HttpError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Global error middleware
 * This should be the last middleware in the application
 */
export const globalErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Comprehensive logging
  logger.error('Global error handler:', {
    statusCode,
    message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Prevent double responses
  if (res.headersSent) {
    return next(err);
  }

  // Clean response format
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
};
```

### Controller Error Handling Pattern
```typescript
// Modern controller pattern with next() error handling
export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const savedMessage = await Chat.sendMessage(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: savedMessage,
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

// Old pattern (deprecated)
export const sendMessageOld = async (req: Request, res: Response) => {
  try {
    const savedMessage = await Chat.sendMessage(req.body);
    res.success(savedMessage, 'Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
    });
  }
};
```

## 📋 Response Format Standards

### Current Response Format (Updated)
```typescript
// Success response format
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}

// Error response format (simplified)
{
  "message": "Error description",
  "stack": "Error stack trace..." // Development only
}

// Legacy format (being phased out)
{
  "success": false,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users",
  "error": {
    "message": "User not found",
    "stack": "Error: User not found..." // Development only
  }
}
```

## 🔧 Route Registration Middleware

### Purpose
Centralized route registration with middleware application.

### Implementation
```typescript
// src/middleware/RouteRegistrar.ts
export class RouteRegistrar {
  private app: Express;
  private routes: RouteConfig[] = [];

  constructor(app: Express) {
    this.app = app;
  }

  register(config: RouteConfig): void {
    this.routes.push(config);
    
    const router = Router();
    
    // Apply route-specific middleware
    if (config.middleware) {
      router.use(config.middleware);
    }

    // Register route handlers
    config.routes.forEach(route => {
      const middlewares = [
        ...(route.validation ? [route.validation] : []),
        ...(route.auth ? [route.auth] : []),
        route.handler
      ];

      router[route.method](route.path, ...middlewares);
    });

    this.app.use(config.basePath, router);
  }

  registerAll(): void {
    logger.info('Registering routes:', {
      count: this.routes.length,
      routes: this.routes.map(r => r.basePath)
    });
  }
}
```

## 📊 Middleware Performance Monitoring

### Request Timing Middleware
```typescript
export const requestTimer = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request completed:', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length')
    });
  });

  next();
};
```

## 🛡️ Security Middleware Stack

### Rate Limiting (Ready for Implementation)
```typescript
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later' }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth-specific rate limiting
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit auth attempts
  skipSuccessfulRequests: true
});
```

## 🧪 Testing Middleware

### Test Utilities
```typescript
// tests/middleware/middleware.test.ts
describe('Database Client Middleware', () => {
  it('should inject database connections', async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn();

    await dbClientMiddleware(req, res, next);

    expect(req.db).toBeDefined();
    expect(req.db.mainPool).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
});
```

## 📚 Best Practices

### Middleware Order (Updated)
1. **Security first:** Helmet, CORS
2. **Logging:** Morgan for request logging
3. **Parsing:** Body and URL parsing
4. **Database + Routes:** Connection injection with route mounting
5. **Documentation:** OpenAPI/Swagger routes
6. **Health checks:** System status endpoints
7. **Validation:** Request validation (route-specific)
8. **Authentication:** Auth checks (route-specific)
9. **Error handling:** 404 handler and global error middleware

### Error Handling (Updated)
- Always use try-catch in async controllers and middleware
- Pass errors to global handler using `next(error)`
- Log errors with comprehensive context information
- Use consistent, simplified error response format
- Implement proper cleanup in database middleware
- Avoid duplicate error handling in controllers

### Performance
- Use connection pooling for database access
- Implement request timeouts
- Monitor middleware execution time
- Cache frequently accessed data

### Security
- Validate all inputs
- Sanitize user data
- Implement rate limiting
- Use HTTPS in production
- Set security headers

This middleware architecture provides a robust, scalable foundation for the TeamOrbit backend with centralized error handling, enhanced database connection management, security features, and streamlined development patterns.

## 🔄 Recent Updates

### Version 2.0 Changes (Current)

#### Middleware Stack Improvements
- **Morgan Removal:** Eliminated HTTP request logging middleware for cleaner terminal output and reduced noise
- **Centralized Error Handling:** Migrated from individual controller error responses to global error middleware using `next(error)`
- **Removed Response Handler Middleware:** Simplified response format without custom `res.success()` and `res.error()` methods
- **Enhanced Database Cleanup:** Improved connection cleanup with double-release prevention and comprehensive event listeners
- **Streamlined Server Configuration:** Simplified middleware stack with direct route mounting

#### Service Layer Architecture
- **Static Method Migration:** All service classes converted to static utility pattern for better performance
- **Object Parameter Pattern:** Service methods now accept structured object parameters for improved maintainability
- **Enhanced Query Patterns:** Implemented conditional field inclusion and JSON aggregation for complex data structures
- **Role System Integration:** Added comprehensive user-role relationship handling with lookup table joins

#### Developer Experience
- **Terminal Output Enhancement:** Vite-style colored and clickable API documentation URLs in server startup
- **Improved Error Messages:** More descriptive error handling with structured error propagation
- **Consistent Response Format:** Standardized error responses with optional development stack traces
