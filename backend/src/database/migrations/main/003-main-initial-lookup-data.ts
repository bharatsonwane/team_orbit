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
  tenantIds?: number[]; // Array of tenant IDs for user_tenants_xref
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

interface Role {
  id?: number;
  name: string;
  label: string;
  description?: string;
  sortOrder?: number;
  isSystem: boolean;
}

interface Permission {
  id?: number;
  name: string;
  label: string;
  description?: string;
  sortOrder?: number;
  isSystem: boolean;
}

const lookupTypeKeys = {
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

const platformRoleKeys = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
};

const userStatusKeys = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  DEACTIVATED: "DEACTIVATED",
  ARCHIVED: "ARCHIVED",
};

// Platform-level permissions (stored in main schema)
const platformPermissionKeys = {
  // User permissions
  USER_CREATE: "USER_CREATE",
  USER_READ: "USER_READ",
  USER_UPDATE: "USER_UPDATE",
  USER_DELETE: "USER_DELETE",
  // Tenant permissions
  TENANT_CREATE: "TENANT_CREATE",
  TENANT_READ: "TENANT_READ",
  TENANT_UPDATE: "TENANT_UPDATE",
  TENANT_DELETE: "TENANT_DELETE",
} as const;

const rolesData: Role[] = [
  {
    name: platformRoleKeys.SUPER_ADMIN,
    label: "Platform Super Admin",
    description: "Highest level administrator with full system access",
    isSystem: true,
    sortOrder: 1,
  },
  {
    name: platformRoleKeys.ADMIN,
    label: "Platform Admin",
    description: "Platform administrator with administrative privileges",
    isSystem: true,
    sortOrder: 2,
  },
  {
    name: platformRoleKeys.USER,
    label: "Platform User",
    description: "Standard platform user with basic access",
    isSystem: true,
    sortOrder: 3,
  },
];

const permissionsData: Permission[] = [
  // User permissions (platform)
  {
    name: platformPermissionKeys.USER_CREATE,
    label: "Create User",
    description: "Permission to create new users",
    isSystem: true,
    sortOrder: 1,
  },
  {
    name: platformPermissionKeys.USER_READ,
    label: "Read User",
    description: "Permission to view user information",
    isSystem: true,
    sortOrder: 2,
  },
  {
    name: platformPermissionKeys.USER_UPDATE,
    label: "Update User",
    description: "Permission to update user information",
    isSystem: true,
    sortOrder: 3,
  },
  {
    name: platformPermissionKeys.USER_DELETE,
    label: "Delete User",
    description: "Permission to delete users",
    isSystem: true,
    sortOrder: 4,
  },
  // Tenant permissions (platform)
  {
    name: platformPermissionKeys.TENANT_CREATE,
    label: "Create Tenant",
    description: "Permission to create new tenants",
    isSystem: true,
    sortOrder: 5,
  },
  {
    name: platformPermissionKeys.TENANT_READ,
    label: "Read Tenant",
    description: "Permission to view tenant information",
    isSystem: true,
    sortOrder: 6,
  },
  {
    name: platformPermissionKeys.TENANT_UPDATE,
    label: "Update Tenant",
    description: "Permission to update tenant information",
    isSystem: true,
    sortOrder: 7,
  },
  {
    name: platformPermissionKeys.TENANT_DELETE,
    label: "Delete Tenant",
    description: "Permission to delete tenants",
    isSystem: true,
    sortOrder: 8,
  },
];

