import { z } from 'zod';
import { oasRegisterSchemas } from '../openApiSpecification/openAPIDocumentGenerator';

/**
 * @description ZOD SCHEMAS
 */
export const idValidation = z
  .string()
  .refine(data => !Number.isNaN(Number(data)), 'ID must be a numeric value')
  .transform(Number)
  .refine(num => num > 0, 'ID must be a positive number');

export const idSchema = z.object({
  params: z.object({ id: idValidation }),
});

/**
 * @description SCHEMAS TYPES
 */
export type IdSchema = z.infer<typeof idSchema>;

/**
 * @description OPENAPI SCHEMAS REGISTRATION
 */
oasRegisterSchemas([{ schemaName: 'IdSchema', schema: idSchema }]);
