# Frontend Architecture

## 🏗️ Application Structure

```
Application Entry Point
├── main.tsx (Root Provider Setup)
│   ├── StrictMode
│   ├── ThemeProvider (Theme Management)
│   └── AuthProvider (Authentication State)
│       └── App.tsx (Routing Logic)
│           ├── BrowserRouter
│           ├── Routes
│           └── Route Components
│               ├── RouteGuardRenderer (Access Control)
│               └── Page Components
```

## 📁 File Organization

```
src/
├── main.tsx                    # Application entry point with providers
├── App.tsx                     # Main app component with routing
├── types/
│   ├── user.ts                 # User and authentication types
│   └── route.ts                # Route configuration types
├── config/
│   └── envVariable.ts          # Environment variable validation
├── contexts/
│   └── AuthContext.tsx         # Authentication context and hooks
├── components/
│   ├── theme-provider.tsx      # Theme context provider
│   └── theme-toggle.tsx        # Theme switching component
├── lib/
│   └── utils.ts                # Utility functions (cn, etc.)
├── utils/
│   ├── routes.tsx              # Route configuration arrays
│   ├── logger.ts               # Logging utility
│   ├── axiosApi.ts             # Axios instance with interceptors
│   └── RouteGuard.tsx          # Route protection component
├── pages/                      # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── Profile.tsx
│   ├── Admin.tsx
│   └── SuperAdmin.tsx
└── docs/                       # Documentation
    └── ROUTING_SYSTEM.md
```

## 🔄 Provider Hierarchy

### 1. **main.tsx** - Root Level

```typescript
<StrictMode>
  <Router>
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </Router>
</StrictMode>
```

**Benefits:**

- Centralized provider setup
- Router available throughout the app
- Easy to use routing hooks anywhere
- Clean separation of concerns
- Easy to add new providers
- Better testing isolation

### 2. **App.tsx** - Routing Level

```typescript
<Routes>
  {/* Route components */}
</Routes>
```

**Benefits:**

- Focused on routing logic
- Can use routing hooks (useLocation, useNavigate, etc.)
- Clean component structure
- Easy to test routing behavior
- No provider clutter

## 🎯 Data Flow

### Authentication Flow

```
User Action → AuthContext → API Call → State Update → Route Guard → Page Render
```

### Theme Flow

```
Theme Toggle → ThemeProvider → CSS Variables → Component Re-render
```

### Route Protection Flow

```
Route Access → RouteGuard → AuthContext → Role Check → Allow/Deny
```

### Router Hook Usage

```
Any Component → useLocation/useNavigate → Router Context → Navigation/State
```

## 🔧 Router Hook Benefits

### Available Throughout the App

With `Router` in `main.tsx`, you can now use React Router hooks anywhere in the application:

```typescript
// In App.tsx or any component
import { useLocation, useNavigate, useParams } from 'react-router-dom'

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // Can access current route information
  console.log('Current path:', location.pathname)

  // Can navigate programmatically
  const handleNavigation = () => {
    navigate('/dashboard')
  }

  return (
    <Routes>
      {/* Route components */}
    </Routes>
  )
}
```

### Common Use Cases

- **Global navigation** - Navigate from any component
- **Route-based logic** - Show different content based on current route
- **Analytics tracking** - Track page views and user navigation
- **Breadcrumb navigation** - Build dynamic breadcrumbs
- **Route guards** - Enhanced route protection logic

## 🛡️ Security Layers

### 1. **Route Level Protection**

- RouteGuardRenderer checks authentication
- Role-based access control
- Automatic redirects

### 2. **Component Level Protection**

- useAuth hook for role checking
- Conditional rendering based on permissions
- Secure API calls

### 3. **API Level Protection**

- JWT token authentication
- Role-based endpoint access
- Error handling and feedback

## 🎨 Theme System

### CSS Variables Approach

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Theme Provider Features

- System preference detection
- Persistent theme storage
- Smooth transitions
- CSS variable updates

## 🔧 Type Safety

### TypeScript Integration

- Strict type checking enabled
- Interface definitions for all data structures
- Type-only imports where required
- No any types used

### Key Type Definitions

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

interface Route {
  path: string;
  element: React.ReactNode;
  authRoles: UserRole[];
  title?: string;
  description?: string;
}
```

## 🚀 Performance Considerations

### Code Splitting

- Route-based lazy loading (ready to implement)
- Component-level code splitting
- Bundle size optimization

### State Management

- React Context for global state
- Local state for component-specific data
- Efficient re-rendering with proper dependencies

### Caching

- JWT token caching in localStorage
- Theme preference caching
- API response caching (when implemented)

## 🧪 Testing Strategy

### Unit Testing

- Individual component testing
- Hook testing with React Testing Library
- Type safety validation

### Integration Testing

- Provider integration testing
- Route protection testing
- Authentication flow testing

### E2E Testing

- Complete user journey testing
- Cross-browser compatibility
- Accessibility testing

## 📱 Responsive Design

### Mobile-First Approach

- Tailwind CSS responsive utilities
- Flexible grid layouts
- Touch-friendly interfaces

### Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

## 🔍 Development Workflow

### 1. **Adding New Routes**

```typescript
// 1. Create page component
export default function NewPage() {
  return <div>New Page</div>
}

// 2. Add to route configuration
const newRoute: Route = {
  path: '/new-page',
  element: <NewPage />,
  authRoles: [roleKeys.USER],
  title: 'New Page'
}

// 3. Add to main route list
const mainRouteList: Route[] = [
  ...existingRoutes,
  newRoute
]
```

### 2. **Adding New Providers**

```typescript
// In main.tsx
<StrictMode>
  <ThemeProvider defaultTheme="system">
    <AuthProvider>
      <NewProvider>  {/* Add new provider here */}
        <App />
      </NewProvider>
    </AuthProvider>
  </ThemeProvider>
</StrictMode>
```

### 3. **Adding New Types**

```typescript
// In schemas/user.ts or schemas/route.ts
export interface NewType {
  property: string;
  value: number;
}
```

## 🎯 Best Practices

### 1. **Provider Management**

- Keep providers in main.tsx
- Use context for global state only
- Avoid prop drilling

### 2. **Route Organization**

- Group routes by access level
- Use descriptive route paths
- Include route metadata

### 3. **Component Structure**

- Keep components focused and small
- Use TypeScript for type safety
- Follow consistent naming conventions

### 4. **State Management**

- Use local state for component-specific data
- Use context for global application state
- Avoid unnecessary re-renders

### 5. **Error Handling**

- Provide user-friendly error messages
- Handle network errors gracefully
- Log errors for debugging

This architecture provides a solid foundation for a scalable, maintainable, and secure React application with proper separation of concerns and clean code organization.
