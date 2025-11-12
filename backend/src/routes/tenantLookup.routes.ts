import RouteRegistrar from "@src/middleware/RouteRegistrar";
import {
  getTenantLookupList,
  getTenantLookupTypeById,
} from "@src/controllers/tenantLookup.controller";
import { idValidation } from "@src/schemas/common.schema";
import {
  tenantLookupTypesListSchema,
  tenantLookupsWithTypeListSchema,
} from "@src/schemas/tenantLookup.schema";
import { tenantHeaderMiddleware } from "@src/middleware/tenantHeaderMiddleware";

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

/**@description Get tenant lookup type by ID */
registrar.get("/tenant-lookup/type/:id", {
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  responseSchemas: [{ statusCode: 200, schema: tenantLookupTypesListSchema }],
  middlewares: [tenantHeaderMiddleware()],
  controller: getTenantLookupTypeById,
});

export default registrar;
