# Routing & Navigation System

Complete documentation for the routing and navigation architecture in TeamOrbit frontend.

## 📚 Overview

TeamOrbit uses React Router v7 with a role-based access control system, unified navigation configuration, and route guards for secure, organized routing.

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    App.tsx                              │
│         Main application entry point                    │
│         • Defines top-level <Routes>                    │
│         • Maps mainRouteList to <Route>                 │
│         • Wraps routes in RouteGuardRenderer            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              AppRouter.tsx                              │
│         Centralized route configuration                 │
│         • publicRouteList (Login, Signup)               │
│         • tenantSidebarNavigationItems (Hierarchy)            │
│         • protectedRouteList (All protected routes)     │
│         • RouteGuardRenderer (Access control)           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│          RouteGuardRenderer                             │
│         Role-based access control                       │
│         • Checks user authorization                     │
│         • Renders route or "Access Denied"              │
│         • Handles nested route protection               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              AppLayout.tsx                              │
│         Layout wrapper for protected routes             │
│         • Renders AppSidebar                            │
│         • Wraps page content                            │
│         • Provides consistent layout                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│             AppSidebar.tsx                              │
│         Dynamic navigation sidebar                      │
│         • Filters items by user role                    │
│         • Highlights active routes                      │
│         • Collapsible nested menus                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
src/
├── App.tsx                      # Main routing setup
├── components/
│   ├── AppRouter.tsx           # Route configuration
│   ├── AppLayout.tsx           # Layout wrapper
│   └── AppSidebar.tsx          # Navigation sidebar
├── pages/                      # Route components
└── utils/
    └── authHelper.ts           # Role access utilities
```

---

## 🔧 Core Configuration (AppRouter.tsx)

### Route Types

```typescript
// Basic route with role-based access
export interface AuthRoute {
  title: string;
  allowedRoles: UserRoleName[];
  path: string;
  description?: string;
  element: ReactNode;
}

