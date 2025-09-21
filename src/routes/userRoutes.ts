import { Router } from 'express'
import * as userController from '../controllers/userController'
import { authenticateToken } from '../middleware/auth'
import { validateCreateUser, validateLogin } from '../middleware/validation'

const router = Router()

// Public routes
router.post('/register', validateCreateUser, userController.register)
router.post('/login', validateLogin, userController.login)

// Protected routes
router.get('/profile', authenticateToken, userController.getProfile)

export default router