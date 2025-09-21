import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { CreateUserRequest, LoginRequest, AuthenticatedRequest } from '../types'

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName, bio, avatar } = req.body as CreateUserRequest

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          { email: email.toLowerCase() }
        ]
      }
    })

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: existingUser.username === username.toLowerCase() 
          ? 'Username already exists' 
          : 'Email already exists'
      })
      return
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user with proper null handling
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        bio: bio || null,
        avatar: avatar || null,
        role: 'USER',
        isActive: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    )

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      },
      message: 'User registered successfully'
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to register user'
    })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as LoginRequest

    // Find user by username (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        username: username.toLowerCase(),
        isActive: true
      }
    })

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
      return
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      })
      return
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    )

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to login'
    })
  }
}

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    })
  }
}