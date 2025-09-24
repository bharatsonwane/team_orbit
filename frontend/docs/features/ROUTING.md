# Routing and Navigation Guide

This document describes the advanced routing setup and navigation patterns used in the TeamOrbit frontend application.

## 🛣️ Unified Navigation System

### Overview

TeamOrbit uses a **unified navigation configuration** within AppRouter that serves as a single source of truth for both routing and sidebar navigation. This eliminates duplication and ensures consistency between routes and navigation items.

### Configuration

**File:** `src/components/AppRouter.tsx`

The navigation system is built around centralized interfaces and configuration:

```tsx
// Interface for actual routes
export interface AuthRoute {
  title: string;
  authRoles: string[];
  path: string;        // Required for routes
  description?: string;
  element: ReactNode;  // Required for routes
}

// Interface for navigation hierarchy
export interface SidebarRouteWithChildren {
  title: string;
  authRoles: string[];
  path?: string;         // Optional - parent items may not have paths
  description?: string;
  href?: string;         // For navigation links
  element?: ReactNode;   // Optional - parent items may not have elements
  childItems?: SidebarRouteWithChildren[]; // Recursive hierarchy
  icon?: LucideIcon;     // For UI display
}

export const sidebarNavigationItems: SidebarRouteWithChildren[] = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    authRoles: [roleKeys.ANY],
    element: <Dashboard />,
    description: 'User dashboard',
    layout: 'app',
  },
  // ... more navigation items
];
```

### Router Implementation

**File:** `src/App.tsx`

The application uses React Router v6 with advanced route protection:

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { RouteGuardRenderer, mainRouteList } from './components/AppRouter';

