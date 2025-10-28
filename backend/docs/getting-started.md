# Getting Started with TeamOrbit Backend

Complete guide covering setup, development, and deployment of the TeamOrbit backend - from local development to production.

---

## 📚 Table of Contents

- [Setup & Installation](#-setup--installation)
- [Development Guide](#-development-guide)
- [Deployment Guide](#-deployment-guide)

---

# 🚀 Setup & Installation

This section will help you set up the TeamOrbit backend development environment from scratch.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher (comes with Node.js)
- **PostgreSQL** 12.0 or higher
- **Git** (for version control)

### Recommended Tools

- **VS Code** (with TypeScript and ESLint extensions)
- **Postman** or **Insomnia** (for API testing)
- **pgAdmin** or **DBeaver** (for database management)

## 🚀 Quick Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd teamorbit-backend
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

### 4. Database Setup

```bash
# Create the database (run this in PostgreSQL)
createdb teamorbit

# Run database migrations
npm run migrate

# Seed the database with initial data
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5100` and you can access the API documentation at `http://localhost:5100/docs`.

## 🔧 Detailed Setup Instructions

### Environment Variables

The `.env` file should contain the following variables:

```bash
# Server Configuration
API_HOST=http://localhost
API_PORT=5100
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=teamorbit
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
PLATFORM_SUPER_ADMIN_PASSWORD=admin123
```

#### Environment Variable Descriptions

| Variable                        | Description            | Example                          |
| ------------------------------- | ---------------------- | -------------------------------- |
| `API_HOST`                      | Server host URL        | `http://localhost`               |
| `API_PORT`                      | Server port number     | `5100`                           |
| `NODE_ENV`                      | Environment mode       | `development`                    |
| `DB_HOST`                       | PostgreSQL host        | `localhost`                      |
| `DB_PORT`                       | PostgreSQL port        | `5432`                           |
| `DB_NAME`                       | Database name          | `teamorbit`                      |
| `DB_USER`                       | Database username      | `postgres`                       |
| `DB_PASSWORD`                   | Database password      | `your_password`                  |
| `JWT_SECRET`                    | JWT signing secret     | `your_super_secret_jwt_key_here` |
| `PLATFORM_SUPER_ADMIN_PASSWORD` | Default admin password | `admin123`                       |

### Database Configuration

#### PostgreSQL Installation

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (using Homebrew):**

```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Create Database and User

```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database
CREATE DATABASE teamorbit;

-- Create user (optional)
CREATE USER teamorbit_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE teamorbit TO teamorbit_user;

-- Exit
\q
```

### Database Migration

The backend uses a custom migration system with support for both SQL and TypeScript migrations.

#### Migration Commands

```bash
# Run all pending migrations
npm run migrate

# Check migration status (you can inspect the migration files)
ls src/database/migrations/main/
ls src/database/migrations/tenant/
```

#### Migration Structure

```
src/database/migrations/
├── main/                    # Main schema migrations
│   ├── 001-main-create-tables.do.sql
│   └── 002-main-initial-lookup-data.ts
└── tenant/                  # Tenant schema migrations
    └── 001-tenant-create-tables.do.sql
```

### Database Seeding

Initial data is populated through the seeding system:

```bash
# Seed the database with initial data
npm run seed
```

This will populate:

- User roles (PLATFORM_SUPER_ADMIN, PLATFORM_ADMIN, etc.)
- User statuses (PENDING, ACTIVE, DEACTIVATED, etc.)
- Tenant statuses (ACTIVE, INACTIVE, SUSPENDED, etc.)
- Chat types (DIRECT, GROUP, BROADCAST, etc.)

## 🧪 Verification

### 1. Health Check

```bash
curl http://localhost:5100/health
```

Expected response:

```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-12-19T10:30:00.000Z"
}
```

### 2. API Documentation

Visit `http://localhost:5100/docs` in your browser to access the Swagger UI.

### 3. Database Connection

Test database connectivity by making an API request:

```bash
# Get lookup data (requires no authentication)
curl http://localhost:5100/api/lookup/list
```

### 4. Authentication Test

```bash
# Test user registration
curl -X POST http://localhost:5100/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "title": "Mr",
    "gender": "Male",
    "bloodGroup": "O+",
    "marriedStatus": "Single"
  }'
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Error: Port 5100 is already in use
# Solution: Kill the process or change the port
lsof -ti:5100 | xargs kill -9
```

#### Database Connection Failed

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# Check connection
psql -h localhost -U postgres -d teamorbit
```

#### Migration Errors

```bash
# If migrations fail, check the database connection
# and ensure the database exists
createdb teamorbit
npm run migrate
```

#### Environment Variables Not Loading

```bash
# Ensure .env file is in the root directory
ls -la .env

# Check if variables are being loaded
node -e "require('dotenv').config(); console.log(process.env.DB_HOST)"
```

### Development Tools Setup

#### VS Code Extensions

Install these recommended extensions:

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- PostgreSQL (for database management)
- REST Client (for API testing)

#### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["typescript", "javascript"]
}
```

---

# 💻 Development Guide

This section covers development patterns, coding standards, and best practices for the TeamOrbit backend.

## 🎯 Development Philosophy

The TeamOrbit backend follows these core principles:

- **Type Safety First**: Full TypeScript coverage with Zod runtime validation
- **Clean Architecture**: Clear separation of concerns with layered design
- **Security by Design**: Built-in security patterns and best practices
- **Documentation Driven**: Auto-generated API docs from code
- **Testable Code**: Patterns that support comprehensive testing

## 🏗️ Development Patterns

### 1. Controller Pattern

Controllers handle HTTP requests and delegate business logic to services.

```typescript
// src/controllers/user.controller.ts
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/authRoleMiddleware";
import UserService from "../services/user.service";
import { HttpError } from "../utils/httpError";

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError("User ID not found in token", 401);
    }

    const userData = await UserService.getUserById(
      userId.toString(),
      req.mainPool
    );

    if (!userData) {
      throw new HttpError("User profile not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: { user: userData },
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};
```

**Controller Guidelines:**

- Use `AuthenticatedRequest` for authenticated endpoints
- Extract user data from `req.user` (JWT payload)
- Use `req.mainPool` and `req.tenantPool` for database access
- Always pass errors to `next(error)` for centralized handling
- Return consistent response format with `success`, `message`, and `data`

### 2. Service Pattern

Services contain business logic using class-based static methods.

```typescript
// src/services/user.service.ts
import { Pool } from "pg";
import { logger } from "../utils/logger";
import { HttpError } from "../utils/httpError";

export default class UserService {
  constructor(reqObj: any) {}

  static async getUserById(id: string, mainPool: Pool): Promise<any | null> {
    try {
      if (!id) {
        throw new HttpError("User ID is required", 400);
      }

      const queryString = `
        SELECT 
          u.*,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT('id', r.id, 'name', r.name)
            ) FILTER (WHERE r.id IS NOT NULL),
            '[]'
          ) AS roles
        FROM user u
        LEFT JOIN user_role_xref urx ON u.id = urx."userId"
        LEFT JOIN lookup r ON urx."roleId" = r.id
        WHERE u.id = $1 AND u.is_active = true
        GROUP BY u.id
      `;

      const result = await mainPool.query(queryString, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error("Error fetching user by ID:", error);
      throw new HttpError("Failed to fetch user", 500);
    }
  }
}
```

