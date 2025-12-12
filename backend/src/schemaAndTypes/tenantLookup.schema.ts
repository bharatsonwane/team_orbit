import { oasRegisterSchemas } from "@src/openApiSpecification/openAPIDocumentGenerator";
import { z } from "zod";

/** @description ZOD SCHEMAS */
export const tenantLookupTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  isSystem: z.boolean(),
  isArchived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const tenantLookupSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  description: z.string().optional(),
  sortOrder: z.number(),
  isSystem: z.boolean(),
  lookupTypeId: z.number(),
});

export const tenantLookupWithTypeSchema = tenantLookupSchema.extend({
  lookupTypeName: z.string(),
  lookupTypeLabel: z.string(),
});

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
  createdBy: z.string().optional(),
});

export const updateTenantLookupRequestSchema = z.object({
  lookupTypeId: z.number().min(1),
  name: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  isSystem: z.boolean().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  isArchived: z.boolean().optional(),
});

/** @description SCHEMAS TYPES */
export type TenantLookupType = z.infer<typeof tenantLookupTypeSchema>;
export type TenantLookup = z.infer<typeof tenantLookupSchema>;
export type TenantLookupWithType = z.infer<typeof tenantLookupWithTypeSchema>;
export type CreateTenantLookupRequest = z.infer<
  typeof createTenantLookupRequestSchema
>;
export type UpdateTenantLookupRequest = z.infer<
  typeof updateTenantLookupRequestSchema
>;

/** @description OPENAPI SCHEMAS REGISTRATION */
oasRegisterSchemas([
  { schemaName: "TenantLookupTypeSchema", schema: tenantLookupTypeSchema },
  { schemaName: "TenantLookupSchema", schema: tenantLookupSchema },
  {
    schemaName: "TenantLookupWithTypeSchema",
    schema: tenantLookupWithTypeSchema,
  },
  {
    schemaName: "TenantLookupTypesListSchema",
    schema: tenantLookupTypesListSchema,
  },
  { schemaName: "TenantLookupsListSchema", schema: tenantLookupsListSchema },
  {
    schemaName: "TenantLookupsWithTypeListSchema",
    schema: tenantLookupsWithTypeListSchema,
  },
  {
    schemaName: "CreateTenantLookupRequestSchema",
    schema: createTenantLookupRequestSchema,
  },
  {
    schemaName: "UpdateTenantLookupRequestSchema",
    schema: updateTenantLookupRequestSchema,
  },
]);
