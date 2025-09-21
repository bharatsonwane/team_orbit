import {
  createTenantSchema,
  updateTenantSchema,
  tenantSchema,
  tenantWithAdminSchema,
} from '../schemas/tenant.schema';
import { idValidation } from '../schemas/common.schema';
import {
  createTenant,
  getTenants,
  getTenantById,
  updateTenant,
  getTenantUsers,
} from '../controllers/tenant.controller';
import RouteRegistrar from '../middleware/RouteRegistrar';
import { authRoleMiddleware } from '../middleware/authRoleMiddleware';

const registrar = new RouteRegistrar({
  basePath: '/api/tenant',
  tags: ['Tenant'],
});

/**@description Create new tenant with Tenant Admin */
registrar.post('/create', {
  requestSchema: { bodySchema: createTenantSchema },
  responseSchemas: [{ statusCode: 201, schema: tenantWithAdminSchema }],
  middleware: [authRoleMiddleware('Platform Super Admin', 'Platform Admin', 'Platform Manager')],
  controller: createTenant,
});

/**@description Get all tenants */
registrar.get('/list', {
  middleware: [authRoleMiddleware('Platform Super Admin', 'Platform Admin', 'Platform Manager')],
  controller: getTenants,
});

/**@description Get tenant by ID */
registrar.get('/:id', {
  requestSchema: { paramsSchema: { id: idValidation } },
  responseSchemas: [{ statusCode: 200, schema: tenantSchema }],
  middleware: [authRoleMiddleware('Platform Super Admin', 'Platform Admin', 'Platform Manager')],
  controller: getTenantById,
});

/**@description Update tenant */
registrar.put('/:id', {
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: updateTenantSchema,
  },
  responseSchemas: [{ statusCode: 200, schema: tenantSchema }],
  middleware: [authRoleMiddleware('Platform Super Admin', 'Platform Admin', 'Platform Manager')],
  controller: updateTenant,
});

/**@description Get tenant users */
registrar.get('/:id/users', {
  requestSchema: { paramsSchema: { id: idValidation } },
  middleware: [authRoleMiddleware('Platform Super Admin', 'Platform Admin', 'Platform Manager')],
  controller: getTenantUsers,
});

export default registrar;
