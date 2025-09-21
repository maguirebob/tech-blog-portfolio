import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { CreateArticleRequest, AuthenticatedRequest } from '../types'

export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          category: true,
          tags: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.article.count()
    ])

    res.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get all articles error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get articles'
    })
  }
}

export const getArticleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Article ID is required'
      })
      return
    }
    const articleId = parseInt(id)

    if (isNaN(articleId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid article ID'
      })
      return
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        category: true,
        tags: true
      }
    })

    if (!article) {
      res.status(404).json({
        success: false,
        error: 'Article not found'
      })
      return
    }

    // Increment view count
    await prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } }
    })

    res.json({
      success: true,
      data: article
    })
  } catch (error) {
    console.error('Get article by ID error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get article'
    })
  }
}

export const createArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
      return
    }

    const { title, content, excerpt, categoryId, featured } = req.body as CreateArticleRequest

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Check if slug already exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    })

    if (existingArticle) {
      res.status(400).json({
        success: false,
        error: 'An article with this title already exists'
      })
      return
    }

    // Create article
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        categoryId,
        authorId: req.user.userId,
        featured: featured || false,
        status: 'DRAFT'
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        category: true,
        tags: true
      }
    })

    res.status(201).json({
      success: true,
      data: article,
      message: 'Article created successfully'
    })
  } catch (error) {
    console.error('Create article error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create article'
    })
  }
}