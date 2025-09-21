# Node.js Express PostgreSQL Website Architecture

Bob Maguire  
September 2025

## Table of Contents

### 1. [Purpose](#purpose)
### 2. [Development Conventions](#development-conventions)
- 2.1 [AI Assistant Development Workflow](#ai-assistant-development-workflow)
  - 2.1.1 [Design-First Approach](#1-design-first-approach)
  - 2.1.2 [Test-Driven Development (TDD)](#2-test-driven-development-tdd)
  - 2.1.3 [Gradual Implementation Strategy](#3-gradual-implementation-strategy)
  - 2.1.4 [Case-Insensitive Username Handling](#4-case-insensitive-username-handling)
  - 2.1.5 [Documentation Standards](#5-documentation-standards)
  - 2.1.6 [Quality Assurance](#6-quality-assurance)
  - 2.1.7 [Communication Protocol](#7-communication-protocol)
  - 2.1.8 [Debugging and Troubleshooting Conventions](#8-debugging-and-troubleshooting-conventions)

### 3. [Languages and Frameworks](#languages-and-frameworks)
- 3.1 [Client Side](#client-side)
- 3.2 [Server Side](#server-side)

### 4. [Environment Configuration](#environment-configuration)
- 4.1 [Development Environment](#development-environment)
- 4.2 [Test Environment](#test-environment)
- 4.3 [Production Environment](#production-environment)
- 4.4 [Environment Variables](#environment-variables)
- 4.5 [Database Configuration](#database-configuration)

### 5. [Security & Authentication](#security--authentication)
- 5.1 [Authentication Strategy](#authentication-strategy)
- 5.2 [Database Tables](#database-tables)
- 5.3 [User Models](#user-models)
- 5.4 [Authentication Middleware](#authentication-middleware)
- 5.5 [Authentication Routes & Controllers](#authentication-routes--controllers)
- 5.6 [Admin Dashboard and User Management Views](#admin-dashboard-and-user-management-views)
- 5.7 [Security Features](#security-features)

### 6. [Testing](#testing)
- 6.1 [Testing Strategy](#testing-strategy)
- 6.2 [Testing Configuration](#testing-configuration)
- 6.3 [Test Environment Setup](#test-environment-setup)
- 6.4 [Testing Tools and Frameworks](#testing-tools-and-frameworks)

### 7. [Database Management with Prisma](#database-management-with-prisma)
- 7.1 [Prisma Schema Design](#prisma-schema-design)
- 7.2 [Prisma Client Setup](#prisma-client-setup)
- 7.3 [Migrations with Prisma](#migrations-with-prisma)
- 7.4 [Seed Data with Prisma](#seed-data-with-prisma)
- 7.5 [Database Testing with Prisma](#database-testing-with-prisma)
- 7.6 [Raw SQL with Prisma](#raw-sql-with-prisma)

### 8. [API Design](#api-design)
- 8.1 [REST API Standards](#rest-api-standards)
- 8.2 [API Documentation](#api-documentation)
- 8.3 [Error Handling](#error-handling)
- 8.4 [Rate Limiting](#rate-limiting)

### 9. [Deployment and DevOps](#deployment-and-devops)
- 9.1 [Development Workflow](#development-workflow)
- 9.2 [CI/CD Pipeline](#cicd-pipeline)
- 9.3 [Environment Promotion](#environment-promotion)
- 9.4 [Monitoring and Logging](#monitoring-and-logging)

### 10. [Performance and Optimization](#performance-and-optimization)
- 10.1 [Database Optimization](#database-optimization)
- 10.2 [API Performance](#api-performance)
- 10.3 [Frontend Optimization](#frontend-optimization)
- 10.4 [Caching Strategies](#caching-strategies)

---

## Purpose

This document outlines the architecture, development conventions, and implementation strategy for building and managing a Node.js/Express website with PostgreSQL database across three environments: development, test, and production. The architecture emphasizes test-driven development, comprehensive testing, security best practices, and maintainable code patterns.

---

# Development Conventions

## AI Assistant Development Workflow

When working with Bob Maguire on this website project, the AI assistant will follow these specific conventions:

### 1. Design-First Approach
- **Always create a design and add it to the .md first**
- Before implementing any new functionality, create a comprehensive design document
- Include detailed specifications, API endpoints, database schemas, and UI mockups
- Document all design decisions and rationale in the architecture document
- Ensure the design is complete and approved before proceeding to implementation

### 2. Test-Driven Development (TDD)
- **Always create a set of tests following the test-driven development approach next**
- Write comprehensive test suites before implementing functionality
- Include unit tests, integration tests, and end-to-end tests
- Test both success and failure scenarios
- Ensure tests cover all edge cases and error conditions
- Use descriptive test names that clearly explain what is being tested

#### Enhanced Testing Requirements (Based on Real-World Experience):
- **Test Real Data Formats**: Use actual browser-generated data (data URLs, base64) not just mock data
- **Test Cross-Domain Scenarios**: Verify absolute URLs work in browser context, not just relative URLs
- **Test Image Validation**: Verify API returns valid image data that can actually be decoded and displayed
- **Test Authentication Methods**: Test both header-based and query parameter authentication (for img tags)
- **Test Browser-Specific Behavior**: Mock browser APIs (window.location, FileReader, etc.) in tests
- **Test End-to-End Workflows**: Test complete user journeys, not just individual components
- **Test Error Scenarios**: Include network failures, invalid data, and browser security restrictions
- **Test Data URL Handling**: Verify base64 data with and without data URL prefixes
- **Test File Upload Edge Cases**: Test with real files, various formats, and size limits
- **Test UI Integration**: Verify JavaScript modules work together in browser environment

### 3. Gradual Implementation Strategy
When building a new piece of functionality, implement it gradually in this specific order:

#### Phase 1: Database Layer
- Create or update database tables and schemas
- Implement database migrations and seed data
- Create database connection and query functions
- Test database operations independently

#### Phase 2: API Endpoints
- Implement REST API endpoints
- Add proper authentication and authorization
- Include comprehensive error handling
- Test all endpoints with various inputs and scenarios

#### Phase 3: JavaScript/Backend Logic
- Implement business logic and data processing
- Add validation and sanitization
- Create utility functions and helpers
- Test all JavaScript functionality thoroughly

#### Phase 4: User Interface (UI)
- Design and implement user interface components
- Add client-side JavaScript for interactivity
- Implement responsive design and accessibility
- Test UI across different devices and browsers

### 4. Case-Insensitive Username Handling
**Always implement case-insensitive username functionality for user authentication systems.**

#### Problem Solved
- Resolves inconsistencies between local development databases (case-insensitive) and production databases (case-sensitive)
- Ensures consistent user experience across all environments
- Prevents duplicate user accounts due to case variations

#### Implementation Approach
1. **Database Storage**: Always store usernames in lowercase in the database
2. **Registration**: Convert usernames to lowercase before storing using `username.toLowerCase()`
3. **Login Lookup**: Use case-insensitive database queries with `LOWER(username) = LOWER($1)`
4. **Duplicate Check**: Use case-insensitive comparison for existing username checks with `LOWER(username) = LOWER($1)`
5. **Migration**: Include username migration in database setup to convert existing usernames to lowercase

#### Code Examples
```javascript
// Registration - Convert to lowercase before storing
const result = await client.query(
  `INSERT INTO "Users" (username, email, password_hash, role) 
   VALUES ($1, $2, $3, 'user') 
   RETURNING id, username, email, role, created_at`,
  [username.toLowerCase(), email, hashedPassword]
);

// Login - Case-insensitive lookup
const result = await client.query(
  'SELECT id, username, email, password_hash, role FROM "Users" WHERE LOWER(username) = LOWER($1)',
  [username]
);

// Duplicate Check - Case-insensitive comparison
const existingUser = await client.query(
  'SELECT id FROM "Users" WHERE LOWER(username) = LOWER($1) OR email = $2',
  [username, email]
);
```

#### Migration Script Pattern
```javascript
// Get all users and convert usernames to lowercase
const users = await client.query('SELECT id, username FROM "Users"');
const usersToUpdate = users.rows.filter(user => user.username !== user.username.toLowerCase());

for (const user of usersToUpdate) {
  const lowercaseUsername = user.username.toLowerCase();
  
  // Check for conflicts
  const existingUser = await client.query(
    'SELECT id FROM "Users" WHERE username = $1 AND id != $2',
    [lowercaseUsername, user.id]
  );
  
  if (existingUser.rows.length === 0) {
    await client.query('UPDATE "Users" SET username = $1 WHERE id = $2', 
      [lowercaseUsername, user.id]);
  }
}
```

#### Benefits
- **Consistency**: Works identically across all environments
- **User-Friendly**: Users can login with any case variation (bob, Bob, BOB)
- **Prevents Duplicates**: No duplicate accounts due to case differences
- **Future-Proof**: Handles any database case-sensitivity settings

### 5. Documentation Standards
- Update the architecture document with each new feature
- Include code examples and usage instructions
- Document any breaking changes or migration steps
- Maintain a changelog of significant updates

### 6. Quality Assurance
- Run all tests before considering a feature complete
- Verify functionality in both development and production environments
- Ensure code follows established patterns and conventions
- Perform thorough testing of all user workflows

### 7. Communication Protocol
- Provide clear status updates at each phase
- Explain any deviations from the planned approach
- Ask for clarification when requirements are ambiguous
- Confirm completion of each phase before proceeding

### 8. Debugging and Troubleshooting Conventions
Based on real-world debugging experience, follow these practices when issues arise:

#### Debugging Strategy:
- **Add Comprehensive Logging**: Include detailed console logs for all major operations
- **Test API Endpoints Directly**: Use curl or Postman to verify API responses independently
- **Verify Data Formats**: Check actual data being stored vs. expected formats
- **Test in Browser Context**: Verify functionality works in real browser environment
- **Check Authentication Flow**: Verify tokens are valid and properly formatted
- **Validate URL Generation**: Ensure absolute URLs are generated correctly for cross-domain requests

#### Common Issue Patterns:
- **Data Format Mismatches**: Browser-generated data (data URLs) vs. expected formats
- **URL Generation Issues**: Relative vs. absolute URL problems in different environments
- **Authentication Edge Cases**: Different auth methods needed for different use cases
- **Browser API Differences**: Mock vs. real browser behavior discrepancies
- **Cross-Domain Security**: CORS and cookie restrictions in production environments

#### Debugging Tools:
- **API Debug Endpoints**: Create temporary endpoints to inspect data and state
- **Console Logging**: Add detailed logging to track data flow and identify issues
- **Browser DevTools**: Use network tab to verify API calls and responses
- **Database Inspection**: Query database directly to verify data integrity
- **Environment Testing**: Test in both development and production environments

#### Issue Resolution Process:
1. **Identify the Root Cause**: Use logging and debugging tools to pinpoint the issue
2. **Create Minimal Reproduction**: Isolate the problem to its simplest form
3. **Test the Fix**: Verify the solution works in all relevant environments
4. **Update Tests**: Add tests to prevent regression of the same issue
5. **Document the Solution**: Update architecture document with lessons learned

These conventions ensure consistent, high-quality development with proper planning, testing, and implementation practices.

---

# Languages and Frameworks

## Client Side:
- HTML5
- CSS3 (with modern features like Grid, Flexbox, Custom Properties)
- JavaScript (ES6+)
- Responsive Design Principles
- Accessibility Standards (WCAG 2.1)

## Server Side:
- Node.js (LTS version)
- Express.js (Web Framework)
- PostgreSQL (Database)
- Prisma (ORM and Database Toolkit)
- JWT (Authentication)
- bcrypt (Password Hashing)
- CORS (Cross-Origin Resource Sharing)

---

# Environment Configuration

## Development Environment
- **Platform**: Local development machine
- **Database**: Local PostgreSQL instance
- **Port**: 3000 (configurable)
- **Authentication**: Session-based for easier debugging
- **Logging**: Detailed console logging
- **Hot Reload**: Enabled for rapid development

## Test Environment
- **Platform**: Isolated test environment
- **Database**: Test-specific PostgreSQL instance
- **Port**: 3001 (configurable)
- **Authentication**: JWT-based (matches production)
- **Logging**: Test-specific logging levels
- **Data**: Clean test data for each test run

## Production Environment
- **Platform**: Cloud hosting (e.g., Vercel, Railway, AWS)
- **Database**: Managed PostgreSQL service
- **Port**: Environment-specific (80/443)
- **Authentication**: JWT-based with secure tokens
- **Logging**: Production-appropriate logging
- **Security**: Full security measures enabled

## Environment Variables

### Required Environment Variables
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
DB_HOST=localhost
DB_PORT=5432
DB_NAME=database_name
DB_USER=username
DB_PASSWORD=password

# Server Configuration
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload (if applicable)
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Environment-Specific Variables
```bash
# Development
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000

# Test
NODE_ENV=test
LOG_LEVEL=error
CORS_ORIGIN=http://localhost:3001

# Production
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
```

## Database Configuration

### Development Database
- Local PostgreSQL instance
- Case-insensitive collation (if possible)
- Detailed query logging
- Backup before major changes

### Test Database
- Isolated test database
- Reset before each test suite
- Minimal data for testing
- Fast cleanup procedures

### Production Database
- Managed PostgreSQL service
- Automated backups
- Connection pooling
- Monitoring and alerting

---

# Security & Authentication

## Authentication Strategy

### Development Environment
- Session-based authentication for easier debugging
- Simple login/logout functionality
- Admin role for testing

### Test Environment
- JWT-based authentication (matches production)
- Test user accounts
- Automated authentication testing

### Production Environment
- JWT-based authentication with secure tokens
- Role-based access control
- Password complexity requirements
- Account lockout policies

## Database Tables

### Users Table
```sql
CREATE TABLE "Users" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);
```

### Sessions Table (Development)
```sql
CREATE TABLE "Sessions" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "Users"(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## User Models

### Prisma Schema (User Model)
```prisma
model User {
  id           Int      @id @default(autoincrement())
  username     String   @unique @map("username")
  email        String   @unique @map("email")
  passwordHash String   @map("password_hash")
  role         Role     @default(USER)
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  lastLogin    DateTime? @map("last_login")

  @@map("Users")
  @@index([username])
  @@index([email])
  @@index([role, isActive])
}

enum Role {
  USER
  ADMIN
}
```

### User Service with Prisma
```typescript
// services/UserService.ts
import { PrismaClient, Role, User } from '@prisma/client'
import bcrypt from 'bcrypt'

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async createUser(data: {
    username: string
    email: string
    password: string
    role?: Role
  }): Promise<User> {
    // Convert username to lowercase
    const username = data.username.toLowerCase()
    
    // Check for existing user (case-insensitive)
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: data.email.toLowerCase() }
        ]
      }
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12)

    return this.prisma.user.create({
      data: {
        username,
        email: data.email.toLowerCase(),
        passwordHash,
        role: data.role || Role.USER
      }
    })
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        username: username.toLowerCase(),
        isActive: true
      }
    })
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        isActive: true
      }
    })
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() }
    })
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash)
  }
}
```

## Authentication Middleware

### JWT Middleware
```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
```

### Role-Based Authorization
```javascript
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};
```

## Authentication Routes & Controllers

### Auth Routes with Prisma
```typescript
// routes/auth.ts
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { UserService } from '../services/UserService'
import { prisma } from '../lib/prisma'

const router = Router()
const userService = new UserService(prisma)

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    
    // Create user using service
    const user = await userService.createUser({
      username,
      email,
      password
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message === 'User already exists') {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user (case-insensitive)
    const user = await userService.findUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await userService.validatePassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await userService.updateLastLogin(user.id);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router
```

## Security Features

### Password Security
- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character
- Bcrypt hashing with salt rounds of 12
- Password strength validation

### Input Validation
- All user inputs validated and sanitized
- SQL injection prevention through parameterized queries
- XSS protection through input sanitization
- CSRF protection for state-changing operations

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later'
});

app.use('/auth', authLimiter);
```

### CORS Configuration
```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

# Testing

## Testing Strategy

### Test Pyramid
1. **Unit Tests** (70%): Individual functions and methods
2. **Integration Tests** (20%): API endpoints and database operations
3. **End-to-End Tests** (10%): Complete user workflows

### Test Categories
- **Unit Tests**: Individual functions, models, utilities
- **Integration Tests**: API endpoints, database operations, authentication
- **End-to-End Tests**: Complete user journeys, browser interactions
- **Performance Tests**: Load testing, response times
- **Security Tests**: Authentication, authorization, input validation

## Testing Configuration

### Test Environment Setup with Prisma
```typescript
// test/setup.ts
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/test_database'
    }
  },
  log: ['error']
})

beforeAll(async () => {
  // Reset and migrate test database
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' })
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Clean up data between tests
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()
})

export { prisma }
```

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/test/**/*.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

## Testing Tools and Frameworks

### Unit Testing
- **Jest**: Primary testing framework
- **Supertest**: HTTP assertion library
- **Sinon**: Mocking and stubbing

### Integration Testing
- **Jest + Supertest**: API endpoint testing
- **Test Database**: Isolated test database
- **Mock External Services**: External API mocking

### End-to-End Testing
- **Playwright**: Browser automation
- **Puppeteer**: Alternative browser automation
- **Cypress**: Frontend testing framework

### Test Examples

#### Unit Test Example with Prisma
```typescript
// test/models/User.test.ts
import { prisma } from '../setup'
import { Role } from '@prisma/client'

describe('User Model', () => {
  test('should create user with lowercase username', async () => {
    const user = await prisma.user.create({
      data: {
        username: 'TestUser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        role: Role.USER
      }
    });

    expect(user.username).toBe('testuser');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe(Role.USER);
  });

  test('should prevent duplicate usernames (case-insensitive)', async () => {
    await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test1@example.com',
        passwordHash: 'hashedpassword'
      }
    });

    await expect(
      prisma.user.create({
        data: {
          username: 'TestUser',
          email: 'test2@example.com',
          passwordHash: 'hashedpassword'
        }
      })
    ).rejects.toThrow();
  });

  test('should find user by username (case-insensitive)', async () => {
    await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword'
      }
    });

    const foundUser = await prisma.user.findFirst({
      where: { username: 'TestUser' }
    });

    expect(foundUser).toBeTruthy();
    expect(foundUser?.username).toBe('testuser');
  });
});
```

#### Integration Test Example with Prisma
```typescript
// test/routes/auth.test.ts
import request from 'supertest'
import app from '../../src/app'
import { prisma } from '../setup'
import { Role } from '@prisma/client'

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    test('should register new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe('testuser');
    });

    test('should reject duplicate username (case-insensitive)', async () => {
      await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'existing@example.com',
          passwordHash: 'hashedpassword',
          role: Role.USER
        }
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'TestUser',
          email: 'new@example.com',
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User already exists');
    });

    test('should reject duplicate email', async () => {
      await prisma.user.create({
        data: {
          username: 'existinguser',
          email: 'test@example.com',
          passwordHash: 'hashedpassword',
          role: Role.USER
        }
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'newuser',
          email: 'test@example.com',
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User already exists');
    });
  });

  describe('POST /auth/login', () => {
    test('should login with correct credentials', async () => {
      const password = 'TestPassword123!'
      const hashedPassword = await bcrypt.hash(password, 12)
      
      await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          passwordHash: hashedPassword,
          role: Role.USER
        }
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'TestUser', // Case-insensitive
          password: password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe('testuser');
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});
```

---

# Database Management with Prisma

## Why Prisma Over Raw SQL?

### Benefits for Your Development Conventions

#### 1. **Enhanced TDD Support**
- **Type Safety**: Generated TypeScript types catch errors at compile time
- **IntelliSense**: Full IDE support with autocomplete and error detection
- **Test Reliability**: Type-safe database operations reduce test flakiness

#### 2. **Design-First Approach Alignment**
- **Schema as Documentation**: Prisma schema serves as living documentation
- **Visual Schema Editor**: Prisma Studio provides visual database management
- **Migration History**: Clear migration history and rollback capabilities

#### 3. **Environment Management**
- **Easy Database Switching**: Simple environment variable configuration
- **Test Database Setup**: Streamlined test database management
- **Migration Automation**: Automatic migration generation and application

#### 4. **Developer Experience**
- **Query Builder**: Intuitive query syntax that's easier to learn than raw SQL
- **Auto-completion**: Full TypeScript support with IDE integration
- **Error Messages**: Clear, helpful error messages for debugging

#### 5. **Maintenance and Scalability**
- **Code Generation**: Automatic client generation from schema changes
- **Version Control**: Schema changes tracked in version control
- **Team Collaboration**: Consistent database operations across team members

### When to Use Raw SQL with Prisma
Prisma still allows raw SQL when needed:
- Complex analytical queries
- Performance-critical operations
- Database-specific features
- Bulk operations
- Custom stored procedures

---

# Database Management with Prisma

## Prisma Schema Design

### Prisma Schema File (schema.prisma)
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

model User {
  id           Int      @id @default(autoincrement())
  username     String   @unique @map("username")
  email        String   @unique @map("email")
  passwordHash String   @map("password_hash")
  role         Role     @default(USER)
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  lastLogin    DateTime? @map("last_login")

  @@map("Users")
  @@index([username])
  @@index([email])
  @@index([role, isActive])
}

model Session {
  id        String   @id @default(cuid())
  userId    Int      @map("user_id")
  sessionId String   @unique @map("session_id")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("Sessions")
  @@index([userId])
  @@index([sessionId])
}
```

### Schema Design Principles
- **Type Safety**: Prisma generates TypeScript types automatically
- **Relationships**: Clear model relationships with foreign keys
- **Indexing**: Strategic indexes for performance
- **Naming**: Consistent naming with database mapping
- **Constraints**: Database-level constraints for data integrity

## Prisma Client Setup

### Prisma Client Configuration
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Environment-Specific Configuration
```typescript
// Different Prisma clients for different environments
const createPrismaClient = (databaseUrl: string) => {
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query'] : []
  })
}

// Development
const devPrisma = createPrismaClient(process.env.DATABASE_URL!)

// Test
const testPrisma = createPrismaClient(process.env.TEST_DATABASE_URL!)

// Production
const prodPrisma = createPrismaClient(process.env.PRODUCTION_DATABASE_URL!)
```

## Migrations with Prisma

### Migration Workflow
```bash
# Generate migration from schema changes
npx prisma migrate dev --name add_user_table

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Custom Migration Scripts
```sql
-- migrations/20231201000000_add_user_table/migration.sql
-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
CREATE INDEX "Users_username_idx" ON "Users"("username");
CREATE INDEX "Users_email_idx" ON "Users"("email");
CREATE INDEX "Users_role_isActive_idx" ON "Users"("role", "is_active");
```

### Data Migration Scripts
```typescript
// scripts/migrate-usernames.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateUsernames() {
  console.log('Starting username migration...')
  
  const users = await prisma.user.findMany({
    where: {
      username: {
        not: {
          equals: prisma.user.fields.username
        }
      }
    }
  })

  for (const user of users) {
    const lowercaseUsername = user.username.toLowerCase()
    
    // Check for conflicts
    const existingUser = await prisma.user.findFirst({
      where: {
        username: lowercaseUsername,
        id: { not: user.id }
      }
    })
    
    if (!existingUser) {
      await prisma.user.update({
        where: { id: user.id },
        data: { username: lowercaseUsername }
      })
      console.log(`Updated username for user ${user.id}`)
    } else {
      console.log(`Skipped user ${user.id} due to conflict`)
    }
  }
  
  console.log('Username migration completed')
  await prisma.$disconnect()
}

migrateUsernames().catch(console.error)
```

## Seed Data with Prisma

### Seed Script (prisma/seed.ts)
```typescript
import { PrismaClient, Role } from '@prisma/client'
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
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
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
      email: 'test@example.com',
      passwordHash: testPassword,
      role: Role.USER,
      isActive: true
    }
  })

  console.log('Seed completed:', { admin, testUser })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Package.json Seed Configuration
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## Database Testing with Prisma

### Test Database Setup
```typescript
// test/setup.ts
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL
    }
  }
})

beforeAll(async () => {
  // Reset database
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' })
  // Apply migrations
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Clean up data between tests
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()
})

export { prisma }
```

### Test Examples with Prisma
```typescript
// test/models/User.test.ts
import { prisma } from '../setup'
import { Role } from '@prisma/client'

describe('User Model', () => {
  test('should create user with lowercase username', async () => {
    const user = await prisma.user.create({
      data: {
        username: 'TestUser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        role: Role.USER
      }
    })

    expect(user.username).toBe('testuser')
    expect(user.email).toBe('test@example.com')
    expect(user.role).toBe(Role.USER)
  })

  test('should prevent duplicate usernames', async () => {
    await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test1@example.com',
        passwordHash: 'hashedpassword'
      }
    })

    await expect(
      prisma.user.create({
        data: {
          username: 'TestUser',
          email: 'test2@example.com',
          passwordHash: 'hashedpassword'
        }
      })
    ).rejects.toThrow()
  })
})
```

## Raw SQL with Prisma

### When to Use Raw SQL
- Complex queries that are difficult with Prisma
- Performance-critical operations
- Database-specific features
- Bulk operations

### Raw SQL Examples
```typescript
// Complex aggregation query
const userStats = await prisma.$queryRaw`
  SELECT 
    role,
    COUNT(*) as user_count,
    AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/86400) as avg_days_since_creation
  FROM "Users" 
  WHERE is_active = true 
  GROUP BY role
`

// Bulk update with raw SQL
await prisma.$executeRaw`
  UPDATE "Users" 
  SET last_login = NOW() 
  WHERE id = ANY(${userIds})
`

// Custom function call
const result = await prisma.$queryRaw`
  SELECT * FROM get_user_activity(${userId}, ${startDate}, ${endDate})
`
```

### Transaction with Raw SQL
```typescript
await prisma.$transaction(async (tx) => {
  // Prisma operations
  const user = await tx.user.create({
    data: { username: 'newuser', email: 'new@example.com', passwordHash: 'hash' }
  })
  
  // Raw SQL operations
  await tx.$executeRaw`INSERT INTO "UserLogs" (user_id, action) VALUES (${user.id}, 'created')`
})
```

---

# API Design

## REST API Standards

### API Endpoint Structure
```
GET    /api/v1/resource          # List resources
GET    /api/v1/resource/:id      # Get specific resource
POST   /api/v1/resource          # Create resource
PUT    /api/v1/resource/:id      # Update resource
DELETE /api/v1/resource/:id      # Delete resource
```

### Response Format
```javascript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- **200**: OK - Request successful
- **201**: Created - Resource created successfully
- **400**: Bad Request - Invalid input
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **409**: Conflict - Resource already exists
- **500**: Internal Server Error - Server error

## API Documentation

### OpenAPI/Swagger Integration
```javascript
// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Website API',
      version: '1.0.0',
      description: 'API documentation for the website'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJSDoc(options);
module.exports = specs;
```

## Error Handling

### Global Error Handler
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors.map(e => e.message)
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
```

## Rate Limiting

### Rate Limiting Configuration
```javascript
const rateLimit = require('express-rate-limit');

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Authentication rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later'
});

app.use('/api', apiLimiter);
app.use('/auth', authLimiter);
```

---

# Deployment and DevOps

## Development Workflow

### Git Workflow
1. **Feature Branches**: Create feature branches from main
2. **Pull Requests**: All changes via pull requests
3. **Code Review**: Required review before merging
4. **Testing**: All tests must pass before merge
5. **Deployment**: Automated deployment after merge

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Feature development branches
- **hotfix/***: Critical bug fixes

## CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_database
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
      env:
        TEST_DB_HOST: localhost
        TEST_DB_PORT: 5432
        TEST_DB_NAME: test_database
        TEST_DB_USER: postgres
        TEST_DB_PASSWORD: postgres
    
    - name: Run linting
      run: npm run lint
    
    - name: Build application
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to production
      run: |
        # Deployment commands here
        echo "Deploying to production..."
```

## Environment Promotion

### Environment Promotion Strategy
1. **Development**: Feature development and testing
2. **Test**: Integration testing and QA
3. **Production**: Live environment

### Deployment Process
1. **Code Review**: All changes reviewed
2. **Testing**: Automated tests pass
3. **Build**: Application built for target environment
4. **Deploy**: Deployed to target environment
5. **Verify**: Health checks and smoke tests
6. **Monitor**: Continuous monitoring

## Monitoring and Logging

### Logging Strategy
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

### Health Checks
```javascript
// routes/health.js
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

router.get('/health/db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'healthy',
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});
```

---

# Performance and Optimization

## Database Optimization

### Indexing Strategy
```sql
-- User table indexes
CREATE INDEX idx_users_username ON "Users" (username);
CREATE INDEX idx_users_email ON "Users" (email);
CREATE INDEX idx_users_role ON "Users" (role);
CREATE INDEX idx_users_active ON "Users" (is_active);

-- Composite indexes for common queries
CREATE INDEX idx_users_role_active ON "Users" (role, is_active);
```

### Query Optimization
- Use parameterized queries
- Implement connection pooling
- Optimize N+1 query problems
- Use database views for complex queries

## API Performance

### Response Caching
```javascript
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cache = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};

// Usage
app.get('/api/v1/users', cache(300), getUsers);
```

### Compression
```javascript
const compression = require('compression');
app.use(compression());
```

## Frontend Optimization

### Asset Optimization
- Minify CSS and JavaScript
- Optimize images
- Use CDN for static assets
- Implement lazy loading

### Caching Headers
```javascript
app.use(express.static('public', {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));
```

## Caching Strategies

### Multi-Level Caching
1. **Browser Cache**: Static assets
2. **CDN Cache**: Global content delivery
3. **Application Cache**: Redis/Memcached
4. **Database Cache**: Query result caching

### Cache Invalidation
```javascript
const invalidateCache = async (pattern) => {
  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(keys);
  }
};

// Invalidate user-related cache when user is updated
app.put('/api/v1/users/:id', async (req, res) => {
  // Update user logic
  await invalidateCache('user:*');
  res.json({ success: true });
});
```

---

## Database Technology Recommendation

### **Prisma ORM** (Recommended)

After analyzing both approaches, **Prisma** is the recommended choice for this architecture because it:

1. **Aligns with TDD**: Type safety and auto-generated types make testing more reliable
2. **Supports Design-First**: Schema serves as living documentation
3. **Simplifies Environment Management**: Easy switching between dev/test/prod
4. **Enhances Developer Experience**: IntelliSense, auto-completion, and clear error messages
5. **Maintains Flexibility**: Still allows raw SQL when needed for complex operations

### Implementation Benefits

- **Faster Development**: Less boilerplate code and automatic type generation
- **Better Testing**: Type-safe operations reduce test flakiness
- **Easier Maintenance**: Schema changes automatically update client code
- **Team Productivity**: Consistent database operations across team members
- **Future-Proof**: Easy to migrate to different databases if needed

### When Raw SQL is Still Available

Prisma provides `$queryRaw` and `$executeRaw` for cases where:
- Complex analytical queries are needed
- Performance-critical operations require optimization
- Database-specific features must be used
- Bulk operations need to be performed

---

## Implementation Learnings

### Critical Deployment Issues and Solutions

#### 1. Railway Deployment Challenges

**Problem**: Railway deployments failing due to multiple configuration issues.

**Root Causes Identified**:
- **Branch Mismatch**: Working on `develop` branch while Railway deploys from `main`
- **Missing Migrations**: `prisma/migrations` directory excluded by `.gitignore`
- **Incorrect Nixpacks Configuration**: `nixpacks.toml` had wrong build commands

**Solutions**:
- Always merge `develop` to `main` before deployment
- Ensure `prisma/migrations` is included in version control
- Verify `nixpacks.toml` configuration matches actual build process

#### 2. TypeScript Compilation Issues

**Problem**: Server running old compiled code despite source changes.

**Root Cause**: TypeScript source files in `src/` not being rebuilt to `dist/` before server restart.

**Solution**: Always run `npm run build` after making TypeScript changes and restart server.

#### 3. Database Schema Synchronization

**Problem**: Test environment missing required tables (categories) for article creation.

**Root Cause**: Seed scripts only created basic stats, not relational data.

**Solution**: Create dedicated seed endpoints for different data types (`/api/v1/seed-categories`).

#### 4. Environment Variable Access

**Problem**: TypeScript errors when accessing `process.env` properties with dot notation.

**Root Cause**: `noPropertyAccessFromIndexSignature` TypeScript setting was `true`.

**Solution**: Set `noPropertyAccessFromIndexSignature: false` in `tsconfig.json`.

### Development Workflow Improvements

#### 1. Build Process Validation

**Learning**: Always validate the complete build process locally before deployment:
```bash
npm run build && npm start
```

#### 2. Database Seeding Strategy

**Learning**: Create granular seed endpoints for different data types:
- `/api/v1/seed` - Basic site statistics
- `/api/v1/seed-categories` - Categories and taxonomies
- `/api/v1/seed-content` - Articles and projects

#### 3. Error Handling in Controllers

**Learning**: Use explicit `Promise<void>` return types and proper error handling:
```typescript
export const createArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Implementation
    res.status(201).json({ success: true, data: article });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ success: false, error: 'Failed to create article' });
  }
};
```

#### 4. Authentication Middleware Debugging

**Learning**: Add debug logging to authentication middleware for troubleshooting:
```typescript
console.log('User authenticated:', req.user); // Debug log
```

### Railway-Specific Learnings

#### 1. Manual Deployment Process

**Learning**: Railway doesn't auto-deploy by default. Use `railway up` to trigger deployments.

#### 2. Database Connection Issues

**Learning**: Railway internal database URLs (`postgres.railway.internal:5432`) are not accessible from local development.

#### 3. Environment Variable Management

**Learning**: Use Railway CLI for environment variable management:
```bash
railway variables --set "KEY=value" --service project-name
```

### Testing Strategy Refinements

#### 1. Local vs Remote Testing

**Learning**: Test both locally and on deployed environment to catch deployment-specific issues.

#### 2. Database State Management

**Learning**: Test environment needs proper data seeding before testing API endpoints.

#### 3. API Endpoint Validation

**Learning**: Test complete user flows (register → login → create content) rather than individual endpoints.

### Code Quality Improvements

#### 1. TypeScript Configuration

**Learning**: Balance strictness with practicality:
- `noPropertyAccessFromIndexSignature: false` for environment variables
- `noUnusedParameters: true` but prefix unused params with `_`

#### 2. Import Management

**Learning**: Remove unused imports to prevent TypeScript compilation errors.

#### 3. Error Message Consistency

**Learning**: Use consistent error response format across all endpoints:
```typescript
{
  success: false,
  error: 'Human-readable error message',
  details?: 'Technical details for debugging'
}
```

### Future Considerations

#### 1. Automated Testing

**Priority**: Implement comprehensive API tests to catch issues before deployment.

#### 2. CI/CD Pipeline

**Priority**: Set up GitHub Actions for automated testing and deployment.

#### 3. Database Migration Strategy

**Priority**: Implement proper migration rollback procedures for production.

#### 4. Monitoring and Logging

**Priority**: Add structured logging and monitoring for production environments.

---

This architecture document provides a comprehensive foundation for building and managing a Node.js/Express website with PostgreSQL database across three environments using Prisma ORM. The conventions ensure consistent, high-quality development with proper planning, testing, and implementation practices while maintaining security and performance standards.