const lookupData: LookupTypeWithLookupsSchema[] = [
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

  // Insert roles into roles table
  const upsertAndFetchRoles = async () => {
    const roleMap: Record<string, number> = {};

    for (const role of rolesData) {
      const roleResult = await client.query(
        `
          INSERT INTO roles (name, label, description, "sortOrder", "isSystem", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          ON CONFLICT (name) DO UPDATE
          SET label = EXCLUDED.label,
              description = EXCLUDED.description,
              "sortOrder" = EXCLUDED."sortOrder",
              "updatedAt" = NOW()
          RETURNING id;
        `,
        [
          role.name,
          role.label,
          role.description || null,
          role.sortOrder || 0,
          role.isSystem,
        ]
      );

      if (roleResult.rows.length > 0) {
        roleMap[role.name] = roleResult.rows[0].id;
      } else {
        // If it already existed, fetch the existing ID
        const existingResult = await client.query(
          "SELECT id FROM roles WHERE name = $1",
          [role.name]
        );
        roleMap[role.name] = existingResult.rows[0].id;
      }
    }

    const getRoleIdByName = (roleName: string): number => {
      const roleId = roleMap[roleName];
      if (!roleId) {
        throw new Error(`Role not found for name: ${roleName}`);
      }
      return roleId;
    };

    return { getRoleIdByName };
  };

  // Insert permissions into permissions table
  const upsertAndFetchPermissions = async () => {
    const permissionMap: Record<string, number> = {};

    for (const permission of permissionsData) {
      const permissionResult = await client.query(
        `
          INSERT INTO permissions (name, label, description, "sortOrder", "isSystem", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          ON CONFLICT (name) DO UPDATE
          SET label = EXCLUDED.label,
              description = EXCLUDED.description,
              "sortOrder" = EXCLUDED."sortOrder",
              "updatedAt" = NOW()
          RETURNING id;
        `,
        [
          permission.name,
          permission.label,
          permission.description || null,
          permission.sortOrder || 0,
          permission.isSystem,
        ]
      );

      if (permissionResult.rows.length > 0) {
        permissionMap[permission.name] = permissionResult.rows[0].id;
      } else {
        // If it already existed, fetch the existing ID
        const existingResult = await client.query(
          "SELECT id FROM permissions WHERE name = $1",
          [permission.name]
        );
        permissionMap[permission.name] = existingResult.rows[0].id;
      }
    }

    const getPermissionIdByName = (permissionName: string): number => {
      const permissionId = permissionMap[permissionName];
      if (!permissionId) {
        throw new Error(`Permission not found for name: ${permissionName}`);
      }
      return permissionId;
    };

    return { getPermissionIdByName };
  };

  const { getRoleIdByName } = await upsertAndFetchRoles();
  const { getPermissionIdByName } = await upsertAndFetchPermissions();

  // Assign permissions to roles
  const assignPermissionsToRoles = async () => {
    // Define role-permission mappings
    const rolePermissionMappings: Record<string, string[]> = {
      [platformRoleKeys.SUPER_ADMIN]: [
        // All user permissions
        platformPermissionKeys.USER_CREATE,
        platformPermissionKeys.USER_READ,
        platformPermissionKeys.USER_UPDATE,
        platformPermissionKeys.USER_DELETE,
        // All tenant permissions
        platformPermissionKeys.TENANT_CREATE,
        platformPermissionKeys.TENANT_READ,
        platformPermissionKeys.TENANT_UPDATE,
        platformPermissionKeys.TENANT_DELETE,
      ],
      [platformRoleKeys.ADMIN]: [
        // User permissions
        platformPermissionKeys.USER_CREATE,
        platformPermissionKeys.USER_READ,
        platformPermissionKeys.USER_UPDATE,
        platformPermissionKeys.USER_DELETE,
        // Tenant permissions (read-only)
        platformPermissionKeys.TENANT_READ,
      ],
      [platformRoleKeys.USER]: [
        // Read-only permissions
        platformPermissionKeys.USER_READ,
        platformPermissionKeys.TENANT_READ,
      ],
    };

    // Insert role-permission mappings
    for (const [roleName, permissionNames] of Object.entries(
      rolePermissionMappings
    )) {
      const roleId = getRoleIdByName(roleName);

      for (const permissionName of permissionNames) {
        const permissionId = getPermissionIdByName(permissionName);

        await client.query(
          `
            INSERT INTO role_permissions_xref ("roleId", "permissionId", "createdAt", "updatedAt")
            VALUES ($1, $2, NOW(), NOW())
            ON CONFLICT ("roleId", "permissionId") DO NOTHING
          `,
          [roleId, permissionId]
        );
      }
    }

    console.log("Role permissions assigned successfully");
  };

  await assignPermissionsToRoles();

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

  const superAdminRoleId = getRoleIdByName(platformRoleKeys.SUPER_ADMIN);

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
        tenantIds: [platformTenantId], // Array of tenant IDs for user_tenants_xref
        userAuth: {
          authEmail: "superadmin@gmail.com", // Official email as authEmail
          password: "Super@123",
          passwordUpdatedAt: new Date(),
        },
        userRoles: [superAdminRoleId],
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
            INSERT INTO user_roles_xref ("userId", "roleId", "createdAt", "updatedAt")
            VALUES ($1, $2, NOW(), NOW())
            ON CONFLICT ("userId", "roleId") DO NOTHING
          `,
          [userResponse.id, roleId]
        );
      }

      /** Insert user-tenant relationships into user_tenants_xref */
      if (userData.tenantIds && userData.tenantIds.length > 0) {
        for (const tenantId of userData.tenantIds) {
          await client.query(
            `
              INSERT INTO user_tenants_xref ("userId", "tenantId", "createdAt", "updatedAt")
              VALUES ($1, $2, NOW(), NOW())
              ON CONFLICT ("userId", "tenantId") DO NOTHING
            `,
            [userResponse.id, tenantId]
          );
        }
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
