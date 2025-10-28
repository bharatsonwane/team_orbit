# Wizard Configuration Guide

## 📐 Configuration-Based Architecture

The wizards now use a **configuration array** approach, making them highly maintainable and extensible.

## 🎯 wizardSteps Array Structure

Each wizard step is defined as an object with the following properties:

```typescript
const wizardSteps = [
  {
    id: number,                    // Step number (1, 2, 3, ...)
    title: string,                 // Step title shown in progress indicator
    description: string,           // Brief description under title
    component: JSX.Element,        // React component to render for this step
    validationFields: string[],    // Fields to validate before moving to next step
  },
  // ... more steps
];
```

## 📝 Complete Example

### UserFormWizard Configuration

```typescript
const wizardSteps = [
  {
    id: 1,
    title: "Personal Information",
    description: "Basic personal details",
    component: (
      <UserPersonalInformation
        register={register}
        setValue={setValue}
        errors={errors}
        selectedDob={selectedDob}
        onDobChange={setSelectedDob}
      />
    ),
    validationFields: [
      "title",
      "firstName",
      "lastName",
      "middleName",
      "maidenName",
      "gender",
      "dob",
      "bloodGroup",
      "marriedStatus",
      "bio",
    ] as (keyof UserWizardFormData)[],
  },
  {
    id: 2,
    title: "Contact Information",
    description: "Email, phone, and emergency contacts",
    component: (
      <UserContactInformation
        register={register}
        errors={errors}
        showExtendedContacts={true}
      />
    ),
    validationFields: [
      "officeEmail",
      "personalEmail",
      "officialPhone",
      "personalPhone",
      "emergencyContactName1",
      "emergencyPhone1",
      "emergencyContactName2",
      "emergencyPhone2",
    ] as (keyof UserWizardFormData)[],
  },
  {
    id: 3,
    title: "Job Details",
    description: "Employment and job-related information",
    component: (
      <UserJobDetails
        register={register}
        setValue={setValue}
        errors={errors}
        selectedHiringDate={selectedHiringDate}
        selectedJoiningDate={selectedJoiningDate}
        onHiringDateChange={setSelectedHiringDate}
        onJoiningDateChange={setSelectedJoiningDate}
      />
    ),
    validationFields: [
      "hiringDate",
      "joiningDate",
      "probationPeriodMonths",
      "designation",
      "department",
      "userId",
      "ctc",
      "reportingManagerId",
    ] as (keyof UserWizardFormData)[],
  },
];
```

## ✨ Key Features

### 1. **Dynamic Step Count**
```typescript
const totalSteps = wizardSteps.length;
```
No need to manually update `totalSteps` when adding/removing steps!

### 2. **Automatic Validation**
```typescript
const handleNext = async () => {
  const currentStepConfig = wizardSteps[currentStep - 1];
  const fieldsToValidate = currentStepConfig.validationFields;
  
  const isValid = await trigger(fieldsToValidate);
  if (isValid && currentStep < totalSteps) {
    setCurrentStep(prev => prev + 1);
  }
};
```
Each step knows exactly which fields it needs to validate!

### 3. **Dynamic Component Rendering**
```typescript
<div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
  {wizardSteps[currentStep - 1]?.component}
</div>
```
No more multiple `if (currentStep === X)` conditions!

### 4. **Progress Indicator Generation**
```typescript
{wizardSteps.map((step, index) => (
  // Automatically generates progress circles from config
  <ProgressCircle 
    stepId={step.id}
    title={step.title}
    description={step.description}
  />
))}
```

## 🎨 How to Add a New Step

### Step 1: Create the Component (if needed)

```typescript
// UserBankDetails.tsx
export const UserBankDetails: React.FC<BankDetailsProps> = ({
  register,
  setValue,
  errors,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Bank Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputWithLabel
          id="bankName"
          label="Bank Name"
          register={register}
          error={errors.bankName?.message}
        />
        <InputWithLabel
          id="accountNumber"
          label="Account Number"
          register={register}
          error={errors.accountNumber?.message}
        />
        {/* Add more fields */}
      </div>
    </div>
  );
};
```

### Step 2: Update the Schema

```typescript
const userWizardSchema = z.object({
  // ... existing fields
  
  // New bank fields
  bankName: z.string().optional().or(z.literal("")),
  accountNumber: z.string().optional().or(z.literal("")),
  ifscCode: z.string().optional().or(z.literal("")),
  accountHolderName: z.string().optional().or(z.literal("")),
});
```

