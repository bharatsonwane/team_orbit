import {
  retrieveLookupList,
  getLookupTypeById,
  getLookupTypeByName,
} from "../controllers/lookup.controller";
import RouteRegistrar from "../middleware/RouteRegistrar";
import {
  lookupListSchema,
  lookupTypeWithLookupsSchema,
} from "../schemas/lookup.schema";
import { idValidation, nameValidation } from "../schemas/common.schema";

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

registrar.get("/type-by-name/:name", {
  responseSchemas: [{ statusCode: 200, schema: lookupTypeWithLookupsSchema }],
  controller: getLookupTypeByName,
});

export default registrar;
