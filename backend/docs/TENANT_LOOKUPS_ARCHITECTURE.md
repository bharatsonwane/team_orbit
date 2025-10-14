# Tenant-Specific Lookups Architecture

## 🏗️ Overview

This document explains the **hybrid lookups system** that manages both platform-wide and tenant-specific lookup values.

---

## 📊 Architecture Design

### **Two-Tier Lookup System**

```
┌─────────────────────────────────────────────────────────────┐
│                      MAIN SCHEMA                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  lookup_types (Platform-wide)                      │     │
│  │  - USER_ROLE                                       │     │
│  │  - USER_STATUS                                     │     │
│  │  - CONTACT_TYPE                                    │     │
│  └────────────────────────────────────────────────────┘     │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  lookups (Platform-wide values)                    │     │
│  │  - PLATFORM_ADMIN, TENANT_ADMIN                    │     │
│  │  - ACTIVE, PENDING, INACTIVE                       │     │
│  │  - OFFICIAL_EMAIL, PERSONAL_EMAIL                  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   TENANT SCHEMA (tenant_1)                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  tenant_lookup_types (Tenant-specific)             │     │
│  │  - DESIGNATION                                     │     │
│  │  - DEPARTMENT                                      │     │
│  │  - EMPLOYMENT_TYPE                                 │     │
│  └────────────────────────────────────────────────────┘     │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  tenant_lookups (Tenant-specific values)           │     │
│  │  - CEO, Manager, Developer                         │     │
│  │  - Engineering, HR, Sales                          │     │
│  │  - Full-time, Part-time, Contract                  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Decision Matrix: Which Schema?

| Lookup Type | Schema | Reason |
|-------------|--------|--------|
| **User Roles** | Main | Platform-wide authorization |
| **User Status** | Main | Consistent user states across platform |
| **Contact Types** | Main | Standardized contact categories |
| **Designations** | Tenant | Each company has different job titles |
| **Departments** | Tenant | Organization-specific structure |
| **Employment Types** | Tenant | Company-specific employment contracts |
| **Custom Fields** | Tenant | Tenant-specific business needs |

---

## 📋 Database Schema

### **Main Schema Tables**

```sql
-- Platform-wide lookups (already exists)
main.lookup_types
main.lookups
```

### **Tenant Schema Tables**

```sql
-- Tenant-specific lookup types
CREATE TABLE tenant_lookup_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    "isSystem" BOOLEAN NOT NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    -- tracking fields...
);

-- Tenant-specific lookup values
CREATE TABLE tenant_lookups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    "isSystem" BOOLEAN DEFAULT FALSE NOT NULL,
    "sortOrder" INT DEFAULT 0 NOT NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "lookupTypeId" INT NOT NULL,
    -- tracking fields...
    CONSTRAINT fk_tenant_lookups_tenant_lookup_types 
        FOREIGN KEY ("lookupTypeId") REFERENCES tenant_lookup_types (id)
);
```

---

## 🔧 Updated Job Details Table

### **Hybrid Approach**

```sql
CREATE TABLE user_job_details (
    id SERIAL PRIMARY KEY,
    "userId" INT NOT NULL,
    
    -- Foreign keys to tenant lookups
    "designationId" INT,
    "departmentId" INT,
    
    -- Legacy VARCHAR fields (for backward compatibility)
    "designation" VARCHAR(255),
    "department" VARCHAR(255),
    
    -- Other fields...
    "hiringDate" DATE,
    "joiningDate" DATE,
    
    CONSTRAINT fk_user_job_details_designation 
        FOREIGN KEY ("designationId") REFERENCES tenant_lookups (id),
    CONSTRAINT fk_user_job_details_department 
        FOREIGN KEY ("departmentId") REFERENCES tenant_lookups (id)
);
```

**Migration Path:**
1. ✅ Add new ID columns alongside VARCHAR columns
2. ✅ Populate tenant lookups
3. ✅ Frontend can use either approach during transition
4. ⏭️ Later: Migrate data from VARCHAR to ID references
5. ⏭️ Finally: Remove VARCHAR columns

---

## 🎨 Usage Examples

### **1. Creating Tenant Lookups (Tenant Admin)**

```typescript
// Backend Service
class TenantLookupService {
  static async createTenantLookup(
    tenantPool: Pool,
    data: {
      lookupTypeId: number;
      name: string;
      label: string;
      description?: string;
    }
  ) {
    const result = await tenantPool.query(
      `INSERT INTO tenant_lookups 
       (name, label, description, "lookupTypeId", "isSystem", "sortOrder")
       VALUES ($1, $2, $3, $4, false, 
         (SELECT COALESCE(MAX("sortOrder"), 0) + 1 
          FROM tenant_lookups WHERE "lookupTypeId" = $4)
       )
       RETURNING *`,
      [data.name, data.label, data.description, data.lookupTypeId]
    );
    return result.rows[0];
  }
}
```

---

### **2. Fetching Tenant Lookups (Dropdown)**

```typescript
// Backend Service
static async getTenantLookupsByType(
  tenantPool: Pool,
  lookupTypeName: string
) {
  const result = await tenantPool.query(
    `SELECT l.id, l.name, l.label, l.description, l."sortOrder"
     FROM tenant_lookups l
     INNER JOIN tenant_lookup_types lt ON l."lookupTypeId" = lt.id
     WHERE lt.name = $1 AND l."isArchived" = false
     ORDER BY l."sortOrder" ASC`,
    [lookupTypeName]
  );
  return result.rows;
}

