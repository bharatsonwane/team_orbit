import type { Pool } from "pg";

interface TenantLookupType {
  name: string;
  label: string;
  isSystem: boolean;
  lookups: TenantLookup[];
}

interface TenantLookup {
  name: string;
  label: string;
  description?: string;
  isSystem: boolean;
  sortOrder: number;
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
  CONTACT_TYPE: "CONTACT_TYPE",
  DEPARTMENT: "DEPARTMENT",
  DESIGNATION: "DESIGNATION",
};

const contactTypeKeys = {
  PERSONAL_EMAIL: "PERSONAL_EMAIL",
  PERSONAL_PHONE: "PERSONAL_PHONE",
  ALTERNATIVE_PHONE: "ALTERNATIVE_PHONE",
  EMERGENCY_PHONE1: "EMERGENCY_PHONE1",
  EMERGENCY_PHONE2: "EMERGENCY_PHONE2",
};

const departmentKeys = {
  ENGINEERING: "ENGINEERING",
  QA: "QA",
  DATA_ANALYTICS: "DATA_ANALYTICS",
  SECURITY: "SECURITY",
  PRODUCT: "PRODUCT",
  DESIGN: "DESIGN",
  CUSTOMER_SUCCESS: "CUSTOMER_SUCCESS",
  SALES: "SALES",
  MARKETING: "MARKETING",
  HR: "HR",
  FINANCE: "FINANCE",
  OPERATIONS: "OPERATIONS",
  LEGAL: "LEGAL",
};

const designationKeys = {
  // C-Level
  CEO: "CEO",
  CTO: "CTO",
  CPO: "CPO",
  CFO: "CFO",

  // VP/Director Level
  VP_ENGINEERING: "VP_ENGINEERING",
  VP_PRODUCT: "VP_PRODUCT",
  DIRECTOR: "DIRECTOR",

  // Management
  ENGINEERING_MANAGER: "ENGINEERING_MANAGER",
  PRODUCT_MANAGER: "PRODUCT_MANAGER",
  PROJECT_MANAGER: "PROJECT_MANAGER",
  TEAM_LEAD: "TEAM_LEAD",

  // Engineering
  PRINCIPAL_ENGINEER: "PRINCIPAL_ENGINEER",
  SENIOR_ENGINEER: "SENIOR_ENGINEER",
  SOFTWARE_ENGINEER: "SOFTWARE_ENGINEER",
  JUNIOR_ENGINEER: "JUNIOR_ENGINEER",
  FRONTEND_DEVELOPER: "FRONTEND_DEVELOPER",
  BACKEND_DEVELOPER: "BACKEND_DEVELOPER",
  FULLSTACK_DEVELOPER: "FULLSTACK_DEVELOPER",
  MOBILE_DEVELOPER: "MOBILE_DEVELOPER",
  DEVOPS_ENGINEER: "DEVOPS_ENGINEER",

  // QA
  QA_MANAGER: "QA_MANAGER",
  SENIOR_QA_ENGINEER: "SENIOR_QA_ENGINEER",
  QA_ENGINEER: "QA_ENGINEER",
  AUTOMATION_ENGINEER: "AUTOMATION_ENGINEER",

  // Design
  DESIGN_MANAGER: "DESIGN_MANAGER",
  SENIOR_DESIGNER: "SENIOR_DESIGNER",
  UX_DESIGNER: "UX_DESIGNER",
  UI_DESIGNER: "UI_DESIGNER",
  PRODUCT_DESIGNER: "PRODUCT_DESIGNER",

  // Data & Analytics
  DATA_SCIENTIST: "DATA_SCIENTIST",
  DATA_ENGINEER: "DATA_ENGINEER",
  DATA_ANALYST: "DATA_ANALYST",
  BI_ANALYST: "BI_ANALYST",

  // Security
  SECURITY_ENGINEER: "SECURITY_ENGINEER",
  SECURITY_ANALYST: "SECURITY_ANALYST",

  // Sales & Marketing
  SALES_MANAGER: "SALES_MANAGER",
  ACCOUNT_MANAGER: "ACCOUNT_MANAGER",
  SALES_EXECUTIVE: "SALES_EXECUTIVE",
  MARKETING_MANAGER: "MARKETING_MANAGER",
  DIGITAL_MARKETER: "DIGITAL_MARKETER",

  // Customer Success
  CUSTOMER_SUCCESS_MANAGER: "CUSTOMER_SUCCESS_MANAGER",
  SUPPORT_ENGINEER: "SUPPORT_ENGINEER",
  CUSTOMER_SUPPORT: "CUSTOMER_SUPPORT",

  // HR & Operations
  HR_MANAGER: "HR_MANAGER",
  HR_BUSINESS_PARTNER: "HR_BUSINESS_PARTNER",
  RECRUITER: "RECRUITER",
  OPERATIONS_MANAGER: "OPERATIONS_MANAGER",
  OFFICE_MANAGER: "OFFICE_MANAGER",

  // Finance & Legal
  FINANCE_MANAGER: "FINANCE_MANAGER",
  ACCOUNTANT: "ACCOUNTANT",
  LEGAL_COUNSEL: "LEGAL_COUNSEL",

  // Interns & Entry Level
  INTERN: "INTERN",
  TRAINEE: "TRAINEE",
};

