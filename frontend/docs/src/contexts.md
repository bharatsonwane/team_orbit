# React Contexts

Complete documentation for React Context providers in the TeamOrbit frontend.

## 📚 Overview

TeamOrbit uses React Context API for sharing state across components without prop drilling. Contexts provide a clean way to access authentication, theme, and other global state.

## 🏗️ Context Architecture

```
Application
    │
    ├─> Redux Provider (Global State)
    ├─> Router Provider (Navigation)
    ├─> ThemeProvider (Theme State)
    └─> AuthProvider (Authentication)
        │
        └─> All App Components
            └─> Can access auth via useAuthService()
```

## 📁 File Structure

```
src/contexts/
└── AuthContextProvider.tsx    # Authentication context
```

---

## 🔐 AuthContext

**Purpose**: Manages authentication state and provides auth-related functions throughout the app.

**Location**: `src/contexts/AuthContextProvider.tsx`

### Context Type

```typescript
export interface AuthContextType {
  loggedInUser: User | null;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
```

### State Properties

| Property       | Type             | Description                        |
| -------------- | ---------------- | ---------------------------------- |
| `loggedInUser` | `User \| null`   | Currently logged-in user object    |
| `isLoading`    | `boolean`        | Loading state for auth operations  |
| `error`        | `string \| null` | Error message from auth operations |

### Methods

| Method       | Parameters         | Returns         | Description                         |
| ------------ | ------------------ | --------------- | ----------------------------------- |
| `login`      | `LoginCredentials` | `Promise<void>` | Authenticates user and stores token |
| `register`   | `RegisterData`     | `Promise<void>` | Registers new user                  |
| `logout`     | None               | `void`          | Logs out user and clears state      |
| `clearError` | None               | `void`          | Clears error state                  |

---

## 🔧 AuthProvider Implementation

### Features

1. **Session Management**
   - Automatic session restoration from JWT token
   - Token validation on app load
   - Session cleanup on logout

2. **Auto Navigation**
   - Redirects to dashboard if logged in and on public route
   - Redirects to login if not logged in and on protected route
   - Handles route protection automatically

3. **Error Handling**
   - Captures and stores auth errors
   - Network error handling
   - Token expiration handling

4. **State Synchronization**
   - Syncs with Redux store
   - Updates on route changes
   - Persists token in cookies

### Implementation Details

```typescript
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto navigation and session management
  useEffect(() => {
    manageUserSessionAndAuthNavigation();
  }, [loggedInUser, location.pathname, navigate]);

  // ... implementation
};
```

### Session Management

```typescript
const manageUserSessionAndAuthNavigation = async () => {
  const publicRoutes = publicRouteList.map(route => route.path);
  const token = Cookies.get(envVariable.JWT_STORAGE_KEY);

  if (token) {
    if (!loggedInUser) {
      try {
        // Restore session from token
        const response = await getAxios().get<User>("/api/user/profile");
        setLoggedInUser(response.data);
      } catch (error) {
        // Token invalid, clear it
        Cookies.remove(envVariable.JWT_STORAGE_KEY);
        setLoggedInUser(null);
      }
    } else if (publicRoutes.includes(location.pathname)) {
      // Already logged in, redirect to dashboard
      navigate("/dashboard", { replace: true });
    }
  } else {
    // No token, redirect to login if on protected route
    if (!publicRoutes.includes(location.pathname)) {
      navigate("/login", { replace: true });
    }
  }
};
```

### Login Function

```typescript
const login = async (credentials: LoginCredentials) => {
  setIsLoading(true);
  setError(null);

  try {
    const result = await store.dispatch(loginAction(credentials));
    if (loginAction.fulfilled.match(result)) {
      const user = result.payload.user;
      const token = result.payload.token;

      // Store token in cookie
      Cookies.set(envVariable.JWT_STORAGE_KEY, token);

      // Update state
      setLoggedInUser(user);
      setIsLoading(false);
      setError(null);
    } else {
      setLoggedInUser(null);
      setIsLoading(false);
      setError(result.payload as string);
    }
  } catch (error) {
    setLoggedInUser(null);
    setIsLoading(false);
    setError(
      error instanceof Error
        ? error.message
        : "Network error. Please try again."
    );
  }
};
```

### Register Function

```typescript
const register = async (data: RegisterData) => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await getAxios().post<AuthResponse>(
      "/auth/register",
      data
    );

    if (response.data.success) {
      Cookies.set(envVariable.JWT_STORAGE_KEY, response.data.data!.token);
      setLoggedInUser(response.data.data!.user);
      setIsLoading(false);
      setError(null);
    } else {
      setLoggedInUser(null);
      setIsLoading(false);
      setError(response.data.message || "Registration failed");
    }
  } catch (error) {
    setLoggedInUser(null);
    setIsLoading(false);
    setError(
      error instanceof Error
        ? error.message
        : "Network error. Please try again."
    );
  }
};
```

### Logout Function

```typescript
const logout = () => {
  Cookies.remove(envVariable.JWT_STORAGE_KEY);
  setLoggedInUser(null);
  setIsLoading(false);
  setError(null);
  navigate("/login", { replace: true });
};
```

---

## 🎣 useAuthService Hook

Custom hook to access auth context.

