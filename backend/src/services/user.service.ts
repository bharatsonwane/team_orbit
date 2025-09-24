import { dbClientPool } from '../middleware/dbClientMiddleware';
import {
  UserSignupServiceSchema,
  BaseUserSchema,
} from '../schemas/user.schema';
import { buildUpdateFields } from '../utils/queryHelper';

export default class User {

  static async signupUser(
    dbClient: dbClientPool,
    userData: UserSignupServiceSchema
  ): Promise<BaseUserSchema> {
    const userSignupQuery = `
        INSERT INTO app_user (
                email,
                "hashPassword",
                phone,
                "firstName",
                "lastName",
                "statusId",
                "tenantId",
                title,
                "middleName",
                "maidenName",
                gender,
                dob,
                "bloodGroup",
                "marriedStatus",
                bio,
                "createdAt",
                "updatedAt"
            ) VALUES (
                '${userData.email}',
                '${userData.hashPassword}',
                '${userData.phone}',
                '${userData.firstName}',
                '${userData.lastName}',
                ${userData.statusId},
                ${userData.tenantId || 'NULL'},
                ${userData.title ? `'${userData.title}'` : 'NULL'},
                ${userData.middleName ? `'${userData.middleName}'` : 'NULL'},
                ${userData.maidenName ? `'${userData.maidenName}'` : 'NULL'},
                ${userData.gender ? `'${userData.gender}'` : 'NULL'},
                ${userData.dob ? `'${userData.dob}'` : 'NULL'},
                ${userData.bloodGroup ? `'${userData.bloodGroup}'` : 'NULL'},
                ${userData.marriedStatus ? `'${userData.marriedStatus}'` : 'NULL'},
                ${userData.bio ? `'${userData.bio}'` : 'NULL'},
                NOW(),
                NOW()
        )
        RETURNING *;`;
    const results = await dbClient.mainPool.query(userSignupQuery);
    const response = results.rows[0] as BaseUserSchema;
    return response;
  }

  static async createUserInfo(
    dbClient: dbClientPool,
    userData: Partial<BaseUserSchema>
  ): Promise<BaseUserSchema> {
    const queryString = `
      INSERT INTO app_user (
          title,
          "firstName",
          "lastName",
          "middleName",
          "maidenName",
          gender,
          dob,
          "bloodGroup",
          "marriedStatus",
          email,
          phone,
          "hashPassword",
          bio,
          "statusId",
          "createdAt",
          "updatedAt"
    ) VALUES (
      '${userData.title}',
      '${userData.firstName}',
      '${userData.lastName}',
      '${userData.middleName}',
      '${userData.maidenName}',
      '${userData.gender}',
      '${userData.dob}',
      '${userData.bloodGroup}',
      '${userData.marriedStatus}',
      '${userData.email}',
      '${userData.phone}',
      '${userData.hashPassword || "NULL"}',
      '${userData.bio}',
      ${userData.statusId},
      NOW(),
      NOW()
    )
    RETURNING *;
  `;

    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows[0] as BaseUserSchema;
    delete (response as any).hashPassword;

    return response;
  }

  static async updateUserInfo(
    dbClient: dbClientPool,
    {
      userId,
      updateData,
    }: {
      userId: number;
      updateData: Partial<BaseUserSchema>;
    }
  ): Promise<BaseUserSchema> {
    const acceptedKeys = [
      'title',
      'firstName',
      'lastName',
      'middleName',
      'maidenName',
      'gender',
      'dob',
      'bloodGroup',
      'marriedStatus',
      'bio',
    ];

    const updateFields = buildUpdateFields(acceptedKeys, updateData);

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No valid fields to update');
    }

    const setQueryString = Object.entries(updateFields)
      .map(([key, value]) => `"${key}" = ${value}`)
      .join(', ');

    const queryString = `
      UPDATE app_user
      SET ${setQueryString}, "updatedAt" = NOW()
      WHERE id = ${userId} RETURNING *;`;
    const results = await dbClient.mainPool.query(queryString);

    delete (results.rows[0] as any).hashPassword;
    return results.rows[0] as BaseUserSchema;
  }

  static async updateUserPassword(
    dbClient: dbClientPool,
    {
      userId,
      hashPassword,
    }: {
      userId: number;
      hashPassword: string;
    }
  ): Promise<BaseUserSchema> {
    const queryString = `
      UPDATE app_user
      SET "hashPassword" = '${hashPassword}', "updatedAt" = NOW()
      WHERE id = ${userId} RETURNING *;`;
    const results = await dbClient.mainPool.query(queryString);

    delete (results.rows[0] as any).hashPassword;
    return results.rows[0] as BaseUserSchema;
  }

  static async getUserByIdOrEmailOrPhone(
    dbClient: dbClientPool,
    {
      userId,
      email,
      phone,
      includePassword = false,
    }: {
      userId?: number;
      email?: string;
      phone?: string;
      includePassword?: boolean;
    }
  ): Promise<BaseUserSchema | undefined> {
    const whereConditions = [];

    // Build WHERE conditions based on provided parameters
    if (userId) {
      whereConditions.push(`up.id = ${userId}`);
    }
    if (email) {
      whereConditions.push(`up.email = '${email}'`);
    }
    if (phone) {
      whereConditions.push(`up.phone = '${phone}'`);
    }

    if (whereConditions.length === 0) {
      throw new Error(
        'At least one search criteria must be provided (userId, email, or phone)'
      );
    }

    // Use OR for email/phone combination, AND for userId with others
    const whereClause = userId
      ? whereConditions.join(' AND ')
      : whereConditions.join(' OR ');

    const queryString = `
        SELECT 
        up.id,
        up.title,
        up."firstName",
        up."lastName",
        up."middleName",
        up."maidenName",
        up.gender,
        up.dob,
        up."bloodGroup",
        up."marriedStatus",
        up.email,
        up.phone,
        ${includePassword ? 'up."hashPassword",' : ''}
        up.bio,
        up."statusId",
        ls.name as "statusName",
        ls.label as "statusLabel",
        up."tenantId",
        up."createdAt",
        up."updatedAt",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', l.id,
              'name', l.name,
              'label', l.label,
              'lookupTypeId', l."lookupTypeId",
              'isSystem', l."isSystem"
            )
          ) FILTER (WHERE l.id IS NOT NULL), 
          '[]'::json
        ) as "roles"
      FROM 
        app_user up
      LEFT JOIN lookup ls ON up."statusId" = ls.id
      LEFT JOIN user_role_xref urx ON up.id = urx."userId"
      LEFT JOIN lookup l ON urx."roleId" = l.id
      WHERE ${whereClause}
      GROUP BY up.id, ls.name, ls.label;`;

    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows[0] as BaseUserSchema | undefined;

    return response;
  }

  static async getUsers(dbClient: dbClientPool): Promise<BaseUserSchema[]> {
    const queryString = `
        SELECT 
          up.id,
          up.title,
          up."firstName",
          up."lastName",
          up."middleName",
          up."maidenName",
          up.gender,
          up.dob,
          up."bloodGroup",
          up."marriedStatus",
          up.email,
          up.phone,
          up.bio,
          up."statusId",
          ls.name as "statusName",
          ls.label as "statusLabel",
          up."tenantId",
          up."createdAt",
          up."updatedAt"
      FROM 
        app_user up
      LEFT JOIN lookup ls ON up."statusId" = ls.id;`;

    const results = await dbClient.mainPool.query(queryString);

    return results.rows as BaseUserSchema[];
  }
}