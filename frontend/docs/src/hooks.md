# Custom Hooks

Complete documentation for custom React hooks in the TeamOrbit frontend.

## 📚 Overview

Custom hooks encapsulate reusable logic and provide a clean API for components. TeamOrbit uses custom hooks for responsive design, authentication, theming, and form management.

## 🏗️ Hooks Architecture

```
Custom Hooks
    │
    ├─> useAuthService()      # Authentication context hook
    ├─> useTheme()            # Theme context hook
    ├─> useIsMobile()         # Responsive design hook
    │
    └─> React Hook Form Hooks
        ├─> useForm()
        ├─> useFormContext()
        └─> useFormState()
```

## 📁 File Structure

```
src/hooks/
└── use-mobile.ts           # Mobile breakpoint detection

src/contexts/
└── AuthContextProvider.tsx # useAuthService hook

src/components/
└── theme-provider.tsx      # useTheme hook
```

---

## 📱 useIsMobile

**Purpose**: Detects if viewport is below mobile breakpoint (768px).

**Location**: `src/hooks/use-mobile.ts`

### Implementation

```typescript
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
```

### Features

- **Reactive**: Updates on window resize
- **MediaQuery**: Uses native `matchMedia` API
- **Cleanup**: Removes event listeners on unmount
- **Boolean Return**: Always returns boolean (never undefined in practice)

### Usage

```typescript
import { useIsMobile } from '@/hooks/use-mobile';

function ResponsiveComponent() {
  const isMobile = useIsMobile();

  return (
    <div>
      {isMobile ? (
        <MobileLayout />
      ) : (
        <DesktopLayout />
      )}
    </div>
  );
}
```

### Use Cases

1. **Conditional Rendering**

```typescript
function Header() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileMenu /> : <DesktopMenu />;
}
```

2. **Dynamic Styles**

```typescript
function Card() {
  const isMobile = useIsMobile();

  return (
    <div className={isMobile ? 'p-2' : 'p-6'}>
      Content
    </div>
  );
}
```

3. **Layout Changes**

```typescript
function Dashboard() {
  const isMobile = useIsMobile();

  return (
    <div className={isMobile ? 'flex-col' : 'flex-row'}>
      <Sidebar />
      <Content />
    </div>
  );
}
```

---

## 🔐 useAuthService

**Purpose**: Access authentication state and functions.

**Location**: `src/contexts/AuthContextProvider.tsx`

### Return Type

```typescript
interface AuthContextType {
  loggedInUser: User | null;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
```

### Implementation

```typescript
export const useAuthService = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthService must be used within an AuthProvider");
  }
  return context;
};
```

### Usage

