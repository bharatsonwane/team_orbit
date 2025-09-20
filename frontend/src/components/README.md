# Components Directory

This directory contains all reusable components for the TeamOrbit frontend application.

## 📁 Structure

```
src/components/
├── ui/                    # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── theme-provider.tsx     # Custom theme context
├── theme-toggle.tsx       # Theme switcher component
└── docs/                  # Component-specific documentation
    ├── README.md
    └── USAGE.md
```

## 🎨 Component Categories

### UI Components (`ui/`)

- **Source:** shadcn/ui component library
- **Purpose:** Reusable, accessible UI components
- **Examples:** Button, Input, Card, Label, Form

### Theme Components

- **`theme-provider.tsx`** - Theme context and state management
- **`theme-toggle.tsx`** - Interactive theme switcher

## 🚀 Usage

### Importing Components

```typescript
// UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

// Custom components
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
```

### Component Development

- Follow TypeScript interfaces for props
- Use theme-aware CSS classes
- Include proper accessibility attributes
- Export as default for page components

## 📚 Documentation

- [Component Usage Guide](./docs/USAGE.md) - Detailed usage examples
- [Component Development](./docs/DEVELOPMENT.md) - Development guidelines
- [shadcn/ui Components](./docs/SHADCN.md) - shadcn/ui component reference

## 🔧 Adding New Components

1. **UI Components:** Use `npx shadcn@latest add [component-name]`
2. **Custom Components:** Create in appropriate subdirectory
3. **Documentation:** Update relevant docs in `docs/` folder
4. **Exports:** Add to index files if needed

## 🎨 Theming

All components support the theme system:

- Use CSS variables for colors
- Test in both light and dark modes
- Follow theme-aware class patterns
- Ensure proper contrast ratios
