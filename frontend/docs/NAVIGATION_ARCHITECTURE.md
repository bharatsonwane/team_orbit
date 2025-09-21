# Navigation & Routing Architecture

This document describes the updated navigation and routing architecture using the new interface system.

## 🏗️ Architecture Overview

The navigation system is built around two core interfaces that work together to provide both hierarchical navigation and flat routing:

### Core Interfaces

#### `AuthRoute` - For Actual Routes
```tsx
export interface AuthRoute {
  title: string;
  authRoles: string[];
  path: string;        // Required - the route path
  description?: string;
  element: ReactNode;  // Required - the React component to render
}
```

**Purpose:** Represents actual routes that React Router can navigate to.

#### `SidebarRouteWithChildren` - For Navigation Hierarchy
```tsx
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
```

**Purpose:** Represents the hierarchical navigation structure with support for parent/child relationships.

## 🔄 Route Generation Process

### 1. Navigation Definition
Routes are defined in `sidebarNavigationItems` using the hierarchical structure:

```tsx
export const sidebarNavigationItems: SidebarRouteWithChildren[] = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    path: '/dashboard',
    authRoles: [roleKeys.any],
    element: <Dashboard />,
  },
  {
    title: 'Platform Management',
    icon: Building2,
    authRoles: [roleKeys.platformSuperAdmin, roleKeys.platformAdmin],
    childItems: [
      {
        title: 'Tenant Management',
        href: '/tenant-management',
        path: '/tenant-management',
        icon: Building2,
        authRoles: [roleKeys.platformSuperAdmin, roleKeys.platformAdmin],
        element: <TenantManagement />,
      },
    ],
  },
];
```

### 2. Route Flattening
The `flattenNavigationItems()` function extracts routes from the hierarchy:

```tsx
const flattenNavigationItems = (items: SidebarRouteWithChildren[]): AuthRoute[] => {
  const routes: AuthRoute[] = [];

  items.forEach(item => {
    // If item has path and element, it's a route
    if (item.path && item.element) {
      const route: AuthRoute = {
        title: item.title,
        authRoles: item.authRoles,
        path: item.path,
        description: item.description,
        element: item.element,
      };
      routes.push(route);
    }

    // Recursively flatten child items
    if (item.childItems) {
      routes.push(...flattenNavigationItems(item.childItems));
    }
  });

  return routes;
};
```

### 3. Route Assembly
Routes are combined into the final routing configuration:

```tsx
const navigationRoutes: AuthRoute[] = flattenNavigationItems(sidebarNavigationItems);

export const protectedRouteList: AuthRoute[] = [
  ...navigationRoutes,      // Routes from navigation
  ...otherProtectedRouteList, // Additional routes
  // ... other routes
];
```

## 🎯 Benefits

### Type Safety
- **Separate interfaces** for different purposes
- **Required fields** for routes (`path`, `element`)
- **Optional fields** for navigation hierarchy
- **Compile-time validation** of route structure

### Single Source of Truth
- **Navigation structure** defines both sidebar and routes
- **No duplication** between navigation and routing configs
- **Automatic consistency** between UI and routing

### Flexible Hierarchy
- **Parent items** can be pure navigation organizers
- **Child items** become actual routes
- **Mixed structure** supports both direct links and groups
- **Recursive nesting** for complex hierarchies

### Role-Based Access
- **Consistent permissions** across navigation and routing
- **Automatic filtering** in sidebar based on user roles
- **Route protection** using the same role definitions

## 🔧 Usage Examples

### Adding a New Route

1. **Add to Navigation Structure:**
```tsx
{
  title: 'New Feature',
  href: '/new-feature',
  path: '/new-feature',
  icon: Star,
  authRoles: [roleKeys.any],
  element: <NewFeature />,
}
```

2. **Routes Generated Automatically** - No additional route configuration needed!

### Adding a New Section

1. **Add Parent Section:**
```tsx
{
  title: 'New Section',
  icon: Folder,
  authRoles: [roleKeys.any],
  childItems: [
    {
      title: 'Sub Feature',
      href: '/section/sub-feature',
      path: '/section/sub-feature',
      icon: FileText,
      authRoles: [roleKeys.any],
      element: <SubFeature />,
    },
  ],
}
```

### Custom Routes (Not in Sidebar)

For routes that shouldn't appear in navigation:

```tsx
export const otherProtectedRouteList: AuthRoute[] = [
  {
    path: '/profile',
    element: <Profile />,
    authRoles: [roleKeys.any],
    title: 'Profile',
    description: 'User profile management',
  },
];
```

## 🛡️ Security

### Route Protection
All routes are automatically protected by `RouteGuardRenderer`:
- **Authentication check** - User must be logged in
- **Authorization check** - User must have required roles
- **Access denied page** - Professional error page for unauthorized access

### Role-Based Navigation
Sidebar automatically filters items based on user permissions:
- **Dynamic menu** - Only shows accessible items
- **Parent filtering** - Hides sections if no children are accessible
- **Real-time updates** - Menu updates when user role changes

This architecture provides a robust, type-safe, and maintainable navigation system that scales with the application's complexity.
