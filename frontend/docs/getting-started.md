# Getting Started with TeamOrbit Frontend

Complete guide covering setup, development, and deployment of the TeamOrbit frontend - from local development to production.

---

## 📚 Table of Contents

- [Setup & Installation](#-setup--installation)
- [Development Guide](#-development-guide)
- [Deployment Guide](#-deployment-guide)

---

# 🚀 Setup & Installation

This section will help you set up the TeamOrbit frontend development environment from scratch.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher (comes with Node.js)
- **Git** (for version control)

### Recommended Tools

- **VS Code** (with TypeScript, ESLint, and Tailwind CSS IntelliSense extensions)
- **React Developer Tools** (browser extension)
- **Redux DevTools** (browser extension)

## 🚀 Quick Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd teamorbit-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your configuration
nano .env  # or use your preferred editor
```

### 4. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`

## 🔧 Detailed Setup Instructions

### Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5100
VITE_API_TIMEOUT=30000

# JWT Configuration
VITE_JWT_STORAGE_KEY=teamorbit_token

# Application
VITE_APP_NAME=TeamOrbit
VITE_APP_VERSION=1.0.0
```

#### Environment Variable Descriptions

| Variable               | Description              | Example                 |
| ---------------------- | ------------------------ | ----------------------- |
| `VITE_API_BASE_URL`    | Backend API base URL     | `http://localhost:5100` |
| `VITE_API_TIMEOUT`     | API request timeout (ms) | `30000`                 |
| `VITE_JWT_STORAGE_KEY` | Cookie key for JWT token | `teamorbit_token`       |
| `VITE_APP_NAME`        | Application name         | `TeamOrbit`             |
| `VITE_APP_VERSION`     | Application version      | `1.0.0`                 |

### Development Tools Setup

#### VS Code Extensions

Install these recommended extensions:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind CSS autocomplete
- **TypeScript and JavaScript Language Features** - TypeScript support
- **ES7+ React/Redux/React-Native snippets** - Code snippets

#### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["typescript", "typescriptreact"],
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 🧪 Verification

### 1. Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` - You should see the TeamOrbit home page.

### 2. Type Checking

```bash
npm run build
```

Should complete without TypeScript errors.

### 3. Linting

```bash
npm run lint
```

Should show no errors.

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Error: Port 5173 is already in use
# Solution: Kill the process or change the port
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.ts
```

#### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
npm run dev
```

---

# 💻 Development Guide

This section covers development patterns, coding standards, and best practices.

## 🎯 Development Philosophy

The TeamOrbit frontend follows these core principles:

- **Type Safety First**: Full TypeScript coverage with strict mode
- **Component Composition**: Reusable, composable components
- **Performance**: Optimized rendering with React best practices
- **Accessibility**: WCAG 2.1 AA compliant components
- **Responsive Design**: Mobile-first approach

## 🏗️ Development Patterns

### 1. Component Pattern

#### Functional Components with TypeScript

```typescript
// src/components/UserCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { User } from '@/schemaAndTypes/user';

interface UserCardProps {
  user: User;
  onEdit?: (id: number) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.firstName} {user.lastName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{user.email}</p>
        {onEdit && (
          <button onClick={() => onEdit(user.id)}>
            Edit
          </button>
        )}
      </CardContent>
    </Card>
  );
}
```

**Component Guidelines:**

- Use TypeScript interfaces for props
- Export named components (not default)
- Use `@/` path alias for imports
- Keep components focused and single-purpose
- Use shadcn/ui components for consistency

### 2. Page Pattern

```typescript
// src/pages/UserProfile.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserCard } from '@/components/UserCard';
import type { User } from '@/schemaAndTypes/user';

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data
    fetchUser(id);
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="container mx-auto p-4">
      <UserCard user={user} />
    </div>
  );
}
```

**Page Guidelines:**

- Pages are default exports
- Handle loading and error states
- Use React Router hooks for navigation
- Keep business logic in custom hooks or utils

### 3. Custom Hooks Pattern

```typescript
// src/hooks/useUser.ts
import { useState, useEffect } from "react";
import { getAxios } from "@/utils/axiosApi";
import type { User } from "@/schemaAndTypes/user";

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await getAxios().get<User>(`/api/user/${id}`);
        setUser(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return { user, loading, error };
}
```

**Hook Guidelines:**

- Prefix with `use`
- Return object with state and functions
- Handle loading and error states
- Use TypeScript for parameters and return types

### 4. Form Pattern with React Hook Form

```typescript
// src/pages/EditProfile.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { profileSchema, type ProfileFormData } from '@/schemaAndTypes/validation';

export default function EditProfile() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Submit form data
      await updateProfile(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('firstName')}
        placeholder="First Name"
      />
      {errors.firstName && (
        <p className="text-red-500">{errors.firstName.message}</p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}
```

**Form Guidelines:**

- Use React Hook Form for all forms
- Integrate Zod schemaAndTypes for validation
- Handle loading states
- Display validation errors
- Disable submit during submission

## 📝 Coding Standards

### 1. TypeScript Guidelines

```typescript
// ✅ Good: Explicit types and interfaces
interface UserProfile {
  id: number;
  name: string;
  email: string;
}

const getUser = (id: number): Promise<UserProfile> => {
  // Implementation
};

// ❌ Bad: Using 'any' type
const getUser = (id: any): any => {
  // Implementation
};
```

### 2. Component Organization

```typescript
// ✅ Good: Organized imports
import { useState, useEffect } from "react"; // React imports
import { useNavigate } from "react-router-dom"; // Third-party imports
import { Button } from "@/components/ui/button"; // UI components
import { useAuth } from "@/contexts/AuthContextProvider"; // Contexts/hooks
import type { User } from "@/schemaAndTypes/user"; // Types

// ❌ Bad: Disorganized imports
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { User } from "@/schemaAndTypes/user";
import { useNavigate } from "react-router-dom";
```

### 3. Styling with Tailwind

```typescript
// ✅ Good: Utility classes with logical grouping
<div className="flex items-center justify-between p-4 rounded-lg bg-card">
  <h1 className="text-2xl font-bold text-foreground">Title</h1>
</div>

// ✅ Good: Use cn() for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  "p-4 rounded-lg",
  isActive && "bg-primary text-primary-foreground",
  !isActive && "bg-muted"
)}>

// ❌ Bad: Inline styles
<div style={{ padding: '16px', borderRadius: '8px' }}>
```

### 4. State Management

```typescript
// ✅ Good: Use appropriate state management
// Local state for component-specific data
const [count, setCount] = useState(0);

// Context for shared state (auth, theme)
const { user } = useAuth();

// Redux for global application state
const dispatch = useDispatch();
const user = useSelector((state: RootState) => state.user.user);

// ❌ Bad: Redux for everything
const count = useSelector((state: RootState) => state.counter.count);
```

## 🧪 Testing Patterns

### Component Testing

```typescript
// tests/components/UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import { UserCard } from '@/components/UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  it('renders user information', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} />);

    screen.getByText('Edit').click();
    expect(onEdit).toHaveBeenCalledWith(1);
  });
});
```

## 🎨 Adding New Features

### Step-by-Step Guide

#### 1. Define Schema (if needed)

```typescript
// src/schemaAndTypes/feature.ts
import { z } from "zod";

export const featureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type FeatureFormData = z.infer<typeof featureSchema>;
```

#### 2. Create API Utility (if needed)

```typescript
// src/utils/api/feature.ts
import getAxios from "@/utils/axiosApi";

export const createFeature = async (data: FeatureFormData) => {
  const response = await getAxios().post("/api/feature", data);
  return response.data;
};
```

#### 3. Create Component

```typescript
// src/components/FeatureForm.tsx
export function FeatureForm() {
  // Implementation
}
```

#### 4. Create Page

```typescript
// src/pages/Feature.tsx
export default function Feature() {
  // Implementation
}
```

#### 5. Add Route

```typescript
// src/components/AppRouter.tsx
import Feature from '@/pages/Feature';

export const mainRouteList: RouteConfig[] = [
  // ... existing routes
  {
    path: '/feature',
    element: <AppLayout><Feature /></AppLayout>,
    allowedRoles: [userRoleKeys.PLATFORM_USER],
  },
];
```

---

# 🚀 Deployment Guide

This section covers deploying the TeamOrbit frontend to production.

## 🚀 Deployment Overview

The frontend can be deployed to various platforms:

- **Vercel** - Recommended for Vite/React apps
- **Netlify** - Easy deployment with CI/CD
- **AWS S3 + CloudFront** - Scalable static hosting
- **Docker** - Containerized deployment
- **Traditional Server** - Nginx/Apache

## 📋 Pre-Deployment Checklist

- [ ] Update environment variables for production
- [ ] Run `npm run build` successfully
- [ ] Test production build locally (`npm run preview`)
- [ ] Update API_BASE_URL to production backend
- [ ] Enable CORS on backend for frontend domain
- [ ] Configure proper error boundaries
- [ ] Set up monitoring and analytics
- [ ] Test on multiple browsers and devices

## 🔧 Production Build

### Build for Production

```bash
# Type check
npm run build

# Preview production build locally
npm run preview
```

### Build Output

```
frontend/dist/
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
├── index.html
└── vite.svg
```

## ☁️ Vercel Deployment

### Automatic Deployment

1. **Push to GitHub**

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration

3. **Configure Environment Variables**
   - Add production environment variables in Vercel dashboard
   - VITE_API_BASE_URL=https://api.teamorbit.com

4. **Deploy**
   - Vercel automatically deploys on push to main branch

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 🌐 Netlify Deployment

### Via Git

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - New site from Git
   - Connect your repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   - Add in Netlify dashboard under Site settings > Environment

### Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --dir=dist --prod
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Build and Run

```bash
# Build image
docker build -t teamorbit-frontend .

# Run container
docker run -p 80:80 teamorbit-frontend
```

## 📊 Performance Optimization

### 1. Code Splitting

Vite automatically code-splits by route. Additional optimization:

```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('@/components/HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### 2. Image Optimization

```typescript
// Use appropriate formats
<img src="/image.webp" alt="Description" loading="lazy" />

// Responsive images
<picture>
  <source media="(min-width: 768px)" srcset="/image-large.webp" />
  <img src="/image-small.webp" alt="Description" />
</picture>
```

### 3. Bundle Analysis

```bash
# Add to package.json
"scripts": {
  "analyze": "vite-bundle-visualizer"
}

npm run analyze
```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] No console.logs in production
- [ ] Sensitive data not in client code
- [ ] HTTPS only
- [ ] CSP headers configured
- [ ] XSS protection enabled
- [ ] Regular dependency updates

### Environment Variables

```bash
# .env.production
VITE_API_BASE_URL=https://api.teamorbit.com
VITE_JWT_STORAGE_KEY=teamorbit_token

# Never commit sensitive data to Git
# Use platform-specific environment variables
```

## 📈 Monitoring

### Error Tracking

```typescript
// src/utils/errorTracking.ts
export const logError = (error: Error, context?: any) => {
  if (process.env.NODE_ENV === "production") {
    // Send to error tracking service (Sentry, etc.)
    console.error("Error:", error, context);
  } else {
    console.error("Error:", error, context);
  }
};
```

### Analytics

```typescript
// src/utils/analytics.ts
export const trackPageView = (path: string) => {
  if (process.env.NODE_ENV === "production") {
    // Send to analytics service (GA, etc.)
  }
};
```

---

## 📚 Next Steps

- **[Architecture](architecture.md)** - Understand the system design
- **[API Documentation](src/api.md)** - API integration details
- **[Components](src/components.md)** - Component library reference

---

**Happy Coding! 🚀**
