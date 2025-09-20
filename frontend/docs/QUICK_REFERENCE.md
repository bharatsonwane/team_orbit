# Quick Reference Guide

Quick commands and common tasks for the TeamOrbit frontend project.

## 🚀 Common Commands

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Adding Components

```bash
# Add shadcn/ui component
npx shadcn@latest add [component-name]

# Examples
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
```

### Project Structure

```
frontend/
├── docs/                    # Documentation
│   ├── setup/              # Setup guides
│   ├── development/        # Development guidelines
│   ├── features/           # Feature documentation
│   ├── components/         # Component docs
│   └── deployment/         # Deployment guides
├── src/
│   ├── components/         # Reusable components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── pages/             # Page components
│   ├── lib/               # Utilities
│   └── App.tsx            # Main app
└── package.json
```

## 🎨 Theme Development

### Theme Classes

```tsx
// Background and text
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground">
<div className="text-muted-foreground">

// Interactive elements
<button className="hover:bg-accent focus:ring-ring">
<div className="border border-border">
```

### Theme Toggle

```tsx
import { ThemeToggle } from '@/components/theme-toggle';

// Add to any page
<div className='absolute top-4 right-4'>
  <ThemeToggle />
</div>;
```

## 🔧 Component Development

### Creating New Components

```tsx
// src/components/MyComponent.tsx
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div className='bg-card text-card-foreground p-4 rounded-lg'>
      <h3 className='text-lg font-semibold mb-2'>{title}</h3>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
}
```

### Creating New Pages

```tsx
// src/pages/NewPage.tsx
import { ThemeToggle } from '@/components/theme-toggle';

export default function NewPage() {
  return (
    <div className='min-h-screen bg-background relative'>
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>
      {/* Page content */}
    </div>
  );
}
```

## 🛣️ Routing

### Adding New Routes

The new unified navigation system makes adding routes simple:

```tsx
// src/config/navigation.tsx
{
  title: 'New Feature',
  icon: NewFeatureIcon,
  href: '/new-feature',
  authRoles: [roleKeys.ANY],
  element: <NewFeatureComponent />,
  description: 'New feature description',
  layout: 'app',
}
```

This automatically:
- ✅ Adds to sidebar navigation
- ✅ Creates the route with protection
- ✅ Applies role-based access control
- ✅ Uses specified layout

### Navigation

```tsx
import { Link, useNavigate } from 'react-router-dom';

// Link component
<Link to='/dashboard'>Go to Dashboard</Link>;

// Programmatic navigation
const navigate = useNavigate();
navigate('/dashboard');
```

## 🎨 Styling Guidelines

### Responsive Design

```tsx
// Mobile-first approach
<div className="p-4 md:p-6 lg:p-8">
<div className="text-sm md:text-base lg:text-lg">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### Spacing

```tsx
// Consistent spacing
<div className="space-y-4">  // Vertical spacing
<div className="space-x-2">  // Horizontal spacing
<div className="p-4">         // Padding
<div className="m-4">         // Margin
```

## 🔍 Common Issues

### Path Alias Not Working

- Check `tsconfig.json` and `tsconfig.app.json`
- Verify `vite.config.ts` has resolve alias
- Restart dev server

### Theme Not Working

- Ensure `ThemeProvider` wraps the app
- Check CSS variables in `index.css`
- Verify `useTheme` is used within provider

### Components Not Styled

- Check Tailwind CSS configuration
- Verify `@import "tailwindcss"` in `index.css`
- Ensure correct class names

## 📚 Documentation Links

- [Complete Setup Guide](./setup/SETUP.md)
- [Development Guidelines](./development/DEVELOPMENT.md)
- [Theming System](./features/THEMING.md)
- [Component Library](./components/COMPONENTS.md)
- [Authentication Guide](./features/AUTHENTICATION.md)
- [Routing Guide](./features/ROUTING.md)
- [Deployment Guide](./deployment/DEPLOYMENT.md)

## 🚀 Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Development server running (`npm run dev`)
- [ ] Theme toggle working
- [ ] All routes accessible
- [ ] No console errors
- [ ] Responsive design working

## 💡 Tips

1. **Always use theme-aware classes** - `bg-background` instead of `bg-white`
2. **Test in both themes** - Light and dark mode
3. **Use TypeScript** - Define interfaces for props
4. **Follow naming conventions** - PascalCase for components
5. **Keep components small** - Single responsibility principle
6. **Use semantic HTML** - Proper heading hierarchy
7. **Test responsiveness** - Mobile, tablet, desktop
8. **Check accessibility** - ARIA labels, keyboard navigation
