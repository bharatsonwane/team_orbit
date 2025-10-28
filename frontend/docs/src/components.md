# Components Reference

Complete documentation for all UI components and custom components in the TeamOrbit frontend.

## 📚 Overview

TeamOrbit uses **shadcn/ui** - a collection of beautifully designed, accessible, and customizable components built with **Radix UI** and **Tailwind CSS**.

## 🏗️ Component Architecture

```
src/components/
├── ui/                      # shadcn/ui component library (46 components)
│   ├── button.tsx          # Button component with variants
│   ├── card.tsx            # Card layout components
│   ├── input.tsx           # Form input component
│   ├── form.tsx            # Form management components
│   └── ... (42 more)
│
├── routing/                 # Routing components
│   ├── AppRoutes.tsx       # Route configuration
│   └── RouteGuardRenderer.tsx  # Route protection
│
├── AppLayout.tsx           # Main application layout wrapper
├── AppSidebar.tsx          # Dynamic navigation sidebar
├── AddUserModal.tsx        # Unified user creation modal (platform & tenant)
├── ComingSoon.tsx          # Placeholder for unimplemented features
├── theme-provider.tsx      # Theme context provider
└── theme-toggle.tsx        # Theme switcher component

src/pages/
├── auth/                   # Public authentication pages
│   ├── Login.tsx
│   └── Signup.tsx
├── platform/               # Platform admin pages
│   ├── PlatformDashboard.tsx
│   ├── notification/
│   │   └── PlatformNotifications.tsx
│   ├── tenant/
│   │   ├── Tenants.tsx
│   │   ├── TenantDetail.tsx
│   │   ├── TenantUsers.tsx
│   │   └── components/
│   │       ├── CreateTenantModal.tsx  # Tenant creation modal
│   │       ├── EditTenantModal.tsx    # Tenant edit modal
│   │       ├── UpdateUserPasswordModal.tsx  # User password update modal
│   │       ├── UpdateUserStatusAndRolesModal.tsx  # User status/roles update modal
│   │       ├── UpdateUserAuthEmailModal.tsx  # User auth email update modal
│   │       └── TenantCard.tsx         # Tenant display card
│   └── users/
│       └── PlatformUsers.tsx
├── tenant/                 # Tenant user pages
│   ├── TenantHome.tsx
│   └── TenantNotifications.tsx
└── profile/
    └── Profile.tsx
```

---

## 🎨 Custom Components

### AppLayout

**Purpose**: Main layout wrapper for protected routes with sidebar and breadcrumbs.

**Location**: `src/components/AppLayout.tsx`

#### Props

```typescript
interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}
```

#### Features

- Responsive sidebar (collapsible on mobile)
- Header with sidebar trigger
- Optional breadcrumb navigation
- Consistent layout across all protected pages

#### Usage

```typescript
import { AppLayout } from '@/components/AppLayout';

function MyPage() {
  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings' },
      ]}
    >
      <div>Page content</div>
    </AppLayout>
  );
}
```

#### Implementation Details

- Uses `SidebarProvider` from shadcn/ui for sidebar state
- `SidebarInset` for main content area
- `SidebarTrigger` for mobile toggle button
- Breadcrumbs rendered in header
- Fixed 16-unit height header with border

---

### AppSidebar

**Purpose**: Dynamic navigation sidebar with role-based filtering and sidebar visibility control.

**Location**: `src/components/AppSidebar.tsx`

#### Features

- **Role-Based Filtering**: Shows only authorized navigation items
- **Sidebar Visibility Control**: Uses `isShownInSidebar` flag to control item display
- **Active State**: Highlights current route
- **Collapsible Menus**: Nested navigation with expand/collapse
- **User Profile**: Displays user info in footer
- **Theme Toggle**: Integrated in header
- **Company Branding**: Logo and company name

#### Implementation

```typescript
export function AppSidebar() {
  const location = useLocation();
  const { loggedInUser } = useAuthService();

  // Check if a link is active
  const isActiveLink = (href: string) => {
    return (
      location.pathname === href ||
      location.pathname.startsWith(href + '/')
    );
  };

  // Filter navigation based on user role and sidebar visibility
  const filteredSidebarItems = (() => {
    let sidebarNavigationItems = tenantSidebarNavigationItems;

    // Show platform sidebar if pathname starts with "platform"
    if (location.pathname.startsWith("/platform")) {
      sidebarNavigationItems = platformSidebarNavigationItems;
    }

    // Filter by role permissions
    const items = filterNavigationItems({
      loggedInUser: loggedInUser,
      items: sidebarNavigationItems,
    });
    return items;
  })();

  return (
    <Sidebar>
      <SidebarHeader>{/* Company branding */}</SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredSidebarItems.map(item => (
            <React.Fragment key={`sidebar_item_${item.title}_${item.isShownInSidebar}`}>
              {/* Only render if isShownInSidebar is true */}
              {item.isShownInSidebar && (
                // Render sidebar item...
              )}
            </Fragment>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>{/* User profile */}</SidebarFooter>
    </Sidebar>
  );
}
```

