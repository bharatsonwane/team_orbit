# TeamOrbit Frontend

A modern, type-safe React application built with Vite, TypeScript, and shadcn/ui, featuring comprehensive state management, authentication, and beautiful theming.

## 🚀 Tech Stack

- **React 19** - Latest React with modern hooks and concurrent features
- **TypeScript** - Full type safety and developer experience
- **Vite 7** - Lightning-fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework with modern features
- **shadcn/ui** - Beautiful, accessible component library built on Radix UI
- **React Router 7** - Modern client-side routing with type safety
- **Redux Toolkit** - Powerful state management with TypeScript support
- **React Hook Form** - Performant form validation with Zod integration
- **Axios** - HTTP client with interceptors and TypeScript support
- **Lucide React** - Beautiful icon library

## 🎨 Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication with secure cookie storage
- Context API + Redux for auth state management
- Protected routes with role-based access control
- Automatic session restoration and token validation
- Login/Signup pages with comprehensive form validation

### 🎭 Modern UI/UX
- 46+ shadcn/ui components pre-configured
- Dark/Light/System theme with smooth transitions
- Fully responsive design for all screen sizes
- Accessible components with ARIA labels
- Beautiful animations and transitions

### 🛣️ Advanced Routing
- Route protection with role-based guards
- Automatic redirects based on auth state
- Public and protected route segregation
- Layout system with AppLayout and sidebar navigation
- Fallback routes for 404 handling

### 🏗️ State Management
- Redux Toolkit for global state
- Context API for auth and theme
- TypeScript-first approach with full type inference
- Async actions with createAsyncThunk
- Notification system with auto-hide

### 📱 Responsive Layout
- Collapsible sidebar with mobile support
- AppLayout wrapper for consistent page structure
- Role-based navigation items
- Breadcrumb navigation
- Theme toggle in all layouts

## 🛠️ Quick Start

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Development server:** `http://localhost:5173`

## 📚 API Integration

The frontend is designed to work seamlessly with the TeamOrbit backend:

- **Base URL**: Configured via environment variables
- **JWT Authentication**: Automatic token injection in requests
- **Error Handling**: Global error interceptors
- **Type Safety**: Full TypeScript types for API responses

For backend API documentation: **[Backend API Docs](../backend/docs/src/api.md)**

## 🏗️ Architecture Highlights

- **Component-Based**: Modular, reusable React components
- **Type-Safe**: Full TypeScript coverage with strict mode
- **Form Validation**: Zod schemas with React Hook Form
- **State Management**: Redux Toolkit + Context API
- **Routing**: React Router with protected routes

For detailed architecture: **[Architecture Documentation](./docs/architecture.md)**

## 📊 Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   ├── pages/           # Page components
│   ├── contexts/        # React context providers
│   ├── redux/           # Redux store, slices, actions
│   ├── utils/           # Utility functions
│   ├── schemas/         # Zod validation schemas
│   └── config/          # Configuration files
└── docs/                # Documentation
```

For complete structure: **[Architecture Documentation](./docs/architecture.md#-project-structure)**

## 📚 Additional Documentation

For detailed guides and technical references:

### Comprehensive Guides
- **[📖 Getting Started](./docs/getting-started.md)** - Setup, development, and deployment guide
- **[🏗️ Architecture](./docs/architecture.md)** - System architecture and design patterns

### Technical Reference (src/)
- **[🧩 Components](./docs/src/components.md)** - Component library and usage
- **[🗺️ Routing](./docs/src/routing.md)** - Routing system and navigation
- **[📄 Pages](./docs/src/pages.md)** - Page component documentation
- **[🔄 Redux](./docs/src/redux.md)** - State management with Redux
- **[📝 Schemas](./docs/src/schema.md)** - Type definitions and validation
- **[🛠️ Utils](./docs/src/utils.md)** - Utility functions and helpers
- **[⚙️ Config](./docs/src/config.md)** - Configuration and environment

## 🤝 Contributing

1. Follow the established architecture patterns
2. Use TypeScript for all new code
3. Add appropriate tests for new features
4. Update documentation for changes
5. Follow the coding standards in the getting started guide

## 📄 License

This project is part of the TeamOrbit application suite.
