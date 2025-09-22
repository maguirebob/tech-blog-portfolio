# Code Review Checklist

## 🚨 **CRITICAL: Pre-Deployment Review**

This checklist MUST be completed before any deployment. Any item marked as **MANDATORY** cannot be skipped.

### **Server Startup & Error Handling**

#### **MANDATORY: Global Error Handlers**
- [ ] **MANDATORY**: `process.on("uncaughtException")` handler present
- [ ] **MANDATORY**: `process.on("unhandledRejection")` handler present
- [ ] **MANDATORY**: Both handlers call `process.exit(1)` on error
- [ ] **MANDATORY**: Error handlers are at the top of the server file

#### **MANDATORY: Async Startup Pattern**
- [ ] **MANDATORY**: Server uses IIFE (Immediately Invoked Function Expression) pattern
- [ ] **MANDATORY**: `await prisma.$connect()` called before server startup
- [ ] **MANDATORY**: Server startup wrapped in try-catch block
- [ ] **MANDATORY**: `process.exit(1)` called on startup failure

#### **MANDATORY: Host Binding**
- [ ] **MANDATORY**: Server binds to `0.0.0.0`, NOT `localhost`
- [ ] **MANDATORY**: Port is converted to number: `Number(PORT)`
- [ ] **MANDATORY**: Comprehensive startup logging present

### **Health Check Endpoints**

#### **MANDATORY: Lightweight Health Check**
- [ ] **MANDATORY**: `/api/v1/health` endpoint exists
- [ ] **MANDATORY**: Returns 200 OK without database dependencies
- [ ] **MANDATORY**: Includes timestamp in response
- [ ] **MANDATORY**: No async operations in health check

#### **MANDATORY: Database Health Check**
- [ ] **MANDATORY**: `/api/v1/health/db` endpoint exists
- [ ] **MANDATORY**: Tests database connectivity with `prisma.$queryRaw`
- [ ] **MANDATORY**: Returns 503 on database failure
- [ ] **MANDATORY**: Proper error handling and logging

### **API Implementation**

#### **Required: Route Structure**
- [ ] All API routes properly mounted with `/api/v1/` prefix
- [ ] Routes use appropriate HTTP methods (GET, POST, PUT, DELETE)
- [ ] Authentication middleware applied where needed
- [ ] Validation middleware applied to input routes

#### **Required: Error Handling**
- [ ] 404 handler present for unknown routes
- [ ] Global error middleware implemented
- [ ] Proper HTTP status codes used
- [ ] Error responses include appropriate detail level

#### **Required: Security**
- [ ] Helmet middleware applied
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Authentication required for protected routes

### **Testing**

#### **MANDATORY: Test Data Uniqueness**
- [ ] **MANDATORY**: All tests use unique identifiers (timestamps)
- [ ] **MANDATORY**: No hardcoded usernames/emails that can conflict
- [ ] **MANDATORY**: Test isolation prevents interference between tests

#### **Required: Test Coverage**
- [ ] API endpoints have corresponding tests
- [ ] Authentication flows tested
- [ ] Error scenarios tested
- [ ] Database operations tested
- [ ] All tests pass locally

### **Deployment Configuration**

#### **MANDATORY: Railway Configuration**
- [ ] **MANDATORY**: `railway.json` includes health check path
- [ ] **MANDATORY**: Health check timeout set to 30 seconds or more
- [ ] **MANDATORY**: `nixpacks.toml` configured if needed
- [ ] **MANDATORY**: Environment variables properly configured

#### **Required: Build Process**
- [ ] TypeScript compilation succeeds (`npm run build`)
- [ ] All dependencies properly installed
- [ ] Prisma client generated
- [ ] No build warnings or errors

### **Documentation**

#### **Required: Documentation**
- [ ] README.md includes setup instructions
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Testing instructions provided

## 🚨 **Deployment Blockers**

Any of these issues will BLOCK deployment:

### **CRITICAL FAILURES**
- ❌ Missing global error handlers
- ❌ Server binding to `localhost` instead of `0.0.0.0`
- ❌ No health check endpoints
- ❌ Health check endpoints depend on database
- ❌ Missing try-catch in server startup
- ❌ No `process.exit(1)` on critical failures

### **HIGH PRIORITY ISSUES**
- ❌ Tests failing
- ❌ TypeScript compilation errors
- ❌ Missing authentication on protected routes
- ❌ No input validation
- ❌ Missing error handling middleware
- ❌ Hardcoded test data that can conflict

## ✅ **Deployment Approval**

### **Required for Approval:**
- [ ] All **MANDATORY** items completed
- [ ] All tests passing
- [ ] Local testing completed successfully
- [ ] Health checks verified locally
- [ ] Code review completed
- [ ] Documentation updated

### **Final Verification:**
- [ ] Build succeeds without errors
- [ ] All endpoints respond correctly
- [ ] Health checks return 200 OK
- [ ] Database connectivity verified
- [ ] Error handling tested
- [ ] Security measures in place

---

## 📋 **Review Process**

### **Step 1: Automated Checks**
1. Run `npm run build` - must succeed
2. Run `npm test` - all tests must pass
3. Run `npm start` - server must start without errors
4. Test health check endpoints locally

### **Step 2: Manual Review**
1. Review server.ts for mandatory error handlers
2. Verify async startup pattern
3. Check host binding configuration
4. Verify health check endpoints
5. Review test data uniqueness

### **Step 3: Deployment Testing**
1. Deploy to test environment
2. Verify all endpoints work
3. Check deployment logs
4. Test health check endpoints
5. Verify database connectivity

### **Step 4: Approval**
- [ ] All checks passed
- [ ] No critical failures
- [ ] Ready for production deployment

---

**This checklist ensures all learnings from the Tech Blog Portfolio project are enforced in future deployments.**