#### Sidebar Visibility Control

**`isShownInSidebar` Flag**: Controls whether navigation items appear in the sidebar

```typescript
// SidebarRouteWithChildren interface
export interface SidebarRouteWithChildren {
  isShownInSidebar: boolean; // Controls sidebar visibility
  title: string;
  allowedRoles: UserRoleName[];
  path?: string;
  href?: string;
  element?: ReactNode;
  childItems?: SidebarRouteWithChildren[];
  icon?: LucideIcon;
  breadcrumbs?: BreadcrumbLayoutProps[];
}
```

**Usage Examples**:

```typescript
// Show in sidebar (default behavior)
{
  isShownInSidebar: true,
  title: 'Dashboard',
  href: '/dashboard',
  path: '/dashboard',
  element: <Dashboard />,
}

// Hide from sidebar but keep accessible via routing
{
  isShownInSidebar: false,
  title: 'Tenant Detail',
  path: '/tenant/:id',
  element: <TenantDetail />,
}
```

#### Key Functions

**`filterNavigationItems()`**: Recursively filters navigation items based on user roles

```typescript
const filterNavigationItems = (
  items: SidebarRouteWithChildren[]
): SidebarRouteWithChildren[] => {
  // Checks hasRoleAccess for each item
  // Recursively filters child items
  // Returns only authorized items
};
```

**Platform Route Detection**: Simple pathname check for platform navigation

```typescript
// Show platform sidebar if pathname starts with "platform"
if (location.pathname.startsWith("/platform")) {
  sidebarNavigationItems = platformSidebarNavigationItems;
}
```

**`isActiveLink()`**: Determines if a route is currently active

```typescript
const isActiveLink = (href: string) => {
  return location.pathname === href || location.pathname.startsWith(href + "/");
};
```

---

### UserWizard

**Purpose**: Multi-step wizard for creating and editing users with comprehensive information collection.

**Location**: `src/components/UserWizard.tsx`

#### Props

```typescript
interface UserWizardProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  tenant?: Tenant;
  userId?: number | null; // Required for edit mode
}
```

#### Features

- **Multi-Step Process**: 3-step wizard (Personal Info → Contact Info → Job Details)
- **Context-Aware**: Adapts behavior based on whether `tenant` prop is provided
- **Platform Users**: When `tenant` is undefined, creates platform users
- **Tenant Users**: When `tenant` is provided, creates tenant users
- **Immediate User Creation**: User is created after Step 1 (Personal Information)
- **List Refresh**: Calls `onSuccess` immediately after user creation to refresh lists
- **Form Validation**: Zod schema validation for each step
- **Loading States**: During each step save operation
- **Progress Indicator**: Visual progress through wizard steps
- **Error Handling**: Displays error messages for each step
- **Data Fetching**: Automatically fetches user data for edit mode (personal, contacts, job details)
- **Parallel Data Loading**: Uses Promise.all to fetch all user data simultaneously
- **Form Population**: Automatically populates forms with existing data in edit mode

#### Wizard Steps

1. **Personal Information** (`personal`): Basic user details (name, DOB, gender, etc.)
2. **Contact Information** (`contacts`): Email, phone, emergency contacts
3. **Job Details** (`job`): Employment information (hiring date, designation, department, CTC)

#### Usage Examples

**Creating Tenant Users:**

```typescript
// In TenantDetail.tsx or Users.tsx
<UserWizard
  mode="create"
  isOpen={isAddUserWizardOpen}
  onClose={() => setIsAddUserWizardOpen(false)}
  tenant={tenant}
  onSuccess={handleUserCreated} // Called after Step 1 (user creation)
/>
```

**Creating Platform Users:**

```typescript
// In PlatformUsers.tsx
<UserWizard
  mode="create"
  isOpen={isAddUserWizardOpen}
  onClose={() => setIsAddUserWizardOpen(false)}
  // No tenant prop = platform user
  onSuccess={handleUserCreated} // Called after Step 1 (user creation)
/>
```

**Editing Users:**

```typescript
<UserWizard
  mode="edit"
  isOpen={isEditUserWizardOpen}
  onClose={() => setIsEditUserWizardOpen(false)}
  tenant={tenant}
  userId={selectedUserId}
  onSuccess={handleUserUpdated} // Called after final step completion
/>
```

#### Key Behavior

