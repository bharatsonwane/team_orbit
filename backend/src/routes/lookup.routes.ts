
import {
  retrieveLookupList,
  getLookupTypeById,
} from '../controllers/lookup.controller';
import RouteRegistrar from '../middleware/RouteRegistrar';
import { lookupListSchema, lookupTypeSchema } from '../schemas/lookup.schema';
import { idValidation } from '../schemas/common.schema';

const registrar = new RouteRegistrar({
  basePath: '/api/lookup',
  tags: ['Lookup'],
});

registrar.get('/list', {
  responseSchemas: [{ statusCode: 200, schema: lookupListSchema }],
  controller: retrieveLookupList,
});

registrar.get('/type/:id', {
  requestSchema: {
    paramsSchema: { id: idValidation },
  },
  responseSchemas: [{ statusCode: 200, schema: lookupTypeSchema }],
  controller: getLookupTypeById,
});

export default registrar;
