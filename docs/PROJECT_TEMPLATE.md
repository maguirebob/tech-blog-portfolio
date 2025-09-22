# Project Template for Node.js Express PostgreSQL Applications

## 🚀 **Quick Start Checklist**

Use this template for all new Node.js Express PostgreSQL projects to ensure best practices are followed.

### **Phase 1: Project Setup**
- [ ] Create project directory with proper structure
- [ ] Initialize package.json with required dependencies
- [ ] Set up TypeScript configuration
- [ ] Create environment configuration files
- [ ] Set up Prisma schema and migrations
- [ ] Create basic Express server with error handling

### **Phase 2: Server Implementation**
- [ ] Implement global error handlers (MANDATORY)
- [ ] Use async startup pattern (MANDATORY)
- [ ] Add comprehensive logging
- [ ] Implement health check endpoints
- [ ] Set up middleware (CORS, helmet, compression, rate limiting)
- [ ] Create API routes and controllers

### **Phase 3: Testing**
- [ ] Set up test framework (Jest)
- [ ] Create API tests with unique test data
- [ ] Implement test database strategy
- [ ] Add comprehensive error testing
- [ ] Test all endpoints locally

### **Phase 4: Deployment**
- [ ] Configure Railway deployment settings
- [ ] Set up health check configuration
- [ ] Test deployment process
- [ ] Verify all endpoints work in deployed environment
- [ ] Monitor deployment logs

## 📁 **Required File Structure**

```
project-name/
├── src/
│   ├── server.ts          # Main server file with error handling
│   ├── lib/
│   │   └── prisma.ts      # Prisma client configuration
│   ├── controllers/       # API controllers
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── types/             # TypeScript type definitions
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/         # Database migrations
├── test/
│   ├── api/               # API tests
│   ├── models/            # Model tests
│   └── setup.ts           # Test setup
├── docs/
│   ├── DEVELOPMENT_STANDARDS.md
│   ├── RAILWAY_DEPLOYMENT.md
│   └── README.md
├── scripts/
│   ├── verify-dev.sh
│   ├── verify-test.sh
│   └── verify-prod.sh
├── .env.example
├── railway.json
├── nixpacks.toml
└── package.json
```

## 🔧 **Required Dependencies**

### **Production Dependencies**
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "compression": "^1.7.4",
  "express-rate-limit": "^7.1.5",
  "dotenv": "^16.3.1",
  "@prisma/client": "^5.7.1",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2"
}
```

### **Development Dependencies**
```json
{
  "typescript": "^5.3.3",
  "@types/node": "^20.10.5",
  "@types/express": "^4.17.21",
  "@types/cors": "^2.8.17",
  "@types/compression": "^1.7.5",
  "@types/bcrypt": "^5.0.2",
  "@types/jsonwebtoken": "^9.0.5",
  "prisma": "^5.7.1",
  "jest": "^29.7.0",
  "@types/jest": "^29.5.8",
  "supertest": "^6.3.3",
  "@types/supertest": "^2.0.16",
  "ts-jest": "^29.1.1"
}
```

## 📋 **Required Scripts**

```json
{
  "scripts": {
    "build": "tsc",
    "start": "prisma migrate deploy && node dist/server.js",
    "dev": "ts-node src/server.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:reset": "prisma migrate reset",
    "db:seed": "prisma db seed"
  }
}
```

## 🚨 **Critical Implementation Requirements**

### **Server.ts Template**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';

dotenv.config();

// MANDATORY: Global error handlers
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware setup
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(compression());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MANDATORY: Health check endpoints
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'healthy', database: 'connected' });
  } catch (err: any) {
    console.error("❌ Database healthcheck failed:", err);
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

// API routes
// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/articles', articleRoutes);
// app.use('/api/v1/projects', projectRoutes);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// MANDATORY: Async startup pattern
(async () => {
  try {
    console.log("🔗 Connecting to database...");
    await prisma.$connect();
    console.log("✅ Database connected successfully.");

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Healthcheck: http://0.0.0.0:${PORT}/api/v1/health`);
    });
  } catch (err) {
    console.error("❌ Fatal error starting server:", err);
    process.exit(1);
  }
})();
```

## 📚 **Documentation Requirements**

Every project MUST include:
- [ ] README.md with setup instructions
- [ ] DEVELOPMENT_STANDARDS.md (copy from template)
- [ ] RAILWAY_DEPLOYMENT.md (copy from template)
- [ ] Environment configuration examples
- [ ] API documentation
- [ ] Testing instructions

## 🔍 **Quality Assurance Checklist**

Before considering any project complete:
- [ ] All mandatory error handlers implemented
- [ ] Health check endpoints working
- [ ] All tests passing
- [ ] Local testing completed
- [ ] Deployment successful
- [ ] All endpoints verified in deployed environment
- [ ] Documentation complete
- [ ] Code review completed

---

**This template ensures all learnings from the Tech Blog Portfolio project are automatically applied to future projects.**
