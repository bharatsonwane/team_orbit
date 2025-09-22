# shadcn/ui Components

This directory contains all the shadcn/ui components for the TeamOrbit frontend application. These components are built on top of Radix UI primitives and styled with Tailwind CSS.

## 📁 Available Components

### **Layout & Navigation**

- `accordion.tsx` - Collapsible content sections
- `breadcrumb.tsx` - Navigation breadcrumbs
- `menubar.tsx` - Menu bar component
- `navigation-menu.tsx` - Navigation menu with dropdowns
- `pagination.tsx` - Pagination controls
- `sidebar.tsx` - Sidebar layout component
- `separator.tsx` - Visual separator line
- `tabs.tsx` - Tabbed interface
- `resizable.tsx` - Resizable panels

### **Forms & Inputs**

- `button.tsx` - Button component with variants
- `checkbox.tsx` - Checkbox input
- `form.tsx` - Form wrapper with validation
- `input.tsx` - Text input field
- `input-otp.tsx` - OTP input field
- `label.tsx` - Form label
- `radio-group.tsx` - Radio button group
- `select.tsx` - Select dropdown
- `slider.tsx` - Range slider
- `switch.tsx` - Toggle switch
- `textarea.tsx` - Multi-line text input
- `toggle.tsx` - Toggle button
- `toggle-group.tsx` - Group of toggle buttons

### **Feedback & Display**

- `alert.tsx` - Alert messages
- `alert-dialog.tsx` - Modal alert dialog
- `badge.tsx` - Status badges
- `card.tsx` - Content card container
- `progress.tsx` - Progress bar
- `skeleton.tsx` - Loading skeleton
- `sonner.tsx` - Toast notifications
- `table.tsx` - Data table
- `tooltip.tsx` - Hover tooltips

### **Overlays & Modals**

- `dialog.tsx` - Modal dialog
- `drawer.tsx` - Mobile drawer
- `hover-card.tsx` - Hover card overlay
- `popover.tsx` - Popover overlay
- `sheet.tsx` - Side sheet overlay

### **Data Display**

- `avatar.tsx` - User avatar
- `calendar.tsx` - Date picker calendar
- `carousel.tsx` - Image/content carousel
- `chart.tsx` - Chart components
- `command.tsx` - Command palette
- `scroll-area.tsx` - Custom scrollbar

### **Interactive**

- `collapsible.tsx` - Collapsible content
- `context-menu.tsx` - Right-click context menu
- `dropdown-menu.tsx` - Dropdown menu

### **Utilities**

- `aspect-ratio.tsx` - Aspect ratio container

## 🚀 Usage Examples

### **Basic Components**

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Card</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div>
            <Label htmlFor='name'>Name</Label>
            <Input id='name' placeholder='Enter your name' />
          </div>
          <Button>Submit</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### **Form Components**

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='Enter your email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>Login</Button>
      </form>
    </Form>
  );
}
```

### **Data Display**

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function UsersTable({ users }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell>
              <div className='flex items-center space-x-2'>
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <span>{user.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={user.active ? 'default' : 'secondary'}>
                {user.active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### **Overlays & Modals**

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

function ModalExample() {
  return (
    <div className='space-x-4'>
      {/* Regular Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <p>Dialog content goes here.</p>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant='destructive'>Delete Item</Button>
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
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Popover content goes here.</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

### **Navigation Components**

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

function NavigationExample() {
  return (
    <div className='space-y-8'>
      {/* Tabs */}
      <Tabs defaultValue='account' className='w-full'>
        <TabsList>
          <TabsTrigger value='account'>Account</TabsTrigger>
          <TabsTrigger value='password'>Password</TabsTrigger>
        </TabsList>
        <TabsContent value='account'>Account settings content.</TabsContent>
        <TabsContent value='password'>Password settings content.</TabsContent>
      </Tabs>

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href='/'>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/components'>Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Navigation Menu */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className='grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]'>
                <li className='row-span-3'>
                  <NavigationMenuLink asChild>
                    <a
                      className='flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md'
                      href='/'
                    >
                      <div className='mb-2 mt-4 text-lg font-medium'>
                        shadcn/ui
                      </div>
                      <p className='text-sm leading-tight text-muted-foreground'>
                        Beautifully designed components built with Radix UI and
                        Tailwind CSS.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
```

## ✅ Benefits

### **1. Consistency**

- **Design System** - Consistent look and feel across the application
- **Accessibility** - Built-in accessibility features from Radix UI
- **Theme Support** - Dark/light mode support out of the box

### **2. Developer Experience**

- **TypeScript** - Full TypeScript support
- **Tailwind CSS** - Utility-first styling
- **Customizable** - Easy to customize with CSS variables
- **Well Documented** - Comprehensive documentation and examples

### **3. Performance**

- **Tree Shaking** - Only import what you need
- **Optimized** - Built for performance
- **Modern** - Uses latest React patterns and hooks

## 🎨 Theming

All components support theming through CSS variables defined in `src/index.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... more variables */
  }
}
```

## 📚 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Component Examples](https://ui.shadcn.com/docs/components)
