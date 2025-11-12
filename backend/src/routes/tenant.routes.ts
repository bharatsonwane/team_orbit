import {
  createTenantSchema,
  updateTenantSchema,
  tenantWithTrackingSchema,
} from "@src/schemas/tenant.schema";
import { idValidation } from "@src/schemas/common.schema";
import {
  createTenant,
  getTenants,
  getTenantById,
  updateTenant,
} from "@src/controllers/tenant.controller";
import RouteRegistrar from "@src/middleware/RouteRegistrar";
import { authRoleMiddleware } from "@src/middleware/authRoleMiddleware";
import { userRoleKeys } from "@src/utils/constants";

const registrar = new RouteRegistrar({
  basePath: "/api",
  tags: ["Tenant"],
});

/**@description Create new tenant with Tenant Admin */
registrar.post("/tenant/create", {
  requestSchema: { bodySchema: createTenantSchema },
  responseSchemas: [{ statusCode: 201, schema: tenantWithTrackingSchema }],
  middlewares: [
    authRoleMiddleware(
      userRoleKeys.PLATFORM_SUPER_ADMIN,
      userRoleKeys.PLATFORM_ADMIN,
      userRoleKeys.PLATFORM_USER
    ),
  ],
  controller: createTenant,
});

/**@description Update tenant */
registrar.put("/tenant/:id", {
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: updateTenantSchema,
  },
  responseSchemas: [{ statusCode: 200, schema: tenantWithTrackingSchema }],
  middlewares: [
    authRoleMiddleware(
      userRoleKeys.PLATFORM_SUPER_ADMIN,
      userRoleKeys.PLATFORM_ADMIN,
      userRoleKeys.PLATFORM_USER
    ),
  ],
  controller: updateTenant,
});

/**@description Get all tenants */
registrar.get("/tenant/list", {
  middlewares: [
    authRoleMiddleware(
      userRoleKeys.PLATFORM_SUPER_ADMIN,
      userRoleKeys.PLATFORM_ADMIN,
      userRoleKeys.PLATFORM_USER
    ),
  ],
  controller: getTenants,
});

/**@description Get tenant by ID */
registrar.get("/tenant/:id", {
  requestSchema: { paramsSchema: { id: idValidation } },
  responseSchemas: [{ statusCode: 200, schema: tenantWithTrackingSchema }],
  middlewares: [
    authRoleMiddleware(
      userRoleKeys.PLATFORM_SUPER_ADMIN,
      userRoleKeys.PLATFORM_ADMIN,
      userRoleKeys.PLATFORM_USER
    ),
  ],
  controller: getTenantById,
});

export default registrar;
