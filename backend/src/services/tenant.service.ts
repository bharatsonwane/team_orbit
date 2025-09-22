import { PoolClient } from 'pg';
import type { CreateTenantSchema, UpdateTenantSchema, TenantSchema } from '../schemas/tenant.schema';
import type { dbClientPool } from '../middleware/dbClientMiddleware';
import { getHashPassword } from '../utils/authHelper';
import User from './user.service';
import Lookup from './lookup.service';

export default class Tenant {
  /**
   * Create a new tenant with automatic Tenant Admin creation
   */
  static async createTenant(
    db: PoolClient,
    { tenantData }: { tenantData: CreateTenantSchema }
  ): Promise<{ tenant: TenantSchema; adminUser: any }> {
    const client = db;
    const dbClient: dbClientPool = { mainPool: client };

    try {
      // Start transaction
      await client.query('BEGIN');

      // 1. Create the tenant  
      // First get the active tenant status ID
      const activeTenantStatusQuery = `
        SELECT l.id FROM lookup l
        INNER JOIN lookup_type lt ON l."lookupTypeId" = lt.id
        WHERE l.name = 'TENANT_STATUS_ACTIVE' AND lt.name = 'TENANT_STATUS'
      `;
      const statusResult = await client.query(activeTenantStatusQuery);
      if (statusResult.rows.length === 0) {
        throw new Error('TENANT_STATUS_ACTIVE not found');
      }
      const activeTenantStatusId = statusResult.rows[0].id;

      const tenantQuery = `
        INSERT INTO tenant (name, label, "statusId", "isArchived", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, FALSE, NOW(), NOW())
        RETURNING id, name, label, "statusId", "isArchived", "createdAt", "updatedAt", "archivedAt"
      `;

      const tenantResult = await client.query(tenantQuery, [
        tenantData.name,
        tenantData.label,
        activeTenantStatusId,
      ]);

      const tenant = tenantResult.rows[0];

      // 2. Get Tenant Admin role ID
      const tenantAdminRoleId = await Lookup.getTenantAdminRoleId(client);
      const userStatusId = await Lookup.getUserStatusActiveId(client);

      // 3. Hash the admin user password
      const hashedPassword = await getHashPassword(tenantData.adminUser.password);

      // 4. Create the Tenant Admin user
      const adminUser = await User.signupUser(dbClient, {
        email: tenantData.adminUser.email,
        hashedPassword,
        phone: tenantData.adminUser.phone || '',
        firstName: tenantData.adminUser.firstName,
        lastName: tenantData.adminUser.lastName,
        statusId: userStatusId,
        tenantId: tenant.id,
      });

      // 5. Assign Tenant Admin role to the user
      await client.query(
        `INSERT INTO user_role_xref ("userId", "roleId", "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())`,
        [adminUser.id, tenantAdminRoleId]
      );

      // 6. Get the admin user with roles for response
      const adminUserWithRoles = await User.getUserByIdOrEmailOrPhone(dbClient, { 
        userId: adminUser.id 
      });

      // Commit transaction
      await client.query('COMMIT');

      return {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          label: tenant.label,
          description: null, // Remove description from tenant schema
          isArchived: tenant.isArchived,
          createdAt: tenant.createdAt,
          updatedAt: tenant.updatedAt,
          archivedAt: tenant.archivedAt,
        },
        adminUser: adminUserWithRoles,
      };
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Get all tenants
   */
  static async getTenants(
    db: PoolClient,
    { includeArchived = false }: { includeArchived?: boolean } = {}
  ): Promise<TenantSchema[]> {
    const query = `
      SELECT id, name, label, "statusId", "isArchived", "createdAt", "updatedAt", "archivedAt"
      FROM tenant
      ${includeArchived ? '' : 'WHERE "isArchived" = FALSE'}
      ORDER BY "createdAt" DESC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get tenant by ID
   */
  static async getTenantById(
    db: PoolClient,
    { tenantId }: { tenantId: number }
  ): Promise<TenantSchema | null> {
    const query = `
      SELECT id, name, label, "statusId", "isArchived", "createdAt", "updatedAt", "archivedAt"
      FROM tenant
      WHERE id = $1
    `;

    const result = await db.query(query, [tenantId]);
    return result.rows[0] || null;
  }

  /**
   * Update tenant
   */
  static async updateTenant(
    db: PoolClient,
    { tenantId, updateData }: { tenantId: number; updateData: UpdateTenantSchema }
  ): Promise<TenantSchema> {
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (updateData.name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      updateValues.push(updateData.name);
    }

    if (updateData.label !== undefined) {
      updateFields.push(`label = $${paramCount++}`);
      updateValues.push(updateData.label);
    }

    // Remove description field as it's not in the database schema

    if (updateData.isArchived !== undefined) {
      updateFields.push(`"isArchived" = $${paramCount++}`);
      updateValues.push(updateData.isArchived);
      
      if (updateData.isArchived) {
        updateFields.push(`"archivedAt" = NOW()`);
      } else {
        updateFields.push(`"archivedAt" = NULL`);
      }
    }

    updateFields.push(`"updatedAt" = NOW()`);
    updateValues.push(tenantId);

    const query = `
      UPDATE tenant 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, label, "statusId", "isArchived", "createdAt", "updatedAt", "archivedAt"
    `;

    const result = await db.query(query, updateValues);
    return result.rows[0];
  }

  /**
   * Get tenant users (admin, managers, etc.)
   */
  static async getTenantUsers(
    db: PoolClient,
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

    const result = await db.query(query, [tenantId]);
    return result.rows;
  }
}
