const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Basic health check
app.get("/", (req, res) => {
  res.json({
    message: "Tech Blog & Portfolio API",
    status: "running",
    environment: process.env.NODE_ENV || "development"
  });
});

app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Database health check
app.get("/api/v1/health/db", async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "healthy",
      database: "connected"
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message
    });
  }
});

// Stats endpoint
app.get("/api/v1/stats", async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Create SiteStats table if it doesn't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "SiteStats" (
        "id" SERIAL NOT NULL,
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SiteStats_pkey" PRIMARY KEY ("id")
      )
    `;
    
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "SiteStats_key_key" ON "SiteStats"("key")
    `;
    
    // Insert some basic stats
    await prisma.$executeRaw`
      INSERT INTO "SiteStats" ("key", "value") 
      VALUES ('total_articles', '1'), ('total_projects', '1'), ('total_users', '2')
      ON CONFLICT ("key") DO NOTHING
    `;
    
    const stats = await prisma.$queryRaw`
      SELECT "key", "value" FROM "SiteStats"
    `;
    
    const statsObject = stats.reduce((acc, stat) => {
      acc[stat.key] = stat.value;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: statsObject
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`📈 Stats endpoint: http://localhost:${PORT}/api/v1/stats`);
});
