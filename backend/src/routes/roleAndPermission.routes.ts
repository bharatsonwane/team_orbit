import RouteRegistrar from "@src/middleware/RouteRegistrar";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
} from "@src/controllers/roleAndPermission.controller";
import {
  createRoleSchema,
  updateRoleSchema,
  roleWithPermissionsSchema,
  roleListSchema,
  createPermissionSchema,
  updatePermissionSchema,
  permissionWithIdSchema,
  permissionListSchema,
} from "@src/schemaTypes/roleAndPermission.schemaTypes";
import { idValidation } from "@src/schemaTypes/common.schemaTypes";
import { authPermissionMiddleware } from "@src/middleware/authPermissionMiddleware";
import { platformPermissionKeys } from "@src/utils/constants";
import { z } from "zod";

const registrar = new RouteRegistrar({
  basePath: "/api",
  tags: ["Role & Permission"],
});

// ==================== ROLE ROUTES ====================

/** @description Get all roles */
registrar.get("/role/list", {
  middlewares: [
    authPermissionMiddleware({
      allowedPlatformPermissions: [platformPermissionKeys.USER_READ],
    }),
  ],
  requestSchema: {
    querySchema: z.object({
      includePermissions: z.string().optional(),
    }),
  },
  responseSchemas: [{ statusCode: 200, schema: roleListSchema }],
  controller: getRoles,
});

/** @description Get role by ID */
registrar.get("/role/:id", {
  middlewares: [
    authPermissionMiddleware({
      allowedPlatformPermissions: [platformPermissionKeys.USER_READ],
    }),
  ],
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  responseSchemas: [{ statusCode: 200, schema: roleWithPermissionsSchema }],
  controller: getRoleById,
});

/** @description Create a new role */
registrar.post("/role/create", {
  middlewares: [
    authPermissionMiddleware({
      allowedPlatformPermissions: [platformPermissionKeys.USER_UPDATE],
    }),
  ],
  requestSchema: {
    bodySchema: createRoleSchema,
  },
  responseSchemas: [{ statusCode: 201, schema: z.object({ id: z.number() }) }],
  controller: createRole,
});

/** @description Update a role */
registrar.put("/role/:id", {
  middlewares: [
    authPermissionMiddleware({
      allowedPlatformPermissions: [platformPermissionKeys.USER_UPDATE],
    }),
  ],
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: updateRoleSchema,
  },
  responseSchemas: [{ statusCode: 200, schema: z.object({ id: z.number() }) }],
  controller: updateRole,
});

/** @description Delete a role */
registrar.delete("/role/:id", {
  middlewares: [
    authPermissionMiddleware({
      allowedPlatformPermissions: [platformPermissionKeys.USER_UPDATE],
    }),
  ],
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  responseSchemas: [
    {
      statusCode: 200,
      schema: z.object({
        message: z.string(),
        id: z.number(),
      }),
    },
  ],
  controller: deleteRole,
});

// ==================== PERMISSION ROUTES ====================

/** @description Get all permissions */
registrar.get("/permission/list", {
  middlewares: [
    authPermissionMiddleware({
      allowedPlatformPermissions: [platformPermissionKeys.USER_READ],
    }),
  ],
  responseSchemas: [{ statusCode: 200, schema: permissionListSchema }],
  controller: getPermissions,
});

/** @description Get permission by ID */
registrar.get("/permission/:id", {
  middlewares: [
    authPermissionMiddleware({
      allowedPlatformPermissions: [platformPermissionKeys.USER_READ],
    }),
  ],
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  responseSchemas: [{ statusCode: 200, schema: permissionWithIdSchema }],
  controller: getPermissionById,
});

/** @description Create a new permission */
registrar.post("/permission/create", {
  middlewares: [
    authPermissionMiddleware({
      allowedPlatformPermissions: [platformPermissionKeys.USER_UPDATE],
    }),
  ],
  requestSchema: {
    bodySchema: createPermissionSchema,
  },
  responseSchemas: [{ statusCode: 201, schema: z.object({ id: z.number() }) }],
  controller: createPermission,
});

/** @description Update a permission */
registrar.put("/permission/:id", {
  middlewares: [
    authPermissionMiddleware({
      allowedPlatformPermissions: [platformPermissionKeys.USER_UPDATE],
    }),
  ],
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: updatePermissionSchema,
  },
  responseSchemas: [{ statusCode: 200, schema: z.object({ id: z.number() }) }],
  controller: updatePermission,
});

/** @description Delete a permission */
registrar.delete("/permission/:id", {
  middlewares: [
    authPermissionMiddleware({
      allowedPlatformPermissions: [platformPermissionKeys.USER_UPDATE],
    }),
  ],
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  responseSchemas: [
    {
      statusCode: 200,
      schema: z.object({
        message: z.string(),
        id: z.number(),
      }),
    },
  ],
  controller: deletePermission,
});

export default registrar;
