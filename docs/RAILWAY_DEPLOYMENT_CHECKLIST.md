# Railway Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Project Structure
- [ ] **Root entry point exists**: `server.js`, `index.js`, or `app.js` at project root
- [ ] **Package.json is at root**: Contains proper `main` and `start` script
- [ ] **No complex build process**: Avoid TypeScript compilation in start script
- [ ] **Simple dependencies**: Minimal external dependencies for faster deployment

### 2. Package.json Requirements
```json
{
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "postinstall": "prisma generate"  // Only if using Prisma
  }
}
```

### 3. Server Entry Point
```javascript
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Always bind to process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 4. Environment Variables
- [ ] **DATABASE_URL**: Set in Railway dashboard
- [ ] **PORT**: Railway injects automatically
- [ ] **NODE_ENV**: Set appropriately (development/test/production)
- [ ] **Other required vars**: JWT_SECRET, CORS_ORIGIN, etc.

### 5. Database Setup
- [ ] **Prisma generate**: Run in postinstall script
- [ ] **No migrations in start**: Use `prisma db push` or raw SQL instead
- [ ] **Connection string**: Use `process.env.DATABASE_URL`

## ✅ Railway Configuration

### 1. Railway.json
```json
{
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/v1/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. Nixpacks.toml (if needed)
```toml
[phases.setup]
nixPkgs = ["nodejs", "npm"]

[phases.install]
cmd = "npm ci"

[phases.build]
cmd = "echo 'No build step needed'"

[start]
cmd = "npm start"
```

### 3. .dockerignore (if using Docker)
```
node_modules
npm-debug.log
.git
.env*
coverage
.DS_Store
*.log
dist
test
docs
```

## ✅ Common Issues & Solutions

### Issue 1: Build Failures
**Problem**: Nixpacks tries to run `npm run build` automatically
**Solution**: 
- Remove `build` script from package.json
- Add `nixpacks.toml` with empty build command
- Use simple JavaScript instead of TypeScript

### Issue 2: Migration Failures
**Problem**: `prisma migrate deploy` fails during start
**Solution**:
- Use `prisma db push` instead of migrations
- Create tables with raw SQL in endpoints
- Run migrations separately, not in start script

### Issue 3: Port Binding
**Problem**: Server not binding to Railway's port
**Solution**:
- Always use `process.env.PORT || 3000`
- Don't hardcode port numbers

### Issue 4: Database Connection
**Problem**: Can't connect to Railway PostgreSQL
**Solution**:
- Use `process.env.DATABASE_URL` directly
- Add SSL configuration if needed
- Test connection with simple query

## ✅ Testing Checklist

### 1. Local Testing
- [ ] `npm start` works locally
- [ ] Database connection works
- [ ] All endpoints respond correctly
- [ ] Environment variables loaded

### 2. Railway Testing
- [ ] Service starts successfully
- [ ] Health check endpoint responds
- [ ] Database connection works
- [ ] All API endpoints functional

### 3. Verification Commands
```bash
# Check service status
railway status

# View logs
railway logs

# Test endpoints
curl https://your-app.railway.app/api/v1/health
curl https://your-app.railway.app/api/v1/stats
```

## ✅ Deployment Process

### 1. Pre-Deploy
- [ ] All tests pass locally
- [ ] Code committed to git
- [ ] Environment variables set in Railway
- [ ] Database schema ready

### 2. Deploy
```bash
# Deploy to Railway
railway up

# Check deployment status
railway status

# View logs if issues
railway logs
```

### 3. Post-Deploy
- [ ] Service is running
- [ ] Health checks pass
- [ ] Database connectivity works
- [ ] All endpoints functional

## ✅ Troubleshooting

### Check Logs
```bash
railway logs
```

### Common Error Messages
- **"No migration found"**: Use `prisma db push` instead
- **"Build failed"**: Remove build script, use simple JS
- **"Port already in use"**: Use `process.env.PORT`
- **"Database connection failed"**: Check `DATABASE_URL`

### Debug Endpoints
Add these to your server for debugging:
```javascript
// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Database check
app.get('/api/v1/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// Environment check
app.get('/api/v1/debug/env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set'
  });
});
```

## ✅ Best Practices

1. **Keep it simple**: Avoid complex build processes
2. **Use raw SQL**: For database setup instead of migrations
3. **Test locally first**: Always test before deploying
4. **Monitor logs**: Check Railway logs for errors
5. **Health checks**: Implement proper health check endpoints
6. **Environment variables**: Use Railway's environment variable system
7. **Database connection**: Test database connectivity early
8. **Error handling**: Add proper error handling and logging

## ✅ Quick Fixes

### If deployment fails:
1. Check `railway logs` for specific error
2. Verify `package.json` has correct `main` and `start`
3. Ensure no build script if using simple JS
4. Test database connection
5. Check environment variables

### If service won't start:
1. Verify port binding to `process.env.PORT`
2. Check database connection string
3. Ensure all dependencies are installed
4. Look for missing environment variables

### If database issues:
1. Use `prisma db push` instead of migrations
2. Create tables with raw SQL
3. Test connection with simple query
4. Check `DATABASE_URL` format