// Frontend API Call
const designations = await api.get(`/api/tenant/${tenantId}/lookups/DESIGNATION`);
// Returns: [
//   { id: 1, name: "DESIGNATION_CEO", label: "CEO", ... },
//   { id: 2, name: "DESIGNATION_MANAGER", label: "Manager", ... }
// ]
```

---

### **3. Saving Job Details with Lookups**

```typescript
// Backend Service
static async saveUserJobDetails(
  tenantPool: Pool,
  userId: number,
  jobData: {
    designationId?: number;  // ✅ Use lookup ID
    departmentId?: number;   // ✅ Use lookup ID
    designation?: string;    // Legacy support
    department?: string;     // Legacy support
    // ... other fields
  }
) {
  await tenantPool.query(
    `INSERT INTO user_job_details (
      "userId", "designationId", "departmentId", 
      "designation", "department", ...
    )
    VALUES ($1, $2, $3, $4, $5, ...)`,
    [
      userId,
      jobData.designationId || null,
      jobData.departmentId || null,
      jobData.designation || null,
      jobData.department || null,
      // ...
    ]
  );
}
```

---

### **4. Retrieving Job Details with Lookup Labels**

```sql
SELECT 
  ujd."userId",
  ujd."hiringDate",
  ujd."joiningDate",
  ujd."designationId",
  des.label as "designationLabel",
  ujd."departmentId",
  dep.label as "departmentLabel",
  -- Legacy fallback
  COALESCE(des.label, ujd."designation") as "designation",
  COALESCE(dep.label, ujd."department") as "department"
