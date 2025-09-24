import { PoolClient } from 'pg';
import db, { schemaNames } from '../db';
import logger from '../../utils/logger';
import { LookupSchema } from '../../schemas/lookup.schema';
import { UserSignupSchema } from '../../schemas/user.schema';
import {
  lookupTypeKeys,
  userRoleKeys,
  userStatusKeys,
  tenantStatusKeys,
} from '../../utils/constants';
import { getHashPassword } from '../../utils/authHelper';

/** Get lookup data by lookup name */
const getLookupDataByName = async (
  client: PoolClient,
  lookupName: string
): Promise<LookupSchema> => {
  /** Get lookup data query */
  const getLookupDataQuery = `
        SELECT l.id, l.name, l.label, l."lookupTypeId", lt.name as typeName
        FROM lookup_type lt
        INNER JOIN lookup l ON lt.id = l."lookupTypeId"
        WHERE l.name = $1;
      `;

  /** Get lookup data result */
  const lookupDataResult = (
    await client.query(getLookupDataQuery, [lookupName])
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
    logger.info('seed main function called');

    const pool = await db.getSchemaPool(schemaNames.main);

    // Get tenant status lookup data
    const activeTenantStatusData = await getLookupDataByName(
      pool,
      tenantStatusKeys.ACTIVE
    );

    /** create tenant data */
    const tenantData = {
      name: 'iConnect',
      label: 'iConnect',
    };
    const tenantResult = await pool.query(
      `INSERT INTO tenant (name, label, "statusId") 
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
    const tenantAdminRoleData = await getLookupDataByName(
      pool,
      userRoleKeys.TENANT_ADMIN
    );

    const activeUserStatusData = await getLookupDataByName(
      pool,
      userStatusKeys.ACTIVE
    );

    const userDataList: UserSignupSchema[] = [
      {
        title: 'Mr',
        firstName: 'iConnect',
        lastName: 'Admin',
        middleName: '',
        maidenName: '',
        gender: 'Male',
        dob: '1990-01-01',
        bloodGroup: 'A+',
        marriedStatus: 'Single',
        email: 'iconnect@gmail.com',
        phone: '9876543210',
        password: 'Admin@123',
        bio: 'iConnect Tenant Admin',
        statusId: activeUserStatusData.id,
        tenantId: tenantId,
        userRoles: [tenantAdminRoleData.id],
      },
    ];

    for (const userData of userDataList) {
      /** Hash the password */
      const hashPassword = await getHashPassword(userData.password);

      /** Check if app_user already exists */
      const checkUserQuery = `
          SELECT id, email FROM app_user WHERE email = $1;
        `;
      const existingUser = (await pool.query(checkUserQuery, [userData.email]))
        .rows;

      /** If app_user already exists, continue */
      if (existingUser.length > 0) {
        console.log(`User already exists: ${userData.email}`);
        continue;
      }

      /** Insert new app_user */
      const upsertUserQuery = `
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
            "updatedAt")
          VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
          )
          RETURNING id, email, "firstName", "lastName";
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
          userData.email,
          userData.phone,
          hashPassword,
          userData.bio,
          userData.statusId,
        ])
      ).rows;

      const userResponse = userResult[0];

      if (userData.userRoles) {
        for (const roleId of userData.userRoles) {
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

    logger.info('Seeding completed successfully!');
  } catch (error) {
    logger.error('Error occurred during seeding:', error);
    throw error; // Re-throw to ensure the process exits with error code
  } finally {
    logger.info('Seeding reached to finally!');
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM. Graceful shutdown...');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main function
main().catch(error => {
  logger.error('Fatal error in main function:', error);
  process.exit(1);
});
