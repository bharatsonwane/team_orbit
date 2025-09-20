# Config Directory

This directory contains configuration files for the TeamOrbit frontend application.

## 📁 Structure

```
src/config/
├── envVariable.ts         # Environment variable validation and configuration
└── README.md             # This file
```

## 🛠️ Configuration Files

### `envVariable.ts`

Handles environment variable validation, type safety, and configuration management using Zod schema validation.

## 🔧 Environment Variables

### Required Variables

| Variable          | Description                               | Example                     |
| ----------------- | ----------------------------------------- | --------------------------- |
| `APP_NAME`        | Application name                          | `TeamOrbit`                   |
| `APP_VERSION`     | Application version                       | `1.0.0`                     |
| `APP_ENV`         | Environment (development/production/test) | `development`               |
| `API_BASE_URL`    | Backend API base URL                      | `http://localhost:3000/api` |
| `JWT_STORAGE_KEY` | Local storage key for JWT tokens          | `teamorbit_jwt_token`         |

### Optional Variables

| Variable                 | Description                  | Default  | Example                     |
| ------------------------ | ---------------------------- | -------- | --------------------------- |
| `API_TIMEOUT`            | API request timeout in ms    | `10000`  | `15000`                     |
| `TOKEN_EXPIRY_BUFFER`    | Token expiry buffer in ms    | `300000` | `600000`                    |
| `ENABLE_DEV_TOOLS`       | Enable development tools     | `false`  | `true`                      |
| `ENABLE_ANALYTICS`       | Enable analytics tracking    | `false`  | `true`                      |
| `ENABLE_ERROR_REPORTING` | Enable error reporting       | `false`  | `true`                      |
| `GOOGLE_ANALYTICS_ID`    | Google Analytics tracking ID | -        | `GA-XXXXXXXXX`              |
| `VITE_SENTRY_DSN`        | Sentry error tracking DSN    | -        | `https://...@sentry.io/...` |

## 🚀 Usage

### Basic Usage

```typescript
import { envVariable } from '@/config/envVariable';

// Access configuration values
console.log(envVariable.APP_NAME);
console.log(envVariable.API_BASE_URL);
```

### In Components

```typescript
import { envVariable } from '@/config/envVariable';

function ApiService() {
  const apiUrl = envVariable.API_BASE_URL;
  const timeout = envVariable.API_TIMEOUT;

  // Use in API calls
  const response = await fetch(`${apiUrl}/users`, {
    signal: AbortSignal.timeout(timeout),
  });
}
```

### Feature Flags

```typescript
import { envVariable } from "@/config/envVariable"

function DevTools() {
  if (envVariable.ENABLE_DEV_TOOLS) {
    return <DevToolsPanel />
  }
  return null
}
```

## 🔒 Security Notes

### Client-Side Variables

- All `VITE_` prefixed variables are exposed to the browser
- Never put sensitive data (secrets, passwords) in environment variables
- Use for configuration only, not for secrets

### Safe Variables

✅ **Safe to use:**

- API URLs
- Feature flags
- App configuration
- Public tracking IDs

❌ **Never use:**

- Database credentials
- API secrets
- Private keys
- Sensitive configuration

## 🛠️ Setup

### 1. Copy Environment File

```bash
cp env.example .env.local
```

### 2. Configure Variables

Edit `.env.local` with your specific values:

```env
APP_NAME=MyApp
API_BASE_URL=https://api.myapp.com
ENABLE_DEV_TOOLS=true
```

### 3. Restart Development Server

```bash
npm run dev
```

## 🔍 Validation

The environment variables are validated using Zod schema:

```typescript
// Automatic validation on import
import { envVariable } from '@/config/envVariable';

// If validation fails, the app will throw an error
// Check console for detailed error messages
```

## 📚 Best Practices

### 1. Environment-Specific Configs

```env
# .env.development
API_BASE_URL=http://localhost:3000/api
ENABLE_DEV_TOOLS=true

# .env.production
API_BASE_URL=https://api.teamorbit.com
ENABLE_DEV_TOOLS=false
```

### 2. Type Safety

```typescript
// Type-safe access
const apiUrl: string = envVariable.API_BASE_URL;
const timeout: number = envVariable.API_TIMEOUT;
```

### 3. Error Handling

```typescript
try {
  import { envVariable } from '@/config/envVariable';
  // Use configuration
} catch (error) {
  console.error('Configuration error:', error);
  // Handle missing configuration
}
```

## 🚀 Adding New Variables

### 1. Update Schema

```typescript
// In envVariable.ts
const envVariableSchema = z.object({
  // ... existing variables
  VITE_NEW_FEATURE: z.boolean().optional().default(false),
});
```

### 2. Update Type

The type is automatically inferred from the schema.

### 3. Update Example

```env
# In env.example
VITE_NEW_FEATURE=false
```

### 4. Document Usage

Add to this README with description and examples.

## 🔧 Troubleshooting

### Common Issues

#### 1. "Environment variable validation failed"

- Check that all required variables are set
- Verify variable names start with `VITE_`
- Ensure values match expected types

#### 2. "API_BASE_URL must be a valid URL"

- Ensure the URL includes protocol (http:// or https://)
- Check for typos in the URL

#### 3. Variables not updating

- Restart the development server after changing `.env` files
- Clear browser cache
- Check file is named correctly (`.env.local` not `.env`)

### Debug Mode
