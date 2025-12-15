# Architecture Overview

This document provides a comprehensive overview of the TeamOrbit backend architecture, design patterns, and system components.

## 🏗️ System Architecture

TeamOrbit follows a modern, layered architecture pattern designed for scalability, maintainability, and type safety.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Web App   │  │  Mobile App │  │  API Client │        │
│  │  (React)    │  │  (Future)   │  │  (Postman)  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Gateway Layer                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Express.js Server                          ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    ││
│  │  │   CORS      │  │   Helmet    │  │   Morgan    │    ││
│  │  │ Middleware  │  │ Security    │  │  Logging    │    ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Application Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Controllers │  │ Middleware  │  │RouteRegistrar│       │
│  │(TypeScript) │  │ (Advanced)  │  │ (AutoAPI)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Business Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Services  │  │  Utilities  │  │   Schemas   │        │
│  │ (Class-based│  │ (Helpers)   │  │   (Zod)     │        │
│  │  Static)    │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Multi-Schema │  │ PostgreSQL  │  │ Migration   │        │
│  │  Database   │  │  Database   │  │  Manager    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Design Principles

### 1. Separation of Concerns

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and data processing
- **Database Layer**: Manage data access and persistence
- **Middleware**: Handle cross-cutting concerns

### 2. Type Safety

- **TypeScript**: Full type coverage throughout the application
- **Zod Schemas**: Runtime type validation and schema definition
- **Interface Definitions**: Clear contracts between components

### 3. Multi-Tenant Architecture

- **Schema Isolation**: Separate database schemaAndTypes for tenant data
- **Connection Management**: Automatic database connection routing
- **Tenant-Aware Services**: Business logic that respects tenant boundaries

### 4. Security by Design

- **JWT Authentication**: Stateless, secure token-based authentication
- **Role-Based Access Control**: Granular permission system
- **Input Validation**: Comprehensive request validation with Zod
- **Security Headers**: Helmet.js for security headers

## 📁 Project Structure

```
backend/src/
├── config/                    # Configuration management
│   └── envVariable.ts         # Environment variable validation
├── controllers/               # HTTP request handlers
│   ├── chat.controller.ts     # Chat message endpoints
│   ├── lookup.controller.ts   # Reference data endpoints
│   ├── tenant.controller.ts   # Tenant endpoints
│   └── user.controller.ts     # User management endpoints
├── services/                  # Business logic layer
│   ├── chat.service.ts        # Chat business logic
│   ├── lookup.service.ts      # Lookup data management
│   ├── tenant.service.ts      # Tenant logic
│   └── user.service.ts        # User business logic
├── middleware/                # Express middleware stack
│   ├── authRoleMiddleware.ts  # JWT authentication & authorization
│   ├── dbClientMiddleware.ts  # Database connection injection
│   ├── errorMiddleware.ts     # Global error handling
│   ├── RouteRegistrar.ts      # Route registration & OpenAPI
│   └── validationMiddleware.ts # Request validation
├── routes/                    # API route definitions
│   ├── chat.routes.ts         # Chat endpoints
│   ├── lookup.routes.ts       # Lookup endpoints
│   ├── routes.ts              # Main route aggregator
│   ├── tenant.routes.ts       # Tenant endpoints
│   └── user.routes.ts         # User endpoints
├── schemaAndTypes/                   # Zod validation schemaAndTypes
│   ├── chat.schema.ts         # Chat validation schemaAndTypes
│   ├── common.schema.ts       # Shared validation schemaAndTypes
│   ├── lookup.schema.ts       # Lookup validation schemaAndTypes
│   ├── tenant.schema.ts       # Tenant validation schemaAndTypes
│   └── user.schema.ts         # User validation schemaAndTypes
├── database/                  # Database layer
│   ├── db.ts                  # Database connection management
│   ├── dbMigrate.ts           # Migration entry point
│   ├── dbMigrationManager.ts  # Migration management
│   ├── migrations/            # Database migrations
│   │   ├── main/              # Main schema migrations
│   │   └── tenant/            # Tenant schema migrations
│   └── seed/                  # Database seeding
├── utils/                     # Utility functions
│   ├── authHelper.ts          # Authentication utilities
│   ├── constants.ts           # Application constants
│   ├── httpError.ts           # Custom error classes
│   ├── logger.ts              # Logging configuration
│   ├── queryHelper.ts         # SQL query utilities
│   └── terminalUtils.ts       # Terminal display utilities
├── openApiSpecification/      # API documentation system
│   ├── oasDoc/                # OpenAPI schema definitions
│   ├── openAPIDocumentGenerator.ts # Document generation
│   ├── openApiRoutes.ts       # Swagger UI routes
│   └── serviceResponse.ts     # Response standardization
└── server.ts                  # Application entry point
```

