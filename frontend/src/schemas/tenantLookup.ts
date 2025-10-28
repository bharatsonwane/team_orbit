import { z } from "zod";

// ==================== TENANT LOOKUP TYPE SCHEMAS ====================

export const tenantLookupTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  isSystem: z.boolean(),
  isArchived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TenantLookupType = z.infer<typeof tenantLookupTypeSchema>;

// ==================== TENANT LOOKUP SCHEMAS ====================

export const tenantLookupItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number(),
  isSystem: z.boolean(),
  lookupTypeId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TenantLookupItem = z.infer<typeof tenantLookupItemSchema>;

export const tenantLookupWithTypeSchema = tenantLookupItemSchema.extend({
  lookupTypeName: z.string(),
  lookupTypeLabel: z.string(),
});

export type TenantLookupWithType = z.infer<typeof tenantLookupWithTypeSchema>;

// ==================== TENANT LOOKUP TYPE WITH LOOKUPS ====================

export const tenantLookupTypeWithLookupsSchema = tenantLookupTypeSchema.extend({
  lookups: z.array(tenantLookupItemSchema),
});

export type TenantLookupTypeWithLookups = z.infer<
  typeof tenantLookupTypeWithLookupsSchema
>;

// ==================== REQUEST/RESPONSE SCHEMAS ====================

export const tenantLookupTypesListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(tenantLookupTypeSchema),
  message: z.string().optional(),
});

export const tenantLookupsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(tenantLookupItemSchema),
  message: z.string().optional(),
});

export const tenantLookupsWithTypeListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(tenantLookupWithTypeSchema),
  message: z.string().optional(),
});

export const tenantLookupTypesWithLookupsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(tenantLookupTypeWithLookupsSchema),
  message: z.string().optional(),
});

export const tenantLookupResponseSchema = z.object({
  success: z.boolean(),
  data: tenantLookupItemSchema,
  message: z.string(),
});

export const deleteTenantLookupResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// ==================== FORM SCHEMAS ====================

export const createTenantLookupFormSchema = z.object({
  lookupTypeId: z.number().min(1, "Lookup type is required"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  label: z
    .string()
    .min(1, "Label is required")
    .max(100, "Label must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  isSystem: z.boolean().optional(),
});

export type CreateTenantLookupFormData = z.infer<
  typeof createTenantLookupFormSchema
>;

export const updateTenantLookupFormSchema = z.object({
  label: z
    .string()
    .min(1, "Label is required")
    .max(100, "Label must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  sortOrder: z
    .number()
    .min(0, "Sort order must be a positive number")
    .optional(),
});

export type UpdateTenantLookupFormData = z.infer<
  typeof updateTenantLookupFormSchema
>;

// ==================== TYPE EXPORTS ====================

export type TenantLookupTypesListResponse = z.infer<
  typeof tenantLookupTypesListResponseSchema
>;
export type TenantLookupsListResponse = z.infer<
  typeof tenantLookupsListResponseSchema
>;
export type TenantLookupsWithTypeListResponse = z.infer<
  typeof tenantLookupsWithTypeListResponseSchema
>;
export type TenantLookupTypesWithLookupsResponse = z.infer<
  typeof tenantLookupTypesWithLookupsResponseSchema
>;
export type TenantLookupResponse = z.infer<typeof tenantLookupResponseSchema>;
export type DeleteTenantLookupResponse = z.infer<
  typeof deleteTenantLookupResponseSchema
>;
