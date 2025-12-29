# TeamOrbit

A comprehensive team management and collaboration platform built with React, Node.js, and PostgreSQL.

## 📋 Recent Updates (September 2025)

### ✅ Schema Migration Completed
- **Database**: Migrated to lookup-based role and status system
- **Backend**: Updated all services to use new schema with enhanced security
- **Frontend**: Aligned constants and types with new backend structure
- **Documentation**: Completely reorganized and updated

### 🗂️ Documentation Organization
Comprehensive, production-ready documentation:
- **Frontend**: 7,572 lines across 14 files
- **Backend**: Fully documented with API reference, architecture, and guides
- **Total Coverage**: Setup, development, deployment, and technical references

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm run migrate  # Run database migrations
npm start        # Start development server
```

### Frontend Setup  
```bash
cd frontend
npm install
npm run dev      # Start development server
```

## 📚 Documentation

### Frontend (7,572 lines across 14 files)
- **[README](./frontend/README.md)** - Main entry point and quick start
- **[Getting Started](./frontend/docs/getting-started.md)** - Complete setup, development & deployment
- **[Architecture](./frontend/docs/architecture.md)** - System architecture and design patterns

#### Technical References
- **[Components](./frontend/docs/src/components.md)** - 46 shadcn/ui components + custom components
- **[Routing](./frontend/docs/src/routing.md)** - Routing system and navigation
- **[Pages](./frontend/docs/src/pages.md)** - Page components documentation
- **[Redux](./frontend/docs/src/redux.md)** - State management with Redux Toolkit
- **[Contexts](./frontend/docs/src/contexts.md)** - React Context providers (Auth, Theme)
- **[Hooks](./frontend/docs/src/hooks.md)** - Custom hooks and patterns
- **[Schemas](./frontend/docs/src/schema.md)** - Type definitions and Zod validation
- **[Theme](./frontend/docs/src/theme.md)** - Theming system (Dark/Light/System)
- **[Utils](./frontend/docs/src/utils.md)** - Utility functions and helpers
- **[Config](./frontend/docs/src/config.md)** - Configuration and environment
- **[Lib](./frontend/docs/src/lib.md)** - Library utilities (cn() for Tailwind)

### Backend
- **[README](./backend/README.md)** - Main entry point and navigation hub
- **[Getting Started](./backend/docs/getting-started.md)** - Setup, development & deployment
- **[Architecture](./backend/docs/architecture.md)** - System architecture overview

#### Technical References  
- **[API Documentation](./backend/docs/src/api.md)** - Complete API reference
- **[Database](./backend/docs/src/database.md)** - Database operations & migrations
- **[Controllers](./backend/docs/src/controllers.md)** - Controller layer documentation
- **[Services](./backend/docs/src/services.md)** - Service layer documentation
- **[Middleware](./backend/docs/src/middleware.md)** - Middleware components

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **React Router** for navigation
- **Redux Toolkit** for state management

### Backend Stack
- **Node.js** with TypeScript
- **Express.js** web framework
- **PostgreSQL** database
- **Zod** for validation
- **OpenAPI** documentation
- **JWT** authentication

### Key Features
- 🔐 **Role-based Access Control** - Hierarchical user roles
- 🏢 **Multi-tenant Architecture** - Support for multiple organizations
- 💬 **Team Chat** - Real-time messaging
- 📊 **Dashboard** - Analytics and insights
- 🎨 **Theming** - Dark/light mode support
- 📱 **Responsive Design** - Mobile-first approach

## 🔄 Recent Schema Changes

### Database Updates
- New `lookup_type` and `lookup` tables for centralized role/status management
- Updated `user` table to use `statusId` instead of string status
- New `user_roles_xref` table for role assignments
- Enhanced foreign key constraints for data integrity

### API Changes
- User endpoints now return role objects with `id`, `name`, and `label`
- Status fields use numeric IDs instead of strings
- New lookup endpoints for role/status management

### Frontend Updates
- Constants restructured to match backend schema
- User types updated to align with API responses
- Role checking updated to use new role hierarchy

## 🛠️ Development

### Database Migrations
```bash
cd backend
npm run migrate        # Run all pending migrations
npm run migrate:rollback  # Rollback last migration
```

### Code Generation
```bash
cd backend  
npm run build          # Compile TypeScript
npm run dev            # Development mode with hot reload
```

### Testing
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test
```

## 🚀 Deployment

### Environment Setup
1. Copy `.env.example` to `.env` in both frontend and backend
2. Configure database connection strings
3. Set JWT secrets and API keys

### Production Build
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## 📖 Documentation Structure

```
TeamOrbit/
├── README.md                           # This file - Project overview
│
├── frontend/
│   ├── README.md                       # Frontend main entry
│   ├── docs/
│   │   ├── getting-started.md         # Setup, dev & deployment
│   │   ├── architecture.md            # System architecture
│   │   └── src/                       # Technical references
│   │       ├── components.md          # Component library
│   │       ├── routing.md             # Routing system
│   │       ├── pages.md               # Page components
│   │       ├── redux.md               # State management
│   │       ├── contexts.md            # React contexts
│   │       ├── hooks.md               # Custom hooks
│   │       ├── schema.md              # Types & validation
│   │       ├── theme.md               # Theming system
│   │       ├── utils.md               # Utility functions
│   │       ├── config.md              # Configuration
│   │       └── lib.md                 # Library utilities
│   └── src/                           # Frontend source code
│
├── backend/
│   ├── README.md                      # Backend main entry
│   ├── docs/
│   │   ├── getting-started.md        # Setup, dev & deployment
│   │   ├── architecture.md           # System architecture
│   │   └── src/                      # Technical references
│   │       ├── api.md                # API documentation
│   │       ├── database.md           # Database & migrations
│   │       ├── controllers.md
│   │       ├── services.md
│   │       └── middleware.md
│   └── src/                          # Backend source code
```

## 🤝 Contributing

1. Read the documentation in `/frontend/docs` and `/backend/docs`
2. Follow the established patterns and conventions
3. Update documentation for any changes
4. Ensure tests pass before submitting PRs

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For detailed information, see the complete documentation in the respective `/docs` folders.# team_orbit
# team_orbit
# team_orbit
