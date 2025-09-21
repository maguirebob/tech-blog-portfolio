import { Request, Response, NextFunction } from 'express'

export const handleValidationErrors = (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  // Simple validation for now - we'll add express-validator later
  next()
}

// Basic validation functions
export const validateCreateUser = [
  handleValidationErrors
]

export const validateLogin = [
  handleValidationErrors
]

export const validateUpdateUser = [
  handleValidationErrors
]

export const validateCreateArticle = [
  handleValidationErrors
]

export const validateId = [
  handleValidationErrors
]

export const validatePagination = [
  handleValidationErrors
]