**Service Guidelines:**

- Use static methods for stateless business logic
- Inject database pools as parameters
- Implement comprehensive error handling with `HttpError`
- Use transactions for multi-step operations
- Log important operations and errors
- Validate business rules before database operations

### 3. Route Registration Pattern

Use the `RouteRegistrar` class for consistent route definition with automatic OpenAPI generation.

```typescript
// src/routes/user.routes.ts
import RouteRegistrar from "../middleware/RouteRegistrar";
import { authRoleMiddleware } from "../middleware/authRoleMiddleware";
import { userSignupSchema, baseUserSchema } from "../schemas/user.schema";
import {getUserProfile } from "../controllers/user.controller";

const registrar = new RouteRegistrar({
  basePath: "/api/user",
  tags: ["User"],
});

// Protected endpoints
registrar.get("/profile", {
  middlewares: [authRoleMiddleware()],
  controller: getUserProfile,
});

export default registrar;
```

**Route Guidelines:**

- Use descriptive base paths (`/api/user`, `/api/tenant`)
- Define request/response schemas for validation
- Apply appropriate middleware for authentication
- Use consistent naming conventions
- Group related endpoints with tags

### 4. Schema Validation Pattern

Define Zod schemas for runtime type validation and OpenAPI generation.

```typescript
// src/schemas/user.schema.ts
import { z } from "zod";

// Base user schema
export const baseUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  title: z.enum(["Mr", "Mrs", "Ms", "Dr", "Prof"]),
  gender: z.enum(["Male", "Female", "Other"]),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  marriedStatus: z.enum(["Single", "Married", "Divorced", "Widowed"]),
  is_active: z.boolean(),
});

// Signup schema (extends base with password)
export const userSignupSchema = baseUserSchema
  .omit({ id: true, is_active: true })
  .extend({
    password: z.string().min(8).max(100),
  });
```

