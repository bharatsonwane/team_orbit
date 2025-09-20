# Theming Setup

This project uses shadcn/ui theming with full dark/light mode support.

## Features

- ✅ **CSS Variables** - Uses CSS variables for theming (recommended by shadcn/ui)
- ✅ **Dark Mode** - Full dark mode support with `.dark` class
- ✅ **System Theme** - Automatically follows system theme preference
- ✅ **Theme Toggle** - Interactive theme switcher in the top right
- ✅ **Smooth Transitions** - Smooth transitions between themes
- ✅ **Neutral Color Palette** - Clean, professional color scheme

## Configuration

### components.json

```json
{
  "tailwind": {
    "cssVariables": true,
    "baseColor": "neutral"
  }
}
```

### CSS Variables

The theme uses CSS variables defined in `src/index.css`:

- Light theme variables in `:root`
- Dark theme variables in `.dark`
- All shadcn/ui color tokens are properly configured

## Usage

### Theme Toggle Component

```tsx
import { ThemeToggle } from '@/components/theme-toggle';

// Use in your components
<ThemeToggle />;
```

### Custom Theme Hook

```tsx
import { useTheme } from '@/hooks/use-theme';

function MyComponent() {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme();

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div>
      Current theme: {resolvedTheme}
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
    </div>
  );
}
```

### Theme-Aware Classes

```tsx
// These classes automatically adapt to the current theme
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground border">
<div className="text-muted-foreground">
```

## Available Themes

1. **Light** - Clean, bright interface
2. **Dark** - Dark interface with proper contrast
3. **System** - Follows the user's system preference

## Color Tokens

All shadcn/ui color tokens are available:

- `background`, `foreground`
- `card`, `card-foreground`
- `popover`, `popover-foreground`
- `primary`, `primary-foreground`
- `secondary`, `secondary-foreground`
- `muted`, `muted-foreground`
- `accent`, `accent-foreground`
- `destructive`
- `border`, `input`, `ring`

## References

- [shadcn/ui Theming Documentation](https://ui.shadcn.com/docs/theming)
- [shadcn/ui Components JSON](https://ui.shadcn.com/docs/components-json)
