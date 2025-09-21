import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { prisma } from './lib/prisma'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}))

// Compression middleware
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// Database health check
app.get('/api/v1/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: 'healthy',
      database: 'connected'
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Basic API routes (will be expanded in Phase 2)
app.get('/api/v1/stats', async (_req, res) => {
  try {
    const stats = await prisma.siteStats.findMany()
    const statsObject = stats.reduce((acc, stat) => {
      acc[stat.key] = stat.value
      return acc
    }, {} as Record<string, string>)

    res.json({
      success: true,
      data: statsObject
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Database initialization endpoint
app.post('/api/v1/init-db', async (_req, res) => {
  try {
    const { execSync } = require('child_process')
    const output = execSync('npx prisma db push', { 
      encoding: 'utf8',
      stdio: 'pipe'
    })
    console.log('DB push output:', output)
    res.json({
      success: true,
      message: 'Database schema created successfully',
      output: output
    })
  } catch (error) {
    console.error('DB init error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Debug endpoint to check database tables
app.get('/api/v1/debug/tables', async (_req, res) => {
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    res.json({
      success: true,
      tables: tables
    })
  } catch (error) {
    console.error('Debug error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Seed endpoint for development/testing
app.post('/api/v1/seed', async (_req, res) => {
  try {
    // Create basic site statistics
    await prisma.siteStats.upsert({
      where: { key: 'total_articles' },
      update: { value: '1' },
      create: { key: 'total_articles', value: '1' }
    })

    await prisma.siteStats.upsert({
      where: { key: 'total_projects' },
      update: { value: '1' },
      create: { key: 'total_projects', value: '1' }
    })

    await prisma.siteStats.upsert({
      where: { key: 'total_users' },
      update: { value: '2' },
      create: { key: 'total_users', value: '2' }
    })

    res.json({
      success: true,
      message: 'Database seeded successfully'
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  })
})

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err)
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  })
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/api/v1/health`)
  console.log(`📈 Stats endpoint: http://localhost:${PORT}/api/v1/stats`)
})
