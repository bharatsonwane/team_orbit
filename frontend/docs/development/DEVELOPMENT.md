# Development Guide

This document provides guidelines and best practices for developing the TeamOrbit frontend application.

## 🏗️ Architecture Overview

### Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── pages/               # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── Dashboard.tsx
│   ├── lib/                 # Utility functions
│   │   └── utils.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── components.json          # shadcn/ui config
├── package.json
├── tsconfig.json
├── vite.config.ts
└── *.md                     # Documentation
```

## 🎯 Development Principles

### 1. Component-First Development

- Build reusable, composable components
- Use TypeScript for type safety
- Follow single responsibility principle
- Keep components small and focused

### 2. Theme-Aware Development

- Always use theme-aware CSS classes
- Test components in both light and dark modes
- Use CSS variables for colors
- Ensure proper contrast ratios

### 3. Accessibility First

- Include proper ARIA labels
- Support keyboard navigation
- Ensure screen reader compatibility
- Follow WCAG guidelines

### 4. Mobile-First Design

- Start with mobile layout
- Use responsive design patterns
- Test on various screen sizes
- Optimize for touch interactions

## 🛠️ Development Workflow

### 1. Setting Up Development Environment

```bash
# Clone repository
git clone <repository-url>
cd teamorbit/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Creating New Components

#### Component Structure

```typescript
// src/components/MyComponent.tsx
import { Button } from "@/components/ui/button"

interface MyComponentProps {
  title: string
  onAction?: () => void
  variant?: "default" | "outline"
}

export default function MyComponent({
  title,
  onAction,
  variant = "default"
}: MyComponentProps) {
  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <Button variant={variant} onClick={onAction}>
        Action
      </Button>
    </div>
  )
}
```

#### Component Guidelines

- Use TypeScript interfaces for props
- Include default values for optional props
- Use theme-aware CSS classes
- Export as default
- Include JSDoc comments for complex components

### 3. Creating New Pages

#### Page Structure

```typescript
// src/pages/NewPage.tsx
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function NewPage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Theme toggle in top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Page content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">New Page</h1>
        <p className="text-muted-foreground mb-6">
          Page content goes here
        </p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
```

#### Page Guidelines

- Include theme toggle in top right
- Use consistent layout patterns
- Include navigation elements
- Use semantic HTML structure
- Ensure responsive design

### 4. Adding New Routes

#### Update App.tsx

```typescript
// Add import
import NewPage from "./pages/NewPage"

// Add route
<Route path="/new-page" element={<NewPage />} />
```

#### Add Navigation

```typescript
// Add links where needed
<Link to="/new-page">New Page</Link>
```

## 🎨 Styling Guidelines

### 1. CSS Class Naming

Use Tailwind CSS utility classes with theme-aware variants:

```typescript
// Background and text colors
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground">
<div className="text-muted-foreground">

// Interactive states
<button className="hover:bg-accent focus:ring-ring">
<div className="border border-border">

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<h1 className="text-2xl md:text-4xl lg:text-6xl">
```

### 2. Theme-Aware Styling

Always use theme-aware classes:

```typescript
// ✅ Good - theme-aware
<div className="bg-background text-foreground">

// ❌ Bad - hardcoded colors
<div className="bg-white text-black">
```

### 3. Responsive Design

Use mobile-first responsive design:

```typescript
// Mobile-first approach
<div className="p-4 md:p-6 lg:p-8">
<div className="text-sm md:text-base lg:text-lg">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### 4. Component Styling

Use consistent spacing and sizing:

```typescript
// Consistent spacing
<div className="space-y-4">
<div className="space-y-2">

// Consistent sizing
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

## 🔧 TypeScript Guidelines

### 1. Interface Definitions

Define clear interfaces for component props:

```typescript
interface UserFormProps {
  user: User;
  onSubmit: (user: User) => void;
  onCancel: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}
```

### 2. Type Safety

Use TypeScript for type safety:

```typescript
// Event handlers
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // Handle form submission
};

// State management
const [user, setUser] = useState<User | null>(null);
const [isLoading, setIsLoading] = useState<boolean>(false);
```

### 3. Generic Types

Use generic types for reusable components:

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
}
```

## 🧪 Testing Guidelines

### 1. Component Testing

Test component behavior and rendering:

```typescript
// Example test structure
describe('MyComponent', () => {
  it('renders with correct props', () => {
    // Test implementation
  });

  it('handles user interactions', () => {
    // Test implementation
  });

  it('applies theme classes correctly', () => {
    // Test implementation
  });
});
```

### 2. Theme Testing

Test components in both light and dark modes:

```typescript
// Test theme switching
it('switches theme correctly', () => {
  // Test theme switching behavior
});
```

### 3. Accessibility Testing

Test accessibility features:

```typescript
// Test keyboard navigation
it('supports keyboard navigation', () => {
  // Test keyboard interactions
});

// Test screen reader compatibility
it('has proper ARIA labels', () => {
  // Test ARIA attributes
});
```

## 🚀 Performance Guidelines

### 1. Code Splitting

Use dynamic imports for large components:

```typescript
const LazyComponent = lazy(() => import('./LazyComponent'))

// Use with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

### 2. Memoization

Use React.memo for expensive components:

```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  // Component implementation
});
```

### 3. Bundle Optimization

- Use tree shaking
- Optimize imports
- Remove unused dependencies
- Use dynamic imports for large libraries

## 🔍 Code Quality

### 1. ESLint Configuration

Follow ESLint rules for code quality:

```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### 2. Code Formatting

Use consistent code formatting:

```typescript
// Use consistent indentation
// Use meaningful variable names
// Use proper spacing
// Use consistent quotes
```

### 3. Documentation

Document complex components and functions:

```typescript
/**
 * A reusable button component with theme support
 * @param variant - The button variant
 * @param size - The button size
 * @param onClick - Click handler function
 * @param children - Button content
 */
interface ButtonProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}
```

## 🐛 Debugging

### 1. Browser DevTools

Use browser DevTools for debugging:

- Console for errors and logs
- Elements tab for DOM inspection
- Network tab for API calls
- Performance tab for optimization

### 2. React DevTools

Use React DevTools for component debugging:

- Component tree inspection
- Props and state inspection
- Performance profiling
- Hook debugging

### 3. Common Issues

- Check console for errors
- Verify imports and exports
- Check TypeScript errors
- Verify theme provider setup
- Check routing configuration

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)