FROM user_job_details ujd
LEFT JOIN tenant_lookups des ON ujd."designationId" = des.id
LEFT JOIN tenant_lookups dep ON ujd."departmentId" = dep.id
WHERE ujd."userId" = $1;
```

---

## 🔄 Frontend Integration

### **Updated Job Details Schema**

```typescript
// frontend/src/schemas/user.ts
export const userJobDetailsSchema = z.object({
  hiringDate: z.string().optional().or(z.literal("")),
  joiningDate: z.string().optional().or(z.literal("")),
  probationPeriodMonths: z.string().optional().or(z.literal("")),
  designationId: z.string().optional().or(z.literal("")),  // ✅ Lookup ID
  departmentId: z.string().optional().or(z.literal("")),   // ✅ Lookup ID
  designation: z.string().optional().or(z.literal("")),    // Legacy
  department: z.string().optional().or(z.literal("")),     // Legacy
  employeeId: z.string().optional().or(z.literal("")),
  ctc: z.string().optional().or(z.literal("")),
  reportingManagerId: z.string().optional().or(z.literal("")),
});
```

### **Updated Job Details Component**

```tsx
// frontend/src/components/forms/UserJobDetails.tsx
export const UserJobDetails = ({ register, errors, control, tenantId }) => {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  useEffect(() => {
    // Fetch tenant-specific lookups
    fetchTenantLookups(tenantId, "DESIGNATION").then(setDesignations);
    fetchTenantLookups(tenantId, "DEPARTMENT").then(setDepartments);
  }, [tenantId]);
  
  return (
    <div>
      {/* Use SelectWithLabel for lookups */}
      <SelectWithLabel
        id="job.designationId"
        label="Designation"
        register={register}
        error={jobErrors.designationId?.message}
      >
        <option value="">Select designation</option>
        {designations.map(d => (
          <option key={d.id} value={d.id}>{d.label}</option>
        ))}
      </SelectWithLabel>
      
      <SelectWithLabel
        id="job.departmentId"
        label="Department"
        register={register}
        error={jobErrors.departmentId?.message}
      >
        <option value="">Select department</option>
        {departments.map(d => (
          <option key={d.id} value={d.id}>{d.label}</option>
        ))}
      </SelectWithLabel>
    </div>
  );
};
```

---

## 🚀 Benefits of This Approach

| Benefit | Description |
|---------|-------------|
| **🏢 Tenant Isolation** | Each tenant manages their own lookups |
| **🎯 Data Integrity** | Foreign key constraints ensure valid references |
| **♻️ Reusability** | Same architecture as main lookups |
| **📊 Reporting** | Easy to aggregate/report on standardized values |
| **🔄 Flexibility** | Tenants can add/edit their own values |
| **🛡️ Validation** | Database enforces valid selections |
| **📝 Maintainability** | Clear separation of platform vs tenant data |
| **⚡ Performance** | Integer FKs faster than string comparisons |

---

## 🔀 Alternative Approaches (Not Recommended)

### **❌ Option B: Add tenantId to Main Lookups**

```sql
ALTER TABLE main.lookups ADD COLUMN "tenantId" INT;
```

**Pros:**
- Single table for all lookups

**Cons:**
- ❌ Mixes platform and tenant data
- ❌ Requires tenantId filtering in every query
- ❌ Potential for data leakage between tenants
- ❌ Hard to enforce tenant isolation
- ❌ Complicates platform-wide lookups

---

### **❌ Option C: Keep as VARCHAR (Current)**

```sql
"designation" VARCHAR(255),
"department" VARCHAR(255)
```

**Pros:**
- Simple to implement

**Cons:**
- ❌ No validation (typos possible)
- ❌ No referential integrity
- ❌ Hard to standardize across organization
- ❌ Difficult to create dropdowns
- ❌ No reporting consistency
- ❌ Can't enforce business rules

---

## 📝 Migration Path

### **Phase 1: Add Tenant Lookup Tables** ✅ **Done**
- Created `tenant_lookup_types`
- Created `tenant_lookups`
- Added foreign key columns to `user_job_details`
- Kept legacy VARCHAR columns for backward compatibility

### **Phase 2: Seed Initial Data** ✅ **Done**
- Migration file: `002-tenant-initial-lookup-data.ts`
- Seeds DESIGNATION and DEPARTMENT lookups
- Runs for each tenant schema

### **Phase 3: Update Backend APIs** ⏭️ **Next**
- Create tenant lookup service
- Add endpoints for CRUD operations
- Update `saveUserJobDetails` to accept IDs
- Update `getUserJobDetails` to return lookup labels

### **Phase 4: Update Frontend** ⏭️ **Next**
- Fetch tenant lookups for dropdowns
- Update UserJobDetails component
- Use lookup IDs instead of free text
- Update schemas

### **Phase 5: Data Migration** ⏭️ **Later**
- Script to convert existing VARCHAR data to lookup IDs
- Verify all data migrated
- Remove legacy VARCHAR columns

---

## 🎨 API Endpoints to Implement

```typescript
// Tenant Lookup Management
GET    /api/tenant/:tenantId/lookups/:lookupType
POST   /api/tenant/:tenantId/lookups
PUT    /api/tenant/:tenantId/lookups/:id
DELETE /api/tenant/:tenantId/lookups/:id

