# OpenAPI Documentation System

Comprehensive guide to the OpenAPI documentation system in the TeamOrbit backend.

## 🏗️ OpenAPI Architecture

The TeamOrbit backend uses a sophisticated OpenAPI documentation system built with Zod schemas and automatic generation capabilities, located in the `src/openApiDocs/` directory.

### Directory Structure

```
src/openApiDocs/
├── openApiRoutes.ts           # Swagger UI routes and JSON endpoint
├── openAPIDocumentGenerator.ts # Document generation utilities and registry
└── serviceResponse.ts         # Service response class and schemas
```

## 📁 File Overview

### openApiRoutes.ts

Main router for serving OpenAPI documentation:

```typescript
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateOpenAPIDocument } from './openAPIDocumentGenerator';

export const openAPIRouter = express.Router();
const openAPIDocument = generateOpenAPIDocument();

// JSON specification endpoint
openAPIRouter.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(openAPIDocument);
});

// Swagger UI interface
openAPIRouter.use('/', swaggerUi.serve, swaggerUi.setup(openAPIDocument));
```

**Features:**
- **JSON Endpoint:** `/docs/swagger.json` - Raw OpenAPI specification
- **Swagger UI:** `/docs` - Interactive documentation interface
- **Auto-generation:** Documentation generated from Zod schemas

### openAPIDocumentGenerator.ts

Core utilities for generating OpenAPI documentation:

```typescript
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';

// Global registry for all API components
export const docRegistry = new OpenAPIRegistry();

// Bearer token authentication scheme
export const bearerAuth = docRegistry.registerComponent(
  'securitySchemes',
  'bearerAuth',
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  }
);
```

**Key Functions:**

#### createApiResponse
```typescript
export function createApiResponse(
  schema: any,
  description: string,
  statusCode: number = StatusCodes.OK
) {
  return {
    [statusCode]: {
      description,
      content: {
        'application/json': {
          schema: schema,
        },
      },
    },
  };
}
```

#### createApiResponses
```typescript
export function createApiResponses(configs: ApiResponseConfig[]) {
  const responses: Record<string, any> = {};
  configs.forEach(({ schema, description, statusCode }) => {
    if (statusCode !== undefined) {
      responses[statusCode] = {
        description,
        content: {
          'application/json': {
            schema: schema,
          },
        },
      };
    }
  });
  return responses;
}
```

#### commonDocCreator
The main function for documenting API endpoints:

```typescript
export const commonDocCreator = ({
  routePath,
  method,
  tags,
  requestSchema,
  responseSchemas = [],
  security,
}: CommonDocCreatorConfig): void => {
  // Registers complete route documentation with the OpenAPI registry
  docRegistry.registerPath({
    method,
    path: routePath,
    tags,
    request: {
      params: requestSchema?.paramsSchema ? z.object(requestSchema.paramsSchema) : undefined,
      body: requestSchema?.bodySchema ? {
        description: requestSchema.description || 'Request body',
        content: {
          'application/json': { schema: requestSchema.bodySchema },
        },
      } : undefined,
      query: requestSchema?.querySchema,
    },
    responses: /* generated from responseSchemas */,
    security,
  });
};
```

### serviceResponse.ts

Service response class and schema definitions:

```typescript
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export class ServiceResponse {
  public success: boolean;
  public message: string;
  public responseObject: any;
  public statusCode: number;

  constructor(
    success: boolean,
    message: string,
    responseObject: any,
    statusCode: number
  ) {
    this.success = success;
    this.message = message;
    this.responseObject = responseObject;
    this.statusCode = statusCode;
  }

  static success(
    message: string,
    responseObject: any,
    statusCode: number = StatusCodes.OK
  ): ServiceResponse {
    return new ServiceResponse(true, message, responseObject, statusCode);
  }

  static failure(
    message: string,
    responseObject: any,
    statusCode: number = StatusCodes.BAD_REQUEST
  ): ServiceResponse {
    return new ServiceResponse(false, message, responseObject, statusCode);
  }
}

// Zod schema for ServiceResponse
export const ServiceResponseSchema = (dataSchema: z.ZodSchema) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    responseObject: dataSchema.optional(),
    statusCode: z.number(),
  });
```

## 🔧 Usage Examples

### Basic Route Documentation

```typescript
// In your route file (e.g., user.routes.ts)
import { commonDocCreator, bearerAuth } from '../openApiDocs/openAPIDocumentGenerator';
import { createUserSchema, userResponseSchema } from '../schemas/user.schema';

// Document the route
commonDocCreator({
  routePath: '/api/users',
  method: 'post',
  tags: ['Users'],
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
  ],
  security: [{ [bearerAuth.name]: [] }],
});

// Define the actual route
router.post('/users', validateRequest(createUserSchema), createUser);
```

