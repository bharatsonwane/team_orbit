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

const lookupTypeKeys = {
  CONTACT_TYPE: "CONTACT_TYPE",
  DEPARTMENT: "DEPARTMENT",
  DESIGNATION: "DESIGNATION",
};

const contactTypeKeys = {
  OFFICIAL_EMAIL: "OFFICIAL_EMAIL",
  PERSONAL_EMAIL: "PERSONAL_EMAIL",
  OFFICIAL_PHONE: "OFFICIAL_PHONE",
  PERSONAL_PHONE: "PERSONAL_PHONE",
  EMERGENCY_PHONE: "EMERGENCY_PHONE",
};

const departmentKeys = {
  DEPARTMENT_ENGINEERING: "DEPARTMENT_ENGINEERING",
  DEPARTMENT_DESIGN: "DEPARTMENT_DESIGN",
  DEPARTMENT_HR: "DEPARTMENT_HR",
  DEPARTMENT_SALES: "DEPARTMENT_SALES",
  DEPARTMENT_MARKETING: "DEPARTMENT_MARKETING",
  DEPARTMENT_FINANCE: "DEPARTMENT_FINANCE",
  DEPARTMENT_OPERATIONS: "DEPARTMENT_OPERATIONS",
};

const designationKeys = {
  DESIGNATION_CEO: "DESIGNATION_CEO",
  DESIGNATION_CTO: "DESIGNATION_CTO",
  DESIGNATION_MANAGER: "DESIGNATION_MANAGER",
  DESIGNATION_SENIOR_DEVELOPER: "DESIGNATION_SENIOR_DEVELOPER",
  DESIGNATION_DEVELOPER: "DESIGNATION_DEVELOPER",
  DESIGNATION_JUNIOR_DEVELOPER: "DESIGNATION_JUNIOR_DEVELOPER",
  DESIGNATION_DESIGNER: "DESIGNATION_DESIGNER",
  DESIGNATION_HR: "DESIGNATION_HR",
};

export async function up(tenantPool: Pool, tenantId: string): Promise<void> {
  // Define tenant-specific lookup types and their values
  const tenantLookupData: TenantLookupType[] = [
    {
      name: lookupTypeKeys.CONTACT_TYPE,
      label: "Contact Type",
      isSystem: true,
      lookups: [
        {
          name: contactTypeKeys.OFFICIAL_EMAIL,
          label: "Official Email",
          description: "Official work email address",
          isSystem: true,
          sortOrder: 1,
        },
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
          name: contactTypeKeys.EMERGENCY_PHONE,
          label: "Emergency Phone",
          description: "Emergency contact phone number",
          isSystem: true,
          sortOrder: 4,
        },
      ],
    },
    {
      name: lookupTypeKeys.DEPARTMENT,
      label: "Department",
      isSystem: true,
      lookups: [
        {
          name: departmentKeys.DEPARTMENT_ENGINEERING,
          label: "Engineering",
          description: "Software engineering department",
          isSystem: false,
          sortOrder: 1,
        },
        {
          name: departmentKeys.DEPARTMENT_DESIGN,
          label: "Design",
          description: "UI/UX design department",
          isSystem: false,
          sortOrder: 2,
        },
        {
          name: departmentKeys.DEPARTMENT_HR,
          label: "Human Resources",
          description: "HR department",
          isSystem: false,
          sortOrder: 3,
        },
        {
          name: departmentKeys.DEPARTMENT_SALES,
          label: "Sales",
          description: "Sales department",
          isSystem: false,
          sortOrder: 4,
        },
        {
          name: departmentKeys.DEPARTMENT_MARKETING,
          label: "Marketing",
          description: "Marketing department",
          isSystem: false,
          sortOrder: 5,
        },
        {
          name: departmentKeys.DEPARTMENT_FINANCE,
          label: "Finance",
          description: "Finance and accounting",
          isSystem: false,
          sortOrder: 6,
        },
        {
          name: departmentKeys.DEPARTMENT_OPERATIONS,
          label: "Operations",
          description: "Operations department",
          isSystem: false,
          sortOrder: 7,
        },
      ],
    },
    {
      name: lookupTypeKeys.DESIGNATION,
      label: "Designation",
      isSystem: true,
      lookups: [
        {
          name: designationKeys.DESIGNATION_CEO,
          label: "Chief Executive Officer",
          description: "Top executive position",
          isSystem: false,
          sortOrder: 1,
        },
        {
          name: designationKeys.DESIGNATION_CTO,
          label: "Chief Technology Officer",
          description: "Head of technology",
          isSystem: false,
          sortOrder: 2,
        },
        {
          name: designationKeys.DESIGNATION_MANAGER,
          label: "Manager",
          description: "Team manager",
          isSystem: false,
          sortOrder: 3,
        },
        {
          name: designationKeys.DESIGNATION_SENIOR_DEVELOPER,
          label: "Senior Developer",
          description: "Senior software developer",
          isSystem: false,
          sortOrder: 4,
        },
        {
          name: designationKeys.DESIGNATION_DEVELOPER,
          label: "Developer",
          description: "Software developer",
          isSystem: false,
          sortOrder: 5,
        },
        {
          name: designationKeys.DESIGNATION_JUNIOR_DEVELOPER,
          label: "Junior Developer",
          description: "Entry-level developer",
          isSystem: false,
          sortOrder: 6,
        },
        {
          name: designationKeys.DESIGNATION_DESIGNER,
          label: "Designer",
          description: "UI/UX Designer",
          isSystem: false,
          sortOrder: 7,
        },
        {
          name: designationKeys.DESIGNATION_HR,
          label: "HR Specialist",
          description: "Human Resources",
          isSystem: false,
          sortOrder: 8,
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
        `Tenant ${tenantId}: Lookup type '${lookupType.name}' already exists`
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
      console.log(
        `Tenant ${tenantId}: Created lookup type '${lookupType.name}' with id ${lookupTypeId}`
      );
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
        console.log(
          `Tenant ${tenantId}: Created lookup '${lookup.name}' under type '${lookupType.name}'`
        );
      } else {
        console.log(
          `Tenant ${tenantId}: Lookup '${lookup.name}' already exists`
        );
      }
    }
  }

  console.log(
    `Tenant ${tenantId}: Tenant-specific lookup data seeded successfully`
  );
}

export async function down(tenantPool: Pool, tenantId: string): Promise<void> {
  // Delete tenant lookups
  await tenantPool.query("DELETE FROM tenant_lookups");
  console.log(`Tenant ${tenantId}: Deleted all tenant lookups`);

  // Delete tenant lookup types
  await tenantPool.query("DELETE FROM tenant_lookup_types");
  console.log(`Tenant ${tenantId}: Deleted all tenant lookup types`);
}
