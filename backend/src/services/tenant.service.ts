import type {
  CreateTenantSchema,
  UpdateTenantSchema,
  BaseTenantSchema,
} from '../schemas/tenant.schema';
import type { dbClientPool } from '../middleware/dbClientMiddleware';
import { getHashPassword } from '../utils/authHelper';
import { buildUpdateFields } from '../utils/queryHelper';
import User from './user.service';
import Lookup from './lookup.service';
import { dbTransactionKeys } from '../utils/constants';

export default class Tenant {
  /**
   * Create a new tenant with automatic Tenant Admin creation
   */
  static async createTenant(
    db: dbClientPool,
    { tenantData }: { tenantData: CreateTenantSchema }
  ): Promise<BaseTenantSchema> {
    const client = db;
    const dbClient: dbClientPool = { mainPool: client.mainPool };

    try {
      // Start transaction
      await client.mainPool.query(dbTransactionKeys.BEGIN);

      // 1. Create the tenant
      // First get the active tenant status ID
      const activeTenantStatusQuery = `
        SELECT l.id FROM lookup l
        INNER JOIN lookup_type lt ON l."lookupTypeId" = lt.id
        WHERE l.name = 'TENANT_STATUS_ACTIVE' AND lt.name = 'TENANT_STATUS'
      `;

      const statusResult = await dbClient.mainPool.query(
        activeTenantStatusQuery
      );

      if (statusResult.rows.length === 0) {
        throw new Error('TENANT_STATUS_ACTIVE not found');
      }
      const activeTenantStatusId = statusResult.rows[0].id;

      const tenantQuery = `
        INSERT INTO tenant (name, label, "statusId", "isArchived", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, FALSE, NOW(), NOW())
        RETURNING id, name, label, "statusId", "isArchived", "createdAt", "updatedAt", "archivedAt"
      `;

      const tenantResult = await dbClient.mainPool.query(tenantQuery, [
        tenantData.name,
        tenantData.label,
        activeTenantStatusId,
      ]);

      const tenant = tenantResult.rows[0];

      // 2. Get Tenant Admin role ID
      const tenantAdminRoleId = await Lookup.getTenantAdminRoleId(
        dbClient.mainPool
      );
      const userStatusId = await Lookup.getUserStatusActiveId(
        dbClient.mainPool
      );

      // 3. Hash the admin user password
      const hashPassword = await getHashPassword(tenantData.adminUser.password);

      // 4. Create the Tenant Admin user
      const adminUser = await User.signupUser(dbClient, {
        email: tenantData.adminUser.email,
        hashPassword,
        phone: tenantData.adminUser.phone || '',
        firstName: tenantData.adminUser.firstName,
        lastName: tenantData.adminUser.lastName,
        statusId: userStatusId,
        tenantId: tenant.id,
      });

      // 5. Assign Tenant Admin role to the user
      await dbClient.mainPool.query(
        `INSERT INTO user_role_xref ("userId", "roleId", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())`,
        [adminUser.id, tenantAdminRoleId]
      );

      // 6. Get the admin user with roles for response
      const adminUserWithRoles = await User.getUserByIdOrEmailOrPhone(
        dbClient,
        {
          userId: adminUser.id,
        }
      );

      // Commit transaction
      await dbClient.mainPool.query(dbTransactionKeys.COMMIT);

      return {
        id: tenant.id,
        name: tenant.name,
        label: tenant.label,
        statusId: tenant.statusId,
        isArchived: tenant.isArchived,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        archivedAt: tenant.archivedAt,
      };
    } catch (error) {
      // Rollback transaction on error
      await dbClient.mainPool.query(dbTransactionKeys.ROLLBACK);
      throw error;
    }
  }

  /**
   * Get all tenants
   */
  static async getTenants(
    db: dbClientPool,
    { includeArchived = false }: { includeArchived?: boolean } = {}
  ): Promise<BaseTenantSchema[]> {
    const query = `
      SELECT id, name, label, "statusId", "isArchived", "createdAt", "updatedAt", "archivedAt"
      FROM tenant
      ${includeArchived ? '' : 'WHERE "isArchived" = FALSE'}
      ORDER BY "createdAt" DESC
    `;

    const result = await db.mainPool.query(query);
    return result.rows;
  }

  /**
   * Get tenant by ID
   */
  static async getTenantById(
    db: dbClientPool,
    { tenantId }: { tenantId: number }
  ): Promise<BaseTenantSchema | null> {
    const query = `
      SELECT id, name, label, "statusId", "isArchived", "createdAt", "updatedAt", "archivedAt"
      FROM tenant
      WHERE id = $1
    `;

    const result = await db.mainPool.query(query, [tenantId]);
    return result.rows[0] || null;
  }

  /**
   * Update tenant
   */
  static async updateTenant(
    db: dbClientPool,
    {
      tenantId,
      updateData,
    }: { tenantId: number; updateData: UpdateTenantSchema }
  ): Promise<BaseTenantSchema> {
    const acceptedKeys = ['label', 'isArchived'];

    const updateFields = buildUpdateFields(acceptedKeys, updateData);

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No valid fields to update');
    }

    // Handle archivedAt field based on isArchived
    if (updateData.isArchived !== undefined) {
      if (updateData.isArchived) {
        updateFields["archivedAt"] = 'NOW()';
      } else {
        updateFields["archivedAt"] = 'NULL';
      }
    }

    const setQueryString = Object.entries(updateFields)
      .map(([key, value]) => `"${key}" = ${value}`)
      .join(', ');

    const queryString = `
      UPDATE tenant
      SET ${setQueryString}, "updatedAt" = NOW()
      WHERE id = ${tenantId}
      RETURNING id, name, label, "statusId", "isArchived", "createdAt", "updatedAt", "archivedAt"
    `;

    const results = await db.mainPool.query(queryString);
    return results.rows[0] as BaseTenantSchema;
  }

  /**
   * Get tenant users (admin, managers, etc.)
   */
  static async getTenantUsers(
    db: dbClientPool,
    { tenantId }: { tenantId: number }
  ): Promise<any[]> {
    const query = `
      SELECT 
        up.id,
        up.email,
        up."firstName",
        up."lastName",
        up.phone,
        up."tenantId",
        up."createdAt",
        up."updatedAt",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', l.id,
              'name', l.name,
              'label', l.label,
              'lookupTypeId', l."lookupTypeId"
            )
          ) FILTER (WHERE l.id IS NOT NULL), 
          '[]'::json
        ) AS "userRoles"
      FROM app_user up
      LEFT JOIN user_role_xref urx ON up.id = urx."userId"
      LEFT JOIN lookup l ON urx."roleId" = l.id
      WHERE up."tenantId" = $1
      GROUP BY up.id, up.email, up."firstName", up."lastName", up.phone, up."tenantId", up."createdAt", up."updatedAt"
      ORDER BY up."createdAt" DESC
    `;

    const result = await db.mainPool.query(query, [tenantId]);
    return result.rows;
  }
}