### Using ServiceResponse

```typescript
// In your service layer
import { ServiceResponse } from '../openApiDocs/serviceResponse';

export class UserService {
  static async createUser(userData: CreateUserDto): Promise<ServiceResponse> {
    try {
      const user = await userRepository.create(userData);
      return ServiceResponse.success(
        'User created successfully',
        user,
        StatusCodes.CREATED
      );
    } catch (error) {
      return ServiceResponse.failure(
        'Failed to create user',
        { error: error.message },
        StatusCodes.BAD_REQUEST
      );
    }
  }
}

// In your controller
export const createUser = async (req: Request, res: Response) => {
  const serviceResponse = await UserService.createUser(req.body);
  
  res.status(serviceResponse.statusCode).json({
    success: serviceResponse.success,
    message: serviceResponse.message,
    data: serviceResponse.responseObject,
  });
};
```

### Query Parameter Documentation

```typescript
import { z } from 'zod';

const getUsersQuerySchema = z.object({
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
  search: z.string().optional(),
});

commonDocCreator({
  routePath: '/api/users',
  method: 'get',
  tags: ['Users'],
  requestSchema: {
    querySchema: getUsersQuerySchema,
    description: 'Get users with optional pagination and search',
  },
  responseSchemas: [
    {
      schema: ServiceResponseSchema(z.array(userSchema)),
      description: 'List of users retrieved successfully',
      statusCode: 200,
    },
  ],
  security: [{ [bearerAuth.name]: [] }],
});
```

### Path Parameter Documentation

```typescript
const getUserParamsSchema = {
  id: z.string().regex(/^\d+$/).transform(Number),
};

commonDocCreator({
  routePath: '/api/users/{id}',
  method: 'get',
  tags: ['Users'],
  requestSchema: {
    paramsSchema: getUserParamsSchema,
    description: 'Get user by ID',
  },
  responseSchemas: [
    {
      schema: ServiceResponseSchema(userSchema),
      description: 'User retrieved successfully',
      statusCode: 200,
    },
    {
      schema: ServiceResponseSchema(z.object({ error: z.string() })),
      description: 'User not found',
      statusCode: 404,
    },
  ],
  security: [{ [bearerAuth.name]: [] }],
});
```

## 🔒 Authentication Documentation

### Bearer Token Setup

The bearer authentication is already configured in the document generator:

```typescript
export const bearerAuth = docRegistry.registerComponent(
  'securitySchemes',
  'bearerAuth',
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  }
);

// Usage in route documentation
security: [{ [bearerAuth.name]: [] }]
```

### Public Endpoints

For public endpoints, simply omit the security parameter:

```typescript
commonDocCreator({
  routePath: '/health',
  method: 'get',
  tags: ['System'],
  responseSchemas: [
    {
      schema: ServiceResponseSchema(z.object({
        status: z.string(),
        timestamp: z.string(),
      })),
      description: 'Health check status',
      statusCode: 200,
    },
  ],
  // No security parameter = public endpoint
});
```

## 📊 Schema Integration

### Zod Schema Extension

```typescript
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Enable OpenAPI extensions for Zod (already done in generator)
extendZodWithOpenApi(z);

// Enhanced schema with OpenAPI metadata
const userSchema = z.object({
  id: z.number().openapi({ 
    description: 'Unique user identifier',
    example: 1 
  }),
  email: z.string().email().openapi({ 
    description: 'User email address',
    example: 'user@example.com' 
  }),
  first_name: z.string().openapi({ 
    description: 'User first name',
    example: 'John' 
  }),
  last_name: z.string().openapi({ 
    description: 'User last name',
    example: 'Doe' 
  }),
});
```

## 🌐 API Endpoints

### Documentation Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/docs` | GET | Interactive Swagger UI |
| `/docs/swagger.json` | GET | Raw OpenAPI JSON specification |

### Features

- **Interactive Testing:** Test API endpoints directly from the documentation
- **Schema Validation:** Real-time request/response validation
- **Authentication:** Built-in JWT token management in Swagger UI
- **Export Options:** Download OpenAPI specification
- **Code Generation:** Generate client SDKs from specification

## 🔧 Configuration

### Document Generation

```typescript
export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(docRegistry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'TeamOrbit API',
      description: 'Comprehensive API for the TeamOrbit application',
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5100',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    externalDocs: {
      description: 'View the raw OpenAPI Specification in JSON format',
      url: '/docs/swagger.json',
    },
  });
}
```

### Server Integration