function App() {
  return (
      <Routes>
      {mainRouteList.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <RouteGuardRenderer authRoles={route.authRoles}>
              {route.element}
            </RouteGuardRenderer>
          }
        />
      ))}
      
      {/* Automatic redirect for undefined routes */}
      <Route
        path="*"
        element={
          <RouteGuardRenderer authRoles={[roleKeys.ANY]}>
            <Navigate to="/dashboard" replace />
          </RouteGuardRenderer>
        }
      />
      </Routes>
  );
}
```

## 📍 Route Categories

### Public Routes (No Authentication)

- **`/login`** - User authentication page
- **`/signup`** - User registration page

### Protected Routes (Authenticated Users)

All protected routes automatically include the AppLayout with sidebar navigation.

#### Core Application Routes
- **`/dashboard`** - Main dashboard (all users)
- **`/profile`** - User profile management (all users)
- **`/`** - Home page (all users)

#### Platform Management (USER_ROLE_PLATFORM_ADMIN/Super Admin/Manager)
- **`/tenant-management`** - Create and manage tenant organizations

#### Multi-Tenant Management (Admin/Super Admin)
- **`/workspace/settings`** - Workspace configuration
- **`/workspace/branding`** - Custom branding settings
- **`/workspace/domain`** - Domain configuration (Super Admin only)

#### Employee Management
- **`/employees`** - Employee directory (all users)
- **`/employees/onboarding`** - Onboarding process (Admin/Super Admin)
- **`/departments`** - Department management (Admin/Super Admin)
- **`/teams`** - Team structures (all users)

#### Attendance & Leave
- **`/attendance/checkin`** - Check in/out (all users)
- **`/attendance/logs`** - Attendance history (all users)
- **`/leave/requests`** - Leave requests (all users)
- **`/leave/approvals`** - Leave approvals (Admin/Super Admin)
- **`/attendance/analytics`** - Analytics dashboard (Admin/Super Admin)

#### Training & Learning (LMS)
- **`/training/my-learning`** - Personal learning (all users)
- **`/training/assessments`** - Quizzes and tests (all users)
- **`/training/certificates`** - Earned certificates (all users)
- **`/training/programs`** - Program management (Admin/Super Admin)
- **`/training/progress`** - Progress tracking (Admin/Super Admin)

#### Social Network
- **`/social/feed`** - Company newsfeed (all users)
- **`/social/polls`** - Polls and surveys (all users)
- **`/social/announcements`** - Announcements (Admin/Super Admin)
- **`/social/updates`** - Company updates (Admin/Super Admin)

#### Team Chat
- **`/chat/messages`** - Private messaging (all users)
- **`/chat/channels`** - Team channels (all users)
- **`/chat/files`** - File sharing (all users)

#### General
- **`/notifications`** - Notification center (all users)
- **`/settings`** - Application settings (all users)

### Special Routes
- **`/admin`** - Admin dashboard (Admin/Super Admin)
- **`/super-admin`** - Super admin panel (Super Admin only)

## 🔐 Role-Based Access Control

### Role Hierarchy

The application supports a comprehensive multi-tenant role system:

#### **Platform Roles** (System-wide access)
1. **`platformSuperAdmin`** - Platform Super Administrator
2. **`platformAdmin`** - Platform Administrator
3. **`platformUser`** - Platform User
4. **`platformAgent`** - Platform Agent
5. **`platformManager`** - USER_ROLE_PLATFORM_USER
6. **`platformAuditor`** - Platform Auditor

#### **Tenant Roles** (Organization-specific access)
1. **`tenantAdmin`** - Tenant Administrator
2. **`tenantManager`** - Tenant Manager
3. **`tenantAgent`** - Tenant Agent
4. **`tenantUser`** - Tenant User
5. **`tenantEmployee`** - Tenant Employee

#### **Special Roles**
- **`any`** - All authenticated users (used for universal access)

### Permission Matrix

| Feature Category | Tenant Employee | Tenant User | Tenant Manager | Tenant Admin | Platform Roles |
|------------------|----------------|-------------|----------------|--------------|----------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Employee Directory | ✅ | ✅ | ✅ | ✅ | ✅ |
| Teams | ✅ | ✅ | ✅ | ✅ | ✅ |
| Attendance/Leave (Personal) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Training (Personal) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Social Network (View) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chat & Messaging | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Tenant Management** | ❌ | ❌ | ❌ | ❌ | **USER_ROLE_PLATFORM_ADMIN/Super Admin/Manager Only** |
| Employee Onboarding | ❌ | ❌ | ✅ | ✅ | ✅ |
| Department Management | ❌ | ❌ | ✅ | ✅ | ✅ |
| Leave Approvals | ❌ | ❌ | ✅ | ✅ | ✅ |
| Training Management | ❌ | ❌ | ✅ | ✅ | ✅ |
| Analytics & Reports | ❌ | ❌ | ✅ | ✅ | ✅ |
| Workspace Settings | ❌ | ❌ | ❌ | ✅ | ✅ |
| Announcements | ❌ | ❌ | ✅ | ✅ | ✅ |
| Domain Configuration | ❌ | ❌ | ❌ | ❌ | USER_ROLE_PLATFORM_SUPER_ADMIN Only |

### Role Descriptions

#### **Tenant Roles**
- **Tenant Employee** - Basic employee with personal features access
- **Tenant User** - Standard user with team collaboration features
- **Tenant Manager** - Department/team management capabilities
- **Tenant Admin** - Full tenant administration (workspace settings, user management)

#### **Platform Roles**
- **USER_ROLE_PLATFORM_SUPER_ADMIN** - System-wide administration and configuration
- **USER_ROLE_PLATFORM_ADMIN** - Platform-level user and tenant management
- **Platform User/Agent/Manager/Auditor** - Various platform-specific roles with specialized access

## 🎨 Layout System

### Layout Types

The routing system supports multiple layout types:

#### **1. App Layout (`layout: 'app'`)**
- **Default layout** for most authenticated pages
- **Includes:** Sidebar navigation, breadcrumbs, theme toggle
- **Best for:** Dashboard, forms, data tables, content pages

#### **2. Auth Layout (`layout: 'auth'`)**
- **Minimal layout** for authentication pages
- **Includes:** Theme toggle, centered content
- **Best for:** Login, signup, password reset

#### **3. No Layout (`layout: 'none'`)**
- **Full-screen layout** with no chrome
- **Includes:** Nothing - raw component only
- **Best for:** Presentations, reports, full-screen experiences

#### **4. Custom Layout (`layout: CustomComponent`)**
- **Custom layout component** for specialized needs
- **Includes:** Whatever the custom component provides
- **Best for:** Unique page requirements

### Layout Usage

```tsx
// Standard app page with sidebar
{
  title: 'Dashboard',
  href: '/dashboard',
  element: <Dashboard />,
  layout: 'app', // Shows sidebar + breadcrumbs
}

// Full-screen page
{
  title: 'Presentation',
  href: '/presentation',
  element: <Presentation />,
  layout: 'none', // No sidebar, full screen
}

// Custom layout
{
  title: 'Report',
  href: '/report',
  element: <Report />,
  layout: ReportLayoutComponent, // Custom layout
}
```

## 🔄 Smart Routing Behavior

### Automatic Redirects

The application implements intelligent routing behavior:

#### **Undefined Routes**
- **Behavior:** Any route not defined in the navigation config automatically redirects to `/dashboard`
- **Examples:** `/random-page`, `/attendance/checkin1`, `/invalid-url`
- **User Experience:** Seamless redirect without error pages

#### **Access Denied**
- **Behavior:** Routes without proper permissions show "Access Denied" page
- **Includes:** Home and Login buttons for recovery
- **User Experience:** Clear messaging about insufficient permissions

#### **Unauthenticated Access**
- **Behavior:** Protected routes redirect to `/login` when not authenticated
- **Preserves:** Intended destination for post-login redirect
- **User Experience:** Smooth authentication flow

### Route Protection Flow

```tsx
// 1. Route Guard checks authentication
const isAuthorized = checkUserAuthorization();

// 2. Handle different scenarios
if (!isAuthorized) {
  return <AccessDeniedPage />; // Show access denied
}

