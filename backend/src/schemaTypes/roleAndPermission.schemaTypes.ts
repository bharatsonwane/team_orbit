import { z } from "zod";
import { oasRegisterSchemas } from "@src/openApiSpecification/openAPIDocumentGenerator";

/** @description ZOD SCHEMAS - ROLE */
export const baseRoleSchema = z.object({
  name: z.string().min(1).max(100),
  label: z.string().min(1).max(255),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isSystem: z.boolean().default(false),
});

export const createRoleSchema = baseRoleSchema.extend({
  permissionIds: z.array(z.number().int()).optional(),
});

export const updateRoleSchema = baseRoleSchema.partial().extend({
  permissionIds: z.array(z.number().int()).optional(),
});

export const roleWithTrackingSchema = baseRoleSchema.extend({
  id: z.number().int(),
  isArchived: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  archivedAt: z.string().nullable().optional(),
  createdBy: z.number().int().optional(),
  updatedBy: z.number().int().optional(),
  archivedBy: z.number().int().optional(),
});

export const roleWithPermissionsSchema = roleWithTrackingSchema.extend({
  permissions: z.array(
    z.object({
      id: z.number().int(),
      name: z.string(),
      label: z.string(),
    })
  ).optional(),
});

export const roleListSchema = z.array(roleWithPermissionsSchema);

/** @description ZOD SCHEMAS - PERMISSION */
export const basePermissionSchema = z.object({
  name: z.string().min(1).max(100),
  label: z.string().min(1).max(255),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isSystem: z.boolean().default(false),
});

export const createPermissionSchema = basePermissionSchema;

export const updatePermissionSchema = basePermissionSchema.partial();

export const permissionWithTrackingSchema = basePermissionSchema.extend({
  id: z.number().int(),
  isArchived: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  archivedAt: z.string().nullable().optional(),
  createdBy: z.number().int().optional(),
  updatedBy: z.number().int().optional(),
  archivedBy: z.number().int().optional(),
});

export const permissionListSchema = z.array(permissionWithTrackingSchema);

/** @description ZOD SCHEMAS - ROLE PERMISSION MAPPING */
export const rolePermissionMappingSchema = z.object({
  roleId: z.number().int(),
  permissionId: z.number().int(),
});

/** @description SCHEMA TYPES */
export type BaseRoleSchema = z.infer<typeof baseRoleSchema>;
export type CreateRoleSchema = z.infer<typeof createRoleSchema>;
export type UpdateRoleSchema = z.infer<typeof updateRoleSchema>;
export type RoleWithTrackingSchema = z.infer<typeof roleWithTrackingSchema>;
export type RoleWithPermissionsSchema = z.infer<typeof roleWithPermissionsSchema>;
export type RoleListSchema = z.infer<typeof roleListSchema>;

export type BasePermissionSchema = z.infer<typeof basePermissionSchema>;
export type CreatePermissionSchema = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionSchema = z.infer<typeof updatePermissionSchema>;
export type PermissionWithTrackingSchema = z.infer<
  typeof permissionWithTrackingSchema
>;
export type PermissionListSchema = z.infer<typeof permissionListSchema>;

export type RolePermissionMappingSchema = z.infer<
  typeof rolePermissionMappingSchema
>;

/** @description OPENAPI SCHEMAS REGISTRATION */
oasRegisterSchemas([
  { schemaName: "BaseRoleSchema", schema: baseRoleSchema },
  { schemaName: "CreateRoleSchema", schema: createRoleSchema },
  { schemaName: "UpdateRoleSchema", schema: updateRoleSchema },
  { schemaName: "RoleWithTrackingSchema", schema: roleWithTrackingSchema },
  {
    schemaName: "RoleWithPermissionsSchema",
    schema: roleWithPermissionsSchema,
  },
  { schemaName: "RoleListSchema", schema: roleListSchema },
  { schemaName: "BasePermissionSchema", schema: basePermissionSchema },
  {
    schemaName: "CreatePermissionSchema",
    schema: createPermissionSchema,
  },
  {
    schemaName: "UpdatePermissionSchema",
    schema: updatePermissionSchema,
  },
  {
    schemaName: "PermissionWithTrackingSchema",
    schema: permissionWithTrackingSchema,
  },
  { schemaName: "PermissionListSchema", schema: permissionListSchema },
]);