### Usage

```typescript
import { useAuthService } from '@/contexts/AuthContextProvider';

function MyComponent() {
  const { loggedInUser, login, logout, isLoading, error } = useAuthService();

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div>
      {loggedInUser ? (
        <Fragment>
          <p>Welcome, {loggedInUser.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </Fragment>
      ) : (
        <button onClick={() => login({ email, password })}>
          Login
        </button>
      )}
    </div>
  );
}
```

### Error Handling

```typescript
// Hook throws error if used outside provider
export const useAuthService = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthService must be used within an AuthProvider");
  }
  return context;
};
```

---

## 📋 Usage Patterns

### Pattern 1: Login Form

```typescript
import { useAuthService } from '@/contexts/AuthContextProvider';
import { useForm } from 'react-hook-form';

function LoginForm() {
  const { login, isLoading, error, clearError } = useAuthService();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    clearError();
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      <input {...register('password')} type="password" />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Pattern 2: Protected Component

```typescript
import { useAuthService } from '@/contexts/AuthContextProvider';

function UserProfile() {
  const { loggedInUser } = useAuthService();

  // User is guaranteed to be logged in here due to route guards
  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {loggedInUser?.firstName} {loggedInUser?.lastName}</p>
      <p>Email: {loggedInUser?.email}</p>
    </div>
  );
}
```

### Pattern 3: Conditional Rendering

```typescript
import { useAuthService } from '@/contexts/AuthContextProvider';

function Header() {
  const { loggedInUser, logout } = useAuthService();

  return (
    <header>
      {loggedInUser ? (
        <Fragment>
          <span>Hi, {loggedInUser.firstName}</span>
          <button onClick={logout}>Logout</button>
        </Fragment>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </header>
  );
}
```

### Pattern 4: Role-Based UI

```typescript
import { useAuthService } from '@/contexts/AuthContextProvider';
import { userRoleKeys } from '@/utils/constants';

function AdminPanel() {
  const { loggedInUser } = useAuthService();

  const isAdmin = loggedInUser?.roles?.some(
    role => role.name === userRoleKeys.PLATFORM_ADMIN
  );

  if (!isAdmin) return <p>Access denied</p>;

  return <div>Admin Panel</div>;
}
```

---

## 🌟 Context Best Practices

### 1. Always Use the Hook

```typescript
// ✅ Good: Use the custom hook
const { loggedInUser } = useAuthService();

// ❌ Bad: Direct context access
const context = useContext(AuthContext);
```

### 2. Handle Loading States

```typescript
// ✅ Good: Handle loading
const { isLoading, loggedInUser } = useAuthService();
if (isLoading) return <Loading />;

// ❌ Bad: Assume data is ready
const { loggedInUser } = useAuthService();
return <div>{loggedInUser.name}</div>; // May be null
```

### 3. Clear Errors Appropriately

```typescript
// ✅ Good: Clear before new operation
const { login, clearError } = useAuthService();

const handleLogin = async data => {
  clearError(); // Clear previous errors
  await login(data);
};

// ❌ Bad: Don't clear errors
await login(data); // Old error still visible
```

### 4. Don't Overuse Context

```typescript
// ✅ Good: Use context for truly global state
const { loggedInUser } = useAuthService();

// ❌ Bad: Use context for local state
// Use useState or component props instead
```

---

## 🔗 Integration with Other Systems

### Redux Integration

```typescript
// Auth context dispatches to Redux
const result = await store.dispatch(loginAction(credentials));

// Redux stores auth state
const user = useSelector((state: RootState) => state.user.user);
```

### Router Integration

```typescript
// Auto navigation based on auth state
if (token && publicRoute) {
  navigate("/dashboard", { replace: true });
}

if (!token && protectedRoute) {
  navigate("/login", { replace: true });
}
```

### API Integration

```typescript
// Uses Axios with auto token injection
const response = await getAxios().get<User>("/api/user/profile");
```

---

## 🎨 ThemeContext (via ThemeProvider)

**Purpose**: Manages theme state (light/dark/system).

**Location**: `src/components/theme-provider.tsx`

### Usage

```typescript
import { useTheme } from '@/components/theme-provider';

function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}
```

For complete theme documentation: **[Theme System](theme.md)**

---

## 🛠️ Creating Custom Contexts

### Template

```typescript
import { createContext, useContext, useState } from 'react';

// 1. Define context type
interface MyContextType {
  state: string;
  setState: (value: string) => void;
}

// 2. Create context
const MyContext = createContext<MyContextType | undefined>(undefined);

// 3. Create custom hook
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};

// 4. Create provider
export const MyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<string>('');

  const value = { state, setState };

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};
```

### Usage

```typescript
// Wrap app
<MyProvider>
  <App />
</MyProvider>

// Use in components
function MyComponent() {
  const { state, setState } = useMyContext();
  return <div>{state}</div>;
}
```

---

## 🔗 Related Documentation

- [Theme System](theme.md) - ThemeProvider documentation
- [Hooks](hooks.md) - Custom hooks including useAuthService
- [Redux](redux.md) - Redux integration with contexts
- [Routing](routing.md) - Route protection with AuthContext

---

**For authentication patterns**: [Getting Started Guide](../getting-started.md#-development-patterns)