if (routes.length > 0) {
  return (
    <Routes>
      {/* Defined routes */}
      {routes.map(route => <Route ... />)}
      
      {/* Undefined routes → Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// 3. Default behavior for direct route access
return <>{children}</>;
```

## 📱 Navigation Components

### AppSidebar

**File:** `src/components/AppSidebar.tsx`

Features:
- **Role-based filtering** - Shows only accessible navigation items
- **Collapsible sections** - Organized feature groupings
- **Active state management** - Highlights current page/section
- **User profile display** - Shows logged-in user info
- **Theme integration** - Supports dark/light mode switching

### AppLayout

**File:** `src/components/AppLayout.tsx`

Features:
- **Sidebar integration** - Includes AppSidebar component
- **Breadcrumb navigation** - Context-aware navigation trails
- **Responsive design** - Mobile-friendly sidebar toggle
- **Content area** - Proper spacing and layout for page content
- **Component:** `Signup.tsx`
- **Description:** User registration page
- **Features:**
  - Complete registration form
  - Real-time validation
  - Error handling
  - Redirect to dashboard on success

### Dashboard Page

- **Path:** `/dashboard`
- **Component:** `Dashboard.tsx`
- **Description:** Demo page showcasing theme capabilities
- **Features:**
  - Theme demonstration
  - Interactive elements
  - Navigation menu

## 🔗 Navigation Patterns

### Link Component

Use React Router's `Link` component for navigation:

```tsx
import { Link } from "react-router-dom"

// Basic link
<Link to="/login">Sign In</Link>

// With styling
<Link
  to="/signup"
  className="text-primary hover:underline font-medium"
>
  Sign Up
</Link>

// Button-style link
<Button asChild>
  <Link to="/dashboard">Go to Dashboard</Link>
</Button>
```

### Programmatic Navigation

Use `useNavigate` hook for programmatic navigation:

```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleBack = () => {
    navigate(-1); // Go back
  };

  return (
    <div>
      <Button onClick={handleSuccess}>Success</Button>
      <Button onClick={handleBack}>Back</Button>
    </div>
  );
}
```

## 🎨 Navigation Components

### Header Navigation

Each page includes a consistent header with theme toggle:

```tsx
// Theme toggle in top right
<div className='absolute top-4 right-4'>
  <ThemeToggle />
</div>
```

### Page-Specific Navigation

Different pages have different navigation patterns:

#### Home Page

- Primary CTA buttons to login/signup
- Feature cards with information
- No back navigation needed

#### Auth Pages (Login/Signup)

- Cross-links between login and signup
- No back navigation (standalone pages)
- Redirect to dashboard on success

#### Dashboard Page

- Header with navigation menu
- Links to all other pages
- Theme toggle in header

## 🔄 Navigation Flow

### User Journey

1. **Landing** → User visits home page
2. **Auth Choice** → User clicks "Sign In" or "Sign Up"
3. **Authentication** → User fills form and submits
4. **Success** → Redirect to dashboard
5. **Navigation** → User can navigate between pages

### Flow Diagram

```
Home (/)
├── Login (/login)
│   └── Dashboard (/dashboard)
└── Signup (/signup)
    └── Dashboard (/dashboard)
```

## 🛡️ Route Protection

### Current Implementation

Currently, all routes are public. Future enhancements could include:

- Protected routes for authenticated users
- Redirect logic for unauthenticated users
- Role-based access control

### Example Protected Route

```tsx
// Future implementation
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuth(); // Custom hook
  return isAuthenticated ? children : <Navigate to='/login' />;
}

// Usage
<Route
  path='/dashboard'
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>;
```

## 📱 Responsive Navigation

### Mobile Considerations

- Navigation buttons stack vertically on mobile
- Touch-friendly button sizes
- Responsive text and spacing

### Example Responsive Navigation

```tsx
// Responsive button layout
<div className='flex flex-col sm:flex-row gap-4 justify-center'>
  <Button asChild size='lg'>
    <Link to='/login'>Sign In</Link>
  </Button>
  <Button asChild variant='outline' size='lg'>
    <Link to='/signup'>Sign Up</Link>
  </Button>
</div>
```

## 🎯 Navigation Best Practices

### Link Styling

- Use consistent styling for links
- Provide visual feedback on hover
- Ensure proper contrast ratios
- Use descriptive link text

### Button Navigation

- Use `asChild` prop with shadcn/ui Button
- Maintain consistent button styles
- Provide loading states for async actions

### Error Handling

- Handle navigation errors gracefully
- Provide fallback routes
- Show appropriate error messages

## 🔧 Adding New Routes

### Step 1: Create Page Component

```tsx
// src/pages/NewPage.tsx
export default function NewPage() {
  return (
    <div className='min-h-screen bg-background'>
      <h1>New Page</h1>
    </div>
  );
}
```

### Step 2: Add Route

```tsx
// src/App.tsx
import NewPage from './pages/NewPage';

// Add to Routes
<Route path='/new-page' element={<NewPage />} />;
```

### Step 3: Add Navigation

```tsx
// Add links where needed
<Link to='/new-page'>New Page</Link>
```

## 📚 Resources

- [React Router Documentation](https://reactrouter.com/)
- [React Router v6 Guide](https://reactrouter.com/en/main/upgrading/v5)
- [Navigation Patterns](https://reactrouter.com/en/main/start/tutorial)