- **Create Mode**: User is created after Step 1, `onSuccess` is called immediately to refresh lists
- **Edit Mode**: User data is updated after each step, `onSuccess` is called after final step
- **List Refresh**: The parent component's list is refreshed as soon as the user is created (Step 1)
- **Wizard Continuation**: User can continue through remaining steps to add more details

#### API Integration

**Create Mode:**
- **Step 1**: `POST /api/user/create` (creates user) → calls `onSuccess`
- **Step 2**: `PUT /api/user/:id/contacts` (updates contact info)
- **Step 3**: `POST /api/user/:id/job-details` (saves job info)

**Edit Mode:**
- **Data Loading**: `Promise.all([getUserPersonalDataByIdAction, getUserContactsByIdAction, getUserJobDetailsAction])`
- **Step 1**: `PUT /api/user/:id/personal` (updates personal info)
- **Step 2**: `PUT /api/user/:id/contacts` (updates contact info)
- **Step 3**: `POST /api/user/:id/job-details` (saves job info)

---

### AddUserModal (Deprecated)

**Note**: The `AddUserModal` component has been replaced by the `UserWizard` component for a more comprehensive user creation experience.

**Location**: `src/components/AddUserModal.tsx` (removed)

#### Props

```typescript
interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: Tenant; // Optional - if provided, creates tenant user; otherwise creates platform user
  onUserCreated?: () => void;
}
```

#### Features

- **Context-Aware**: Adapts behavior based on whether `tenant` prop is provided
- **Platform Users**: When `tenant` is undefined, creates platform users with platform roles
- **Tenant Users**: When `tenant` is provided, creates tenant users with tenant roles
- **Role Filtering**: Automatically filters available roles based on context
- **Form Validation**: Zod schema validation for all fields
- **Loading States**: During user creation
- **Error Handling**: Displays error messages from API
- **Form Reset**: Automatic reset on successful creation
- **Status Dropdown**: Populated from USER_STATUS lookup data
- **Role Dropdown**: Populated from USER_ROLE lookup data (filtered by roleCategory)

#### Usage Examples

**Creating Platform Users:**

```typescript
// In PlatformUsers.tsx
<AddUserModal
  isOpen={isAddModalOpen}
  onClose={() => setIsAddModalOpen(false)}
  // No tenant prop = platform user
  onUserCreated={fetchPlatformUsers}
/>
```

**Creating Tenant Users:**

```typescript
// In Users.tsx or TenantDetail.tsx
<AddUserModal
  isOpen={isAddModalOpen}
  onClose={() => setIsAddModalOpen(false)}
  tenant={tenant} // Tenant prop = tenant user
  onUserCreated={fetchTenantUsers}
/>
```

#### Role Filtering Logic

```typescript
const isPlatformUser = !tenant;

// Filter roles based on context
const availableRoles = userRoleType?.lookups.filter((role) =>
  isPlatformUser
    ? role.name.startsWith('PLATFORM_')  // Platform roles only
    : role.name.startsWith('TENANT_')    // Tenant roles only
);
```

#### Form Schema

```typescript
const createUserFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  statusId: z.string().min(1, "Status is required"),
  roleIds: z.array(z.string()).min(1, "At least one role is required"),
  tenantId: z.number().optional(),
});
```

#### API Integration

- **Endpoint**: `POST /api/user/create`
- **Redux Action**: `createUserAction()`
- **Success**: Calls `onUserCreated()` callback and closes modal
- **Error**: Displays error message using toast notification

#### Component Benefits

1. **Reusability**: Single component handles both platform and tenant user creation
2. **Consistency**: Same UX across different contexts
3. **Maintainability**: Changes apply to both use cases
4. **Type Safety**: Full TypeScript support with Zod validation
5. **Performance**: Efficient role filtering and form handling

---

### ComingSoon

**Purpose**: Placeholder component for features under development.

**Location**: `src/components/ComingSoon.tsx`

#### Props

```typescript
interface ComingSoonProps {
  title?: string;
  description?: string;
}
```

#### Features

- Auto-generates title from route path
- Displays construction icon
- "Coming Soon" badge
- Back to Dashboard button
- Centered card layout

#### Usage

```typescript
import { ComingSoon } from '@/components/ComingSoon';

// In route configuration
{
  path: '/new-feature',
  element: (
    <ComingSoon
      title="New Feature"
      description="This feature is being developed."
    />
  ),
}
```

---

### ThemeProvider

**Purpose**: Manages theme state (light/dark/system) with localStorage persistence.

**Location**: `src/components/theme-provider.tsx`

#### Props

```typescript
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: "dark" | "light" | "system";
  storageKey?: string;
};
```

#### Features