// Navigation item with nested children and sidebar visibility control
export interface SidebarRouteWithChildren {
  isShownInSidebar: boolean; // Controls sidebar visibility
  title: string;
  allowedRoles: UserRoleName[];
  path?: string;
  description?: string;
  href?: string;
  element?: ReactNode;
  childItems?: SidebarRouteWithChildren[];
  icon?: LucideIcon;
  breadcrumbs?: BreadcrumbLayoutProps[];
}
```

### Public Routes

Routes accessible without authentication:

```typescript
export const publicRouteList: AuthRoute[] = [
  {
    path: '/login',
    element: <Login />,
    allowedRoles: [],
    title: 'Login',
    description: 'User login page',
  },
  {
    path: '/signup',
    element: <Signup />,
    allowedRoles: [],
    title: 'Sign Up',
    description: 'User registration page',
  },
];
```

### Sidebar Navigation Items

Hierarchical navigation structure with role-based access and sidebar visibility control:

```typescript
export const tenantSidebarNavigationItems: SidebarRouteWithChildren[] = [
  {
    isShownInSidebar: true,
    title: 'Home',
    path: '/home',
    element: <HomeScreen />,
    allowedRoles: [userRoleKeys.ANY],
  },
  {
    isShownInSidebar: true,
    title: 'Platform Management',
    icon: Home,
    allowedRoles: [
      userRoleKeys.PLATFORM_SUPER_ADMIN,
      userRoleKeys.PLATFORM_ADMIN,
    ],
    childItems: [
      {
        isShownInSidebar: true,
        title: 'Tenants',
        href: '/tenant-list',
        path: '/tenant-list',
        icon: Home,
        allowedRoles: [
          userRoleKeys.PLATFORM_SUPER_ADMIN,
          userRoleKeys.PLATFORM_ADMIN,
        ],
        element: <Tenants />,
      },
    ],
  },
  // Route-only item (not shown in sidebar)
  {
    isShownInSidebar: false,
    title: 'Tenant Detail',
    path: '/tenant/:id',
    element: <TenantDetail />,
    allowedRoles: [
      userRoleKeys.PLATFORM_ADMIN,
      userRoleKeys.PLATFORM_SUPER_ADMIN,
    ],
  },
  // ... more navigation items
];
```
### Main Route List

Complete route configuration:

```typescript
export const mainRouteList: AuthRoute[] = [
  // Public routes
  ...publicRouteList,

  // Protected routes with layout
  {
    path: '/*',
    element: (
      <AppLayout>
        <RouteGuardRenderer routes={protectedRouteList} />
      </AppLayout>
    ),
    allowedRoles: [userRoleKeys.ANY],
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist.',
  },
];
```

---

## 🛡️ Route Guard System

### RouteGuardRenderer Component

Protects routes based on user roles:

```typescript
export const RouteGuardRenderer: React.FC<RouteGuardRendererProps> = ({
  children,
  allowedRoles = [],
  routes = [],
}) => {
  const { loggedInUser } = useAuthService();

  const isAuthorized = hasRoleAccess({
    allowedRoleNames: allowedRoles,
    userRoles: loggedInUser?.roles || [],
  });

  if (!isAuthorized) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center'>
          <h1>Access Denied</h1>
          <p>You are not authorized to access this page.</p>
          <a href='/'>Go Home</a>
          <a href='/login'>Login</a>
        </div>
      </div>
    );
  } else if (routes.length > 0) {
    return (
      <Routes>
        {routes.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <RouteGuardRenderer
                key={route.path}
                allowedRoles={route.allowedRoles}
              >
                {route.element}
              </RouteGuardRenderer>
            }
          />
        ))}
        <Route path='*' element={<Navigate to='/dashboard' replace />} />
      </Routes>
    );
  }

  return <>{children}</>;
};
```

### Role Access Check

```typescript
// src/utils/authHelper.ts
export function hasRoleAccess({
  allowedRoleNames,
  userRoles,
}: {
  allowedRoleNames?: UserRoleName[];
  userRoles?: Lookup[];
}): boolean {
  if (allowedRoleNames?.length === 0) {
    return true; // No restrictions, allow access
  } else if (!userRoles || userRoles?.length === 0) {
    return false;
  } else if (allowedRoleNames?.includes(userRoleKeys.ANY)) {
    return true; // ANY role means all authenticated users
  } else {
    const isAuthorized = allowedRoleNames?.some(allowedRole =>
      userRoles?.some(userRole => userRole.name === allowedRole)
    );
    return isAuthorized ?? false;
  }
}
```

---

## 🧭 Navigation System (AppSidebar)

### Dynamic Sidebar Rendering with Visibility Control

```typescript
export function AppSidebar() {
  const location = useLocation();
  const { loggedInUser } = useAuthService();

  // Check if a link is active
  const isActiveLink = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + '/')
    );
  };

  // Filter navigation items based on user role and sidebar visibility
  const filteredSidebarItems = (() => {
    if (!loggedInUser) {
      return [];
    }

    let sidebarNavigationItems = tenantSidebarNavigationItems;

    // Check if current route matches platform routes
    platformNavigationRoutes.forEach(route => {
      if (matchRoutePattern(route.path, location.pathname)) {
        sidebarNavigationItems = platformSidebarNavigationItems;
      }
    });

    // Filter by role permissions
    const items = filterNavigationItems({
      loggedInUser: loggedInUser,
      items: sidebarNavigationItems,
    });
    return items;
  })();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarMenu>
          {filteredSidebarItems.map(item => (
            <React.Fragment key={`sidebar_item_${item.title}_${item.isShownInSidebar}`}>
              {/* Only render if isShownInSidebar is true */}
              {item.isShownInSidebar && (
                // Render sidebar item based on structure...
              )}
            </React.Fragment>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
```

### Sidebar Visibility Control

The `isShownInSidebar` flag provides granular control over sidebar visibility:

```typescript
// Show in sidebar (default behavior)
{
  isShownInSidebar: true,
  title: 'Dashboard',
  href: '/dashboard',
  path: '/dashboard',
  element: <Dashboard />,
  allowedRoles: [userRoleKeys.ANY],
}

// Hide from sidebar but keep accessible via routing
{
  isShownInSidebar: false,
  title: 'Tenant Detail',
  path: '/tenant/:id',
  element: <TenantDetail />,
  allowedRoles: [userRoleKeys.PLATFORM_ADMIN],
}
```

### Collapsible Navigation with Visibility Control

```typescript
{filteredSidebarItems.map(item => (
  <React.Fragment key={`sidebar_item_${item.title}_${item.isShownInSidebar}`}>
    {item.childItems && item.childItems.length > 0 && item.isShownInSidebar ? (
      <Collapsible key={item.title} asChild className='group/collapsible'>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title}>
              {item.icon && <item.icon className='h-4 w-4' />}
              <span>{item.title}</span>
              <ChevronRight className='ml-auto h-4 w-4 transition-transform' />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.childItems.map(subItem => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={subItem.href ? isActiveLink(subItem.href) : false}
                  >
                    <Link to={subItem.href || '#'}>
                      {subItem.icon && <subItem.icon className='h-4 w-4' />}
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    ) : item.isShownInSidebar ? (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          isActive={item.href ? isActiveLink(item.href) : false}
        >
          <Link to={item.href || '#'}>
            {item.icon && <item.icon className='h-4 w-4' />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ) : null}
  </React.Fragment>
))}
```

---

## 🗺️ Complete Route Map

### Public Routes
- `/login` - Login page
- `/signup` - Registration page

### Protected Routes

#### Dashboard
- `/` - Home page
- `/dashboard` - Main dashboard (ALL)

#### Platform Management
- `/tenant-management` - Tenant (PLATFORM_ADMIN, PLATFORM_SUPER_ADMIN)

#### Multi-Tenant
- `/workspace/settings` - Workspace settings (PLATFORM_ADMIN, PLATFORM_SUPER_ADMIN)
- `/workspace/branding` - Branding customization (TENANT_ADMIN+)
- `/workspace/domain` - Domain configuration (PLATFORM_SUPER_ADMIN)

#### Employee Management
- `/employees` - Employee directory (ALL)
- `/employees/onboarding` - Employee onboarding (TENANT_ADMIN+)
- `/departments` - Department management (TENANT_ADMIN+)
- `/teams` - Team management (ALL)

#### Attendance & Leave
- `/attendance/checkin` - Check in/out (ALL)
- `/attendance/logs` - Attendance logs (ALL)
- `/leave/requests` - Leave requests (ALL)
- `/leave/approvals` - Leave approvals (TENANT_ADMIN+)
- `/attendance/analytics` - Attendance analytics (TENANT_ADMIN+)

#### Training & Learning
- `/training/programs` - Training programs (TENANT_ADMIN+)
- `/training/my-learning` - My learning (ALL)
- `/training/assessments` - Assessments (ALL)
- `/training/certificates` - Certificates (ALL)
- `/training/progress` - Progress tracking (TENANT_ADMIN+)

#### Social Network
- `/social/feed` - Newsfeed (ALL)
- `/social/announcements` - Announcements (TENANT_ADMIN+)
- `/social/polls` - Polls & surveys (ALL)
- `/social/updates` - Company updates (TENANT_ADMIN+)

#### Team Chat
- `/chat/messages` - Messages (ALL)
- `/chat/channels` - Team channels (ALL)
- `/chat/files` - File sharing (ALL)

#### Other
- `/notifications` - Notifications (ALL)
- `/settings` - Settings (ALL)
- `/profile` - User profile (ALL)
- `/admin` - Admin dashboard (PLATFORM_ADMIN+)
- `/super-admin` - Super admin panel (PLATFORM_SUPER_ADMIN)

---

## 🎯 Role-Based Access

### User Roles

```typescript
export const userRoleKeys = {
  ANY: 'ANY',                              // All authenticated users
  PLATFORM_SUPER_ADMIN: 'PLATFORM_SUPER_ADMIN',
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  PLATFORM_USER: 'PLATFORM_USER',
  TENANT_ADMIN: 'TENANT_ADMIN',
  TENANT_MANAGER: 'TENANT_MANAGER',
  TENANT_USER: 'TENANT_USER',
} as const;
```

### Role Hierarchy

```
Platform Level:
├─ PLATFORM_SUPER_ADMIN   # Full platform control
├─ PLATFORM_ADMIN         # Platform administration
└─ PLATFORM_USER          # Basic platform access

Tenant Level:
├─ TENANT_ADMIN          # Full tenant control
├─ TENANT_MANAGER        # Tenant
└─ TENANT_USER           # Basic tenant access

Special:
└─ ANY                   # All authenticated users
```

---

## 🔄 Navigation Flow

### 1. Application Initialization

```
User visits app
    │
    ▼
main.tsx loads
    │
    ├─> Redux Provider
    ├─> React Router
    ├─> Theme Provider
    └─> Auth Provider
        │
        ▼
    App.tsx
        │
        └─> Routes configured
```

### 2. Route Access Flow

```
User navigates to route
    │
    ▼
RouteGuardRenderer checks authorization
    │
    ├─> Authorized?
    │   ├─> YES: Render route
    │   └─> NO: Show "Access Denied"
    │
    ▼
AppLayout wraps content (if protected)
    │
    ├─> AppSidebar (filtered by role)
    └─> Page content
```

### 3. Sidebar Rendering Flow

```
AppSidebar renders
    │
    ▼
Get user from AuthContext
    │
    ▼
Filter tenantSidebarNavigationItems
    │
    ├─> For each item:
    │   ├─> Check user role access
    │   ├─> Recursively filter children
    │   └─> Include if authorized
    │
    ▼
Render filtered navigation
    │
    ├─> Single items → Direct links
    └─> Items with children → Collapsible menus
```

---

## 🛠️ Adding New Routes

### Step 1: Create Page Component

```typescript
// src/pages/NewFeature.tsx
export default function NewFeature() {
  return (
    <div>
      <h1>New Feature</h1>
      <p>Feature content</p>
    </div>
  );
}
```

### Step 2: Add to Navigation Items

```typescript
// src/components/AppRouter.tsx
import NewFeature from '@/pages/NewFeature';

export const tenantSidebarNavigationItems: SidebarRouteWithChildren[] = [
  // ... existing items
  {
    isShownInSidebar: true, // Show in sidebar
    title: 'New Feature',
    icon: Star,
    href: '/new-feature',
    path: '/new-feature',
    allowedRoles: [userRoleKeys.ANY],
    element: <NewFeature />,
  },
  // Or for route-only access:
  {
    isShownInSidebar: false, // Hide from sidebar
    title: 'Hidden Feature',
    path: '/hidden-feature',
    allowedRoles: [userRoleKeys.PLATFORM_ADMIN],
    element: <HiddenFeature />,
  },
];
```

### Step 3: Test

- Navigate to `/new-feature`
- Check sidebar visibility (should appear if `isShownInSidebar: true`)
- Test direct URL access for hidden routes
- Verify role-based access

---

## 🧪 Route Testing

### Check Route Access

```typescript
import { hasRoleAccess } from '@/utils/authHelper';
import { userRoleKeys } from '@/utils/constants';

// Test user access
const canAccess = hasRoleAccess({
  allowedRoleNames: [userRoleKeys.PLATFORM_ADMIN],
  userRoles: user.roles,
});
```

### Programmatic Navigation

```typescript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dashboard');
  };

  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

### Link Components

```typescript
import { Link } from 'react-router-dom';

function MyComponent() {
  return (
    <Link to='/profile' className='text-primary'>
      View Profile
    </Link>
  );
}
```

---

## 📊 Route Patterns

### Pattern 1: Public Route
```typescript
{
  path: '/public-page',
  element: <PublicPage />,
  allowedRoles: [],  // No authentication required
  title: 'Public Page',
}
```

### Pattern 2: Protected Route (All Users)
```typescript
{
  path: '/protected-page',
  element: <ProtectedPage />,
  allowedRoles: [userRoleKeys.ANY],  // Any authenticated user
  title: 'Protected Page',
}
```

### Pattern 3: Role-Specific Route
```typescript
{
  path: '/admin-page',
  element: <AdminPage />,
  allowedRoles: [
    userRoleKeys.PLATFORM_ADMIN,
    userRoleKeys.PLATFORM_SUPER_ADMIN,
  ],
  title: 'Admin Page',
}
```

### Pattern 4: Nested Navigation
```typescript
{
  isShownInSidebar: true,
  title: 'Parent Menu',
  icon: Folder,
  allowedRoles: [userRoleKeys.ANY],
  childItems: [
    {
      isShownInSidebar: true,
      title: 'Child Page',
      href: '/parent/child',
      path: '/parent/child',
      icon: File,
      allowedRoles: [userRoleKeys.ANY],
      element: <ChildPage />,
    },
  ],
}
```

### Pattern 5: Route-Only Navigation
```typescript
{
  isShownInSidebar: false, // Hidden from sidebar
  title: 'Hidden Page',
  path: '/hidden-page',
  allowedRoles: [userRoleKeys.PLATFORM_ADMIN],
  element: <HiddenPage />,
}
```

---

## 🔗 Related Documentation

- [Pages](pages.md) - Page component documentation
- [Authentication](authentication.md) - Auth context and login flow
- [Architecture](architecture.md) - Overall system architecture
- [Utils](utils.md) - Utility functions including authHelper

---

**For implementation details**: [Getting Started Guide](../getting-started.md)

