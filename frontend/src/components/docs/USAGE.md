# Component Usage Guide

Detailed usage examples and patterns for all components in the TeamOrbit frontend.

## 🎨 UI Components

### Button

```tsx
import { Button } from "@/components/ui/button"

// Basic usage
<Button>Click me</Button>

// Variants
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon only</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading</Button>

// With icons
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>
```

### Input

```tsx
import { Input } from "@/components/ui/input"

// Basic input
<Input placeholder="Enter text..." />

// Form input with label
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="m@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>

// Input with error state
<Input
  className={error ? "border-destructive" : ""}
  placeholder="Enter text..."
/>
```

### Card

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Basic card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Simple card
<Card className="p-6">
  <h3 className="text-lg font-semibold">Simple Card</h3>
  <p className="text-muted-foreground">Content here</p>
</Card>
```

### Form Components

```tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Form with validation
<form onSubmit={handleSubmit} className='space-y-4'>
  <div className='space-y-2'>
    <Label htmlFor='name'>Name</Label>
    <Input
      id='name'
      value={name}
      onChange={e => setName(e.target.value)}
      required
    />
  </div>
  <Button type='submit'>Submit</Button>
</form>;
```

## 🎨 Custom Components

### ThemeProvider

```tsx
import { ThemeProvider } from '@/components/theme-provider';

// Wrap your app
function App() {
  return (
    <ThemeProvider defaultTheme='system'>
      <YourApp />
    </ThemeProvider>
  );
}

// Usage in components
import { useTheme } from '@/components/theme-provider';

function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Switch to Dark</button>
    </div>
  );
}
```

### ThemeToggle

```tsx
import { ThemeToggle } from "@/components/theme-toggle"

// Basic usage
<ThemeToggle />

// In page header
<div className="absolute top-4 right-4">
  <ThemeToggle />
</div>

// In navigation
<nav className="flex items-center gap-4">
  <Link to="/">Home</Link>
  <ThemeToggle />
</nav>
```

## 🎨 Styling Patterns

### Theme-Aware Styling

```tsx
// Background and text colors
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground">
<div className="text-muted-foreground">

// Interactive states
<button className="hover:bg-accent focus:ring-ring">
<div className="border border-border">

// Status colors
<div className="text-destructive">Error message</div>
<div className="text-green-600">Success message</div>
```

### Responsive Design

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive text
<h1 className="text-2xl md:text-4xl lg:text-6xl">

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
```

### Layout Patterns

```tsx
// Page layout
<div className="min-h-screen bg-background">
  <header className="border-b bg-card">
    {/* Header content */}
  </header>
  <main className="container mx-auto px-4 py-8">
    {/* Main content */}
  </main>
</div>

// Card layout
<div className="space-y-4">
  <Card>
    {/* Card content */}
  </Card>
</div>

// Form layout
<form className="space-y-4 max-w-md">
  {/* Form fields */}
</form>
```

## 🔧 Component Composition

### Building Complex Components

```tsx
// Form component
function UserForm({ user, onSubmit, onCancel }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='firstName'>First Name</Label>
              <Input id='firstName' defaultValue={user?.firstName} />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='lastName'>Last Name</Label>
              <Input id='lastName' defaultValue={user?.lastName} />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={onCancel} variant='outline'>
          Cancel
        </Button>
        <Button type='submit'>Save</Button>
      </CardFooter>
    </Card>
  );
}
```

### Reusable Patterns

```tsx
// Loading state
function LoadingButton({ loading, children, ...props }) {
  return (
    <Button disabled={loading} {...props}>
      {loading ? 'Loading...' : children}
    </Button>
  );
}

// Error display
function ErrorMessage({ error }) {
  if (!error) return null;

  return <div className='text-sm text-destructive'>{error}</div>;
}
```

## 🎯 Best Practices

### 1. Component Design

- Keep components small and focused
- Use TypeScript interfaces for props
- Include default values for optional props
- Export as default for page components

### 2. Styling

- Use theme-aware CSS classes
- Follow responsive design patterns
- Maintain consistent spacing
- Test in both light and dark modes

### 3. Accessibility

- Include proper ARIA labels
- Support keyboard navigation
- Ensure proper contrast ratios
- Use semantic HTML elements

### 4. Performance

- Use React.memo for expensive components
- Avoid unnecessary re-renders
- Optimize bundle size
- Use dynamic imports for large components
