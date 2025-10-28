import { z } from "zod";

// ==================== TENANT LOOKUP TYPE SCHEMAS ====================

export const tenantLookupTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  isSystem: z.boolean(),
  isArchived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TenantLookupType = z.infer<typeof tenantLookupTypeSchema>;

// ==================== TENANT LOOKUP SCHEMAS ====================

export const tenantLookupSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  description: z.string().optional(),
  sortOrder: z.number(),
  isSystem: z.boolean(),
  lookupTypeId: z.number(),
});

export type TenantLookup = z.infer<typeof tenantLookupSchema>;

export const tenantLookupWithTypeSchema = tenantLookupSchema.extend({
  lookupTypeName: z.string(),
  lookupTypeLabel: z.string(),
});

export type TenantLookupWithType = z.infer<typeof tenantLookupWithTypeSchema>;

// ==================== REQUEST/RESPONSE SCHEMAS ====================

export const tenantLookupTypesListSchema = z.object({
  success: z.boolean(),
  data: z.array(tenantLookupTypeSchema),
});

export const tenantLookupsListSchema = z.object({
  success: z.boolean(),
  data: z.array(tenantLookupSchema),
});

export const tenantLookupsWithTypeListSchema = z.object({
  success: z.boolean(),
  data: z.array(tenantLookupWithTypeSchema),
});

export const createTenantLookupRequestSchema = z.object({
  lookupTypeId: z.number().min(1),
  name: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  isSystem: z.boolean().optional(),
});

export type CreateTenantLookupRequest = z.infer<
  typeof createTenantLookupRequestSchema
>;

export const updateTenantLookupRequestSchema = z.object({
  label: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
});

export type UpdateTenantLookupRequest = z.infer<
  typeof updateTenantLookupRequestSchema
>;

export const tenantLookupResponseSchema = z.object({
  success: z.boolean(),
  data: tenantLookupSchema,
  message: z.string(),
});

export const deleteTenantLookupResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
