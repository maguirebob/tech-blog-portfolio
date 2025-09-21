import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { JwtPayload } from '../types'

export const authenticateToken = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      })
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, role: true, isActive: true }
    })

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Invalid or inactive user'
      })
      return
    }

    req.user = {
      userId: user.id,
      username: user.username,
      role: user.role
    }

    console.log('User authenticated:', req.user)
    next()
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    })
    return
  }
}

export const requireRole = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
      return
    }

    // Check if user role matches any of the required roles (case-insensitive)
    const userRole = req.user.role.toLowerCase()
    const requiredRoles = roles.map(role => role.toLowerCase())
    
    if (!requiredRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      })
      return
    }

    next()
  }
}

export const optionalAuth = async (
  req: any,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, username: true, role: true, isActive: true }
      })

      if (user && user.isActive) {
        req.user = {
          userId: user.id,
          username: user.username,
          role: user.role
        }
      }
    }

    next()
  } catch (error) {
    // Continue without authentication if token is invalid
    next()
  }
}