- Three theme modes: light, dark, system
- Persistent storage in localStorage
- System theme detection
- Smooth theme transitions

#### Usage

```typescript
import { ThemeProvider, useTheme } from '@/components/theme-provider';

// Wrap app in provider (in main.tsx)
<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>

// Use in components
function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme('dark')}>
      Switch to Dark Mode
    </button>
  );
}
```

---

### ThemeToggle

**Purpose**: Dropdown menu for switching between themes.

**Location**: `src/components/theme-toggle.tsx`

#### Features

- Icon button (Sun/Moon)
- Dropdown with three options: Light, Dark, System
- Smooth icon transitions
- Accessible with keyboard navigation

#### Usage

```typescript
import { ThemeToggle } from '@/components/theme-toggle';

function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  );
}
```

### UserJobDetails

**Purpose**: Form component for editing user job details information with React Hook Form integration.

**Location**: `src/components/forms/UserJobDetails.tsx`

#### Props

```typescript
interface UserJobDetailsProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  control: Control<any>;
}
```

#### Features

- **Job Information Fields**: Hiring date, joining date, probation period, designation, department
- **Compensation**: CTC (Cost to Company) field
- **Dropdown Integration**: Designation and Department use SelectWithLabel with tenant lookup data
- **Date Pickers**: Hiring and joining dates with proper formatting
- **Form Integration**: Full React Hook Form integration with validation
- **Tenant Data**: Fetches designation and department options from Redux store
- **Controlled Components**: Uses useWatch for date fields, SelectWithLabel for dropdowns

#### Form Fields

1. **Hiring Date** - DatePicker component (controlled with useWatch)
2. **Joining Date** - DatePicker component (controlled with useWatch)
3. **Probation Period** - Number input (months)
4. **Designation** - SelectWithLabel dropdown (from tenant lookup data)
5. **Department** - SelectWithLabel dropdown (from tenant lookup data)
6. **CTC** - Number input (annual compensation)

#### Usage

```typescript
import { UserJobDetails } from '@/components/forms/UserJobDetails';
import { useForm } from 'react-hook-form';

function UserWizard() {
  const { register, setValue, errors, control } = useForm();

  return (
    <UserJobDetails
      register={register}
      setValue={setValue}
      errors={errors}
      control={control}
    />
  );
}
```

#### Redux Integration

```typescript
// The component automatically fetches tenant lookup data
const userDesignations = useSelector((state: RootState) =>
  selectTenantLookupTypeByName(state, tenantLookupTypeKeys.DESIGNATION)
);

const userDepartments = useSelector((state: RootState) =>
  selectTenantLookupTypeByName(state, tenantLookupTypeKeys.DEPARTMENT)
);
```

#### API Integration

```typescript
// Save job details
const saveJobDetails = async (userId: number, jobData: any) => {
  try {
    await getAxios().post(`/api/user/${userId}/job-details`, jobData);
    toast.success("Job details saved successfully");
  } catch (error) {
    toast.error("Failed to save job details");
  }
};

// Load job details
const loadJobDetails = async (userId: number) => {
  const response = await getAxios().get(`/api/user/${userId}/job-details`);
  return response.data;
};
```

---

## 🧩 shadcn/ui Component Library

### Form Components

#### Button

**Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`  
**Sizes**: `default`, `sm`, `lg`, `icon`

```typescript
import { Button } from '@/components/ui/button';

<Button variant="default">Click me</Button>
<Button variant="outline" size="sm">Small</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="icon">
  <IconComponent />
</Button>
```

#### Input

Text input with focus states and validation support.

```typescript
import { Input } from '@/components/ui/input';

<Input
  type="email"
  placeholder="Enter email"
  aria-invalid={!!error}
/>
```

#### Form

React Hook Form integration with Zod validation.

```typescript
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

#### Select

Dropdown select with search functionality.

```typescript
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox

```typescript
import { Checkbox } from '@/components/ui/checkbox';

<Checkbox id="terms" />
<label htmlFor="terms">Accept terms</label>
```

#### Loading Indicator

Generic loading component with multiple variants for different use cases.

```typescript
import { LoadingIndicator, LoadingSpinner, LoadingOverlay, InlineLoading } from '@/components/ui/loading-indicator';

// Basic loading indicator
<LoadingIndicator message="Loading data..." />

// Different sizes
<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />

// Full screen overlay
<LoadingOverlay message="Processing..." />

// Inline loading with text
<InlineLoading message="Saving..." size="sm" />

// Custom styling
<LoadingIndicator
  message="Custom loading message"
  size="lg"
  className="bg-gray-100"
  centered={false}
