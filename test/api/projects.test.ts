import request from 'supertest'
import { app } from '../../src/server'

describe('Projects API', () => {
  let authToken: string
  let userId: number
  let technologyIds: number[]
  let projectId: number

  beforeAll(async () => {
    // Register a user and get auth token
    const userResponse = await request(app)
      .post('/api/v1/users/register')
      .send({
        username: 'projecttest',
        email: 'projecttest@example.com',
        password: 'TestPassword123!',
        firstName: 'Project',
        lastName: 'Test'
      })

    authToken = userResponse.body.data.token
    userId = userResponse.body.data.user.id

    // Create technologies
    const techResponse = await request(app)
      .post('/api/v1/seed-technologies')
      .expect(200)

    technologyIds = techResponse.body.data.slice(0, 3).map((tech: any) => tech.id)
  })

  describe('POST /api/v1/projects', () => {
    it('should create a project with valid data', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'A test project description',
        content: 'Detailed project content',
        technologyIds: technologyIds,
        featured: true,
        status: 'COMPLETED',
        githubUrl: 'https://github.com/test/project',
        demoUrl: 'https://demo.example.com',
        imageUrl: 'https://via.placeholder.com/600x400'
      }

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.title).toBe('Test Project')
      expect(response.body.data.slug).toBe('test-project')
      expect(response.body.data.authorId).toBe(userId)
      expect(response.body.data.technologies).toHaveLength(3)

      projectId = response.body.data.id
    })

    it('should reject project creation without authentication', async () => {
      const projectData = {
        title: 'Unauthorized Project',
        description: 'This should fail.',
        technologyIds: technologyIds
      }

      const response = await request(app)
        .post('/api/v1/projects')
        .send(projectData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should reject project with duplicate title', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'This should fail due to duplicate title.',
        technologyIds: technologyIds
      }

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('A project with this title already exists')
    })
  })

  describe('GET /api/v1/projects', () => {
    it('should get all projects', async () => {
      const response = await request(app)
        .get('/api/v1/projects')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.pagination).toBeDefined()
      expect(response.body.pagination.total).toBeGreaterThan(0)
    })

    it('should get projects with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/projects?page=1&limit=5')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.pagination.page).toBe(1)
      expect(response.body.pagination.limit).toBe(5)
    })

    it('should get projects with search query', async () => {
      const response = await request(app)
        .get('/api/v1/projects?search=test')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })

    it('should get projects filtered by technology', async () => {
      const response = await request(app)
        .get(`/api/v1/projects?technology=${technologyIds[0]}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/v1/projects/:id', () => {
    it('should get project by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.id).toBe(projectId)
      expect(response.body.data.title).toBe('Test Project')
    })

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/v1/projects/99999')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Project not found')
    })

    it('should return 400 for invalid project ID', async () => {
      const response = await request(app)
        .get('/api/v1/projects/invalid')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid project ID')
    })
  })

  describe('PUT /api/v1/projects/:id', () => {
    it('should update project with valid data', async () => {
      const updateData = {
        title: 'Updated Test Project',
        description: 'Updated description',
        featured: false
      }

      const response = await request(app)
        .put(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.title).toBe('Updated Test Project')
      expect(response.body.data.slug).toBe('updated-test-project')
      expect(response.body.data.featured).toBe(false)
    })

    it('should reject update without authentication', async () => {
      const updateData = {
        title: 'Unauthorized Update'
      }

      const response = await request(app)
        .put(`/api/v1/projects/${projectId}`)
        .send(updateData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })
  })

  describe('DELETE /api/v1/projects/:id', () => {
    it('should delete project with valid authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Project deleted successfully')
    })

    it('should reject delete without authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/projects/${projectId}`)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })
  })
})
