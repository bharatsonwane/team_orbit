import { z } from "zod";
import { oasRegisterSchemas } from "@src/openApiSpecification/openAPIDocumentGenerator";

/** @description ZOD SCHEMAS */
export const baseTenantSchema = z.object({
  name: z.string().min(2, "Tenant name must be at least 2 characters").max(255),
  label: z
    .string()
    .min(2, "Tenant label must be at least 2 characters")
    .max(255),
  description: z.string().optional(),
  statusId: z.number(),
  createdBy: z.number().optional(),
});

export const tenantWithIdSchema = baseTenantSchema.extend({
  id: z.number().int(),
  isArchived: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  archivedAt: z.string().nullable().optional(),
});

export const createTenantSchema = baseTenantSchema;

export const updateTenantSchema = z.object({
  label: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  isArchived: z.boolean().optional(),
});

/** @description SCHEMAS TYPES */
export type BaseTenantSchema = z.infer<typeof baseTenantSchema>;
export type TenantWithIdSchema = z.infer<typeof tenantWithIdSchema>;
export type CreateTenantSchema = z.infer<typeof createTenantSchema>;
export type UpdateTenantSchema = z.infer<typeof updateTenantSchema>;

/** @description OPENAPI SCHEMAS REGISTRATION */
oasRegisterSchemas([
  { schemaName: "TenantWithIdSchema", schema: tenantWithIdSchema },
  { schemaName: "CreateTenantSchema", schema: createTenantSchema },
  { schemaName: "UpdateTenantSchema", schema: updateTenantSchema },
]);
