# Development Guidelines

Comprehensive development guidelines and best practices for the TeamOrbit backend.

## 🎯 Development Principles

### 1. Code Quality

- **TypeScript First:** Use TypeScript for all new code
- **Type Safety:** Define interfaces for all data structures
- **Error Handling:** Comprehensive error handling and logging
- **Code Reviews:** All code must be reviewed before merging

### 2. Architecture Patterns

- **Layered Architecture:** Controllers → Services → Database Layer
- **Static Service Pattern:** Services use static methods for utility-style operations
- **Object Parameter Pattern:** Methods accept structured object parameters for clarity
- **Single Responsibility:** Each module has one reason to change
- **Centralized Error Handling:** Global error middleware with structured error propagation

### 3. Testing Strategy

- **Unit Tests:** Test individual functions and methods
- **Integration Tests:** Test component interactions
- **E2E Tests:** Test complete user workflows
- **Test Coverage:** Maintain high test coverage

## 🏗️ Project Structure

### Directory Organization

```
src/
├── config/              # Configuration files
├── controllers/         # HTTP request handlers
├── services/            # Business logic layer
├── middleware/          # Express middleware
├── routes/              # API route definitions
├── schemas/             # Zod validation schemas
├── database/            # Database layer
│   ├── db.ts           # Database connection
│   ├── migrate.ts      # Migration system
│   ├── repositories/   # Data access layer
│   └── seed/           # Database seeding
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── openApiDocs/         # OpenAPI documentation system
│   ├── openApiRoutes.ts          # Swagger UI routes
│   ├── openAPIDocumentGenerator.ts # Document generation utilities
│   └── serviceResponse.ts        # Service response schemas
└── server.ts            # Application entry point
```

### File Naming Conventions

- **Controllers:** `*.controller.ts` (e.g., `user.controller.ts`)
- **Services:** `*.service.ts` (e.g., `user.service.ts`)
- **Routes:** `*.routes.ts` (e.g., `user.routes.ts`)
- **Schemas:** `*.schema.ts` (e.g., `user.schema.ts`)
- **Types:** `*.types.ts` or `*.d.ts` (e.g., `user.types.ts`)
- **Utils:** `*.utils.ts` (e.g., `validation.utils.ts`)

## 🔧 Development Workflow

### 1. Setting Up Development Environment

```bash
# Clone repository
git clone <repository-url>
cd teamorbit/backend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Set up database
npm run migrate
npm run seed

# Start development server
npm run dev
```

### 2. Daily Development Workflow

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/new-feature

# Make changes and test
npm run dev
npm test

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 3. Code Quality Checks

```bash
# Type checking
npx tsc --noEmit

# Linting (when configured)
npm run lint

# Testing
npm test

# Build verification
npm run build
```

## 📝 Coding Standards

### TypeScript Guidelines

#### Interface Definitions

```typescript
// Define clear interfaces for all data structures
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

interface CreateUserDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  email?: string;
}
```

#### Type Safety

```typescript
// Use strict typing
const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await userRepository.findById(id);
    return user;
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
};

// Use type guards
const isUser = (obj: any): obj is User => {
  return obj && typeof obj.id === 'number' && typeof obj.email === 'string';
};
```

#### Error Handling

```typescript
// Custom error classes
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Error handling in services
export const userService = {
  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      // Validate input
      if (!userData.email || !userData.password) {
        throw new ValidationError('Email and password are required', 'email');
      }

      // Check if user exists
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new ValidationError('User already exists', 'email');
      }

      // Create user
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await userRepository.create({
        ...userData,
        password: hashedPassword,
      });

      return user;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      logger.error('Error creating user:', error);
      throw new DatabaseError('Failed to create user', error as Error);
    }
  },
};
```

### Controller Patterns

#### Standard Controller Structure (Updated)