```typescript
// server.ts
import openApiRoutes from './openApiDocs/openApiRoutes';

// Mount OpenAPI documentation
app.use('/docs', openApiRoutes);
```

## 🧪 Testing with OpenAPI

### Automated Testing

```typescript
// tests/openapi/openapi.test.ts
import { generateOpenAPIDocument } from '../../src/openApiDocs/openAPIDocumentGenerator';
import { ServiceResponse } from '../../src/openApiDocs/serviceResponse';

describe('OpenAPI Documentation', () => {
  it('should generate valid OpenAPI document', () => {
    const document = generateOpenAPIDocument();
    
    expect(document).toBeDefined();
    expect(document.openapi).toBe('3.0.0');
    expect(document.info).toBeDefined();
    expect(document.paths).toBeDefined();
  });

  it('should include bearer authentication', () => {
    const document = generateOpenAPIDocument();
    
    expect(document.components?.securitySchemes?.bearerAuth).toBeDefined();
    expect(document.components?.securitySchemes?.bearerAuth.type).toBe('http');
  });
});

describe('ServiceResponse', () => {
  it('should create success response', () => {
    const response = ServiceResponse.success('Test message', { data: 'test' }, 200);
    
    expect(response.success).toBe(true);
    expect(response.message).toBe('Test message');
    expect(response.responseObject).toEqual({ data: 'test' });
    expect(response.statusCode).toBe(200);
  });

  it('should create failure response', () => {
    const response = ServiceResponse.failure('Error message', { error: 'test' }, 400);
    
    expect(response.success).toBe(false);
    expect(response.message).toBe('Error message');
    expect(response.responseObject).toEqual({ error: 'test' });
    expect(response.statusCode).toBe(400);
  });
});
```

## 📚 Best Practices

### 1. Consistent Response Format

Use ServiceResponse class for standardized responses:

```typescript
// Service layer
return ServiceResponse.success('Operation completed', data);

// Controller layer
const serviceResponse = await someService.operation();
res.status(serviceResponse.statusCode).json({
  success: serviceResponse.success,
  message: serviceResponse.message,
  data: serviceResponse.responseObject,
});
```

### 2. Schema Organization

```typescript
// Group related schemas
const userSchemas = {
  createUser: z.object({ /* ... */ }),
  updateUser: z.object({ /* ... */ }),
  userResponse: z.object({ /* ... */ }),
};

// Use ServiceResponseSchema wrapper
const userResponseSchema = ServiceResponseSchema(userSchemas.userResponse);
```

### 3. Comprehensive Error Documentation

```typescript
responseSchemas: [
  {
    schema: ServiceResponseSchema(successDataSchema),
    description: 'Success',
    statusCode: 200,
  },
  {
    schema: ServiceResponseSchema(z.object({ error: z.string() })),
    description: 'Validation failed',
    statusCode: 400,
  },
  {
    schema: ServiceResponseSchema(z.object({ error: z.string() })),
    description: 'Unauthorized',
    statusCode: 401,
  },
  {
    schema: ServiceResponseSchema(z.object({ error: z.string() })),
    description: 'Forbidden',
    statusCode: 403,
  },
  {
    schema: ServiceResponseSchema(z.object({ error: z.string() })),
    description: 'Resource not found',
    statusCode: 404,
  },
]
```

### 4. Tag Organization

```typescript
// Use consistent tags for grouping
const API_TAGS = {
  AUTH: 'Authentication',
  USERS: 'User Management',
  LOOKUP: 'Lookup Data',
  SYSTEM: 'System',
} as const;

// Use in documentation
tags: [API_TAGS.USERS]
```

## 🚀 Advanced Features

### Custom Components

```typescript
// Register reusable components
docRegistry.registerComponent('schemas', 'PaginationMeta', z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
}));

// Use in responses
const paginatedResponseSchema = ServiceResponseSchema(z.object({
  data: z.array(userSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
}));
```

## 📖 Documentation Maintenance

### Keeping Documentation Current

1. **Schema-First Approach:** Define schemas before implementing endpoints
2. **Automated Validation:** Validate API responses against schemas in tests
3. **ServiceResponse Integration:** Use consistent response format
4. **Regular Reviews:** Review documentation during code reviews

### Documentation Checklist

- [ ] All endpoints documented with `commonDocCreator`
- [ ] Request/response schemas defined using ServiceResponse
- [ ] Authentication requirements specified
- [ ] Error responses documented
- [ ] Examples provided for complex schemas
- [ ] Tags assigned for organization
- [ ] OpenAPI document validates successfully

This OpenAPI system provides comprehensive, automatically generated documentation that stays in sync with your API implementation through Zod schema integration and the ServiceResponse pattern.
