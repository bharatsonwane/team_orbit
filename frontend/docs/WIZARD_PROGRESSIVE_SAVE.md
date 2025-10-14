# Progressive Save Wizard - Implementation Guide

## 🎯 Overview

The wizard now uses a **progressive save** approach where data is saved to the backend **on each step**, not just at the end. This provides better data integrity and allows users to resume their progress.

## 🔄 How It Works

### Traditional Approach (Old)
```
Step 1 → Step 2 → Step 3 → Save All Data
❌ If user closes wizard, all data is lost
❌ All-or-nothing submission
❌ Long wait at the end
```

### Progressive Save Approach (New)
```
Step 1 → Save Personal Info → Get userId
Step 2 → Save Contacts → Using userId
Step 3 → Save Job Details → Complete!
✅ Data saved after each step
✅ Can resume if interrupted
✅ Immediate feedback
```

---

## 📊 API Endpoints

### Step-by-Step API Calls

#### **Step 1: Personal Information**

**Create Mode:**
```http
POST /api/user/personal
Content-Type: application/json

{
  "title": "Mr",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",  // Used as authEmail
  "tenantId": 2,
  // ... other personal fields
}

Response: 
{
  userId: 123  // Created user ID
}
```

**Edit Mode:**
```http
PUT /api/user/:id/personal
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe Updated",
  // ... other personal fields
}

Response:
{
  // Updated user object
}
```

---

#### **Step 2: Contact Information**

**Both Create & Edit:**
```http
POST /api/user/:id/contacts
Content-Type: application/json

{
  "officeEmail": "john.doe@company.com",
  "personalEmail": "john@personal.com",
  "officialPhone": "+1234567890",
  "personalPhone": "+0987654321",
  "emergencyContactName1": "Jane Doe",
  "emergencyContactPhone1": "+1111111111",
  "emergencyContactName2": "Bob Smith",
  "emergencyContactPhone2": "+2222222222"
}

Response:
{
  "message": "Contacts saved successfully",
  "userId": 123
}
```

**Backend Behavior:**
- Deletes existing contacts for user
- Inserts new contacts into `user_contacts` table (tenant schema)
- Stores contacts with proper `CONTACT_TYPE` lookup references

---

#### **Step 3: Job Details**

**Both Create & Edit:**
```http
POST /api/user/:id/job-details
Content-Type: application/json

{
  "hiringDate": "2025-01-15",
  "joiningDate": "2025-02-01",
  "probationPeriodMonths": 3,
  "designation": "Senior Developer",
  "department": "Engineering",
  "employeeId": "EMP001",
  "ctc": 120000,
  "reportingManagerId": 45
}

Response:
{
  "message": "Job details saved successfully",
  "userId": 123
}
```

**Backend Behavior:**
- Upserts (insert or update) into `user_job_details` table
- Stores in tenant schema
- One job detail record per user (UNIQUE constraint)

---

## 🎨 Frontend Flow

### Create Mode Flow

```typescript
// Step 1: Create user with personal info
const handleNext = async () => {
  if (currentStep === 1) {
    const userId = await dispatch(
      createUserPersonalAction(personalData)
    ).unwrap();
    
    setCreatedUserId(userId);  // ← Store userId for next steps
    toast.success("Step 1 Complete");
    setCurrentStep(2);
  }
  
  // Step 2: Save contacts (requires userId from step 1)
  else if (currentStep === 2) {
    await dispatch(
      saveUserContactsAction({ userId, contactData })
    ).unwrap();
    
    toast.success("Step 2 Complete");
    setCurrentStep(3);
  }
};

// Step 3: Final submission saves job details
const onSubmit = async () => {
  await dispatch(
    saveUserJobDetailsAction({ userId, jobData })
  ).unwrap();
  
  toast.success("User Created Successfully!");
  onClose();
};
```

### Edit Mode Flow

```typescript
// Step 1: Update personal info (userId already known)
const handleNext = async () => {
  if (currentStep === 1) {
    await dispatch(
      updateUserPersonalAction({ userId, personalData })
    ).unwrap();
    
    toast.success("Step 1 Updated");
    setCurrentStep(2);
  }
  
  // Step 2: Save/update contacts
  else if (currentStep === 2) {
    await dispatch(
      saveUserContactsAction({ userId, contactData })
    ).unwrap();
    
    toast.success("Step 2 Updated");
    setCurrentStep(3);
  }
};

// Step 3: Final submission updates job details
const onSubmit = async () => {
  await dispatch(
    saveUserJobDetailsAction({ userId, jobData })
  ).unwrap();
  
  toast.success("User Updated Successfully!");
  onClose();
};
```

