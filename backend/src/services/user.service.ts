import { dbClientPool } from "@src/middleware/dbClientMiddleware";
import {
  BaseUserSchema,
  UserWithTrackingSchema,
  UserDataWithHashPasswordSchema,
  CreateUserSchema,
  SaveUserContactsSchema,
  SaveUserJobDetailsSchema,
} from "@src/schemas/user.schema";
import { buildUpdateFields } from "@src/utils/queryHelper";
import { getHashPassword } from "@src/utils/authHelper";
import { dbTransactionKeys } from "@src/utils/constants";
import db, { schemaNames } from "@src/database/db";

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

      // Determine if this is a platform user and set appropriate tenant
      let tenantId = userData.tenantId;
      let isPlatformUser = false;

      if (!tenantId || tenantId === 1) {
        // Platform users should be assigned to the platform tenant (ID 1)
        tenantId = 1;
        isPlatformUser = true;
      }

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
        tenantId,
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
  ): Promise<void> {
    const queryString = `
      UPDATE user_auths
      SET "hashPassword" = '${hashPassword}', "passwordUpdatedAt" = NOW(), "updatedAt" = NOW()
      WHERE "userId" = ${userId} RETURNING "userId";`;
    await dbClient.mainPool.query(queryString);
    return;
  }

  static async getUserAuthEmail(
    dbClient: dbClientPool,
    userId: number
  ): Promise<{ authEmail: string | null }> {
    try {
      const result = await dbClient.mainPool.query(
        `SELECT "authEmail" FROM user_auths WHERE "userId" = $1`,
        [userId]
      );

      return {
        authEmail: result.rows.length > 0 ? result.rows[0].authEmail : null,
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateUserAuthEmail(
    dbClient: dbClientPool,
    {
      userId,
      newAuthEmail,
    }: {
      userId: number;
      newAuthEmail: string;
    }
  ): Promise<void> {
    try {
      // Start transaction
      await dbClient.mainPool.query(dbTransactionKeys.BEGIN);

      // Check if the new email already exists for another user
      const existingUser = await dbClient.mainPool.query(
        `SELECT "userId" FROM user_auths WHERE "authEmail" = $1 AND "userId" != $2`,
        [newAuthEmail, userId]
      );

      if (existingUser.rows.length > 0) {
        throw new Error("Email already exists for another user");
      }

      // Check if user_auths record exists
      const userAuthExists = await dbClient.mainPool.query(
        `SELECT id FROM user_auths WHERE "userId" = $1`,
        [userId]
      );

      if (userAuthExists.rows.length > 0) {
        // Update existing auth email
        await dbClient.mainPool.query(
          `UPDATE user_auths SET "authEmail" = $1, "updatedAt" = NOW() WHERE "userId" = $2`,
          [newAuthEmail, userId]
        );
      } else {
        // Insert new auth record (for users who don't have login credentials yet)
        await dbClient.mainPool.query(
          `INSERT INTO user_auths ("userId", "authEmail", "createdAt", "updatedAt") 
           VALUES ($1, $2, NOW(), NOW())`,
          [userId, newAuthEmail]
        );
      }

      // Commit transaction
      await dbClient.mainPool.query(dbTransactionKeys.COMMIT);
    } catch (error) {
      // Rollback transaction on error
      await dbClient.mainPool.query(dbTransactionKeys.ROLLBACK);
      throw error;
    }
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
  ): Promise<void> {
    try {
      // Start transaction
      await dbClient.mainPool.query(dbTransactionKeys.BEGIN);

      // Update user status
      await dbClient.mainPool.query(
        `UPDATE users SET "statusId" = $1, "updatedAt" = NOW() WHERE id = $2`,
        [statusId, userId]
      );

      // Get existing roles for the user
      const existingRolesResult = await dbClient.mainPool.query(
        `SELECT "roleId" FROM user_role_xref WHERE "userId" = $1`,
        [userId]
      );
      const existingRoleIds = existingRolesResult.rows.map(
        (row: any) => row.roleId
      );

      // Determine roles to delete (exist in DB but not in roleIds)
      const rolesToDelete = existingRoleIds.filter(
        (roleId: number) => !roleIds.includes(roleId)
      );

      // Determine roles to add (in roleIds but not in DB)
      const rolesToAdd = roleIds.filter(
        (roleId: number) => !existingRoleIds.includes(roleId)
      );

      // Delete roles that are no longer needed
      if (rolesToDelete.length > 0) {
        await dbClient.mainPool.query(
          `DELETE FROM user_role_xref WHERE "userId" = $1 AND "roleId" = ANY($2)`,
          [userId, rolesToDelete]
        );
      }

      // Insert new roles
      if (rolesToAdd.length > 0) {
        const roleValues = rolesToAdd
          .map(roleId => `(${userId}, ${roleId}, NOW(), NOW())`)
          .join(", ");
        await dbClient.mainPool.query(
          `INSERT INTO user_role_xref ("userId", "roleId", "createdAt", "updatedAt") VALUES ${roleValues}`
        );
      }

      // Commit transaction
      await dbClient.mainPool.query(dbTransactionKeys.COMMIT);

      return;
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
        t.name as "tenantName",
        t.label as "tenantLabel",
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
      LEFT JOIN tenants t ON up."tenantId" = t.id
      LEFT JOIN user_role_xref urx ON up.id = urx."userId"
      LEFT JOIN lookups l ON urx."roleId" = l.id
      WHERE ${whereClause}
      GROUP BY up.id, ua."authEmail", ${includePassword ? 'ua."hashPassword",' : ""} up."isPlatformUser", up."isArchived", ls.name, ls.label, t.name, t.label;
    `;

    const results = await dbClient.mainPool.query(queryString);
    const response = results.rows[0];
    return response;
  }

  static async getUserContacts(
    dbClient: dbClientPool,
    userId: number
  ): Promise<any> {
    try {
      const contactsResult = await dbClient.tenantPool?.query(
        `
        SELECT 
          uc.id,
          uc.value,
          uc."isPrimary",
          uc."isVerified",
          tl.name as "contactType",
          tl.label as "contactTypeLabel"
        FROM user_contacts uc
        INNER JOIN tenant_lookups tl ON uc."contactTypeId" = tl.id
        WHERE uc."userId" = $1
        ORDER BY tl."sortOrder"
      `,
        [userId]
      );

      // Transform the data to match frontend expectations
      const contacts = {
        personalEmail: "",
        personalPhone: "",
        alternativePhone: "",
        emergencyPhone1: "",
        emergencyPhone2: "",
      };

      contactsResult?.rows.forEach((row: any) => {
        switch (row.contactType) {
          case "PERSONAL_EMAIL":
            contacts.personalEmail = row.value;
            break;
          case "PERSONAL_PHONE":
            contacts.personalPhone = row.value;
            break;
          case "ALTERNATIVE_PHONE":
            contacts.alternativePhone = row.value;
            break;
          case "EMERGENCY_PHONE1":
            contacts.emergencyPhone1 = row.value;
            break;
          case "EMERGENCY_PHONE2":
            contacts.emergencyPhone2 = row.value;
            break;
        }
      });

      return contacts;
    } catch (error) {
      throw error;
    }
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
      await dbClient.tenantPool?.query(dbTransactionKeys.BEGIN);

      // Get contact type lookup IDs from tenant lookups
      const contactTypes = await dbClient.tenantPool?.query(`
        SELECT tl.id, tl.name 
        FROM tenant_lookups tl
        INNER JOIN tenant_lookup_types tlt ON tl."lookupTypeId" = tlt.id
        WHERE tlt.name = 'CONTACT_TYPE'
      `);

      const contactTypeMap: Record<string, number> = {};
      contactTypes?.rows.forEach((row: { id: number; name: string }) => {
        contactTypeMap[row.name] = row.id;
      });

      // Prepare contacts array
      const contacts = [
        {
          type: "PERSONAL_EMAIL",
          value: contactData.personalEmail,
        },
        {
          type: "PERSONAL_PHONE",
          value: contactData.personalPhone,
        },
        {
          type: "ALTERNATIVE_PHONE",
          value: contactData.alternativePhone,
        },
        {
          type: "EMERGENCY_PHONE1",
          value: contactData.emergencyPhone1,
        },
        {
          type: "EMERGENCY_PHONE2",
          value: contactData.emergencyPhone2,
        },
      ];

      // Get existing contacts for this user
      const existingContacts = await dbClient.tenantPool?.query(
        `
        SELECT id, "contactTypeId", value, "isPrimary", "isVerified"
        FROM user_contacts 
        WHERE "userId" = $1
      `,
        [userId]
      );

      // Create a map of existing contacts by contactTypeId
      const existingContactsMap = new Map();
      existingContacts?.rows.forEach((row: any) => {
        existingContactsMap.set(row.contactTypeId, row);
      });

      // Process all contacts in a single loop
      for (const contact of contacts) {
        const contactTypeId = contactTypeMap[contact.type];
        if (!contactTypeId) continue;

        const existingContact = existingContactsMap.get(contactTypeId);
        const hasValue = contact.value && contact.value.trim() !== "";

        if (hasValue) {
          if (existingContact) {
            // Update existing contact if value has changed
            if (existingContact.value !== contact.value) {
              await dbClient.tenantPool?.query(
                `
                UPDATE user_contacts 
                SET value = $1, "updatedAt" = NOW()
                WHERE id = $2
              `,
                [contact.value, existingContact.id]
              );
            }
          } else {
            // Insert new contact
            await dbClient.tenantPool?.query(
              `
              INSERT INTO user_contacts ("userId", "contactTypeId", value, "isPrimary", "isVerified", "createdAt", "updatedAt")
              VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            `,
              [userId, contactTypeId, contact.value, false, false]
            );
          }
        } else {
          // Delete contact if it exists but now has no value
          if (existingContact) {
            await dbClient.tenantPool?.query(
              `
              DELETE FROM user_contacts 
              WHERE "userId" = $1 AND "contactTypeId" = $2
            `,
              [userId, contactTypeId]
            );
          }
        }
      }

      // Commit transaction
      await dbClient.tenantPool?.query(dbTransactionKeys.COMMIT);
    } catch (error) {
      // Rollback transaction on error
      await dbClient.tenantPool?.query(dbTransactionKeys.ROLLBACK);
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
      // Validate required userId
      if (!userId) {
        throw new Error("User ID is required to save job details");
      }

      // Start transaction
      await dbClient.tenantPool?.query(dbTransactionKeys.BEGIN);

      // Check if job details already exist
      const existingJobDetails = await dbClient.tenantPool?.query(
        `SELECT id FROM user_job_details WHERE "userId" = $1`,
        [userId]
      );

      if (existingJobDetails?.rows && existingJobDetails.rows.length > 0) {
        // Update existing job details
        const acceptedKeys = [
          "hiringDate",
          "joiningDate",
          "probationPeriodMonths",
          "designation",
          "department",
          "ctc",
        ];

        const updateFields = buildUpdateFields(acceptedKeys, jobData);

        if (Object.keys(updateFields).length > 0) {
          updateFields["updatedAt"] = "NOW()";

          const setClause = Object.entries(updateFields)
            .map(([key, value]) => `"${key}" = ${value}`)
            .join(", ");

          await dbClient.tenantPool?.query(
            `UPDATE user_job_details SET ${setClause} WHERE "userId" = $1`,
            [userId]
          );
        }
      } else {
        // Insert new job details
        await dbClient.tenantPool?.query(
          `
          INSERT INTO user_job_details (
            "userId",
            "hiringDate",
            "joiningDate",
            "probationPeriodMonths",
            "designation",
            "department",
            "ctc"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [
            userId,
            jobData.hiringDate || null,
            jobData.joiningDate || null,
            jobData.probationPeriodMonths || null,
            jobData.designation || null,
            jobData.department || null,
            jobData.ctc || null,
          ]
        );
      }

      // Commit transaction
      await dbClient.tenantPool?.query(dbTransactionKeys.COMMIT);
    } catch (error) {
      // Rollback transaction on error
      await dbClient.tenantPool?.query(dbTransactionKeys.ROLLBACK);
      throw error;
    }
  }

  static async getUserJobDetails(
    dbClient: dbClientPool,
    userId: number
  ): Promise<SaveUserJobDetailsSchema | null> {
    try {
      const queryString = `
        SELECT 
          "hiringDate",
          "joiningDate",
          "probationPeriodMonths",
          "designation",
          "department",
          "ctc"
        FROM user_job_details 
        WHERE "userId" = $1
      `;

      const result = await dbClient.tenantPool?.query(queryString, [userId]);
      return result?.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async getUsers(
    dbClient: dbClientPool,
    filters?: {
      userType?: string;
      roleCategory?: string;
      tenantId?: number;
      statusId?: number;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    data: UserWithTrackingSchema[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (filters?.tenantId) {
      conditions.push(`up."tenantId" = $${index++}`);
      values.push(filters.tenantId);
    }

    if (filters?.statusId) {
      conditions.push(`up."statusId" = $${index++}`);
      values.push(filters.statusId);
    }

    if (filters?.roleCategory) {
      conditions.push(
        `EXISTS (
          SELECT 1 FROM user_role_xref urx
          INNER JOIN lookups lr ON urx."roleId" = lr.id
          WHERE urx."userId" = up.id AND lr.name LIKE $${index++}
        )`
      );
      values.push(`${filters.roleCategory}_%`);
    }

    // 🔍 Search by first name, last name, or email
    if (filters?.search) {
      conditions.push(`(
        up."firstName" ILIKE $${index} OR
        up."lastName" ILIKE $${index} OR
        ua."authEmail" ILIKE $${index}
      )`);
      values.push(`%${filters.search}%`);
      index++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // 🧮 Total count query
    const countQuery = `
      SELECT COUNT(DISTINCT up.id) AS total
      FROM users up
      LEFT JOIN user_auths ua ON up.id = ua."userId"
      LEFT JOIN user_role_xref urx ON up.id = urx."userId"
      LEFT JOIN lookups l ON urx."roleId" = l.id
      ${whereClause};
    `;
    const countResult = await dbClient.mainPool.query(countQuery, values);
    const total = parseInt(countResult.rows[0]?.total || "0", 10);

    // 📄 Main data query with pagination
    let queryString = `
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
      ORDER BY up."createdAt" DESC
    `;

    if (filters?.limit) {
      values.push(filters.limit);
      queryString += ` LIMIT $${values.length}`;
    }
    if (filters?.offset) {
      values.push(filters.offset);
      queryString += ` OFFSET $${values.length}`;
    }

    const results = await dbClient.mainPool.query(queryString, values);

    const page =
      filters?.offset && filters?.limit
        ? Math.floor(filters.offset / filters.limit) + 1
        : 1;
    const totalPages = filters?.limit ? Math.ceil(total / filters.limit) : 1;

    return {
      data: results.rows,
      pagination: {
        total,
        page,
        limit: filters?.limit || total,
        totalPages,
      },
    };
  }
}