// Tenant-level permissions (stored in tenant schema)
const tenantPermissionKeys = {
  // Project permissions
  PROJECT_CREATE: "PROJECT_CREATE",
  PROJECT_READ: "PROJECT_READ",
  PROJECT_UPDATE: "PROJECT_UPDATE",
  PROJECT_DELETE: "PROJECT_DELETE",
} as const;

// Tenant roles
const tenantRoleKeys = {
  TENANT_ADMIN: "TENANT_ADMIN",
  TENANT_MANAGER: "TENANT_MANAGER",
  TENANT_USER: "TENANT_USER",
};

const tenantRolesData: Role[] = [
  {
    name: tenantRoleKeys.TENANT_ADMIN,
    label: "Tenant Admin",
    description: "Tenant administrator with full tenant access",
    isSystem: true,
    sortOrder: 1,
  },
  {
    name: tenantRoleKeys.TENANT_MANAGER,
    label: "Tenant Manager",
    description: "Tenant manager with limited administrative access",
    isSystem: true,
    sortOrder: 2,
  },
  {
    name: tenantRoleKeys.TENANT_USER,
    label: "Tenant User",
    description: "Standard tenant user with basic tenant access",
    isSystem: true,
    sortOrder: 3,
  },
];

const tenantPermissionsData: Permission[] = [
  {
    name: tenantPermissionKeys.PROJECT_CREATE,
    label: "Create Project",
    description: "Permission to create new projects",
    isSystem: true,
    sortOrder: 1,
  },
  {
    name: tenantPermissionKeys.PROJECT_READ,
    label: "Read Project",
    description: "Permission to view project information",
    isSystem: true,
    sortOrder: 2,
  },
  {
    name: tenantPermissionKeys.PROJECT_UPDATE,
    label: "Update Project",
    description: "Permission to update project information",
    isSystem: true,
    sortOrder: 3,
  },
  {
    name: tenantPermissionKeys.PROJECT_DELETE,
    label: "Delete Project",
    description: "Permission to delete projects",
    isSystem: true,
    sortOrder: 4,
  },
];

