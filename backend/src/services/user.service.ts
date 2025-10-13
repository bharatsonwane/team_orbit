import { dbClientPool } from "../middleware/dbClientMiddleware";
import {
  UserSignupServiceSchema,
  BaseUserSchema,
  UserWithTrackingSchema,
  UserDataWithHashPasswordSchema,
  CreateUserSchema,
} from "../schemas/user.schema";
import { buildUpdateFields } from "../utils/queryHelper";
import { getHashPassword } from "../utils/authHelper";
import { dbTransactionKeys } from "../utils/constants";

export default class User {
  static async signupUser(
    dbClient: dbClientPool,
    userData: UserSignupServiceSchema
  ): Promise<UserWithTrackingSchema> {
    const userSignupQuery = `
        INSERT INTO user (
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
                ${userData.tenantId || "NULL"},
                ${userData.title ? `'${userData.title}'` : "NULL"},
                ${userData.middleName ? `'${userData.middleName}'` : "NULL"},
                ${userData.maidenName ? `'${userData.maidenName}'` : "NULL"},
                ${userData.gender ? `'${userData.gender}'` : "NULL"},
                ${userData.dob ? `'${userData.dob}'` : "NULL"},
                ${userData.bloodGroup ? `'${userData.bloodGroup}'` : "NULL"},
                ${userData.marriedStatus ? `'${userData.marriedStatus}'` : "NULL"},
                ${userData.bio ? `'${userData.bio}'` : "NULL"},
                NOW(),
                NOW()
        )
        RETURNING *;`;
    const results = await dbClient.mainPool.query(userSignupQuery);
    const response = results.rows[0];
    return response;
  }

  static async createUser(
    dbClient: dbClientPool,
    userData: CreateUserSchema
  ): Promise<UserWithTrackingSchema> {
    const client = dbClient;
    const dbClientPool: dbClientPool = { mainPool: client.mainPool };

    try {
      // Start transaction
      await client.mainPool.query(dbTransactionKeys.BEGIN);

      // Hash the password
      const hashPassword = await getHashPassword(userData.password);

      // Create the user
      const createUserQuery = `
        INSERT INTO user (
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
          "tenantId",
          "createdAt",
          "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
        RETURNING id, title, "firstName", "lastName", "middleName", "maidenName", gender, dob, "bloodGroup", "marriedStatus", email, phone, bio, "statusId", "tenantId", "createdAt", "updatedAt", "isArchived", "archivedAt"
      `;

      const userResult = await dbClientPool.mainPool.query(createUserQuery, [
        userData.title || null,
        userData.firstName,
        userData.lastName,
        userData.middleName || null,
        userData.maidenName || null,
        userData.gender || null,
        userData.dob || null,
        userData.bloodGroup || null,
        userData.marriedStatus || null,
        userData.email,
        userData.phone,
        hashPassword,
        userData.bio || null,
        userData.statusId,
        userData.tenantId,
      ]);

      const user = userResult.rows[0];

      // Assign roles to the user
      if (userData.roleIds && userData.roleIds.length > 0) {
        const roleInsertValues = userData.roleIds
          .map(roleId => `(${user.id}, ${roleId})`)
          .join(", ");

        const assignRolesQuery = `
          INSERT INTO user_role_xref ("userId", "roleId")
          VALUES ${roleInsertValues}
        `;

        await dbClientPool.mainPool.query(assignRolesQuery);
      }

      // Commit transaction
      await client.mainPool.query(dbTransactionKeys.COMMIT);

      return {
        id: user.id,
        title: user.title,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        maidenName: user.maidenName,
        gender: user.gender,
        dob: user.dob,
        bloodGroup: user.bloodGroup,
        marriedStatus: user.marriedStatus,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        statusId: user.statusId,
        tenantId: user.tenantId,
        isArchived: user.isArchived,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        archivedAt: user.archivedAt,
      };
    } catch (error) {
      // Rollback transaction on error
      await client.mainPool.query(dbTransactionKeys.ROLLBACK);
      throw error;
    }
  }

  static async updateUser(
    dbClient: dbClientPool,
    {
      userId,
      updateData,
    }: {
      userId: number;
      updateData: Partial<UserWithTrackingSchema>;
    }
  ): Promise<UserWithTrackingSchema> {
    const acceptedKeys = [
      "title",
      "firstName",
      "lastName",
      "middleName",
      "maidenName",
      "gender",
      "dob",
      "bloodGroup",
      "marriedStatus",
      "bio",
    ];

    const updateFields = buildUpdateFields(acceptedKeys, updateData);

    if (Object.keys(updateFields).length === 0) {
      throw new Error("No valid fields to update");
    }

    const setQueryString = Object.entries(updateFields)
      .map(([key, value]) => `"${key}" = ${value}`)
      .join(", ");

    const queryString = `
      UPDATE user
      SET ${setQueryString}, "updatedAt" = NOW()
      WHERE id = ${userId} RETURNING *;`;
    const results = await dbClient.mainPool.query(queryString);

    delete (results.rows[0] as any).hashPassword;
    return results.rows[0];
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
  ): Promise<UserWithTrackingSchema> {
    const queryString = `
      UPDATE user
      SET "hashPassword" = '${hashPassword}', "updatedAt" = NOW()
      WHERE id = ${userId} RETURNING *;`;
    const results = await dbClient.mainPool.query(queryString);

    delete (results.rows[0] as any).hashPassword;
    return results.rows[0];
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
  ): Promise<UserDataWithHashPasswordSchema | undefined> {
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
        "At least one search criteria must be provided (userId, email, or phone)"
      );
    }

    // Use OR for email/phone combination, AND for userId with others
    const whereClause = userId
      ? whereConditions.join(" AND ")
      : whereConditions.join(" OR ");

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
        ${includePassword ? 'up."hashPassword",' : ""}
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
        user up
      LEFT JOIN lookup ls ON up."statusId" = ls.id
      LEFT JOIN user_role_xref urx ON up.id = urx."userId"
      LEFT JOIN lookup l ON urx."roleId" = l.id
      WHERE ${whereClause}
      GROUP BY up.id, ls.name, ls.label;`;

    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows[0];

    return response;
  }

  static async getUsers(
    dbClient: dbClientPool,
    filters?: {
      userType?: string;
      roleCategory?: string;
      tenantId?: number;
      statusId?: number;
    }
  ): Promise<UserWithTrackingSchema[]> {
    // Build WHERE conditions
    const conditions: string[] = [];

    if (filters?.tenantId) {
      conditions.push(`up."tenantId" = ${filters.tenantId}`);
    }

    if (filters?.statusId) {
      conditions.push(`up."statusId" = ${filters.statusId}`);
    }

    // If roleCategory is specified, filter users by role category
    let roleJoin = "";
    if (filters?.roleCategory) {
      roleJoin = `
        INNER JOIN user_role_xref urx ON up.id = urx."userId"
        INNER JOIN lookup lr ON urx."roleId" = lr.id
      `;
      conditions.push(`lr.name LIKE '${filters.roleCategory}_%'`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const queryString = `
        SELECT DISTINCT
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
        user up
      LEFT JOIN lookup ls ON up."statusId" = ls.id
      ${roleJoin}
      ${whereClause}
      ORDER BY up."createdAt" DESC;`;

    const results = await dbClient.mainPool.query(queryString);

    return results.rows;
  }
}
