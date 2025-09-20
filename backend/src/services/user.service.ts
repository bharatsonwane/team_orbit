import { dbClientPool } from '../middleware/dbClientMiddleware';

interface UserData {
  id?: number | null;
  title?: string | null;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  maidenName?: string | null;
  gender?: string | null;
  dob: string;
  bloodGroup?: string | null;
  marriedStatus?: string | null;
  email: string;
  phone: string;
  password?: string;
  hashPassword?: string;
  profilePicture?: string | null;
  bio?: string | null;
  userStatus?: string | null;
  tenantId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

interface UserProfile {
  id: number;
  title: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  maidenName: string | null;
  gender: string | null;
  dob: string;
  bloodGroup: string | null;
  marriedStatus: string | null;
  email: string;
  phone: string;
  password?: string;
  profilePicture: string | null;
  bio: string | null;
  userStatus: string | null;
  tenantId: number | null;
  createdAt: string;
  updatedAt: string;
  userRoles?: Array<{
    id: number;
    label: string;
    lookupTypeId: number;
  }>;
}

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
      userStatus: '"userStatus"',
      tenantId: '"tenantId"',
      createdAt: '"createdAt"',
      updatedAt: '"updatedAt"',
    };
    return columnMapping[key] || key;
  }

  static async signupUser(
    dbClient: dbClientPool,
    {
      userData,
    }: {
      userData: {
        email: string;
        hashPassword: string;
        phone: string;
        firstName: string;
        lastName: string;
        userStatus?: string;
        tenantId?: number;
      };
    }
  ): Promise<UserProfile> {
    /* insert user */
    const userSignupQuery = `
        INSERT INTO app_user (
                email,
                password,
                phone,
                "firstName",
                "lastName",
                "userStatus",
                "tenantId",
                "createdAt",
                "updatedAt"
            ) VALUES (
                '${userData.email}',
                '${userData.hashPassword}',
                '${userData.phone}',
                '${userData.firstName}',
                '${userData.lastName}',
                '${userData.userStatus || 'active'}',
                ${userData.tenantId || 'NULL'},
                NOW(),
                NOW()
        )
        RETURNING *;`;
    const results = await dbClient.mainPool.query(userSignupQuery);
    const response = results.rows[0] as UserProfile;
    return response;
  }

  static async createUserInfo(
    dbClient: dbClientPool,
    { userData }: { userData: Partial<UserData> }
  ): Promise<UserProfile> {
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
      'hashPassword',
      'profilePicture',
      'bio',
      'userStatus',
      'tenantId',
    ];

    const keysToInsert = acceptedKeys.filter(
      key =>
        (userData as any)[key] !== undefined && (userData as any)[key] !== null
    );

    const columns = keysToInsert.map(key => User.getColumnName(key));
    const values = keysToInsert.map(key => `'${(userData as any)[key]}'`);

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
    const response = results.rows[0] as UserProfile;
    delete (response as any).password;

    return response;
  }

  static async updateUserInfo(
    dbClient: dbClientPool,
    {
      userId,
      updateData,
    }: {
      userId: number;
      updateData: Partial<UserData>;
    }
  ): Promise<UserProfile> {
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

    const setQueryString = Object.keys(updateData)
      .filter(
        key =>
          (updateData as any)[key] !== undefined &&
          (updateData as any)[key] !== null &&
          acceptedKeys.includes(key)
      )
      .map(key => `${User.getColumnName(key)} = '${(updateData as any)[key]}'`)
      .join(', ');

    if (!setQueryString) {
      throw new Error('No valid fields to update');
    }

    const queryString = `
      UPDATE app_user
      SET ${setQueryString}, "updatedAt" = NOW()
      WHERE id = ${userId} RETURNING *;`;
    const results = await dbClient.mainPool.query(queryString);

    delete (results.rows[0] as any).password;
    return results.rows[0] as UserProfile;
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
  ): Promise<UserProfile> {
    const queryString = `
      UPDATE app_user
      SET password = '${hashPassword}', "updatedAt" = NOW()
      WHERE id = ${userId} RETURNING *;`;
    const results = await dbClient.mainPool.query(queryString);

    delete (results.rows[0] as any).password;
    return results.rows[0] as UserProfile;
  }

  static async getUserByEmailOrPhone(
    dbClient: dbClientPool,
    {
      email,
      phone,
      includePassword = false,
    }: {
      email?: string;
      phone?: string;
      includePassword?: boolean;
    }
  ): Promise<UserProfile | undefined> {
    const whereConditions = [];
    if (email) whereConditions.push(`email = '${email}'`);
    if (phone) whereConditions.push(`phone = '${phone}'`);

    if (whereConditions.length === 0) {
      throw new Error('Either email or phone must be provided');
    }

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
        ${includePassword ? 'up.password,' : ''}
        up.bio,
        up."userStatus",
        up."tenantId",
        up."createdAt",
        up."updatedAt",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', l.id,
              'label', l.label,
              'lookupTypeId', l."lookupTypeId"
            )
          ) FILTER (WHERE l.id IS NOT NULL), 
          '[]'::json
        ) as "userRoles"
      FROM 
        app_user up
      LEFT JOIN user_role_xref urx ON up.id = urx."userId"
      LEFT JOIN lookup l ON urx."roleId" = l.id
      WHERE ${whereConditions.join(' OR ')}
      GROUP BY up.id, up.title, up."firstName", up."lastName", up."middleName", 
               up."maidenName", up.gender, up.dob, up."bloodGroup", up."marriedStatus",
               up.email, up.phone, up.password, up.bio, up."userStatus", up."tenantId",
               up."createdAt", up."updatedAt";`;

    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows[0] as UserProfile | undefined;

    return response;
  }

  static async getUserById(
    dbClient: dbClientPool,
    { userId }: { userId: number }
  ): Promise<UserProfile | undefined> {
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
        up."userStatus",
        up."tenantId",
        up."createdAt",
        up."updatedAt",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', l.id,
              'label', l.label,
              'lookupTypeId', l."lookupTypeId"
            )
          ) FILTER (WHERE l.id IS NOT NULL), 
          '[]'::json
        ) as "userRoles"
      FROM 
        app_user up
      LEFT JOIN user_role_xref urx ON up.id = urx."userId"
      LEFT JOIN lookup l ON urx."roleId" = l.id
      WHERE up.id = ${userId}
      GROUP BY up.id, up.title, up."firstName", up."lastName", up."middleName", 
               up."maidenName", up.gender, up.dob, up."bloodGroup", up."marriedStatus",
               up.email, up.phone, up.bio, up."userStatus", up."tenantId",
               up."createdAt", up."updatedAt";`;

    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows[0] as UserProfile | undefined;

    return response;
  }

  static async getUsers(dbClient: dbClientPool): Promise<UserProfile[]> {
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
          up."userStatus",
          up."tenantId",
          up."createdAt",
          up."updatedAt"
      FROM 
        app_user up;`;

    const results = await dbClient.mainPool.query(queryString);

    return results.rows as UserProfile[];
  }
}