/>
```

**Props:**

- `message`: Loading message to display
- `size`: Size of the spinner ('sm', 'md', 'lg')
- `className`: Additional CSS classes
- `fullScreen`: Whether to show full screen overlay
- `centered`: Whether to center the content

**Variants:**

- `LoadingIndicator`: Main component with customizable options
- `LoadingSpinner`: Just the spinning icon
- `LoadingOverlay`: Full screen overlay variant
- `InlineLoading`: Inline variant with text

#### Input With Label

Generic input component that combines label, input field, error handling, and helper text into a reusable component. Use props to configure different input types.

```typescript
import { InputWithLabel, SelectWithLabel } from '@/components/ui/input-with-label';

// Text input
<InputWithLabel
  id="name"
  label="Name"
  placeholder="Enter your name"
  required
  register={register}
  error={errors.name?.message}
  helperText="This field is required"
/>

// Email input
<InputWithLabel
  id="email"
  label="Email"
  type="email"
  placeholder="user@example.com"
  register={register}
  error={errors.email?.message}
/>

// Password input
<InputWithLabel
  id="password"
  label="Password"
  type="password"
  register={register}
  error={errors.password?.message}
/>

// Number input
<InputWithLabel
  id="age"
  label="Age"
  type="number"
  register={register}
  error={errors.age?.message}
/>

// Textarea
<InputWithLabel
  id="description"
  label="Description"
  variant="textarea"
  placeholder="Enter description"
  rows={4}
  register={register}
  error={errors.description?.message}
/>

// Select dropdown
<SelectWithLabel
  id="status"
  label="Status"
  required
  register={register}
  error={errors.status?.message}
>
  <option value="">Select a status</option>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
</SelectWithLabel>
```

**InputWithLabel Props:**

- `id`: Unique identifier for the input
- `label`: Label text
- `required`: Whether the field is required (shows asterisk)
- `error`: Error message to display
- `helperText`: Helper text to display below the input
- `className`: Additional CSS classes for the container
- `inputClassName`: Additional CSS classes for the input
- `disabled`: Whether the input is disabled
- `register`: Register function from react-hook-form
- `placeholder`: Placeholder text
- `maxLength`: Maximum length for the input
- `minLength`: Minimum length for the input
- `rows`: Number of rows for textarea
- `type`: Input type ('text', 'email', 'password', 'number', 'tel', 'url', 'search')
- `variant`: Input variant ('input' for regular input, 'textarea' for textarea)

**SelectWithLabel Props:**

- Same as InputWithLabel except `type` and `variant` are not applicable
- `children`: Select options as React nodes

#### Radio Group

```typescript
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

<RadioGroup defaultValue="option1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="option1" />
    <Label htmlFor="option1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="option2" />
    <Label htmlFor="option2">Option 2</Label>
  </div>
</RadioGroup>
```

#### Switch

Toggle switch component.

```typescript
import { Switch } from '@/components/ui/switch';

<Switch checked={enabled} onCheckedChange={setEnabled} />
```

#### Textarea

Multi-line text input.

```typescript
import { Textarea } from '@/components/ui/textarea';

<Textarea placeholder="Enter message" rows={4} />
```

---

### Layout Components

#### Card

Container component with header, content, and footer sections.

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Separator

Horizontal or vertical divider line.

```typescript
import { Separator } from '@/components/ui/separator';

<Separator orientation="horizontal" />
<Separator orientation="vertical" className="h-4" />
```

#### Sidebar

Collapsible sidebar with menu items.

```typescript
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

<Sidebar>
  <SidebarContent>
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/dashboard">Dashboard</Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  </SidebarContent>
</Sidebar>
```

#### Tabs

Tabbed interface component.

```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### Accordion

Collapsible content sections.

```typescript
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

<Accordion type="single" collapsible>
  <AccordionItem value="item1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Content 1</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item2">
    <AccordionTrigger>Section 2</AccordionTrigger>
    <AccordionContent>Content 2</AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### Feedback Components

#### Alert

Display important messages.

```typescript
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    This is an important message.
  </AlertDescription>
</Alert>
```

#### Badge

Small status indicator.

```typescript
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

#### Progress

Progress bar indicator.

```typescript
import { Progress } from '@/components/ui/progress';

<Progress value={60} />
```

#### Skeleton

Loading placeholder.

```typescript
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="h-12 w-full" />
<Skeleton className="h-4 w-3/4" />
```

---

### Overlay Components

#### Dialog

Modal dialog window.

```typescript
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
    <DialogFooter>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Alert Dialog

Confirmation dialog.

```typescript
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### Drawer

Side panel drawer.

