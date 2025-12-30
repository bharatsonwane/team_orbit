import type {
  CreateTenantSchema,
  UpdateTenantSchema,
  BaseTenantSchema,
  TenantWithIdSchema,
} from "@src/schemaTypes/tenant.schemaTypes";
import type { dbClientPool } from "@src/middleware/dbClientMiddleware";
import { buildUpdateSetFields } from "@src/utils/queryHelper";
import User from "@src/services/user.service";
import { dbTransactionKeys } from "@src/utils/constants";
import { DbMigrationManager } from "@src/database/dbMigrationManager";
import { schemaNames } from "@src/database/db";

export default class Tenant {
  /**
   * Create a new tenant
   */
  static async createTenant(
    dbClient: dbClientPool,
    { tenantData }: { tenantData: CreateTenantSchema }
  ): Promise<TenantWithIdSchema> {
    try {
      // Start transaction
      await dbClient.mainPool.query(dbTransactionKeys.BEGIN);

      // Create the tenant
      const tenantQuery = `
        INSERT INTO tenants (name, label, description, "statusId", "isArchived", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, FALSE, NOW(), NOW())
        RETURNING id, name, label, description, "statusId", "isArchived", "createdAt", "updatedAt", "archivedAt"
      `;

      const tenantResult = await dbClient.mainPool.query(tenantQuery, [
        tenantData.name,
        tenantData.label,
        tenantData.description,
        tenantData.statusId,
      ]);

      const tenant = tenantResult.rows[0];

      // Commit transaction
      await dbClient.mainPool.query(dbTransactionKeys.COMMIT);

      const migrationManager = new DbMigrationManager();

      await migrationManager.runMigrationForSchema({
        schemaName: schemaNames.tenantSchemaName(tenant.id),
        schemaFolderName: schemaNames.tenantSchemaFolderName(tenant.id),
      });

      return {
        id: tenant.id,
        name: tenant.name,
        label: tenant.label,
        description: tenant.description,
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
      SELECT id, name, label, description, "statusId", "isArchived", "createdAt", "updatedAt", "archivedAt"
      FROM tenants
      ${includeArchived ? "" : 'WHERE "isArchived" = FALSE'}
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
      SELECT id, name, label, description, "statusId", "isArchived", "createdAt", "updatedAt", "archivedAt"
      FROM tenants
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
  ): Promise<TenantWithIdSchema> {
    const acceptedKeys = ["label", "description", "isArchived", "archivedAt"];

    const values = {
      ...updateData,
      updatedAt: "NOW()",
    };

    // Handle archivedAt field based on isArchived
    if (updateData.isArchived !== undefined) {
      if (updateData.isArchived) {
        (values as any)["archivedAt"] = "NOW()";
      } else {
        (values as any)["archivedAt"] = "NULL";
      }
    }

    const setQueryString = buildUpdateSetFields({
      acceptedKeys,
      values: {
        ...values,
        updatedAt: "NOW()",
      },
    });

    if (setQueryString.length === 0) {
      throw new Error("No valid fields to update");
    }

    const queryString = `
      UPDATE tenants
      SET ${setQueryString}
      WHERE id = ${tenantId}
      RETURNING id, name, label, description, "statusId", "isArchived", "createdAt", "updatedAt", "archivedAt"
    `;

    const results = await db.mainPool.query(queryString);
    return results.rows[0] as TenantWithIdSchema;
  }

  static async getTenantsByUserId(
    db: dbClientPool,
    { userId }: { userId: number }
  ): Promise<TenantWithIdSchema[]> {
    const query = `
      SELECT t.id, t.name, t.label, t.description, t."statusId", t."isArchived", t."createdAt", t."updatedAt", t."archivedAt"
      FROM tenants t
      INNER JOIN user_tenants_xref utx ON t.id = utx."tenantId"
      WHERE utx."userId" = $1 AND utx."isArchived" = FALSE
      ORDER BY t."createdAt" DESC
    `;

    const results = await db.mainPool.query(query, [userId]);
    return results.rows;
  }
}
