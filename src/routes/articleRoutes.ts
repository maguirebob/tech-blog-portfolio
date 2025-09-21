import { Router } from 'express'
import * as articleController from '../controllers/articleController'
import { authenticateToken, optionalAuth } from '../middleware/auth'
import { validateCreateArticle, validateId, validatePagination } from '../middleware/validation'

const router = Router()

// Public routes (with optional auth for personalized content)
router.get('/', optionalAuth, validatePagination, articleController.getAllArticles)
router.get('/:id', optionalAuth, validateId, articleController.getArticleById)

// Protected routes (require authentication)
router.post('/', authenticateToken, validateCreateArticle, articleController.createArticle)

export default router