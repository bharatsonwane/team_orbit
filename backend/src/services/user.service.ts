import { dbClientPool } from "../middleware/dbClientMiddleware";
import {
  BaseUserSchema,
  UserWithTrackingSchema,
  UserDataWithHashPasswordSchema,
  CreateUserSchema,
  SaveUserContactsSchema,
  SaveUserJobDetailsSchema,
} from "../schemas/user.schema";
import { buildUpdateFields } from "../utils/queryHelper";
import { getHashPassword } from "../utils/authHelper";
import { dbTransactionKeys } from "../utils/constants";
import db, { schemaNames } from "../database/db";

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

      // Get default PENDING status if not provided
      let statusId = 0;
      const statusResult = await dbClientPool.mainPool.query(
        `SELECT l.id FROM lookups l 
         INNER JOIN lookup_types lt ON l."lookupTypeId" = lt.id 
         WHERE lt.name = 'USER_STATUS' AND l.name = 'PENDING'`
      );

      if (statusResult.rows.length > 0) {
        statusId = statusResult.rows[0].id;
      } else {
        throw new Error("Default PENDING status not found");
      }

      // Determine if this is a platform user (tenantId is null or 1)
      const isPlatformUser = !userData.tenantId || userData.tenantId === 1;

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
          "isPlatformUser",
          "statusId",
          "tenantId",
          "createdAt",
          "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
        RETURNING id
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
        isPlatformUser,
        statusId,
        userData.tenantId,
      ]);

      const user = userResult.rows[0];

      // Insert authentication data only if authEmail is provided
      if (userData.authEmail) {
        const authInsertQuery = `
          INSERT INTO user_auths (
            "userId",
            "authEmail",
            "createdAt",
            "updatedAt"
          ) VALUES ($1, $2, NOW(), NOW())
          RETURNING "authEmail";
        `;

        await dbClientPool.mainPool.query(authInsertQuery, [
          user.id,
          userData.authEmail, // Using authEmail for authentication
        ]);
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
      SELECT u.*, ua."authEmail"
      FROM users u
      LEFT JOIN user_auths ua ON u.id = ua."userId"
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
        SELECT u.*, ua."authEmail"
        FROM users u
        LEFT JOIN user_auths ua ON u.id = ua."userId"
        WHERE u.id = ${userId}
      `);

      return userResult.rows[0];
    } catch (error) {
      // Rollback transaction on error
      await dbClient.mainPool.query(dbTransactionKeys.ROLLBACK);
      throw error;
    }
  }

  static async getUserByIdOrAuthEmail(
    dbClient: dbClientPool,
    {
      userId,
      authEmail,
      includePassword = false,
    }: {
      userId?: number;
      authEmail?: string;
      includePassword?: boolean;
    }
  ): Promise<UserDataWithHashPasswordSchema | undefined> {
    const whereConditions = [];

    // Build WHERE conditions based on provided parameters
    if (userId) {
      whereConditions.push(`up.id = ${userId}`);
    }
    if (authEmail) {
      whereConditions.push(`ua."authEmail" = '${authEmail}'`);
    }

    if (whereConditions.length === 0) {
      throw new Error(
        "At least one search criteria must be provided (userId or authEmail)"
      );
    }

    // Use OR for multiple conditions
    const whereClause = whereConditions.join(" OR ");

    const queryString = `
        SELECT 
        up.id,
        up.title,
        up."firstName",
        up."lastName",
        up."middleName",
        up."maidenName",
        up.gender,
        TO_CHAR(up.dob, 'YYYY-MM-DD') as dob,
        up."bloodGroup",
        up."marriedStatus",
        up."isArchived",
        ua."authEmail",
        ${includePassword ? 'ua."hashPassword",' : ""}
        up.bio,
        up."isPlatformUser",
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
      LEFT JOIN user_auths ua ON up.id = ua."userId"
      LEFT JOIN lookups ls ON up."statusId" = ls.id
      LEFT JOIN user_role_xref urx ON up.id = urx."userId"
      LEFT JOIN lookups l ON urx."roleId" = l.id
      WHERE ${whereClause}
      GROUP BY up.id, ua."authEmail", ${includePassword ? 'ua."hashPassword",' : ""} up."isPlatformUser", up."isArchived", ls.name, ls.label;
    `;

    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows[0];
    return response;
  }

  static async saveUserContacts(
    dbClient: dbClientPool,
    {
      userId,
      contactData,
    }: {
      userId: number;
      contactData: SaveUserContactsSchema;
    }
  ): Promise<void> {
    try {
      // Start transaction
      await dbClient.mainPool.query(dbTransactionKeys.BEGIN);

      // Get tenant ID for the user
      const userResult = await dbClient.mainPool.query(
        `SELECT "tenantId" FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error("User not found");
      }

      const tenantId = userResult.rows[0].tenantId;

      // Get contact type lookup IDs
      const contactTypes = await dbClient.mainPool.query(`
        SELECT l.id, l.name 
        FROM lookups l
        INNER JOIN lookup_types lt ON l."lookupTypeId" = lt.id
        WHERE lt.name = 'CONTACT_TYPE'
      `);

      const contactTypeMap: Record<string, number> = {};
      contactTypes.rows.forEach((row: { id: number; name: string }) => {
        contactTypeMap[row.name] = row.id;
      });

      // Update or create authEmail in user_auths if officeEmail is provided
      if (contactData.officeEmail) {
        // Check if auth record exists
        const authExists = await dbClient.mainPool.query(
          `SELECT id FROM user_auths WHERE "userId" = $1`,
          [userId]
        );

        if (authExists.rows.length > 0) {
          // Update existing auth email
          await dbClient.mainPool.query(
            `UPDATE user_auths SET "authEmail" = $1, "updatedAt" = NOW() WHERE "userId" = $2`,
            [contactData.officeEmail, userId]
          );
        } else {
          // Create new auth record with authEmail
          await dbClient.mainPool.query(
            `INSERT INTO user_auths ("userId", "authEmail", "createdAt", "updatedAt") 
             VALUES ($1, $2, NOW(), NOW())`,
            [userId, contactData.officeEmail]
          );
        }
      }

      // Get tenant pool for user_contacts table
      const tenantSchemaName = schemaNames.tenantSchemaName(
        tenantId.toString()
      );
      const tenantPool = await db.getSchemaPool(tenantSchemaName);

      // Prepare contacts array
      const contacts = [
        {
          type: "OFFICIAL_EMAIL",
          value: contactData.officeEmail,
        },
        {
          type: "PERSONAL_EMAIL",
          value: contactData.personalEmail,
        },
        {
          type: "OFFICIAL_PHONE",
          value: contactData.officialPhone,
        },
        {
          type: "PERSONAL_PHONE",
          value: contactData.personalPhone,
        },
        {
          type: "EMERGENCY_PHONE",
          value: contactData.emergencyContactPhone1,
        },
        {
          type: "EMERGENCY_PHONE",
          value: contactData.emergencyContactPhone2,
        },
      ];

      // Delete existing contacts for this user
      await tenantPool.query(`DELETE FROM user_contacts WHERE "userId" = $1`, [
        userId,
      ]);

      // Insert new contacts
      for (const contact of contacts) {
        if (contact.value && contact.value.trim() !== "") {
          const contactTypeId = contactTypeMap[contact.type];
          if (contactTypeId) {
            await tenantPool.query(
              `
              INSERT INTO user_contacts ("userId", "contactTypeId", value, "isPrimary", "isVerified")
              VALUES ($1, $2, $3, $4, $5)
            `,
              [userId, contactTypeId, contact.value, false, false]
            );
          }
        }
      }

      // Commit transaction
      await dbClient.mainPool.query(dbTransactionKeys.COMMIT);
    } catch (error) {
      // Rollback transaction on error
      await dbClient.mainPool.query(dbTransactionKeys.ROLLBACK);
      throw error;
    }
  }

  static async saveUserJobDetails(
    dbClient: dbClientPool,
    {
      userId,
      jobData,
    }: {
      userId: number;
      jobData: SaveUserJobDetailsSchema;
    }
  ): Promise<void> {
    try {
      // Start transaction
      await dbClient.mainPool.query(dbTransactionKeys.BEGIN);

      // Get tenant ID for the user
      const userResult = await dbClient.mainPool.query(
        `SELECT "tenantId" FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error("User not found");
      }

      const tenantId = userResult.rows[0].tenantId;

      // Get tenant pool for user_job_details table
      const tenantSchemaName = schemaNames.tenantSchemaName(
        tenantId.toString()
      );
      const tenantPool = await db.getSchemaPool(tenantSchemaName);

      // Check if job details already exist
      const existingJobDetails = await tenantPool.query(
        `SELECT id FROM user_job_details WHERE "userId" = $1`,
        [userId]
      );

      if (existingJobDetails.rows.length > 0) {
        // Update existing job details
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramIndex = 1;

        if (jobData.hiringDate !== undefined) {
          updateFields.push(`"hiringDate" = $${paramIndex++}`);
          updateValues.push(jobData.hiringDate || null);
        }
        if (jobData.joiningDate !== undefined) {
          updateFields.push(`"joiningDate" = $${paramIndex++}`);
          updateValues.push(jobData.joiningDate || null);
        }
        if (jobData.probationPeriodMonths !== undefined) {
          updateFields.push(`"probationPeriodMonths" = $${paramIndex++}`);
          updateValues.push(jobData.probationPeriodMonths || null);
        }
        if (jobData.designation !== undefined) {
          updateFields.push(`"designation" = $${paramIndex++}`);
          updateValues.push(jobData.designation || null);
        }
        if (jobData.department !== undefined) {
          updateFields.push(`"department" = $${paramIndex++}`);
          updateValues.push(jobData.department || null);
        }
        if (jobData.employeeId !== undefined) {
          updateFields.push(`"employeeId" = $${paramIndex++}`);
          updateValues.push(jobData.employeeId || null);
        }
        if (jobData.ctc !== undefined) {
          updateFields.push(`"ctc" = $${paramIndex++}`);
          updateValues.push(jobData.ctc || null);
        }
        if (jobData.reportingManagerId !== undefined) {
          updateFields.push(`"reportingManagerId" = $${paramIndex++}`);
          updateValues.push(jobData.reportingManagerId || null);
        }

        updateFields.push(`"updatedAt" = NOW()`);
        updateValues.push(userId);

        if (updateFields.length > 1) {
          await tenantPool.query(
            `
            UPDATE user_job_details 
            SET ${updateFields.join(", ")} 
            WHERE "userId" = $${paramIndex}
          `,
            updateValues
          );
        }
      } else {
        // Insert new job details
        await tenantPool.query(
          `
          INSERT INTO user_job_details (
            "userId",
            "hiringDate",
            "joiningDate",
            "probationPeriodMonths",
            "designation",
            "department",
            "employeeId",
            "ctc",
            "reportingManagerId"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
          [
            userId,
            jobData.hiringDate || null,
            jobData.joiningDate || null,
            jobData.probationPeriodMonths || null,
            jobData.designation || null,
            jobData.department || null,
            jobData.employeeId || null,
            jobData.ctc || null,
            jobData.reportingManagerId || null,
          ]
        );
      }

      // Commit transaction
      await dbClient.mainPool.query(dbTransactionKeys.COMMIT);
    } catch (error) {
      // Rollback transaction on error
      await dbClient.mainPool.query(dbTransactionKeys.ROLLBACK);
      throw error;
    } finally {
      // Release tenant pool if created
      // Note: Pool will be auto-released by connection pool manager
    }
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

    // If roleCategory is specified, add filter condition
    if (filters?.roleCategory) {
      conditions.push(
        `EXISTS (
          SELECT 1 FROM user_role_xref urx
          INNER JOIN lookups lr ON urx."roleId" = lr.id
          WHERE urx."userId" = up.id AND lr.name LIKE '${filters.roleCategory}_%'
        )`
      );
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const queryString = `
        SELECT
          up.id,
          up.title,
          up."firstName",
          up."lastName",
          up."middleName",
          up."maidenName",
          up.gender,
          TO_CHAR(up.dob, 'YYYY-MM-DD') as dob,
          up."bloodGroup",
          up."marriedStatus",
          ua."authEmail",
          up.bio,
          up."isPlatformUser",
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
      LEFT JOIN user_auths ua ON up.id = ua."userId"
      LEFT JOIN lookups ls ON up."statusId" = ls.id
      LEFT JOIN user_role_xref urx ON up.id = urx."userId"
      LEFT JOIN lookups l ON urx."roleId" = l.id
      ${whereClause}
      GROUP BY up.id, ua."authEmail", up."isPlatformUser", ls.name, ls.label
      ORDER BY up."createdAt" DESC;`;

    const results = await dbClient.mainPool.query(queryString);
    return results.rows;
  }
}
