# Controllers Directory

This directory contains all HTTP request handlers for the TeamOrbit backend API.

## 📁 Structure

```
src/controllers/
├── authController.ts     # Authentication endpoints
├── userController.ts     # User management endpoints
├── chatController.ts     # Chat functionality endpoints
└── docs/                 # Controller-specific documentation
    ├── README.md
    └── PATTERNS.md
```

## 🎯 Controller Responsibilities

Controllers handle HTTP requests and responses, acting as the interface between the API routes and the business logic layer.

### Key Responsibilities

- **Request Handling** - Process incoming HTTP requests
- **Validation** - Validate request parameters and body
- **Service Calls** - Call appropriate service methods
- **Response Formatting** - Format and send HTTP responses
- **Error Handling** - Handle and format errors

## 🚀 Usage

### Importing Controllers

```typescript
// Import individual controllers
import { authController } from './authController';
import { userController } from './userController';
import { chatController } from './chatController';

// Use in routes
app.use('/api/auth', authController);
app.use('/api/users', userController);
app.use('/api/chat', chatController);
```

### Controller Pattern

```typescript
// Standard controller structure
export const exampleController = {
  async getItems(req: Request, res: Response) {
    try {
      const items = await exampleService.getAllItems();
      res.success(items);
    } catch (error) {
      logger.error('Error fetching items:', error);
      res.error(error);
    }
  },

  async getItemById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await exampleService.getItemById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: { message: 'Item not found' },
        });
      }

      res.success(item);
    } catch (error) {
      logger.error('Error fetching item:', error);
      res.error(error);
    }
  },
};
```

## 🔧 Controller Guidelines

### 1. Error Handling

- Always wrap service calls in try-catch blocks
- Log errors with appropriate context
- Return consistent error responses
- Handle different error types appropriately

### 2. Validation

- Validate request parameters
- Use Zod schemas for request body validation
- Return validation errors with clear messages
- Sanitize input data

### 3. Response Formatting

- Use consistent response format
- Include appropriate HTTP status codes
- Provide meaningful error messages
- Handle success and error cases uniformly

### 4. Logging

- Log important events and errors
- Include relevant context in logs
- Use structured logging format
- Avoid logging sensitive information

## 📚 Documentation

- [Controller Patterns](./docs/PATTERNS.md) - Common patterns and examples
- [Error Handling](./docs/ERROR_HANDLING.md) - Error handling strategies
- [Validation](./docs/VALIDATION.md) - Input validation patterns

## 🔧 Adding New Controllers

### 1. Create Controller File

```typescript
// src/controllers/exampleController.ts
import { Request, Response } from 'express';
import { exampleService } from '../services/exampleService';
import { logger } from '../utils/logger';

export const exampleController = {
  // Controller methods here
};
```

### 2. Add to Routes

```typescript
// src/routes/exampleRoutes.ts
import { Router } from 'express';
import { exampleController } from '../controllers/exampleController';

const router = Router();

router.get('/', exampleController.getItems);
router.get('/:id', exampleController.getItemById);

export default router;
```

### 3. Register Routes

```typescript
// src/routes/routes.ts
import exampleRoutes from './exampleRoutes';

app.use('/api/example', exampleRoutes);
```

## 🎨 Best Practices

### 1. Single Responsibility

- Each controller should handle one resource
- Keep controllers focused and cohesive
- Avoid business logic in controllers

### 2. Consistent Naming

- Use descriptive method names
- Follow RESTful conventions
- Use consistent parameter names

### 3. Type Safety

- Use TypeScript interfaces for request/response types
- Define clear parameter types
- Use type guards where appropriate

### 4. Documentation

- Document all controller methods
- Include parameter descriptions
- Provide usage examples
- Update documentation when changing APIs
