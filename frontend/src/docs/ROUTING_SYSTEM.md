# Routing System Documentation

Comprehensive documentation for the TeamOrbit frontend routing system with role-based authentication.

## 🎯 Overview

The TeamOrbit frontend uses a sophisticated routing system that combines React Router with role-based authentication. The system is built around an array-based route configuration that allows for easy management and role-based access control.

## 🏗️ Architecture

### Core Components

1. **Route Configuration** - Array-based route definitions
2. **Route Guard** - Authentication and authorization wrapper
3. **Auth Context** - Centralized authentication state management
4. **Type System** - TypeScript interfaces for type safety

### File Structure

```
src/
├── types/
│   ├── user.ts                 # User and authentication types
│   └── route.ts                # Route configuration types
├── contexts/
│   └── AuthContext.tsx         # Authentication context and hooks
├── components/
│   └── RouteGuard.tsx          # Route protection component
├── lib/
│   └── utils.ts                # Utility functions (cn, etc.)
├── utils/
│   ├── routes.tsx              # Route configuration arrays
│   └── logger.ts               # Logging utility
└── pages/                      # Page components
    ├── Home.tsx
    ├── Login.tsx
    ├── Signup.tsx
    ├── Dashboard.tsx
    ├── Profile.tsx
    ├── Admin.tsx
    └── SuperAdmin.tsx
```

## 🔧 Route Configuration

### Route Interface

```typescript
interface Route {
  path: string;
  element: React.ReactNode;
  authRoles: UserRole[];
  title?: string;
  description?: string;
}
```

### Role Keys

```typescript
const roleKeys = {
  SUPER: 'SUPER' as const, // Super admin access
  ADMIN: 'ADMIN' as const, // Admin access
  USER: 'USER' as const, // Regular user access
  GUEST: 'GUEST' as const, // Guest access
  ANY: 'ANY' as const, // Any authenticated user
};
```

### Route Arrays

#### Public Routes

```typescript
const publicRouteList: Route[] = [
  {
    path: '/login',
    element: <Login />,
    authRoles: [],  // No authentication required
    title: 'Login',
    description: 'User login page'
  },
  {
    path: '/signup',
    element: <Signup />,
    authRoles: [],
    title: 'Sign Up',
    description: 'User registration page'
  },
]
```

#### User Routes

```typescript
const userRouteList: Route[] = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    authRoles: [roleKeys.ANY],  // Any authenticated user
    title: 'Dashboard',
    description: 'User dashboard'
  },
  {
    path: '/profile',
    element: <Profile />,
    authRoles: [roleKeys.ANY],
    title: 'Profile',
    description: 'User profile management'
  },
]
```

#### Admin Routes

```typescript
const adminRouteList: Route[] = [
  {
    path: '/admin',
    element: <Admin />,
    authRoles: [roleKeys.ADMIN, roleKeys.SUPER],  // Admin or Super admin
    title: 'Admin Dashboard',
    description: 'Admin management panel'
  },
]
```

#### Super Admin Routes

```typescript
const superAdminRouteList: Route[] = [
  {
    path: '/super-admin',
    element: <SuperAdmin />,
    authRoles: [roleKeys.SUPER],  // Super admin only
    title: 'Super Admin',
    description: 'Super admin control panel'
  },
]
```

## 🛡️ Route Guard System

### RouteGuardRenderer Component

The `RouteGuardRenderer` component handles authentication and authorization for routes:

```typescript
interface RouteGuardRendererProps {
  children?: React.ReactNode;
  authRoles?: string[];
  routes?: Route[];
}
```

### Authorization Logic

```typescript
const checkUserAuthorization = (): boolean => {
  if (authRoles.length === 0) {
    // If no auth roles, return true (public route)
    return true;
  }

  if (!isAuthenticated || !user) {
    return false;
  }

  // Convert string roles to UserRole type
  const allowedRoles = authRoles.filter(role =>
    Object.values(roleKeys).includes(role as UserRole)
  ) as UserRole[];

  // Special case for ANY role
  if (authRoles.includes(roleKeys.ANY)) {
    return true;
  }

  // Use the hasRoleAccess helper
  return hasRoleAccess({
    allowedRoles,
    userRoles: [user.role],
  });
};
```

### Access Denied Handling

When a user doesn't have the required permissions:

```typescript
if (!isAuthorized) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Access Denied
        </h1>
        <p className="text-muted-foreground mb-6">
          You are not authorized to access this page.
        </p>
        <div className="space-x-4">
          <a href="/" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Go Home
          </a>
          <a href="/login" className="inline-flex items-center px-4 py-2 border border-border rounded-md hover:bg-accent">
            Login
          </a>
        </div>
      </div>
    </div>
  )
}
```

## 🔐 Authentication System

### Auth Context

The `AuthContext` provides centralized authentication state management:

```typescript
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
```

### User Types

```typescript
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

type UserRole = 'SUPER' | 'ADMIN' | 'USER' | 'GUEST';
```

### Authentication Flow

1. **Login/Register** - User submits credentials
2. **API Call** - Backend validates and returns JWT token
3. **Token Storage** - Token stored in localStorage
4. **State Update** - Auth context updated with user data
5. **Route Protection** - Routes check authentication status
6. **Role Verification** - Routes check user roles for access

