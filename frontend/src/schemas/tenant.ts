import { z } from "zod";

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
  name: z
    .string()
    .min(1, "Tenant name is required")
    .max(255)
    .regex(
      /^[a-zA-Z0-9_]*$/,
      "Tenant name can only contain letters, numbers, and underscores"
    ),
  label: z
    .string()
    .min(1, "Label is required")
    .max(50, "Label cannot exceed 50 characters"),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required"),
});

export type CreateTenantFormData = z.infer<typeof createTenantFormSchema>;

// Create tenant request schema
export const createTenantRequestSchema = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string().optional(),
  statusId: z.number(),
});

export type CreateTenantRequest = z.infer<typeof createTenantRequestSchema>;

// Create tenant response schema - direct tenant object response
export const createTenantResponseSchema = tenantSchema;

export type CreateTenantResponse = z.infer<typeof createTenantResponseSchema>;
