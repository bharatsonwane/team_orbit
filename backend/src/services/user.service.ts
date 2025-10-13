import { dbClientPool } from "../middleware/dbClientMiddleware";
import {
  BaseUserSchema,
  UserWithTrackingSchema,
  UserDataWithHashPasswordSchema,
  CreateUserSchema,
} from "../schemas/user.schema";
import { buildUpdateFields } from "../utils/queryHelper";
import { getHashPassword } from "../utils/authHelper";
import { dbTransactionKeys } from "../utils/constants";

export default class User {
  static async createUser(
    dbClient: dbClientPool,
    userData: CreateUserSchema
  ): Promise<number> {
    const client = dbClient;
    const dbClientPool: dbClientPool = { mainPool: client.mainPool };

    try {
      // Start transaction
      await client.mainPool.query(dbTransactionKeys.BEGIN);

      // Hash the password
      const hashPassword = await getHashPassword(userData.password);

      // Create the user profile
      const createUserQuery = `
        INSERT INTO users (
          title,
          "firstName",
          "lastName",
          "middleName",
          "maidenName",
          gender,
          dob,
          "bloodGroup",
          "marriedStatus",
          bio,
          "statusId",
          "tenantId",
          "createdAt",
          "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING id, title, "firstName", "lastName", "middleName", "maidenName", gender, dob, "bloodGroup", "marriedStatus", bio, "statusId", "tenantId", "createdAt", "updatedAt", "isArchived", "archivedAt"
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
        userData.bio || null,
        userData.statusId,
        userData.tenantId,
      ]);

      const user = userResult.rows[0];

      // Insert authentication data
      const authInsertQuery = `
        INSERT INTO user_auths (
          "userId",
          email,
          phone,
          "hashPassword",
          "passwordUpdatedAt",
          "createdAt",
          "updatedAt"
        ) VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
        RETURNING email, phone;
      `;

      const authResult = await dbClientPool.mainPool.query(authInsertQuery, [
        user.id,
        userData.email,
        userData.phone,
        hashPassword,
      ]);

      const auth = authResult.rows[0];

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

      return user.id;
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
      UPDATE users
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
      UPDATE user_auths
      SET "hashPassword" = '${hashPassword}', "passwordUpdatedAt" = NOW(), "updatedAt" = NOW()
      WHERE "userId" = ${userId} RETURNING "userId";`;
    await dbClient.mainPool.query(queryString);

    // Fetch and return the updated user data
    const userResult = await dbClient.mainPool.query(`
      SELECT u.*, ua.email, ua.phone
      FROM users u
      INNER JOIN user_auths ua ON u.id = ua."userId"
      WHERE u.id = ${userId}
    `);

    return userResult.rows[0];
  }

  static async updateUserStatusAndRoles(
    dbClient: dbClientPool,
    {
      userId,
      statusId,
      roleIds,
    }: {
      userId: number;
      statusId: number;
      roleIds: number[];
    }
  ): Promise<UserWithTrackingSchema> {
    try {
      // Start transaction
      await dbClient.mainPool.query(dbTransactionKeys.BEGIN);

      // Update user status
      await dbClient.mainPool.query(
        `UPDATE users SET "statusId" = $1, "updatedAt" = NOW() WHERE id = $2`,
        [statusId, userId]
      );

      // Delete existing roles
      await dbClient.mainPool.query(
        `DELETE FROM user_role_xref WHERE "userId" = $1`,
        [userId]
      );

      // Insert new roles
      if (roleIds && roleIds.length > 0) {
        const roleValues = roleIds
          .map(roleId => `(${userId}, ${roleId})`)
          .join(", ");
        await dbClient.mainPool.query(
          `INSERT INTO user_role_xref ("userId", "roleId", "createdAt", "updatedAt") VALUES ${roleValues}`
        );
      }

      // Commit transaction
      await dbClient.mainPool.query(dbTransactionKeys.COMMIT);

      // Fetch and return the updated user data
      const userResult = await dbClient.mainPool.query(`
        SELECT u.*, ua.email, ua.phone
        FROM users u
        INNER JOIN user_auths ua ON u.id = ua."userId"
        WHERE u.id = ${userId}
      `);

      return userResult.rows[0];
    } catch (error) {
      // Rollback transaction on error
      await dbClient.mainPool.query(dbTransactionKeys.ROLLBACK);
      throw error;
    }
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
      whereConditions.push(`ua.email = '${email}'`);
    }
    if (phone) {
      whereConditions.push(`ua.phone = '${phone}'`);
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
        up."isArchived",
        ua.email,
        ua.phone,
        ${includePassword ? 'ua."hashPassword",' : ""}
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
        users up
      INNER JOIN user_auths ua ON up.id = ua."userId"
      LEFT JOIN lookups ls ON up."statusId" = ls.id
      LEFT JOIN user_role_xref urx ON up.id = urx."userId"
      LEFT JOIN lookups l ON urx."roleId" = l.id
      WHERE ${whereClause}
      GROUP BY up.id, ua.email, ua.phone, ${includePassword ? 'ua."hashPassword",' : ""} ls.name, ls.label;`;

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
        INNER JOIN lookups lr ON urx."roleId" = lr.id
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
          ua.email,
          ua.phone,
          up.bio,
          up."statusId",
          ls.name as "statusName",
          ls.label as "statusLabel",
          up."tenantId",
          up."createdAt",
          up."updatedAt"
      FROM 
        users up
      INNER JOIN user_auths ua ON up.id = ua."userId"
      LEFT JOIN lookups ls ON up."statusId" = ls.id
      ${roleJoin}
      ${whereClause}
      ORDER BY up."createdAt" DESC;`;

    const results = await dbClient.mainPool.query(queryString);

    return results.rows;
  }
}
