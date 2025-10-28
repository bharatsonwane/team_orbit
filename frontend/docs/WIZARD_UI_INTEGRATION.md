# Wizard UI Integration Guide

## 📍 Where to Find the Wizard

The wizard is now fully integrated into the **TenantDetail** page at:
```
/platform/tenant/:id
```

## 🎯 UI Integration Points

### 1. **Adding Users** - Single Wizard Option

Located in the **"Tenant Users"** card header, you'll see ONE button:

```
┌─────────────────────────────────────────────────────────┐
│  Tenant Users (X)                              [Add User]  │
│  Manage users within this organization                   │
└─────────────────────────────────────────────────────────┘
```

#### Add User Button
- Opens the 3-step `UserFormWizard`
- Collects comprehensive information:
  - **Step 1**: Personal Information
  - **Step 2**: Extended Contact Information (office email, personal email, phones, emergency contacts)
  - **Step 3**: Job Details (hiring date, CTC, designation, etc.)
- **Best for**: Complete user onboarding with all details

---

### 2. **Editing Users** - Single Wizard Option

In the user table, click the **3-dot menu** (⋮) for each user:

```
┌─────────────────────────┐
│ Edit User               │  ← 3-step wizard
│ Update Password         │
│ Update Status & Roles   │
└─────────────────────────┘
```

#### Edit User
- Opens `EditUserWizard`
- 3-step process with full information
- Pre-populated with existing user data
- **Best for**: Comprehensive profile updates

---

## 🎨 Visual Flow

### Creating a User with Wizard

```
1. Click "Add User" button
   ↓
2. Step 1: Personal Information
   [=========>         ]
   - Fill in name, gender, DOB, etc.
   - Click "Next"
   ↓
3. Step 2: Contact Information
   [=================> ]
   - Office Email (required)
   - Personal Email, Phones
   - Emergency Contacts
   - Click "Next"
   ↓
4. Step 3: Job Details
   [=====================>]
   - Hiring/Joining dates
   - Designation, CTC, etc.
   - Click "Create User"
   ↓
5. ✅ Success! User created with all details
```

### Progress Indicator

The wizard shows a beautiful progress bar at the top:

```
  ┌─────────────────────────────────────────────┐
  │  (1)──────(2)──────(3)                       │
  │ Personal  Contact  Job Details               │
  │           Extended                            │
  │           Information                         │
  └─────────────────────────────────────────────┘
  
  Legend:
  (✓) = Completed step (green with checkmark)
  (1) = Current step (blue, highlighted)
  ( ) = Upcoming step (gray)
```

---

## 🔄 Navigation Controls

### While in the Wizard:

**Bottom Navigation:**
```
┌──────────────────────────────────────┐
│ [← Previous]        [Next →]         │
│           [Cancel]                   │
└──────────────────────────────────────┘
```

- **Previous**: Go back to previous step (disabled on Step 1)
- **Next**: Validate and move to next step (Steps 1-2)
- **Create User** / **Update User**: Final submit button (Step 3)
- **Cancel**: Close wizard and discard changes

---

## 📝 Field Breakdown

### Step 1: Personal Information
- Title (Mr/Mrs/Ms)
- First Name, Last Name
- Middle Name, Maiden Name
- Gender
- Date of Birth
- Blood Group
- Marital Status
- Bio

### Step 2: Contact Information (Extended)
- **Office Email*** (required - used for authentication)
- Personal Email
- Official Phone
- Personal Phone
- Emergency Contact 1:
  - Name
  - Phone
- Emergency Contact 2:
  - Name
  - Phone

### Step 3: Job Details
- Hiring Date
- Joining Date
- Probation Period (months)
- Designation
- Department
- User ID
- CTC (Annual)
- Reporting Manager ID

---

## 💡 Key Features

### ✅ Step Validation
- Each step validates before allowing progression
- Red error messages appear below invalid fields
- Cannot proceed until current step is valid

### ✅ Data Persistence
- Form data is retained when navigating between steps
- Can go back and forth without losing data
- Only resets on successful creation or cancel

### ✅ Loading States
- Beautiful loading overlay during submission
- Prevents duplicate submissions
- Clear feedback messages

### ✅ Responsive Design
- Mobile: Single column layout
- Desktop: Two column grid
- Smooth animations and transitions

---

## 🎯 Use Cases

### When to Use the Wizard
- Onboarding new users with complete information
- Creating or updating user profiles systematically
- You have comprehensive details available (personal, contact, job)
- Want organized step-by-step process with validation
- Multiple people entering different sections of information
- Need to ensure all required fields are properly filled

---

## 🚀 How to Test

1. **Navigate to Tenant Detail Page**
   - Go to `/platform/tenant-list`
   - Click on any tenant
   - You'll see the tenant details page

2. **Test Adding a User**
   - Look for "Tenant Users" card
   - Click the "Add User" button
   - Follow the 3-step wizard process

3. **Test Editing a User**
   - Find any user in the table
   - Click the 3-dot menu (⋮) on the right
   - Select "Edit User"
   - Navigate through the 3 steps with pre-populated data

---

## 📸 Screenshots Locations

### Main Page with Button
```
frontend/src/pages/platform/tenant/TenantDetail.tsx
Line ~378: Single "Add User" button
```

### Dropdown Menu
```
frontend/src/pages/platform/tenant/TenantDetail.tsx
Line ~458-477: DropdownMenu with "Edit User" option
```

### Wizard Components
```
frontend/src/components/
├── UserWizard.tsx         ← Unified wizard (create & edit)
└── forms/
    ├── UserPersonalInformation.tsx
    ├── UserContactInformation.tsx
    └── UserJobDetails.tsx
```

---

## 🔧 Customization

### Change Button Label
Edit `TenantDetail.tsx` line ~378:
```typescript
<Button onClick={handleAddUser}>
  <Plus className="h-4 w-4 mr-2" />
  Add User  ← Change this label if needed
</Button>
```

### Add More Steps to Wizard
See main `WIZARD_USAGE.md` in the same docs folder.

---

## 🐛 Troubleshooting

### "I don't see the wizard buttons"
- Make sure you're on the TenantDetail page (`/platform/tenant/:id`)
- The buttons are in the "Tenant Users" card header
- Check if the component imports are correct

### "Wizard doesn't open"
- Check browser console for errors
- Verify the modal state is updating (React DevTools)
- Ensure the wizard component is rendered (check the bottom of TenantDetail.tsx)

### "Form validation not working"
- Check the `userWizardSchema` in the wizard component
- Verify field names match between schema and form
- Look for errors in the browser console

---

## 📞 Support

If you encounter issues:
1. Check the `WIZARD_USAGE.md` for detailed documentation
2. Review the component code for prop requirements
3. Verify backend is ready for extended fields (contacts, job details)

---

## ✨ Future Enhancements

Potential improvements:
- Save as draft functionality
- Skip optional steps
- Pre-fill data from templates
- Bulk user import wizard
- Custom field configurations per tenant

