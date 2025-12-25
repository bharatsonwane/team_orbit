import {
  createTenantSchema,
  updateTenantSchema,
  tenantWithTrackingSchema,
} from "@src/schemaTypes/tenant.schemaTypes";
import { idValidation } from "@src/schemaTypes/common.schemaTypes";
import {
  createTenant,
  getTenants,
  getTenantById,
  updateTenant,
} from "@src/controllers/tenant.controller";
import RouteRegistrar from "@src/middleware/RouteRegistrar";
import { authPermissionMiddleware } from "@src/middleware/authPermissionMiddleware";
import { platformPermissionKeys } from "@src/utils/constants";

const registrar = new RouteRegistrar({
  basePath: "/api",
  tags: ["Tenant"],
});

/**@description Create new tenant */
registrar.post("/tenant/create", {
  middlewares: [
    authPermissionMiddleware({
      allowedPlatformPermissions: [platformPermissionKeys.TENANT_CREATE],
    }),
  ],
  requestSchema: { bodySchema: createTenantSchema },
  responseSchemas: [{ statusCode: 201, schema: tenantWithTrackingSchema }],
  controller: createTenant,
});

/**@description Update tenant */
registrar.put("/tenant/:id", {
  middlewares: [
    authPermissionMiddleware({
      allowedPlatformPermissions: [platformPermissionKeys.TENANT_UPDATE],
    }),
  ],
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: updateTenantSchema,
  },
  responseSchemas: [{ statusCode: 200, schema: tenantWithTrackingSchema }],
  controller: updateTenant,
});

/**@description Get all tenants */
registrar.get("/tenant/list", {
  middlewares: [
    authPermissionMiddleware({
      allowedPlatformPermissions: [platformPermissionKeys.TENANT_READ],
    }),
  ],
  controller: getTenants,
});

/**@description Get tenant by ID */
registrar.get("/tenant/:id", {
  middlewares: [
    authPermissionMiddleware({
      allowedPlatformPermissions: [platformPermissionKeys.TENANT_READ],
    }),
  ],
  requestSchema: { paramsSchema: { id: idValidation } },
  responseSchemas: [{ statusCode: 200, schema: tenantWithTrackingSchema }],
  controller: getTenantById,
});

export default registrar;