```typescript
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';

<Drawer>
  <DrawerTrigger asChild>
    <Button>Open Drawer</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Drawer Title</DrawerTitle>
      <DrawerDescription>Drawer description</DrawerDescription>
    </DrawerHeader>
    <div className="p-4">Drawer content</div>
  </DrawerContent>
</Drawer>
```

#### Sheet

Side sheet overlay.

```typescript
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
      <SheetDescription>Sheet description</SheetDescription>
    </SheetHeader>
    <div>Sheet content</div>
  </SheetContent>
</Sheet>
```

#### Popover

Floating content container.

```typescript
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

<Popover>
  <PopoverTrigger asChild>
    <Button>Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Popover content</p>
  </PopoverContent>
</Popover>
```

#### Tooltip

Hover tooltip.

```typescript
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <InfoIcon />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Helpful information</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### Navigation Components

#### Breadcrumb

Navigation breadcrumbs.

```typescript
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Settings</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

#### Dropdown Menu

Dropdown menu component.

```typescript
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### Navigation Menu

Complex navigation menus.

```typescript
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from '@/components/ui/navigation-menu';

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/docs">
          Documentation
        </NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

#### Pagination

Page navigation controls.

```typescript
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

---

### Data Display Components

#### Table

Data table component.

```typescript
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Avatar

User avatar component.

```typescript
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

<Avatar>
  <AvatarImage src="/avatars/user.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

#### Calendar

Date picker calendar.

```typescript
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

function MyComponent() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return <Calendar mode="single" selected={date} onSelect={setDate} />;
}
```

#### Hover Card

Rich hover popup.

```typescript
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="link">@username</Button>
  </HoverCardTrigger>
  <HoverCardContent>
    <div>User profile information</div>
  </HoverCardContent>
</HoverCard>
```

---

## 📦 Complete Component List

### All 46 shadcn/ui Components

1. **Accordion** - Collapsible content sections
2. **Alert** - Important message display
3. **Alert Dialog** - Confirmation dialogs
4. **Aspect Ratio** - Maintain aspect ratio
5. **Avatar** - User profile images
6. **Badge** - Status indicators
7. **Breadcrumb** - Navigation breadcrumbs
8. **Button** - Clickable buttons
9. **Calendar** - Date picker
10. **Card** - Content containers
11. **Carousel** - Image/content carousel
12. **Chart** - Data visualization
13. **Checkbox** - Checkbox input
14. **Collapsible** - Expandable content
15. **Command** - Command palette
16. **Context Menu** - Right-click menu
17. **Dialog** - Modal dialogs
18. **Drawer** - Side panel
19. **Dropdown Menu** - Dropdown menus
20. **Form** - Form components
21. **Hover Card** - Rich hover popup
22. **Input** - Text input
23. **Input OTP** - OTP input
24. **Label** - Form labels
25. **Menubar** - Menu bar
26. **Navigation Menu** - Complex navigation
27. **Pagination** - Page navigation
28. **Popover** - Floating content
29. **Progress** - Progress indicator
30. **Radio Group** - Radio button group
31. **Resizable** - Resizable panels
32. **Scroll Area** - Custom scrollbar
33. **Select** - Dropdown select
34. **Separator** - Divider lines
35. **Sheet** - Side sheet overlay
36. **Sidebar** - Navigation sidebar
37. **Skeleton** - Loading placeholder
38. **Slider** - Range slider
39. **Sonner** - Toast notifications
40. **Switch** - Toggle switch
41. **Table** - Data tables
42. **Tabs** - Tabbed interface
43. **Textarea** - Multi-line text input
44. **Toggle** - Toggle button
45. **Toggle Group** - Toggle button group
46. **Tooltip** - Hover tooltips

---

## 🎨 Component Patterns

### Pattern 1: Form with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Pattern 2: Card with Actions

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function UserCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Role: {user.role}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">View</Button>
        <Button>Edit</Button>
      </CardFooter>
    </Card>
  );
}
```

### Pattern 3: Dialog with Form

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function CreateUserDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter email" />
          </div>
        </div>
        <Button className="w-full">Create</Button>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🏢 Page-Specific Components

### CreateTenantModal

**Purpose**: Streamlined modal for creating new tenant organizations with essential information only.

**Location**: `src/pages/platform/tenant/components/CreateTenantModal.tsx`

#### Props

```typescript
interface CreateTenantModalProps {
  onTenantCreated?: (tenant: Tenant) => void;
  triggerButton?: React.ReactNode;
}
```

#### Features

- **Simplified Form**: Only essential tenant fields (name, label, description, status)
- **Direct Lookup Integration**: Uses lookup data directly without transformations
- **Validation**: Regex validation for tenant name (letters, numbers, underscores only)
- **Status Dropdown**: Populated from TENANT_STATUS lookup data
- **Zod Schema**: Form validation with proper error handling
- **Loading States**: During form submission
- **Form Reset**: Automatic reset on successful creation

