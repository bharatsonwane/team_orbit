import { z } from 'zod';

// Tenant schema
export const tenantSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  description: z.string().optional(),
  statusId: z.number(),
  isArchived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable(),
});

export type Tenant = z.infer<typeof tenantSchema>;

// Tenant list response schema - direct array response
export const tenantListResponseSchema = z.array(tenantSchema);

export type TenantListResponse = z.infer<typeof tenantListResponseSchema>;

// Create tenant form schema (for CreateTenantDialog)
export const createTenantFormSchema = z.object({
  name: z.string().min(2, 'Tenant name must be at least 2 characters').max(255),
  label: z
    .string()
    .min(2, 'Tenant label must be at least 2 characters')
    .max(255),
  description: z.string().optional(),
  adminUser: z.object({
    email: z.string().email('Invalid email format'),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export type CreateTenantFormData = z.infer<typeof createTenantFormSchema>;

// Create tenant request schema
export const createTenantRequestSchema = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string().optional(),
  adminUser: z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().optional(),
    password: z.string(),
  }),
});

export type CreateTenantRequest = z.infer<typeof createTenantRequestSchema>;

// Create tenant response schema - direct tenant object response
export const createTenantResponseSchema = tenantSchema;

export type CreateTenantResponse = z.infer<typeof createTenantResponseSchema>;

// Tenant User Role schema
export const tenantUserRoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  lookupTypeId: z.number(),
});

export type TenantUserRole = z.infer<typeof tenantUserRoleSchema>;

// Tenant User schema
export const tenantUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  tenantId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  userRoles: z.array(tenantUserRoleSchema),
});

export type TenantUser = z.infer<typeof tenantUserSchema>;

// Tenant Users response schema - direct array response
export const tenantUsersResponseSchema = z.array(tenantUserSchema);

export type TenantUsersResponse = z.infer<typeof tenantUsersResponseSchema>;
