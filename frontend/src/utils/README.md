# Utils Directory

This directory contains utility functions, helpers, and shared logic for the TeamOrbit frontend application.

## 📁 Structure

```
src/utils/
├── authHelper.ts         # Authentication helper functions
├── constants.ts          # Application constants
├── date.ts               # Date utilities using datejs
├── logger.ts             # Logging utility
├── axiosApi.ts           # Axios instance with interceptors
├── route/                # Routing utilities
│   ├── routes.tsx        # Route configuration
│   └── RouteGuard.tsx    # Route protection component
└── README.md             # This file
```

## 🛠️ Utilities

### `authHelper.ts`

Authentication helper functions for role-based access control and user permissions.

### `constants.ts`

Application constants including role keys for route protection and other shared constants.

### `date.ts`

Date utility functions using datejs for natural language date parsing and manipulation.

### `logger.ts`

Logging utility for development and production with different log levels.

### `axiosApi.ts`

Axios instance factory with request/response interceptors for token handling and error management.

### `route/routes.tsx`

Route configuration arrays for the application's routing system.

### `route/RouteGuard.tsx`

Route protection component with role-based access control.

## 🚀 Usage

### Authentication Helpers

```tsx
import { hasRoleAccess } from '@/utils/authHelper';
import type { UserRole } from '@/schemas/user';

// Check if user has access based on allowed roles
const allowedRoles: UserRole[] = ['ADMIN', 'USER'];
const userRoles: UserRole[] = ['USER'];

if (hasRoleAccess({ allowedRoles, userRoles })) {
  // User has access
}

// Check with default empty arrays (no restrictions)
if (hasRoleAccess()) {
  // Always returns true when no restrictions
}

// Check with only user roles (no allowed roles = access granted)
if (hasRoleAccess({ userRoles })) {
  // Returns true (no restrictions)
}
```

### Constants

```tsx
import { roleKeys } from '@/utils/constants';

// Use in route protection
const protectedRoute = {
  path: '/admin',
  authRoles: [roleKeys.ADMIN],
  element: <AdminPage />,
};
```

### Route Configuration

```tsx
import { mainRouteList } from '@/utils/route/routes';
import RouteGuardRenderer from '@/utils/route/RouteGuardRenderer';

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
</Routes>;
```

### Axios API

```tsx
import getAxios from '@/utils/axiosApi';

const response = await getAxios().get('/users');
const newUser = await getAxios().post('/users', userData);
```

### Date Utilities

```tsx
import { formatDate, parseDate, getRelativeTime } from '@/utils/date';

const formatted = formatDate(new Date(), 'MMMM d, yyyy');
const parsed = parseDate('tomorrow');
const relative = getRelativeTime('2024-01-10');
```

## 📚 Documentation

For more detailed information, see:

- [Routing System Documentation](../docs/ROUTING_SYSTEM.md)
- [Schemas Documentation](../schemas/README.md)
