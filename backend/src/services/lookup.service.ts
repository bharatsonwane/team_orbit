import { HttpError } from "@src/utils/httpError";
import { dbClientPool } from "@src/middleware/dbClientMiddleware";
import {
  LookupListSchema,
  LookupTypeWithLookupsSchema,
  LookupWithTrackingSchema,
} from "@src/schemaTypes/lookup.schemaTypes";

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
      FROM lookup_types lt
      LEFT JOIN lookups l ON lt.id = l."lookupTypeId" AND l."isArchived" = FALSE
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
      FROM lookup_types lt
      LEFT JOIN lookups l ON lt.id = l."lookupTypeId" AND l."isArchived" = FALSE
      WHERE lt.id = ${id} AND lt."archivedAt" IS NULL
      GROUP BY lt.id, lt.name;
    `;

    // Execute the queryString
    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows;

    if (response.length === 0) {
      throw new HttpError("Lookup Type not found", 404);
    }

    return response[0];
  }

  static async getLookupDataByLookupTypeNameAndLookupName(
    dbClient: dbClientPool,
    {
      lookupTypeName,
      lookupName,
    }: {
      lookupTypeName: string;
      lookupName: string;
    }
  ): Promise<LookupTypeWithLookupsSchema> {
    const queryString = `
      SELECT 
        l.id,
        l.name,
        l.label,
        l.category,
        l.description,
        l."isSystem",
        l."sortOrder",
        l."isArchived",
        l."createdAt",
        l."updatedAt",
        l."archivedAt",
        l."createdBy",
        l."updatedBy",
        l."archivedBy"
      FROM lookups l
      INNER JOIN lookup_types lt ON l."lookupTypeId" = lt.id
      WHERE l.name = '${lookupName}' AND lt.name = '${lookupTypeName}';
    `;
    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows;
    if (response.length === 0) {
      throw new HttpError(
        `Lookup ${lookupName} not found in lookup type ${lookupTypeName}`,
        404
      );
    }
    return response[0];
  }

  static async getLookupDataById(
    dbClient: dbClientPool,
    id: number
  ): Promise<LookupWithTrackingSchema | null> {
    const queryString = `
      SELECT 
        l.id,
        l.name,
        l.label,
        l.category,
        l.description,
        l."isSystem",
        l."sortOrder",
        l."createdBy",
        l."lookupTypeId",
        l."createdAt",
        l."updatedAt",
        l."archivedAt",
        l."updatedBy",
        l."archivedBy"
      FROM lookups l
      WHERE l.id = ${id} AND l."isArchived" = FALSE;
    `;
    const results = await dbClient.mainPool.query(queryString);
    return results.rows[0] || null;
  }
}
