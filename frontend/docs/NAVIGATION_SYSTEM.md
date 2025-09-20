# Navigation System Documentation

Complete guide to the TeamOrbit unified navigation and routing system.

## 🎯 Overview

TeamOrbit implements a **unified navigation system** that serves as a single source of truth for both routing and sidebar navigation. This eliminates duplication and ensures perfect synchronization between routes and navigation items.

## 🏗️ Architecture

### Core Components

1. **`/src/config/navigation.tsx`** - Unified navigation configuration
2. **`/src/components/AppSidebar.tsx`** - Role-based sidebar navigation
3. **`/src/components/AppLayout.tsx`** - Layout wrapper with sidebar
4. **`/src/components/AppRouter.tsx`** - Main application router with route protection
5. **`/src/components/ComingSoon.tsx`** - Professional placeholder component

### Data Flow

```
navigation.tsx → AppSidebar (for navigation)
                ↓
navigation.tsx → AppRouter (for routing)
                ↓
App.tsx → Renders routes with protection
```

## 📋 Navigation Configuration

### NavigationItem Interface

```typescript
export interface NavigationItem {
  title: string;                    // Display name
  icon?: React.ComponentType;       // Lucide icon component
  href?: string;                    // Route path
  authRoles: UserRole[];           // Required permissions
  element?: React.ReactElement;     // Page component
  description?: string;             // Route description
  layout?: 'app' | 'auth' | 'none' | React.ComponentType; // Layout type
  items?: NavigationItem[];        // Nested navigation items
}
```

### Example Configuration

```typescript
export const navigationConfig: NavigationItem[] = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    authRoles: [roleKeys.ANY],
    element: <Dashboard />,
    description: 'User dashboard',
    layout: 'app',
  },
  {
    title: 'Employee Management',
    icon: Users,
    authRoles: [roleKeys.ANY],
    items: [
      {
        title: 'Employee Directory',
        href: '/employees',
        icon: Users,
        authRoles: [roleKeys.ANY],
        element: <ComingSoon title="Employee Directory" />,
        layout: 'app',
      },
      {
        title: 'Onboarding',
        href: '/employees/onboarding',
        icon: UserCheck,
        authRoles: [roleKeys.ADMIN, roleKeys.SUPER],
        element: <ComingSoon title="Employee Onboarding" />,
        layout: 'app',
      },
    ],
  },
];
```

## 🔐 Role-Based Access Control

### User Roles

The application now supports a comprehensive multi-tenant role system:

#### **Platform Roles** (System-wide access)
| Role | Description | Access Level |
|------|-------------|--------------|
| `platformSuperAdmin` | Platform Super Administrator | Full system access |
| `platformAdmin` | Platform Administrator | Platform management |
| `platformUser` | Platform User | Platform features |
| `platformAgent` | Platform Agent | Agent-specific features |
| `platformManager` | Platform Manager | Management features |
| `platformAuditor` | Platform Auditor | Audit and compliance |

#### **Tenant Roles** (Organization-specific access)
| Role | Description | Access Level |
|------|-------------|--------------|
| `tenantAdmin` | Tenant Administrator | Full tenant access |
| `tenantManager` | Tenant Manager | Management features |
| `tenantAgent` | Tenant Agent | Agent features |
| `tenantUser` | Tenant User | Standard user features |
| `tenantEmployee` | Tenant Employee | Basic employee features |

#### **Special Roles**
| Role | Description | Access Level |
|------|-------------|--------------|
| `any` | All authenticated users | Universal access marker |

### Role System Evolution

**Note:** The frontend is currently transitioning from a simple role system to the comprehensive multi-tenant role system:

#### **Legacy Roles** (Being phased out)
```typescript
// Old simple system
export const roleKeys = {
  USER: 'USER',
  ADMIN: 'ADMIN', 
  SUPER: 'SUPER',
  ANY: 'ANY',
} as const;
```

