# Quick Reference Guide

Quick commands and common tasks for the TeamOrbit backend project.

## 🚀 Common Commands

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Clean build directory
npm run clean
```

### Database

```bash
# Run migrations
npm run migrate

# Seed database
npm run seed

# Reset database (migrate + seed)
npm run migrate && npm run seed
```

### Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 🔄 Recent Updates (TypeScript Authentication)

### AuthenticatedRequest Interface

```typescript
// Import the interface
import { AuthenticatedRequest } from '../middleware/authRoleMiddleware';

// Use in controller functions
export const getUserProfile = async (
  req: AuthenticatedRequest, // Instead of Request
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.userId; // Type-safe access
  const userRoles = req.user?.userRoles; // Array of role objects
  // ... rest of controller logic
};
```

### JWT Token Payload

```typescript
interface JwtTokenPayload {
  userId: number;
  email: string;
  userRoles: Array<{
    id: number;
    label: string;
    lookupTypeId: number;
  }>;
}
```

### Route Protection Examples

```typescript
// Authentication only
registrar.get('/profile', {
  middleware: [authRoleMiddleware()],
  controller: getUserProfile,
});

// Role-specific access
registrar.get('/admin/users', {
  middleware: [authRoleMiddleware('admin', 'superadmin')],
  controller: getAllUsers,
});
```

## 🏗️ Current Project Structure

```
backend/
├── docs/                    # Comprehensive documentation
│   ├── api/                # API documentation
│   ├── architecture/       # System architecture docs
│   ├── development/        # Development guidelines
│   ├── deployment/         # Deployment guides
│   └── setup/              # Setup instructions
├── src/                    # Source code
│   ├── config/             # Environment configuration
│   ├── controllers/        # HTTP request handlers
│   ├── services/           # Business logic layer
│   ├── middleware/         # Express middleware stack
│   ├── routes/             # API route definitions
│   ├── schemas/            # Zod validation schemas
│   ├── database/           # Database layer
│   │   ├── db.ts           # Connection pooling
│   │   ├── dbMigrate.ts    # Migration entry point
│   │   ├── dbMigrationManager.ts # Advanced migration management
│   │   ├── migrations/     # Schema migrations (main/tenant)
│   │   └── seed/           # Database seeding
│   ├── utils/              # Utility functions
│   ├── openApiSpecification/ # API documentation
│   └── server.ts           # Application entry point
├── dist/                   # Compiled JavaScript (auto-generated)
├── node_modules/           # Dependencies (auto-generated)
├── env.example             # Environment variables template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project overview

## 🎯 API Endpoints

### Authentication

```bash
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/profile
```

### Users

```bash
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Chat

```bash
GET  /api/chat/messages
POST /api/chat/messages
GET  /api/chat/channels
```

### System

```bash
GET /health         # Health check endpoint (replaces /test)
GET /docs           # API documentation
```

## 🔧 Environment Variables

### Required

```env
# Server
API_PORT=5100
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=teamorbit
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

### Optional

```env
# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

## 🎨 Code Patterns

### Controller Pattern (Updated)

```typescript
// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';

export const getUserById = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await userService.findById(id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};
```

### Service Pattern

```typescript
// src/services/user.service.ts
import { userRepository } from '../database/repositories/user.repository';

export const userService = {
  async findById(id: string) {
    return await userRepository.findById(id);
  },

  async create(userData: CreateUserDto) {
    return await userRepository.create(userData);
  },
};
```

### Route Pattern

```typescript
// src/routes/user.routes.ts
import { Router } from 'express';
import { getUserById, createUser } from '../controllers/user.controller';

const router = Router();

router.get('/:id', getUserById);
router.post('/', createUser);

export default router;
```

### Middleware Pattern

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};
```

## 🗄️ Database Operations

### Migration

```typescript
// src/database/migrations/001_create_users.ts
import { Migration } from '../migrate';

export const up = async (migration: Migration) => {
  await migration.createTable('users', {
    id: 'SERIAL PRIMARY KEY',
    email: 'VARCHAR(255) UNIQUE NOT NULL',
    password: 'VARCHAR(255) NOT NULL',
    created_at: 'TIMESTAMP DEFAULT NOW()',
  });
};

export const down = async (migration: Migration) => {
  await migration.dropTable('users');
};
```

### Repository Pattern

```typescript
// src/database/repositories/user.repository.ts
import { db } from '../db';

export const userRepository = {
  async findById(id: string) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create(userData: CreateUserDto) {
    const { email, password } = userData;
    const result = await db.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
      [email, password]
    );
    return result.rows[0];
  },
};
```

## 🔍 Common Issues

### Database Connection

```bash
# Check PostgreSQL is running
pg_ctl status

# Check database exists
psql -U postgres -l

# Test connection
psql -U postgres -d teamorbit -c "SELECT 1"
```

### Port Already in Use

```bash
# Find process using port 5100
lsof -i :5100

# Kill process
kill -9 <PID>
```

### TypeScript Errors

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Clean and rebuild
npm run clean && npm run build
```

## 📚 Documentation Links

- [Complete Setup Guide](./setup/SETUP.md)
- [Development Guidelines](./development/DEVELOPMENT.md)
- [API Documentation](./api/API.md)
- [Architecture Guide](./architecture/ARCHITECTURE.md)
- [Database Schema](./api/DATABASE.md)
- [Deployment Guide](./deployment/DEPLOYMENT.md)

## 🚀 Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 12+ installed and running
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] Development server running (`npm run dev`)
- [ ] API documentation accessible at `/docs`
- [ ] Health check working at `/health`

## 💡 Tips

1. **Use TypeScript** - Define interfaces for all data structures
2. **Follow patterns** - Controller → Service → Repository
3. **Validate input** - Use Zod schemas for validation
4. **Handle errors** - Use try-catch and error middleware
5. **Log everything** - Use structured logging
6. **Test APIs** - Use Postman or similar tools
7. **Document changes** - Update API docs when adding endpoints
8. **Use migrations** - Never modify database schema directly
