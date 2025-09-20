import { PoolClient } from 'pg';
import db, { schemaNames } from '../db';
import logger from '../../utils/logger';
import { Lookup } from '../../schemas/lookup.schema';
import { AppUser } from '../../schemas/user.schema';
import {
  lookupTypeKeys,
  roleKeys,
  userStatusKeys,
} from '../../utils/constants';
import { getHashPassword } from '../../utils/authHelper';

/** Get lookup data by type label */
const getLookupDataByTypeLabel = async ({
  client,
  lookupTypeName,
  lookupLabel,
}: {
  client: PoolClient;
  lookupTypeName: string;
  lookupLabel: string;
}): Promise<Lookup> => {
  /** Get lookup data query */
  const getLookupDataQuery = `
            SELECT l.id, l.label, l."lookupTypeId", lt.name
            FROM lookup_type lt
            INNER JOIN lookup l ON lt.id = l."lookupTypeId"
            WHERE lt.name = $1 AND l.label = $2;
          `;

  /** Get lookup data result */
  const lookupDataResult = (
    await client.query(getLookupDataQuery, [lookupTypeName, lookupLabel])
  ).rows;

  /** If lookup data result is empty, throw an error */
  if (lookupDataResult.length === 0) {
    throw new Error(
      `Lookup data not found for type: ${lookupTypeName}, label: ${lookupLabel}`
    );
  }

  /** Return lookup data result */
  return lookupDataResult[0];
};

async function main(): Promise<void> {
  try {
    logger.info('seed main function called');

    const pool = await db.getSchemaPool(schemaNames.main);
    /** create tenant data */
    const tenantData = {
      name: 'iconnect',
      label: 'iConnect Solutions Pte Ltd',
      description:
        'iConnect Solutions Pte Ltd is a software development company that provides software solutions to businesses.',
    };
    const tenantResult = await pool.query(
      `INSERT INTO tenant (name, label, description) 
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET
         label = EXCLUDED.label,
         description = EXCLUDED.description,
         "updatedAt" = NOW()
       RETURNING id, name, label`,
      [tenantData.name, tenantData.label, tenantData.description]
    );
    const tenantId = tenantResult.rows[0].id;

    const platformSuperAdminRoleData = await getLookupDataByTypeLabel({
      client: pool,
      lookupTypeName: lookupTypeKeys.userRole,
      lookupLabel: roleKeys.platformSuperAdmin,
    });

    const userDataList: AppUser[] = [
      {
        title: 'Mr',
        firstName: 'SuperFirstName',
        lastName: 'SuperLastName',
        middleName: 'SuperMiddleName',
        maidenName: '',
        gender: 'Male',
        dob: '1995-07-31',
        bloodGroup: 'B+',
        marriedStatus: 'Married',
        email: 'superadmin@gmail.com',
        phone: '1234567890',
        password: 'Super@123',
        bio: 'This is Super Admin',
        userStatus: userStatusKeys.active,
        tenantId: tenantId,
        userRoles: [platformSuperAdminRoleData.id],
      },
    ];

    for (const userData of userDataList) {
      /** Hash the password */
      const hashedPassword = await getHashPassword(userData.password);

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
            password,
            bio,
            "userStatus",
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
          hashedPassword,
          userData.bio,
          userData.userStatus,
        ])
      ).rows;

      const userResponse = userResult[0] as AppUser;

      for (const roleId of userData.userRoles) {
        await pool.query(
          `
            INSERT INTO user_role ("userId", "roleId", "createdAt", "updatedAt")
            VALUES ($1, $2, NOW(), NOW())
          `,
          [userResponse.id, roleId]
        );
      }
    }

    /** create app user data */

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
