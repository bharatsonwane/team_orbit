import { PoolClient } from 'pg';
import bcrypt from 'bcryptjs';

const lookupTypeKeys = {
  userRole: 'userRole',
  userStatus: 'userStatus',
  chatType: 'chatType',
};

const roleKeys = {
  platformSuperAdmin: 'Platform Super Admin',
  platformAdmin: 'Platform Admin',
  platformUser: 'Platform User',
  platformAgent: 'Platform Agent',
  platformManager: 'Platform Manager',
  platformAuditor: 'Platform Auditor',
  tenantAdmin: 'Tenant Admin',
  tenantManager: 'Tenant Manager',
  tenantAgent: 'Tenant Agent',
  tenantUser: 'Tenant User',
  tenantEmployee: 'Tenant Employee',
};

const userStatusKeys = {
  pending: 'Pending',
  active: 'Active',
  archived: 'Archived',
  suspended: 'Suspended',
};

const chatTypeKeys = {
  oneToOne: '1:1 Chat',
  group: 'Group Chat',
};

interface LookupType {
  lookupType: string;
  lookups: { label: string }[];
}

interface Lookup {
  id: number;
  label: string;
  lookupTypeId: number;
  lookupTypeName: string;
}

interface AppUser {
  id?: number | null;
  title: string;
  firstName: string;
  lastName: string;
  middleName: string;
  maidenName: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  marriedStatus: string;
  email: string;
  phone: string;
  password: string;
  bio: string;
  userStatus: string;
  userRoles: number[];
}

export async function up(client: PoolClient): Promise<void> {
  const upsertAndFetchLookupData = async () => {
    const lookupData: LookupType[] = [
      {
        lookupType: lookupTypeKeys.userRole,
        lookups: [
          { label: roleKeys.platformSuperAdmin },
          { label: roleKeys.platformAdmin },
          { label: roleKeys.platformUser },
          { label: roleKeys.platformAgent },
          { label: roleKeys.platformManager },
          { label: roleKeys.platformAuditor },
          { label: roleKeys.tenantAdmin },
          { label: roleKeys.tenantManager },
          { label: roleKeys.tenantAgent },
          { label: roleKeys.tenantUser },
          { label: roleKeys.tenantEmployee },
        ],
      },
      {
        lookupType: lookupTypeKeys.chatType,
        lookups: [
          { label: chatTypeKeys.oneToOne },
          { label: chatTypeKeys.group },
        ],
      },
    ];
    /* Process each lookup type and its lookups */
    for (const data of lookupData) {
      /** Insert lookup type and get the ID */
      const lookupTypeResult = await client.query(
        `
            INSERT INTO lookup_type (name, "createdAt", "updatedAt")
            VALUES ($1, NOW(), NOW())
            ON CONFLICT (name) DO NOTHING
            RETURNING id;
        `,
        [data.lookupType]
      );

      /** If lookup type was inserted (not already existed), get the ID */
      let lookupTypeId: number;
      if (lookupTypeResult.rows.length > 0) {
        lookupTypeId = lookupTypeResult.rows[0].id;
      } else {
        /** If it already existed, fetch the existing ID */
        const existingResult = await client.query(
          'SELECT id FROM lookup_type WHERE name = $1',
          [data.lookupType]
        );
        lookupTypeId = existingResult.rows[0].id;
      }

      /** Insert lookups for this type */
      for (const lookup of data.lookups) {
        await client.query(
          `
                INSERT INTO lookup (label, "lookupTypeId", "createdAt", "updatedAt")
                VALUES ($1, $2, NOW(), NOW())
                ON CONFLICT ("lookupTypeId", label) DO NOTHING;
            `,
          [lookup.label, lookupTypeId]
        );
      }
    }

    /** Get lookup data by type label */
    const getLookupDataByTypeLabel = async (
      lookupTypeName: string,
      lookupLabel: string
    ): Promise<Lookup> => {
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

    return { getLookupDataByTypeLabel };
  };

  const { getLookupDataByTypeLabel } = await upsertAndFetchLookupData();

  const superAdminRoleData = await getLookupDataByTypeLabel(
    lookupTypeKeys.userRole,
    roleKeys.platformSuperAdmin
  );

  const upsertAndFetchUserData = async () => {
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
        userRoles: [superAdminRoleData.id],
      },
    ];

    for (const userData of userDataList) {
      /** Hash the password using bcrypt directly */
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      /** Check if app_user already exists */
      const checkUserQuery = `
          SELECT id, email FROM app_user WHERE email = $1;
        `;
      const existingUser = (
        await client.query(checkUserQuery, [userData.email])
      ).rows;

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
        await client.query(upsertUserQuery, [
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
        await client.query(
          `
            INSERT INTO user_role_xref ("userId", "roleId", "createdAt", "updatedAt")
            VALUES ($1, $2, NOW(), NOW())
          `,
          [userResponse.id, roleId]
        );
      }
    }
  };

  await upsertAndFetchUserData();
}

export async function down(client: PoolClient): Promise<void> {
  // Rollback logic can be implemented here if needed
}
