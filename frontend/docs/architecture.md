# Frontend Architecture

Comprehensive overview of the TeamOrbit frontend architecture, design patterns, and system components.

## 🏗️ System Architecture

TeamOrbit frontend follows a modern, component-based architecture with clear separation of concerns.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Desktop   │  │   Tablet    │  │   Mobile    │        │
│  │  (1920px+)  │  │  (768-1920) │  │   (<768px)  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  React Application Layer                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              React Router (v7)                          ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    ││
│  │  │   Public    │  │  Protected  │  │    Admin    │    ││
│  │  │   Routes    │  │   Routes    │  │   Routes    │    ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              State Management Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Redux     │  │   Context   │  │    Local    │        │
│  │   Toolkit   │  │     API     │  │   State     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Component Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Pages    │  │ Components  │  │  shadcn/ui  │        │
│  │  (Routes)   │  │  (Custom)   │  │  (Library)  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Services Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Axios    │  │  Utilities  │  │  Validators │        │
│  │     API     │  │  (Helpers)  │  │    (Zod)    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (REST)                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │   http://localhost:5100/api                             ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/              # Reusable components
│   │   ├── ui/                 # shadcn/ui components (46 components)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   └── ... (42 more)
│   │   ├── routing/            # Routing components
│   │   │   ├── AppRoutes.tsx   # Route configuration
│   │   │   └── RouteGuardRenderer.tsx  # Route protection
│   │   ├── AppLayout.tsx       # Main layout wrapper
│   │   ├── AppSidebar.tsx      # Navigation sidebar
│   │   ├── AddUserModal.tsx    # Unified user modal (platform & tenant)
│   │   ├── ComingSoon.tsx      # Placeholder component
│   │   ├── theme-provider.tsx  # Theme context provider
│   │   └── theme-toggle.tsx    # Theme switcher component
│   │
│   ├── pages/                  # Page components organized by context
│   │   ├── auth/               # Public authentication pages
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   ├── platform/           # Platform admin pages
│   │   │   ├── PlatformDashboard.tsx
│   │   │   ├── notification/
│   │   │   │   └── PlatformNotifications.tsx
│   │   │   ├── tenant/
│   │   │   │   ├── Tenants.tsx
│   │   │   │   ├── TenantDetail.tsx
│   │   │   │   ├── Employees.tsx
│   │   │   │   └── components/
│   │   │   │       ├── CreateTenantModal.tsx
│   │   │   │       ├── EditTenantModal.tsx
│   │   │   │       ├── EditUserModal.tsx
│   │   │   │       └── TenantCard.tsx
│   │   │   └── users/
│   │   │       └── PlatformUsers.tsx
│   │   ├── tenant/             # Tenant user pages
│   │   │   ├── TenantHome.tsx
│   │   │   └── TenantNotifications.tsx
│   │   └── profile/            # Shared profile pages
│   │       └── Profile.tsx
│   │
│   ├── contexts/               # React Context providers
│   │   └── AuthContextProvider.tsx # Authentication context
│   │
│   ├── redux/                  # Redux state management
│   │   ├── store.tsx          # Redux store configuration
│   │   ├── slices/            # Redux slices
│   │   │   ├── userSlice.ts
│   │   │   └── notificationSlice.ts
│   │   └── actions/           # Async actions
│   │       ├── userActions.ts
│   │       └── notificationActions.ts
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── use-mobile.ts      # Mobile detection hook
│   │
│   ├── utils/                  # Utility functions
│   │   ├── authHelper.ts      # Authentication helpers
│   │   ├── axiosApi.ts        # Axios configuration
│   │   ├── constants.ts       # Application constants
│   │   ├── date.ts            # Date utilities
│   │   └── logger.ts          # Logging utilities
│   │
│   ├── schemas/                # TypeScript types & Zod schemas
│   │   ├── user.ts            # User types
│   │   ├── lookup.ts          # Lookup data types
│   │   ├── notification.ts    # Notification types
│   │   └── validation.ts      # Zod validation schemas
│   │
│   ├── config/                 # Configuration
│   │   └── envVariable.ts     # Environment variables
│   │
│   ├── lib/                    # External library utilities
│   │   └── utils.ts           # Tailwind utility functions
│   │
│   ├── assets/                 # Static assets
│   │   └── react.svg
│   │
│   ├── examples/               # Example implementations
│   │   └── AppWithHooks.tsx   # Routing examples
│   │
│   ├── App.tsx                 # Main app component
│   ├── main.tsx               # Application entry point
│   ├── index.css              # Global styles
│   └── vite-env.d.ts          # Vite type declarations
│
├── public/                     # Public static files
│   └── vite.svg
│
├── docs/                       # Documentation
├── dist/                       # Build output (generated)
├── node_modules/              # Dependencies (generated)
│
├── components.json            # shadcn/ui configuration
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json         # App TypeScript config
├── tsconfig.node.json        # Node TypeScript config
├── vite.config.ts            # Vite configuration
├── eslint.config.js          # ESLint configuration
└── env.example              # Environment variables template
```

## 🏢 Multi-Tenant Architecture

TeamOrbit implements a sophisticated multi-tenant architecture that separates platform administration from tenant-specific operations.

### Route Contexts

**Platform Context** (`/platform/*`):
- For system administrators managing the overall platform
- Access to tenant management, platform users, and system-wide settings
- Routes include tenant ID as URL parameter when accessing tenant-specific data
- Example: `/platform/tenant/:tenantId/employees`

**Tenant Context** (`/tenant/:tenantId/*`):
- For users within a specific organization
- All routes include the tenant ID in the URL
- Tenant users are restricted to their own tenant's data
- Example: `/tenant/5/home`

### TenantId Management

The `AuthContextProvider` manages tenant ID resolution based on user roles:

**For Platform Users**:
- TenantId extracted from URL parameters
- Can access different tenants by changing the URL
- Provides flexibility for cross-tenant administration

**For Tenant Users**:
- TenantId from `loggedInUser.tenantId`
- Automatically enforced - prevents accessing other tenants
- If URL tenant doesn't match user's tenant, redirected to correct tenant

### Unified User Management

- Single API endpoint `/api/user/list` for both platform and tenant users
- Differentiated by `roleCategory` query parameter ("PLATFORM" or "TENANT")
- Unified `AddUserModal` component adapts behavior based on context
- Consistent user experience across platform and tenant contexts

## 🔄 Application Flow

### 1. Initialization Flow

```
Application Start
    │
    ▼
main.tsx
    │
    ├─> Redux Provider (store)
    ├─> React Router (BrowserRouter)
    ├─> Theme Provider
    └─> Auth Provider (with TenantId management)
        │
        ▼
    App.tsx
        │
        ├─> Route Configuration (Platform & Tenant routes)
        ├─> Route Guards (Role-based access)
        └─> Layout Rendering (Context-aware sidebar)
```

### 2. Authentication Flow

```
User Login
    │
    ▼
Login Page (Login.tsx)
    │
    ├─> Form Validation (Zod)
    ├─> Submit Credentials
    │
    ▼
Auth Context (login function)
    │
    ├─> Dispatch loginAction (Redux)
    ├─> Call Backend API
    │
    ▼
Backend Response
    │
    ├─> Store JWT in Cookie
    ├─> Update User State
    ├─> Navigate to Dashboard
```

### 3. Protected Route Flow

```
Access Protected Route
    │
    ▼
RouteGuardRenderer
    │
    ├─> Check JWT Token
    ├─> Fetch User Profile
    │
    ▼
Has Valid Token?
    │
    ├─> YES: Render Route
    │
    └─> NO: Redirect to Login
```

## 🎯 Design Principles

### 1. Component Composition

```typescript
// Small, focused components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### 2. Type Safety

```typescript
// Full TypeScript coverage
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

const getUser = (id: number): Promise<User> => {
  // Implementation
};
```

### 3. State Management Strategy

- **Local State**: Component-specific UI state
- **Context API**: Shared state (auth, theme)
- **Redux**: Global application state (user, notifications)

### 4. Responsive Design

```typescript
// Mobile-first approach
<div className="
  p-4                    // Base (mobile)
  md:p-6                 // Tablet
  lg:p-8                 // Desktop
">
```

## 🔧 Key Technologies

### Core Stack

| Technology       | Version | Purpose      |
| ---------------- | ------- | ------------ |
| **React**        | 19.1.1  | UI framework |
| **TypeScript**   | 5.8.3   | Type safety  |
| **Vite**         | 7.1.2   | Build tool   |
| **Tailwind CSS** | 4.1.13  | Styling      |
| **React Router** | 7.8.2   | Routing      |

### State Management

| Technology        | Version | Purpose        |
| ----------------- | ------- | -------------- |
| **Redux Toolkit** | 2.9.0   | Global state   |
| **React Redux**   | 9.2.0   | React bindings |

### UI Components

| Technology       | Version | Purpose             |
| ---------------- | ------- | ------------------- |
| **Radix UI**     | Various | Headless components |
| **shadcn/ui**    | Custom  | Component library   |
| **Lucide React** | 0.544.0 | Icons               |

### Form Handling

| Technology              | Version | Purpose              |
| ----------------------- | ------- | -------------------- |
| **React Hook Form**     | 7.62.0  | Form management      |
| **Zod**                 | 4.1.11  | Validation           |
| **@hookform/resolvers** | 5.2.1   | Form-Zod integration |

### API & Data

| Technology    | Version | Purpose           |
| ------------- | ------- | ----------------- |
| **Axios**     | 1.12.0  | HTTP client       |
| **js-cookie** | 3.0.5   | Cookie management |

### Theming

| Technology                   | Version | Purpose            |
| ---------------------------- | ------- | ------------------ |
| **next-themes**              | 0.4.6   | Theme management   |
| **tailwind-merge**           | 3.3.1   | Class merging      |
| **class-variance-authority** | 0.7.1   | Component variants |

## 📊 State Management Architecture

### Redux Store Structure

```typescript
{
  user: {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  notification: {
    notifications: Notification[],
    count: number,
    error: string | null
  }
}
```

### Context Providers

```
main.tsx
  ├─> Redux Provider
  ├─> Router Provider
  ├─> Theme Provider
  └─> Auth Provider
```

## 🔒 Security Architecture

### Authentication

- **JWT Storage**: Secure HTTP-only cookies
- **Token Validation**: Automatic on route change
- **Session Restoration**: On app reload
- **Auto Logout**: On token expiration

### API Security

- **Axios Interceptors**: Automatic token injection
- **Error Handling**: Global error interceptor
- **Request Timeout**: 30 second default
- **CORS**: Backend CORS configuration

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Layout Strategy

- **AppLayout**: Responsive sidebar (collapsible on mobile)
- **Grid System**: Tailwind CSS grid utilities
- **Flexbox**: Component-level layouts

## 🎨 Theming System

### Theme Variables

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  /* ... more variables */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  /* ... more variables */
}
```

### Theme Provider

```typescript
<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>
```

## 🔌 API Integration

### Axios Configuration

```typescript
// Base configuration
const axios = getAxios();

// Automatic features:
- Base URL from env
- JWT token injection
- Request/response interceptors
- Error handling
- Timeout configuration
```

### API Call Pattern

```typescript
const fetchUser = async (id: number) => {
  const response = await getAxios().get<User>(`/api/user/${id}`);
  return response.data;
};
```

## 📊 Performance Considerations

### Code Splitting

- **Route-based**: Automatic via Vite
- **Component-based**: Lazy loading for heavy components

### Optimization

- **React.memo**: Prevent unnecessary re-renders
- **useMemo**: Expensive computations
- **useCallback**: Function memoization
- **Lazy Loading**: Images and components

## 🧪 Testing Strategy

### Component Testing

```typescript
// Unit tests for components
import { render, screen } from '@testing-library/react';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Integration Testing

```typescript
// Test user flows
test("user can login", async () => {
  // Implementation
});
```

## 📚 Related Documentation

- [Pages Reference](pages.md) - Page components documentation
- [Redux Reference](redux.md) - State management details
- [Schemas Reference](schema.md) - Type definitions and validation
- [Utils Reference](utils.md) - Utility functions
- [Config Reference](config.md) - Configuration details

---

**For implementation details**: See specific reference documentation in this folder.