#### Usage Example

```typescript
<CreateTenantModal
  onTenantCreated={(newTenant) => {
    setTenants(prev => [newTenant, ...prev]);
  }}
  triggerButton={<Button>Create New Tenant</Button>}
/>
```

#### Form Schema

```typescript
const createTenantFormSchema = z.object({
  name: z
    .string()
    .min(1, "Tenant name is required")
    .max(255)
    .regex(
      /^[a-zA-Z0-9_]*$/,
      "Tenant name can only contain letters, numbers, and underscores"
    ),
  label: z
    .string()
    .min(1, "Label is required")
    .max(50, "Label cannot exceed 50 characters"),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required"),
});
```

#### Form Fields

- **Tenant Name**: Required field with regex validation (`/^[a-zA-Z0-9_]*$/`)
- **Label**: Required field with 50 character limit
- **Description**: Optional textarea for additional details
- **Status**: Required dropdown populated from lookup data

#### Lookup Integration

```typescript
// Direct access to lookup data - no transformations
const tenantStatusType = useSelector((state: RootState) =>
  selectLookupTypeByName(state, 'TENANT_STATUS')
);

// Direct mapping in dropdown
{tenantStatusType?.lookups.map((item) => (
  <option key={item.id} value={item.name}>
    {item.label}
  </option>
))}
```

### EditTenantModal

**Purpose**: Modal for editing existing tenant information with form validation and save/cancel actions.

**Location**: `src/pages/platform/tenant/components/EditTenantModal.tsx`

#### Props

```typescript
interface EditTenantModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditTenantFormData) => Promise<void>;
}
```

#### Features

- Pre-populated form fields with existing tenant data
- Zod validation schema for form validation
- Loading states during save operation
- Archive status toggle (Switch component)
- Save and Cancel buttons with proper states
- Auto-close on successful save
- Form reset functionality

#### Usage Example

```typescript
<EditTenantModal
  tenant={selectedTenant}
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  onSave={async (data) => {
    await dispatch(updateTenantAction({
      tenantId: tenant.id,
      updateData: data
    })).unwrap();
  }}
/>
```

#### Form Schema

```typescript
const editTenantFormSchema = z.object({
  label: z.string().min(2).max(255),
  description: z.string().optional(),
  isArchived: z.boolean(),
});
```

#### Form Fields

- **Tenant Name**: Read-only display field (cannot be changed)
- **Display Label**: Required text input with validation
- **Description**: Optional textarea for additional details
- **Archive Status**: Switch toggle for archiving/unarchiving

### EditUserModal

**Purpose**: Modal for editing existing user information with form validation and role management.

**Location**: `src/pages/platform/tenant/components/EditUserModal.tsx`

#### Props

```typescript
interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onUserUpdated?: () => void;
}
```

#### Features

- Pre-populated form fields with existing user data
- Zod validation schema for form validation
- Loading states during save operation
- Role management with multi-select
- Status dropdown
- Save and Cancel buttons with proper states
- Auto-close on successful update
- Form reset functionality

#### Usage Example

```typescript
<EditUserModal
  isOpen={!!editingUserId}
  onClose={() => setEditingUserId(null)}
  userId={editingUserId}
  onUserUpdated={fetchUsers}
/>
```

#### API Integration

- **Endpoint**: `PUT /api/user/:id`
- **Redux Action**: `updateUserAction()`
- **Success**: Calls `onUserUpdated()` callback and closes modal
- **Error**: Displays error message using toast notification

---

### TenantUsers

**Purpose**: Dedicated page for managing users within a specific tenant organization with comprehensive user management functionality.

**Location**: `src/pages/platform/tenant/TenantUsers.tsx`

#### Props

```typescript
// No props - uses URL parameters and Redux state
export default function TenantUsers()
```

#### Features

- **Complete User Management**: Full CRUD operations for tenant users
- **User Table**: Comprehensive user listing with all user information
- **Modal Management**: Unified modal state management for all user operations
- **User Actions**: Add, edit, update password, update login email, update status & roles
- **Breadcrumb Navigation**: Clear navigation context showing tenant hierarchy
- **Error Handling**: Proper loading states and error handling
- **Responsive Design**: Mobile-friendly table and modal layouts

#### User Management Features

- **Add User**: Create new users via UserWizard modal
- **Edit User**: Edit existing users via UserWizard modal
- **Update Password**: Reset user passwords via dedicated modal
- **Update Login Email**: Manage user authentication emails
- **Update Status & Roles**: Modify user status and role assignments
- **User Table**: Display users with name, email, phone, roles, status, and creation date

