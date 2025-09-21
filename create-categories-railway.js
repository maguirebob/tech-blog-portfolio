const { PrismaClient } = require('@prisma/client')

// Use Railway's DATABASE_URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function createCategories() {
  console.log('🌱 Creating categories on Railway test environment...')

  try {
    // Create some test categories
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
    ]

    for (const categoryData of categories) {
      const category = await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: {},
        create: categoryData
      })
      console.log(`✅ Created category: ${category.name} (ID: ${category.id})`)
    }

    console.log('🎉 Categories created successfully on Railway!')
  } catch (error) {
    console.error('❌ Error creating categories:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createCategories()
