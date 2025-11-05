# Pages Reference

Complete documentation for all page components in the TeamOrbit frontend.

## 📚 Overview

Pages are route-level components that serve as entry points for different sections of the application. Each page component corresponds to a specific route in the application.

## 📂 Folder Organization

Pages are organized by context (platform/tenant) for better multi-tenant architecture:

- **`auth/`** - Public authentication pages (Login, Signup)
- **`platform/`** - Platform admin pages (Dashboard, Users, Tenants, Notifications)
- **`tenant/`** - Tenant-specific pages (Home, Users, Notifications)
- **`profile/`** - User profile pages (Profile)

## 📁 Page Structure

```
src/pages/
├── auth/                           # Public authentication pages
│   ├── Login.tsx                  # User login
│   └── Signup.tsx                 # User registration
│
├── platform/                       # Platform admin context
│   ├── PlatformDashboard.tsx     # Platform admin dashboard
│   ├── notification/
│   │   └── PlatformNotifications.tsx # Platform-wide notifications
│   ├── tenant/
│   │   ├── Tenants.tsx           # Tenant list (organization management)
│   │   ├── TenantDetail.tsx      # Tenant details and users
│   │   ├── Users.tsx         # Tenant user management
│   │   └── components/
│   │       ├── CreateTenantModal.tsx # Tenant creation modal
│   │       ├── EditTenantModal.tsx   # Tenant edit modal
│   │       ├── EditUserModal.tsx     # User edit modal
│   │       └── TenantCard.tsx        # Tenant display card
│   └── users/
│       └── PlatformUsers.tsx     # Platform user management
│
├── tenant/                        # Tenant user context
│   ├── TenantHome.tsx            # Tenant home dashboard
│   └── TenantNotifications.tsx   # Tenant-specific notifications
│
└── profile/                       # Shared profile pages
    └── Profile.tsx                # User profile management
```

---

## 📋 Page Context

### Platform Pages (`/platform/*`)

Platform pages are accessible to users with platform-level roles (PLATFORM_SUPER_ADMIN, PLATFORM_ADMIN, PLATFORM_USER). These pages manage the overall system, tenants, and platform users.

**Route Prefix**: `/platform`

### Tenant Pages (`/tenant/:tenantId/*`)

Tenant pages are accessible to users within a specific tenant organization (TENANT_ADMIN, TENANT_MANAGER, TENANT_USER). These pages manage tenant-specific data and operations.

**Route Prefix**: `/tenant/:tenantId`  
**TenantId**: Dynamically extracted from URL or user context

---

## 🏠 TenantHome.tsx

**Location**: `src/pages/tenant/TenantHome.tsx`  
**Route**: `/tenant/:tenantId/home`  
**Access**: Protected (Tenant users)  
**Purpose**: Tenant home dashboard page

### Features

- Welcome message
- Feature highlights
- Call-to-action buttons (Login, Signup)
- Theme toggle
- Responsive design

### Code Example

```typescript
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <h1>Welcome to TeamOrbit</h1>
        <Link to="/login">
          <Button>Get Started</Button>
        </Link>
      </div>
    </div>
  );
}
```

### Key Components Used

- `Button` - CTA buttons
- `Card` - Feature cards
- `ThemeToggle` - Theme switcher

---

## 🔐 Login.tsx

**Location**: `src/pages/auth/Login.tsx`  
**Route**: `/login`  
**Access**: Public (redirects to dashboard if authenticated)  
**Purpose**: User authentication

### Features

- Email/password form with validation
- Form error handling
- Loading states
- Integration with Auth Context
- Automatic redirect after login
- Link to signup page

### Implementation

```typescript
export default function Login() {
  const { login, isLoading, error, clearError } = useAuthService();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input {...register('email')} />
        <Input {...register('password')} type="password" />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </Card>
  );
}
```

### Validation Schema

```typescript
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
```

### Key Dependencies

- `useAuthService()` - Authentication context
- `useForm()` - Form management
- `zodResolver()` - Zod validation
- `loginSchema` - Validation rules

---

## 📝 Signup.tsx

**Location**: `src/pages/auth/Signup.tsx`  
**Route**: `/signup`  
**Access**: Public (redirects to dashboard if authenticated)  
**Purpose**: New user registration

