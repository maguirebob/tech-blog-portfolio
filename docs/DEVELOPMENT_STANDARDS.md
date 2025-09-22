# Development Standards & Best Practices

## 🚀 **Server Startup Standards**

### **MANDATORY: Global Error Handlers**
Every Node.js server MUST include these error handlers at the top of the main file:

```typescript
// Global crash handlers - REQUIRED
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});
```

### **MANDATORY: Async Startup Pattern**
Use this pattern for all server startup:

```typescript
(async () => {
  try {
    console.log("🔗 Connecting to database...");
    await prisma.$connect();
    console.log("✅ Database connected successfully.");

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Fatal error starting server:", err);
    process.exit(1);
  }
})();
```

### **MANDATORY: Health Check Endpoints**
Every API MUST provide:

1. **Lightweight Health Check**: `/api/v1/health` - returns 200 OK without database dependencies
2. **Database Health Check**: `/api/v1/health/db` - tests database connectivity
3. **Server Status**: `/api/v1/status` - comprehensive server information

## 🔧 **Railway Deployment Standards**

### **MANDATORY: Host Binding**
- Always bind to `0.0.0.0`, never `localhost`
- Use `Number(PORT)` for port conversion
- Include comprehensive startup logging

### **MANDATORY: Health Check Configuration**
```json
{
  "deploy": {
    "healthcheckPath": "/api/v1/health",
    "healthcheckTimeout": 30000,
    "healthcheckInterval": 5000
  }
}
```

## 📊 **Testing Standards**

### **MANDATORY: Unique Test Data**
- Use timestamps for unique identifiers: `const timestamp = Date.now()`
- Prevent test conflicts with unique usernames/emails
- Test against development database for simplicity

### **MANDATORY: Test Structure**
```typescript
describe('API Tests', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Setup unique test data
    const timestamp = Date.now();
    const userData = {
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      // ... other data
    };
  });
});
```

## 🛠️ **Development Workflow Standards**

### **MANDATORY: Pre-Deployment Checklist**
1. ✅ Build succeeds (`npm run build`)
2. ✅ All tests pass (`npm test`)
3. ✅ Local testing completed
4. ✅ Health checks verified
5. ✅ Error handling tested

### **MANDATORY: Deployment Process**
1. **Local Testing**: Test all endpoints locally first
2. **Incremental Deployment**: Deploy and test each change
3. **Health Check Verification**: Verify all health endpoints work
4. **API Testing**: Test all API endpoints after deployment
5. **Log Monitoring**: Check deployment logs for errors

## 📋 **Code Review Checklist**

### **Server Files Must Include:**
- [ ] Global error handlers at the top
- [ ] Async startup pattern with try-catch
- [ ] Explicit database connection
- [ ] Proper host binding (`0.0.0.0`)
- [ ] Comprehensive logging
- [ ] Lightweight health check endpoints
- [ ] Error middleware with proper status codes

### **Test Files Must Include:**
- [ ] Unique test data with timestamps
- [ ] Proper test isolation
- [ ] Comprehensive error testing
- [ ] Authentication token handling
- [ ] Cleanup procedures (when needed)

## 🚨 **Common Pitfalls to Avoid**

### **NEVER:**
- Bind to `localhost` in production
- Skip error handling in server startup
- Use hardcoded test data that can conflict
- Deploy without local testing
- Skip health check verification
- Ignore deployment logs

### **ALWAYS:**
- Test locally before deploying
- Use comprehensive error handling
- Provide multiple health check endpoints
- Use unique identifiers in tests
- Monitor deployment logs
- Verify all endpoints after deployment

---

## 📚 **Reference Documents**

- [Tech Blog Portfolio Website Design](./Tech%20Blog%20Portfolio%20Website%20Design.md) - Complete design document
- [Railway Deployment Guide](./RAILWAY_DEPLOYMENT.md) - Deployment-specific guidance
- [Railway Deployment Checklist](./RAILWAY_DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist

---

**These standards are MANDATORY for all future projects. Any deviation must be documented and approved.**