**Schema Guidelines:**

- Use Zod for both validation and type inference
- Create reusable base schemas and extend them
- Define clear error messages for validation failures
- Use appropriate Zod types (email, datetime, enums)

## 🔧 Development Workflow

### Daily Development Commands

```bash
# Development server with hot reload
npm run dev

# Type checking in watch mode
npm run type-check:watch

# Build for production
npm run build

# Run linting
npm run lint
```

### Adding New Features

#### Step 1: Define Schemas

```typescript
// src/schemas/example.schema.ts
export const exampleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
```

#### Step 2: Create Service

```typescript
// src/services/example.service.ts
export default class ExampleService {
  static async createExample(data: any, mainPool: Pool): Promise<any> {
    // Business logic implementation
  }
}
```

#### Step 3: Create Controller

```typescript
// src/controllers/example.controller.ts
export const createExample = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await ExampleService.createExample(req.body, req.mainPool);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

#### Step 4: Define Routes

```typescript
// src/routes/example.routes.ts
const registrar = new RouteRegistrar({
  basePath: "/api/example",
  tags: ["Example"],
});

registrar.post("/create", {
  requestSchema: { bodySchema: exampleSchema },
  middlewares: [authRoleMiddleware()],
  controller: createExample,
});
```

#### Step 5: Register Routes

```typescript
// src/routes/routes.ts
import exampleRoutes from "./example.routes";
routes.use("/example", exampleRoutes.router);
```

## 📝 Coding Standards

### 1. TypeScript Guidelines

```typescript
// ✅ Good: Explicit types and interfaces
interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

// ❌ Bad: Using 'any' type
const processUser = (userData: any): any => {
  // Implementation
};
```

### 2. Error Handling

```typescript
// ✅ Good: Specific error handling
try {
  const user = await UserService.getUserById(id, mainPool);
  if (!user) {
    throw new HttpError("User not found", 404);
  }
  return user;
} catch (error) {
  if (error instanceof HttpError) {
    throw error;
  }
  logger.error("Unexpected error:", error);
  throw new HttpError("Internal server error", 500);
}
```

### 3. Database Queries

```typescript
// ✅ Good: Parameterized queries
const query = "SELECT * FROM users WHERE id = $1 AND email = $2";
const result = await pool.query(query, [userId, email]);

// ❌ Bad: String concatenation (SQL injection risk)
const query = `SELECT * FROM users WHERE id = ${userId}`;
```

### 4. Logging

```typescript
// ✅ Good: Structured logging with context
logger.info("User created successfully", {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
});

// ❌ Bad: Unstructured logging
console.log("User created");
```

## 🔒 Security Best Practices

### 1. Input Validation

```typescript
// Always validate input with Zod
const validatedData = userSignupSchema.parse(req.body);

// Sanitize user input
const sanitizedEmail = email.toLowerCase().trim();
```

### 2. Authentication

```typescript
// Check authentication in middleware
if (!req.user) {
  throw new HttpError("Authentication required", 401);
}

// Check user roles
if (!req.user.userRoles.some(role => role.name === "PLATFORM_ADMIN")) {
  throw new HttpError("Insufficient permissions", 403);
}
```

### 3. Password Security

```typescript
// Use bcrypt with high salt rounds
const hashPassword = await bcrypt.hash(password, 12);

// Validate password strength
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain uppercase letter")
  .regex(/[a-z]/, "Password must contain lowercase letter")
  .regex(/[0-9]/, "Password must contain number");
```

---

# 🚀 Deployment Guide

This section covers deploying the TeamOrbit backend to various environments, from development to production.

## 🚀 Deployment Overview

The TeamOrbit backend can be deployed using multiple strategies:

- **Docker Containers**: Recommended for production
- **Traditional Server**: Direct deployment on VPS/dedicated servers
- **Cloud Platforms**: AWS, Google Cloud, Azure
- **Container Orchestration**: Kubernetes, Docker Swarm

## 📋 Production Requirements

- **Node.js** 18.0.0 or higher
- **PostgreSQL** 12.0 or higher
- **SSL Certificate** (for HTTPS)
- **Domain Name** (for production)
- **Reverse Proxy** (Nginx recommended)

### Optional Components

- **Redis** (for session storage and caching)
- **Load Balancer** (for high availability)
- **Monitoring Tools** (Prometheus, Grafana)
- **Log Aggregation** (ELK Stack, Fluentd)

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# Server Configuration
NODE_ENV=production
API_HOST=https://api.teamorbit.com
API_PORT=5100

# Database Configuration
DB_HOST=your-db-host.com
DB_PORT=5432
DB_NAME=teamorbit_prod
DB_USER=teamorbit_user
DB_PASSWORD=secure_password_here

# Security
JWT_SECRET=your_super_secure_jwt_secret_key_here
PLATFORM_SUPER_ADMIN_PASSWORD=secure_admin_password

# Optional: Redis Configuration
REDIS_HOST=redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# Optional: Monitoring
SENTRY_DSN=your_sentry_dsn_here
LOG_LEVEL=info
```

