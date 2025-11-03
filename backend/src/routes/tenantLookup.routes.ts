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
import z from "zod";

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

/**@description Get tenant lookup list by lookup type id */
registrar.get("/type/:id", {
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  responseSchemas: [{ statusCode: 200, schema: tenantLookupTypesListSchema }],
  middlewares: [tenantHeaderMiddleware()],
  controller: getTenantLookupTypeById,
});

/** @description Update tenant lookup by lookup ID */
registrar.put("/:id", {
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
registrar.post("/", {
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
