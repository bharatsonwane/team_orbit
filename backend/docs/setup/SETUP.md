# Backend Setup Guide

Complete guide for setting up the TeamOrbit backend from scratch.

## 🚀 Prerequisites

### Required Software

- **Node.js** 18 or higher
- **PostgreSQL** 12 or higher
- **npm** or **yarn** package manager
- **Git** for version control

### System Requirements

- **RAM:** Minimum 4GB, Recommended 8GB
- **Storage:** At least 2GB free space
- **OS:** Windows 10+, macOS 10.15+, or Linux

## 📋 Installation Steps

### 1. Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd teamorbit/backend
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Or using yarn
yarn install
```

### 3. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
# or
code .env
```

### 4. Database Setup

#### Install PostgreSQL

```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Windows
# Download from https://www.postgresql.org/download/windows/
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE teamorbit;

# Create user (optional)
CREATE USER teamorbit_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE teamorbit TO teamorbit_user;

# Exit psql
\q
```

### 5. Environment Variables

Create `.env` file with the following configuration:

```env
# Server Configuration
API_PORT=5100
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=teamorbit
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

### 6. Database Migration

```bash
# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed
```

### 7. Start Development Server

```bash
# Start development server
npm run dev
```

## 🔧 Configuration Details

### Environment Variables

#### Server Configuration

- `API_PORT` - Port number for the API server (default: 5100)
- `NODE_ENV` - Environment mode (development, production, test)

#### Database Configuration

- `DB_HOST` - PostgreSQL host (default: localhost)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password

#### JWT Configuration

- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRES_IN` - Token expiration time (e.g., 24h, 7d)

#### CORS Configuration

- `CORS_ORIGIN` - Allowed origin for CORS (frontend URL)

### TypeScript Configuration

The project uses TypeScript with the following configuration:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 🗄️ Database Schema

### Initial Tables

The migration creates the following tables:

#### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Chat Messages Table

```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  media_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Development Workflow

### 1. Start Development

```bash
# Start development server with hot reload
npm run dev
```

### 2. Build for Production

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### 3. Database Operations

```bash
# Run migrations
npm run migrate

# Seed database
npm run seed

# Reset database (migrate + seed)
npm run migrate && npm run seed
```

### 4. Code Quality

```bash
# Type checking
npx tsc --noEmit

# Linting (when configured)
npm run lint

# Formatting (when configured)
npm run format
```

## 🔍 Verification

### 1. Check Server Status

```bash
# Health check
curl http://localhost:5100/health

# Expected response
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Check API Documentation

Visit `http://localhost:5100/docs` to access Swagger UI documentation.

### 3. Check Database Connection

```bash
# Test database connection
psql -U postgres -d teamorbit -c "SELECT COUNT(*) FROM users;"
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port 5100
lsof -i :5100

# Kill process
kill -9 <PID>

# Or use different port
API_PORT=5001 npm run dev
```

#### 2. Database Connection Failed

```bash
# Check PostgreSQL status
pg_ctl status

# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux

# Check database exists
psql -U postgres -l
```

#### 3. TypeScript Compilation Errors

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Clean and rebuild
npm run clean
npm run build
```

#### 4. Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 5. Environment Variables Not Loading

```bash
# Check .env file exists
ls -la .env

# Verify environment variables
node -e "console.log(process.env.DB_HOST)"
```

### Debug Mode

```bash
# Run with debug logging
DEBUG=* npm run dev

# Run with specific debug namespace
DEBUG=app:* npm run dev
```

## 🔧 Advanced Configuration

### 1. Database Connection Pooling

```typescript
// src/database/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds
});
```

### 2. Logging Configuration

```typescript
// src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

### 3. CORS Configuration

```typescript
// src/server.ts
import cors from 'cors';

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

## 📚 Next Steps

1. **Explore the API** - Visit `/docs` for interactive API documentation
2. **Read the code** - Start with `src/server.ts` and explore the structure
3. **Check the database** - Use `psql` to explore the database schema
4. **Run tests** - Execute the test suite (when implemented)
5. **Read documentation** - Explore the comprehensive documentation

## 🤝 Getting Help

- **Documentation** - Check the `docs/` directory
- **API Reference** - Visit `http://localhost:5100/docs`
- **Issues** - Create an issue in the repository
- **Discussions** - Use GitHub discussions for questions

---

_This setup guide should get you up and running with the TeamOrbit backend. For more detailed information, check the other documentation files._
