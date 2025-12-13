# Schema Migration: email → authEmail

## 🎯 Overview

Successfully migrated all schemaAndTypes and code from using generic `email` field to the more specific `authEmail` field for authentication purposes.

## 📊 Changes Made

### **1. Backend Schema** (`backend/src/schemaAndTypes/user.schema.ts`)

#### Before:
```typescript
export const baseUserSchema = z.object({
  // ...
  email: z.string().email("Invalid email"),
  // ...
});
```

#### After:
```typescript
export const baseUserSchema = z.object({
  // ...
  authEmail: z.string().email("Invalid email"),
  // ...
});
```

---

### **2. Service Layer** (`backend/src/services/user.service.ts`)

#### Updated:
```typescript
// Now uses imported schema types
import {
  SaveUserContactsSchema,     // ← Uses authEmail in validation
  SaveUserJobDetailsSchema,   // ← Job details schema
} from "../schemaAndTypes/user.schema";

// Method signatures now reference schema types
static async saveUserContacts(
  dbClient: dbClientPool,
  { userId, contactData }: { 
    userId: number; 
    contactData: SaveUserContactsSchema;  // ← Type from schema
  }
): Promise<void>

// Using authEmail from userData
await dbClientPool.mainPool.query(authInsertQuery, [
  user.id,
  userData.authEmail,  // ← Changed from userData.email
]);
```

---

### **3. Controllers** (`backend/src/controllers/user.controller.ts`)

#### Updated:
```typescript
// Check if user exists by authEmail
const userExists = await User.getUserByIdOrAuthEmail(req.db, {
  authEmail: userData.authEmail,  // ← Changed from userData.email
});
```

---

### **4. Database Seed** (`backend/src/database/seed/seed.ts`)

#### Updated:
```typescript
const userDataList = [
  {
    title: "Mr",
    firstName: "iConnect",
    lastName: "Admin",
    authEmail: "iconnect@gmail.com",  // ← Changed from email
    // ...
  },
];

// Check existing
await pool.query(checkUserAuthQuery, [userData.authEmail]);

// Insert
await pool.query(insertQuery, [
  userResponse.id, 
  userData.authEmail,  // ← Changed from userData.email
  hashPassword
]);
```

---

### **5. Frontend Schemas** (`frontend/src/schemaAndTypes/user.ts`)

#### createUserFormSchema:
```typescript
export const createUserFormSchema = z.object({
  // ...
  authEmail: z.string().email("Invalid email"),  // ← Changed from email
  // ...
});
```

#### updateUserFormSchema:
```typescript
export const updateUserFormSchema = z.object({
  // ...
  authEmail: z.string().email("Invalid email").optional(),  // ← For auth
  email: z.string().email("Invalid email").optional(),      // ← From contacts
  // ...
});
```

---

### **6. Frontend Wizard** (`frontend/src/components/UserWizard.tsx`)

#### Updated:
```typescript
const personalData = {
  title: formData.title,
  firstName: formData.firstName,
  lastName: formData.lastName,
  // ...
  authEmail: formData.officeEmail || "",  // ← Changed from email
  tenantId: tenant?.id || 1,
};
```

---

## 🎯 Why This Change?

### **Clarity and Specificity**

| Field Name | Purpose | Context |
|------------|---------|---------|
| `authEmail` | Authentication/Login | Stored in `user_auths` table |
| `email` | Contact information | Stored in `user_contacts` table (tenant schema) |
| `officeEmail` | Official contact | Frontend wizard field |
| `personalEmail` | Personal contact | Frontend wizard field |

### **Before** (Ambiguous):
```typescript
email: "john@company.com"  
// Is this for auth or contact? 🤔
```

### **After** (Clear):
```typescript
authEmail: "john@company.com"     // ✅ For authentication
officeEmail: "john@company.com"   // ✅ For contact (official)
personalEmail: "john@personal.com" // ✅ For contact (personal)
```

---

## 📋 Migration Checklist

All completed:

- ✅ Backend schema updated (`baseUserSchema`)
- ✅ Service layer updated (uses schema types)
- ✅ Controllers updated (uses `authEmail`)
- ✅ Database seed updated (uses `authEmail`)
- ✅ Frontend schemaAndTypes updated
- ✅ Frontend wizard updated
- ✅ All queries use LEFT JOIN for `user_auths`
- ✅ No linter errors
- ✅ Type safety maintained

---

## 🔄 Data Flow

### User Creation (Wizard Step 1)

```
Frontend (Wizard)
  officeEmail: "john@company.com"
      ↓
  Transform to:
  authEmail: "john@company.com"
      ↓
Backend API (POST /api/user/personal)
  createUserSchema validates authEmail
      ↓
Service (User.createUser)
  userData.authEmail
      ↓
Database
  INSERT INTO user_auths ("authEmail", ...)
  VALUES ('john@company.com', ...)
```

### User Retrieval

```
Database
  SELECT ua."authEmail" FROM user_auths ua
  LEFT JOIN (can be NULL)
      ↓
Backend Service
  Returns user with authEmail field
      ↓
Frontend
  Displays: user.authEmail || user.email || "Not set"
```

---

## 💡 Key Points

### 1. **authEmail is for Authentication**
- Stored in `user_auths` table (main schema)
- Used for login credentials
- Unique across system
- Required for account access

### 2. **email is for Contact**
- Stored in `user_contacts` table (tenant schema)
- Can be multiple per user (official, personal)
- Tenant-specific
- Optional/supplementary

### 3. **officeEmail/personalEmail are UI Fields**
- Frontend wizard step 2
- Collected separately
- Stored in `user_contacts`
- Not used for authentication

---

## 🎯 Benefits

| Benefit | Description |
|---------|-------------|
| **Clarity** | Purpose of each email field is explicit |
| **Type Safety** | authEmail required for auth operations |
| **Separation** | Auth vs contact data clearly separated |
| **Maintainability** | Easier to understand code intent |
| **Scalability** | Can add more contact types without confusion |

---

## 📚 Related Documentation

- `WIZARD_PROGRESSIVE_SAVE.md` - Progressive save implementation
- `DATABASE_QUERY_OPTIMIZATION.md` - LEFT JOIN strategy
- `WIZARD_UNIFIED_COMPONENT.md` - Unified wizard component

---

## ✅ Verification

All systems updated and verified:

```bash
✅ Backend
   ├── Schemas: authEmail field
   ├── Services: Uses schema types
   ├── Controllers: authEmail references
   └── Seed data: authEmail values

✅ Frontend
   ├── Schemas: authEmail in forms
   ├── Wizard: authEmail in API calls
   └── Redux: Proper action parameters

✅ Database
   ├── user_auths: authEmail column
   ├── Migrations: Updated
   └── Seed: Using authEmail

✅ Quality
   ├── No linter errors
   ├── Type-safe throughout
   └── Consistent naming
```

---

## 🎉 Result

The codebase now has **crystal-clear separation** between:
- 🔐 **Authentication email** (`authEmail`) - For login
- 📧 **Contact emails** (`officeEmail`, `personalEmail`) - For communication
- 📋 **Legacy email** (optional) - For backward compatibility

Clean, professional, and maintainable! 🚀

