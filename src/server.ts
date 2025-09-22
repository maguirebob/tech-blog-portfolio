import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { prisma } from './lib/prisma'
import userRoutes from './routes/userRoutes'
import articleRoutes from './routes/articleRoutes'
import projectRoutes from './routes/projectRoutes'

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

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Tech Blog & Portfolio API',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  })
})

// Lightweight healthcheck endpoints for Railway (always return 200 OK)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Server status endpoint (no database dependency)
app.get('/api/v1/status', (_req, res) => {
  res.json({
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    platform: process.platform,
    nodeVersion: process.version
  })
})

// Comprehensive database health check
app.get('/api/v1/health/db', async (_req, res) => {
  try {
    // Test basic database connectivity
    await prisma.$queryRaw`SELECT 1`
    
    // Test if we can query a real table
    const userCount = await prisma.user.count()
    const articleCount = await prisma.article.count()
    const projectCount = await prisma.project.count()
    
    res.json({
      status: 'healthy',
      database: 'connected',
      tables: {
        users: userCount,
        articles: articleCount,
        projects: projectCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database health check failed:', error)
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
})

// Mount API routes
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/articles', articleRoutes)
app.use('/api/v1/projects', projectRoutes)

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

// Database initialization endpoint using raw SQL
app.post('/api/v1/init-db', async (_req, res) => {
  try {
    // Create SiteStats table directly
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "SiteStats" (
        "id" SERIAL NOT NULL,
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SiteStats_pkey" PRIMARY KEY ("id")
      )
    `
    
    // Create unique index
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "SiteStats_key_key" ON "SiteStats"("key")
    `
    
    res.json({
      success: true,
      message: 'SiteStats table created successfully'
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

// Debug endpoint to check database tables and create SiteStats if needed
app.get('/api/v1/debug/tables', async (_req, res) => {
  try {
    // First, try to create SiteStats table if it doesn't exist
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "SiteStats" (
          "id" SERIAL NOT NULL,
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "SiteStats_pkey" PRIMARY KEY ("id")
        )
      `
      
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "SiteStats_key_key" ON "SiteStats"("key")
      `
    } catch (createError) {
      console.log('Table creation error (might already exist):', createError)
    }
    
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

app.post('/api/v1/seed-categories', async (_req, res) => {
  try {
    const categories = [
      {
        name: 'Technology',
        slug: 'technology',
        description: 'Articles about technology, programming, and software development'
      },
      {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Frontend and backend web development topics'
      },
      {
        name: 'Database',
        slug: 'database',
        description: 'Database design, optimization, and management'
      },
      {
        name: 'DevOps',
        slug: 'devops',
        description: 'Development operations, deployment, and infrastructure'
      }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const category = await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: {},
        create: categoryData
      });
      createdCategories.push(category);
    }

    res.json({
      success: true,
      message: 'Categories created successfully',
      data: createdCategories
    });
  } catch (error) {
    console.error('Categories seed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/v1/seed-technologies', async (_req, res) => {
  try {
    const technologies = [
      {
        name: 'Node.js',
        slug: 'nodejs',
        icon: 'fab fa-node-js',
        color: '#68A063'
      },
      {
        name: 'Express.js',
        slug: 'expressjs',
        icon: 'fas fa-server',
        color: '#000000'
      },
      {
        name: 'PostgreSQL',
        slug: 'postgresql',
        icon: 'fas fa-database',
        color: '#336791'
      },
      {
        name: 'Prisma',
        slug: 'prisma',
        icon: 'fas fa-cube',
        color: '#2D3748'
      },
      {
        name: 'TypeScript',
        slug: 'typescript',
        icon: 'fab fa-js-square',
        color: '#3178C6'
      },
      {
        name: 'React',
        slug: 'react',
        icon: 'fab fa-react',
        color: '#61DAFB'
      }
    ];

    const createdTechnologies = [];
    for (const techData of technologies) {
      const technology = await prisma.technology.upsert({
        where: { slug: techData.slug },
        update: {},
        create: techData
      });
      createdTechnologies.push(technology);
    }

    res.json({
      success: true,
      message: 'Technologies created successfully',
      data: createdTechnologies
    });
  } catch (error) {
    console.error('Technologies seed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create technologies',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

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

// Export app for testing
export { app }

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  try {
    console.log('🚀 Starting server...')
    console.log(`📊 Environment: ${process.env.NODE_ENV}`)
    console.log(`🔗 Port: ${PORT}`)
    console.log(`🔗 Host: 0.0.0.0`)
    
    const server = app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`✅ Server successfully started on port ${PORT}`)
      console.log(`🔗 Health check: http://0.0.0.0:${PORT}/api/v1/health`)
      console.log(`📈 Stats endpoint: http://0.0.0.0:${PORT}/api/v1/stats`)
    })
    
    // Handle server errors
    server.on('error', (err) => {
      console.error('❌ Server error:', err)
      process.exit(1)
    })
    
    // Handle process errors
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err)
      process.exit(1)
    })
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
      process.exit(1)
    })
    
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}
