import { HttpError } from '../utils/httpError';
import { dbClientPool } from '../middleware/dbClientMiddleware';
import { PoolClient } from 'pg';
import { LookupListSchema, LookupTypeWithLookupsSchema } from '../schemas/lookup.schema';

export default class Lookup {
  constructor() {}

  static async retrieveLookupList(
    dbClient: dbClientPool
  ): Promise<LookupListSchema> {
    // SQL Query to fetch all LookupTypes with their associated Lookups using JSON aggregation
    const queryString = `
      SELECT 
        lt.id,
        lt.name,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', l.id,
              'name', l.name,
              'label', l.label,
              'lookupTypeId', l."lookupTypeId"
            )
            ORDER BY l."sortOrder", l.label
          ) FILTER (WHERE l.id IS NOT NULL),
          '[]'::json
        ) AS lookups
      FROM lookup_type lt
      LEFT JOIN lookup l ON lt.id = l."lookupTypeId" AND l."isArchived" = FALSE
      WHERE lt."archivedAt" IS NULL
      GROUP BY lt.id, lt.name
      ORDER BY lt.id;
    `;

    // Execute the queryString
    const results = (await dbClient.mainPool.query(queryString)).rows;
    return results;
  }

  static async getLookupTypeById(
    dbClient: dbClientPool,
    id: number
  ): Promise<LookupTypeWithLookupsSchema> {
    const queryString = `
      SELECT 
        lt.id,
        lt.name,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', l.id,
              'name', l.name,
              'label', l.label,
              'lookupTypeId', l."lookupTypeId"
            )
            ORDER BY l."sortOrder", l.label
          ) FILTER (WHERE l.id IS NOT NULL),
          '[]'::json
        ) AS lookups
      FROM lookup_type lt
      LEFT JOIN lookup l ON lt.id = l."lookupTypeId" AND l."isArchived" = FALSE
      WHERE lt.id = ${id} AND lt."archivedAt" IS NULL
      GROUP BY lt.id, lt.name;
    `;

    // Execute the queryString
    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows;

    if (response.length === 0) {
      throw new HttpError('Lookup Type not found', 404);
    }

    return response[0];
  }

  static async getLookupIdByName(
    dbClient: dbClientPool,
    name: string
  ): Promise<any> {
    const queryString = `
      SELECT 
        l.id,
        l.name,
        l.label,
        l."lookupTypeId",
        l."isSystem",
        l."sortOrder",
        l."isArchived",
        l."createdAt",
        l."updatedAt",
        l."archivedAt",
        l."createdBy",
        l."updatedBy",
        l."archivedBy"
      FROM lookup l
      WHERE l.name = '${name}';
    `;
    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows;
    if (response.length === 0) {
      throw new HttpError('Lookup not found', 404);
    }
    return response[0].id;
  }

  static async getUserStatusPendingId(dbClient: dbClientPool): Promise<number> {
    const queryString = `
      SELECT l.id 
      FROM lookup l
      INNER JOIN lookup_type lt ON l."lookupTypeId" = lt.id
      WHERE l.name = 'PENDING' AND lt.name = 'USER_STATUS';
    `;
    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows;

    if (response.length === 0) {
      throw new HttpError('PENDING not found.', 404);
    }

    return response[0].id;
  }

  static async getUserRoleUserId(dbClient: dbClientPool): Promise<number> {
    const queryString = `
      SELECT l.id
      FROM lookup l
      INNER JOIN lookup_type lt ON l."lookupTypeId" = lt.id
      WHERE l.name = 'TENANT_USER' AND lt.name = 'USER_ROLE';`;
    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows;

    if (response.length === 0) {
      throw new HttpError('TENANT_USER not found.', 404);
    }

    return response[0].id;
  }

  static async getTenantAdminRoleId(dbClient: PoolClient): Promise<number> {
    const queryString = `
      SELECT l.id
      FROM lookup l
      INNER JOIN lookup_type lt ON l."lookupTypeId" = lt.id
      WHERE l.name = 'TENANT_ADMIN' AND lt.name = 'USER_ROLE';`;
    const results = await dbClient.query(queryString);
    const response = results.rows;

    if (response.length === 0) {
      throw new HttpError('TENANT_ADMIN not found.', 404);
    }

    return response[0].id;
  }

  static async getUserStatusActiveId(dbClient: PoolClient): Promise<number> {
    const queryString = `
      SELECT l.id
      FROM lookup l
      INNER JOIN lookup_type lt ON l."lookupTypeId" = lt.id
      WHERE l.name = 'ACTIVE' AND lt.name = 'USER_STATUS';`;
    const results = await dbClient.query(queryString);
    const response = results.rows;

    if (response.length === 0) {
      throw new HttpError('ACTIVE not found.', 404);
    }

    return response[0].id;
  }
}
