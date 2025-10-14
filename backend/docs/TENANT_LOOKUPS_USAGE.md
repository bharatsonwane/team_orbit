# Tenant-Specific Lookups - Usage Guide

## 🚀 Quick Start

This guide shows you how to use the tenant-specific lookups system for managing designations, departments, and other tenant-specific values.

---

## 📋 Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Common Use Cases](#common-use-cases)
3. [Frontend Integration](#frontend-integration)
4. [Migration Guide](#migration-guide)

---

## 🔌 API Endpoints

### **1. Get Tenant Lookup Types**

```http
GET /api/tenant/:tenantId/lookup-types
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "DESIGNATION",
      "label": "Designation",
      "isSystem": true
    },
    {
      "id": 2,
      "name": "DEPARTMENT",
      "label": "Department",
      "isSystem": true
    }
  ]
}
```

---

### **2. Get Lookups by Type**

```http
GET /api/tenant/:tenantId/lookups/:lookupType
```

**Example: Get all designations**
```http
GET /api/tenant/2/lookups/DESIGNATION
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "DESIGNATION_CEO",
      "label": "Chief Executive Officer",
      "description": "Top executive position",
      "sortOrder": 1,
      "lookupTypeId": 1
    },
    {
      "id": 2,
      "name": "DESIGNATION_DEVELOPER",
      "label": "Developer",
      "description": "Software developer",
      "sortOrder": 5,
      "lookupTypeId": 1
    }
  ]
}
```

---

### **3. Get All Tenant Lookups**

```http
GET /api/tenant/:tenantId/lookups
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "DESIGNATION_CEO",
      "label": "CEO",
      "lookupTypeName": "DESIGNATION",
      "lookupTypeLabel": "Designation",
      "sortOrder": 1
    },
    {
      "id": 10,
      "name": "DEPARTMENT_ENGINEERING",
      "label": "Engineering",
      "lookupTypeName": "DEPARTMENT",
      "lookupTypeLabel": "Department",
      "sortOrder": 1
    }
  ]
}
```

---

### **4. Create New Lookup**

```http
POST /api/tenant/:tenantId/lookups
```

**Request Body:**
```json
{
  "lookupTypeId": 1,
  "name": "DESIGNATION_SENIOR_ARCHITECT",
  "label": "Senior Software Architect",
  "description": "Experienced architect role"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "name": "DESIGNATION_SENIOR_ARCHITECT",
    "label": "Senior Software Architect",
    "description": "Experienced architect role",
    "sortOrder": 9,
    "lookupTypeId": 1
  },
  "message": "Tenant lookup created successfully"
}
```

---

### **5. Update Lookup**

```http
PUT /api/tenant/:tenantId/lookups/:id
```

**Request Body:**
```json
{
  "label": "Chief Technology Officer",
  "description": "Updated description",
  "sortOrder": 2
}
```

---

### **6. Delete Lookup (Soft Delete)**

```http
DELETE /api/tenant/:tenantId/lookups/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Tenant lookup deleted successfully"
}
```

**Note:** System lookups (`isSystem: true`) cannot be deleted.

---

## 🎯 Common Use Cases

### **Use Case 1: Populate Designation Dropdown**

```typescript
// Frontend component
const [designations, setDesignations] = useState([]);

useEffect(() => {
  const fetchDesignations = async () => {
    const response = await api.get(
      `/api/tenant/${tenantId}/lookups/DESIGNATION`
    );
    setDesignations(response.data.data);
  };
  fetchDesignations();
}, [tenantId]);

// In JSX
<SelectWithLabel id="job.designationId" label="Designation">
  <option value="">Select designation</option>
  {designations.map(d => (
    <option key={d.id} value={d.id}>{d.label}</option>
  ))}
</SelectWithLabel>
```

---

### **Use Case 2: Tenant Admin Adds Custom Designation**

```typescript
// Admin panel
const addDesignation = async (data) => {
  const response = await api.post(`/api/tenant/${tenantId}/lookups`, {
    lookupTypeId: 1, // DESIGNATION lookup type ID
    name: `DESIGNATION_${data.label.toUpperCase().replace(/\s+/g, "_")}`,
    label: data.label,
    description: data.description,
  });
  
  toast.success("Designation added successfully");
  refreshDesignations();
};
```

---

### **Use Case 3: Save Job Details with Lookup References**

```typescript
// Frontend - Submit job details
const jobData = {
  hiringDate: "2024-01-15",
  joiningDate: "2024-02-01",
  designationId: 5,      // ✅ Reference to tenant_lookups
  departmentId: 10,      // ✅ Reference to tenant_lookups
  employeeId: "EMP001",
  ctc: 1200000,
  reportingManagerId: 23,
};

await api.post(`/api/user/${userId}/job-details`, jobData);
```

---

### **Use Case 4: Retrieve Job Details with Labels**

```typescript
// Backend service method
static async getUserJobDetails(
  tenantPool: Pool,
  userId: number
) {
  const result = await tenantPool.query(
    `SELECT 
      ujd."userId",
      TO_CHAR(ujd."hiringDate", 'YYYY-MM-DD') as "hiringDate",
      TO_CHAR(ujd."joiningDate", 'YYYY-MM-DD') as "joiningDate",
      ujd."probationPeriodMonths",
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
     WHERE ujd."userId" = $1`,
    [userId]
  );
  return result.rows[0];
}
```

**Response:**
```json
{
  "userId": 5,
  "hiringDate": "2024-01-15",
  "joiningDate": "2024-02-01",
  "designationId": 5,
  "designationLabel": "Senior Developer",
  "departmentId": 10,
  "departmentLabel": "Engineering",
  "employeeId": "EMP001",
  "ctc": 1200000
}
```

---

## 🎨 Frontend Integration

### **Step 1: Create Tenant Lookup Hook**

```typescript
// hooks/useTenantLookups.ts
import { useState, useEffect } from "react";
import { api } from "@/utils/api";

export const useTenantLookups = (tenantId: number, lookupType: string) => {
  const [lookups, setLookups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/api/tenant/${tenantId}/lookups/${lookupType}`
        );
        setLookups(response.data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId && lookupType) {
      fetchLookups();
    }
  }, [tenantId, lookupType]);

  return { lookups, loading, error };
};
```

---

### **Step 2: Update UserJobDetails Component**

```typescript
// components/forms/UserJobDetails.tsx
export const UserJobDetails = ({ register, errors, control, tenantId }) => {
  const { lookups: designations, loading: loadingDesignations } = 
    useTenantLookups(tenantId, "DESIGNATION");
  const { lookups: departments, loading: loadingDepartments } = 
    useTenantLookups(tenantId, "DEPARTMENT");

  return (
    <div className="grid grid-cols-2 gap-4">
      <SelectWithLabel
        id="job.designationId"
        label="Designation"
        register={register}
        error={jobErrors.designationId?.message}
        disabled={loadingDesignations}
      >
        <option value="">
          {loadingDesignations ? "Loading..." : "Select designation"}
        </option>
        {designations.map(d => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </SelectWithLabel>

      <SelectWithLabel
        id="job.departmentId"
        label="Department"
        register={register}
        error={jobErrors.departmentId?.message}
        disabled={loadingDepartments}
      >
        <option value="">
          {loadingDepartments ? "Loading..." : "Select department"}
        </option>
        {departments.map(d => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </SelectWithLabel>
    </div>
  );
};
```

---

### **Step 3: Update Frontend Schemas**

```typescript
// schemas/user.ts
export const userJobDetailsSchema = z.object({
  hiringDate: z.string().optional().or(z.literal("")),
  joiningDate: z.string().optional().or(z.literal("")),
  probationPeriodMonths: z.string().optional().or(z.literal("")),
  designationId: z.string().optional().or(z.literal("")),  // ✅ Lookup ID
  departmentId: z.string().optional().or(z.literal("")),   // ✅ Lookup ID
  employeeId: z.string().optional().or(z.literal("")),
  ctc: z.string().optional().or(z.literal("")),
  reportingManagerId: z.string().optional().or(z.literal("")),
});
```

---

## 🔄 Migration Guide

### **Current State → Target State**

**Current (VARCHAR):**
```json
{
  "designation": "Senior Developer",  // ❌ Free text
  "department": "Engineering"         // ❌ Free text
}
```

**Target (Lookup IDs):**
```json
{
  "designationId": 5,      // ✅ References tenant_lookups.id
  "departmentId": 10       // ✅ References tenant_lookups.id
}
```

**With Both (Transition):**
```json
{
  "designationId": 5,
  "designationLabel": "Senior Developer",  // From JOIN
  "designation": "Senior Developer",       // Legacy fallback
  "departmentId": 10,
  "departmentLabel": "Engineering",        // From JOIN
  "department": "Engineering"              // Legacy fallback
}
```

---

### **Migration Steps**

#### **Phase 1: Database** ✅ **Complete**
```bash
# Tables created in tenant schema
✅ tenant_lookup_types
✅ tenant_lookups
✅ user_job_details updated with designationId, departmentId
```

#### **Phase 2: Seed Data** ✅ **Complete**
```bash
# Run migrations
npm run migrate

# Seeds:
✅ DESIGNATION lookup type with common designations
✅ DEPARTMENT lookup type with common departments
```

#### **Phase 3: Backend APIs** ✅ **Complete**
```bash
✅ TenantLookupService created
✅ TenantLookupController created
✅ Routes registered
✅ OpenAPI docs generated
```

#### **Phase 4: Frontend Updates** ⏭️ **Next**
```bash
⏭️ Create useTenantLookups hook
⏭️ Update UserJobDetails component
⏭️ Update schemas
⏭️ Update Redux actions
⏭️ Add Tenant Admin UI for managing lookups
```

#### **Phase 5: Data Migration** ⏭️ **Later**
```bash
⏭️ Script to migrate existing VARCHAR values to lookup IDs
⏭️ Verify data integrity
⏭️ Remove legacy VARCHAR columns
```

---

## 🎯 System vs Custom Lookups

### **System Lookups (isSystem: true)**

**Characteristics:**
- ✅ Created during initial migration
- ✅ Cannot be deleted by tenant admins
- ✅ Provide baseline values
- ❌ Cannot be archived

**Examples:**
- Common designations (CEO, Manager, Developer)
- Standard departments (HR, Engineering, Sales)

---

### **Custom Lookups (isSystem: false)**

**Characteristics:**
- ✅ Created by tenant admins
- ✅ Can be edited by tenant admins
- ✅ Can be archived/deleted
- ✅ Tenant-specific business needs

**Examples:**
- "Principal Architect" (custom designation)
- "Customer Success" (custom department)
- Company-specific job titles

---

## 📊 Comparison: Main vs Tenant Lookups

| Feature | Main Lookups | Tenant Lookups |
|---------|--------------|----------------|
| **Scope** | Platform-wide | Tenant-specific |
| **Examples** | User Roles, User Status | Designations, Departments |
| **Modified By** | Platform Admin | Tenant Admin |
| **Shared Across Tenants** | Yes | No |
| **Foreign Keys From** | Main schema tables | Tenant schema tables |
| **Use Case** | Authorization, System states | Business-specific values |

---

## 🎨 Admin UI Examples

### **Manage Designations Page**

```tsx
import { useTenantLookups } from "@/hooks/useTenantLookups";

export const ManageDesignations = ({ tenantId }) => {
  const { lookups, loading, refresh } = useTenantLookups(tenantId, "DESIGNATION");
  
  const handleAdd = async (data) => {
    await api.post(`/api/tenant/${tenantId}/lookups`, {
      lookupTypeId: 1, // DESIGNATION
      name: `DESIGNATION_${data.label.toUpperCase().replace(/\s+/g, "_")}`,
      label: data.label,
      description: data.description,
    });
    refresh();
  };
  
  const handleEdit = async (id, data) => {
    await api.put(`/api/tenant/${tenantId}/lookups/${id}`, data);
    refresh();
  };
  
  const handleDelete = async (id) => {
    await api.delete(`/api/tenant/${tenantId}/lookups/${id}`);
    refresh();
  };
  
  return (
    <div>
      <h2>Manage Designations</h2>
      <Button onClick={() => setShowAddModal(true)}>
        Add Designation
      </Button>
      
      <Table>
        <thead>
          <tr>
            <th>Label</th>
            <th>Description</th>
            <th>Order</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {lookups.map(lookup => (
            <tr key={lookup.id}>
              <td>{lookup.label}</td>
              <td>{lookup.description}</td>
              <td>{lookup.sortOrder}</td>
              <td>
                <Button onClick={() => handleEdit(lookup.id, ...)}>
                  Edit
                </Button>
                {!lookup.isSystem && (
                  <Button onClick={() => handleDelete(lookup.id)}>
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};
```

---

## 🔐 Permissions

### **Who Can Manage Tenant Lookups?**

| Action | Platform Admin | Tenant Admin | Tenant User |
|--------|----------------|--------------|-------------|
| View lookups | ✅ | ✅ | ✅ |
| Create custom lookups | ✅ | ✅ | ❌ |
| Edit custom lookups | ✅ | ✅ | ❌ |
| Delete custom lookups | ✅ | ✅ | ❌ |
| Edit system lookups | ✅ | ❌ | ❌ |
| Delete system lookups | ❌ | ❌ | ❌ |

---

## 🐛 Troubleshooting

### **Issue: Lookups not showing in dropdown**

**Solution:**
1. Check if migrations ran for tenant schema
2. Verify tenant lookup data was seeded
3. Check API endpoint returns data
4. Verify tenantId is correct

```bash
# Check if tables exist
psql -d your_db -c "\dt tenant_1.*"

# Check if data exists
psql -d your_db -c "SELECT * FROM tenant_1.tenant_lookup_types;"
psql -d your_db -c "SELECT * FROM tenant_1.tenant_lookups;"
```

---

### **Issue: Cannot delete lookup (system lookup error)**

**Solution:**
System lookups have `isSystem: true` and cannot be deleted. Only custom lookups created by tenant admins can be deleted.

```sql
-- Check if lookup is system
SELECT "isSystem" FROM tenant_lookups WHERE id = 5;
```

---

### **Issue: Foreign key constraint error when saving job details**

**Solution:**
Ensure the `designationId` and `departmentId` exist in `tenant_lookups` table.

```sql
-- Verify lookup exists
SELECT id, label FROM tenant_lookups WHERE id = 5;
```

---

## 📝 Best Practices

1. **Always use lookup IDs** instead of free text when saving
2. **Fetch lookups once** and cache in Redux/context
3. **Show both ID and label** in admin UI for debugging
4. **Validate lookup IDs** on backend before saving
5. **Handle missing lookups gracefully** with LEFT JOINs
6. **Use sortOrder** to control dropdown order
7. **Set isSystem: true** for baseline values

---

## ✅ Checklist for Implementation

- ✅ Database tables created
- ✅ Migrations run successfully
- ✅ Initial lookup data seeded
- ✅ Backend service created
- ✅ API endpoints registered
- ⏭️ Frontend hook created
- ⏭️ Components updated to use lookups
- ⏭️ Admin UI for managing lookups
- ⏭️ End-to-end testing completed

---

## 🎉 You're Ready!

Your tenant-specific lookups system is now set up and ready to use. Each tenant can now manage their own designations, departments, and other business-specific values while maintaining platform-wide consistency for system values.

For questions or issues, refer to:
- `TENANT_LOOKUPS_ARCHITECTURE.md` - Detailed architecture
- `DATABASE_QUERY_OPTIMIZATION.md` - Query patterns
- Platform admin documentation

