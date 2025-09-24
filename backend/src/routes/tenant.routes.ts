import {
  createTenantSchema,
  updateTenantSchema,
  baseTenantSchema,
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
import { userRoleKeys } from '../utils/constants';

const registrar = new RouteRegistrar({
  basePath: '/api/tenant',
  tags: ['Tenant'],
});

/**@description Create new tenant with Tenant Admin */
registrar.post('/create', {
  requestSchema: { bodySchema: createTenantSchema },
  responseSchemas: [{ statusCode: 201, schema: baseTenantSchema }],
  middleware: [
    authRoleMiddleware(
      userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
      userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
      userRoleKeys.USER_ROLE_PLATFORM_USER
    ),
  ],
  controller: createTenant,
});

/**@description Get all tenants */
registrar.get('/list', {
  middleware: [
    authRoleMiddleware(
      userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
      userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
      userRoleKeys.USER_ROLE_PLATFORM_USER
    ),
  ],
  controller: getTenants,
});

/**@description Get tenant by ID */
registrar.get('/:id', {
  requestSchema: { paramsSchema: { id: idValidation } },
  responseSchemas: [{ statusCode: 200, schema: baseTenantSchema }],
  middleware: [
    authRoleMiddleware(
      userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
      userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
      userRoleKeys.USER_ROLE_PLATFORM_USER
    ),
  ],
  controller: getTenantById,
});

/**@description Update tenant */
registrar.put('/:id', {
  requestSchema: {
    paramsSchema: { id: idValidation },
    bodySchema: updateTenantSchema,
  },
  responseSchemas: [{ statusCode: 200, schema: baseTenantSchema }],
  middleware: [
    authRoleMiddleware(
      userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
      userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
      userRoleKeys.USER_ROLE_PLATFORM_USER
    ),
  ],
  controller: updateTenant,
});

/**@description Get tenant users */
registrar.get('/:id/users', {
  requestSchema: { paramsSchema: { id: idValidation } },
  middleware: [
    authRoleMiddleware(
      userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
      userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
      userRoleKeys.USER_ROLE_PLATFORM_USER
    ),
  ],
  controller: getTenantUsers,
});

export default registrar;