```typescript
// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';

export const userController = {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users
      });
    } catch (error) {
      next(error); // Pass to global error handler
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error); // Pass to global error handler
    }
  },

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = req.body;
      const user = await userService.createUser(userData);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      next(error); // Pass to global error handler
    }
  },
};
```

#### Request Validation

```typescript
// Use Zod schemas for validation
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
});

export const createUser = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Validate request body
    const validatedData = createUserSchema.parse(req.body);

    const user = await userService.createUser(validatedData);
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.errors,
      });
    }
    next(error); // Pass other errors to global handler
  }
};
```

### Service Layer Patterns

#### Service Structure

```typescript
// src/services/user.service.ts
import { userRepository } from '../database/repositories/user.repository';
import { logger } from '../utils/logger';

export const userService = {
  async getAllUsers(): Promise<User[]> {
    try {
      return await userRepository.findAll();
    } catch (error) {
      logger.error('Error fetching all users:', error);
      throw new Error('Failed to fetch users');
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }

      return await userRepository.findById(id);
    } catch (error) {
      logger.error('Error fetching user by ID:', error);
      throw new Error('Failed to fetch user');
    }
  },

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      // Business logic validation
      if (userData.email.includes('admin')) {
        throw new Error('Admin emails not allowed');
      }

      // Check if user exists
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await userRepository.create({
        ...userData,
        password: hashedPassword,
      });

      logger.info('User created successfully:', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  },
};
```

### Repository Patterns

#### Repository Structure

```typescript
// src/database/repositories/user.repository.ts
import { db } from '../db';
import { User, CreateUserDto, UpdateUserDto } from '../../types/user.types';

export const userRepository = {
  async findAll(): Promise<User[]> {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE is_active = true'
      );
      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch users from database');
    }
  },

  async findById(id: string): Promise<User | null> {
    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Failed to fetch user from database');
    }
  },

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [
        email,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Failed to fetch user by email from database');
    }
  },

  async create(userData: CreateUserDto): Promise<User> {
    try {
      const { email, password, first_name, last_name } = userData;
      const result = await db.query(
        'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, password, first_name, last_name]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to create user in database');
    }
  },

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    try {
      const fields = Object.keys(userData);
      const values = Object.values(userData);
      const setClause = fields
        .map((field, index) => `${field} = $${index + 2}`)
        .join(', ');

      const result = await db.query(
        `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to update user in database');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.query('UPDATE users SET is_active = false WHERE id = $1', [id]);
    } catch (error) {
      throw new Error('Failed to delete user from database');
    }
  },
};
```

## 🧪 Testing Guidelines

### Unit Testing

```typescript
// tests/unit/services/user.service.test.ts
import { userService } from '../../../src/services/user.service';
import { userRepository } from '../../../src/database/repositories/user.repository';

// Mock the repository
jest.mock('../../../src/database/repositories/user.repository');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById('1');

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should return null when user not found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await userService.getUserById('999');

      expect(result).toBeNull();
    });
  });
});
```

### Integration Testing

```typescript
// tests/integration/api/users.test.ts
import request from 'supertest';
import app from '../../../src/server';

describe('Users API', () => {
  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const response = await request(app).get('/api/users').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
    });
  });
});
```

## 🔒 Security Best Practices

### Input Validation

```typescript
// Use Zod for schema validation
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
});

// Validate all inputs
const validatedData = userSchema.parse(req.body);
```

### Password Security

```typescript
// Hash passwords with bcrypt
import bcrypt from 'bcryptjs';

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
```

### SQL Injection Prevention

```typescript
// Always use parameterized queries
const getUserById = async (id: string) => {
  // ✅ Good - parameterized query
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);

  // ❌ Bad - string concatenation
  // const result = await db.query(`SELECT * FROM users WHERE id = ${id}`)

  return result.rows[0];
};
```

## 📊 Logging and Monitoring

### Structured Logging

```typescript
// src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;
```

### Logging Best Practices

```typescript
// Log important events
logger.info('User created successfully', {
  userId: user.id,
  email: user.email,
});

