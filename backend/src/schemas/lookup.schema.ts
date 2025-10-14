import { z } from "zod";
import { oasRegisterSchemas } from "@src/openApiSpecification/openAPIDocumentGenerator";

/**
 * @description ZOD SCHEMAS
 */
export const baseLookupTypeSchema = z.object({
  name: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  isSystem: z.boolean(),
  createdBy: z.number().int().optional(),
});

export const lookupTypeWithTrackingSchema = baseLookupTypeSchema.extend({
  id: z.number().int(),
  isArchived: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  archivedAt: z.string().nullable().optional(),
  updatedBy: z.number().int().optional(),
  archivedBy: z.number().int().optional(),
});

export const baseLookupSchema = z.object({
  name: z.string().min(1).max(100),
  label: z.string().min(1).max(255),
  category: z.string().optional(),
  description: z.string().optional(),
  isSystem: z.boolean(),
  sortOrder: z.number().int().default(0),
  createdBy: z.number().int().optional(),
  lookupTypeId: z.number().int(),
});

export const lookupWithTrackingSchema = baseLookupSchema.extend({
  id: z.number().int(),
  isArchived: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  archivedAt: z.string().nullable().optional(),
  updatedBy: z.number().int().optional(),
  archivedBy: z.number().int().optional(),
});

export const lookupTypeWithLookupsSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  label: z.string(),
  isSystem: z.boolean(),
  createdAt: z.string().optional(),
  lookups: z.array(
    baseLookupSchema.extend({
      id: z.number().int(),
      isArchived: z.boolean().default(false),
    })
  ),
});

export const lookupListSchema = z.array(lookupTypeWithLookupsSchema);

/**
 * @description SCHEMAS TYPES
 */
export type BaseLookupTypeSchema = z.infer<typeof baseLookupTypeSchema>;
export type LookupTypeWithTrackingSchema = z.infer<
  typeof lookupTypeWithTrackingSchema
>;

export type BaseLookupSchema = z.infer<typeof baseLookupSchema>;
export type LookupWithTrackingSchema = z.infer<typeof lookupWithTrackingSchema>;
export type LookupTypeWithLookupsSchema = z.infer<
  typeof lookupTypeWithLookupsSchema
>;

export type LookupListSchema = z.infer<typeof lookupListSchema>;

/**
 * @description OPENAPI SCHEMAS REGISTRATION
 */
oasRegisterSchemas([
  { schemaName: "BaseLookupTypeSchema", schema: baseLookupTypeSchema },
  {
    schemaName: "LookupTypeWithTrackingSchema",
    schema: lookupTypeWithTrackingSchema,
  },
  { schemaName: "BaseLookupSchema", schema: baseLookupSchema },
  {
    schemaName: "LookupTypeWithLookupsSchema",
    schema: lookupTypeWithLookupsSchema,
  },
  { schemaName: "LookupListSchema", schema: lookupListSchema },
]);
