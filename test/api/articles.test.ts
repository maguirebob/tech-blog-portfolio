import request from 'supertest'
import { app } from '../../src/server'
import '../../test/setup-api'

describe('Articles API', () => {
  let authToken: string
  let userId: number
  let categoryId: number
  let articleId: number

  beforeAll(async () => {
    // Register a user and get auth token
    const userResponse = await request(app)
      .post('/api/v1/users/register')
      .send({
        username: 'articletest',
        email: 'articletest@example.com',
        password: 'TestPassword123!',
        firstName: 'Article',
        lastName: 'Test'
      })

    authToken = userResponse.body.data.token
    userId = userResponse.body.data.user.id

    // Create a category
    const categoryResponse = await request(app)
      .post('/api/v1/seed-categories')
      .expect(200)

    categoryId = categoryResponse.body.data[0].id
  })

  describe('POST /api/v1/articles', () => {
    it('should create an article with valid data', async () => {
      const articleData = {
        title: 'Test Article',
        content: 'This is a test article content.',
        excerpt: 'A test article excerpt',
        categoryId: categoryId,
        featured: true
      }

      const response = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(articleData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.title).toBe('Test Article')
      expect(response.body.data.slug).toBe('test-article')
      expect(response.body.data.authorId).toBe(userId)
      expect(response.body.data.categoryId).toBe(categoryId)

      articleId = response.body.data.id
    })

    it('should reject article creation without authentication', async () => {
      const articleData = {
        title: 'Unauthorized Article',
        content: 'This should fail.',
        categoryId: categoryId
      }

      const response = await request(app)
        .post('/api/v1/articles')
        .send(articleData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should reject article with duplicate title', async () => {
      const articleData = {
        title: 'Test Article',
        content: 'This should fail due to duplicate title.',
        categoryId: categoryId
      }

      const response = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(articleData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('An article with this title already exists')
    })
  })

  describe('GET /api/v1/articles', () => {
    it('should get all articles', async () => {
      const response = await request(app)
        .get('/api/v1/articles')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.pagination).toBeDefined()
      expect(response.body.pagination.total).toBeGreaterThan(0)
    })

    it('should get articles with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/articles?page=1&limit=5')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.pagination.page).toBe(1)
      expect(response.body.pagination.limit).toBe(5)
    })

    it('should get articles with search query', async () => {
      const response = await request(app)
        .get('/api/v1/articles?search=test')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/v1/articles/:id', () => {
    it('should get article by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/articles/${articleId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.id).toBe(articleId)
      expect(response.body.data.title).toBe('Test Article')
    })

    it('should return 404 for non-existent article', async () => {
      const response = await request(app)
        .get('/api/v1/articles/99999')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Article not found')
    })

    it('should return 400 for invalid article ID', async () => {
      const response = await request(app)
        .get('/api/v1/articles/invalid')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid article ID')
    })
  })
})
