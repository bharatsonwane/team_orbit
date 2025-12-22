import { z } from "zod";

export const tenantLookupTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  isSystem: z.boolean(),
  isArchived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

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
  isArchived: z.boolean(),
});

export const tenantLookupWithTypeSchema = tenantLookupItemSchema.extend({
  lookupTypeName: z.string(),
  lookupTypeLabel: z.string(),
});

export const tenantLookupTypeWithLookupsSchema = tenantLookupTypeSchema.extend({
  lookups: z.array(tenantLookupItemSchema),
});

export const createTenantLookupFormSchema = z.object({
  lookupTypeId: z.number().min(1, "Lookup type is required"),
  name: z
    .string()
    .min(3, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(
      /^[A-Z0-9_]+$/,
      "Name must contain only uppercase letters, numbers, and underscores"
    ),
  label: z
    .string()
    .min(3, "Label is required")
    .max(100, "Label must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  isArchived: z.boolean(),
});

export const updateTenantLookupFormSchema = z.object({
  lookupTypeId: z.number().min(1, "Lookup type is required"),
  name: z
    .string()
    .min(1, "Label is required")
    .max(100, "Label must be less than 100 characters")
    .optional(),
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
  isArchived: z.boolean(),
});

// ==================== TYPE EXPORTS ====================
export type TenantLookupType = z.infer<typeof tenantLookupTypeSchema>;
export type TenantLookupItem = z.infer<typeof tenantLookupItemSchema>;
export type TenantLookupWithType = z.infer<typeof tenantLookupWithTypeSchema>;
export type TenantLookupTypeWithLookups = z.infer<
  typeof tenantLookupTypeWithLookupsSchema
>;
export type CreateTenantLookupFormData = z.infer<
  typeof createTenantLookupFormSchema
>;

export type UpdateTenantLookupFormData = z.infer<
  typeof updateTenantLookupFormSchema
>;
