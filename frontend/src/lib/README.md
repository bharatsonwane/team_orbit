# Utils Directory

This directory contains utility functions, helpers, and shared logic for the TeamOrbit frontend application.

## 📁 Structure

```
src/utils/
├── utils.ts              # Utility functions (from shadcn/ui)
├── routes.tsx            # Route configuration arrays
├── logger.ts             # Logging utility
├── README.md             # This file
└── docs/                 # Library documentation
    ├── README.md
    └── UTILITIES.md
```

## 🛠️ Utility Functions

### `utils.ts`

Contains utility functions from shadcn/ui, primarily the `cn` function for conditional class names.

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `routes.tsx`

Contains route configuration arrays for the application's routing system.

### `logger.ts`

Contains a logging utility class for development and production logging.

### Usage

```tsx
import { cn } from "@/utils/utils"

// Conditional classes
<div className={cn(
  "base-class",
  condition && "conditional-class",
  variant === "primary" && "primary-class"
)}>

// Merge classes
<button className={cn(
  "px-4 py-2",
  isActive ? "bg-primary" : "bg-secondary"
)}>
```

## 🚀 Adding New Utilities

### 1. Create Utility Function

```typescript
// src/lib/helpers.ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

### 2. Export from Index

```typescript
// src/lib/index.ts
export { cn } from './utils';
export { formatDate, debounce } from './helpers';
```

### 3. Import and Use

```tsx
import { formatDate, debounce } from '@/lib';

// Use in components
const formattedDate = formatDate(new Date());
const debouncedSearch = debounce(handleSearch, 300);
```

## 📚 Common Utility Patterns

### Date Utilities

```typescript
export const dateUtils = {
  format: (date: Date) => new Intl.DateTimeFormat('en-US').format(date),
  formatRelative: (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return dateUtils.format(date);
  },
};
```

### String Utilities

```typescript
export const stringUtils = {
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
  truncate: (str: string, length: number) =>
    str.length > length ? str.slice(0, length) + '...' : str,
  slugify: (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
};
```

### Validation Utilities

```typescript
export const validators = {
  email: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  phone: (phone: string) => /^\+?[\d\s-()]+$/.test(phone),
  url: (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};
```

### Local Storage Utilities

```typescript
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
};
```

## 🎨 Theme Utilities

### Theme Helpers

```typescript
export const themeUtils = {
  getSystemTheme: (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  },
  isDarkMode: (): boolean => {
    return document.documentElement.classList.contains('dark');
  },
  setTheme: (theme: 'light' | 'dark' | 'system'): void => {
    if (theme === 'system') {
      const systemTheme = themeUtils.getSystemTheme();
      document.documentElement.className = systemTheme;
    } else {
      document.documentElement.className = theme;
    }
  },
};
```

## 🔧 API Utilities

### API Helpers

```typescript
export const api = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',

  request: async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    const url = `${api.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },

  get: <T>(endpoint: string): Promise<T> =>
    api.request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data: any): Promise<T> =>
    api.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
```

## 📚 Documentation

- [Utility Functions](./docs/UTILITIES.md) - Detailed utility documentation
- [API Helpers](./docs/API.md) - API utility patterns
- [Theme Utilities](./docs/THEME.md) - Theme-related utilities

## 🔍 Best Practices

### 1. Function Design

- Keep functions pure when possible
- Use TypeScript for type safety
- Include JSDoc comments for complex functions
- Export functions individually for tree shaking

### 2. Error Handling

- Handle errors gracefully
- Provide fallback values
- Log errors appropriately
- Don't throw errors for expected conditions

### 3. Performance

- Use memoization for expensive calculations
- Avoid unnecessary re-computations
- Use debouncing for frequent operations
- Consider lazy loading for large utilities

### 4. Testing

- Write unit tests for utility functions
- Test edge cases and error conditions
- Mock external dependencies
- Use descriptive test names
