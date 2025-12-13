# User Form Wizard - Usage Guide

## Overview

The User Form Wizard provides a multi-step form experience for creating users with complete information including personal details, contact information, and job details.

## Components Created

### 1. Form Components (`/components/forms/`)

- **`UserPersonalInformation.tsx`** - Personal details (name, DOB, gender, etc.)
- **`UserContactInformation.tsx`** - Contact details (emails, phones, emergency contacts)
- **`UserJobDetails.tsx`** - Job-related information (hiring date, CTC, designation, etc.)

### 2. Wizard Component

- **`UserWizard.tsx`** - Unified wizard component with 3-step flow (supports both create and edit modes)

## How to Use

### Using the Unified UserWizard

In your page component (e.g., `TenantDetail.tsx`):

```typescript
import { UserWizard } from "@/components/UserWizard";

// For creating a user:
<UserWizard
  mode="create"
  isOpen={isAddUserModalOpen}
  onClose={() => setIsAddUserModalOpen(false)}
  onSuccess={handleRefresh}
  tenant={currentTenant}
/>

// For editing a user:
<UserWizard
  mode="edit"
  isOpen={isEditUserModalOpen}
  onClose={() => setIsEditUserModalOpen(false)}
  onSuccess={handleRefresh}
  tenant={currentTenant}
  userId={selectedUserId}
/>
```

### Key Props

- **`mode`**: "create" or "edit" - determines wizard behavior
- **`isOpen`**: boolean - controls drawer visibility
- **`onClose`**: callback when drawer is closed
- **`onSuccess`**: callback after successful create/update
- **`tenant`**: optional - tenant context (if null, creates platform user)
- **`userId`**: required for edit mode - user ID to edit

## Wizard Features

### Step 1: Personal Information
- Title (Mr/Mrs/Ms)
- First Name, Last Name, Middle Name, Maiden Name
- Gender
- Date of Birth
- Blood Group
- Marital Status
- Bio

### Step 2: Contact Information
- **Office Email** (required - used for authentication)
- Personal Email
- Official Phone
- Personal Phone
- Emergency Contact 1 (Name & Phone)
- Emergency Contact 2 (Name & Phone)

### Step 3: Job Details
- Hiring Date
- Joining Date
- Probation Period (in months)
- Designation
- Department
- User ID
- CTC (Annual)
- Reporting Manager ID

## Progress Indicator

The wizard includes a visual progress indicator showing:
- Completed steps (with checkmark)
- Current step (highlighted)
- Upcoming steps (greyed out)

## Navigation

- **Next Button**: Validates current step and moves forward
- **Previous Button**: Returns to previous step
- **Cancel Button**: Closes wizard and resets form
- **Create User Button**: Appears on final step

## Validation

- Each step validates its fields before allowing progression
- Real-time error messages
- Form validates on blur

## Backend Integration Required

The wizard sends data with these additional fields that need backend support:

### Contact Data
```typescript
{
  officeEmail: string,      // Used as primary auth email
  personalEmail?: string,
  officialPhone?: string,
  personalPhone?: string,
  emergencyContactName1?: string,
  emergencyPhone1?: string,
  emergencyContactName2?: string,
  emergencyPhone2?: string,
}
```

### Job Data
```typescript
{
  hiringDate?: string,
  joiningDate?: string,
  probationPeriodMonths?: number,
  designation?: string,
  department?: string,
  userId?: string,
  ctc?: number,
  reportingManagerId?: number,
}
```

## Database Schema Updates Needed

### 1. Update `user_contacts` table (already exists in tenant schema)

This table can store the contact information using the existing structure with `CONTACT_TYPE` lookups.

### 2. Add `user_job_details` table (needs to be created)

```sql
CREATE TABLE IF NOT EXISTS user_job_details (
    id SERIAL PRIMARY KEY,
    "userId" INT NOT NULL,
    "hiringDate" DATE,
    "joiningDate" DATE,
    "probationPeriodMonths" INT,
    "designation" VARCHAR(255),
    "department" VARCHAR(255),
    "userId" VARCHAR(100) UNIQUE,
    "ctc" DECIMAL(15, 2),
    "reportingManagerId" INT,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_user_job_details_user FOREIGN KEY ("userId") 
        REFERENCES main.users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_job_details_manager FOREIGN KEY ("reportingManagerId") 
        REFERENCES main.users (id) ON DELETE SET NULL
);
```

### 3. Backend Service Updates

Update `user.service.ts` to:
1. Accept additional contact fields
2. Accept job detail fields
3. Store contacts in `user_contacts` table
4. Store job details in `user_job_details` table

## Styling

The wizard uses:
- Shadcn UI components
- Tailwind CSS classes
- Lucide React icons
- Responsive grid layout (1 column mobile, 2 columns desktop)

## Customization

You can customize:
1. **Fields**: Add/remove fields in respective form components
2. **Validation**: Update the `userWizardSchema` in `UserFormWizard.tsx`
3. **Steps**: Add more steps by updating the `steps` array and `totalSteps`
4. **Styling**: Modify Tailwind classes in components

## Example: Adding a New Step

```typescript
// 1. Create new component (e.g., UserBankDetails.tsx)
export const UserBankDetails = ({ register, errors }) => {
  return (
    <div className="space-y-4">
      <h3>Bank Details</h3>
      {/* Add bank-related fields */}
    </div>
  );
};

// 2. Update wizard
const totalSteps = 4; // Increase total

const steps = [
  // ... existing steps
  {
    id: 4,
    title: "Bank Details",
    description: "Banking information",
  },
];

// 3. Add to render
{currentStep === 4 && (
  <UserBankDetails register={register} errors={errors} />
)}
```

## Notes

- The wizard maintains backward compatibility with existing `AddUserModal`
- Extended contact information is only shown when `showExtendedContacts={true}`
- All date fields use the `DatePicker` component for consistent UX
- Form data is reset on successful creation or cancellation

## Support

For issues or questions about the wizard implementation, refer to:
- Individual component files for prop documentation
- Type definitions in schemaAndTypes
- Validation rules in `userWizardSchema`

