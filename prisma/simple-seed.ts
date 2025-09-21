import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  console.log('Creating admin user...')
  const adminPassword = await bcrypt.hash('AdminPassword123!', 12)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@techblog.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true
    }
  })

  // Create test user
  console.log('Creating test user...')
  const testPassword = await bcrypt.hash('TestPassword123!', 12)
  await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      username: 'testuser',
      email: 'test@techblog.com',
      passwordHash: testPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      isActive: true
    }
  })

  // Create sample categories
  console.log('Creating categories...')
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Articles about web development technologies and practices'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'database' },
      update: {},
      create: {
        name: 'Database',
        slug: 'database',
        description: 'Database design, optimization, and management'
      }
    })
  ])

  // Create sample tags
  console.log('Creating tags...')
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'nodejs' },
      update: {},
      create: {
        name: 'Node.js',
        slug: 'nodejs',
        description: 'Node.js related content'
      }
    }),
    prisma.tag.upsert({
      where: { slug: 'typescript' },
      update: {},
      create: {
        name: 'TypeScript',
        slug: 'typescript',
        description: 'TypeScript related content'
      }
    })
  ])

  // Create sample technologies
  console.log('Creating technologies...')
  const technologies = await Promise.all([
    prisma.technology.upsert({
      where: { slug: 'nodejs' },
      update: {},
      create: {
        name: 'Node.js',
        slug: 'nodejs',
        description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
        category: 'Backend',
        iconUrl: 'https://nodejs.org/static/images/logo.svg'
      }
    }),
    prisma.technology.upsert({
      where: { slug: 'postgresql' },
      update: {},
      create: {
        name: 'PostgreSQL',
        slug: 'postgresql',
        description: 'Open source object-relational database system',
        category: 'Database',
        iconUrl: 'https://www.postgresql.org/media/img/about/press/elephant.png'
      }
    })
  ])

  // Create sample articles
  console.log('Creating articles...')
  const articles = await Promise.all([
    prisma.article.upsert({
      where: { slug: 'getting-started-with-nodejs' },
      update: {},
      create: {
        title: 'Getting Started with Node.js',
        slug: 'getting-started-with-nodejs',
        excerpt: 'Learn the basics of Node.js development',
        content: '# Getting Started with Node.js\n\nNode.js is a powerful JavaScript runtime...',
        status: 'PUBLISHED',
        featured: true,
        viewCount: 0,
        authorId: 1,
        categoryId: categories[0].id
      }
    })
  ])

  // Create sample projects
  console.log('Creating projects...')
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { slug: 'tech-blog-portfolio' },
      update: {},
      create: {
        title: 'Tech Blog & Portfolio Website',
        slug: 'tech-blog-portfolio',
        description: 'A modern tech blog and portfolio website built with Node.js, Express, PostgreSQL, and Prisma.',
        content: '# Tech Blog & Portfolio Website\n\nA full-stack web application...',
        status: 'COMPLETED',
        featured: true,
        order: 1,
        authorId: 1
      }
    })
  ])

  // Create site statistics
  console.log('Creating site statistics...')
  await prisma.siteStats.upsert({
    where: { key: 'total_articles' },
    update: { value: '1' },
    create: { key: 'total_articles', value: '1', description: 'Total number of published articles' }
  })

  await prisma.siteStats.upsert({
    where: { key: 'total_projects' },
    update: { value: '1' },
    create: { key: 'total_projects', value: '1', description: 'Total number of completed projects' }
  })

  await prisma.siteStats.upsert({
    where: { key: 'total_users' },
    update: { value: '2' },
    create: { key: 'total_users', value: '2', description: 'Total number of registered users' }
  })

  console.log('✅ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
