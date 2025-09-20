import { HttpError } from '../utils/httpError';
import { dbClientPool } from '../middleware/dbClientMiddleware';

interface LookupType {
  id: number;
  name: string;
  lookups: LookupItem[];
}

interface LookupItem {
  id: number;
  label: string;
  name?: string;
  lookupTypeId?: number;
}

export default class Lookup {
  constructor() {}

  static async retrieveLookupList(
    dbClient: dbClientPool
  ): Promise<LookupType[]> {
    // SQL Query to fetch all LookupTypes with their associated Lookups
    const queryString = `
     SELECT 
       lt.id AS "lookupTypeId",
       lt.name AS "lookupTypeName",
       l.id AS "lookupId",
       l.label AS "lookupLabel"
     FROM lookup_type lt
     LEFT JOIN lookup l ON lt.id = l."lookupTypeId";
   `;

    // Execute the queryString
    const results = (await dbClient.mainPool.query(queryString)).rows;

    // Group results by LookupType
    const groupedData = results.reduce((acc: LookupType[], row: any) => {
      const {
        lookupTypeId,
        lookupTypeName,
        lookupId,
        lookupName,
        lookupLabel,
        lookupTypeReferenceId,
      } = row;

      // Find or create the LookupType entry
      let lookupType = acc.find(item => item.id === lookupTypeId);
      if (!lookupType) {
        lookupType = {
          id: lookupTypeId,
          name: lookupTypeName,
          lookups: [],
        };
        acc.push(lookupType);
      }

      // Add Lookup entry if it exists
      if (lookupId) {
        lookupType.lookups.push({
          id: lookupId,
          name: lookupName,
          label: lookupLabel,
          lookupTypeId: lookupTypeReferenceId,
        });
      }

      return acc;
    }, []);

    return groupedData;
  }

  static async getLookupTypeById(
    dbClient: dbClientPool,
    id: number
  ): Promise<LookupType> {
    const queryString = `
     SELECT 
       lt.id AS "lookupTypeId",
       lt.name AS "lookupTypeName",
       l.id AS "lookupId",
       l.label AS "lookupLabel"
     FROM lookup_type lt
     INNER JOIN lookup l ON lt.id = l."lookupTypeId"
     WHERE lt.id = ${id};
    `;

    // Execute the queryString
    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows;

    if (response.length === 0) {
      throw new HttpError('Lookup Type not found', 404);
    }

    const lookupType = response[0];

    const data: LookupType = {
      id: lookupType.lookupTypeId,
      name: lookupType.lookupTypeName,
      lookups: [],
    };

    // Add Lookup entry if it exists
    response.forEach((row: any) => {
      if (row.lookupId) {
        data.lookups.push({
          id: row.lookupId,
          label: row.lookupLabel,
        });
      }
    });
    return data;
  }

  static async getUserStatusPendingId(dbClient: dbClientPool): Promise<number> {
    const queryString = `
      SELECT l.id 
      FROM lookup l
      INNER JOIN lookup_type lt ON l."lookupTypeId" = lt.id
      WHERE l.label = 'Pending' AND lt.name = 'userStatus';
    `;
    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows;

    if (response.length === 0) {
      throw new HttpError('Lookup Pending user_status not found.', 404);
    }

    return response[0].id;
  }

  static async getUserRoleUserId(dbClient: dbClientPool): Promise<number> {
    const queryString = `
      SELECT l.id
      FROM lookup l
      INNER JOIN lookup_type lt ON l."lookupTypeId" = lt.id
      WHERE l.label = 'Standard' AND lt.name = 'userRole';`;
    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows;

    if (response.length === 0) {
      throw new HttpError('Lookup User user_role not found.', 404);
    }

    return response[0].id;
  }
}
