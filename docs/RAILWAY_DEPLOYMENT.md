# Railway Deployment Guide

This guide walks you through deploying the Tech Blog & Portfolio application to Railway for both test and production environments.

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- GitHub repository with the project code
- Local development environment set up

## Test Environment Deployment

### Step 1: Create Test Project on Railway

1. **Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `tech-blog-portfolio` repository
   - Name it `tech-blog-portfolio-test`

3. **Add PostgreSQL Database**
   - In your project dashboard, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically provision a PostgreSQL database

### Step 2: Configure Environment Variables

#### Option A: Automatic Configuration (Recommended)

Use our automated setup script:

```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login to Railway
railway login

# Run automatic environment setup
node scripts/auto-setup-railway.js techblog-test techblog-prod
```

#### Option B: Manual Configuration

In your Railway project dashboard, go to "Variables" and add:

```bash
# Environment
NODE_ENV=test
PORT=3000

# Database (Railway will provide this automatically)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Authentication
JWT_SECRET=test-secret-key-change-this
JWT_EXPIRES_IN=1h

# CORS
CORS_ORIGIN=https://techblog-test.railway.app

# Logging
LOG_LEVEL=error

# Features
ENABLE_SWAGGER=false
ENABLE_DEBUG_ROUTES=false

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Deploy

1. **Connect to GitHub**
   - Railway will automatically detect your `package.json`
   - It will use the `railway.json` and `nixpacks.toml` configuration

2. **Deploy**
   - Railway will use Nixpacks (not Docker) for deployment
   - The `nixpacks.toml` prevents TypeScript build issues
   - Watch the build logs for any issues

3. **Get Your URL**
   - Railway will provide a URL like `https://techblog-test.railway.app`
   - Note this URL for testing

### Important Notes

- **Entry Point**: The app uses `server.js` at the root (not TypeScript)
- **No Build Step**: We use `nixpacks.toml` to prevent build failures
- **Database Tables**: Tables are created automatically via API endpoints
- **Simple Approach**: Avoids complex TypeScript compilation issues

### Step 4: Verify Deployment

```bash
# Test the deployment
./scripts/verify-test.sh https://techblog-test.railway.app
```

## Production Environment Deployment

### Step 1: Create Production Project

1. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `tech-blog-portfolio` repository
   - Name it `tech-blog-portfolio-prod`

2. **Add PostgreSQL Database**
   - In your project dashboard, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically provision a PostgreSQL database

### Step 2: Configure Production Environment Variables

```bash
# Environment
NODE_ENV=production
PORT=3000

# Database (Railway will provide this automatically)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Authentication
JWT_SECRET=your-production-secret-key-from-vault
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info

# Features
ENABLE_SWAGGER=false
ENABLE_DEBUG_ROUTES=false

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Deploy Production

1. **Deploy from main branch**
   - Railway will automatically deploy from your main branch
   - Production should only be deployed from stable, tested code

2. **Verify Production**
   ```bash
   ./scripts/verify-prod.sh https://yourdomain.com
   ```

## Railway Configuration Files

The project includes these Railway-specific files:

- `railway.json` - Railway deployment configuration
- `railway.toml` - Railway environment configuration
- `nixpacks.toml` - Build configuration for Railway
- `railway-env.json` - Environment variables template
- `scripts/auto-setup-railway.js` - Automatic environment setup script
- `scripts/setup-railway-env.sh` - Shell script for environment setup

## Environment-Specific URLs

After deployment, you'll have:

- **Test**: `https://techblog-test.railway.app`
- **Production**: `https://yourdomain.com` (or Railway-provided URL)

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Railway build logs
   - Ensure all dependencies are in `package.json`
   - Verify `railway.json` and `nixpacks.toml` configuration
   - **TypeScript Issues**: Use `server.js` entry point instead of TypeScript

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is set correctly
   - Check PostgreSQL service is running
   - **Missing Tables**: Tables are created automatically via API endpoints

3. **Environment Variable Issues**
   - Double-check all required variables are set
   - Verify variable names match exactly
   - Check for typos in values

4. **Branch Mismatch Issues** ⚠️ **CRITICAL**
   - **Problem**: Working on `develop` branch but Railway deploying from `main`
   - **Symptom**: Code changes not reflected in deployment
   - **Solution**: Merge `develop` to `main` or configure Railway to deploy from correct branch
   - **Prevention**: Always verify which branch Railway is configured to deploy from

5. **Missing Prisma Migrations** ⚠️ **CRITICAL**
   - **Problem**: `prisma/migrations/` directory excluded by `.gitignore`
   - **Symptom**: "No migration found in prisma/migrations" error
   - **Solution**: Fix `.gitignore` to include migrations directory
   - **Prevention**: Ensure all necessary files are committed to Git

6. **Nixpacks Configuration Issues** ⚠️ **CRITICAL**
   - **Problem**: `nixpacks.toml` had incorrect build/start command configuration
   - **Symptom**: Build failures or incorrect deployment behavior
   - **Solution**: Fix `nixpacks.toml` with correct commands (ChatGPT provided the fix)
   - **Prevention**: Verify `nixpacks.toml` matches your actual build process

7. **SiteStats Table Missing**
   - **Error**: `The table 'public.SiteStats' does not exist`
   - **Solution**: Call `/api/v1/seed` endpoint to create and populate tables
   - **Root Cause**: Database tables are created on-demand, not via migrations

### Getting Help

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Project Issues: Create an issue in the GitHub repository

## Next Steps

After successful deployment:

1. **Test Environment**: Run integration tests
2. **Production Environment**: Set up monitoring and alerts
3. **CI/CD**: Configure automatic deployments from GitHub
4. **Domain**: Set up custom domain for production
