import { PoolClient } from 'pg';
import bcrypt from 'bcryptjs';

interface Lookup {
  id?: number;
  name: string;
  label: string;
  isSystem: boolean;
  lookupTypeId?: number;
}

interface LookupTypeWithLookupsSchema {
  id?: number;
  name: string;
  label: string;
  isSystem: boolean;
  lookups: Lookup[];
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
  lastPasswordChangedAt: Date;
  statusId: number;
  userRoles: number[];
  tenantId?: number;
}

const lookupData: LookupTypeWithLookupsSchema[] = [
  {
    name: 'USER_ROLE',
    label: 'User Role',
    isSystem: true,
    lookups: [
      {
        name: 'USER_ROLE_PLATFORM_SUPER_ADMIN',
        label: 'Platform Super Admin',
        isSystem: true,
      },
      {
        name: 'USER_ROLE_PLATFORM_ADMIN',
        label: 'Platform Admin',
        isSystem: true,
      },
      {
        name: 'USER_ROLE_PLATFORM_USER',
        label: 'Platform User',
        isSystem: true,
      },
      {
        name: 'USER_ROLE_TENANT_ADMIN',
        label: 'Tenant Admin',
        isSystem: true,
      },
      {
        name: 'USER_ROLE_TENANT_MANAGER',
        label: 'Tenant Manager',
        isSystem: true,
      },
      {
        name: 'USER_ROLE_TENANT_USER',
        label: 'Tenant User',
        isSystem: true,
      },
    ],
  },
  {
    name: 'USER_STATUS',
    label: 'User Status',
    isSystem: true,
    lookups: [
      {
        name: 'USER_STATUS_PENDING',
        label: 'Pending',
        isSystem: true,
      },
      {
        name: 'USER_STATUS_ACTIVE',
        label: 'Active',
        isSystem: true,
      },
      {
        name: 'USER_STATUS_DEACTIVATED',
        label: 'Deactivated',
        isSystem: true,
      },
      {
        name: 'USER_STATUS_ARCHIVED',
        label: 'Archived',
        isSystem: true,
      },
    ],
  },
  {
    name: 'TENANT_STATUS',
    label: 'Tenant Status',
    isSystem: true,
    lookups: [
      {
        name: 'TENANT_STATUS_PENDING',
        label: 'Pending',
        isSystem: true,
      },
      {
        name: 'TENANT_STATUS_ACTIVE',
        label: 'Active',
        isSystem: true,
      },
      {
        name: 'TENANT_STATUS_DEACTIVATED',
        label: 'Deactivated',
        isSystem: true,
      },
      {
        name: 'TENANT_STATUS_ARCHIVED',
        label: 'Archived',
        isSystem: true,
      },
    ],
  },
  {
    name: 'CHAT_TYPE',
    label: 'Chat Type',
    isSystem: true,
    lookups: [
      {
        name: 'CHAT_TYPE_ONE_TO_ONE',
        label: '1:1 Chat',
        isSystem: true,
      },
      {
        name: 'CHAT_TYPE_GROUP',
        label: 'Group Chat',
        isSystem: true,
      },
    ],
  },
];

export async function up(client: PoolClient): Promise<void> {
  const upsertAndFetchLookupData = async () => {
    /* Process each lookup type and its lookups */
    for (const data of lookupData) {
      /** Insert lookup type and get the ID */
      const lookupTypeResult = await client.query(
        `
            INSERT INTO lookup_type (name, label, "isSystem", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, NOW(), NOW())
            ON CONFLICT (name) DO NOTHING
            RETURNING id;
        `,
        [data.name, data.label, data.isSystem]
      );

      /** If lookup type was inserted (not already existed), get the ID */
      let lookupTypeId: number;
      if (lookupTypeResult.rows.length > 0) {
        lookupTypeId = lookupTypeResult.rows[0].id;
      } else {
        /** If it already existed, fetch the existing ID */
        const existingResult = await client.query(
          'SELECT id FROM lookup_type WHERE name = $1',
          [data.name]
        );
        lookupTypeId = existingResult.rows[0].id;
      }

      /** Insert lookups for this type */
      for (const lookup of data.lookups) {
        await client.query(
          `
                INSERT INTO lookup (name, label, "isSystem", "lookupTypeId", "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                ON CONFLICT ("lookupTypeId", label) DO NOTHING;
            `,
          [lookup.name, lookup.label, lookup.isSystem, lookupTypeId]
        );
      }
    }

    /** Get lookup data by lookup name */
    const getLookupDataByName = async (
      lookupName: string
    ): Promise<Lookup> => {
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

    return { getLookupDataByName };
  };

  const { getLookupDataByName } = await upsertAndFetchLookupData();

  const superAdminRoleData = await getLookupDataByName(
    'USER_ROLE_PLATFORM_SUPER_ADMIN'
  );

  const activeUserStatusData =
    await getLookupDataByName('USER_STATUS_ACTIVE');

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
        lastPasswordChangedAt: new Date(),
        bio: 'This is Super Admin',
        statusId: activeUserStatusData.id as number,
        userRoles: [superAdminRoleData.id as number],
      },
    ];

    for (const userData of userDataList) {
      /** Hash the password using bcrypt directly */
      const saltRounds = 10;
      const hashPassword = await bcrypt.hash(userData.password, saltRounds);

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
            "hashPassword",
            bio,
            "statusId",
            "createdAt",
            "updatedAt"
            )
          VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
          )
          RETURNING *;
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
          hashPassword,
          userData.bio,
          userData.statusId,
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
