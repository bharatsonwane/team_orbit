# TeamOrbit Backend

A robust, enterprise-grade Node.js backend API built with Express, TypeScript, and PostgreSQL featuring class-based architecture, advanced middleware, and comprehensive database management.

## 🚀 Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Type-safe development with modern features
- **PostgreSQL** - Advanced relational database with connection pooling
- **Socket.IO** - Real-time bidirectional communication (ready for implementation)
- **JWT** - Secure token-based authentication
- **Zod** - Runtime type validation and schema parsing
- **OpenAPI/Swagger** - Comprehensive API documentation
- **Umzug** - Database migration management
- **Winston** - Professional logging system

## 🎨 Key Features

### 🏗️ Architecture

- **Class-based Services** - Modern OOP approach for maintainable business logic
- **Layered Architecture** - Clear separation of concerns (Controllers → Services → Database)
- **Dependency Injection** - Flexible and testable component design
- **Factory Patterns** - Reusable service instantiation with dependency injection

### 🔒 Security & Authentication

- **JWT Authentication** - Secure token-based user authentication with comprehensive payload structure
- **Role-based Access Control** - Granular permission management with user role arrays
- **TypeScript Integration** - Full type safety with `AuthenticatedRequest` interface and `JwtTokenPayload`
- **Input Validation** - Comprehensive request validation with Zod schemaAndTypes
- **Security Headers** - Helmet.js for security best practices
- **CORS Configuration** - Configurable cross-origin resource sharing

### 💾 Database Management

- **Advanced Connection Pooling** - Efficient PostgreSQL connection management with schema-specific pools
- **Multi-Schema Architecture** - Separate main and tenant schemaAndTypes for true multi-tenancy
- **Advanced Migration System** - `dbMigrationManager.ts` with support for SQL and TypeScript migrations
- **Migration Integrity** - Comprehensive validation and error handling for schema changes
- **Transaction Support** - Safe database operations with rollback capabilities
- **Lookup Data Management** - Centralized reference data system with seeding support
- **Schema Isolation** - Tenant-specific data isolation with shared main schema

### 🔧 Middleware Stack

- **Database Client Middleware** - Automatic database connection injection
- **Authentication Middleware** - JWT token validation and user context
- **Validation Middleware** - Zod schema validation for all endpoints
- **Error Handler** - Centralized error processing and logging
- **Response Handler** - Standardized API response formatting

### 📊 Monitoring & Logging

- **Structured Logging** - Winston-based logging with multiple transports
- **Request Tracking** - Comprehensive API request/response logging
- **Error Tracking** - Detailed error logging with stack traces
- **Performance Monitoring** - Database query performance tracking

## 🛠️ Quick Start

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env file with your database credentials and configuration

# Run database migrations
npm run migrate

# Seed database with initial data
npm run seed

# Start development server with hot reload
npm run dev
```

**Server endpoints:**

- API Server: `http://localhost:5100/api`
- Health Check: `http://localhost:5100/health`
- API Documentation: `http://localhost:5100/docs`
- Test Endpoint: `http://localhost:5100/test`

## 📚 API Documentation

The TeamOrbit backend provides a comprehensive RESTful API with interactive documentation.

### Interactive Documentation

- **Swagger UI:** `http://localhost:5100/docs` - Interactive API testing interface
- **OpenAPI Spec:** Auto-generated from Zod schemaAndTypes

### Complete API Reference

For detailed information about all endpoints, request/response formats, and examples:

👉 **[Complete API Documentation](./docs/src/api.md)**

### Quick Access

- **Authentication & Users** - User registration, login, profile management
- **Tenants** - Multi-tenant organization management
- **Lookup Data** - Reference data and system constants
- **Chat** - Real-time messaging (ready for implementation)
- **System** - Health checks and monitoring

## 🏗️ Architecture Highlights

The TeamOrbit backend follows a clean, layered architecture with clear separation of concerns:

- **Controllers** → Handle HTTP requests and responses
- **Services** → Contain business logic (class-based with static methods)
- **Database** → Multi-schema PostgreSQL with advanced pooling
- **Middleware** → Authentication, validation, error handling, and more

For detailed architecture patterns and code examples:

👉 **[Architecture Overview](./docs/architecture.md)**

### Key Architecture Features

- **Class-based Services** - Modern OOP approach for business logic
- **Advanced Middleware Stack** - Request processing pipeline with authentication, validation, and error handling
- **TypeScript Integration** - Full type safety with `AuthenticatedRequest` and typed payloads
- **Migration System** - Version-controlled database schema management
- **Multi-tenant Support** - Schema isolation with automatic connection routing

## 📊 Database

TeamOrbit uses **PostgreSQL** with a multi-schema architecture:

- **Main schema**: User accounts, tenants, lookup data
- **Tenant schemaAndTypes**: Isolated tenant-specific data

For complete database documentation: **[Database Documentation](./docs/src/database.md)**

## 📚 Additional Documentation

For detailed guides and technical references:

### Comprehensive Guides

- **[📖 Getting Started](./docs/getting-started.md)** - Detailed setup, development patterns, and deployment strategies
- **[🏗️ Architecture](./docs/architecture.md)** - System architecture, design patterns, and request flow

### Technical Reference

- **[🔌 API](./docs/src/api.md)** - Complete API endpoint documentation
- **[💾 Database](./docs/src/database.md)** - Database schema, migrations, and operations
- **[🎮 Controllers](./docs/src/controllers-reference.md)** - HTTP request handler implementation
- **[⚙️ Services](./docs/src/services-reference.md)** - Business logic layer patterns
- **[🔧 Middleware](./docs/src/middleware-reference.md)** - Middleware stack and custom middleware

## 🤝 Contributing

1. Follow the established architecture patterns
2. Use TypeScript for all new code
3. Add appropriate tests for new features
4. Update documentation for API changes
5. Follow the coding standards in the development guide

## 📄 License

This project is part of the TeamOrbit application suite.
