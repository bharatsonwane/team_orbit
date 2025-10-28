# Wizard Quick Start Guide

## ✅ What's Implemented

The application now uses **wizard-only** approach for adding and editing users. No quick forms, just comprehensive 3-step wizards.

## 🎯 How to Use

### Navigate to Tenant Detail Page
```
1. Go to: /platform/tenant-list
2. Click on any tenant
3. You'll see the tenant details page
```

### Add a New User
```
1. Look for "Tenant Users" card
2. Click the "Add User" button (top right)
3. Follow the 3-step wizard:
   Step 1: Personal Information → Click "Next"
   Step 2: Contact Information → Click "Next"  
   Step 3: Job Details → Click "Create User"
```

### Edit an Existing User
```
1. Find user in the table
2. Click the 3-dot menu (⋮) on the right
3. Select "Edit User"
4. Follow the 3 steps (data is pre-populated)
```

## 📊 UI Layout

### Tenant Users Card Header
```
┌────────────────────────────────────────────┐
│ Tenant Users (5)              [Add User]   │
│ Manage users within...                     │
└────────────────────────────────────────────┘
```

### User Actions Dropdown
```
┌───────────────────────┐
│ ⋮ Menu                │
├───────────────────────┤
│ Edit User             │  ← Opens 3-step wizard
│ Update Password       │  ← Password modal
│ Update Status & Roles │  ← Status/Roles modal
└───────────────────────┘
```

## 🎨 Wizard Steps

### Step 1: Personal Information
- Title (Mr/Mrs/Ms)
- First Name*, Last Name*
- Middle Name, Maiden Name
- Gender, Date of Birth
- Blood Group, Marital Status
- Bio

### Step 2: Contact Information
- **Office Email*** (used for authentication)
- Personal Email
- Official Phone, Personal Phone
- Emergency Contact 1 (Name + Phone)
- Emergency Contact 2 (Name + Phone)

### Step 3: Job Details
- Hiring Date, Joining Date
- Probation Period (months)
- Designation, Department
- User ID
- CTC (Annual)
- Reporting Manager ID

*Required fields

## 📁 Key Files

### Components
- `frontend/src/components/UserFormWizard.tsx` - Add user wizard
- `frontend/src/components/EditUserWizard.tsx` - Edit user wizard
- `frontend/src/components/forms/` - Form section components

### Integration
- `frontend/src/pages/platform/tenant/TenantDetail.tsx` - Main page with wizards

### Documentation
- `frontend/docs/WIZARD_USAGE.md` - Detailed usage guide
- `frontend/docs/WIZARD_UI_INTEGRATION.md` - UI integration details

## ✨ Features

- ✅ Progressive 3-step form
- ✅ Visual progress indicator
- ✅ Per-step validation
- ✅ Data persistence across steps
- ✅ Loading states & error handling
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Pre-populated data for editing

## 🚀 Quick Test

```bash
# Start the app
cd frontend && npm run dev

# Navigate to tenant detail
http://localhost:5173/platform/tenant-list
→ Click any tenant
→ Click "Add User" button
→ Complete the 3 steps

# Or edit existing user
→ Click 3-dot menu on any user
→ Select "Edit User"
→ Navigate through steps
```

## 🎯 Why Wizard-Only?

1. **Consistent UX**: One way to do things, no confusion
2. **Complete Data**: Ensures all important information is collected
3. **Better Validation**: Step-by-step validation prevents errors
4. **Organized Flow**: Logical progression through related fields
5. **Professional**: Suitable for HR/onboarding workflows

## 📝 Notes

- All wizards use the same form components
- Backend integration needed for extended fields
- Simple modals remain for password and status/roles updates
- EditUserModal and AddUserModal are no longer used

---

For detailed information, see:
- `WIZARD_USAGE.md` - Complete usage guide
- `WIZARD_UI_INTEGRATION.md` - UI integration details