### Features

- Multi-field registration form
- Comprehensive validation
- Password confirmation
- Real-time error display
- Success/error handling
- Automatic login after signup
- Link to login page

### Form Fields

- Email
- Password
- Password Confirmation
- First Name
- Last Name
- Title (Mr, Mrs, Ms, Dr, Prof)
- Gender (Male, Female, Other)
- Blood Group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Marital Status (Single, Married, Divorced, Widowed)

### Implementation

```typescript
export default function Signup() {
  const { register: registerUser, isLoading, error } = useAuthService();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    await registerUser(data);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form fields */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </Card>
  );
}
```

### Validation Schema

```typescript
const signupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    title: z.enum(["Mr", "Mrs", "Ms", "Dr", "Prof"]),
    gender: z.enum(["Male", "Female", "Other"]),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
    marriedStatus: z.enum(["Single", "Married", "Divorced", "Widowed"]),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

---

## 📊 PlatformDashboard.tsx

**Location**: `src/pages/platform/PlatformDashboard.tsx`  
**Route**: `/platform/dashboard`  
**Access**: Protected (Platform roles)  
**Purpose**: Platform admin dashboard

### Features

- Platform-wide statistics
- Tenant overview
- System health monitoring
- Quick actions for platform admins
- Navigation to platform management sections
- AppLayout integration (sidebar + header)

### Layout

```typescript
// In AppRoutes.tsx
{
  path: '/platform/dashboard',
  element: <PlatformDashboard />,
  allowedRoles: [userRoleKeys.PLATFORM_SUPER_ADMIN, userRoleKeys.PLATFORM_ADMIN],
}
```

### Implementation

```typescript
export default function PlatformDashboard() {
  const { loggedInUser } = useAuthService();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Platform Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {loggedInUser?.firstName}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Platform stats: Total Tenants, Total Users, System Health */}
      </div>

      <div>
        {/* Recent platform activity */}
      </div>
    </div>
  );
}
```

---

## 👤 Profile.tsx

**Location**: `src/pages/profile/Profile.tsx`  
**Route**: `/profile`  
**Access**: Protected  
**Purpose**: User profile management

### Features

- Display user information
- Edit profile functionality
- Password change
- Profile picture upload (placeholder)
- Form validation

### Implementation

```typescript
export default function Profile() {
  const { loggedInUser } = useAuthService();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <ProfileEditForm user={loggedInUser} />
          ) : (
            <ProfileDisplay user={loggedInUser} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 👨‍💼 Admin.tsx

**Location**: `src/pages/admin/Admin.tsx`  
**Route**: `/admin`  
**Access**: Protected (Admin roles only)  
**Purpose**: Admin dashboard and controls

### Features

- User management
- System statistics
- Admin-specific actions
- Role-based content

### Role Requirements

```typescript
allowedRoles: [userRoleKeys.PLATFORM_ADMIN, userRoleKeys.TENANT_ADMIN];
```

### Implementation

```typescript
export default function Admin() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            {/* User management features */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Stats</CardTitle>
          </CardHeader>
          <CardContent>
            {/* System statistics */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 👑 SuperAdmin.tsx

**Location**: `src/pages/admin/SuperAdmin.tsx`  
**Route**: `/superadmin`  
**Access**: Protected (Super Admin only)  
**Purpose**: Platform-level administration

### Features

- Tenant
- Platform settings
- Global user management
- System-wide controls

### Role Requirements

```typescript
allowedRoles: [userRoleKeys.PLATFORM_SUPER_ADMIN];
```

---

## 👥 PlatformUsers.tsx

**Location**: `src/pages/platform/users/PlatformUsers.tsx`  
**Route**: `/platform/users`  
**Access**: Protected (Platform Admin roles)  
**Purpose**: Manage platform-level users

### Features

- List all platform users with roles
- Add new platform users
- Edit existing platform users
- Filter users by status and role
- User role management
- Reuses `AddUserModal` and `EditUserModal` components

### Implementation

```typescript
export default function PlatformUsers() {
  const dispatch = useDispatch<AppDispatch>();
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchPlatformUsers();
  }, []);

  const fetchPlatformUsers = async () => {
    try {
      const result = await dispatch(
        getPlatformUsersAction({ roleCategory: 'PLATFORM' })
      ).unwrap();
      setUsers(result);
    } catch (err) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Platform Users</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          Add User
        </Button>
      </div>

      <Table>
        {/* Users table */}
      </Table>

      {/* User Wizard */}
      <UserWizard
        mode="create"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchPlatformUsers}
      />

      {editingUserId && (
        <UserWizard
          mode="edit"
          isOpen={!!editingUserId}
          onClose={() => setEditingUserId(null)}
          userId={editingUserId}
          onSuccess={fetchPlatformUsers}
        />
      )}
    </div>
  );
}
```

### User API Integration

- **Fetch**: `getPlatformUsersAction({ roleCategory: 'PLATFORM' })`
- **Create**: Via `UserWizard` (tenant prop undefined for platform users)
- **Update**: Via `UserWizard` in edit mode

---

## 👥 Users.tsx

**Location**: `src/pages/platform/tenant/Users.tsx`  
**Route**: `/platform/tenant/:tenantId/users`  
**Access**: Protected (Platform Admin roles)  
**Purpose**: Manage tenant users

### Features

- List all users for a specific tenant
- Add new users to tenant
- Edit existing user information
- User role management (TENANT_ADMIN, TENANT_MANAGER, TENANT_USER)
- Status filtering
- Reuses `AddUserModal` and `EditUserModal` components

### Implementation

```typescript
export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const { tenantId } = useAuthService();
  const [users, setUsers] = useState<DetailedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  useEffect(() => {
    if (tenantId) {
      fetchUsers();
    }
  }, [tenantId]);

  const fetchUsers = async () => {
    try {
      const result = await dispatch(
        getUsersAction({
          tenantId: tenantId!,
          roleCategory: 'TENANT',
        })
      ).unwrap();
      setUsers(result);
    } catch (err) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          Add User
        </Button>
      </div>

      <Table>
        {/* Users table */}
      </Table>

      {/* User Wizard */}
      <UserWizard
        mode="create"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tenant={mockTenant}
        onSuccess={fetchUsers}
      />

      {editingUserId && (
        <UserWizard
          mode="edit"
          isOpen={!!editingUserId}
          onClose={() => setEditingUserId(null)}
          tenant={mockTenant}
          userId={editingUserId}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
```

### User API Integration

- **Fetch**: `getUsersAction({ tenantId, roleCategory: 'TENANT' })`
- **Create**: Via `UserWizard` (tenant prop provided)
- **Update**: Via `UserWizard` in edit mode

---

## 🔔 PlatformNotifications.tsx

**Location**: `src/pages/platform/notification/PlatformNotifications.tsx`  
**Route**: `/platform/notifications`  
**Access**: Protected (Platform roles)  
**Purpose**: Display platform-wide notifications

### Features

- Platform system notifications
- Announcement notifications
- Admin alerts
- Notification filtering and marking as read

---

## 🔔 TenantNotifications.tsx

**Location**: `src/pages/tenant/TenantNotifications.tsx`  
**Route**: `/tenant/:tenantId/notifications`  
**Access**: Protected (Tenant users)  
**Purpose**: Display tenant-specific notifications

### Features

- Organization-specific notifications
- Team announcements
- User alerts
- Notification filtering and marking as read

---

## 🏢 Tenants.tsx

**Location**: `src/pages/platform/tenant/Tenants.tsx`  
**Route**: `/platform/tenant-list`  
**Access**: Protected (Platform Admin roles)  
**Purpose**: Manage tenant organizations

### Features

- Create new tenants with comprehensive form
- List all tenants in responsive grid
- View tenant details
- Edit tenant information
- Tenant user management
- Tenant status management (archived/active)
- Modular component architecture

### Component Structure

```typescript
// Main page component
export default function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);

  const handleTenantCreated = (newTenant: Tenant) => {
    setTenants(prev => [newTenant, ...prev]);
  };

  const handleViewTenant = (tenant: Tenant) => {
    // TODO: Navigate to tenant details
  };

  const handleEditTenant = (tenant: Tenant) => {
    // TODO: Open edit modal
  };

  return (
    <Fragment>
      <HeaderLayout
        breadcrumbs={[
          { label: 'Dashboard', href: '/platform/dashboard' },
          { label: 'Tenants' },
        ]}
      />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tenants</h1>
            <p className="text-muted-foreground">
              Manage organizations and their administrative users
            </p>
          </div>
          <CreateTenantModal onTenantCreated={handleTenantCreated} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map(tenant => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onView={handleViewTenant}
              onEdit={handleEditTenant}
            />
          ))}
        </div>
      </div>
    </Fragment>
  );
}
```

### Sub-Components

#### CreateTenantModal

- Comprehensive tenant creation form
- Admin user account setup
- Form validation with Zod
- Loading states and error handling
- Customizable trigger button

**Note**: Previously named `CreateTenantDialog`, now updated to `CreateTenantModal` for consistency.

#### TenantCard

- Displays tenant information
- Archive status badge
- User count and creation date
- View and Edit action buttons
- Responsive design

---

## 🏢 TenantDetail.tsx

**Location**: `src/pages/platform/tenant/TenantDetail.tsx`  
**Route**: `/platform/tenant/:id`  
**Access**: Protected (Platform Admin roles)  
**Purpose**: View tenant details and manage tenant users

### Features

- Comprehensive tenant information display
- Tenant users table with management actions
- Navigation breadcrumbs
- Edit tenant functionality (placeholder)
- Add/Edit user functionality (placeholder)
- Loading and error states
- Responsive design

### Implementation

```typescript
export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState(mockTenantUsers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantData = async () => {
      // TODO: Replace with actual API call
      setTenant(mockTenantData);
      setUsers(mockTenantUsers);
      setLoading(false);
    };
    fetchTenantData();
  }, [id]);

  return (
    <Fragment>
      <HeaderLayout
        breadcrumbs={[
          { label: 'Dashboard', href: '/platform/dashboard' },
          { label: 'Tenants', href: '/platform/tenant-list' },
          { label: tenant?.label || 'Loading...' },
        ]}
      />
      {/* Tenant details and users table */}
    </Fragment>
  );
}
```

### Tenant Information Section

- Organization name and tenant ID
- Creation and update dates
- Description
- Archive status badge
- Edit tenant button

### Users Table Section

- User list with comprehensive information
- User roles and status badges
- Contact information (email, phone)
- Creation dates
- Edit user actions
- Add user functionality

### Navigation Features

- Back button to tenant list
- Breadcrumb navigation
- Direct navigation from TenantCard
- Route parameter handling (`:id`)
- Updated route path (`/tenant/:id`)

### Data Structure

```typescript
interface TenantUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}
```

### State Management

- Loading states for data fetching
- Error handling for missing tenants
- Local state for tenant and user data
- Navigation state management

---

## 🎨 Page Patterns

### Standard Page Structure

```typescript
export default function PageName() {
  // 1. Hooks
  const navigate = useNavigate();
  const { user } = useAuthService();

  // 2. State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. Effects
  useEffect(() => {
    // Fetch data
  }, []);

  // 4. Handlers
  const handleAction = () => {
    // Implementation
  };

  // 5. Render conditions
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  // 6. Main render
  return (
    <div className="container mx-auto p-6">
      {/* Page content */}
    </div>
  );
}
```

### Protected Page Pattern

```typescript
// Protected in AppRouter.tsx
{
  path: '/protected-page',
  element: <AppLayout><ProtectedPage /></AppLayout>,
  allowedRoles: [userRoleKeys.PLATFORM_USER],
}

// Page component
export default function ProtectedPage() {
  const { loggedInUser } = useAuthService();

  // User is guaranteed to be authenticated here
  return <div>Welcome {loggedInUser.firstName}</div>;
}
```

---

## 📊 Page State Management

### Local State (useState)

```typescript
const [data, setData] = useState<Data[]>([]);
const [loading, setLoading] = useState(false);
```

### Global State (Redux)

```typescript
const user = useSelector((state: RootState) => state.user.user);
const dispatch = useDispatch();
```

### Context (Auth)

```typescript
const { loggedInUser, login, logout } = useAuthService();
```

---

## 🔗 Related Documentation

- [Routing System](routing.md) - Route configuration
- [Authentication](authentication.md) - Auth implementation
- [Components](components.md) - Reusable components

---

**For architecture details**: [Architecture Documentation](architecture.md)
