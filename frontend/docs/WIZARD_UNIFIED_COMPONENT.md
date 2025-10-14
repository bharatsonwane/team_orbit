# Unified UserWizard Component

## 🎯 Overview

The `UserWizard` component is a **unified, mode-driven wizard** that handles both creating and editing users. This eliminates code duplication and provides a single source of truth for user form workflows.

## 📐 Component Architecture

### Single Component, Dual Mode
```typescript
<UserWizard 
  mode="create"    // or "edit"
  isOpen={isOpen}
  onClose={onClose}
  onSuccess={onSuccess}
  tenant={tenant}
  userId={userId}  // Only for edit mode
/>
```

## 🎨 Props Interface

```typescript
interface UserWizardProps {
  mode: "create" | "edit";           // REQUIRED: Determines wizard behavior
  isOpen: boolean;                   // REQUIRED: Controls drawer visibility
  onClose: () => void;              // REQUIRED: Callback when closed
  onSuccess?: () => void;           // OPTIONAL: Callback after successful operation
  tenant?: Tenant;                  // OPTIONAL: Tenant context (if null, creates platform user)
  userId?: number | null;           // REQUIRED for edit mode: User ID to edit
}
```

## 📝 Usage Examples

### Create Mode

#### For Tenant Users
```typescript
<UserWizard
  mode="create"
  isOpen={isAddUserWizardOpen}
  onClose={() => setIsAddUserWizardOpen(false)}
  tenant={currentTenant}
  onSuccess={() => {
    // Refresh user list
    dispatch(getTenantUsersAction(tenantId));
  }}
/>
```

#### For Platform Users
```typescript
<UserWizard
  mode="create"
  isOpen={isAddUserWizardOpen}
  onClose={() => setIsAddUserWizardOpen(false)}
  // No tenant = platform user
  onSuccess={() => {
    // Refresh platform users
    dispatch(getPlatformUsersAction());
  }}
/>
```

### Edit Mode

```typescript
<UserWizard
  mode="edit"
  isOpen={isEditUserWizardOpen}
  onClose={() => setIsEditUserWizardOpen(false)}
  tenant={currentTenant}
  userId={selectedUserId}
  onSuccess={() => {
    // Refresh user list
    dispatch(getTenantUsersAction(tenantId));
  }}
/>
```

## 🔄 Mode-Specific Behavior

| Feature | Create Mode | Edit Mode |
|---------|------------|-----------|
| **Title** | "Add New User to [Tenant]" | "Edit User" |
| **Data Loading** | No data fetch | Fetches user data on open |
| **Validation** | Stricter (required fields) | More lenient (optional fields) |
| **Submit Action** | `createUserAction` | `updateUserAction` |
| **Success Message** | "User Created Successfully" | "User Updated Successfully" |
| **Form Reset** | Always resets on close | Resets on close |

## 🎯 Configuration Array

Both modes use the same `wizardSteps` configuration:

```typescript
const wizardSteps = [
  {
    id: 1,
    title: "Personal Information",
    description: "Basic personal details",
    component: <UserPersonalInformation {...props} />,
    validationFields: ["firstName", "lastName", ...],
  },
  {
    id: 2,
    title: "Contact Information",
    description: "Email, phone, and emergency contacts",
    component: <UserContactInformation {...props} />,
    validationFields: ["officeEmail", "personalEmail", ...],
  },
  {
    id: 3,
    title: "Job Details",
    description: "Employment and job-related information",
    component: <UserJobDetails {...props} />,
    validationFields: ["hiringDate", "designation", ...],
  },
];
```

## ✨ Key Features

### 1. **Automatic Mode Detection**
```typescript
const isCreateMode = mode === "create";
const isEditMode = mode === "edit";

// Different schemas based on mode
resolver: zodResolver(
  isCreateMode ? createUserWizardSchema : userWizardSchema
)
```

### 2. **Conditional Data Fetching**
```typescript
useEffect(() => {
  if (isOpen && isEditMode && userId) {
    fetchUserData(); // Only for edit mode
  }
}, [isOpen, isEditMode, userId]);
```

### 3. **Dynamic Titles and Messages**
```typescript
const getModalTitle = () => {
  if (isCreateMode) {
    return isPlatformUser 
      ? "Add New Platform User" 
      : `Add New User to ${tenant?.name}`;
  }
  return "Edit User";
};

const getSubmitButtonText = () => {
  return isCreateMode ? "Create User" : "Update User";
};
```

### 4. **Unified Submit Handler**
```typescript
const onSubmit = async (data: UserWizardFormData) => {
  if (isCreateMode) {
    await dispatch(createUserAction(transformedData)).unwrap();
    toast.success("User Created Successfully");
  } else {
    await dispatch(updateUserAction({ userId, userData: transformedData })).unwrap();
    toast.success("User Updated Successfully");
  }
  
  resetForm();
  onSuccess?.();
  onClose();
};
```

## 📊 Benefits of Unified Component

