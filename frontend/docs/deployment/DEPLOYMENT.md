# Deployment Guide

This document provides comprehensive instructions for deploying the TeamOrbit frontend application to various platforms.

## 🚀 Build Process

### 1. Production Build

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### 2. Build Output

The build process creates a `dist/` directory containing:

- Static HTML, CSS, and JavaScript files
- Optimized assets
- Source maps (if enabled)

### 3. Build Configuration

The build is configured in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
  },
});
```

## 🌐 Deployment Platforms

### 1. Vercel (Recommended)

#### Automatic Deployment

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Vite project
3. Configure build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

#### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Environment Variables

Set in Vercel dashboard:

- `NODE_ENV=production`
- Any API endpoints or configuration

### 2. Netlify

#### Automatic Deployment

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Node Version:** `18`

#### Manual Deployment

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

#### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. GitHub Pages

#### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### Manual Deployment

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

### 4. AWS S3 + CloudFront

#### S3 Configuration

1. Create S3 bucket
2. Enable static website hosting
3. Set bucket policy for public read access

#### CloudFront Configuration

1. Create CloudFront distribution
2. Set S3 bucket as origin
3. Configure caching behavior
4. Set up custom domain (optional)

#### Deployment Script

```bash
# Install AWS CLI
aws configure

# Build and deploy
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### 5. Docker Deployment

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

#### Docker Commands

```bash
# Build image
docker build -t teamorbit-frontend .

# Run container
docker run -p 80:80 teamorbit-frontend
```

## 🔧 Environment Configuration

### 1. Environment Variables

Create `.env.production`:

```env
NODE_ENV=production
VITE_API_URL=https://api.teamorbit.com
APP_NAME=TeamOrbit
```

### 2. Build-time Variables

Use Vite's environment variable system:

```typescript
// Access in code
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.APP_NAME;
```

### 3. Runtime Configuration

For dynamic configuration, use a config file:

```typescript
// public/config.js
window.APP_CONFIG = {
  apiUrl: 'https://api.teamorbit.com',
  theme: 'system',
};
```

## 🚀 Performance Optimization

### 1. Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
        },
      },
    },
  },
});
```

### 2. Asset Optimization

- Enable gzip compression
- Use CDN for static assets
- Optimize images
- Use modern image formats (WebP, AVIF)

### 3. Caching Strategy

```typescript
// Cache static assets
location /static/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

// Cache HTML files
location ~* \.html$ {
  expires 1h;
  add_header Cache-Control "public";
}
```

## 🔒 Security Considerations

### 1. Content Security Policy

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';"
/>
```

### 2. HTTPS Configuration

- Use HTTPS in production
- Configure proper SSL certificates
- Enable HSTS headers

### 3. Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## 📊 Monitoring and Analytics

### 1. Error Tracking

```typescript
// Add error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }
}
```

### 2. Performance Monitoring

```typescript
// Add performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 3. Analytics

```typescript
// Add analytics tracking
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <div>
      <App />
      <Analytics />
    </div>
  )
}
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 2. Automated Testing

```yaml
# Add testing step
- name: Run tests
  run: npm test

- name: Run E2E tests
  run: npm run test:e2e
```

## 📋 Pre-deployment Checklist

### 1. Code Quality

- [ ] All tests passing
- [ ] No linting errors
- [ ] TypeScript compilation successful
- [ ] Code review completed

### 2. Build Verification

- [ ] Production build successful
- [ ] All assets optimized
- [ ] No console errors
- [ ] Theme switching works
- [ ] All routes accessible

### 3. Performance

- [ ] Lighthouse score > 90
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Caching configured

### 4. Security

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] No sensitive data exposed
- [ ] CSP configured

### 5. Monitoring

- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures

- Check Node.js version compatibility
- Verify all dependencies installed
- Check TypeScript errors
- Verify environment variables

#### 2. Routing Issues

- Configure fallback routes
- Check base URL configuration
- Verify redirect rules

#### 3. Theme Issues

- Check CSS variable definitions
- Verify theme provider setup
- Test in both light and dark modes

#### 4. Performance Issues

- Analyze bundle size
- Check for memory leaks
- Optimize images and assets
- Configure proper caching

## 📚 Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
