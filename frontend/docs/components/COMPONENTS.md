# Components Documentation

Complete component library documentation for the TeamOrbit frontend application.

## 📦 Navigation & Layout Components

### AppSidebar

**File:** `src/components/AppSidebar.tsx`

Professional sidebar navigation with role-based access control.

```tsx
import { AppSidebar } from '@/components/AppSidebar';

// Used within AppLayout automatically
<AppSidebar />
```

**Features:**
- **Role-based Navigation** - Shows/hides items based on user permissions
- **Collapsible Sections** - Organized feature groupings with expand/collapse
- **Active State Management** - Highlights current page and section
- **User Profile Display** - Shows logged-in user information
- **Company Branding** - Displays company logo and name
- **Theme Integration** - Built-in theme toggle in header

**Structure:**
- **Header:** Company branding + theme toggle
- **Content:** Hierarchical navigation menu
- **Footer:** User profile with avatar and role

### AppLayout

**File:** `src/components/AppLayout.tsx`

Main layout wrapper for authenticated pages.

```tsx
import { AppLayout } from '@/components/AppLayout';

<AppLayout breadcrumbs={[{ label: 'Dashboard' }]}>
  <YourPageContent />
</AppLayout>
```

**Features:**
- **Sidebar Integration** - Includes AppSidebar component
- **Breadcrumb Navigation** - Optional breadcrumb trail
- **Responsive Design** - Mobile-friendly with sidebar toggle
- **Content Area** - Proper spacing and layout for page content

### ComingSoon

**File:** `src/components/ComingSoon.tsx`

Professional placeholder for features under development.

```tsx
import { ComingSoon } from '@/components/ComingSoon';

<ComingSoon 
  title="Employee Directory" 
  description="Browse and search through all employees." 
/>
```

**Features:**
- **Professional Design** - Construction icon with card layout
- **Auto-breadcrumbs** - Generates breadcrumbs from URL path
- **Back Navigation** - "Back to Dashboard" button
- **Theme Support** - Works with dark/light mode

### AppRouter

**File:** `src/components/AppRouter.tsx`

Main application router that handles route protection, authentication, and layout rendering.

```tsx
import { RouteGuardRenderer, mainRouteList } from '@/components/AppRouter';

// Used in App.tsx
<RouteGuardRenderer authRoles={route.authRoles}>
  {route.element}
</RouteGuardRenderer>
```

**Features:**
- **Route Protection** - Validates user authentication and permissions
- **Layout Management** - Applies appropriate layout based on route configuration
- **Access Control** - Shows "Access Denied" for insufficient permissions
- **Smart Redirects** - Automatic redirect to dashboard for undefined routes
- **Nested Routing** - Handles complex routing scenarios with sub-routes

**Core Functions:**
- **`RouteGuardRenderer`** - Main component for route protection
- **`publicRouteList`** - List of public routes (login, signup)
- **`protectedRouteList`** - List of authenticated routes
- **`mainRouteList`** - Combined route list for App.tsx

## 📦 shadcn/ui Components

The application includes all shadcn/ui components for comprehensive UI development.

### Core Components

#### Button

Versatile button component with multiple variants and sizes.

```tsx
import { Button } from "@/components/ui/button"

<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button size="lg">Large</Button>
```

#### Input

Form input component with theme support.

```tsx
import { Input } from '@/components/ui/input';

<Input
  type='email'
  placeholder='Enter email'
  value={email}
  onChange={e => setEmail(e.target.value)}
/>;
```

#### Card

Flexible card component for content organization.

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>;
```

### Form Components

#### Form

React Hook Form integration with Zod validation.

```tsx
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from '@/components/ui/form';

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name='email'
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  </form>
</Form>;
```

### Layout Components

#### Sheet

Side panel component for navigation and content.

```tsx
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent>
    <p>Sheet content</p>
  </SheetContent>
</Sheet>;
```

#### Dialog

Modal dialog component for overlays.

```tsx
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>;
```

### Navigation Components

#### Navigation Menu

Accessible navigation component.

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
} from '@/components/ui/navigation-menu';

<NavigationMenu>
  <NavigationMenuItem>
    <NavigationMenuContent>
      <p>Navigation content</p>
    </NavigationMenuContent>
  </NavigationMenuItem>
</NavigationMenu>;
```

### Data Display Components

#### Table

Data table component with sorting and filtering.

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>;
```

#### Badge

Small status and label component.

```tsx
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
```

### Feedback Components

#### Alert

Alert component for important messages.

```tsx
import { Alert, AlertDescription } from '@/components/ui/alert';

<Alert>
  <AlertDescription>This is an alert message</AlertDescription>
</Alert>;
```

#### Progress

Progress bar component.

```tsx
import { Progress } from '@/components/ui/progress';

<Progress value={60} className='w-full' />;
```

## 🎨 Custom Components

### Theme Provider

Custom theme context provider for dark/light mode.

```tsx
import { ThemeProvider } from '@/components/theme-provider';

<ThemeProvider defaultTheme='system' storageKey='teamorbit-ui-theme'>
  <App />
</ThemeProvider>;
```

### Theme Toggle

Theme switching component.

```tsx
import { ThemeToggle } from '@/components/theme-toggle';

<ThemeToggle />;
```

## 📚 Available Components

### Complete shadcn/ui Library

- Accordion, Alert Dialog, Aspect Ratio, Avatar
- Badge, Breadcrumb, Button, Calendar, Card
- Carousel, Chart, Checkbox, Collapsible, Command
- Context Menu, Dialog, Drawer, Dropdown Menu
- Form, Hover Card, Input, Input OTP, Label
- Menubar, Navigation Menu, Pagination, Popover
- Progress, Radio Group, Resizable, Scroll Area
- Select, Separator, Sheet, Sidebar, Skeleton
- Slider, Sonner, Switch, Table, Tabs
- Textarea, Toggle, Toggle Group, Tooltip

## 🚀 Usage Guidelines

### Component Structure

```tsx
interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive';
}

export default function Component({
  children,
  className,
  variant = 'default',
}: ComponentProps) {
  return (
    <div className={cn('base-styles', variantStyles[variant], className)}>
      {children}
    </div>
  );
}
```

### Best Practices

1. Use TypeScript interfaces for all props
2. Include className prop for styling flexibility
3. Provide sensible defaults for optional props
4. Use cn() utility for conditional classes
5. Follow shadcn/ui patterns for consistency

## 📚 Related Documentation

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
