# Configuration Reference

Complete documentation for application configuration and environment variables.

## 📚 Overview

TeamOrbit frontend uses environment variables for configuration management, ensuring secure and flexible deployment across different environments.

## 📁 Configuration Files

```
frontend/
├── src/config/
│   └── envVariable.ts    # Environment variable configuration
├── .env                  # Local environment variables (gitignored)
├── .env.example         # Environment variables template
└── vite.config.ts       # Vite configuration
```

---

## 🔧 envVariable.ts

Centralized environment variable configuration with TypeScript support.

### Implementation

```typescript
// src/config/envVariable.ts
interface EnvVariable {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  JWT_STORAGE_KEY: string;
  APP_NAME: string;
  APP_VERSION: string;
}

export const envVariable: EnvVariable = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5100",
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  JWT_STORAGE_KEY: import.meta.env.VITE_JWT_STORAGE_KEY || "teamorbit_token",
  APP_NAME: import.meta.env.VITE_APP_NAME || "TeamOrbit",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
};
```

### Usage

```typescript
import { envVariable } from "@/config/envVariable";

// Access environment variables
const apiUrl = envVariable.API_BASE_URL;
const timeout = envVariable.API_TIMEOUT;
```

---

## 🌍 Environment Variables

### Development (.env.development)

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5100
VITE_API_TIMEOUT=30000

# JWT Configuration
VITE_JWT_STORAGE_KEY=teamorbit_token

# Application
VITE_APP_NAME=TeamOrbit
VITE_APP_VERSION=1.0.0

# Environment
NODE_ENV=development
```

### Production (.env.production)

```bash
# API Configuration
VITE_API_BASE_URL=https://api.teamorbit.com
VITE_API_TIMEOUT=30000

# JWT Configuration
VITE_JWT_STORAGE_KEY=teamorbit_token

# Application
VITE_APP_NAME=TeamOrbit
VITE_APP_VERSION=1.0.0

# Environment
NODE_ENV=production
```

### Environment Variable Reference

| Variable               | Description              | Default                 | Required |
| ---------------------- | ------------------------ | ----------------------- | -------- |
| `VITE_API_BASE_URL`    | Backend API base URL     | `http://localhost:5100` | Yes      |
| `VITE_API_TIMEOUT`     | API request timeout (ms) | `30000`                 | No       |
| `VITE_JWT_STORAGE_KEY` | Cookie key for JWT       | `teamorbit_token`       | Yes      |
| `VITE_APP_NAME`        | Application name         | `TeamOrbit`             | No       |
| `VITE_APP_VERSION`     | Application version      | `1.0.0`                 | No       |

---

## ⚙️ Vite Configuration

### vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,
    host: true,
    open: true,
  },

  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "redux-vendor": ["@reduxjs/toolkit", "react-redux"],
          "ui-vendor": ["@radix-ui/react-slot", "lucide-react"],
        },
      },
    },
  },

  preview: {
    port: 4173,
    host: true,
  },
});
```

### Configuration Sections

#### Path Aliases

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

**Usage:**

```typescript
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContextProvider";
```

#### Development Server

```typescript
server: {
  port: 5173,
  host: true,
  open: true,
}
```

#### Build Configuration

```typescript
build: {
  outDir: 'dist',
  sourcemap: true,
}
```

---

## 🎨 Tailwind Configuration

### tailwind.config.js

```javascript
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... more theme colors
      },
    },
  },
  plugins: [],
};
```

---

## 📦 TypeScript Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 🔐 Security Best Practices

### 1. Never Commit Sensitive Data

```bash
# .gitignore
.env
.env.local
.env.production
```

### 2. Use Environment-Specific Variables

```typescript
// ✅ Good: Environment-aware
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// ❌ Bad: Hardcoded
const apiUrl = "http://localhost:5100";
```

### 3. Validate Required Variables

```typescript
const requiredEnvVars = ["VITE_API_BASE_URL", "VITE_JWT_STORAGE_KEY"];

requiredEnvVars.forEach(varName => {
  if (!import.meta.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

---

## 🌐 Multi-Environment Setup

### Local Development

```bash
cp .env.example .env
npm run dev
```

### Staging

```bash
cp .env.example .env.staging
VITE_API_BASE_URL=https://staging-api.teamorbit.com npm run build
```

### Production

```bash
cp .env.example .env.production
VITE_API_BASE_URL=https://api.teamorbit.com npm run build
```

---

## 📊 Configuration Checklist

### Development

- [ ] `.env` file created
- [ ] `VITE_API_BASE_URL` points to local backend
- [ ] Port 5173 is available
- [ ] Backend is running on configured port

### Production

- [ ] Environment variables set in hosting platform
- [ ] `VITE_API_BASE_URL` points to production API
- [ ] HTTPS enabled
- [ ] CORS configured on backend

---

## 🔗 Related Documentation

- [Utils](utils.md) - Utility functions using config
- [Getting Started](../getting-started.md) - Environment setup guide
- [Architecture](architecture.md) - System architecture

---

**For deployment configuration**: [Getting Started - Deployment Guide](../getting-started.md#-deployment-guide)
