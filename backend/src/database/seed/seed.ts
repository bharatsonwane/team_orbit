import { PoolClient } from "pg";
import { z } from "zod";
import db, { schemaNames } from "../db";
import logger from "../../utils/logger";
import {
  BaseLookupSchema,
  LookupWithTrackingSchema,
} from "../../schemaTypes/lookup.schemaTypes";
import { UserSignupSchema } from "../../schemaTypes/user.schemaTypes";
import {
  lookupTypeKeys,
  userRoleKeys,
  userStatusKeys,
  tenantStatusKeys,
} from "../../utils/constants";
import { getHashPassword } from "../../utils/authHelper";
import Lookup from "../../services/lookup.service";

/** Get lookup data by lookup name */
const getLookupDataByLookupTypeNameAndLookupName = async ({
  client,
  lookupTypeName,
  lookupName,
}: {
  client: PoolClient;
  lookupTypeName: string;
  lookupName: string;
}): Promise<LookupWithTrackingSchema> => {
  /** Get lookup data query */
  const getLookupDataQuery = `
        SELECT l.id, l.name, l.label, l."lookupTypeId", lt.name as typeName
        FROM lookup_types lt
        INNER JOIN lookups l ON lt.id = l."lookupTypeId"
        WHERE l.name = $1 AND lt.name = $2;
      `;

  /** Get lookup data result */
  const lookupDataResult = (
    await client.query(getLookupDataQuery, [lookupName, lookupTypeName])
  ).rows;

  /** If lookup data result is empty, throw an error */
  if (lookupDataResult.length === 0) {
    throw new Error(`Lookup data not found for name: ${lookupName}`);
  }

  /** Return lookup data result */
  return lookupDataResult[0];
};

async function main(): Promise<void> {
  try {
    logger.info("seed main function called");

    const pool = await db.getSchemaPool(schemaNames.main);

    // Get tenant status lookup data
    const activeTenantStatusData =
      await getLookupDataByLookupTypeNameAndLookupName({
        client: pool,
        lookupTypeName: lookupTypeKeys.TENANT_STATUS,
        lookupName: tenantStatusKeys.ACTIVE,
      });

    /** create tenant data */
    const tenantData = {
      name: "iConnect",
      label: "iConnect",
      description:
        "We are a company that provides a software solutions for businesses",
    };
    const tenantResult = await pool.query(
      `INSERT INTO tenants (name, label, "statusId") 
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET
         label = EXCLUDED.label,
         "statusId" = EXCLUDED."statusId",
         "updatedAt" = NOW()
       RETURNING id, name, label`,
      [tenantData.name, tenantData.label, activeTenantStatusData.id]
    );
    const tenantId = tenantResult.rows[0].id;

    // Get tenant admin role data
    const tenantAdminRoleData =
      await getLookupDataByLookupTypeNameAndLookupName({
        client: pool,
        lookupTypeName: lookupTypeKeys.USER_ROLE,
        lookupName: userRoleKeys.TENANT_ADMIN,
      });

    const activeUserStatusData =
      await getLookupDataByLookupTypeNameAndLookupName({
        client: pool,
        lookupTypeName: lookupTypeKeys.USER_STATUS,
        lookupName: userStatusKeys.ACTIVE,
      });

    const userDataList: Array<
      UserSignupSchema & {
        statusId: number;
        tenantId: number;
        roleIds: number[];
      }
    > = [
      {
        title: "Mr",
        firstName: "iConnect",
        lastName: "Admin",
        middleName: "",
        maidenName: "",
        gender: "Male",
        dob: "1990-01-01",
        bloodGroup: "A+",
        marriedStatus: "Single",
        authEmail: "iconnect@gmail.com",
        phone: "9876543210",
        password: "Admin@123",
        bio: "iConnect Tenant Admin",
        statusId: activeUserStatusData.id,
        tenantId: tenantId,
        roleIds: [tenantAdminRoleData.id],
      },
    ];

    for (const userData of userDataList) {
      /** Hash the password */
      const hashPassword = await getHashPassword(userData.password);

      /** Check if user already exists */
      const checkUserAuthQuery = `
          SELECT id, "authEmail" FROM user_auths WHERE "authEmail" = $1;
        `;
      const existingUserAuth = (
        await pool.query(checkUserAuthQuery, [userData.authEmail])
      ).rows;

      /** If user already exists, continue */
      if (existingUserAuth.length > 0) {
        console.log(`User already exists (authEmail): ${userData.authEmail}`);
        continue;
      }

      /** Insert new user */
      const upsertUserQuery = `
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
          "tenantId",
          "statusId",
          "createdAt",
          "updatedAt"
            )
          VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
          )
          RETURNING id, "firstName", "lastName";
        `;

      const userResult = (
        await pool.query(upsertUserQuery, [
          userData.title,
          userData.firstName,
          userData.lastName,
          userData.middleName,
          userData.maidenName,
          userData.gender,
          userData.dob,
          userData.bloodGroup,
          userData.marriedStatus,
          userData.bio,
          false, // isPlatformUser = false for tenant users
          userData.tenantId,
          userData.statusId,
        ])
      ).rows;

      const userResponse = userResult[0];

      /** Insert user authentication data */
      await pool.query(
        `
          INSERT INTO user_auths (
            "userId",
            "authEmail",
            "hashPassword",
            "passwordUpdatedAt",
            "createdAt",
            "updatedAt"
          )
          VALUES ($1, $2, $3, NOW(), NOW(), NOW())
        `,
        [userResponse.id, userData.authEmail, hashPassword] // Using authEmail
      );

      if (userData.roleIds) {
        for (const roleId of userData.roleIds) {
          await pool.query(
            `
              INSERT INTO user_role_xref ("userId", "roleId", "createdAt", "updatedAt")
              VALUES ($1, $2, NOW(), NOW())
            `,
            [userResponse.id, roleId]
          );
        }
      }
    }

    logger.info("Seeding completed successfully!");
  } catch (error) {
    logger.error("Error occurred during seeding:", error);
    throw error; // Re-throw to ensure the process exits with error code
  } finally {
    logger.info("Seeding reached to finally!");
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Received SIGINT. Graceful shutdown...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM. Graceful shutdown...");
  process.exit(0);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run the main function
main().catch(error => {
  logger.error("Fatal error in main function:", error);
  process.exit(1);
});
