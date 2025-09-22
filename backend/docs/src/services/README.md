# Services Directory

This directory contains all business logic services for the TeamOrbit backend application.

## 📁 Structure

```
src/services/
├── authService.ts        # Authentication business logic
├── userService.ts        # User management business logic
├── chatService.ts        # Chat functionality business logic
└── docs/                 # Service-specific documentation
    ├── README.md
    └── PATTERNS.md
```

## 🎯 Service Responsibilities

Services contain the core business logic of the application, acting as the bridge between controllers and the data layer.

### Key Responsibilities

- **Business Logic** - Implement application-specific business rules
- **Data Validation** - Validate business-level data constraints
- **Service Coordination** - Coordinate between multiple repositories
- **Error Handling** - Handle business-level errors
- **Logging** - Log business events and errors

## 🚀 Usage

### Importing Services

```typescript
// Import individual services
import { authService } from './authService';
import { userService } from './userService';
import { chatService } from './chatService';

// Use in controllers
const user = await userService.createUser(userData);
const token = await authService.generateToken(user);
```

### Service Pattern

```typescript
// Standard service structure
export const exampleService = {
  async getAllItems(): Promise<Item[]> {
    try {
      return await exampleRepository.findAll();
    } catch (error) {
      logger.error('Error fetching all items:', error);
      throw new Error('Failed to fetch items');
    }
  },

  async getItemById(id: string): Promise<Item | null> {
    try {
      if (!id) {
        throw new Error('Item ID is required');
      }

      return await exampleRepository.findById(id);
    } catch (error) {
      logger.error('Error fetching item by ID:', error);
      throw new Error('Failed to fetch item');
    }
  },

  async createItem(itemData: CreateItemDto): Promise<Item> {
    try {
      // Business logic validation
      if (itemData.name.includes('admin')) {
        throw new Error('Admin items not allowed');
      }

      // Check if item exists
      const existingItem = await exampleRepository.findByName(itemData.name);
      if (existingItem) {
        throw new Error('Item already exists');
      }

      // Create item
      const item = await exampleRepository.create(itemData);

      logger.info('Item created successfully:', { itemId: item.id });
      return item;
    } catch (error) {
      logger.error('Error creating item:', error);
      throw error;
    }
  },
};
```

## 🔧 Service Guidelines

### 1. Business Logic

- Implement all business rules in services
- Validate business-level constraints
- Handle complex business workflows
- Coordinate between multiple repositories

### 2. Error Handling

- Use custom error classes for business errors
- Log errors with appropriate context
- Provide meaningful error messages
- Handle different error scenarios

### 3. Data Validation

- Validate business-level data constraints
- Check for duplicate data
- Validate business rules
- Sanitize data before processing

### 4. Logging

- Log important business events
- Include relevant context in logs
- Use structured logging format
- Avoid logging sensitive information

## 📚 Documentation

- [Service Patterns](./docs/PATTERNS.md) - Common patterns and examples
- [Business Logic](./docs/BUSINESS_LOGIC.md) - Business rule implementation
- [Error Handling](./docs/ERROR_HANDLING.md) - Error handling strategies

## 🔧 Adding New Services

### 1. Create Service File

```typescript
// src/services/exampleService.ts
import { exampleRepository } from '../database/repositories/exampleRepository';
import { logger } from '../utils/logger';

export const exampleService = {
  // Service methods here
};
```

### 2. Define Service Interface

```typescript
// src/types/example.types.ts
export interface CreateExampleDto {
  name: string;
  description: string;
  category: string;
}

export interface UpdateExampleDto {
  name?: string;
  description?: string;
  category?: string;
}

export interface Example {
  id: number;
  name: string;
  description: string;
  category: string;
  created_at: Date;
  updated_at: Date;
}
```

### 3. Use in Controllers

```typescript
// src/controllers/exampleController.ts
import { exampleService } from '../services/exampleService';

export const exampleController = {
  async createExample(req: Request, res: Response) {
    try {
      const example = await exampleService.createExample(req.body);
      res.status(201).success(example);
    } catch (error) {
      res.error(error);
    }
  },
};
```

## 🎨 Best Practices

### 1. Single Responsibility

- Each service should handle one domain
- Keep services focused and cohesive
- Avoid mixing different business concerns

### 2. Dependency Injection

- Inject repositories into services
- Use interfaces for dependencies
- Make services testable

### 3. Error Handling

- Use custom error classes
- Provide meaningful error messages
- Handle different error scenarios
- Log errors appropriately

### 4. Business Logic

- Implement all business rules in services
- Validate business constraints
- Handle complex workflows
- Coordinate between repositories

### 5. Testing

- Write unit tests for services
- Mock dependencies
- Test business logic thoroughly
- Test error scenarios

## 🔍 Common Patterns

### 1. CRUD Operations

```typescript
export const exampleService = {
  async create(data: CreateDto): Promise<Entity> {
    // Validation
    // Business logic
    // Repository call
    // Logging
    // Return result
  },

  async findById(id: string): Promise<Entity | null> {
    // Validation
    // Repository call
    // Return result
  },

  async update(id: string, data: UpdateDto): Promise<Entity> {
    // Validation
    // Check existence
    // Business logic
    // Repository call
    // Logging
    // Return result
  },

  async delete(id: string): Promise<void> {
    // Validation
    // Check existence
    // Business logic
    // Repository call
    // Logging
  },
};
```

### 2. Business Validation

```typescript
export const exampleService = {
  async createExample(data: CreateExampleDto): Promise<Example> {
    // Validate business rules
    if (data.name.includes('admin')) {
      throw new Error('Admin examples not allowed');
    }

    // Check for duplicates
    const existing = await exampleRepository.findByName(data.name);
    if (existing) {
      throw new Error('Example already exists');
    }

    // Additional business logic
    if (data.category === 'premium' && !data.description) {
      throw new Error('Premium examples require description');
    }

    // Create example
    return await exampleRepository.create(data);
  },
};
```

### 3. Service Coordination

```typescript
export const exampleService = {
  async createExampleWithUser(
    data: CreateExampleDto,
    userId: string
  ): Promise<Example> {
    // Get user
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check user permissions
    if (user.role !== 'admin' && data.category === 'premium') {
      throw new Error('Insufficient permissions');
    }

    // Create example
    const example = await exampleRepository.create(data);

    // Log event
    await auditService.logEvent('example_created', {
      exampleId: example.id,
      userId: user.id,
    });

    return example;
  },
};
```