#### **New Comprehensive System** (Current backend)
```typescript
// New multi-tenant system
export const roleKeys = {
  platformSuperAdmin: 'Platform Super Admin',
  platformAdmin: 'Platform Admin',
  // ... more platform roles
  tenantAdmin: 'Tenant Admin',
  tenantManager: 'Tenant Manager',
  // ... more tenant roles
  any: 'Any',
};
```

The frontend navigation system is designed to be compatible with both systems during the transition period.

### Permission Examples

```typescript
// Available to all authenticated users
authRoles: [roleKeys.any]

// Tenant management features
authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager]

// Platform administration
authRoles: [roleKeys.platformSuperAdmin, roleKeys.platformAdmin]

// Employee-level access
authRoles: [roleKeys.tenantEmployee, roleKeys.tenantUser, roleKeys.tenantAgent]

// Manager-level access across tenant and platform
authRoles: [
  roleKeys.tenantManager, 
  roleKeys.tenantAdmin,
  roleKeys.platformManager,
  roleKeys.platformAdmin,
  roleKeys.platformSuperAdmin
]

// Public route (no authentication required)
authRoles: []
```

### Dynamic Navigation Filtering

The sidebar automatically filters navigation items based on user permissions:

```typescript
// In AppSidebar.tsx
const hasAccess = (authRoles: UserRole[]) => {
  if (!loggedInUser) return false;
  
  // Handle the ANY role
  if (authRoles.includes(roleKeys.ANY as UserRole)) return true;
  
  // Check if user's role is in the allowed roles
  return authRoles.includes(loggedInUser.role as UserRole);
};

const filteredNavigationItems = filterNavigationItems(navigationItems);
```

## 🎨 Layout System

### Layout Types

#### **1. App Layout (`layout: 'app'`)**
- **Default for authenticated pages**
- **Includes:** Sidebar, breadcrumbs, theme toggle
- **Usage:** Dashboard, forms, data tables, content pages

#### **2. Auth Layout (`layout: 'auth'`)**
- **Minimal layout for authentication**
- **Includes:** Theme toggle, centered content
- **Usage:** Login, signup, password reset

#### **3. No Layout (`layout: 'none'`)**
- **Full-screen with no chrome**
- **Includes:** Nothing - raw component only
- **Usage:** Presentations, reports, full-screen experiences

#### **4. Custom Layout (`layout: CustomComponent`)**
- **Custom layout component**
- **Includes:** Whatever the custom component provides
- **Usage:** Specialized page requirements

### Layout Implementation

The layout system is handled automatically in the routing logic:

```typescript
// In App.tsx (conceptual - actual implementation in AppRouter)
const getLayoutComponent = (layout) => {
  if (!layout || layout === 'app') return AppLayout;
  if (layout === 'none') return ({ children }) => <>{children}</>;
  if (typeof layout === 'function') return layout;
  return AppLayout; // default fallback
};

<LayoutComponent>
  {route.element}
</LayoutComponent>
```

## 🔄 Smart Routing Behavior

### Automatic Redirects

