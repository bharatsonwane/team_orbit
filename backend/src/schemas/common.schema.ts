import { z } from "zod";
import { oasRegisterSchemas } from "@src/openApiSpecification/openAPIDocumentGenerator";

/**
 * @description ZOD SCHEMAS
 */
export const idValidation = z
  .string()
  .refine(data => !Number.isNaN(Number(data)), "ID must be a numeric value")
  .transform(Number)
  .refine(num => num > 0, "ID must be a positive number");

export const nameValidation = z
  .string()
  .min(1, "Name cannot be empty")
  .max(255, "Name cannot exceed 255 characters");

export const idSchema = z.object({
  params: z.object({ id: idValidation }),
});

export const nameSchema = z.object({
  params: z.object({ name: nameValidation }),
});

/**
 * @description SCHEMAS TYPES
 */
export type IdSchema = z.infer<typeof idSchema>;
export type NameSchema = z.infer<typeof nameSchema>;

/**
 * @description OPENAPI SCHEMAS REGISTRATION
 */
oasRegisterSchemas([
  { schemaName: "IdSchema", schema: idSchema },
  { schemaName: "NameSchema", schema: nameSchema },
]);