// Tenant Lookup Types (Admin only)
GET    /api/tenant/:tenantId/lookup-types
POST   /api/tenant/:tenantId/lookup-types
PUT    /api/tenant/:tenantId/lookup-types/:id
DELETE /api/tenant/:tenantId/lookup-types/:id
```

---

## 🔍 Example Queries

### **Get All Designations for a Tenant**

```sql
SELECT 
  l.id,
  l.name,
  l.label,
  l.description,
  l."sortOrder"
FROM tenant_lookups l
INNER JOIN tenant_lookup_types lt ON l."lookupTypeId" = lt.id
WHERE lt.name = 'DESIGNATION' 
  AND l."isArchived" = false
ORDER BY l."sortOrder" ASC;
```

### **Get User Job Details with Lookup Labels**

```sql
SELECT 
  ujd."userId",
  ujd."hiringDate",
  ujd."joiningDate",
  ujd."designationId",
  des.label as "designationLabel",
  ujd."departmentId",
  dep.label as "departmentLabel",
  ujd."employeeId",
  ujd."ctc",
  ujd."reportingManagerId"
FROM user_job_details ujd
LEFT JOIN tenant_lookups des ON ujd."designationId" = des.id
LEFT JOIN tenant_lookups dep ON ujd."departmentId" = dep.id
WHERE ujd."userId" = $1;
```

### **Create New Designation**

```sql
INSERT INTO tenant_lookups (
  name, 
  label, 
  description, 
  "lookupTypeId",
  "sortOrder"
)
VALUES (
  'DESIGNATION_SENIOR_ARCHITECT',
  'Senior Software Architect',
  'Experienced architect role',
  (SELECT id FROM tenant_lookup_types WHERE name = 'DESIGNATION'),
  (SELECT COALESCE(MAX("sortOrder"), 0) + 1 
   FROM tenant_lookups 
   WHERE "lookupTypeId" = (SELECT id FROM tenant_lookup_types WHERE name = 'DESIGNATION'))
)
RETURNING *;
```

---

## 🎁 Benefits Summary

### **For Platform Administrators:**
- ✅ Consistent platform-wide values (roles, statuses)
- ✅ Single source of truth for system values
- ✅ Easy to update system lookups for all tenants

### **For Tenant Administrators:**
- ✅ Full control over their business-specific lookups
- ✅ Can add/edit designations, departments as needed
- ✅ No impact on other tenants
- ✅ Customize to their organizational structure

### **For Developers:**
- ✅ Clear separation of concerns
- ✅ Type-safe with foreign key constraints
- ✅ Same pattern as main lookups (familiar)
- ✅ Easy to extend with new lookup types

### **For Data Integrity:**
- ✅ Referential integrity enforced by database
- ✅ No typos or inconsistent values
- ✅ Soft delete support (isArchived)
- ✅ Audit trail (createdBy, updatedBy)

---

## 🚦 Next Steps

1. **Run migrations** to create tenant lookup tables
2. **Create TenantLookupService** for CRUD operations
3. **Add API endpoints** for managing tenant lookups
4. **Update frontend components** to use lookup dropdowns
5. **Test with multiple tenants** to ensure isolation
6. **Document for tenant admins** how to manage their lookups

---

## 💡 Future Enhancements

- **Custom Lookup Types**: Allow tenants to create their own lookup types
- **Lookup Import/Export**: Bulk import designations from CSV
- **Lookup Templates**: Pre-built sets for different industries
- **Lookup Analytics**: Track which lookups are most used
- **Lookup Versioning**: Track changes to lookup values over time

---

## ✅ Validation Checklist

- ✅ Tables created in tenant schema
- ✅ Foreign key constraints added
- ✅ Initial data migration file ready
- ✅ Legacy VARCHAR fields preserved
- ✅ Clear migration path defined
- ✅ Documentation complete

Your multi-tenant lookup system is now ready for implementation! 🎉

