import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/techblog_dev'
    }
  },
  log: ['error']
})

beforeAll(async () => {
  // Skip migration setup for now - use existing database
  // TODO: Set up proper test database with migrations
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Skip cleanup for now - tests will use unique data
  // TODO: Set up proper test database isolation
})

export { prisma }
