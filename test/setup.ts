import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/techblog_test'
    }
  },
  log: ['error']
})

beforeAll(async () => {
  // Reset and migrate test database
  try {
    execSync('NODE_ENV=test npx prisma migrate reset --force', { stdio: 'inherit' })
    execSync('NODE_ENV=test npx prisma migrate deploy', { stdio: 'inherit' })
  } catch (error) {
    console.error('Failed to setup test database:', error)
    throw error
  }
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Clean up data between tests
  await prisma.comment.deleteMany()
  await prisma.articleTag.deleteMany()
  await prisma.projectTechnology.deleteMany()
  await prisma.article.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.technology.deleteMany()
  await prisma.siteStats.deleteMany()
})

export { prisma }