### Step 3: Add to wizardSteps Array

```typescript
const wizardSteps = [
  // ... existing steps
  
  {
    id: 4,  // Next step number
    title: "Bank Details",
    description: "Banking information",
    component: (
      <UserBankDetails
        register={register}
        setValue={setValue}
        errors={errors}
      />
    ),
    validationFields: [
      "bankName",
      "accountNumber",
      "ifscCode",
      "accountHolderName",
    ] as (keyof UserWizardFormData)[],
  },
];
```

**That's it!** The wizard automatically:
- ✅ Adds the step to progress indicator
- ✅ Handles validation for the new step
- ✅ Renders the component at the right time
- ✅ Updates total step count

## 🔧 How to Modify Existing Step

### Change Step Title or Description

```typescript
{
  id: 2,
  title: "Contact & Emergency Details",  // ← Updated
  description: "All contact information", // ← Updated
  component: <UserContactInformation ... />,
  validationFields: [...],
}
```

### Add/Remove Fields from Validation

```typescript
validationFields: [
  "officeEmail",
  "personalEmail",
  "officialPhone",
  "newField1",      // ← Add new field
  "newField2",      // ← Add new field
  // "removed",     // ← Remove old field
] as (keyof UserWizardFormData)[],
```

### Change Step Order

Simply reorder the objects in the array:

```typescript
const wizardSteps = [
  jobDetailsStep,      // Now step 1
  personalInfoStep,    // Now step 2
  contactInfoStep,     // Now step 3
];
```

## 🎯 Benefits of Configuration Approach

| Benefit | Description |
|---------|-------------|
| **Maintainability** | All step configuration in one place |
| **Flexibility** | Easy to add/remove/reorder steps |
| **DRY Principle** | No duplicate logic for each step |
| **Type Safety** | TypeScript ensures validation fields match schema |
| **Scalability** | Can easily extend to 5, 10, or more steps |
| **Readability** | Clear structure shows all steps at a glance |

## 📊 Configuration Properties Explained

### `id`
- **Type**: `number`
- **Purpose**: Unique identifier for the step
- **Usage**: Used in progress indicator and step tracking
- **Note**: Should be sequential (1, 2, 3, ...)

### `title`
- **Type**: `string`
- **Purpose**: Main label shown in progress indicator
- **Usage**: Displayed prominently above progress circle
- **Example**: "Personal Information"

### `description`
- **Type**: `string`
- **Purpose**: Brief explanation of what the step contains
- **Usage**: Shown below title in smaller text
- **Example**: "Basic personal details"

### `component`
- **Type**: `JSX.Element`
- **Purpose**: The actual form content to render
- **Usage**: Dynamically rendered based on current step
- **Note**: Receives form methods as props (register, setValue, errors)

### `validationFields`
- **Type**: `(keyof FormDataType)[]`
- **Purpose**: Fields to validate before allowing next step
- **Usage**: Automatically triggered on "Next" button click
- **Note**: Must match schema field names exactly

## 🚀 Advanced: Conditional Steps

You can make steps conditional based on data:

```typescript
const wizardSteps = [
  personalInfoStep,
  contactInfoStep,
  // Only show job details for tenant users
  ...(tenant ? [jobDetailsStep] : []),
  // Only show bank details if ctc > 0
  ...(showBankDetails ? [bankDetailsStep] : []),
];
```

## 💡 Best Practices

### 1. Keep Related Fields Together
Group related fields in the same step for logical flow.

### 2. Required Fields First
Put steps with required fields earlier in the wizard.

### 3. Validate Appropriately
Only include fields in `validationFields` that exist in the step's component.

### 4. Meaningful Names
Use clear, descriptive titles and descriptions for each step.

### 5. Consistent Components
Reuse form components across both add and edit wizards.

## 📚 Files Using This Pattern

- ✅ `UserWizard.tsx` - Unified wizard component (handles both create and edit modes)

The wizard uses a single configuration structure for both create and edit modes!

## 🎉 Summary

The configuration-based approach makes wizards:
- **Easier to maintain** - Single source of truth
- **Simpler to extend** - Just add object to array
- **More flexible** - Reorder, add, remove steps easily
- **Type-safe** - Full TypeScript support
- **Clean** - No repetitive if/else logic

Perfect for scaling to complex multi-step forms! 🚀

