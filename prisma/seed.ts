import { PrismaClient, Role, ArticleStatus, ProjectStatus } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('AdminPassword123!', 12)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@techblog.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      bio: 'System administrator for the tech blog',
      role: Role.ADMIN,
      isActive: true
    }
  })

  // Create author user
  const authorPassword = await bcrypt.hash('AuthorPassword123!', 12)
  const author = await prisma.user.upsert({
    where: { username: 'author' },
    update: {},
    create: {
      username: 'author',
      email: 'author@techblog.com',
      passwordHash: authorPassword,
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Tech blogger and software developer',
      role: Role.AUTHOR,
      isActive: true
    }
  })

  // Create test user
  const testPassword = await bcrypt.hash('TestPassword123!', 12)
  const testUser = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      username: 'testuser',
      email: 'test@techblog.com',
      passwordHash: testPassword,
      firstName: 'Test',
      lastName: 'User',
      bio: 'Test user account',
      role: Role.USER,
      isActive: true
    }
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Articles about web development technologies and practices',
        color: '#3b82f6'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'nodejs' },
      update: {},
      create: {
        name: 'Node.js',
        slug: 'nodejs',
        description: 'Node.js tutorials and best practices',
        color: '#10b981'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'database' },
      update: {},
      create: {
        name: 'Database',
        slug: 'database',
        description: 'Database design and optimization',
        color: '#f59e0b'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'devops' },
      update: {},
      create: {
        name: 'DevOps',
        slug: 'devops',
        description: 'DevOps practices and tools',
        color: '#ef4444'
      }
    })
  ])

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'javascript' },
      update: {},
      create: { name: 'JavaScript', slug: 'javascript' }
    }),
    prisma.tag.upsert({
      where: { slug: 'typescript' },
      update: {},
      create: { name: 'TypeScript', slug: 'typescript' }
    }),
    prisma.tag.upsert({
      where: { slug: 'express' },
      update: {},
      create: { name: 'Express', slug: 'express' }
    }),
    prisma.tag.upsert({
      where: { slug: 'postgresql' },
      update: {},
      create: { name: 'PostgreSQL', slug: 'postgresql' }
    }),
    prisma.tag.upsert({
      where: { slug: 'prisma' },
      update: {},
      create: { name: 'Prisma', slug: 'prisma' }
    }),
    prisma.tag.upsert({
      where: { slug: 'testing' },
      update: {},
      create: { name: 'Testing', slug: 'testing' }
    })
  ])

  // Create technologies
  const technologies = await Promise.all([
    prisma.technology.upsert({
      where: { slug: 'nodejs' },
      update: {},
      create: {
        name: 'Node.js',
        slug: 'nodejs',
        icon: 'node-js',
        color: '#339933'
      }
    }),
    prisma.technology.upsert({
      where: { slug: 'express' },
      update: {},
      create: {
        name: 'Express.js',
        slug: 'express',
        icon: 'express',
        color: '#000000'
      }
    }),
    prisma.technology.upsert({
      where: { slug: 'postgresql' },
      update: {},
      create: {
        name: 'PostgreSQL',
        slug: 'postgresql',
        icon: 'postgresql',
        color: '#336791'
      }
    }),
    prisma.technology.upsert({
      where: { slug: 'prisma' },
      update: {},
      create: {
        name: 'Prisma',
        slug: 'prisma',
        icon: 'prisma',
        color: '#2D3748'
      }
    }),
    prisma.technology.upsert({
      where: { slug: 'typescript' },
      update: {},
      create: {
        name: 'TypeScript',
        slug: 'typescript',
        icon: 'typescript',
        color: '#3178C6'
      }
    }),
    prisma.technology.upsert({
      where: { slug: 'jest' },
      update: {},
      create: {
        name: 'Jest',
        slug: 'jest',
        icon: 'jest',
        color: '#C21325'
      }
    })
  ])

  // Create sample articles
  const articles = await Promise.all([
    prisma.article.upsert({
      where: { slug: 'building-modern-web-applications' },
      update: {},
      create: {
        title: 'Building Modern Web Applications with Node.js and Express',
        slug: 'building-modern-web-applications',
        excerpt: 'Learn how to build scalable web applications using Node.js, Express, and modern development practices.',
        content: `# Building Modern Web Applications with Node.js and Express

In this comprehensive guide, we'll explore how to build modern, scalable web applications using Node.js and Express.js.

## Introduction

Node.js has revolutionized web development by allowing JavaScript to run on the server side. Combined with Express.js, it provides a powerful foundation for building web applications.

## Key Features

- **Asynchronous I/O**: Non-blocking operations for better performance
- **Rich Ecosystem**: NPM packages for almost everything
- **JSON Native**: Perfect for modern web APIs
- **Cross-Platform**: Runs on Windows, macOS, and Linux

## Getting Started

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

## Best Practices

1. **Use TypeScript**: Better type safety and developer experience
2. **Implement Error Handling**: Proper error handling middleware
3. **Add Logging**: Use Winston or similar for logging
4. **Security First**: Implement authentication and validation
5. **Testing**: Write comprehensive tests

## Conclusion

Node.js and Express provide a solid foundation for building modern web applications. With the right practices and tools, you can create scalable, maintainable applications.`,
        status: ArticleStatus.PUBLISHED,
        featured: true,
        viewCount: 1250,
        publishedAt: new Date('2024-01-15'),
        authorId: author.id,
        categoryId: categories[0].id
      }
    }),
    prisma.article.upsert({
      where: { slug: 'database-design-with-prisma' },
      update: {},
      create: {
        title: 'Database Design with Prisma ORM',
        slug: 'database-design-with-prisma',
        excerpt: 'Master database design using Prisma ORM with PostgreSQL. Learn about relationships, migrations, and best practices.',
        content: `# Database Design with Prisma ORM

Prisma is a modern database toolkit that makes database access easy and type-safe.

## What is Prisma?

Prisma consists of three main tools:
- **Prisma Client**: Type-safe database client
- **Prisma Migrate**: Database migration tool
- **Prisma Studio**: Database GUI

## Schema Definition

\`\`\`prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  content  String?
  authorId Int
  author   User   @relation(fields: [authorId], references: [id])
}
\`\`\`

## Best Practices

1. **Use meaningful names**: Clear, descriptive model and field names
2. **Add indexes**: For frequently queried fields
3. **Handle relationships**: Proper foreign key relationships
4. **Version control**: Keep migrations in version control
5. **Test migrations**: Always test migrations before production

## Conclusion

Prisma makes database management much easier and safer. With proper design, you can build robust applications.`,
        status: ArticleStatus.PUBLISHED,
        featured: false,
        viewCount: 890,
        publishedAt: new Date('2024-01-20'),
        authorId: author.id,
        categoryId: categories[2].id
      }
    }),
    prisma.article.upsert({
      where: { slug: 'testing-nodejs-applications' },
      update: {},
      create: {
        title: 'Testing Node.js Applications: A Complete Guide',
        slug: 'testing-nodejs-applications',
        excerpt: 'Comprehensive guide to testing Node.js applications with Jest, Supertest, and best practices.',
        content: `# Testing Node.js Applications: A Complete Guide

Testing is crucial for building reliable Node.js applications. This guide covers everything you need to know.

## Testing Types

### Unit Tests
Test individual functions and modules in isolation.

### Integration Tests
Test how different parts of your application work together.

### End-to-End Tests
Test complete user workflows.

## Setting Up Jest

\`\`\`bash
npm install --save-dev jest @types/jest ts-jest
\`\`\`

\`\`\`javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts']
};
\`\`\`

## Writing Tests

\`\`\`javascript
describe('User Service', () => {
  test('should create user with valid data', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = await userService.createUser(userData);
    
    expect(user.username).toBe('testuser');
    expect(user.email).toBe('test@example.com');
  });
});
\`\`\`

## Best Practices

1. **Test early and often**: Write tests as you develop
2. **Use descriptive names**: Clear test descriptions
3. **Test edge cases**: Include error scenarios
4. **Mock external dependencies**: Isolate your code
5. **Maintain test data**: Keep test data clean and consistent

## Conclusion

Good testing practices lead to more reliable applications and better developer confidence.`,
        status: ArticleStatus.PUBLISHED,
        featured: true,
        viewCount: 2100,
        publishedAt: new Date('2024-01-25'),
        authorId: author.id,
        categoryId: categories[0].id
      }
    })
  ])

  // Create article-tag relationships
  await prisma.articleTag.createMany({
    data: [
      { articleId: articles[0].id, tagId: tags[0].id }, // JavaScript
      { articleId: articles[0].id, tagId: tags[2].id }, // Express
      { articleId: articles[1].id, tagId: tags[1].id }, // TypeScript
      { articleId: articles[1].id, tagId: tags[3].id }, // PostgreSQL
      { articleId: articles[1].id, tagId: tags[4].id }, // Prisma
      { articleId: articles[2].id, tagId: tags[1].id }, // TypeScript
      { articleId: articles[2].id, tagId: tags[5].id }  // Testing
    ],
    skipDuplicates: true
  })

  // Create sample projects
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { slug: 'tech-blog-portfolio' },
      update: {},
      create: {
        title: 'Tech Blog & Portfolio Website',
        slug: 'tech-blog-portfolio',
        description: 'A modern tech blog and portfolio website built with Node.js, Express, PostgreSQL, and Prisma.',
        content: `# Tech Blog & Portfolio Website

A full-stack web application showcasing modern web development practices.

## Features

- **Blog System**: Article management with categories and tags
- **Portfolio**: Project showcase with technology stack
- **User Management**: Authentication and role-based access
- **Responsive Design**: Mobile-first approach
- **Modern Stack**: Node.js, Express, PostgreSQL, Prisma

## Technologies Used

- Node.js & Express.js
- PostgreSQL with Prisma ORM
- TypeScript for type safety
- Jest for testing
- Modern CSS with responsive design

## Key Features

- RESTful API design
- JWT authentication
- Database migrations
- Comprehensive testing
- Environment configuration
- Docker support

## Architecture

The application follows a clean architecture pattern with:
- Service layer for business logic
- Repository pattern for data access
- Middleware for cross-cutting concerns
- Comprehensive error handling`,
        imageUrl: 'https://via.placeholder.com/800x400/3b82f6/ffffff?text=Tech+Blog+Portfolio',
        demoUrl: 'https://techblog.com',
        githubUrl: 'https://github.com/username/tech-blog-portfolio',
        status: ProjectStatus.COMPLETED,
        featured: true,
        order: 1,
        authorId: author.id
      }),
    prisma.project.upsert({
      where: { slug: 'ecommerce-api' },
      update: {},
      create: {
        title: 'E-commerce REST API',
        slug: 'ecommerce-api',
        description: 'A comprehensive REST API for e-commerce applications with user management, product catalog, and order processing.',
        content: `# E-commerce REST API

A robust REST API for e-commerce applications built with modern technologies.

## Features

- User authentication and authorization
- Product catalog management
- Shopping cart functionality
- Order processing
- Payment integration
- Admin dashboard

## API Endpoints

- \`GET /api/products\` - List products
- \`POST /api/products\` - Create product
- \`GET /api/orders\` - List orders
- \`POST /api/orders\` - Create order

## Security

- JWT authentication
- Input validation
- Rate limiting
- CORS configuration
- SQL injection prevention`,
        imageUrl: 'https://via.placeholder.com/800x400/10b981/ffffff?text=E-commerce+API',
        demoUrl: 'https://ecommerce-api.example.com',
        githubUrl: 'https://github.com/username/ecommerce-api',
        status: ProjectStatus.COMPLETED,
        featured: true,
        order: 2,
        authorId: author.id
      }),
    prisma.project.upsert({
      where: { slug: 'task-management-app' },
      update: {},
      create: {
        title: 'Task Management Application',
        slug: 'task-management-app',
        description: 'A collaborative task management application with real-time updates and team collaboration features.',
        content: `# Task Management Application

A modern task management application with real-time collaboration features.

## Features

- Real-time updates
- Team collaboration
- Task assignment
- Progress tracking
- File attachments
- Mobile responsive

## Technologies

- React frontend
- Node.js backend
- WebSocket for real-time updates
- MongoDB for data storage
- Redis for caching

## Key Components

- Task board with drag-and-drop
- User management
- Team workspaces
- Notification system
- File upload system`,
        imageUrl: 'https://via.placeholder.com/800x400/f59e0b/ffffff?text=Task+Management',
        demoUrl: 'https://tasks.example.com',
        githubUrl: 'https://github.com/username/task-management',
        status: ProjectStatus.IN_PROGRESS,
        featured: false,
        order: 3,
        authorId: author.id
      })
    ])

  // Create project-technology relationships
  await prisma.projectTechnology.createMany({
    data: [
      { projectId: projects[0].id, technologyId: technologies[0].id }, // Node.js
      { projectId: projects[0].id, technologyId: technologies[1].id }, // Express
      { projectId: projects[0].id, technologyId: technologies[2].id }, // PostgreSQL
      { projectId: projects[0].id, technologyId: technologies[3].id }, // Prisma
      { projectId: projects[0].id, technologyId: technologies[4].id }, // TypeScript
      { projectId: projects[1].id, technologyId: technologies[0].id }, // Node.js
      { projectId: projects[1].id, technologyId: technologies[1].id }, // Express
      { projectId: projects[1].id, technologyId: technologies[4].id }, // TypeScript
      { projectId: projects[2].id, technologyId: technologies[0].id }, // Node.js
      { projectId: projects[2].id, technologyId: technologies[4].id }  // TypeScript
    ],
    skipDuplicates: true
  })

  // Create site statistics
  await prisma.siteStats.upsert({
    where: { key: 'total_articles' },
    update: { value: articles.length.toString() },
    create: { key: 'total_articles', value: articles.length.toString() }
  })

  await prisma.siteStats.upsert({
    where: { key: 'total_projects' },
    update: { value: projects.length.toString() },
    create: { key: 'total_projects', value: projects.length.toString() }
  })

  await prisma.siteStats.upsert({
    where: { key: 'total_users' },
    update: { value: '3' },
    create: { key: 'total_users', value: '3' }
  })

  await prisma.siteStats.upsert({
    where: { key: 'total_comments' },
    update: { value: '0' },
    create: { key: 'total_comments', value: '0' }
  })

  console.log('Seed completed successfully!')
  console.log(`Created ${await prisma.user.count()} users`)
  console.log(`Created ${await prisma.category.count()} categories`)
  console.log(`Created ${await prisma.tag.count()} tags`)
  console.log(`Created ${await prisma.technology.count()} technologies`)
  console.log(`Created ${await prisma.article.count()} articles`)
  console.log(`Created ${await prisma.project.count()} projects`)
  console.log(`Created ${await prisma.siteStats.count()} site statistics`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
