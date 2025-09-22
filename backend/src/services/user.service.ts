import { dbClientPool } from '../middleware/dbClientMiddleware';
import { 
  UserSignupServiceSchema, 
  UserDataSchema, 
  UserProfileSchema 
} from '../schemas/user.schema';

export default class User {
  // Helper function to map field names to database column names
  private static getColumnName(key: string): string {
    const columnMapping: { [key: string]: string } = {
      firstName: '"firstName"',
      lastName: '"lastName"',
      middleName: '"middleName"',
      maidenName: '"maidenName"',
      bloodGroup: '"bloodGroup"',
      marriedStatus: '"marriedStatus"',
      profilePicture: '"profilePicture"',
      hashedPassword: '"hashedPassword"',
      statusId: '"statusId"',
      tenantId: '"tenantId"',
      createdAt: '"createdAt"',
      updatedAt: '"updatedAt"',
    };
    return columnMapping[key] || key;
  }

  static async signupUser(
    dbClient: dbClientPool,
    userData: UserSignupServiceSchema
  ): Promise<UserProfileSchema> {
    const userSignupQuery = `
        INSERT INTO app_user (
                email,
                "hashedPassword",
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
                "isTemporaryPassword",
                "createdAt",
                "updatedAt"
            ) VALUES (
                '${userData.email}',
                '${userData.hashedPassword}',
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
                TRUE,
                NOW(),
                NOW()
        )
        RETURNING *;`;
    const results = await dbClient.mainPool.query(userSignupQuery);
    const response = results.rows[0] as UserProfileSchema;
    return response;
  }

  static async createUserInfo(
    dbClient: dbClientPool,
    { userData }: { userData: Partial<UserDataSchema> }
  ): Promise<UserProfileSchema> {
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
      'email',
      'phone',
      'hashedPassword',
      'profilePicture',
      'bio',
      'statusId',
      'tenantId',
    ];

    const keysToInsert = acceptedKeys.filter(
      key =>
        (userData as any)[key] !== undefined && (userData as any)[key] !== null
    );

    const columns = keysToInsert.map(key => User.getColumnName(key));
    const values = keysToInsert.map(key => {
      const value = (userData as any)[key];
      if (typeof value === 'string') {
        return `'${value}'`;
      } else if (typeof value === 'number') {
        return value;
      } else {
        return 'NULL';
      }
    });

    const queryString = `
    INSERT INTO app_user (
      ${columns.join(', ')},
      "createdAt",
      "updatedAt"
    ) VALUES (
      ${values.join(', ')},
      NOW(),
      NOW()
    )
    RETURNING *;
  `;

    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows[0] as UserProfileSchema;
    delete (response as any).hashedPassword;

    return response;
  }

  static async updateUserInfo(
    dbClient: dbClientPool,
    {
      userId,
      updateData,
    }: {
      userId: number;
      updateData: Partial<UserDataSchema>;
    }
  ): Promise<UserProfileSchema> {
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

    const updateFields = Object.keys(updateData).filter(
      key =>
        (updateData as any)[key] !== undefined &&
        (updateData as any)[key] !== null &&
        acceptedKeys.includes(key)
    );

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const setQueryString = updateFields
      .map(key => {
        const value = (updateData as any)[key];
        const column = User.getColumnName(key);
        if (typeof value === 'string') {
          return `${column} = '${value}'`;
        } else if (typeof value === 'number') {
          return `${column} = ${value}`;
        } else {
          return `${column} = NULL`;
        }
      })
      .join(', ');

    const queryString = `
      UPDATE app_user
      SET ${setQueryString}, "updatedAt" = NOW()
      WHERE id = ${userId} RETURNING *;`;
    const results = await dbClient.mainPool.query(queryString);

    delete (results.rows[0] as any).password;
    return results.rows[0] as UserProfileSchema;
  }

  static async updateUserPassword(
    dbClient: dbClientPool,
    {
      userId,
      hashedPassword,
    }: {
      userId: number;
      hashedPassword: string;
    }
  ): Promise<UserProfileSchema> {
    const queryString = `
      UPDATE app_user
      SET "hashedPassword" = '${hashedPassword}', "updatedAt" = NOW()
      WHERE id = ${userId} RETURNING *;`;
    const results = await dbClient.mainPool.query(queryString);

    delete (results.rows[0] as any).password;
    return results.rows[0] as UserProfileSchema;
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
  ): Promise<UserProfileSchema | undefined> {
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
        ${includePassword ? 'up."hashedPassword",' : ''}
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
              'lookupTypeId', l."lookupTypeId"
            )
          ) FILTER (WHERE l.id IS NOT NULL), 
          '[]'::json
        ) as "userRoles"
      FROM 
        app_user up
      LEFT JOIN lookup ls ON up."statusId" = ls.id
      LEFT JOIN user_role_xref urx ON up.id = urx."userId"
      LEFT JOIN lookup l ON urx."roleId" = l.id
      WHERE ${whereClause}
      GROUP BY up.id, ls.name, ls.label;`;

    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows[0] as UserProfileSchema | undefined;

    return response;
  }

  static async getUsers(dbClient: dbClientPool): Promise<UserProfileSchema[]> {
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
          up."profilePicture",
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

    return results.rows as UserProfileSchema[];
  }
}
