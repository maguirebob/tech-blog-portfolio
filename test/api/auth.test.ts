import request from 'supertest'
import { app } from '../../src/server'
import '../../test/setup-api'

describe('Authentication API', () => {
  let authToken: string

  describe('POST /api/v1/users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      }

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.username).toBe('testuser2')
      expect(response.body.data.token).toBeDefined()
      expect(response.body.data.user.passwordHash).toBeUndefined()

      authToken = response.body.data.token
    })

    it('should reject duplicate username', async () => {
      const userData = {
        username: 'testuser2',
        email: 'different@example.com',
        password: 'TestPassword123!'
      }

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Username already exists')
    })

    it('should reject duplicate email', async () => {
      const userData = {
        username: 'differentuser',
        email: 'test2@example.com',
        password: 'TestPassword123!'
      }

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)
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
      expect(response.body.data.username).toBe('testuser2')
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
