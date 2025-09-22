import { z } from 'zod';
import { oasRegisterSchemas } from '../openApiSpecification/openAPIDocumentGenerator';

const baseLookupTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  isSystem: z.boolean(),
});
export type BaseLookupTypeSchema = z.infer<typeof baseLookupTypeSchema>;

const baseLookupSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  isSystem: z.boolean(),
  sortOrder: z.number(),
  lookupTypeId: z.number(),
});
export type LookupSchema = z.infer<typeof baseLookupSchema>;

export const lookupTypeWithLookupsSchema = z.object({
  id: z.number(),
  name: z.string(),
  lookups: z.array(baseLookupSchema),
});
export type LookupTypeWithLookupsSchema = z.infer<
  typeof lookupTypeWithLookupsSchema
>;

export const lookupListSchema = z.array(lookupTypeWithLookupsSchema);
export type LookupListSchema = z.infer<typeof lookupListSchema>;

oasRegisterSchemas([
  { schemaName: 'BaseLookupTypeSchema', schema: baseLookupTypeSchema },
  { schemaName: 'BaseLookupSchema', schema: baseLookupSchema },
  {
    schemaName: 'LookupTypeWithLookupsSchema',
    schema: lookupTypeWithLookupsSchema,
  },
  { schemaName: 'LookupListSchema', schema: lookupListSchema },
]);
