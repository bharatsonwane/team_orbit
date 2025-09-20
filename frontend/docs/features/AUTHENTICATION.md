# Authentication Implementation

This document describes the authentication system implementation in the TeamOrbit frontend application.

## 🔐 Overview

The authentication system includes:

- **Login Page** - User sign-in with email/password
- **Signup Page** - User registration with validation
- **Form Validation** - Real-time validation with error handling
- **Loading States** - User feedback during form submission
- **Navigation** - Seamless flow between auth pages

## 📄 Login Page

### File: `src/pages/Login.tsx`

#### Features

- Email and password input fields
- Form validation
- Loading states during submission
- Navigation to signup page
- Redirect to dashboard on success

#### Form Fields

```tsx
// Email field
<Input
  id="email"
  type="email"
  placeholder="m@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

// Password field
<Input
  id="password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
/>
```

#### State Management

```tsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [isLoading, setIsLoading] = useState(false);
const navigate = useNavigate();
```

#### Form Submission

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Login attempt:', { email, password });
  setIsLoading(false);

  // Redirect to dashboard after successful login
  navigate('/dashboard');
};
```

## 📝 Signup Page

### File: `src/pages/Signup.tsx`

#### Features

- Complete registration form
- Real-time validation
- Error handling with visual feedback
- Password confirmation
- Navigation to login page
- Redirect to dashboard on success

#### Form Fields

```tsx
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
});
```

#### Validation Logic

```tsx
const validateForm = () => {
  const newErrors: Record<string, string> = {};

  if (!formData.firstName.trim()) {
    newErrors.firstName = 'First name is required';
  }

  if (!formData.lastName.trim()) {
    newErrors.lastName = 'Last name is required';
  }

  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Email is invalid';
  }

  if (!formData.password) {
    newErrors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters';
  }

  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

#### Error Display

```tsx
// Input with error styling
<Input
  className={errors.firstName ? 'border-destructive' : ''}
  // ... other props
/>;

// Error message
{
  errors.firstName && (
    <p className='text-sm text-destructive'>{errors.firstName}</p>
  );
}
```

## 🎨 UI Components

### Form Container

Uses shadcn/ui Card component for consistent styling:

```tsx
<Card className='w-full max-w-md'>
  <CardHeader className='space-y-1'>
    <CardTitle className='text-2xl text-center'>Sign in</CardTitle>
    <CardDescription className='text-center'>
      Enter your email and password to sign in to your account
    </CardDescription>
  </CardHeader>
  {/* Form content */}
</Card>
```

### Form Layout

Responsive grid layout for signup form:

```tsx
<div className='grid grid-cols-2 gap-4'>
  <div className='space-y-2'>
    <Label htmlFor='firstName'>First name</Label>
    <Input id='firstName' name='firstName' />
  </div>
  <div className='space-y-2'>
    <Label htmlFor='lastName'>Last name</Label>
    <Input id='lastName' name='lastName' />
  </div>
</div>
```

### Button States

Loading states for form submission:

```tsx
<Button type='submit' className='w-full' disabled={isLoading}>
  {isLoading ? 'Signing in...' : 'Sign in'}
</Button>
```

## 🔄 Navigation Flow

### Cross-Page Navigation

Links between login and signup pages:

```tsx
// Login page
<div className="text-center text-sm text-muted-foreground">
  Don't have an account?{" "}
  <Link
    to="/signup"
    className="text-primary hover:underline font-medium"
  >
    Sign up
  </Link>
</div>

// Signup page
<div className="text-center text-sm text-muted-foreground">
  Already have an account?{" "}
  <Link
    to="/login"
    className="text-primary hover:underline font-medium"
  >
    Sign in
  </Link>
</div>
```

### Success Redirects

Programmatic navigation after successful authentication:

```tsx
// After successful login/signup
navigate('/dashboard');
```

## 🎨 Theming Integration

### Theme-Aware Styling

All auth pages support dark/light mode:

```tsx
// Page container with theme background
<div className='min-h-screen flex items-center justify-center bg-background p-4 relative'>
  {/* Theme toggle */}
  <div className='absolute top-4 right-4'>
    <ThemeToggle />
  </div>
  {/* Form content */}
</div>
```

### Error Styling

Error states use theme-aware colors:

```tsx
// Error input styling
className={errors.email ? "border-destructive" : ""}

// Error text styling
<p className="text-sm text-destructive">{errors.email}</p>
```

## 🛡️ Security Considerations

### Current Implementation

- Client-side validation only
- No actual authentication backend
- Simulated API calls

### Future Enhancements

- JWT token management
- Secure password requirements
- CSRF protection
- Rate limiting
- Two-factor authentication

### Password Requirements

Current validation rules:

- Minimum 6 characters
- Must match confirmation
- Required field

## 📱 Responsive Design

### Mobile-First Approach

- Single column layout on mobile
- Two-column grid on larger screens
- Touch-friendly input sizes
- Responsive spacing

### Breakpoints

```tsx
// Responsive grid
<div className="grid grid-cols-2 gap-4">
  {/* Mobile: single column, Desktop: two columns */}
</div>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  {/* Responsive padding */}
</div>
```

## 🔧 Form Handling Patterns

### Controlled Components

All form inputs are controlled components:

```tsx
const [email, setEmail] = useState("")

<Input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Form Submission

Prevent default and handle async operations:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // Handle form submission
};
```

### Error Clearing

Clear errors when user starts typing:

```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));

  // Clear error when user starts typing
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};
```

## 🚀 Future Enhancements

### Backend Integration

The frontend authentication system is designed to integrate with the TeamOrbit backend API:

#### API Endpoints
- **Login:** `POST /api/user/login`
- **Signup:** `POST /api/user/signup`
- **Profile:** `GET /api/user/profile`
- **Signout:** `POST /api/user/signout`

#### JWT Token Management

```typescript
// Expected token structure from backend
interface JwtTokenPayload {
  userId: number;
  email: string;
  userRoles: Array<{
    id: number;
    label: string;
    lookupTypeId: number;
  }>;
}

// Store token in localStorage or secure storage
localStorage.setItem('authToken', response.token);

// Include token in API requests
const token = localStorage.getItem('authToken');
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

#### User Data Structure

```typescript
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  tenantId: number;
  userRoles: Array<{
    id: number;
    label: string;
    lookupTypeId: number;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

#### Integration Example

```typescript
// Login API call
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

### Advanced Features

- Remember me functionality
- Password reset flow
- Email verification
- Social login options

### Security Improvements

- Server-side validation
- Rate limiting
- CAPTCHA integration
- Security headers

## 📚 Resources

- [React Forms Guide](https://react.dev/learn/forms)
- [Form Validation Patterns](https://react-hook-form.com/)
- [Authentication Best Practices](https://owasp.org/www-project-authentication-cheat-sheet/)
- [Password Security Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