---

## 💾 Database Tables

### Main Schema

**users** table (existing)
- Stores core user profile
- Updated in Step 1

**user_auths** table (existing)  
- Stores authentication data (authEmail)
- Created in Step 1

### Tenant Schema

**user_contacts** table (existing)
- Stores all contact types
- Updated in Step 2

**user_job_details** table (NEW)
- Stores employment information
- Updated in Step 3

```sql
CREATE TABLE IF NOT EXISTS user_job_details (
    id SERIAL PRIMARY KEY,
    "userId" INT NOT NULL,
    "hiringDate" DATE,
    "joiningDate" DATE,
    "probationPeriodMonths" INT,
    "designation" VARCHAR(255),
    "department" VARCHAR(255),
    "employeeId" VARCHAR(100) UNIQUE,
    "ctc" DECIMAL(15, 2),
    "reportingManagerId" INT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_job_details UNIQUE ("userId")
);
```

---

## ✨ Benefits of Progressive Save

| Benefit | Description |
|---------|-------------|
| **Data Safety** | Data saved immediately, not lost if wizard closes |
| **Better UX** | Immediate feedback after each step |
| **Resume Capability** | Can resume later from where they left off |
| **Smaller Transactions** | Each step is independent, easier to debug |
| **Error Isolation** | Step failure doesn't affect previous steps |
| **Progress Tracking** | Can see which steps are complete |

---

## 🎯 State Management

### userId Tracking

```typescript
// In UserWizard component
const [createdUserId, setCreatedUserId] = useState<number | null>(null);

// For create mode
const userId = isEditMode ? initialUserId : createdUserId;

// After step 1 (create mode)
const newUserId = await dispatch(createUserPersonalAction(data)).unwrap();
setCreatedUserId(newUserId);  // ← Store for steps 2 & 3
```

### Step Completion Tracking

Each step shows success toast:
```typescript
toast.success("Step 1 Complete", {
  description: "Personal information saved successfully"
});
toast.success("Step 2 Complete", {
  description: "Contact information saved successfully"
});
toast.success("User Created Successfully", {
  description: "All details saved. Set password, status, and roles next."
});
```

---

## 🔧 Backend Implementation

### Service Methods

**`User.createUser()`** (Step 1 - Create)
- Creates user in `users` table
- Creates auth record in `user_auths` table
- Returns userId

**`User.updateUser()`** (Step 1 - Edit)
- Updates `users` table  
- Returns updated user

**`User.saveUserContacts()`** (Step 2)
- Gets user's tenantId
- Accesses tenant schema
- Deletes old contacts
- Inserts new contacts with proper types
- Idempotent operation

**`User.saveUserJobDetails()`** (Step 3)
- Gets user's tenantId
- Accesses tenant schema
- Upserts job details (insert or update)
- One record per user

---

## 🎨 User Experience

### What Users See

**Step 1 → Click "Next"**
```
→ Loading spinner
→ "Step 1 Complete - Personal information saved"
→ Progress indicator updates (✓)
→ Automatically moves to Step 2
```

**Step 2 → Click "Next"**
```
→ Loading spinner
→ "Step 2 Complete - Contact information saved"
→ Progress indicator updates (✓✓)
→ Automatically moves to Step 3
```

**Step 3 → Click "Create User"**
```
→ Loading spinner
→ "User Created Successfully"
→ Wizard closes
→ User list refreshes
```

---

## ⚠️ Error Handling

### If Step Fails

```typescript
try {
  await saveStepData();
  // Move to next step
} catch (error) {
  toast.error(`Failed to save ${stepTitle}`);
  // Stay on current step
  // User can retry
}
```

### Important Behaviors

1. **Step 1 Fails**: User not created, can retry
2. **Step 2 Fails**: User created but contacts not saved, can retry
3. **Step 3 Fails**: User and contacts saved, can retry job details
4. **Cancel Anytime**: Already-saved data remains (partial user)

---

