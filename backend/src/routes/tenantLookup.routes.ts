import RouteRegistrar from "@src/middleware/RouteRegistrar";
import {
  createTenantLookupTypeById,
  getTenantLookupList,
  getTenantLookupTypeById,
  updateTenantLookupTypeById,
} from "@src/controllers/tenantLookup.controller";
import { idValidation } from "@src/schemas/common.schema";
import {
  tenantLookupSchema,
  tenantLookupTypesListSchema,
  tenantLookupsWithTypeListSchema,
} from "@src/schemas/tenantLookup.schema";
import { tenantHeaderMiddleware } from "@src/middleware/tenantHeaderMiddleware";
import { authRoleMiddleware } from "@src/middleware/authRoleMiddleware";
import { userRoleKeys } from "@src/utils/constants";

const registrar = new RouteRegistrar({
  basePath: "/api/tenant-lookup",
  tags: ["Tenant Lookup"],
});

/**@description Get all tenant lookups */
registrar.get("/list", {
  responseSchemas: [
    { statusCode: 200, schema: tenantLookupsWithTypeListSchema },
  ],
  middlewares: [tenantHeaderMiddleware()],
  controller: getTenantLookupList,
});

/**@description Get tenant lookup type by ID */
registrar.get("/type/:id", {
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  responseSchemas: [{ statusCode: 200, schema: tenantLookupTypesListSchema }],
  middlewares: [tenantHeaderMiddleware()],
  controller: getTenantLookupTypeById,
});

/**@description Update tenant lookup by ID */
registrar.put("/:id", {
  requestSchema: {
    paramsSchema: { id: idValidation },
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
  controller: updateTenantLookupTypeById,
});

/**@description Create tenant lookup by ID */
registrar.post("/:id", {
  requestSchema: {
    paramsSchema: { id: idValidation },
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
  controller: createTenantLookupTypeById,
});

export default registrar;
