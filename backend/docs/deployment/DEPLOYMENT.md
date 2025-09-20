# Deployment Guide

Comprehensive deployment guide for the TeamOrbit backend to various platforms.

## 🚀 Deployment Overview

The TeamOrbit backend can be deployed to various platforms including cloud providers, containerized environments, and traditional servers.

### Deployment Options

- **Cloud Platforms:** AWS, Google Cloud, Azure, DigitalOcean
- **Container Platforms:** Docker, Kubernetes
- **Serverless:** AWS Lambda, Vercel Functions
- **Traditional VPS:** Ubuntu, CentOS, Debian

## 🏗️ Pre-deployment Checklist

### 1. Code Quality

- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] No linting errors
- [ ] Code review completed
- [ ] Security audit passed

### 2. Environment Configuration

- [ ] Production environment variables set
- [ ] Database connection configured
- [ ] JWT secrets generated
- [ ] CORS origins configured
- [ ] Logging level set

### 3. Database Setup

- [ ] Production database created
- [ ] Migrations run successfully
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Backup strategy implemented

### 4. Security

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] Error handling configured

## 🐳 Docker Deployment

### 1. Create Dockerfile

```dockerfile
# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5100

# Start application
CMD ["npm", "start"]
```

### 2. Create Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '5100:5100'
    environment:
      - NODE_ENV=production
      - API_PORT=5100
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=teamorbit
      - DB_USER=postgres
      - DB_PASSWORD=your_password
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=teamorbit
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec app npm run migrate

# Seed database
docker-compose exec app npm run seed

# Check logs
docker-compose logs -f app
```

## ☁️ Cloud Platform Deployment

### AWS Deployment

#### 1. EC2 Instance Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 2. Application Setup

```bash
# Clone repository
git clone <repository-url>
cd teamorbit/backend

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
```

#### 3. PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'teamorbit-backend',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        API_PORT: 5100,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
};
```

#### 4. Start with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 startup
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

#### 5. Nginx Configuration

```nginx
# /etc/nginx/sites-available/teamorbit
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Google Cloud Platform

#### 1. App Engine Deployment

```yaml
# app.yaml
runtime: nodejs18
env: standard

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

env_variables:
  NODE_ENV: production
  API_PORT: 8080
  DB_HOST: your-cloud-sql-ip
  DB_NAME: teamorbit
  DB_USER: postgres
  DB_PASSWORD: your-password
  JWT_SECRET: your-jwt-secret

handlers:
  - url: /.*
    script: auto
    secure: always
```

#### 2. Deploy to App Engine

```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize project
gcloud init

# Deploy application
gcloud app deploy
```

### Azure Deployment

#### 1. Azure App Service

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Create resource group
az group create --name teamorbit-rg --location eastus

# Create App Service plan
az appservice plan create --name teamorbit-plan --resource-group teamorbit-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group teamorbit-rg --plan teamorbit-plan --name teamorbit-backend --runtime "NODE|18-lts"

# Deploy application
az webapp deployment source config --name teamorbit-backend --resource-group teamorbit-rg --repo-url <repository-url> --branch main --manual-integration
```

## 🚀 Serverless Deployment

### AWS Lambda

#### 1. Serverless Framework Setup

```bash
# Install Serverless Framework
npm install -g serverless

# Install AWS SDK
npm install aws-sdk

# Create serverless.yml
```

#### 2. Serverless Configuration

```yaml
# serverless.yml
service: teamorbit-backend

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    DB_HOST: ${env:DB_HOST}
    DB_NAME: ${env:DB_NAME}
    DB_USER: ${env:DB_USER}
    DB_PASSWORD: ${env:DB_PASSWORD}
    JWT_SECRET: ${env:JWT_SECRET}

functions:
  api:
    handler: dist/server.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

plugins:
  - serverless-offline
  - serverless-plugin-typescript
```

#### 3. Deploy to Lambda

```bash
# Deploy to AWS
serverless deploy

# Deploy to specific stage
serverless deploy --stage production
```

## 🔧 Environment Configuration

### Production Environment Variables

```env
# Server Configuration
NODE_ENV=production
API_PORT=5100

# Database Configuration
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=teamorbit
DB_USER=postgres
DB_PASSWORD=your-secure-password

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Logging
LOG_LEVEL=info

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Environment-specific Configuration

```typescript
// src/config/envVariable.ts
const config = {
  development: {
    API_PORT: process.env.API_PORT || 5100,
    DB_HOST: process.env.DB_HOST || 'localhost',
    LOG_LEVEL: 'debug',
  },
  production: {
    API_PORT: process.env.API_PORT || 5100,
    DB_HOST: process.env.DB_HOST,
    LOG_LEVEL: 'info',
  },
  test: {
    API_PORT: process.env.API_PORT || 5001,
    DB_HOST: process.env.DB_HOST || 'localhost',
    LOG_LEVEL: 'error',
  },
};

export const envVariable =
  config[process.env.NODE_ENV as keyof typeof config] || config.development;
```

## 🗄️ Database Deployment

### PostgreSQL Setup

#### 1. Production Database

```bash
# Create production database
sudo -u postgres createdb teamorbit_production

# Create production user
sudo -u postgres createuser teamorbit_user
sudo -u postgres psql -c "ALTER USER teamorbit_user PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE teamorbit_production TO teamorbit_user;"
```

#### 2. Run Migrations

```bash
# Set production environment
export NODE_ENV=production

# Run migrations
npm run migrate

# Seed production data (if needed)
npm run seed
```

#### 3. Database Backup

```bash
# Create backup script
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U teamorbit_user -d teamorbit_production > backup_$DATE.sql

# Schedule backup (crontab)
0 2 * * * /path/to/backup.sh
```

## 🔒 Security Configuration

### SSL/TLS Setup

#### 1. Let's Encrypt (Nginx)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 2. Security Headers

```typescript
// src/server.ts
import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

### Rate Limiting

```typescript
// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all routes
app.use(rateLimiter);
```

## 📊 Monitoring and Logging

### Application Monitoring

#### 1. PM2 Monitoring

```bash
# Monitor application
pm2 monit

# View logs
pm2 logs teamorbit-backend

# Restart application
pm2 restart teamorbit-backend
```

#### 2. Health Checks

```typescript
// src/routes/health.ts
export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Check database connection
    await db.query('SELECT 1');

    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};
```

### Logging Configuration

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
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check logs
pm2 logs teamorbit-backend

# Check environment variables
pm2 env 0

# Restart application
pm2 restart teamorbit-backend
```

#### 2. Database Connection Issues

```bash
# Test database connection
psql -h localhost -U teamorbit_user -d teamorbit_production -c "SELECT 1"

# Check database status
sudo systemctl status postgresql

# Restart database
sudo systemctl restart postgresql
```

#### 3. Memory Issues

```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart teamorbit-backend

# Check system memory
free -h
```

### Performance Optimization

#### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
```

#### 2. Application Optimization

```typescript
// Enable compression
import compression from 'compression';
app.use(compression());

// Set cache headers
app.use((req, res, next) => {
  if (req.path.startsWith('/static/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
  next();
});
```

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS Deployment Guide](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_nodejs.html)
- [Google Cloud Deployment](https://cloud.google.com/appengine/docs/standard/nodejs/building-app)
- [Azure Deployment Guide](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Configuration](https://nginx.org/en/docs/)
