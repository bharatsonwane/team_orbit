# Schemas & Type Definitions

Complete documentation for TypeScript types and Zod validation schemas.

## 📚 Overview

TeamOrbit uses TypeScript interfaces for type safety and Zod schemas for runtime validation.

## 📋 File Structure

```
src/schemas/
├── user.ts          # User types and interfaces
├── lookup.ts        # Lookup data types
├── tenantLookup.ts  # Tenant-specific lookup data types
├── notification.ts  # Notification types
└── validation.ts    # Zod validation schemas
```

## 👤 User Schema

```typescript
// src/schemas/user.ts
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  title: "Mr" | "Mrs" | "Ms" | "Dr" | "Prof";
  gender: "Male" | "Female" | "Other";
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  marriedStatus: "Single" | "Married" | "Divorced" | "Widowed";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles?: UserRole[];
}

export interface UserRole {
  id: number;
  name: string;
  label: string;
  description: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  title: string;
  gender: string;
  bloodGroup: string;
  marriedStatus: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}
```

## 📊 Lookup Schema

```typescript
// src/schemas/lookup.ts
export interface LookupType {
  id: number;
  key: string;
  name: string;
  description: string;
  lookups: Lookup[];
}

export interface Lookup {
  id: number;
  key: string;
  name: string;
  label: string;
  description: string;
  sort_order: number;
}
```

## 🏢 Tenant Lookup Schema

```typescript
// src/schemas/tenantLookup.ts
import { z } from "zod";

// Base tenant lookup item schema
export const tenantLookupItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  description: z.string().optional(),
  isSystem: z.boolean(),
  sortOrder: z.number().optional(),
  isArchived: z.boolean(),
  lookupTypeId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Tenant lookup type schema
export const tenantLookupTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  isSystem: z.boolean(),
  isArchived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Tenant lookup with type schema
export const tenantLookupWithTypeSchema = tenantLookupItemSchema.extend({
  lookupType: tenantLookupTypeSchema,
});

// Tenant lookup type with lookups schema
export const tenantLookupTypeWithLookupsSchema = tenantLookupTypeSchema.extend({
  lookups: z.array(tenantLookupItemSchema),
});

// API response schemas
export const tenantLookupsWithTypeListSchema = z.array(
  tenantLookupTypeWithLookupsSchema
);

export const tenantLookupTypesListSchema = z.array(
  tenantLookupTypeWithLookupsSchema
);

// Form schemas for create/update operations
export const createTenantLookupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  lookupTypeId: z.number(),
  sortOrder: z.number().optional(),
});

export const updateTenantLookupSchema = createTenantLookupSchema.partial();

// TypeScript types
export type TenantLookupItem = z.infer<typeof tenantLookupItemSchema>;
export type TenantLookupType = z.infer<typeof tenantLookupTypeSchema>;
export type TenantLookupWithType = z.infer<typeof tenantLookupWithTypeSchema>;
export type TenantLookupTypeWithLookups = z.infer<
  typeof tenantLookupTypeWithLookupsSchema
>;
export type TenantLookupsWithTypeList = z.infer<
  typeof tenantLookupsWithTypeListSchema
>;
export type TenantLookupTypesList = z.infer<
  typeof tenantLookupTypesListSchema
>;
export type CreateTenantLookupData = z.infer<typeof createTenantLookupSchema>;
export type UpdateTenantLookupData = z.infer<typeof updateTenantLookupSchema>;
```

## 🔔 Notification Schema

```typescript
// src/schemas/notification.ts
export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  timestamp: number;
  autoHide?: boolean;
  duration?: number;
}
```

## ✅ Validation Schemas (Zod)

### Login Schema

```typescript
// src/schemas/validation.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

### Signup Schema

```typescript
export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    title: z.enum(["Mr", "Mrs", "Ms", "Dr", "Prof"], {
      errorMap: () => ({ message: "Please select a title" }),
    }),
    gender: z.enum(["Male", "Female", "Other"], {
      errorMap: () => ({ message: "Please select a gender" }),
    }),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
      errorMap: () => ({ message: "Please select a blood group" }),
    }),
    marriedStatus: z.enum(["Single", "Married", "Divorced", "Widowed"], {
      errorMap: () => ({ message: "Please select marital status" }),
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
```

### User Job Details Schema

```typescript
// src/schemas/user.ts
export const userJobDetailsSchema = z.object({
  hiringDate: z.string().optional().or(z.literal("")),
  joiningDate: z.string().optional().or(z.literal("")),
  probationPeriodMonths: z.string().optional().or(z.literal("")),
  designation: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  userId: z.string().optional().or(z.literal("")), // Employee ID
  ctc: z.string().optional().or(z.literal("")),
  reportingManagerId: z.string().optional().or(z.literal("")),
});

export type UserJobDetailsFormData = z.infer<typeof userJobDetailsSchema>;
```

### User Contact Information Schema

```typescript
// src/schemas/user.ts
export const userContactInformationSchema = z.object({
  personalEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  personalPhone: z.string().optional().or(z.literal("")),
  alternativePhone: z.string().optional().or(z.literal("")),
  emergencyPhone1: z.string().optional().or(z.literal("")),
  emergencyPhone2: z.string().optional().or(z.literal("")),
});

export type UserContactInformationFormData = z.infer<typeof userContactInformationSchema>;
```

## 🛠️ Usage Patterns

### Type-Safe API Calls

```typescript
import type { User, AuthResponse } from "@/schemas/user";
import getAxios from "@/utils/axiosApi";

const getUser = async (id: number): Promise<User> => {
  const response = await getAxios().get<AuthResponse>(`/api/user/${id}`);
  return response.data.data.user;
};

// User contacts API calls
const getUserContacts = async (userId: number): Promise<UserContactInformationFormData> => {
  const response = await getAxios().get(`/api/user/${userId}/contacts`);
  return response.data.data;
};

const saveUserContacts = async (userId: number, contactData: UserContactInformationFormData): Promise<void> => {
  await getAxios().post(`/api/user/${userId}/contacts`, contactData);
};

// User job details API calls
const getUserJobDetails = async (userId: number): Promise<UserJobDetailsFormData> => {
  const response = await getAxios().get(`/api/user/${userId}/job-details`);
  return response.data.data;
};

const saveUserJobDetails = async (userId: number, jobData: UserJobDetailsFormData): Promise<void> => {
  await getAxios().post(`/api/user/${userId}/job-details`, jobData);
};
```

### Form Validation

```typescript
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
    // data is fully typed
    console.log(data.email, data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

### Type Guards

```typescript
export function isUser(obj: any): obj is User {
  return (
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.email === "string" &&
    typeof obj.firstName === "string"
  );
}
```

## 📝 Best Practices

### 1. Keep Types and Schemas in Sync

```typescript
// ✅ Good: Schema derives from Zod
const userSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

type User = z.infer<typeof userSchema>;

// ❌ Bad: Separate definitions can drift
interface User {
  email: string;
  name: string;
}
```

### 2. Use Enum Types

```typescript
// ✅ Good: Strict type checking
type Gender = "Male" | "Female" | "Other";

// ❌ Bad: Loose typing
type Gender = string;
```

### 3. Optional vs Required

```typescript
// ✅ Good: Clear optional fields
interface User {
  id: number; // Required
  email: string; // Required
  phone?: string; // Optional
}
```

## 🔗 Related Documentation

- [Redux](redux.md) - State management types
- [Pages](pages.md) - Page component types
- [Utils](utils.md) - Utility function types

---

**For validation patterns**: [Getting Started Guide](../getting-started.md)
