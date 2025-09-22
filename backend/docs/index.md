# TeamOrbit Backend Documentation

## 📋 Recent Updates

- **Schema Migration**: Implemented lookup-based role and status system ([Migration Guide](./SCHEMA_MIGRATION.md))
- **Database Updates**: New lookup tables for centralized role/status management
- **Service Layer**: Updated all services to use new schema with parameterized queries
- **Documentation Organization**: All docs moved to `/docs` folder structure
- **Security**: Enhanced SQL injection prevention with parameterized queries

Welcome to the comprehensive documentation for the TeamOrbit backend API.

## 🚀 Quick Start

**New to the project?** Start here:

1. [Project Setup](./setup/SETUP.md) - Get the backend running locally
2. [Quick Reference](./QUICK_REFERENCE.md) - Common commands and patterns
3. [Development Guidelines](./development/DEVELOPMENT.md) - Best practices

## 📚 Complete Documentation

### Setup & Configuration

- **[Project Setup](./setup/SETUP.md)** - Complete setup guide from scratch
- **[Development Guidelines](./development/DEVELOPMENT.md)** - Development best practices and patterns

### API & Architecture

- **[API Documentation](./api/API.md)** - Complete API reference and endpoints
- **[Architecture Guide](./architecture/ARCHITECTURE.md)** - System architecture and design patterns
- **[Database Schema](./api/DATABASE.md)** - Database design and relationships

### Migration & Updates

- **[Schema Migration Guide](./SCHEMA_MIGRATION.md)** - Database schema updates and service changes
- **[Documentation Strategy](./DOCUMENTATION_STRATEGY.md)** - Documentation organization and standards

### Source Code Documentation

- **[Controllers](./src/controllers/)** - API controller documentation
- **[Services](./src/services/)** - Business logic service documentation

### Deployment & Operations

- **[Deployment Guide](./deployment/DEPLOYMENT.md)** - Production deployment to various platforms

## 🎯 Common Tasks

### For Developers

- **Setting up the backend** → [Setup Guide](./setup/SETUP.md)
- **Understanding the architecture** → [Architecture Guide](./architecture/ARCHITECTURE.md)
- **Working with APIs** → [API Documentation](./api/API.md)
- **Database operations** → [Database Guide](./api/DATABASE.md)

### For DevOps

- **Deploying to production** → [Deployment Guide](./deployment/DEPLOYMENT.md)
- **Environment configuration** → [Setup Guide](./setup/SETUP.md)

### For Contributors

- **Understanding the codebase** → [Development Guide](./development/DEVELOPMENT.md)
- **API patterns** → [API Documentation](./api/API.md)
- **Database schema** → [Database Guide](./api/DATABASE.md)

## 📖 Documentation Structure

```
docs/
├── index.md                    # This file - documentation index
├── QUICK_REFERENCE.md          # Quick commands and common tasks
├── setup/
│   └── SETUP.md                # Complete project setup guide
├── development/
│   └── DEVELOPMENT.md          # Development guidelines and best practices
├── api/
│   ├── API.md                  # API documentation and endpoints
│   └── DATABASE.md             # Database schema and relationships
├── architecture/
│   └── ARCHITECTURE.md         # System architecture and design patterns
└── deployment/
    └── DEPLOYMENT.md           # Production deployment guide
```

## 🔄 Recent Updates

### Backend Architecture Improvements (Latest)

The backend has undergone significant improvements in architecture, service patterns, and middleware:

#### Service Layer Refactoring
- **Static Method Migration**: All service methods converted to static pattern for better performance and consistency
- **Object Parameter Pattern**: Service methods now accept structured object parameters for improved maintainability
- **Enhanced User Service**: Added conditional password inclusion and role aggregation in user queries
- **Role Integration**: User queries now return roles as structured arrays with lookup table relationships

#### Middleware and Error Handling
- **Morgan Removal**: Eliminated HTTP request logging middleware for cleaner terminal output
- **Centralized Error Handling**: Migrated from individual controller error responses to global error middleware
- **Enhanced Database Middleware**: Improved connection cleanup with double-release prevention
- **Simplified Response Format**: Streamlined API responses with consistent error handling

#### Database and Schema Updates
- **Updated Database Schema**: Table renamed from `user_profile` to `app_user` with enhanced field structure
- **Role System Integration**: Implemented user-role relationships through junction tables
- **Query Optimization**: Enhanced queries with JSON aggregation for complex data structures

#### Developer Experience
- **Terminal Output Enhancement**: Vite-style colored and clickable API documentation URLs
- **Improved Logging**: Cleaner development experience with focused application logs
- **Better Type Safety**: Enhanced TypeScript interfaces and type inference throughout

For detailed information, see:
- [Middleware Architecture Updates](./architecture/MIDDLEWARE.md#recent-updates)
- [API Response Format Changes](./api/API.md#response-format)
- [Database Schema Changes](./api/DATABASE.md#app-user-table)

## 🔄 Keeping Documentation Updated

When making changes to the project, please update the relevant documentation:

- **New API endpoints** → Update API documentation
- **Database changes** → Update database schema docs
- **Architecture changes** → Update architecture guide
- **Configuration changes** → Update setup guide
- **Deployment changes** → Update deployment guide

## 🤝 Contributing to Documentation

1. Use clear, concise language
2. Include code examples where helpful
3. Keep documentation up-to-date with code changes
4. Follow the existing structure and formatting
5. Test all code examples before documenting

---

_This documentation is maintained alongside the codebase. Please keep it updated when making changes to the project._