// Log errors with context
logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  database: process.env.DB_NAME,
});

// Log API requests
logger.info('API request', {
  method: req.method,
  url: req.url,
  userAgent: req.get('User-Agent'),
  ip: req.ip,
});
```

## 🚀 Performance Optimization

### Database Optimization

```typescript
// Use connection pooling
const pool = new Pool({
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Use prepared statements
const getUserById = pool.query('SELECT * FROM users WHERE id = $1');

// Implement pagination
const getUsers = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  const result = await db.query(
    'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return result.rows;
};
```

### Memory Management

```typescript
// Avoid memory leaks
const processLargeDataset = async () => {
  const stream = db.query('SELECT * FROM large_table');

  for await (const row of stream) {
    // Process row
    processRow(row);

    // Don't accumulate in memory
    // Process and release
  }
};
```

## 🏗️ New Architecture Patterns

### Class-based Services

The TeamOrbit backend has migrated to class-based services for better organization:

```typescript
// src/services/lookup.service.ts
export default class Lookup {
  constructor(reqObj: any) {}

  static async retrieveLookupList(): Promise<LookupType[]> {
    const queryString = `
      SELECT 
        lt.id AS "lookupTypeId",
        lt.name AS "lookupTypeName",
        l.id AS "lookupId",
        l.label AS "lookupLabel"
      FROM lookup_type lt
      LEFT JOIN lookup l ON lt.id = l."lookupTypeId"
    `;

    const results = (await mainPool.query(queryString)).rows;
    // Process and return grouped data...
    return groupedData;
  }
}
```

### Database Client Middleware

Automatic database connection injection:

```typescript
// Request object gets enhanced with database connections
interface Request {
  db: {
    mainPool: PoolClient;
    tenantPool?: PoolClient;
  }
}

// Usage in controllers
export const getLookupList = async (req: Request, res: Response) => {
  const results = await req.db.mainPool.query('SELECT * FROM lookup_type');
  res.success(results.rows);
};
```

### Migration System (Class-based)

```typescript
export class MigrationManager {
  private currentDir: string;
  private dbClient: any;

  async runMigrationForSchema(schemaName: string = 'main'): Promise<void> {
    await this.initializeClient();
    await this.setupSchema(schemaName);
    
    const allMigrations = await this.getMigrationFiles(schemaName);
    const applied = await this.getAppliedMigrations();
    
    // Run pending migrations...
  }
}
```

### ServiceResponse Pattern

Standardized service responses using the ServiceResponse class:

```typescript
// src/openApiDocs/serviceResponse.ts
import { ServiceResponse } from '../openApiDocs/serviceResponse';
import { StatusCodes } from 'http-status-codes';

// In service layer
export class UserService {
  static async getAllUsers(): Promise<ServiceResponse> {
    try {
      const users = await userRepository.findAll();
      return ServiceResponse.success(
        'Users retrieved successfully',
        users,
        StatusCodes.OK
      );
    } catch (error) {
      return ServiceResponse.failure(
        'Failed to retrieve users',
        { error: error.message },
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

// In controller layer
export const getUsers = async (req: Request, res: Response) => {
  const serviceResponse = await UserService.getAllUsers();
  
  res.status(serviceResponse.statusCode).json({
    success: serviceResponse.success,
    message: serviceResponse.message,
    data: serviceResponse.responseObject,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};
```

### Modern Controller Patterns (Updated)

Direct response handling without middleware extensions:

```typescript
// Modern controller pattern
export const getUsers = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const serviceResponse = await UserService.getAllUsers();
    
    if (serviceResponse.success) {
      res.status(serviceResponse.statusCode).json({
        success: true,
        message: serviceResponse.message,
        data: serviceResponse.responseObject
      });
    } else {
      res.status(serviceResponse.statusCode).json({
        message: serviceResponse.message
      });
    }
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

// Simplified pattern for basic operations
export const getUserById = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
```

## 🔧 Development Best Practices (Updated)

### 1. Service Layer Patterns

Use class-based services for better organization:

```typescript
export default class UserService {
  static async getAllUsers(): Promise<User[]> {
    // Implementation
  }

  static async getUserById(id: string): Promise<User | null> {
    // Implementation
  }
}
```

### 2. Database Access Patterns

Leverage the database middleware with proper error handling:

```typescript
export const getUserById = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Use injected database connection
    const result = await req.db.mainPool.query(
      'SELECT * FROM app_user WHERE id = $1', 
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};
```

### 3. Error Handling Patterns (Updated)

Use centralized error handling with proper error classes:

```typescript
// Custom error classes
export class HttpError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

// Usage in services
if (!user) {
  throw new HttpError('User not found', 404);
}

// Controller pattern - pass errors to global handler
export const getUser = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      throw new HttpError('User not found', 404);
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error); // Global error handler will process this
  }
};
```

### 4. OpenAPI Documentation Patterns

Document endpoints using the OpenAPI system:

```typescript
// src/routes/user.routes.ts
import { commonDocCreator, bearerAuth } from '../openApiDocs/openAPIDocumentGenerator';
import { ServiceResponseSchema } from '../openApiDocs/serviceResponse';

// Define schemas
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1)
});

const userResponseSchema = ServiceResponseSchema(z.object({
  id: z.number(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
}));

// Document the endpoint
commonDocCreator({
  routePath: '/api/users',
  method: 'post',
  tags: ['User Management'],
  requestSchema: {
    bodySchema: createUserSchema,
    description: 'Create a new user account',
  },
  responseSchemas: [
    {
      schema: userResponseSchema,
      description: 'User created successfully',
      statusCode: 201,
    },
    {
      schema: ServiceResponseSchema(z.object({ error: z.string() })),
      description: 'Validation failed',
      statusCode: 400,
    },
  ],
  security: [{ [bearerAuth.name]: [] }],
});

// Apply validation and define route
router.post('/users', 
  validateRequest(createUserSchema), 
  createUser
);
```

### 5. Validation Patterns

Use Zod schemas with middleware:

```typescript
// Define schema with OpenAPI metadata
const createUserSchema = z.object({
  email: z.string().email().openapi({ 
    description: 'User email address',
    example: 'user@example.com' 
  }),
  password: z.string().min(8).openapi({ 
    description: 'User password (minimum 8 characters)',
    example: 'password123' 
  }),
  first_name: z.string().min(1).openapi({ 
    description: 'User first name',
    example: 'John' 
  }),
  last_name: z.string().min(1).openapi({ 
    description: 'User last name',
    example: 'Doe' 
  }),
});

// Apply to routes
router.post('/users', 
  validateRequest(createUserSchema), 
  createUser
);
```

## 🧪 Testing Patterns (Updated)

### Testing Class-based Services

```typescript
describe('Lookup Service', () => {
  describe('retrieveLookupList', () => {
    it('should return grouped lookup data', async () => {
      // Mock database response
      const mockResults = [
        { lookupTypeId: 1, lookupTypeName: 'userRole', lookupId: 1, lookupLabel: 'Admin' }
      ];
      
      jest.spyOn(db, 'query').mockResolvedValue({ rows: mockResults });
      
      const result = await Lookup.retrieveLookupList();
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('userRole');
      expect(result[0].lookups).toHaveLength(1);
    });
  });
});
```

### Testing Middleware

```typescript
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

## 📚 Additional Resources

- [🏗️ Middleware Architecture](../architecture/MIDDLEWARE.md) - Comprehensive middleware documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript best practices
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html) - Express optimization
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/) - Security guidelines
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/performance-tips.html) - Database optimization
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices) - Testing strategies
