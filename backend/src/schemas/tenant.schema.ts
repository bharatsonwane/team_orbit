import { z } from 'zod';

// Tenant creation schema
export const createTenantSchema = z.object({
  name: z.string().min(2, 'Tenant name must be at least 2 characters').max(255),
  label: z.string().min(2, 'Tenant label must be at least 2 characters').max(255),
  description: z.string().optional(),
  // Tenant Admin user details
  adminUser: z.object({
    email: z.string().email('Invalid email format'),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export type CreateTenantSchema = z.infer<typeof createTenantSchema>;

// Tenant update schema
export const updateTenantSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  label: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  isArchived: z.boolean().optional(),
});

export type UpdateTenantSchema = z.infer<typeof updateTenantSchema>;

// Tenant response schema
export const tenantSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  isArchived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable(),
});

export type TenantSchema = z.infer<typeof tenantSchema>;

// Tenant with admin user response
export const tenantWithAdminSchema = z.object({
  tenant: tenantSchema,
  adminUser: z.object({
    id: z.number(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().nullable(),
    tenantId: z.number(),
    userRoles: z.array(z.object({
      id: z.number(),
      label: z.string(),
      lookupTypeId: z.number(),
    })),
  }),
});

export type TenantWithAdminSchema = z.infer<typeof tenantWithAdminSchema>;
