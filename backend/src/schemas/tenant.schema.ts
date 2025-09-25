import { z } from 'zod';
import { oasRegisterSchemas } from '../openApiSpecification/openAPIDocumentGenerator';

/**
 * @description ZOD SCHEMAS
 */
export const baseTenantSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, 'Tenant name must be at least 2 characters').max(255),
  label: z
    .string()
    .min(2, 'Tenant label must be at least 2 characters')
    .max(255),
  statusId: z.number(),
  isArchived: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  archivedAt: z.string().nullable(),
  createdBy: z.number().optional(),
  updatedBy: z.number().optional(),
  archivedBy: z.number().optional(),
});

export const createTenantSchema = z.object({
  name: z.string().min(2, 'Tenant name must be at least 2 characters').max(255),
  label: z
    .string()
    .min(2, 'Tenant label must be at least 2 characters')
    .max(255),
  // Tenant Admin user details
  adminUser: z.object({
    email: z.string().email('Invalid email format'),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const updateTenantSchema = z.object({
  label: z.string().min(2).max(255).optional(),
  isArchived: z.boolean().optional(),
});

/**
 * @description SCHEMAS TYPES
 */
export type BaseTenantSchema = z.infer<typeof baseTenantSchema>;
export type CreateTenantSchema = z.infer<typeof createTenantSchema>;
export type UpdateTenantSchema = z.infer<typeof updateTenantSchema>;

/**
 * @description OPENAPI SCHEMAS REGISTRATION
 */
oasRegisterSchemas([
  { schemaName: 'CreateTenantSchema', schema: createTenantSchema },
  { schemaName: 'UpdateTenantSchema', schema: updateTenantSchema },
]);
