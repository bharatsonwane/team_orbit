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
  authEmail: string;
  password: string;
  passwordUpdatedAt?: Date;
}

interface AppUserWithAuth extends AppUser {
  userAuth: UserAuth;
  userRoles: number[];
}

const lookupTypeKeys = {
  USER_ROLE: "USER_ROLE",
  USER_STATUS: "USER_STATUS",
  TENANT_STATUS: "TENANT_STATUS",
};

const lookupCategoryKeys = {
  PLATFORM: "PLATFORM",
  TENANT: "TENANT",
};

const tenantStatusKeys = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  DEACTIVATED: "DEACTIVATED",
  ARCHIVED: "ARCHIVED",
};

const userRoleKeys = {
  ANY: "ANY",
  PLATFORM_SUPER_ADMIN: "PLATFORM_SUPER_ADMIN",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  PLATFORM_USER: "PLATFORM_USER",
  TENANT_ADMIN: "TENANT_ADMIN",
  TENANT_MANAGER: "TENANT_MANAGER",
  TENANT_USER: "TENANT_USER",
};

const userStatusKeys = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  DEACTIVATED: "DEACTIVATED",
  ARCHIVED: "ARCHIVED",
};

const lookupData: LookupTypeWithLookupsSchema[] = [
  {
    name: lookupTypeKeys.USER_ROLE,
    label: "User Role",
    isSystem: true,
    lookups: [
      {
        name: userRoleKeys.PLATFORM_SUPER_ADMIN,
        label: "Platform Super Admin",
        category: lookupCategoryKeys.PLATFORM,
        description: "Highest level administrator with full system access",
        isSystem: true,
        sortOrder: 1,
      },
      {
        name: userRoleKeys.PLATFORM_ADMIN,
        label: "Platform Admin",
        category: lookupCategoryKeys.PLATFORM,
        description: "Platform administrator with administrative privileges",
        isSystem: true,
        sortOrder: 2,
      },
      {
        name: userRoleKeys.PLATFORM_USER,
        label: "Platform User",
        category: lookupCategoryKeys.PLATFORM,
        description: "Standard platform user with basic access",
        isSystem: true,
        sortOrder: 3,
      },
      {
        name: userRoleKeys.TENANT_ADMIN,
        label: "Tenant Admin",
        category: lookupCategoryKeys.TENANT,
        description: "Tenant administrator with full tenant access",
        isSystem: true,
        sortOrder: 4,
      },
      {
        name: userRoleKeys.TENANT_MANAGER,
        label: "Tenant Manager",
        category: lookupCategoryKeys.TENANT,
        description: "Tenant manager with limited administrative access",
        isSystem: true,
        sortOrder: 5,
      },
      {
        name: userRoleKeys.TENANT_USER,
        label: "Tenant User",
        category: lookupCategoryKeys.TENANT,
        description: "Standard tenant user with basic tenant access",
        isSystem: true,
        sortOrder: 6,
      },
    ],
  },
  {
    name: lookupTypeKeys.USER_STATUS,
    label: "User Status",
    isSystem: true,
    lookups: [
      {
        name: userStatusKeys.PENDING,
        label: "Pending",
        description: "User account is pending activation",
        isSystem: true,
        sortOrder: 1,
      },
      {
        name: userStatusKeys.ACTIVE,
        label: "Active",
        description: "User account is active and can access the system",
        isSystem: true,
        sortOrder: 2,
      },
      {
        name: userStatusKeys.DEACTIVATED,
        label: "Deactivated",
        description: "User account is temporarily deactivated",
        isSystem: true,
        sortOrder: 3,
      },
    ],
  },
  {
    name: lookupTypeKeys.TENANT_STATUS,
    label: "Tenant Status",
    isSystem: true,
    lookups: [
      {
        name: tenantStatusKeys.PENDING,
        label: "Pending",
        description: "Tenant is pending approval",
        isSystem: true,
        sortOrder: 1,
      },
      {
        name: tenantStatusKeys.ACTIVE,
        label: "Active",
        description: "Tenant is active and operational",
        isSystem: true,
        sortOrder: 2,
      },
      {
        name: tenantStatusKeys.DEACTIVATED,
        label: "Deactivated",
        description: "Tenant is temporarily deactivated",
        isSystem: true,
        sortOrder: 3,
      },
    ],
  },
];