```typescript
import { useAuthService } from '@/contexts/AuthContextProvider';

function ProfilePage() {
  const { loggedInUser, logout, isLoading } = useAuthService();

  if (isLoading) return <Loading />;

  return (
    <div>
      <h1>Welcome, {loggedInUser?.firstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Common Patterns

#### 1. Login Form

```typescript
function LoginForm() {
  const { login, isLoading, error, clearError } = useAuthService();

  const handleSubmit = async (data) => {
    clearError();
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

#### 2. Protected Content

```typescript
function AdminPanel() {
  const { loggedInUser } = useAuthService();

  const isAdmin = loggedInUser?.roles?.some(
    role => role.name === 'PLATFORM_ADMIN'
  );

  if (!isAdmin) return <AccessDenied />;

  return <AdminContent />;
}
```

#### 3. User Display

```typescript
function UserBadge() {
  const { loggedInUser } = useAuthService();

  return (
    <div>
      <Avatar src={loggedInUser?.avatar} />
      <span>{loggedInUser?.firstName}</span>
    </div>
  );
}
```

For complete documentation: **[Contexts - AuthContext](contexts.md#-authcontext)**

---

## 🎨 useTheme

**Purpose**: Access and control theme state (light/dark/system).

**Location**: `src/components/theme-provider.tsx`

### Return Type

```typescript
interface ThemeProviderState {
  theme: "dark" | "light" | "system";
  setTheme: (theme: "dark" | "light" | "system") => void;
}
```

### Implementation

```typescript
export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
```

### Usage

```typescript
import { useTheme } from '@/components/theme-provider';

function ThemeToggle() {
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

### Common Patterns

#### 1. Toggle Between Themes

```typescript
function QuickToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
```

#### 2. Theme-Based Rendering

```typescript
function Logo() {
  const { theme } = useTheme();

  const logoSrc = theme === 'dark'
    ? '/logo-dark.svg'
    : '/logo-light.svg';

  return <img src={logoSrc} alt="Logo" />;
}
```

#### 3. System Theme Detection

```typescript
function ThemeInfo() {
  const { theme } = useTheme();

  const effectiveTheme = theme === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : theme;

  return <p>Current theme: {effectiveTheme}</p>;
}
```

For complete documentation: **[Theme System](theme.md)**

---

## 📋 React Hook Form Hooks

### useForm

**Purpose**: Main hook for form management and validation.

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    await submitToAPI(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

### useFormContext

**Purpose**: Access form methods in nested components.

```typescript
import { useFormContext } from 'react-hook-form';

function NestedFormField() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <input {...register('nestedField')} />
      {errors.nestedField && <span>{errors.nestedField.message}</span>}
    </div>
  );
}
```

---

## 🛠️ Custom Hook Patterns

### Pattern 1: Data Fetching Hook

```typescript
import { useState, useEffect } from 'react';
import getAxios from '@/utils/axiosApi';

function useUser(id: number) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await getAxios().get(`/api/user/${id}`);
        setUser(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return { user, loading, error };
}

// Usage
function UserProfile({ userId }) {
  const { user, loading, error } = useUser(userId);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return <div>{user.name}</div>;
}
```

### Pattern 2: Local Storage Hook

```typescript
import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage
function Settings() {
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 16);

  return (
    <div>
      <input
        type="number"
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
      />
      <p style={{ fontSize: `${fontSize}px` }}>Preview text</p>
    </div>
  );
}
```

### Pattern 3: Debounce Hook

```typescript
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      searchAPI(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Pattern 4: Window Size Hook

```typescript
import { useState, useEffect } from 'react';

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Usage
function ResponsiveComponent() {
  const { width, height } = useWindowSize();

  return (
    <div>
      <p>Width: {width}px</p>
      <p>Height: {height}px</p>
    </div>
  );
}
```

### Pattern 5: Previous Value Hook

```typescript
import { useRef, useEffect } from 'react';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Usage
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

---

## 🎯 Hook Best Practices

### 1. Follow React Rules of Hooks

```typescript
// ✅ Good: Call at top level
function MyComponent() {
  const isMobile = useIsMobile();
  const { user } = useAuthService();

  return <div>{user.name}</div>;
}

// ❌ Bad: Conditional hooks
function MyComponent() {
  if (someCondition) {
    const isMobile = useIsMobile(); // Error!
  }
}
```

### 2. Name Custom Hooks with 'use' Prefix

```typescript
// ✅ Good: Starts with 'use'
function useCustomLogic() {}

// ❌ Bad: Doesn't follow convention
function customLogic() {}
```

### 3. Return Consistent Values

```typescript
// ✅ Good: Consistent return type
function useData() {
  return { data, loading, error };
}

// ❌ Bad: Inconsistent return
function useData() {
  if (loading) return { loading: true };
  return { data };
}
```

### 4. Handle Cleanup

```typescript
// ✅ Good: Cleanup in useEffect
useEffect(() => {
  const subscription = subscribeToData();
  return () => subscription.unsubscribe();
}, []);

// ❌ Bad: No cleanup
useEffect(() => {
  subscribeToData();
}, []);
```

### 5. Memoize Expensive Computations

```typescript
// ✅ Good: Use useMemo
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ❌ Bad: Compute on every render
const expensiveValue = computeExpensiveValue(data);
```

---

## 📊 Hook Dependencies

### Dependency Array Guidelines

```typescript
// No dependencies - runs once
useEffect(() => {
  fetchData();
}, []);

// With dependencies - runs when deps change
useEffect(() => {
  fetchData(id);
}, [id]);

// No array - runs on every render
useEffect(() => {
  console.log("Runs every render");
});
```

### Common Dependency Mistakes

```typescript
// ❌ Bad: Missing dependencies
useEffect(() => {
  fetchUser(userId); // userId should be in deps
}, []);

// ✅ Good: Include all dependencies
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// ❌ Bad: Object/array as dependency
useEffect(() => {
  doSomething(config);
}, [config]); // Re-runs every time if config is an object

// ✅ Good: Destructure or use specific properties
useEffect(() => {
  doSomething(config);
}, [config.id, config.name]);
```

---

## 🔗 Related Documentation

- [Contexts](contexts.md) - Context API and useAuthService details
- [Theme System](theme.md) - useTheme hook documentation
- [Components](components.md) - Components using custom hooks
- [Utils](utils.md) - Utility functions used in hooks

---

**For hook patterns**: [Getting Started Guide](../getting-started.md#-custom-hooks-pattern)
