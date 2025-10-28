import {
  retrieveLookupList,
  getLookupTypeById,
} from "@src/controllers/lookup.controller";
import RouteRegistrar from "@src/middleware/RouteRegistrar";
import {
  lookupListSchema,
  lookupTypeWithLookupsSchema,
} from "@src/schemas/lookup.schema";
import { idValidation, nameValidation } from "@src/schemas/common.schema";

const registrar = new RouteRegistrar({
  basePath: "/api/lookup",
  tags: ["Lookup"],
});

registrar.get("/list", {
  responseSchemas: [{ statusCode: 200, schema: lookupListSchema }],
  controller: retrieveLookupList,
});

registrar.get("/type/:id", {
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  responseSchemas: [{ statusCode: 200, schema: lookupTypeWithLookupsSchema }],
  controller: getLookupTypeById,
});

export default registrar;
