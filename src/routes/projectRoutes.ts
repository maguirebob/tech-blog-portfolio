import { Router } from 'express'
import * as projectController from '../controllers/projectController'
import { authenticateToken } from '../middleware/auth'
import { validateCreateProject, validateId, validatePagination } from '../middleware/validation'

const router = Router()

// Public routes (with optional auth for personalized content)
router.get('/', validatePagination, projectController.getAllProjects)
router.get('/:id', validateId, projectController.getProjectById)

// Protected routes (require authentication)
router.post('/', authenticateToken, validateCreateProject, projectController.createProject)
router.put('/:id', authenticateToken, validateId, projectController.updateProject)
router.delete('/:id', authenticateToken, validateId, projectController.deleteProject)

export default router
