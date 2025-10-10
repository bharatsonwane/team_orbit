# Utilities Reference

Complete documentation for utility functions and helpers in the TeamOrbit frontend.

## 📚 Overview

Utility functions provide reusable helper methods for common tasks throughout the application.

## 📁 File Structure

```
src/utils/
├── authHelper.ts    # Authentication utilities
├── axiosApi.ts      # Axios configuration and interceptors
├── constants.ts     # Application constants
├── date.ts          # Date formatting utilities
└── logger.ts        # Logging utilities
```

---

## 🔐 authHelper.ts

Authentication helper functions for token management and user operations.

### Functions

#### `getStoredToken()`

```typescript
export const getStoredToken = (): string | undefined => {
  return Cookies.get(envVariable.JWT_STORAGE_KEY);
};
```

#### `setStoredToken(token: string)`

```typescript
export const setStoredToken = (token: string): void => {
  Cookies.set(envVariable.JWT_STORAGE_KEY, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};
```

#### `removeStoredToken()`

```typescript
export const removeStoredToken = (): void => {
  Cookies.remove(envVariable.JWT_STORAGE_KEY);
};
```

#### `isAuthenticated()`

```typescript
export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  return !!token;
};
```

### Usage Example

```typescript
import {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from "@/utils/authHelper";

// Store token after login
setStoredToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");

// Retrieve token
const token = getStoredToken();

// Remove token on logout
removeStoredToken();
```

---

## 🌐 axiosApi.ts

Axios instance with interceptors for API communication.

### Configuration

```typescript
import axios, { AxiosInstance } from "axios";
import { envVariable } from "@/config/envVariable";
import { getStoredToken } from "./authHelper";

const getAxios = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: envVariable.API_BASE_URL,
    timeout: envVariable.API_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    config => {
      const token = getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  // Response interceptor
  instance.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        removeStoredToken();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default getAxios;
```

### Usage Example

```typescript
import getAxios from "@/utils/axiosApi";

// GET request
const fetchUsers = async () => {
  const response = await getAxios().get("/api/user/list");
  return response.data;
};

// POST request
const createUser = async (userData: any) => {
  const response = await getAxios().post("/api/user/create", userData);
  return response.data;
};

// PUT request
const updateUser = async (id: number, userData: any) => {
  const response = await getAxios().put(`/api/user/${id}`, userData);
  return response.data;
};

// DELETE request
const deleteUser = async (id: number) => {
  const response = await getAxios().delete(`/api/user/${id}`);
  return response.data;
};
```

---

## 🔢 constants.ts

Application-wide constants and enums.

### User Roles

```typescript
export const userRoleKeys = {
  PLATFORM_SUPER_ADMIN: "PLATFORM_SUPER_ADMIN",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  PLATFORM_USER: "PLATFORM_USER",
  TENANT_ADMIN: "TENANT_ADMIN",
  TENANT_MANAGER: "TENANT_MANAGER",
  TENANT_USER: "TENANT_USER",
} as const;

export type UserRoleKey = (typeof userRoleKeys)[keyof typeof userRoleKeys];
```

### User Status

```typescript
export const userStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  DEACTIVATED: "DEACTIVATED",
  SUSPENDED: "SUSPENDED",
} as const;
```

### Application Constants

```typescript
export const APP_NAME = "TeamOrbit";
export const APP_VERSION = "1.0.0";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  ADMIN: "/admin",
  SUPER_ADMIN: "/superadmin",
  TENANT_MANAGEMENT: "/tenant-management",
} as const;
```

### Usage Example

```typescript
import { userRoleKeys, ROUTES } from "@/utils/constants";

// Check user role
if (user.roles.some(role => role.key === userRoleKeys.PLATFORM_ADMIN)) {
  // Admin logic
}

// Navigate to route
navigate(ROUTES.DASHBOARD);
```

---

## 📅 date.ts

Date formatting and manipulation utilities.

### Functions

#### `formatDate(date: Date | string)`

```typescript
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
```

#### `formatDateTime(date: Date | string)`

```typescript
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
```

#### `getRelativeTime(date: Date | string)`

```typescript
export const getRelativeTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};
```

### Usage Example

```typescript
import { formatDate, formatDateTime, getRelativeTime } from "@/utils/date";

const user = {
  created_at: "2024-01-15T10:30:00Z",
};

formatDate(user.created_at);
// "January 15, 2024"

formatDateTime(user.created_at);
// "January 15, 2024, 10:30 AM"

getRelativeTime(user.created_at);
// "5 days ago"
```

---

## 📝 logger.ts

Logging utilities for development and debugging.

### Functions

#### `log(message: string, data?: any)`

```typescript
export const log = (message: string, data?: any): void => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[LOG] ${message}`, data || "");
  }
};
```

#### `error(message: string, error?: any)`

```typescript
export const error = (message: string, error?: any): void => {
  console.error(`[ERROR] ${message}`, error || "");
};
```

#### `warn(message: string, data?: any)`

```typescript
export const warn = (message: string, data?: any): void => {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[WARN] ${message}`, data || "");
  }
};
```

#### `debug(message: string, data?: any)`

```typescript
export const debug = (message: string, data?: any): void => {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[DEBUG] ${message}`, data || "");
  }
};
```

### Usage Example

```typescript
import { log, error, warn, debug } from "@/utils/logger";

// Log info
log("User logged in", { userId: 123 });

// Log error
error("Failed to fetch data", err);

// Log warning
warn("Deprecated API call");

// Log debug info
debug("Component rendered", { props });
```

---

## 🎨 lib/utils.ts

Utility functions for Tailwind CSS and general helpers.

### `cn()` - Class Name Utility

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Usage Example

```typescript
import { cn } from '@/lib/utils';

// Merge class names
<div className={cn(
  'p-4 rounded-lg',
  isActive && 'bg-primary text-white',
  !isActive && 'bg-gray-100'
)} />

// Conditional classes
<button className={cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500',
  variant === 'secondary' && 'bg-gray-500',
  disabled && 'opacity-50 cursor-not-allowed'
)} />
```

---

## 📊 Common Patterns

### API Call Pattern

```typescript
import getAxios from "@/utils/axiosApi";
import { log, error } from "@/utils/logger";

const fetchData = async () => {
  try {
    log("Fetching data...");
    const response = await getAxios().get("/api/data");
    log("Data fetched successfully", response.data);
    return response.data;
  } catch (err) {
    error("Failed to fetch data", err);
    throw err;
  }
};
```

### Error Handling Pattern

```typescript
import { error as logError } from "@/utils/logger";

const handleError = (err: any) => {
  logError("Operation failed", err);

  if (err.response) {
    // Server error
    return err.response.data.message;
  } else if (err.request) {
    // Network error
    return "Network error. Please check your connection.";
  } else {
    // Client error
    return "An unexpected error occurred.";
  }
};
```

---

## 🔗 Related Documentation

- [Config](config.md) - Configuration management
- [Schemas](schema.md) - Type definitions
- [Redux](redux.md) - State management

---

**For implementation details**: [Getting Started Guide](../getting-started.md)
