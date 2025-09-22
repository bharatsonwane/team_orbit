# Pages Directory

This directory contains all page components for the TeamOrbit frontend application.

## 📁 Structure

```
src/pages/
├── Home.tsx              # Landing page
├── Login.tsx             # User authentication
├── Signup.tsx            # User registration
├── Dashboard.tsx         # Main dashboard
└── docs/                 # Page-specific documentation
    ├── README.md
    ├── AUTHENTICATION.md
    └── ROUTING.md
```

## 🎯 Page Components

### Home Page (`Home.tsx`)

- **Route:** `/`
- **Purpose:** Landing page with navigation to auth pages
- **Features:**
  - Hero section with call-to-action
  - Feature showcase cards
  - Navigation buttons to login/signup
  - Theme toggle in header

### Login Page (`Login.tsx`)

- **Route:** `/login`
- **Purpose:** User authentication
- **Features:**
  - Email and password form
  - Form validation
  - Loading states
  - Navigation to signup
  - Redirect to dashboard on success

### Signup Page (`Signup.tsx`)

- **Route:** `/signup`
- **Purpose:** User registration
- **Features:**
  - Complete registration form
  - Real-time validation
  - Error handling with visual feedback
  - Password confirmation
  - Navigation to login
  - Redirect to dashboard on success

### Dashboard Page (`Dashboard.tsx`)

- **Route:** `/dashboard`
- **Purpose:** Main application dashboard
- **Features:**
  - Theme demonstration
  - Interactive elements showcase
  - Navigation menu
  - Theme information display

## 🎨 Common Patterns

### Page Layout Structure

```tsx
export default function PageName() {
  return (
    <div className='min-h-screen bg-background relative'>
      {/* Theme toggle in top right */}
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>

      {/* Page content */}
      <div className='container mx-auto px-4 py-8'>
        {/* Page-specific content */}
      </div>
    </div>
  );
}
```

### Form Pages

```tsx
export default function FormPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background p-4 relative'>
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>

      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Form Title</CardTitle>
          <CardDescription>Form description</CardDescription>
        </CardHeader>
        <CardContent>{/* Form content */}</CardContent>
        <CardFooter>{/* Form actions */}</CardFooter>
      </Card>
    </div>
  );
}
```

## 🚀 Usage

### Importing Pages

```tsx
// In App.tsx
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
```

### Navigation Between Pages

```tsx
import { Link, useNavigate } from 'react-router-dom';

// Link component
<Link to='/dashboard'>Go to Dashboard</Link>;

// Programmatic navigation
const navigate = useNavigate();
navigate('/dashboard');
```

## 📚 Documentation

- [Authentication Pages](./docs/AUTHENTICATION.md) - Login/signup implementation
- [Routing Guide](./docs/ROUTING.md) - Navigation patterns
- [Page Development](./docs/DEVELOPMENT.md) - Creating new pages

## 🔧 Adding New Pages

### 1. Create Page Component

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

### 2. Add Route

```tsx
// src/App.tsx
import NewPage from './pages/NewPage';

// Add to Routes
<Route path='/new-page' element={<NewPage />} />;
```

### 3. Add Navigation

```tsx
// Add links where needed
<Link to='/new-page'>New Page</Link>
```

## 🎨 Theming

All pages support the theme system:

- Include `ThemeToggle` in top right
- Use theme-aware CSS classes
- Test in both light and dark modes
- Follow consistent layout patterns

## 🔍 Best Practices

### 1. Page Structure

- Use consistent layout patterns
- Include theme toggle in top right
- Use semantic HTML structure
- Ensure responsive design

### 2. Navigation

- Provide clear navigation paths
- Use consistent link styling
- Include breadcrumbs for complex flows
- Handle back navigation appropriately

### 3. Forms

- Include proper validation
- Show loading states
- Provide clear error messages
- Use accessible form controls

### 4. Performance

- Use lazy loading for large pages
- Optimize images and assets
- Minimize bundle size
- Use code splitting where appropriate
