# Manual Railway Setup Guide

Since the automatic scripts require project linking, here's a step-by-step manual approach:

## Step 1: Link to Your Existing Project

```bash
# Link to your existing techblog project
railway link techblog
```

## Step 2: Set Environment Variables

### For Test Environment:
```bash
railway variables --set "NODE_ENV=test"
railway variables --set "PORT=3000"
railway variables --set "JWT_SECRET=test-secret-key-change-this"
railway variables --set "JWT_EXPIRES_IN=1h"
railway variables --set "CORS_ORIGIN=https://techblog.railway.app"
railway variables --set "LOG_LEVEL=error"
railway variables --set "ENABLE_SWAGGER=false"
railway variables --set "ENABLE_DEBUG_ROUTES=false"
railway variables --set "RATE_LIMIT_WINDOW_MS=900000"
railway variables --set "RATE_LIMIT_MAX_REQUESTS=100"
```

### For Production Environment:
```bash
# Switch to production environment (if you have one)
railway environment production

# Set production variables
railway variables --set "NODE_ENV=production"
railway variables --set "PORT=3000"
railway variables --set "JWT_SECRET=production-secret-key-change-this"
railway variables --set "JWT_EXPIRES_IN=24h"
railway variables --set "CORS_ORIGIN=https://yourdomain.com"
railway variables --set "LOG_LEVEL=info"
railway variables --set "ENABLE_SWAGGER=false"
railway variables --set "ENABLE_DEBUG_ROUTES=false"
railway variables --set "RATE_LIMIT_WINDOW_MS=900000"
railway variables --set "RATE_LIMIT_MAX_REQUESTS=100"
```

## Step 3: Deploy

```bash
# Deploy your project
railway up
```

## Step 4: Get Your URL

```bash
# Get your project URL
railway domain
```

## Step 5: Verify Deployment

```bash
# Test your deployment
./scripts/verify-test.sh https://your-railway-url.railway.app
```

## Alternative: Use Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Select your `techblog` project
3. Go to "Variables" tab
4. Add each environment variable manually
5. Deploy from the dashboard

## Environment Variables Reference

### Test Environment:
- NODE_ENV=test
- PORT=3000
- JWT_SECRET=test-secret-key-change-this
- JWT_EXPIRES_IN=1h
- CORS_ORIGIN=https://techblog.railway.app
- LOG_LEVEL=error
- ENABLE_SWAGGER=false
- ENABLE_DEBUG_ROUTES=false
- RATE_LIMIT_WINDOW_MS=900000
- RATE_LIMIT_MAX_REQUESTS=100

### Production Environment:
- NODE_ENV=production
- PORT=3000
- JWT_SECRET=production-secret-key-change-this
- JWT_EXPIRES_IN=24h
- CORS_ORIGIN=https://yourdomain.com
- LOG_LEVEL=info
- ENABLE_SWAGGER=false
- ENABLE_DEBUG_ROUTES=false
- RATE_LIMIT_WINDOW_MS=900000
- RATE_LIMIT_MAX_REQUESTS=100
