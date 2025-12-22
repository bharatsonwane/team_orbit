import RouteRegistrar from "@src/middleware/RouteRegistrar";
import {
  createTenantLookupById,
  getTenantLookupList,
  getTenantLookupTypeById,
  updateTenantLookupById,
} from "@src/controllers/tenantLookup.controller";
import { idValidation } from "@src/schemaTypes/common.schemaTypes";
import {
  createTenantLookupRequestSchema,
  tenantLookupSchema,
  tenantLookupTypesListSchema,
  tenantLookupsListSchema,
  tenantLookupsWithTypeListSchema,
  updateTenantLookupRequestSchema,
} from "@src/schemaTypes/tenantLookup.schemaTypes";
import { ensureTenantMiddleware } from "@src/middleware/ensureTenantMiddleware";
import { authRoleMiddleware } from "@src/middleware/authRoleMiddleware";
import { userRoleKeys } from "@src/utils/constants";

const registrar = new RouteRegistrar({
  basePath: "/api",
  tags: ["Tenant Lookup"],
});

/**@description Get all tenant lookups */
registrar.get("/tenant-lookup/list", {
  middlewares: [ensureTenantMiddleware()],
  responseSchemas: [
    { statusCode: 200, schema: tenantLookupsWithTypeListSchema },
  ],
  controller: getTenantLookupList,
});

/**@description Get tenant lookup list by lookup type id */
registrar.get("/tenant-lookup/type/:id", {
  middlewares: [ensureTenantMiddleware()],
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  responseSchemas: [{ statusCode: 200, schema: tenantLookupTypesListSchema }],
  controller: getTenantLookupTypeById,
});

/** @description Update tenant lookup by lookup ID */
registrar.put("/tenant-lookup/:id", {
  middlewares: [
    ensureTenantMiddleware(),
    authRoleMiddleware(
      userRoleKeys.PLATFORM_SUPER_ADMIN,
      userRoleKeys.PLATFORM_ADMIN,
      userRoleKeys.PLATFORM_USER,
      userRoleKeys.TENANT_ADMIN
    ),
  ],
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: updateTenantLookupRequestSchema,
  },
  responseSchemas: [{ statusCode: 200, schema: tenantLookupSchema }],
  controller: updateTenantLookupById,
});

/** @description Create tenant lookup */
registrar.post("/tenant-lookup/", {
  middlewares: [
    ensureTenantMiddleware(),
    authRoleMiddleware(
      userRoleKeys.PLATFORM_SUPER_ADMIN,
      userRoleKeys.PLATFORM_ADMIN,
      userRoleKeys.PLATFORM_USER,
      userRoleKeys.TENANT_ADMIN
    ),
  ],
  requestSchema: {
    bodySchema: createTenantLookupRequestSchema,
  },
  responseSchemas: [{ statusCode: 201, schema: tenantLookupSchema }],
  controller: createTenantLookupById,
});

export default registrar;
