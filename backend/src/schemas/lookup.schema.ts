import { z } from 'zod';
import { oasRegisterSchemas } from '../openApiSpecification/openAPIDocumentGenerator';

// Base lookup type schema
export const baseLookupTypeSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  isSystem: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  archivedAt: z.string().nullable().optional(),
  createdBy: z.number().int().optional(),
  updatedBy: z.number().int().optional(),
  archivedBy: z.number().int().optional(),
});
export type BaseLookupTypeSchema = z.infer<typeof baseLookupTypeSchema>;

// Base lookup schema
export const baseLookupSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1).max(100),
  label: z.string().min(1).max(255),
  description: z.string().optional(),
  isSystem: z.boolean(),
  sortOrder: z.number().int().default(0),
  isArchived: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  archivedAt: z.string().nullable().optional(),
  createdBy: z.number().int().optional(),
  updatedBy: z.number().int().optional(),
  archivedBy: z.number().int().optional(),
  lookupTypeId: z.number().int(),
});
export type BaseLookupSchema = z.infer<typeof baseLookupSchema>;

// Lookup type with lookups schema
export const lookupTypeWithLookupsSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  label: z.string(),
  isSystem: z.boolean(),
  lookups: z.array(baseLookupSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type LookupTypeWithLookupsSchema = z.infer<typeof lookupTypeWithLookupsSchema>;

// Create lookup type schema
export const createLookupTypeSchema = z.object({
  name: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  isSystem: z.boolean().default(false),
});
export type CreateLookupTypeSchema = z.infer<typeof createLookupTypeSchema>;

// Create lookup schema
export const createLookupSchema = z.object({
  name: z.string().min(1).max(100),
  label: z.string().min(1).max(255),
  description: z.string().optional(),
  isSystem: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  lookupTypeId: z.number().int(),
});
export type CreateLookupSchema = z.infer<typeof createLookupSchema>;

// Update lookup type schema
export const updateLookupTypeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  label: z.string().min(1).max(255).optional(),
  isSystem: z.boolean().optional(),
});
export type UpdateLookupTypeSchema = z.infer<typeof updateLookupTypeSchema>;

// Update lookup schema
export const updateLookupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  label: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  isSystem: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isArchived: z.boolean().optional(),
});
export type UpdateLookupSchema = z.infer<typeof updateLookupSchema>;

// Lookup list schema
export const lookupListSchema = z.array(lookupTypeWithLookupsSchema);
export type LookupListSchema = z.infer<typeof lookupListSchema>;

oasRegisterSchemas([
  { schemaName: 'BaseLookupTypeSchema', schema: baseLookupTypeSchema },
  { schemaName: 'BaseLookupSchema', schema: baseLookupSchema },
  { schemaName: 'LookupTypeWithLookupsSchema', schema: lookupTypeWithLookupsSchema },
  { schemaName: 'CreateLookupTypeSchema', schema: createLookupTypeSchema },
  { schemaName: 'CreateLookupSchema', schema: createLookupSchema },
  { schemaName: 'UpdateLookupTypeSchema', schema: updateLookupTypeSchema },
  { schemaName: 'UpdateLookupSchema', schema: updateLookupSchema },
  { schemaName: 'LookupListSchema', schema: lookupListSchema },
]);
