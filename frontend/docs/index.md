# TeamOrbit Frontend Documentation

Welcome to the comprehensive documentation for the TeamOrbit frontend application.

## 📋 Recent Updates

- **Schema Migration**: Updated to new lookup-based role and status system ([Migration Guide](./SCHEMA_MIGRATION.md))
- **Documentation Organization**: All docs moved to `/docs` folder structure
- **Constants Update**: New role and status constants aligned with backend
- **Source Documentation**: Moved all `/src` docs to `/docs/src/` for better organization

## 🚀 Quick Start

**New to the project?** Start here:

1. [Project Setup](./setup/SETUP.md) - Get the project running locally
2. [Quick Reference](./QUICK_REFERENCE.md) - Common commands and patterns
3. [Development Guidelines](./development/DEVELOPMENT.md) - Best practices

## 📚 Complete Documentation

### Setup & Configuration

- **[Project Setup](./setup/SETUP.md)** - Complete setup guide from scratch
- **[Development Guidelines](./development/DEVELOPMENT.md)** - Development best practices and patterns

### Features & Components

- **[Theming System](./features/THEMING.md)** - Dark/light mode theming implementation
- **[Authentication](./features/AUTHENTICATION.md)** - Login/signup pages and user flows
- **[Routing & Navigation](./features/ROUTING.md)** - React Router setup and navigation
- **[Components](./components/COMPONENTS.md)** - Component library and usage

### Architecture & Migration

- **[Schema Migration Guide](./SCHEMA_MIGRATION.md)** - Database schema updates and frontend changes
- **[Architecture Overview](./ARCHITECTURE.md)** - Application architecture and patterns
- **[Documentation Strategy](./DOCUMENTATION_STRATEGY.md)** - Documentation organization and standards

### Source Code Documentation

- **[Components](./src/components/)** - Component-specific documentation
- **[Utils](./src/utils/)** - Utility functions and helpers
- **[Schemas](./src/schemas/)** - Type definitions and validation
- **[Pages](./src/pages/)** - Page-level component documentation
- **[Redux](./src/redux/)** - State management documentation
- **[Config](./src/config/)** - Configuration documentation
- **[Lib](./src/lib/)** - Library integrations
- **[Routing System](./src/ROUTING_SYSTEM.md)** - Detailed routing documentation

### Deployment & Operations

- **[Deployment Guide](./deployment/DEPLOYMENT.md)** - Production deployment to various platforms

## 🎯 Common Tasks

### For Developers

- **Adding new components** → [Components Guide](./components/COMPONENTS.md)
- **Working with themes** → [Theming Guide](./features/THEMING.md)
- **Creating new pages** → [Development Guide](./development/DEVELOPMENT.md)
- **Setting up routing** → [Routing Guide](./features/ROUTING.md)

### For DevOps

- **Deploying to production** → [Deployment Guide](./deployment/DEPLOYMENT.md)
- **Environment configuration** → [Setup Guide](./setup/SETUP.md)

### For Contributors

- **Understanding the codebase** → [Development Guide](./development/DEVELOPMENT.md)
- **Component patterns** → [Components Guide](./components/COMPONENTS.md)
- **Project setup** → [Setup Guide](./setup/SETUP.md)

## 📖 Documentation Structure

```
docs/
├── README.md                    # This file - documentation index
├── QUICK_REFERENCE.md          # Quick commands and common tasks
├── setup/
│   └── SETUP.md                # Complete project setup guide
├── development/
│   └── DEVELOPMENT.md          # Development guidelines and best practices
├── features/
│   ├── THEMING.md              # Theming system documentation
│   ├── AUTHENTICATION.md       # Authentication implementation
│   └── ROUTING.md              # Routing and navigation guide
├── components/
│   └── COMPONENTS.md           # Component library documentation
└── deployment/
    └── DEPLOYMENT.md           # Production deployment guide
```

## 🔄 Keeping Documentation Updated

When making changes to the project, please update the relevant documentation:

- **New features** → Update feature documentation
- **New components** → Update components guide
- **Configuration changes** → Update setup guide
- **Deployment changes** → Update deployment guide
- **Development process** → Update development guide

## 🤝 Contributing to Documentation

1. Use clear, concise language
2. Include code examples where helpful
3. Keep documentation up-to-date with code changes
4. Follow the existing structure and formatting
5. Test all code examples before documenting

---

_This documentation is maintained alongside the codebase. Please keep it updated when making changes to the project._
