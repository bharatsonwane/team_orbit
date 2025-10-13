import { PoolClient } from "pg";
import bcrypt from "bcryptjs";

interface Lookup {
  id?: number;
  name: string;
  label: string;
  category?: string;
  description?: string;
  isSystem: boolean;
  sortOrder?: number;
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
  bio: string;
  statusId: number;
  tenantId?: number;
}

interface UserAuth {
  email: string;
  phone: string;
  hashPassword: string;
  passwordUpdatedAt?: Date;
}

interface AppUserWithAuth extends AppUser {
  userAuth: UserAuth;
  userRoles: number[];
}

const lookupData: LookupTypeWithLookupsSchema[] = [
  {
    name: "USER_ROLE",
    label: "User Role",
    isSystem: true,
    lookups: [
      {
        name: "PLATFORM_SUPER_ADMIN",
        label: "Platform Super Admin",
        category: "PLATFORM",
        description: "Highest level administrator with full system access",
        isSystem: true,
        sortOrder: 1,
      },
      {
        name: "PLATFORM_ADMIN",
        label: "Platform Admin",
        category: "PLATFORM",
        description: "Platform administrator with administrative privileges",
        isSystem: true,
        sortOrder: 2,
      },
      {
        name: "PLATFORM_USER",
        label: "Platform User",
        category: "PLATFORM",
        description: "Standard platform user with basic access",
        isSystem: true,
        sortOrder: 3,
      },
      {
        name: "TENANT_ADMIN",
        label: "Tenant Admin",
        category: "TENANT",
        description: "Tenant administrator with full tenant access",
        isSystem: true,
        sortOrder: 4,
      },
      {
        name: "TENANT_MANAGER",
        label: "Tenant Manager",
        category: "TENANT",
        description: "Tenant manager with limited administrative access",
        isSystem: true,
        sortOrder: 5,
      },
      {
        name: "TENANT_USER",
        label: "Tenant User",
        category: "TENANT",
        description: "Standard tenant user with basic tenant access",
        isSystem: true,
        sortOrder: 6,
      },
    ],
  },
  {
    name: "USER_STATUS",
    label: "User Status",
    isSystem: true,
    lookups: [
      {
        name: "PENDING",
        label: "Pending",
        description: "User account is pending activation",
        isSystem: true,
        sortOrder: 1,
      },
      {
        name: "ACTIVE",
        label: "Active",
        description: "User account is active and can access the system",
        isSystem: true,
        sortOrder: 2,
      },
      {
        name: "DEACTIVATED",
        label: "Deactivated",
        description: "User account is temporarily deactivated",
        isSystem: true,
        sortOrder: 3,
      },
    ],
  },
  {
    name: "TENANT_STATUS",
    label: "Tenant Status",
    isSystem: true,
    lookups: [
      {
        name: "PENDING",
        label: "Pending",
        description: "Tenant is pending approval",
        isSystem: true,
        sortOrder: 1,
      },
      {
        name: "ACTIVE",
        label: "Active",
        description: "Tenant is active and operational",
        isSystem: true,
        sortOrder: 2,
      },
      {
        name: "DEACTIVATED",
        label: "Deactivated",
        description: "Tenant is temporarily deactivated",
        isSystem: true,
        sortOrder: 3,
      },
    ],
  },
  {
    name: "CHAT_TYPE",
    label: "Chat Type",
    isSystem: true,
    lookups: [
      {
        name: "ONE_TO_ONE",
        label: "1:1 Chat",
        description: "Direct message between two users",
        isSystem: true,
        sortOrder: 1,
      },
      {
        name: "GROUP",
        label: "Group Chat",
        description: "Group conversation with multiple users",
        isSystem: true,
        sortOrder: 2,
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
            INSERT INTO lookup_types (name, label, "isSystem", "createdAt", "updatedAt")
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
          "SELECT id FROM lookup_types WHERE name = $1",
          [data.name]
        );
        lookupTypeId = existingResult.rows[0].id;
      }

      /** Insert lookups for this type */
      for (const lookup of data.lookups) {
        await client.query(
          `
                INSERT INTO lookups (name, label, category, description, "isSystem", "sortOrder", "lookupTypeId", "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                ON CONFLICT ("lookupTypeId", name) DO NOTHING;
            `,
          [
            lookup.name,
            lookup.label,
            lookup.category || null,
            lookup.description || null,
            lookup.isSystem,
            lookup.sortOrder || 0,
            lookupTypeId,
          ]
        );
      }
    }

    /** Get lookup data by lookup name */
    const getLookupDataByLookupTypeNameAndLookupName = async ({
      lookupName,
      lookupTypeName,
    }: {
      lookupName: string;
      lookupTypeName: string;
    }): Promise<Lookup> => {
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

    return { getLookupDataByLookupTypeNameAndLookupName };
  };

  const { getLookupDataByLookupTypeNameAndLookupName } =
    await upsertAndFetchLookupData();

  const superAdminRoleData = await getLookupDataByLookupTypeNameAndLookupName({
    lookupName: "PLATFORM_SUPER_ADMIN",
    lookupTypeName: "USER_ROLE",
  });

  const activeUserStatusData = await getLookupDataByLookupTypeNameAndLookupName(
    {
      lookupName: "ACTIVE",
      lookupTypeName: "USER_STATUS",
    }
  );

  const upsertAndFetchUserData = async () => {
    const userDataList: AppUserWithAuth[] = [
      {
        title: "Mr",
        firstName: "SuperFirstName",
        lastName: "SuperLastName",
        middleName: "SuperMiddleName",
        maidenName: "",
        gender: "Male",
        dob: "1995-07-31",
        bloodGroup: "B+",
        marriedStatus: "Married",
        bio: "This is Super Admin",
        statusId: activeUserStatusData.id as number,
        userAuth: {
          email: "superadmin@gmail.com",
          phone: "1234567890",
          hashPassword: "Super@123",
          passwordUpdatedAt: new Date(),
        },
        userRoles: [superAdminRoleData.id as number],
      },
    ];

    for (const userData of userDataList) {
      /** Hash the password using bcrypt directly */
      const saltRounds = 10;
      const hashPassword = await bcrypt.hash(
        userData.userAuth.hashPassword,
        saltRounds
      );

      /** Check if user already exists by checking user_auths table */
      const checkUserAuthQuery = `
          SELECT id, email FROM user_auths WHERE email = $1;
        `;
      const existingUserAuth = (
        await client.query(checkUserAuthQuery, [userData.userAuth.email])
      ).rows;

      /** If user already exists, continue */
      if (existingUserAuth.length > 0) {
        console.log(`User already exists: ${userData.userAuth.email}`);
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
            "statusId",
            "createdAt",
            "updatedAt"
            )
          VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
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
          userData.bio,
          true, // isPlatformUser = true for super admin
          userData.statusId,
        ])
      ).rows;

      const userResponse = userResult[0] as AppUser;

      /** Insert user authentication data */
      await client.query(
        `
          INSERT INTO user_auths (
            "userId",
            email,
            phone,
            "hashPassword",
            "passwordUpdatedAt",
            "createdAt",
            "updatedAt"
          )
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `,
        [
          userResponse.id,
          userData.userAuth.email,
          userData.userAuth.phone,
          hashPassword,
          userData.userAuth.passwordUpdatedAt,
        ]
      );

      /** Insert user roles */
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