## 🔄 Request Flow

### 1. Request Processing Flow

```
HTTP Request
     │
     ▼
┌─────────────┐
│ CORS        │ ◄─── Cross-origin resource sharing
│ Middleware  │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Helmet      │ ◄─── Security headers
│ Middleware  │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Morgan      │ ◄─── Request logging
│ Middleware  │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Body Parser │ ◄─── JSON/URL encoding
│ Middleware  │
└─────────────┘
     │
     ▼
┌─────────────┐
│ DB Client   │ ◄─── Database connection injection
│ Middleware  │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Route       │ ◄─── Route matching
│ Handler     │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Validation  │ ◄─── Request validation (Zod)
│ Middleware  │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Auth        │ ◄─── JWT authentication
│ Middleware  │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Controller  │ ◄─── Business logic execution
└─────────────┘
     │
     ▼
┌─────────────┐
│ Service     │ ◄─── Data processing
└─────────────┘
     │
     ▼
┌─────────────┐
│ Database    │ ◄─── Data persistence
└─────────────┘
     │
     ▼
┌─────────────┐
│ Response    │ ◄─── JSON response
└─────────────┘
```

### 2. Error Handling Flow

```
Error Occurrence
     │
     ▼
┌─────────────┐
│ Try/Catch   │ ◄─── Error catching
│ Block       │
└─────────────┘
     │
     ▼
┌─────────────┐
│ next(error) │ ◄─── Pass to error middleware
└─────────────┘
     │
     ▼
┌─────────────┐
│ Global      │ ◄─── Centralized error handling
│ Error       │
│ Middleware  │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Logging     │ ◄─── Error logging
└─────────────┘
     │
     ▼
┌─────────────┐
│ Error       │ ◄─── Formatted error response
│ Response    │
└─────────────┘
```

## 🏛️ Core Components

### 1. RouteRegistrar

The `RouteRegistrar` class provides a sophisticated approach to route definition with automatic OpenAPI documentation generation.

```typescript
class RouteRegistrar {
  constructor({ basePath = "", tags = [] }: ConstructorOptions);

  registerRoute(method: string, path: string, options: RouteOptions): void;
  get(path: string, options: RouteOptions): void;
  post(path: string, options: RouteOptions): void;
  put(path: string, options: RouteOptions): void;
  delete(path: string, options: RouteOptions): void;
  patch(path: string, options: RouteOptions): void;
}
```

**Features:**

- Automatic OpenAPI documentation generation
- Middleware integration
- Request validation setup
- Response schema definition
- Security configuration

### 2. Database Manager

The `DbManager` class handles all database operations with advanced features:

```typescript
class DbManager {
  async getDbClient(): Promise<Client>;
  getDbPool(): Pool;
  async getSchemaPool(schemaName: string): Promise<PoolClient>;
  async transaction(schemaName: string): Promise<TransactionHandlers>;
  async shutdown(): Promise<void>;
}
```

**Features:**

- Connection pooling
- Multi-schema support
- Transaction management
- Automatic connection cleanup
- Error handling and logging

### 3. Authentication Middleware

JWT-based authentication with role-based access control:

```typescript
interface JwtTokenPayload {
  userId: number;
  email: string;
  tenantId: number;
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

### 4. Service Layer Pattern

Class-based services with static methods for business logic:

```typescript
export default class UserService {
  constructor(reqObj: any) {}

  static async getUserById(id: string, mainPool: Pool): Promise<User | null> {
    // Business logic implementation
  }

  static async createUserProfile(userData: any, mainPool: Pool): Promise<User> {
    // User creation logic
  }
}
```

## 🔒 Security Architecture

### 1. Authentication Flow

```
Login Request
     │
     ▼