## 🚀 Usage Examples

### Adding a New Route

1. **Create the Page Component**

```typescript
// src/pages/NewPage.tsx
export default function NewPage() {
  return (
    <div className="min-h-screen bg-background">
      <h1>New Page</h1>
    </div>
  )
}
```

2. **Add to Route Configuration**

```typescript
// src/utils/routes.tsx
import NewPage from '../pages/NewPage'

const newRoute: Route = {
  path: '/new-page',
  element: <NewPage />,
  authRoles: [roleKeys.USER],  // Only authenticated users
  title: 'New Page',
  description: 'A new page for users'
}

// Add to appropriate route list
const userRouteList: Route[] = [
  // ... existing routes
  newRoute
]
```

3. **Update Main Route List**

```typescript
const mainRouteList: Route[] = [
  ...publicRouteList,
  ...userRouteList,
  ...adminRouteList,
  ...superAdminRouteList,
];
```

### Role-Based Navigation

```typescript
// In a component
const { user } = useAuthService()
import { hasRoleAccess } from '@/utils/authHelper';

return (
  <div>
    {hasRoleAccess({ allowedRoles: ['ADMIN', 'SUPER'], userRoles: [user.role] }) && (
      <Link to="/admin">Admin Panel</Link>
    )}
    {hasRoleAccess({ allowedRoles: ['SUPER'], userRoles: [user.role] }) && (
      <Link to="/super-admin">Super Admin</Link>
    )}
  </div>
)
```

### Protected API Calls

```typescript
// In a service or component
const makeAuthenticatedRequest = async (url: string) => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.json();
};
```

## 🎨 Styling and Theming

### Theme Integration

All pages support the theme system:

```typescript
// Standard page structure
export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page content */}
      </div>
    </div>
  )
}
```

### Responsive Design

```typescript
// Responsive grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>

// Responsive text
<h1 className="text-2xl md:text-4xl lg:text-6xl">
  Responsive Heading
</h1>
```

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:5100
API_TIMEOUT=10000

# Authentication
JWT_STORAGE_KEY=auth_token
VITE_TOKEN_REFRESH_INTERVAL=300000
```

### Route Configuration Options

```typescript
// Route with custom metadata
const customRoute: Route = {
  path: '/custom',
  element: <CustomPage />,
  authRoles: [roleKeys.ADMIN],
  title: 'Custom Page',
  description: 'A custom page with specific requirements',
  // Additional metadata can be added here
}
```

## 🧪 Testing

### Testing Routes

```typescript
// Test route access
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'

const renderWithAuth = (component: React.ReactElement, user?: User) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

test('admin route requires admin access', () => {
  renderWithAuth(<App />, { role: 'USER' })

  // Navigate to admin route
  // Should show access denied
  expect(screen.getByText('Access Denied')).toBeInTheDocument()
})
```

### Testing Authentication

```typescript
// Test authentication flow
test('login redirects to dashboard', async () => {
  const mockLogin = jest.fn()

  renderWithAuth(<Login />)

  // Fill in login form
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'test@example.com' }
  })
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'password123' }
  })

  // Submit form
  fireEvent.click(screen.getByText('Sign in'))

  // Should call login function
  expect(mockLogin).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  })
})
```

## 📚 Best Practices

### 1. Route Organization

- Group routes by access level
- Use descriptive route paths
- Include metadata for documentation
- Keep route arrays focused and manageable

### 2. Authentication

- Always check authentication status
- Use role-based access control
- Handle authentication errors gracefully
- Provide clear feedback to users

### 3. Security

- Validate all user inputs
- Use HTTPS in production
- Implement proper token expiration
- Handle token refresh appropriately

### 4. Performance

- Lazy load route components
- Use React.memo for expensive components
- Implement proper error boundaries
- Optimize bundle size

### 5. User Experience

- Provide loading states
- Show appropriate error messages
- Implement proper navigation
- Maintain consistent styling

## 🚨 Troubleshooting

### Common Issues

1. **Route Not Found**
   - Check route path spelling
   - Verify route is in mainRouteList
   - Ensure component is properly imported

2. **Access Denied**
   - Check user authentication status
   - Verify user role permissions
   - Ensure route authRoles are correct

3. **Authentication Errors**
   - Check API endpoint configuration
   - Verify token storage
   - Check network connectivity

4. **Theme Issues**
   - Ensure ThemeProvider wraps the app
   - Check CSS variable definitions
   - Verify theme toggle functionality

### Debug Tools

```typescript
// Debug authentication state
const { user, isAuthenticated, error } = useAuthService();
console.log('Auth State:', { user, isAuthenticated, error });

// Debug route access
import { hasRoleAccess } from '@/utils/authHelper';
console.log('Role Check:', {
  isSuper: hasRoleAccess({ allowedRoles: ['SUPER'], userRoles: [user?.role] }),
  isAdmin: hasRoleAccess({
    allowedRoles: ['ADMIN', 'SUPER'],
    userRoles: [user?.role],
  }),
});
```

## 📖 Additional Resources

- [React Router Documentation](https://reactrouter.com/)
- [React Context Documentation](https://reactjs.org/docs/context.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
