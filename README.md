# TeamOrbit

A comprehensive team management and collaboration platform built with React, Node.js, and PostgreSQL.

## 📋 Recent Updates (September 2025)

### ✅ Schema Migration Completed
- **Database**: Migrated to lookup-based role and status system
- **Backend**: Updated all services to use new schema with enhanced security
- **Frontend**: Aligned constants and types with new backend structure
- **Documentation**: Completely reorganized and updated

### 🗂️ Documentation Organization
All documentation has been moved to organized folder structures:
- `frontend/docs/` - Frontend documentation
- `backend/docs/` - Backend documentation
- `docs/` - Project-wide documentation

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

### Frontend
- **[Frontend Documentation](./frontend/docs/index.md)** - Complete frontend guide
- **[Schema Migration](./frontend/docs/SCHEMA_MIGRATION.md)** - Frontend schema changes
- **[Components](./frontend/docs/components/COMPONENTS.md)** - Component library
- **[Architecture](./frontend/docs/ARCHITECTURE.md)** - Frontend architecture

### Backend
- **[Backend Documentation](./backend/docs/index.md)** - Complete backend guide  
- **[Schema Migration](./backend/docs/SCHEMA_MIGRATION.md)** - Database and service changes
- **[API Documentation](./backend/docs/api/API.md)** - API reference
- **[Database Schema](./backend/docs/api/DATABASE.md)** - Database design

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
- Updated `app_user` table to use `statusId` instead of string status
- New `user_role_xref` table for role assignments
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
├── README.md                 # This file
├── frontend/
│   ├── docs/                # Frontend documentation
│   │   ├── index.md         # Documentation index
│   │   ├── SCHEMA_MIGRATION.md
│   │   ├── components/      # Component docs
│   │   ├── features/        # Feature docs
│   │   └── src/            # Source code docs
│   └── src/                # Frontend source code
├── backend/
│   ├── docs/               # Backend documentation
│   │   ├── index.md        # Documentation index  
│   │   ├── SCHEMA_MIGRATION.md
│   │   ├── api/            # API documentation
│   │   ├── architecture/   # Architecture docs
│   │   └── src/           # Source code docs
│   └── src/               # Backend source code
```

## 🤝 Contributing

1. Read the documentation in `/frontend/docs` and `/backend/docs`
2. Follow the established patterns and conventions
3. Update documentation for any changes
4. Ensure tests pass before submitting PRs

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For detailed information, see the complete documentation in the respective `/docs` folders.