┌─────────────┐
│ Validate    │ ◄─── Input validation
│ Credentials │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Check User  │ ◄─── Database lookup
│ in Database │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Verify      │ ◄─── Password hashing (bcrypt)
│ Password    │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Generate    │ ◄─── JWT token creation
│ JWT Token   │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Return      │ ◄─── Token + user data
│ Response    │
└─────────────┘
```

### 2. Authorization Layers

- **Network Security**: CORS, Helmet.js, HTTPS in production
- **Application Security**: JWT validation, role-based access
- **Data Security**: Password hashing, SQL injection prevention
- **Database Security**: Multi-schema isolation, connection security

## 📊 Database Architecture

### Multi-Schema Design

```
PostgreSQL Database: teamorbit
├── main                    # Global system data
│   ├── user           # User accounts and profiles
│   ├── lookup_type        # Reference data categories
│   ├── lookup             # Reference data values
│   ├── tenant             # Tenant organizations
│   └── user_role_xref     # User-role relationships
├── tenant_1               # Tenant-specific data
│   ├── chat_channel       # Chat channels
│   ├── chat_message       # Chat messages
│   └── chat_channel_user_xref
├── tenant_2               # Another tenant's data
│   └── ...
└── tenant_n               # Additional tenants
    └── ...
```

### Connection Management

```typescript
// Automatic schema routing
const mainPool = await db.getSchemaPool("main");
const tenantPool = await db.getSchemaPool(`tenant_${tenantId}`);

// Usage in services
const user = await UserService.getUserById(id, req.mainPool);
const messages = await ChatService.getMessages(chatChannelId, req.tenantPool);
```

## 🔄 Real-time Architecture (Ready)

Socket.IO integration is prepared for real-time chat functionality:

```typescript
// Server setup (commented out in current implementation)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Event handling
io.on("connection", socket => {
  socket.on("joinChannel", ({ userId }) => {
    socket.join(userId);
  });

  socket.on("sendMessage", async data => {
    // Save message and broadcast
    const savedMessage = await ChatService.saveMessage(data);
    io.to(data.receiverId).emit("receiveMessage", savedMessage);
  });
});
```

## 📈 Scalability Considerations

### Horizontal Scaling

- **Stateless Design**: JWT-based authentication
- **Connection Pooling**: Efficient database connections
- **Load Balancer Ready**: Multiple server instances

### Vertical Scaling

- **Memory Management**: Efficient resource usage
- **CPU Optimization**: Async/await patterns
- **Database Optimization**: Strategic indexing and query optimization

### Performance Features

- **Connection Pooling**: Advanced PostgreSQL connection management
- **Query Optimization**: Parameterized queries with proper indexing
- **JSON Aggregation**: Efficient data retrieval for roles and relationships
- **Caching Ready**: Prepared for Redis integration

## 🛠️ Technology Stack

### Core Technologies

- **Node.js 18+**: JavaScript runtime
- **TypeScript**: Type-safe development
- **Express.js**: Web framework
- **PostgreSQL**: Primary database

### Authentication & Security

- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing

### Validation & Documentation

- **Zod**: Schema validation and type inference
- **OpenAPI/Swagger**: API documentation
- **@asteasolutions/zod-to-openapi**: Schema to OpenAPI conversion

### Development Tools

- **Nodemon**: Development server
- **ts-node**: TypeScript execution
- **Prettier**: Code formatting
- **Winston**: Structured logging

## 🚀 Future Enhancements

### Planned Features

1. **Rate Limiting**: API rate limiting and throttling
2. **Caching**: Redis integration for session storage
3. **File Upload**: Media handling for chat messages
4. **WebSocket Optimization**: Enhanced real-time features
5. **Monitoring**: Application performance monitoring
6. **Testing**: Comprehensive test suite

### Architecture Improvements

1. **Microservices**: Service decomposition for large scale
2. **Event Sourcing**: Event-driven architecture
3. **CQRS**: Command Query Responsibility Segregation
4. **GraphQL**: Alternative API layer
5. **Message Queues**: Asynchronous processing

---

**Next**: [Database Architecture](database.md) or [Development Guide](../development/README.md)
