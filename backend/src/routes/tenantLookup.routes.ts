import RouteRegistrar from "@src/middleware/RouteRegistrar";
import {
  createTenantLookupById,
  getTenantLookupList,
  getTenantLookupTypeById,
  updateTenantLookupById,
} from "@src/controllers/tenantLookup.controller";
import { idValidation } from "@src/schemas/common.schema";
import {
  createTenantLookupRequestSchema,
  tenantLookupSchema,
  tenantLookupTypesListSchema,
  tenantLookupsListSchema,
  tenantLookupsWithTypeListSchema,
  updateTenantLookupRequestSchema,
} from "@src/schemas/tenantLookup.schema";
import { tenantHeaderMiddleware } from "@src/middleware/tenantHeaderMiddleware";
import { authRoleMiddleware } from "@src/middleware/authRoleMiddleware";
import { userRoleKeys } from "@src/utils/constants";

const registrar = new RouteRegistrar({
  basePath: "/api",
  tags: ["Tenant Lookup"],
});

/**@description Get all tenant lookups */
registrar.get("/tenant-lookup/list", {
  responseSchemas: [
    { statusCode: 200, schema: tenantLookupsWithTypeListSchema },
  ],
  middlewares: [tenantHeaderMiddleware()],
  controller: getTenantLookupList,
});

/**@description Get tenant lookup list by lookup type id */
registrar.get("/tenant-lookup/type/:id", {
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  responseSchemas: [{ statusCode: 200, schema: tenantLookupTypesListSchema }],
  middlewares: [tenantHeaderMiddleware()],
  controller: getTenantLookupTypeById,
});

/** @description Update tenant lookup by lookup ID */
registrar.put("/tenant-lookup/:id", {
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: updateTenantLookupRequestSchema,
  },

  responseSchemas: [{ statusCode: 200, schema: tenantLookupSchema }],
  middlewares: [
    tenantHeaderMiddleware(),
    authRoleMiddleware(
      userRoleKeys.PLATFORM_SUPER_ADMIN,
      userRoleKeys.PLATFORM_ADMIN,
      userRoleKeys.PLATFORM_USER,
      userRoleKeys.TENANT_ADMIN
    ),
  ],
  controller: updateTenantLookupById,
});

/** @description Create tenant lookup */
registrar.post("/tenant-lookup/", {
  requestSchema: {
    bodySchema: createTenantLookupRequestSchema,
  },
  responseSchemas: [{ statusCode: 201, schema: tenantLookupSchema }],
  middlewares: [
    tenantHeaderMiddleware(),
    authRoleMiddleware(
      userRoleKeys.PLATFORM_SUPER_ADMIN,
      userRoleKeys.PLATFORM_ADMIN,
      userRoleKeys.PLATFORM_USER,
      userRoleKeys.TENANT_ADMIN
    ),
  ],
  controller: createTenantLookupById,
});

export default registrar;
