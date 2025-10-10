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
├── AppLayout.tsx           # Main application layout wrapper
├── AppSidebar.tsx          # Dynamic navigation sidebar
├── AppRouter.tsx           # Route configuration & guards
├── ComingSoon.tsx          # Placeholder for unimplemented features
├── theme-provider.tsx      # Theme context provider
└── theme-toggle.tsx        # Theme switcher component

src/pages/
├── auth/                   # Authentication pages
├── dashboard/              # Main dashboard pages
├── admin/                  # Admin management pages
├── profile/                # User profile pages
└── tenant/                 # Tenant module
    ├── components/
    │   ├── CreateTenantDialog.tsx  # Tenant creation dialog with form
    │   ├── EditTenantDialog.tsx    # Tenant edit dialog with form
    │   └── TenantCard.tsx          # Individual tenant display card
    ├── Tenants.tsx                 # Main tenant list page
    └── TenantDetail.tsx            # Tenant detail page
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

    // Check if current route matches platform routes
    platformNavigationRoutes.forEach(route => {
      if (matchRoutePattern(route.path, location.pathname)) {
        sidebarNavigationItems = platformSidebarNavigationItems;
      }
    });

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

**`matchRoutePattern()`**: Determines if current route matches platform navigation patterns

```typescript
const matchRoutePattern = (pattern: string, currentPath: string) => {
  // Matches route patterns like '/tenant/:id' with actual paths
  // Used to determine which navigation set to show
};
```

**`isActiveLink()`**: Determines if a route is currently active

```typescript
const isActiveLink = (href: string) => {
  return location.pathname === href || location.pathname.startsWith(href + "/");
};
```

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

### CreateTenantDialog

**Purpose**: Streamlined dialog for creating new tenant organizations with essential information only.

**Location**: `src/pages/tenant/components/CreateTenantDialog.tsx`

#### Props

```typescript
interface CreateTenantDialogProps {
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
<CreateTenantDialog
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

### EditTenantDialog

**Purpose**: Modal dialog for editing existing tenant information with form validation and save/cancel actions.

**Location**: `src/pages/tenant/components/EditTenantDialog.tsx`

#### Props

```typescript
interface EditTenantDialogProps {
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
<EditTenantDialog
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

### TenantCard

**Purpose**: Individual tenant display card with actions and status information.

**Location**: `src/pages/tenant/components/TenantCard.tsx`

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

- **View Button**: Automatically navigates to `/tenant/{tenant.id}`
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