export async function up(
  client: PoolClient,
  schemaName: string
): Promise<void> {
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

  // Create default platform tenant
  const createDefaultPlatformTenant = async () => {
    // Check if platform tenant already exists
    const existingTenant = await client.query(
      `SELECT id FROM tenants WHERE name = $1`,
      ["platform"]
    );

    if (existingTenant.rows.length > 0) {
      console.log("Platform tenant already exists");
      return existingTenant.rows[0].id;
    }

    // Get active tenant status
    const activeTenantStatusData =
      await getLookupDataByLookupTypeNameAndLookupName({
        lookupName: tenantStatusKeys.ACTIVE,
        lookupTypeName: lookupTypeKeys.TENANT_STATUS,
      });

    // Insert platform tenant
    const tenantResult = await client.query(
      `
      INSERT INTO tenants (name, label, description, "statusId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
      `,
      [
        "platform",
        "Platform",
        "Default tenant for platform users and system administration",
        activeTenantStatusData.id,
      ]
    );

    console.log("Platform tenant created successfully");
    return tenantResult.rows[0].id;
  };

  const platformTenantId = await createDefaultPlatformTenant();

  const superAdminRoleData = await getLookupDataByLookupTypeNameAndLookupName({
    lookupName: userRoleKeys.PLATFORM_SUPER_ADMIN,
    lookupTypeName: lookupTypeKeys.USER_ROLE,
  });

  const activeUserStatusData = await getLookupDataByLookupTypeNameAndLookupName(
    {
      lookupName: userStatusKeys.ACTIVE,
      lookupTypeName: lookupTypeKeys.USER_STATUS,
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
        tenantId: platformTenantId,
        userAuth: {
          authEmail: "superadmin@gmail.com", // Official email as authEmail
          password: "Super@123",
          passwordUpdatedAt: new Date(),
        },
        userRoles: [superAdminRoleData.id as number],
      },
    ];

    for (const userData of userDataList) {
      /** Hash the password using bcrypt directly */
      const saltRounds = 10;
      const hashPassword = await bcrypt.hash(
        userData.userAuth.password,
        saltRounds
      );

      /** Check if user already exists by checking user_auths table */
      const checkUserAuthQuery = `
          SELECT id, "authEmail" FROM user_auths WHERE "authEmail" = $1;
        `;
      const existingUserAuth = (
        await client.query(checkUserAuthQuery, [userData.userAuth.authEmail])
      ).rows;

      /** If user already exists, continue */
      if (existingUserAuth.length > 0) {
        console.log(`User already exists: ${userData.userAuth.authEmail}`);
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
            "tenantId",
            "createdAt",
            "updatedAt"
            )
          VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
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
          userData.tenantId,
        ])
      ).rows;

      const userResponse = userResult[0] as AppUser;

      /** Insert user authentication data */
      await client.query(
        `
          INSERT INTO user_auths (
            "userId",
            "authEmail",
            "hashPassword",
            "passwordUpdatedAt",
            "createdAt",
            "updatedAt"
          )
          VALUES ($1, $2, $3, $4, NOW(), NOW())
        `,
        [
          userResponse.id,
          userData.userAuth.authEmail,
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
  console.log(`${schemaName} initial lookup data inserted successfully`);
}

export async function down(
  client: PoolClient,
  schemaName: string
): Promise<void> {
  // Rollback logic can be implemented here if needed
  console.log(`${schemaName} initial lookup data rolled back successfully`);
}
