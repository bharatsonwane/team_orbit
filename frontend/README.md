# TeamOrbit Frontend

A modern React application built with Vite, TypeScript, and shadcn/ui, featuring comprehensive theming support and authentication pages.

## 🚀 Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **React Router** - Client-side routing
- **Lucide React** - Icon library

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── AppSidebar.tsx      # Main navigation sidebar
│   │   ├── AppLayout.tsx       # Layout wrapper with sidebar
│   │   ├── AppRouter.tsx       # Main application router with route protection
│   │   ├── ComingSoon.tsx      # Placeholder for unimplemented features
│   │   ├── theme-provider.tsx  # Custom theme context
│   │   └── theme-toggle.tsx    # Theme switcher component
│   ├── config/
│   │   └── navigation.tsx      # Unified navigation and routing config
│   ├── pages/
│   │   ├── Home.tsx           # Landing page
│   │   ├── Login.tsx          # Login page
│   │   ├── Signup.tsx         # Signup page
│   │   ├── Dashboard.tsx      # Dashboard page
│   │   ├── Profile.tsx        # User profile page
│   │   ├── Admin.tsx          # Admin dashboard
│   │   └── SuperAdmin.tsx     # Super admin panel
│   ├── utils/
│   │   ├── route/             # Routing utilities
│   │   ├── authHelper.ts      # Authentication helpers
│   │   └── constants.ts       # Application constants
│   ├── schemas/
│   │   ├── user.ts            # User type definitions
│   │   └── authRoute.ts       # Route type definitions
│   ├── contexts/
│   │   └── AuthContextProvider.tsx # Authentication context
│   ├── lib/
│   │   └── utils.ts           # Utility functions
│   ├── App.tsx                # Main app with routing
│   ├── main.tsx               # App entry point
│   └── index.css              # Global styles with theme variables
├── components.json            # shadcn/ui configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
├── tsconfig.app.json          # App-specific TypeScript config
├── vite.config.ts             # Vite configuration
└── docs/                      # Comprehensive documentation
```

## 🎨 Features

### Authentication

- **Login Page** - Email/password authentication with backend integration ready
- **Signup Page** - User registration with comprehensive validation
- **Form Validation** - Real-time validation with error messages and backend compatibility
- **Loading States** - User feedback during form submission
- **JWT Token Support** - Ready for backend JWT token integration
- **Role-based UI** - Prepared for user role-based interface rendering

### Core Functionalities

TeamOrbit is designed as a comprehensive HR and team management platform:

#### 🏢 **Multi-Tenant Support**
- **Tenant Management** - Platform admins can create and manage tenant organizations
- **Automatic Admin Creation** - Each tenant gets a Tenant Admin user automatically
- **Separate workspaces** for each organization
- **Custom branding** (logo, theme, domain)
- **Comprehensive role system:** Platform and tenant-specific roles
- **Role hierarchy:** From employees to platform super admins

#### 👥 **Employee Management**
- **Employee onboarding** (profile, documents, role, department)
- **Employee directory** (searchable)
- **Department & team hierarchy**

#### ⏰ **Attendance & Leave**
- **Daily check-in / check-out**
- **Automated attendance logs**
- **Leave requests & approvals**
- **Attendance analytics** (late, absent, overtime)

#### 🎓 **Training & Learning (LMS)**
- **Create training programs** (videos, documents, quizzes)
- **Assign trainings** to employees or departments
- **Track progress & completion**
- **Quizzes/assessments** with scoring
- **Certificates** for completion

#### 📱 **Internal Social Network**
- **Newsfeed** (company announcements, updates)
- **Posts** (text, images, documents, videos)
- **Polls & surveys**
- **Reactions** (👍 ❤️ 🎉 etc)
- **Comments & threaded replies**

#### 💬 **Team Collaboration (Chat)**
- **1:1 private messaging**
- **Group chats / team channels**
- **File sharing** in chat
- **Mentions** (@user), emojis, reactions
- **Notifications** (new message, mentions, reactions)

### Navigation & Layout

- **Unified Navigation System** - Single source of truth for routes and sidebar navigation
- **Role-based Sidebar** - Dynamic navigation based on user permissions
- **Responsive Layout** - AppLayout with collapsible sidebar for all screen sizes
- **Smart Routing** - Automatic redirect to dashboard for undefined routes
- **Breadcrumb Navigation** - Context-aware navigation trails
- **Layout Flexibility** - Support for different layouts per route (app, auth, none, custom)

### Theming

- **Dark/Light Mode** - Complete theme switching
- **System Detection** - Follows OS preference
- **CSS Variables** - Theme-aware color system
- **Smooth Transitions** - Beautiful animations
- **Persistent Storage** - Remembers user preference

### UI/UX

- **Responsive Design** - Works on all screen sizes
- **Accessible Components** - ARIA labels and keyboard navigation
- **Modern Design** - Clean, professional interface
- **Component Library** - Consistent design system

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

### 🚀 Setup & Configuration

- [Project Setup](./docs/setup/SETUP.md) - Complete setup guide from scratch
- [Development Guidelines](./docs/development/DEVELOPMENT.md) - Development best practices

### 🎨 Features & Components

- [Theming System](./docs/features/THEMING.md) - Dark/light mode theming guide
- [Authentication](./docs/features/AUTHENTICATION.md) - Login/signup implementation
- [Routing & Navigation](./docs/features/ROUTING.md) - React Router setup
- [Components](./docs/components/COMPONENTS.md) - Component library documentation

### 🚀 Deployment

- [Deployment Guide](./docs/deployment/DEPLOYMENT.md) - Production deployment guide

**📖 [View All Documentation](./docs/index.md)**  
**⚡ [Quick Reference Guide](./docs/QUICK_REFERENCE.md)**

## 🎯 Available Routes

- `/` - Home page
- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - Dashboard page

## 🔧 Configuration

### shadcn/ui

Configured with:

- Style: `new-york`
- Base color: `neutral`
- CSS variables: `true`
- TypeScript: `true`

### TypeScript

- Path aliases: `@/*` → `./src/*`
- Strict mode enabled
- Modern ES2022 target

### Vite

- React plugin
- Tailwind CSS plugin
- Path resolution for aliases
- Hot module replacement

## 🎨 Theme System

The application uses a custom theme system built on CSS variables:

- **Light Theme** - Clean, bright interface
- **Dark Theme** - Dark interface with proper contrast
- **System Theme** - Follows OS preference
- **Smooth Transitions** - Animated theme changes

See [THEMING.md](./THEMING.md) for detailed information.

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open `http://localhost:5173`
5. Test theme switching with the toggle in the top right
6. Navigate between pages using the provided links

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new files
3. Follow the component structure in `src/components/`
4. Update documentation for new features
5. Test theme switching on all new components

## 📄 License

This project is part of the TeamOrbit application.