## 🔄 Going Back

### Previous Button Behavior

- **Does NOT undo saved data**
- Allows reviewing/editing previous steps
- Re-submits data when clicking "Next" again
- Useful for correcting mistakes

### Example
```
User at Step 3 → Click "Previous"
→ Goes back to Step 2
→ Can edit contact information
→ Click "Next" → Re-saves contacts
→ Returns to Step 3
```

---

## 💡 Best Practices

### 1. Always Check userId
```typescript
if (!userId) {
  toast.error("Please complete Step 1 first");
  return;
}
```

### 2. Provide Clear Feedback
```typescript
toast.success("Step 1 Complete", {
  description: "Personal information saved"  // ← Be specific
});
```

### 3. Handle Partial Data Gracefully
- Backend accepts optional fields
- Frontend doesn't require all fields
- User can skip fields and complete later

### 4. Transaction Safety
- Each step uses transactions
- Rollback on error
- Data consistency maintained

---

## 🎯 Testing the Flow

### Test Create Mode

```
1. Navigate to tenant detail page
2. Click "Add User"
3. Fill Step 1 (Personal Info)
4. Click "Next"
   ✅ Check: User created in database
   ✅ Check: Toast shows "Step 1 Complete"
   ✅ Check: Progress shows step 1 completed (✓)
5. Fill Step 2 (Contacts)
6. Click "Next"
   ✅ Check: Contacts saved in user_contacts table
   ✅ Check: Toast shows "Step 2 Complete"
7. Fill Step 3 (Job Details)
8. Click "Create User"
   ✅ Check: Job details saved in user_job_details
   ✅ Check: Success toast
   ✅ Check: User list refreshes
```

### Test Edit Mode

```
1. Click "Edit User" from dropdown
2. Wizard opens with pre-filled data
3. Modify Step 1 fields
4. Click "Next"
   ✅ Check: Personal info updated
   ✅ Check: Toast confirmation
5. Modify Step 2 fields
6. Click "Next"
   ✅ Check: Contacts updated
7. Modify Step 3 fields
8. Click "Update User"
   ✅ Check: Job details updated
   ✅ Check: Success toast
```

### Test Error Scenarios

```
1. Start creating user
2. Fill Step 1 with duplicate email
3. Click "Next"
   ✅ Check: Error toast appears
   ✅ Check: Stays on Step 1
   ✅ Check: Can retry
```

---

## 🗂️ Database Schema

### Data Distribution

```
Main Schema (main)
├── users                  ← Step 1 (personal info)
└── user_auths            ← Step 1 (authEmail)

Tenant Schema (tenant_X)
├── user_contacts          ← Step 2 (all contacts)
└── user_job_details       ← Step 3 (employment info)
```

### Why This Structure?

- **Main schema**: Core user profile (shared across tenants if needed)
- **Tenant schema**: Tenant-specific data (contacts, job details)
- **Separation**: Clear boundary between global and tenant data

---

## 🎉 Summary

The progressive save wizard:
- ✅ **Saves data incrementally** - After each step
- ✅ **Provides immediate feedback** - Toast on each save
- ✅ **Better error handling** - Per-step validation and save
- ✅ **Data safety** - No data loss if wizard closes
- ✅ **Resume capability** - Can continue where left off
- ✅ **Clear API structure** - Dedicated endpoints per section
- ✅ **Database organization** - Proper schema separation

Perfect for enterprise applications requiring robust data handling! 🚀

---

## 📚 Related Endpoints Summary

| Step | Endpoint | Method | Description |
|------|----------|--------|-------------|
| 1 (Create) | `/api/user/personal` | POST | Create user with personal info |
| 1 (Edit) | `/api/user/:id/personal` | PUT | Update personal info |
| 2 | `/api/user/:id/contacts` | POST | Save/update contacts |
| 3 | `/api/user/:id/job-details` | POST | Save/update job details |

---

## 🔮 Future Enhancements

Easy to add:
- ✅ **Save as draft** - Mark incomplete profiles
- ✅ **Resume from step** - Start from last completed step
- ✅ **Step indicators** - Show which steps have data
- ✅ **Validation summary** - Show all incomplete required fields
- ✅ **Auto-save** - Save on field blur
- ✅ **Undo step** - Revert last saved data

The foundation is ready for these features!