| Benefit | Description |
|---------|-------------|
| **DRY** | Single source of truth - no duplication |
| **Maintainability** | Fix once, applies to both create and edit |
| **Consistency** | Guaranteed same UX for both modes |
| **Smaller Bundle** | Less code = faster load times |
| **Easier Testing** | Test one component instead of two |
| **Flexibility** | Easy to add mode-specific behavior |

## 🔧 How to Add Mode-Specific Logic

### Example: Conditional Step
```typescript
const wizardSteps = [
  personalInfoStep,
  contactInfoStep,
  jobDetailsStep,
  // Only show for create mode
  ...(isCreateMode ? [termsAndConditionsStep] : []),
];
```

### Example: Different Validation
```typescript
const schema = isCreateMode 
  ? strictSchemaForCreate 
  : lenientSchemaForEdit;
```

### Example: Conditional Field Requirements
```typescript
officeEmail: isCreateMode
  ? z.string().email("Invalid email") // Required
  : z.string().email("Invalid email").optional(), // Optional
```

## 📁 File Structure

### Before (Duplicated)
```
frontend/src/components/
├── UserFormWizard.tsx       (~400 lines) ❌
├── EditUserWizard.tsx       (~480 lines) ❌
└── forms/...
```

### After (Unified)
```
frontend/src/components/
├── UserWizard.tsx           (~360 lines) ✅
└── forms/...
```

**Result**: ~520 lines reduced to ~360 lines! 🎉

## 🎯 Usage Across Application

### TenantDetail.tsx
```typescript
// Create
<UserWizard mode="create" tenant={tenant} ... />

// Edit
<UserWizard mode="edit" tenant={tenant} userId={userId} ... />
```

### PlatformUsers.tsx
```typescript
// Create platform user
<UserWizard mode="create" ... />
// No tenant prop = platform user
```

### Employees.tsx
```typescript
// Create
<UserWizard mode="create" tenant={tenantContext} ... />

// Edit
<UserWizard mode="edit" tenant={tenantContext} userId={userId} ... />
```

## 🚀 Migration Guide

### From Old Components

**Before:**
```typescript
import { UserFormWizard } from "@/components/UserFormWizard";
import { EditUserWizard } from "@/components/EditUserWizard";

<UserFormWizard
  isOpen={isOpen}
  onClose={onClose}
  tenant={tenant}
  onUserCreated={onUserCreated}
/>

<EditUserWizard
  isOpen={isOpen}
  onClose={onClose}
  userId={userId}
  onUserUpdated={onUserUpdated}
/>
```

**After:**
```typescript
import { UserWizard } from "@/components/UserWizard";

<UserWizard
  mode="create"
  isOpen={isOpen}
  onClose={onClose}
  tenant={tenant}
  onSuccess={onUserCreated}
/>

<UserWizard
  mode="edit"
  isOpen={isOpen}
  onClose={onClose}
  tenant={tenant}
  userId={userId}
  onSuccess={onUserUpdated}
/>
```

### Key Differences
1. ✅ Import only one component
2. ✅ Add `mode` prop ("create" or "edit")
3. ✅ Rename callback: `onUserCreated`/`onUserUpdated` → `onSuccess`
4. ✅ For edit: Add `userId` prop

## 💡 Best Practices

### 1. Always Specify Mode
```typescript
// ✅ Good
<UserWizard mode="create" ... />
<UserWizard mode="edit" userId={id} ... />

// ❌ Bad - will cause type errors
<UserWizard ... /> // Missing mode prop
```

### 2. Pass userId for Edit Mode
```typescript
// ✅ Good
<UserWizard mode="edit" userId={selectedUserId} ... />

// ❌ Bad - edit mode needs userId
<UserWizard mode="edit" ... /> // Missing userId
```

### 3. Use onSuccess for Both
```typescript
// ✅ Good - consistent callback name
onSuccess={() => refreshUsers()}

// ❌ Avoid - old naming
onUserCreated / onUserUpdated
```

## 🔍 Internal Implementation Highlights

### Schema Selection
```typescript
const schema = isCreateMode ? createUserWizardSchema : userWizardSchema;
```

### Conditional Data Fetching
```typescript
useEffect(() => {
  if (isEditMode && userId) {
    fetchAndPopulateUserData();
  }
}, [isEditMode, userId]);
```

### Dynamic API Calls
```typescript
if (isCreateMode) {
  await dispatch(createUserAction(data)).unwrap();
} else {
  await dispatch(updateUserAction({ userId, userData: data })).unwrap();
}
```

## 📚 Related Documentation

- `WIZARD_CONFIGURATION.md` - Configuration array approach
- `WIZARD_USAGE.md` - Detailed usage guide
- `WIZARD_QUICK_START.md` - Quick reference

## 🎉 Summary

The unified `UserWizard` component:
- ✅ **Reduces code** by ~40% (520 lines → 360 lines)
- ✅ **Eliminates duplication** - DRY principle
- ✅ **Simplifies imports** - One component for both operations
- ✅ **Maintains flexibility** - Mode-specific behavior when needed
- ✅ **Improves consistency** - Same UX for create and edit
- ✅ **Easier to maintain** - Fix bugs once, benefits both modes
- ✅ **Type-safe** - Full TypeScript support with proper validation

Perfect for scalable, maintainable applications! 🚀