#### **Undefined Routes**
- **Input:** `/attendance/checkin1` (doesn't exist)
- **Behavior:** Automatic redirect to `/dashboard`
- **User Experience:** No error pages, seamless recovery

#### **Access Denied**
- **Input:** User without permissions tries to access admin route
- **Behavior:** Shows "Access Denied" page with recovery options
- **User Experience:** Clear messaging with navigation options

#### **Unauthenticated Access**
- **Input:** Non-logged-in user tries to access protected route
- **Behavior:** Redirect to `/login` with return URL preservation
- **User Experience:** Smooth authentication flow

### Route Protection Flow

```typescript
// 1. Check authentication
if (!isAuthorized) {
  return <AccessDeniedPage />;
}

// 2. Handle nested routes
if (routes.length > 0) {
  return (
    <Routes>
      {routes.map(route => <Route ... />)}
      {/* Catch-all: undefined routes → dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// 3. Default: render children
return <>{children}</>;
```

## 🛠️ Development Workflow

### Adding New Features

To add a new feature to TeamOrbit:

#### **1. Add to Navigation Config**

```typescript
// In src/config/navigation.tsx
{
  title: 'New Feature',
  icon: NewFeatureIcon,
  href: '/new-feature',
  authRoles: [roleKeys.ANY],
  element: <ComingSoon title="New Feature" description="Feature description" />,
  description: 'New feature description',
  layout: 'app',
}
```

This automatically:
- ✅ Adds to sidebar navigation
- ✅ Creates the route
- ✅ Applies role-based access
- ✅ Uses specified layout

#### **2. Replace ComingSoon with Real Component**

```typescript
// Replace placeholder
element: <ComingSoon title="New Feature" />

// With actual component
element: <NewFeatureComponent />
```

#### **3. Test Role-Based Access**

- Login with different user roles
- Verify navigation visibility
- Test route access permissions

### Navigation Structure

The navigation is organized hierarchically:

```
📊 Dashboard
🏢 Multi-Tenant
   ⚙️ Workspace Settings
   🎨 Branding  
   🛡️ Domain Config
👥 Employee Management
   👥 Employee Directory
   ✅ Onboarding
   🏢 Departments
   👥 Teams
⏰ Attendance & Leave
   ⏰ Check In/Out
   📊 Attendance Logs
   📅 Leave Requests
   ✅ Leave Approvals
   📊 Analytics
🎓 Training & Learning
   📚 Training Programs
   🎓 My Learning
   📝 Assessments
   🏆 Certificates
   📊 Progress Tracking
📱 Social Network
   📰 Newsfeed
   📢 Announcements
   📊 Polls & Surveys
   📰 Company Updates
💬 Team Chat
   💬 Messages
   📺 Team Channels
   📎 File Sharing
🔔 Notifications
⚙️ Settings
```

## 🔧 Configuration Management

### Helper Functions

```typescript
// Get navigation items for sidebar
export const getNavigationItems = (): NavigationItem[] => {
  return navigationConfig;
};

// Get all routes for routing
export const getAllProtectedRoutes = (): NavigationItem[] => {
  return [
    ...flattenNavigationToRoutes(navigationConfig),
    ...additionalRoutes,
  ];
};

// Flatten nested navigation to routes
export const flattenNavigationToRoutes = (items: NavigationItem[]): NavigationItem[] => {
  const routes: NavigationItem[] = [];
  
  const processItem = (item: NavigationItem) => {
    if (item.href && item.element) {
      routes.push(item);
    }
    
    if (item.items) {
      item.items.forEach(processItem);
    }
  };
  
  items.forEach(processItem);
  return routes;
};
```

### Route Conversion

The system automatically converts NavigationItems to AuthRoutes:

```typescript
const navigationToAuthRoute = (navItems: NavigationItem[]): AuthRoute[] => {
  return navItems.map(item => ({
    path: item.href!,
    element: item.element!,
    authRoles: item.authRoles,
    title: item.title,
    description: item.description,
  }));
};
```

## 🚀 Benefits

### **1. Single Source of Truth**
- ✅ No duplication between navigation and routes
- ✅ Automatic synchronization
- ✅ Easier maintenance

### **2. Role-Based Security**
- ✅ Navigation automatically filters by permissions
- ✅ Routes protected by same permissions
- ✅ Consistent access control

### **3. Developer Experience**
- ✅ Add one config entry → Get navigation + route
- ✅ TypeScript support for all configurations
- ✅ Easy to understand and maintain

### **4. User Experience**
- ✅ Consistent navigation experience
- ✅ No broken links or missing pages
- ✅ Automatic redirects for invalid routes
- ✅ Professional placeholder pages

### **5. Scalability**
- ✅ Easy to add new features
- ✅ Flexible layout system
- ✅ Supports complex permission hierarchies
- ✅ Ready for multi-tenant customization

This unified navigation system provides a robust, scalable foundation for the TeamOrbit application with excellent developer experience and user-friendly behavior.
