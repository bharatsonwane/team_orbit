import { dbClientPool } from "@src/middleware/dbClientMiddleware";

interface TenantLookupType {
  id: number;
  name: string;
  label: string;
  isSystem: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TenantLookup {
  id: number;
  name: string;
  label: string;
  description?: string;
  isSystem: boolean;
  sortOrder: number;
  isArchived: boolean;
  lookupTypeId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TenantLookupService {
  /**
   * Get all tenant lookup types
   */
  static async getTenantLookupTypes(
    dbClient: dbClientPool
  ): Promise<TenantLookupType[]> {
    const result = await dbClient.tenantPool?.query(
      `SELECT * FROM tenant_lookup_types 
       WHERE "isArchived" = false 
       ORDER BY name ASC`
    );
    return result?.rows || [];
  }

  /**
   * Get tenant lookups by type name
   */
  static async getTenantLookupsByType(
    dbClient: dbClientPool,
    lookupTypeName: string
  ): Promise<TenantLookup[]> {
    const result = await dbClient.tenantPool?.query(
      `SELECT l.id, l.name, l.label, l.description, l."sortOrder", 
              l."isSystem", l."isArchived", l."lookupTypeId",
              l."createdAt", l."updatedAt"
       FROM tenant_lookups l
       INNER JOIN tenant_lookup_types lt ON l."lookupTypeId" = lt.id
       WHERE lt.name = $1 AND l."isArchived" = false
       ORDER BY l."sortOrder" ASC`,
      [lookupTypeName]
    );
    return result?.rows || [];
  }

  /**
   * Get all tenant lookups with their type information
   */
  static async getAllTenantLookups(
    dbClient: dbClientPool
  ): Promise<
    (TenantLookup & { lookupTypeName: string; lookupTypeLabel: string })[]
  > {
    const result = await dbClient.tenantPool?.query(
      `SELECT 
         l.id, l.name, l.label, l.description, l."sortOrder",
         l."isSystem", l."isArchived", l."lookupTypeId",
         l."createdAt", l."updatedAt",
         lt.name as "lookupTypeName",
         lt.label as "lookupTypeLabel"
       FROM tenant_lookups l
       INNER JOIN tenant_lookup_types lt ON l."lookupTypeId" = lt.id
       WHERE l."isArchived" = false
       ORDER BY lt."sortOrder", l."sortOrder" ASC`
    );
    return result?.rows || [];
  }

  /**
   * Create a new tenant lookup
   */
  static async createTenantLookup(
    dbClient: dbClientPool,
    data: {
      lookupTypeId: number;
      name: string;
      label: string;
      description?: string;
      isSystem?: boolean;
      createdBy?: number;
    }
  ): Promise<TenantLookup> {
    const result = await dbClient.tenantPool?.query(
      `INSERT INTO tenant_lookups 
       (name, label, description, "lookupTypeId", "isSystem", "sortOrder", "createdBy")
       VALUES ($1, $2, $3, $4, $5, 
         (SELECT COALESCE(MAX("sortOrder"), 0) + 1 
          FROM tenant_lookups WHERE "lookupTypeId" = $4),
         $6
       )
       RETURNING *`,
      [
        data.name,
        data.label,
        data.description || null,
        data.lookupTypeId,
        data.isSystem || false,
        data.createdBy || null,
      ]
    );
    return result?.rows[0] || [];
  }

  /**
   * Update a tenant lookup
   */
  static async updateTenantLookup(
    dbClient: dbClientPool,
    lookupId: number,
    data: {
      label?: string;
      description?: string;
      sortOrder?: number;
      updatedBy?: number;
    }
  ): Promise<TenantLookup> {
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (data.label !== undefined) {
      updateFields.push(`label = $${paramIndex++}`);
      updateValues.push(data.label);
    }
    if (data.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(data.description);
    }
    if (data.sortOrder !== undefined) {
      updateFields.push(`"sortOrder" = $${paramIndex++}`);
      updateValues.push(data.sortOrder);
    }
    if (data.updatedBy !== undefined) {
      updateFields.push(`"updatedBy" = $${paramIndex++}`);
      updateValues.push(data.updatedBy);
    }

    updateFields.push(`"updatedAt" = NOW()`);
    updateValues.push(lookupId);

    const result = await dbClient.tenantPool?.query(
      `UPDATE tenant_lookups 
       SET ${updateFields.join(", ")} 
       WHERE id = $${paramIndex}
       RETURNING *`,
      updateValues
    );
    return result?.rows[0] || [];
  }

  /**
   * Soft delete a tenant lookup (archive)
   */
  static async deleteTenantLookup(
    dbClient: dbClientPool,
    lookupId: number,
    archivedBy?: number
  ): Promise<void> {
    // Check if lookup is a system lookup
    const checkResult = await dbClient.tenantPool?.query(
      `SELECT "isSystem" FROM tenant_lookups WHERE id = $1`,
      [lookupId]
    );

    if (checkResult?.rows.length === 0) {
      throw new Error("Lookup not found");
    }

    if (checkResult?.rows[0].isSystem) {
      throw new Error("Cannot delete system lookup");
    }

    await dbClient.tenantPool?.query(
      `UPDATE tenant_lookups 
       SET "isArchived" = true, 
           "archivedAt" = NOW(), 
           "archivedBy" = $2
       WHERE id = $1`,
      [lookupId, archivedBy || null]
    );
  }
}