### Environment-Specific Configurations

#### Development

```bash
NODE_ENV=development
API_HOST=http://localhost
API_PORT=5100
LOG_LEVEL=debug
```

#### Staging

```bash
NODE_ENV=staging
API_HOST=https://staging-api.teamorbit.com
API_PORT=5100
LOG_LEVEL=info
```

#### Production

```bash
NODE_ENV=production
API_HOST=https://api.teamorbit.com
API_PORT=5100
LOG_LEVEL=warn
```

## 🐳 Docker Deployment

### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5100

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5100/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["npm", "start"]
```

### 2. Create Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "5100:5100"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_USER=teamorbit
      - DB_PASSWORD=secure_password
      - DB_NAME=teamorbit
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=teamorbit
      - POSTGRES_USER=teamorbit
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### 3. Deployment Commands

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Run database migrations
docker-compose exec app npm run migrate

# Seed database
docker-compose exec app npm run seed

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## ☁️ Cloud Platform Deployment

### AWS EC2 Deployment

#### 1. EC2 Instance Setup

```bash
# Launch EC2 instance (Ubuntu 20.04 LTS)
# Instance type: t3.medium or larger
# Security groups: Allow ports 22, 80, 443, 5100

# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/your-org/teamorbit-backend.git
cd teamorbit-backend

# Install dependencies
npm install

# Build application
npm run build

# Set up environment
cp env.example .env
# Edit .env with production values

# Set up database
sudo -u postgres createdb teamorbit
npm run migrate
npm run seed

# Start with PM2
pm2 start dist/server.js --name "teamorbit-backend"
pm2 startup
pm2 save
```

#### 3. SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d api.teamorbit.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/teamorbit-backend
            git pull origin main
            npm ci
            npm run build
            pm2 restart teamorbit-backend
```

## 📊 Monitoring and Logging

### Health Checks

```typescript
// Enhanced health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Check database connection
    await db.getDbPool().query("SELECT 1");

    // Check memory usage
    const memUsage = process.memoryUsage();

    res.status(200).json({
      status: "OK",
      message: "Server is running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + " MB",
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + " MB",
      },
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      message: "Service unavailable",
      timestamp: new Date().toISOString(),
    });
  }
});
```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Use HTTPS with valid SSL certificate
- [ ] Set secure environment variables
- [ ] Enable security headers (Helmet.js)
- [ ] Configure CORS properly
- [ ] Use strong JWT secrets
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] Firewall configuration
- [ ] Regular backups

### Database Security

```sql
-- Create dedicated database user
CREATE USER teamorbit_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE teamorbit TO teamorbit_user;
GRANT USAGE ON SCHEMA main TO teamorbit_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA main TO teamorbit_user;
```

### Server Hardening

```bash
# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 5100  # Block direct access to app port

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

## 🚨 Disaster Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup.sh - Database backup script

BACKUP_DIR="/backups/teamorbit"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="teamorbit"
DB_USER="teamorbit_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

### Restore Process

```bash
#!/bin/bash
# restore.sh - Database restore script

BACKUP_FILE=$1
DB_NAME="teamorbit"
DB_USER="teamorbit_user"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh backup_file.sql.gz"
    exit 1
fi

# Decompress and restore
gunzip -c $BACKUP_FILE | psql -h localhost -U $DB_USER -d $DB_NAME

echo "Database restored from $BACKUP_FILE"
```

---

## 📚 Next Steps

- **[Architecture Overview](architecture.md)** - Understand the system design
- **[API Documentation](src/api.md)** - Explore available endpoints
- **[Database Documentation](src/database.md)** - Learn about database operations

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting sections above
2. Review the [Architecture documentation](architecture.md)
3. Check the project's issue tracker
4. Contact the development team

---

**Happy Coding! 🚀**
