# Pages Reference

Complete documentation for all page components in the TeamOrbit frontend.

## 📚 Overview

Pages are route-level components that serve as entry points for different sections of the application. Each page component corresponds to a specific route in the application.

## 📁 Page Structure

```
src/pages/
├── Home.tsx              # Landing page
├── Login.tsx            # User login
├── Signup.tsx           # User registration
├── Dashboard.tsx        # Main dashboard
├── Profile.tsx          # User profile
├── Admin.tsx            # Admin dashboard
├── SuperAdmin.tsx       # Super admin panel
└── TenantManagement.tsx # Tenant management
```

---

## 🏠 Home.tsx

**Route**: `/`  
**Access**: Public  
**Purpose**: Application landing page

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
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
```

### Key Dependencies
- `useAuthService()` - Authentication context
- `useForm()` - Form management
- `zodResolver()` - Zod validation
- `loginSchema` - Validation rules

---

## 📝 Signup.tsx

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
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  title: z.enum(['Mr', 'Mrs', 'Ms', 'Dr', 'Prof']),
  gender: z.enum(['Male', 'Female', 'Other']),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  married_status: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

---

## 📊 Dashboard.tsx

**Route**: `/dashboard`  
**Access**: Protected (requires authentication)  
**Purpose**: Main application dashboard

### Features
- User welcome message
- Quick stats cards
- Recent activity
- Navigation to other sections
- AppLayout integration (sidebar + header)

### Layout
```typescript
// In AppRouter.tsx
{
  path: '/dashboard',
  element: <AppLayout><Dashboard /></AppLayout>,
  allowedRoles: [userRoleKeys.PLATFORM_USER],
}
```

### Implementation
```typescript
export default function Dashboard() {
  const { loggedInUser } = useAuthService();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {loggedInUser?.first_name}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening today
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stats cards */}
      </div>

      <div>
        {/* Recent activity */}
      </div>
    </div>
  );
}
```

---

## 👤 Profile.tsx

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
allowedRoles: [
  userRoleKeys.PLATFORM_ADMIN,
  userRoleKeys.TENANT_ADMIN
]
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

**Route**: `/superadmin`  
**Access**: Protected (Super Admin only)  
**Purpose**: Platform-level administration

### Features
- Tenant management
- Platform settings
- Global user management
- System-wide controls

### Role Requirements
```typescript
allowedRoles: [userRoleKeys.PLATFORM_SUPER_ADMIN]
```

---

## 🏢 TenantManagement.tsx

**Route**: `/tenant-management`  
**Access**: Protected (Admin roles)  
**Purpose**: Manage tenant organizations

### Features
- Create new tenants
- List all tenants
- Edit tenant details
- Tenant user management
- Tenant status management

### Implementation
```typescript
export default function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    const response = await getAxios().get('/api/tenant/list');
    setTenants(response.data.data);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tenant Management</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          Create Tenant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenants.map(tenant => (
          <TenantCard key={tenant.id} tenant={tenant} />
        ))}
      </div>
    </div>
  );
}
```

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
  return <div>Welcome {loggedInUser.first_name}</div>;
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