#### Modal Management

```typescript
// Modal keys for this page
const modalKeys = {
  USER_WIZARD: "user_wizard",
  UPDATE_PASSWORD: "update_password",
  UPDATE_AUTH_EMAIL: "update_auth_email",
  UPDATE_STATUS_ROLES: "update_status_roles",
} as const;

// Single modal state management
const [currentModal, setCurrentModal] = useState<ModalName>(null);
const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
const [selectedUserName, setSelectedUserName] = useState<string | undefined>(undefined);
```

#### Usage Example

```typescript
// Accessible via navigation from TenantDetail page
// Route: /platform/tenant/:id/users
// Breadcrumbs: Dashboard → Tenants → [Tenant Name] → Users
```

#### API Integration

- **User List**: `GET /api/user/list?tenantId={tenantId}`
- **User Creation**: `POST /api/user/create` (via UserWizard)
- **User Updates**: `PUT /api/user/:id/*` (via various modals)
- **Password Update**: `PUT /api/user/:id/password`
- **Auth Email Update**: `PUT /api/user/:id/auth-email`

#### Navigation Flow

```
Platform Dashboard → Tenants → Tenant Detail → [Manage Users] → Tenant Users
                   ↓
              [Add User] button
```

#### Key Benefits

- **Separation of Concerns**: Dedicated page for user management vs. tenant details
- **Better Performance**: TenantDetail loads faster without user data
- **Enhanced UX**: Focused interface for user management tasks
- **Scalability**: Can handle large user lists efficiently
- **Consistency**: Unified modal management pattern

---

### TenantDetail

**Purpose**: Tenant information display page with navigation to user management and tenant view.

**Location**: `src/pages/platform/tenant/TenantDetail.tsx`

#### Props

```typescript
// No props - uses URL parameters and Redux state
export default function TenantDetail()
```

#### Features

- **Tenant Information Display**: Complete tenant details and metadata
- **Navigation Actions**: Links to tenant users and tenant view
- **Edit Functionality**: Modal for editing tenant information
- **Breadcrumb Navigation**: Clear navigation context
- **Status Display**: Visual status indicators and badges
- **Responsive Design**: Mobile-friendly layout

#### Navigation Actions

- **Go to Tenant View**: Navigate to `/tenant/:tenantId/home` for tenant context
- **Edit Tenant**: Open modal for editing tenant information
- **Manage Users**: Navigate to dedicated TenantUsers page

#### Usage Example

```typescript
// Accessible via navigation from Tenants page
// Route: /platform/tenant/:id
// Breadcrumbs: Dashboard → Tenants → [Tenant Name]
```

#### Key Benefits

- **Focused Interface**: Only tenant information, no user management clutter
- **Clear Navigation**: Easy access to related functionality
- **Better Performance**: Faster loading without user data
- **Separation of Concerns**: Dedicated pages for different functions

---

### TenantCard

**Purpose**: Individual tenant display card with actions and status information.

**Location**: `src/pages/platform/tenant/components/TenantCard.tsx`

#### Props

```typescript
interface TenantCardProps {
  tenant: Tenant;
  onEdit?: (tenant: Tenant) => void;
}
```

#### Features

- Tenant information display
- Archive status badge
- User count and creation date
- View button (navigates to TenantDetail page)
- Edit action button with callback
- Responsive design
- Icon integration
- Built-in navigation using React Router

#### Usage Example

```typescript
<TenantCard
  tenant={tenant}
  onEdit={(tenant) => openEditModal(tenant)}
/>
```

#### Navigation Behavior

- **View Button**: Automatically navigates to `/platform/tenant/{tenant.id}`
- **Edit Button**: Calls the `onEdit` callback if provided
- **Direct Navigation**: Uses `useNavigate()` hook for seamless routing

#### Tenant Type

```typescript
interface Tenant {
  id: number;
  name: string;
  label: string;
  description: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  userCount: number;
}
```

#### Card Structure

```typescript
<Card>
  <CardHeader>
    {/* Tenant name, archive badge */}
  </CardHeader>
  <CardContent>
    {/* Description, stats, action buttons */}
  </CardContent>
</Card>
```

---

## 🔗 Related Documentation

- [Architecture](architecture.md) - System architecture overview
- [Pages](pages.md) - Page component documentation
- [Utils](utils.md) - Utility functions including `cn()`
- [Getting Started](../getting-started.md) - Component usage patterns

---

## 📚 External Resources

- **shadcn/ui Documentation**: https://ui.shadcn.com
- **Radix UI**: https://www.radix-ui.com
- **Tailwind CSS**: https://tailwindcss.com

---

**For styling patterns**: [Getting Started Guide](../getting-started.md#-coding-standards)
