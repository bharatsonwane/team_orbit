# Schemas Directory

Validation schemas and type definitions for the TeamOrbit frontend application.

## 📁 Structure

```
src/schemas/
├── user.ts               # User and authentication schemas
├── route.ts              # Route configuration schemas
├── validation.ts         # Zod validation schemas for forms
└── README.md             # This file
```

## 🛠️ Schema Files

### `user.ts`

User and authentication-related Zod schemas and TypeScript types. Includes user schemas, login/register validation, and user role definitions.

**Updated Schema Structure:**
- User roles now use `userRoleKeys` constants (e.g., `USER_ROLE_PLATFORM_ADMIN`)
- User schema includes `statusId` for user status references
- Role-based access control with new role hierarchy

### `route.ts`

Route configuration schemas and TypeScript types. Includes Route interface for routing configuration and RouteConfig for array-based routing.

### `validation.ts`

Zod validation schemas for form validation throughout the application. Provides reusable validation rules and TypeScript type inference.

**Features:**

- ✅ Form validation schemas (login, signup)
- ✅ Reusable field schemas (email, password, name)
- ✅ TypeScript integration with automatic type inference
- ✅ Custom error messages
- ✅ Password strength validation

## 🚀 Usage

### Route Configuration

```tsx
import type { Route, RouteConfig } from '@/schemas/route';
import type { UserRole } from '@/schemas/user';

// Define routes with proper typing
const routes: Route[] = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    authRoles: ['USER', 'ADMIN'],
    title: 'Dashboard',
    description: 'User dashboard page',
  },
];

// Route configuration for array-based routing
const routeConfig: RouteConfig = {
  routes,
  fallback: <NotFound />,
};
```

### User and Authentication

```tsx
import type { User, AuthState, LoginCredentials } from '@/schemas/user';

// Use inferred types from Zod schemas
const user: User = {
  id: '123',
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  role: userRoleKeys.USER_ROLE_TENANT_USER, // Updated to use new role constants
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};
```

### Form Validation

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas/validation';

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    console.log('Login data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <input {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      <button type='submit'>Login</button>
    </form>
  );
}
```

### Available Schemas

#### Complete Form Schemas

- `loginSchema` - Email and password validation
- `signupSchema` - First name, last name, email, password, and confirm password validation

#### Individual Field Schemas

- `emailSchema` - Email format validation
- `passwordSchema` - Strong password validation (uppercase, lowercase, number, min 6 chars)
- `nameSchema` - Name validation (min 2 characters)

#### TypeScript Types

- `LoginFormData` - Inferred type from loginSchema
- `SignupFormData` - Inferred type from signupSchema

## 📚 Related Documentation

For more information about form handling and validation:

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [@hookform/resolvers Documentation](https://github.com/react-hook-form/resolvers)
