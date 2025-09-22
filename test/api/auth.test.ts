import request from 'supertest'
import { app } from '../../src/server'

describe('Authentication API', () => {
  let authToken: string

  describe('POST /api/v1/users/register', () => {
    it('should register a new user successfully', async () => {
      const timestamp = Date.now()
      const userData = {
        username: `testuser${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      }

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)

      console.log('Registration response:', response.status, response.body)
      
      if (response.status !== 201) {
        throw new Error(`Registration failed: ${response.status} - ${JSON.stringify(response.body)}`)
      }

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.username).toBe(`testuser${timestamp}`)
      expect(response.body.data.token).toBeDefined()
      expect(response.body.data.user.passwordHash).toBeUndefined()

      authToken = response.body.data.token
    })

    it('should reject duplicate username', async () => {
      // First, register a user
      const timestamp = Date.now()
      const firstUser = {
        username: `duplicateuser${timestamp}`,
        email: `first${timestamp}@example.com`,
        password: 'TestPassword123!'
      }
      
      await request(app)
        .post('/api/v1/users/register')
        .send(firstUser)
        .expect(201)

      // Then try to register with the same username
      const duplicateUser = {
        username: `duplicateuser${timestamp}`, // Same username
        email: `second${timestamp}@example.com`, // Different email
        password: 'TestPassword123!'
      }

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(duplicateUser)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Username already exists')
    })

    it('should reject duplicate email', async () => {
      // First, register a user
      const timestamp = Date.now()
      const firstUser = {
        username: `firstuser${timestamp}`,
        email: `duplicate${timestamp}@example.com`,
        password: 'TestPassword123!'
      }
      
      await request(app)
        .post('/api/v1/users/register')
        .send(firstUser)
        .expect(201)

      // Then try to register with the same email
      const duplicateUser = {
        username: `seconduser${timestamp}`, // Different username
        email: `duplicate${timestamp}@example.com`, // Same email
        password: 'TestPassword123!'
      }

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(duplicateUser)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Email already exists')
    })
  })

  describe('POST /api/v1/users/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        username: 'testuser2',
        password: 'TestPassword123!'
      }

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.username).toBe('testuser2')
      expect(response.body.data.token).toBeDefined()
    })

    it('should reject invalid credentials', async () => {
      const loginData = {
        username: 'testuser2',
        password: 'WrongPassword'
      }

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid credentials')
    })
  })

  describe('GET /api/v1/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.username).toMatch(/^testuser\d+$/)
      expect(response.body.data.passwordHash).toBeUndefined()
    })

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid or expired token')
    })
  })
})
