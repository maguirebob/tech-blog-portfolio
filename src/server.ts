import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import userRoutes from './routes/userRoutes';
import articleRoutes from './routes/articleRoutes';
import projectRoutes from './routes/projectRoutes';

dotenv.config();

console.log("📢 server.ts loaded — starting initialization...");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ===== Global Crash Handlers =====
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

// ===== Middleware =====
console.log("🌱 Initializing middleware...");
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

// ===== Health & Root Endpoints =====
app.get('/', (_req, res) => {
  res.json({
    message: 'Tech Blog & Portfolio API',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

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

// ===== Routes =====
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/projects', projectRoutes);

app.get('/api/v1/stats', async (_req, res) => {
  try {
    const stats = await prisma.siteStats.findMany();
    const statsObject = stats.reduce((acc, stat) => {
      acc[stat.key] = stat.value;
      return acc;
    }, {} as Record<string, string>);
    res.json({ success: true, data: statsObject });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
});

// ===== 404 Handler =====
app.use('*', (_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ===== Error Middleware =====
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ===== Startup Logic =====
(async () => {
  try {
    console.log("🔗 Connecting to database...");
    await prisma.$connect();
    console.log("✅ Prisma connected successfully.");

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Healthcheck: http://0.0.0.0:${PORT}/api/v1/health`);
    });
  } catch (err) {
    console.error("❌ Fatal error starting server:", err);
    process.exit(1);
  }
})();