export async function up(tenantPool: Pool, schemaName: string): Promise<void> {
  // Define tenant-specific lookup types and their values
  const tenantLookupData: TenantLookupType[] = [
    {
      name: lookupTypeKeys.CONTACT_TYPE,
      label: "Contact Type",
      isSystem: true,
      lookups: [
        {
          name: contactTypeKeys.PERSONAL_EMAIL,
          label: "Personal Email",
          description: "Personal email address",
          isSystem: true,
          sortOrder: 2,
        },
        {
          name: contactTypeKeys.PERSONAL_PHONE,
          label: "Personal Phone",
          description: "Personal phone number",
          isSystem: true,
          sortOrder: 3,
        },
        {
          name: contactTypeKeys.ALTERNATIVE_PHONE,
          label: "Alternative Phone",
          description: "Alternative contact phone number",
          isSystem: true,
          sortOrder: 4,
        },
        {
          name: contactTypeKeys.EMERGENCY_PHONE1,
          label: "Emergency Phone 1",
          description: "Primary emergency contact phone number",
          isSystem: true,
          sortOrder: 5,
        },
        {
          name: contactTypeKeys.EMERGENCY_PHONE2,
          label: "Emergency Phone 2",
          description: "Secondary emergency contact phone number",
          isSystem: true,
          sortOrder: 6,
        },
      ],
    },
    {
      name: lookupTypeKeys.DEPARTMENT,
      label: "Department",
      isSystem: true,
      lookups: [
        {
          name: departmentKeys.ENGINEERING,
          label: "Engineering",
          description: "Software engineering and development",
          isSystem: false,
          sortOrder: 1,
        },
        {
          name: departmentKeys.QA,
          label: "Quality Assurance",
          description: "Software testing and quality assurance",
          isSystem: false,
          sortOrder: 2,
        },
        {
          name: departmentKeys.DATA_ANALYTICS,
          label: "Data & Analytics",
          description: "Data science, analytics, and business intelligence",
          isSystem: false,
          sortOrder: 3,
        },
        {
          name: departmentKeys.SECURITY,
          label: "Security",
          description: "Information security and cybersecurity",
          isSystem: false,
          sortOrder: 4,
        },
        {
          name: departmentKeys.PRODUCT,
          label: "Product Management",
          description: "Product strategy and management",
          isSystem: false,
          sortOrder: 5,
        },
        {
          name: departmentKeys.DESIGN,
          label: "Design",
          description: "UI/UX design and user research",
          isSystem: false,
          sortOrder: 6,
        },
        {
          name: departmentKeys.CUSTOMER_SUCCESS,
          label: "Customer Success",
          description: "Customer support and success management",
          isSystem: false,
          sortOrder: 7,
        },
        {
          name: departmentKeys.SALES,
          label: "Sales",
          description: "Sales and business development",
          isSystem: false,
          sortOrder: 8,
        },
        {
          name: departmentKeys.MARKETING,
          label: "Marketing",
          description: "Marketing and growth",
          isSystem: false,
          sortOrder: 9,
        },
        {
          name: departmentKeys.HR,
          label: "Human Resources",
          description: "Human resources and talent management",
          isSystem: false,
          sortOrder: 10,
        },
        {
          name: departmentKeys.FINANCE,
          label: "Finance",
          description: "Finance and accounting",
          isSystem: false,
          sortOrder: 11,
        },
        {
          name: departmentKeys.OPERATIONS,
          label: "Operations",
          description: "Operations and administration",
          isSystem: false,
          sortOrder: 12,
        },
        {
          name: departmentKeys.LEGAL,
          label: "Legal & Compliance",
          description: "Legal affairs and compliance",
          isSystem: false,
          sortOrder: 13,
        },
      ],
    },
    {
      name: lookupTypeKeys.DESIGNATION,
      label: "Designation",
      isSystem: true,
      lookups: [
        // C-Level Executives
        {
          name: designationKeys.CEO,
          label: "Chief Executive Officer",
          description: "Top executive position",
          isSystem: false,
          sortOrder: 1,
        },
        {
          name: designationKeys.CTO,
          label: "Chief Technology Officer",
          description: "Head of technology",
          isSystem: false,
          sortOrder: 2,
        },
        {
          name: designationKeys.CPO,
          label: "Chief Product Officer",
          description: "Head of product strategy",
          isSystem: false,
          sortOrder: 3,
        },
        {
          name: designationKeys.CFO,
          label: "Chief Financial Officer",
          description: "Head of finance",
          isSystem: false,
          sortOrder: 4,
        },

        // VP/Director Level
        {
          name: designationKeys.VP_ENGINEERING,
          label: "VP of Engineering",
          description: "Vice President of Engineering",
          isSystem: false,
          sortOrder: 5,
        },
        {
          name: designationKeys.VP_PRODUCT,
          label: "VP of Product",
          description: "Vice President of Product",
          isSystem: false,
          sortOrder: 6,
        },
        {
          name: designationKeys.DIRECTOR,
          label: "Director",
          description: "Department director",
          isSystem: false,
          sortOrder: 7,
        },

        // Management
        {
          name: designationKeys.ENGINEERING_MANAGER,
          label: "Engineering Manager",
          description: "Engineering team manager",
          isSystem: false,
          sortOrder: 8,
        },
        {
          name: designationKeys.PRODUCT_MANAGER,
          label: "Product Manager",
          description: "Product management",
          isSystem: false,
          sortOrder: 9,
        },
        {
          name: designationKeys.PROJECT_MANAGER,
          label: "Project Manager",
          description: "Project management",
          isSystem: false,
          sortOrder: 10,
        },
        {
          name: designationKeys.TEAM_LEAD,
          label: "Team Lead",
          description: "Technical team lead",
          isSystem: false,
          sortOrder: 11,
        },

        // Engineering
        {
          name: designationKeys.PRINCIPAL_ENGINEER,
          label: "Principal Engineer",
          description: "Senior technical leadership role",
          isSystem: false,
          sortOrder: 12,
        },
        {
          name: designationKeys.SENIOR_ENGINEER,
          label: "Senior Software Engineer",
          description: "Senior software engineer",
          isSystem: false,
          sortOrder: 13,
        },
        {
          name: designationKeys.SOFTWARE_ENGINEER,
          label: "Software Engineer",
          description: "Software engineer",
          isSystem: false,
          sortOrder: 14,
        },
        {
          name: designationKeys.JUNIOR_ENGINEER,
          label: "Junior Software Engineer",
          description: "Entry-level software engineer",
          isSystem: false,
          sortOrder: 15,
        },
        {
          name: designationKeys.FRONTEND_DEVELOPER,
          label: "Frontend Developer",
          description: "Frontend development specialist",
          isSystem: false,
          sortOrder: 16,
        },
        {
          name: designationKeys.BACKEND_DEVELOPER,
          label: "Backend Developer",
          description: "Backend development specialist",
          isSystem: false,
          sortOrder: 17,
        },
        {
          name: designationKeys.FULLSTACK_DEVELOPER,
          label: "Full Stack Developer",
          description: "Full stack development",
          isSystem: false,
          sortOrder: 18,
        },
        {
          name: designationKeys.MOBILE_DEVELOPER,
          label: "Mobile Developer",
          description: "Mobile app development",
          isSystem: false,
          sortOrder: 19,
        },
        {
          name: designationKeys.DEVOPS_ENGINEER,
          label: "DevOps Engineer",
          description: "DevOps and infrastructure",
          isSystem: false,
          sortOrder: 20,
        },

        // Quality Assurance
        {
          name: designationKeys.QA_MANAGER,
          label: "QA Manager",
          description: "Quality assurance manager",
          isSystem: false,
          sortOrder: 21,
        },
        {
          name: designationKeys.SENIOR_QA_ENGINEER,
          label: "Senior QA Engineer",
          description: "Senior quality assurance engineer",
          isSystem: false,
          sortOrder: 22,
        },
        {
          name: designationKeys.QA_ENGINEER,
          label: "QA Engineer",
          description: "Quality assurance engineer",
          isSystem: false,
          sortOrder: 23,
        },
        {
          name: designationKeys.AUTOMATION_ENGINEER,
          label: "Automation Engineer",
          description: "Test automation engineer",
          isSystem: false,
          sortOrder: 24,
        },

        // Design
        {
          name: designationKeys.DESIGN_MANAGER,
          label: "Design Manager",
          description: "Design team manager",
          isSystem: false,
          sortOrder: 25,
        },
        {
          name: designationKeys.SENIOR_DESIGNER,
          label: "Senior Designer",
          description: "Senior UI/UX designer",
          isSystem: false,
          sortOrder: 26,
        },
        {
          name: designationKeys.UX_DESIGNER,
          label: "UX Designer",
          description: "User experience designer",
          isSystem: false,
          sortOrder: 27,
        },
        {
          name: designationKeys.UI_DESIGNER,
          label: "UI Designer",
          description: "User interface designer",
          isSystem: false,
          sortOrder: 28,
        },
        {
          name: designationKeys.PRODUCT_DESIGNER,
          label: "Product Designer",
          description: "Product design specialist",
          isSystem: false,
          sortOrder: 29,
        },

        // Data & Analytics
        {
          name: designationKeys.DATA_SCIENTIST,
          label: "Data Scientist",
          description: "Data science and analytics",
          isSystem: false,
          sortOrder: 30,
        },
        {
          name: designationKeys.DATA_ENGINEER,
          label: "Data Engineer",
          description: "Data engineering and pipelines",
          isSystem: false,
          sortOrder: 31,
        },
        {
          name: designationKeys.DATA_ANALYST,
          label: "Data Analyst",
          description: "Data analysis and reporting",
          isSystem: false,
          sortOrder: 32,
        },
        {
          name: designationKeys.BI_ANALYST,
          label: "Business Intelligence Analyst",
          description: "Business intelligence and reporting",
          isSystem: false,
          sortOrder: 33,
        },

        // Security
        {
          name: designationKeys.SECURITY_ENGINEER,
          label: "Security Engineer",
          description: "Information security engineer",
          isSystem: false,
          sortOrder: 34,
        },
        {
          name: designationKeys.SECURITY_ANALYST,
          label: "Security Analyst",
          description: "Security analysis and monitoring",
          isSystem: false,
          sortOrder: 35,
        },

        // Sales & Marketing
        {
          name: designationKeys.SALES_MANAGER,
          label: "Sales Manager",
          description: "Sales team manager",
          isSystem: false,
          sortOrder: 36,
        },
        {
          name: designationKeys.ACCOUNT_MANAGER,
          label: "Account Manager",
          description: "Client account management",
          isSystem: false,
          sortOrder: 37,
        },
        {
          name: designationKeys.SALES_EXECUTIVE,
          label: "Sales Executive",
          description: "Sales representative",
          isSystem: false,
          sortOrder: 38,
        },
        {
          name: designationKeys.MARKETING_MANAGER,
          label: "Marketing Manager",
          description: "Marketing team manager",
          isSystem: false,
          sortOrder: 39,
        },
        {
          name: designationKeys.DIGITAL_MARKETER,
          label: "Digital Marketing Specialist",
          description: "Digital marketing specialist",
          isSystem: false,
          sortOrder: 40,
        },

        // Customer Success
        {
          name: designationKeys.CUSTOMER_SUCCESS_MANAGER,
          label: "Customer Success Manager",
          description: "Customer success and retention",
          isSystem: false,
          sortOrder: 41,
        },
        {
          name: designationKeys.SUPPORT_ENGINEER,
          label: "Support Engineer",
          description: "Technical support engineer",
          isSystem: false,
          sortOrder: 42,
        },
        {
          name: designationKeys.CUSTOMER_SUPPORT,
          label: "Customer Support Specialist",
          description: "Customer support representative",
          isSystem: false,
          sortOrder: 43,
        },

        // HR & Operations
        {
          name: designationKeys.HR_MANAGER,
          label: "HR Manager",
          description: "Human resources manager",
          isSystem: false,
          sortOrder: 44,
        },
        {
          name: designationKeys.HR_BUSINESS_PARTNER,
          label: "HR Business Partner",
          description: "Strategic HR business partner",
          isSystem: false,
          sortOrder: 45,
        },
        {
          name: designationKeys.RECRUITER,
          label: "Recruiter",
          description: "Talent acquisition specialist",
          isSystem: false,
          sortOrder: 46,
        },
        {
          name: designationKeys.OPERATIONS_MANAGER,
          label: "Operations Manager",
          description: "Operations manager",
          isSystem: false,
          sortOrder: 47,
        },
        {
          name: designationKeys.OFFICE_MANAGER,
          label: "Office Manager",
          description: "Office administration manager",
          isSystem: false,
          sortOrder: 48,
        },

        // Finance & Legal
        {
          name: designationKeys.FINANCE_MANAGER,
          label: "Finance Manager",
          description: "Finance team manager",
          isSystem: false,
          sortOrder: 49,
        },
        {
          name: designationKeys.ACCOUNTANT,
          label: "Accountant",
          description: "Financial accountant",
          isSystem: false,
          sortOrder: 50,
        },
        {
          name: designationKeys.LEGAL_COUNSEL,
          label: "Legal Counsel",
          description: "Legal advisor and counsel",
          isSystem: false,
          sortOrder: 51,
        },

        // Interns & Entry Level
        {
          name: designationKeys.INTERN,
          label: "Intern",
          description: "Internship position",
          isSystem: false,
          sortOrder: 52,
        },
        {
          name: designationKeys.TRAINEE,
          label: "Trainee",
          description: "Training program participant",
          isSystem: false,
          sortOrder: 53,
        },
      ],
    },
  ];

  // Insert tenant lookup types and lookups
  for (const lookupType of tenantLookupData) {
    // Check if lookup type already exists
    const checkLookupTypeQuery = `
      SELECT id FROM tenant_lookup_types WHERE name = $1
    `;
    const existingLookupType = await tenantPool.query(checkLookupTypeQuery, [
      lookupType.name,
    ]);

    let lookupTypeId: number;

    if (existingLookupType.rows.length > 0) {
      lookupTypeId = existingLookupType.rows[0].id;
      console.log(
        `Tenant ${schemaName}: Lookup type '${lookupType.name}' already exists`
      );
    } else {
      // Insert lookup type
      const insertLookupTypeQuery = `
        INSERT INTO tenant_lookup_types (name, label, "isSystem")
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      const lookupTypeResult = await tenantPool.query(insertLookupTypeQuery, [
        lookupType.name,
        lookupType.label,
        lookupType.isSystem,
      ]);
      lookupTypeId = lookupTypeResult.rows[0].id;
    }

    // Insert lookups for this type
    for (const lookup of lookupType.lookups) {
      // Check if lookup already exists
      const checkLookupQuery = `
        SELECT id FROM tenant_lookups WHERE "lookupTypeId" = $1 AND name = $2
      `;
      const existingLookup = await tenantPool.query(checkLookupQuery, [
        lookupTypeId,
        lookup.name,
      ]);

      if (existingLookup.rows.length === 0) {
        const insertLookupQuery = `
          INSERT INTO tenant_lookups (
            name, 
            label, 
            description, 
            "isSystem", 
            "sortOrder", 
            "lookupTypeId"
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await tenantPool.query(insertLookupQuery, [
          lookup.name,
          lookup.label,
          lookup.description || null,
          lookup.isSystem,
          lookup.sortOrder,
          lookupTypeId,
        ]);
      } else {
        console.log(
          `Tenant ${schemaName}: Lookup '${lookup.name}' already exists`
        );
      }
    }
  }

  console.log(
    `Tenant ${schemaName}: Tenant-specific lookup data seeded successfully`
  );

  // Insert tenant roles into roles table
  const upsertAndFetchTenantRoles = async () => {
    const roleMap: Record<string, number> = {};

    for (const role of tenantRolesData) {
      const roleResult = await tenantPool.query(
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
        const existingResult = await tenantPool.query(
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

  // Insert tenant permissions into permissions table
  const upsertAndFetchTenantPermissions = async () => {
    const permissionMap: Record<string, number> = {};

    for (const permission of tenantPermissionsData) {
      const permissionResult = await tenantPool.query(
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
        const existingResult = await tenantPool.query(
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

  const { getRoleIdByName } = await upsertAndFetchTenantRoles();
  const { getPermissionIdByName } = await upsertAndFetchTenantPermissions();

  // Assign permissions to tenant roles
  const assignPermissionsToTenantRoles = async () => {
    // Define tenant role-permission mappings
    const rolePermissionMappings: Record<string, string[]> = {
      [tenantRoleKeys.TENANT_ADMIN]: [
        // All project permissions
        tenantPermissionKeys.PROJECT_CREATE,
        tenantPermissionKeys.PROJECT_READ,
        tenantPermissionKeys.PROJECT_UPDATE,
        tenantPermissionKeys.PROJECT_DELETE,
      ],
      [tenantRoleKeys.TENANT_MANAGER]: [
        // Project permissions (create, read, update)
        tenantPermissionKeys.PROJECT_CREATE,
        tenantPermissionKeys.PROJECT_READ,
        tenantPermissionKeys.PROJECT_UPDATE,
      ],
      [tenantRoleKeys.TENANT_USER]: [
        // Read-only permissions
        tenantPermissionKeys.PROJECT_READ,
      ],
    };

    // Insert role-permission mappings
    for (const [roleName, permissionNames] of Object.entries(
      rolePermissionMappings
    )) {
      const roleId = getRoleIdByName(roleName);

      for (const permissionName of permissionNames) {
        const permissionId = getPermissionIdByName(permissionName);

        await tenantPool.query(
          `
            INSERT INTO role_permissions_xref ("roleId", "permissionId", "createdAt", "updatedAt")
            VALUES ($1, $2, NOW(), NOW())
            ON CONFLICT ("roleId", "permissionId") DO NOTHING
          `,
          [roleId, permissionId]
        );
      }
    }

    console.log(
      `Tenant ${schemaName}: Tenant role permissions assigned successfully`
    );
  };

  await assignPermissionsToTenantRoles();
}

export async function down(
  tenantPool: Pool,
  schemaName: string
): Promise<void> {
  // Delete tenant lookups
  await tenantPool.query("DELETE FROM tenant_lookups");
  console.log(`Tenant ${schemaName}: Deleted all tenant lookups`);

  // Delete tenant lookup types
  await tenantPool.query("DELETE FROM tenant_lookup_types");
  console.log(`Tenant ${schemaName}: Deleted all tenant lookup types`);
}
