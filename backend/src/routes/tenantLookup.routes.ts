import RouteRegistrar from "@src/middleware/RouteRegistrar";
import { TenantLookupController } from "@src/controllers/tenantLookup.controller";
import { idValidation } from "@src/schemas/common.schema";
import {
  tenantLookupTypesListSchema,
  tenantLookupsListSchema,
  tenantLookupsWithTypeListSchema,
  createTenantLookupRequestSchema,
  updateTenantLookupRequestSchema,
  tenantLookupResponseSchema,
  deleteTenantLookupResponseSchema,
} from "@src/schemas/tenantLookup.schema";

const registrar = new RouteRegistrar({
  basePath: "/api/tenant/:tenantId",
  tags: ["Tenant Lookup"],
});

// Get all tenant lookup types
registrar.get("/lookup-types", {
  responseSchemas: [{ statusCode: 200, schema: tenantLookupTypesListSchema }],
  controller: TenantLookupController.getTenantLookupTypes,
});

// Get tenant lookups by type
registrar.get("/lookups/:lookupType", {
  responseSchemas: [{ statusCode: 200, schema: tenantLookupsListSchema }],
  controller: TenantLookupController.getTenantLookupsByType,
});

// Get all tenant lookups
registrar.get("/lookups", {
  responseSchemas: [
    { statusCode: 200, schema: tenantLookupsWithTypeListSchema },
  ],
  controller: TenantLookupController.getAllTenantLookups,
});

// Create tenant lookup
registrar.post("/lookups", {
  requestSchema: { bodySchema: createTenantLookupRequestSchema },
  responseSchemas: [{ statusCode: 201, schema: tenantLookupResponseSchema }],
  controller: TenantLookupController.createTenantLookup,
});

// Update tenant lookup
registrar.put("/lookups/:id", {
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: updateTenantLookupRequestSchema,
  },
  responseSchemas: [{ statusCode: 200, schema: tenantLookupResponseSchema }],
  controller: TenantLookupController.updateTenantLookup,
});

// Delete tenant lookup (soft delete)
registrar.delete("/lookups/:id", {
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  responseSchemas: [
    { statusCode: 200, schema: deleteTenantLookupResponseSchema },
  ],
  controller: TenantLookupController.deleteTenantLookup,
});

export default registrar;
