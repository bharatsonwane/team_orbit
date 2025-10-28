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
  static async retrieveTenantLookupList(
    dbClient: dbClientPool
  ): Promise<TenantLookupType[]> {
    // SQL Query to fetch all LookupTypes with their associated Lookups using JSON aggregation
    const queryString = `
      SELECT 
        lt.id,
        lt.name,
        lt.label,
        lt."isSystem",
        lt."createdAt",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', l.id,
              'name', l.name,
              'label', l.label,
              'category', l.category,
              'description', l.description,
              'isSystem', l."isSystem",
              'sortOrder', l."sortOrder",
              'createdBy', l."createdBy",
              'lookupTypeId', l."lookupTypeId"
            )
            ORDER BY l."sortOrder", l.label
          ) FILTER (WHERE l.id IS NOT NULL),
          '[]'::json
        ) AS lookups
      FROM tenant_lookup_types lt
      LEFT JOIN tenant_lookups l ON lt.id = l."lookupTypeId" AND l."isArchived" = FALSE
      WHERE lt."isArchived" = FALSE
      GROUP BY lt.id, lt.name
      ORDER BY lt.id;
    `;

    // Execute the queryString
    const results = (await dbClient.tenantPool?.query(queryString))?.rows || [];
    return results;
  }

  /**
   * Get all tenant lookups with their type information
   */
  static async getTenantLookupList(
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
   * Get tenant lookup type by ID with its associated lookups
   */
  static async getTenantLookupTypeById(
    dbClient: dbClientPool,
    id: number
  ): Promise<TenantLookupType | null> {
    const queryString = `
      SELECT 
        lt.id,
        lt.name,
        lt.label,
        lt."isSystem",
        lt."createdAt",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', l.id,
              'name', l.name,
              'label', l.label,
              'category', l.category,
              'description', l.description,
              'isSystem', l."isSystem",
              'sortOrder', l."sortOrder",
              'createdBy', l."createdBy",
              'lookupTypeId', l."lookupTypeId"
            )
            ORDER BY l."sortOrder", l.label
          ) FILTER (WHERE l.id IS NOT NULL),
          '[]'::json
        ) AS lookups
      FROM tenant_lookup_types lt
      LEFT JOIN tenant_lookups l ON lt.id = l."lookupTypeId" AND l."isArchived" = FALSE
      WHERE  lt.id = $1 AND lt."isArchived" = FALSE
      GROUP BY lt.id, lt.name
      ORDER BY lt.id;
    `;

    const result = await dbClient.tenantPool?.query(queryString, [id]);
    return result?.rows[0] || null;
  }
}
