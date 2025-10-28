# Theme System

Complete documentation for the theming system in TeamOrbit frontend.

## 📚 Overview

TeamOrbit features a comprehensive theming system built with **CSS variables**, **Tailwind CSS 4**, and **React Context**, supporting light mode, dark mode, and system preference detection.

## 🏗️ Theme Architecture

```
Theme System
    │
    ├─> ThemeProvider (React Context)
    │   ├─> Manages theme state (light/dark/system)
    │   ├─> Persists to localStorage
    │   └─> Applies theme class to DOM
    │
    ├─> CSS Variables (index.css)
    │   ├─> :root (light theme variables)
    │   └─> .dark (dark theme variables)
    │
    ├─> Tailwind CSS 4
    │   ├─> Uses CSS variables for colors
    │   └─> Custom dark variant
    │
    └─> ThemeToggle Component
        └─> UI for switching themes
```

---

## 🎨 Theme Provider

### Implementation

**Location**: `src/components/theme-provider.tsx`

```typescript
type Theme = 'dark' | 'light' | 'system';

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
```

### Features

1. **Three Theme Modes**:
   - `light` - Light theme
   - `dark` - Dark theme
   - `system` - Follows OS preference

2. **Persistent Storage**:
   - Stores preference in `localStorage`
   - Restores on page reload

3. **System Theme Detection**:
   - Uses `prefers-color-scheme` media query
   - Automatically updates on OS theme change

4. **DOM Class Management**:
   - Adds `.dark` class to `<html>` element
   - Removes conflicting classes

### Usage

```typescript
// Wrap app in ThemeProvider (main.tsx)
import { ThemeProvider } from '@/components/theme-provider';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="system">
    <App />
  </ThemeProvider>
);

// Use theme in components
import { useTheme } from '@/components/theme-provider';

function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
      <button onClick={() => setTheme('light')}>Light Mode</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

---

## 🎨 Theme Toggle Component

### Implementation

**Location**: `src/components/theme-toggle.tsx`

```typescript
export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon'>
          <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Features

- **Animated Icon**: Sun/Moon icons with smooth transitions
- **Dropdown Menu**: Three theme options
- **Accessible**: Screen reader support with `sr-only` text
- **Keyboard Navigation**: Full keyboard support

### Usage

```typescript
import { ThemeToggle } from '@/components/theme-toggle';

// In header or sidebar
<header>
  <ThemeToggle />
</header>
```

---

## 🎨 CSS Variables & Colors

### Theme Definition

**Location**: `src/index.css`

#### Color System

TeamOrbit uses **OKLCH color space** for consistent, perceptually uniform colors:

```css
:root {
  --background: oklch(1 0 0); /* Pure white */
  --foreground: oklch(0.141 0.005 285.823); /* Dark gray */
  --primary: oklch(0.606 0.25 292.717); /* Purple */
  --primary-foreground: oklch(0.969 0.016 293.756); /* Light purple */
  /* ... more variables */
}

.dark {
  --background: oklch(0.141 0.005 285.823); /* Dark gray */
  --foreground: oklch(0.985 0 0); /* Near white */
  --primary: oklch(0.541 0.281 293.009); /* Bright purple */
  /* ... more variables */
}
```

### Complete Color Palette

#### Base Colors

| Variable       | Light Theme | Dark Theme | Usage           |
| -------------- | ----------- | ---------- | --------------- |
| `--background` | White       | Dark gray  | Page background |
| `--foreground` | Dark gray   | Near white | Text color      |

#### Interactive Colors

| Variable                 | Usage                    |
| ------------------------ | ------------------------ |
| `--primary`              | Primary actions, links   |
| `--primary-foreground`   | Text on primary          |
| `--secondary`            | Secondary actions        |
| `--secondary-foreground` | Text on secondary        |
| `--destructive`          | Delete, error actions    |
| `--muted`                | Muted backgrounds        |
| `--muted-foreground`     | Muted text               |
| `--accent`               | Hover states, highlights |
| `--accent-foreground`    | Text on accent           |

#### Layout Colors

