# Library Utilities

Complete documentation for library utility functions in the TeamOrbit frontend.

## 📚 Overview

The `lib/` directory contains utility functions for working with external libraries, primarily focused on styling utilities for Tailwind CSS and component variants.

## 📁 File Structure

```
src/lib/
└── utils.ts    # Tailwind CSS utility functions
```

---

## 🎨 cn() - Class Name Utility

**Purpose**: Intelligently merges and deduplicates Tailwind CSS class names.

**Location**: `src/lib/utils.ts`

### Implementation

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### How It Works

The `cn()` function combines two powerful utilities:

1. **clsx**: Conditionally constructs className strings
2. **twMerge**: Merges Tailwind classes without conflicts

#### Step-by-Step Process

```typescript
// Input
cn("px-4", "py-2", "px-6");

// Step 1: clsx combines classes
// → 'px-4 py-2 px-6'

// Step 2: twMerge removes conflicts (keeps last px)
// → 'py-2 px-6'

// Output
("py-2 px-6");
```

---

## 🎯 Usage Examples

### Basic Usage

```typescript
import { cn } from '@/lib/utils';

// Simple class combination
<div className={cn('p-4', 'rounded-lg', 'bg-white')}>
  Content
</div>
// Output: 'p-4 rounded-lg bg-white'
```

### Conditional Classes

```typescript
import { cn } from '@/lib/utils';

function Button({ variant, disabled }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      Click me
    </button>
  );
}
```

### Overriding Classes

```typescript
import { cn } from '@/lib/utils';

function Card({ className }) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg bg-white',  // Default classes
        className                    // Override with custom classes
      )}
    >
      Content
    </div>
  );
}

// Usage
<Card className="p-6 bg-blue-50" />
// Output: 'rounded-lg p-6 bg-blue-50'
// Note: p-4 and bg-white are replaced by p-6 and bg-blue-50
```

### With Arrays

```typescript
import { cn } from '@/lib/utils';

const baseClasses = ['flex', 'items-center', 'gap-2'];
const variantClasses = {
  default: 'bg-primary text-white',
  outline: 'border border-gray-300',
};

<button className={cn(baseClasses, variantClasses.default)}>
  Button
</button>
// Output: 'flex items-center gap-2 bg-primary text-white'
```

### With Objects

```typescript
import { cn } from '@/lib/utils';

function Alert({ type, dismissible }) {
  return (
    <div
      className={cn({
        'p-4 rounded-lg': true,
        'bg-red-100 text-red-800': type === 'error',
        'bg-blue-100 text-blue-800': type === 'info',
        'pr-8': dismissible,
      })}
    >
      Alert content
    </div>
  );
}
```

---

## 🎨 Common Patterns

### Pattern 1: Component Variants

```typescript
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white',
        destructive: 'bg-red-500 text-white',
        outline: 'border border-gray-300',
        ghost: 'hover:bg-gray-100',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({ variant, size, className, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

### Pattern 2: Responsive Design

```typescript
import { cn } from '@/lib/utils';

function ResponsiveCard({ className }) {
  return (
    <div
      className={cn(
        'p-4',           // Mobile
        'md:p-6',        // Tablet
        'lg:p-8',        // Desktop
        'rounded-lg',
        'bg-white',
        className
      )}
    >
      Content
    </div>
  );
}
```

### Pattern 3: State-Based Styling

```typescript
import { cn } from '@/lib/utils';

function Input({ error, disabled, className, ...props }) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 border rounded-md',
        'focus:outline-none focus:ring-2',
        error && 'border-red-500 focus:ring-red-500',
        !error && 'border-gray-300 focus:ring-blue-500',
        disabled && 'bg-gray-100 cursor-not-allowed opacity-50',
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}
```

### Pattern 4: Dark Mode

```typescript
import { cn } from '@/lib/utils';

function Card({ className }) {
  return (
    <div
      className={cn(
        'p-6 rounded-lg border',
        'bg-white text-gray-900',           // Light mode
        'dark:bg-gray-800 dark:text-white', // Dark mode
        'border-gray-200 dark:border-gray-700',
        className
      )}
    >
      Content
    </div>
  );
}
```

### Pattern 5: Hover & Focus States

```typescript
import { cn } from '@/lib/utils';

function Link({ active, className, ...props }) {
  return (
    <a
      className={cn(
        'px-3 py-2 rounded-md transition-colors',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        active && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
        className
      )}
      {...props}
    />
  );
}
```

---

## 🛠️ Advanced Usage

### Combining Multiple Conditions

```typescript
import { cn } from '@/lib/utils';

function Badge({ variant, size, rounded, className }) {
  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center font-medium',

        // Variant styles
        variant === 'default' && 'bg-gray-100 text-gray-800',
        variant === 'primary' && 'bg-blue-100 text-blue-800',
        variant === 'success' && 'bg-green-100 text-green-800',
        variant === 'destructive' && 'bg-red-100 text-red-800',

        // Size styles
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-0.5 text-sm',
        size === 'lg' && 'px-3 py-1 text-base',

        // Shape styles
        rounded === 'full' && 'rounded-full',
        rounded === 'md' && 'rounded-md',
        rounded === 'none' && 'rounded-none',

        // Custom classes
        className
      )}
    />
  );
}
```

### With TypeScript

```typescript
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

