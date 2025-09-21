import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting minimal database seeding...')

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

  // Create site statistics
  console.log('Creating site statistics...')
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

  console.log('✅ Minimal database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