| Variable               | Usage               |
| ---------------------- | ------------------- |
| `--card`               | Card backgrounds    |
| `--card-foreground`    | Card text           |
| `--popover`            | Popover backgrounds |
| `--popover-foreground` | Popover text        |

#### Form Colors

| Variable   | Usage             |
| ---------- | ----------------- |
| `--border` | Border color      |
| `--input`  | Input backgrounds |
| `--ring`   | Focus ring color  |

#### Sidebar Colors

| Variable                       | Usage                   |
| ------------------------------ | ----------------------- |
| `--sidebar`                    | Sidebar background      |
| `--sidebar-foreground`         | Sidebar text            |
| `--sidebar-primary`            | Sidebar active items    |
| `--sidebar-primary-foreground` | Text on sidebar primary |
| `--sidebar-accent`             | Sidebar hover           |
| `--sidebar-accent-foreground`  | Text on sidebar accent  |
| `--sidebar-border`             | Sidebar borders         |
| `--sidebar-ring`               | Sidebar focus ring      |

#### Chart Colors

| Variable                        | Usage                     |
| ------------------------------- | ------------------------- |
| `--chart-1` through `--chart-5` | Data visualization colors |

### Border Radius

```css
:root {
  --radius: 0.65rem; /* Base radius */
  --radius-sm: 0.45rem; /* Small radius */
  --radius-md: 0.55rem; /* Medium radius */
  --radius-lg: 0.65rem; /* Large radius */
  --radius-xl: 0.75rem; /* Extra large radius */
}
```

---

## 🎨 Using Theme Colors

### In Components

#### With Tailwind Classes

```typescript
// Background colors
<div className="bg-background text-foreground">
  <h1 className="text-primary">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>

// Interactive elements
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</button>

// Cards
<div className="bg-card text-card-foreground border border-border">
  Card content
</div>

// Destructive actions
<button className="bg-destructive text-white hover:bg-destructive/90">
  Delete
</button>
```

#### Dark Mode Variants

Tailwind CSS 4 uses a custom dark variant:

```css
/* In index.css */
@custom-variant dark (&:is(.dark *));
```

```typescript
// Conditional dark mode styles
<div className="bg-white dark:bg-gray-900">
  Light background, dark in dark mode
</div>

<p className="text-gray-900 dark:text-gray-100">
  Text adapts to theme
</p>
```

### Direct CSS Variables

```typescript
// Using CSS variables directly
<div style={{
  backgroundColor: 'var(--background)',
  color: 'var(--foreground)',
  borderRadius: 'var(--radius)'
}}>
  Custom styled element
</div>
```

---

## 🎨 Customizing Theme

### Changing Colors

#### Option 1: Modify CSS Variables

Edit `src/index.css`:

```css
:root {
  --primary: oklch(0.606 0.25 292.717); /* Change to your brand color */
  --radius: 0.5rem; /* Change border radius */
}
```

#### Option 2: Use shadcn/ui Theme Generator

1. Visit: https://ui.shadcn.com/themes
2. Choose colors
3. Copy generated CSS
4. Paste into `src/index.css`

### Adding Custom Colors

```css
:root {
  --custom-color: oklch(0.7 0.2 120);
  --color-custom: var(--custom-color);
}

.dark {
  --custom-color: oklch(0.6 0.25 120);
}
```

Use in components:

```typescript
<div className="text-[color:var(--custom-color)]">
  Custom colored text
</div>
```

---

## 🎨 Theme Patterns

### Pattern 1: Conditional Rendering Based on Theme

```typescript
import { useTheme } from '@/components/theme-provider';

function MyComponent() {
  const { theme } = useTheme();

  return (
    <div>
      {theme === 'dark' ? (
        <DarkModeIcon />
      ) : (
        <LightModeIcon />
      )}
    </div>
  );
}
```

### Pattern 2: Theme-Aware Components

```typescript
import { cn } from '@/lib/utils';

function ThemedCard({ children, className }) {
  return (
    <div className={cn(
      'rounded-lg border',
      'bg-card text-card-foreground',
      'shadow-sm',
      className
    )}>
      {children}
    </div>
  );
}
```

### Pattern 3: Custom Theme Toggle