interface CardProps extends ComponentProps<'div'> {
  variant?: 'default' | 'bordered' | 'shadow';
}

function Card({ variant = 'default', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'p-6 rounded-lg',
        variant === 'default' && 'bg-white',
        variant === 'bordered' && 'border border-gray-200',
        variant === 'shadow' && 'shadow-lg',
        className
      )}
      {...props}
    />
  );
}
```

### Dynamic Class Generation

```typescript
import { cn } from '@/lib/utils';

function getColorClasses(color: string) {
  const colors = {
    blue: 'bg-blue-500 text-white hover:bg-blue-600',
    red: 'bg-red-500 text-white hover:bg-red-600',
    green: 'bg-green-500 text-white hover:bg-green-600',
  };

  return colors[color] || colors.blue;
}

function ColoredButton({ color, className, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md transition-colors',
        getColorClasses(color),
        className
      )}
      {...props}
    />
  );
}
```

---

## 📊 Performance Considerations

### Efficient Usage

```typescript
// ✅ Good: Calculate once
const buttonClass = cn('px-4 py-2', variant, className);
return <button className={buttonClass} />;

// ❌ Bad: Calculate on every render inside JSX
return <button className={cn('px-4 py-2', variant, className)} />;
// Actually, this is fine! cn() is very fast
```

### Memoization (Usually Not Needed)

```typescript
import { useMemo } from 'react';

// Only needed for very expensive class computations
function ComplexComponent({ manyProps }) {
  const className = useMemo(
    () => cn(
      'base-class',
      // ... many conditional classes based on props
    ),
    [/* dependencies */]
  );

  return <div className={className} />;
}
```

---

## 🎯 Best Practices

### 1. Use cn() for All Class Combinations

```typescript
// ✅ Good: Always use cn()
<div className={cn('p-4', className)} />

// ❌ Bad: Template strings don't handle conflicts
<div className={`p-4 ${className}`} />
```

### 2. Put Base Classes First

```typescript
// ✅ Good: Base classes first, then variants, then custom
cn("base-class", variant === "primary" && "variant-class", className);

// ❌ Bad: Custom classes might not override properly
cn(className, "base-class", variant === "primary" && "variant-class");
```

### 3. Use Descriptive Variable Names

```typescript
// ✅ Good: Clear intent
const errorStyles = "border-red-500 text-red-600";
const baseStyles = "px-4 py-2 rounded";
cn(baseStyles, hasError && errorStyles);

// ❌ Bad: Unclear
const s1 = "border-red-500 text-red-600";
const s2 = "px-4 py-2 rounded";
cn(s2, hasError && s1);
```

### 4. Group Related Classes

```typescript
// ✅ Good: Organized grouping
cn(
  // Layout
  "flex items-center gap-2",
  // Spacing
  "px-4 py-2",
  // Colors
  "bg-white text-gray-900",
  // Borders
  "border border-gray-200 rounded-md",
  // Custom
  className
);

// ❌ Bad: Random order
cn("px-4", "bg-white", "flex", "border", "text-gray-900", "py-2");
```

### 5. Extract Complex Logic

```typescript
// ✅ Good: Extract to function
function getVariantClasses(variant: string) {
  const variants = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-200 text-gray-800',
    destructive: 'bg-red-500 text-white',
  };
  return variants[variant] || variants.primary;
}

<button className={cn('px-4 py-2', getVariantClasses(variant))} />

// ❌ Bad: Too complex inline
<button className={cn(
  'px-4 py-2',
  variant === 'primary' ? 'bg-blue-500 text-white' :
  variant === 'secondary' ? 'bg-gray-200 text-gray-800' :
  variant === 'destructive' ? 'bg-red-500 text-white' :
  'bg-blue-500 text-white'
)} />
```

---

## 🔗 Dependencies

### clsx

**Purpose**: Conditionally join class names together

**Features**:

- Accepts strings, numbers, objects, arrays
- Filters falsy values
- Handles nested arrays and objects
- Very lightweight (< 1KB)

```typescript
clsx("foo", "bar"); // 'foo bar'
clsx("foo", false && "bar"); // 'foo'
clsx({ foo: true, bar: false }); // 'foo'
clsx(["foo", "bar"]); // 'foo bar'
```

### tailwind-merge

**Purpose**: Merges Tailwind CSS classes without style conflicts

**Features**:

- Removes conflicting utility classes
- Keeps the last conflicting class
- Handles responsive variants
- Supports dark mode variants
- Handles arbitrary values

```typescript
twMerge("px-4 px-6"); // 'px-6'
twMerge("bg-red-500 bg-blue-500"); // 'bg-blue-500'
twMerge("hover:bg-red-500 hover:bg-blue-500"); // 'hover:bg-blue-500'
```

---

## 🔗 Related Documentation

- [Components](components.md) - Components using cn()
- [Theme System](theme.md) - Dark mode styling with cn()
- [Utils](utils.md) - Other utility functions

---

## 📚 External Resources

- **clsx**: https://github.com/lukeed/clsx
- **tailwind-merge**: https://github.com/dcastil/tailwind-merge
- **class-variance-authority**: https://cva.style/docs

---

**For styling patterns**: [Getting Started Guide](../getting-started.md#-styling-with-tailwind)