```typescript
function CustomThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button onClick={cycleTheme}>
      {theme === 'light' && '☀️ Light'}
      {theme === 'dark' && '🌙 Dark'}
      {theme === 'system' && '💻 System'}
    </button>
  );
}
```

### Pattern 4: Smooth Theme Transitions

Add to `index.css`:

```css
* {
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}
```

Or per-component:

```typescript
<div className="transition-colors duration-300">
  Smooth theme transition
</div>
```

---

## 🎨 Best Practices

### 1. Always Use Theme Variables

```typescript
// ✅ Good: Uses theme variables
<div className="bg-background text-foreground">

// ❌ Bad: Hardcoded colors
<div className="bg-white text-black">
```

### 2. Test Both Themes

Always test components in both light and dark modes:

```typescript
// Ensure proper contrast in both themes
<button className="bg-primary text-primary-foreground">
  Button
</button>
```

### 3. Provide Dark Mode Variants

```typescript
// Add dark variants for custom colors
<div className="bg-gray-100 dark:bg-gray-800">
```

### 4. Use Semantic Color Names

```typescript
// ✅ Good: Semantic
<Alert className="bg-destructive text-white">Error</Alert>

// ❌ Bad: Specific color
<Alert className="bg-red-500 text-white">Error</Alert>
```

### 5. Respect System Preferences

```typescript
// Default to system theme
<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>
```

---

## 🎨 Advanced Customization

### Custom Theme Hook

```typescript
// src/hooks/useCustomTheme.ts
import { useTheme } from "@/components/theme-provider";

export function useCustomTheme() {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return { isDark, toggleTheme, theme, setTheme };
}
```

### System Theme Change Detection

```typescript
import { useEffect } from "react";
import { useTheme } from "@/components/theme-provider";

function useSystemThemeChange() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      // Force re-render on system theme change
      setTheme("system");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, setTheme]);
}
```

### Multiple Theme Variants

```typescript
// Add custom theme classes
<html className={cn(theme, customTheme)}>
  <!-- App content -->
</html>

// Define custom themes in CSS
.theme-blue {
  --primary: oklch(0.5 0.2 240);
}

.theme-green {
  --primary: oklch(0.6 0.2 140);
}
```

---

## 🎨 Troubleshooting

### Theme Not Applying

**Issue**: Theme doesn't change when toggled

**Solution**: Ensure ThemeProvider wraps your app:

```typescript
<ThemeProvider>
  <App />
</ThemeProvider>
```

### Flashing on Page Load

**Issue**: Brief flash of wrong theme on page load

**Solution**: Add script to `index.html` head:

```html
<script>
  const theme = localStorage.getItem("vite-ui-theme") || "system";
  if (
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  }
</script>
```

### Colors Not Working

**Issue**: Theme colors don't apply

**Solution**: Verify Tailwind is configured to use CSS variables:

```json
// components.json
{
  "tailwind": {
    "cssVariables": true
  }
}
```

---

## 🎨 Color Palette Reference

### Light Theme

```
Background: #FFFFFF
Foreground: #1A1A1A
Primary: #8B5CF6 (Purple)
Secondary: #F5F5F5
Muted: #F5F5F5
Accent: #F5F5F5
Destructive: #EF4444
Border: #E5E5E5
```

### Dark Theme

```
Background: #1A1A1A
Foreground: #FAFAFA
Primary: #A78BFA (Light Purple)
Secondary: #2A2A2A
Muted: #2A2A2A
Accent: #2A2A2A
Destructive: #F87171
Border: rgba(255, 255, 255, 0.1)
```

---

## 🔗 Related Documentation

- [Components](components.md) - Component library using theme
- [Architecture](../architecture.md) - Theme system architecture
- [Getting Started](../getting-started.md) - Theme setup guide

---

## 📚 External Resources

- **OKLCH Color Picker**: https://oklch.com
- **shadcn/ui Themes**: https://ui.shadcn.com/themes
- **Tailwind CSS**: https://tailwindcss.com/docs/dark-mode

---

**For implementation details**: [Getting Started Guide](../getting-started.md#-development-guide)
