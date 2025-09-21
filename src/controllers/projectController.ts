import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { ProjectWithRelations, ApiResponse, CreateProjectRequest, AuthenticatedRequest, ProjectQuery } from '../types'
import { ProjectStatus } from '@prisma/client'

export const getAllProjects = async (req: Request<{}, ApiResponse<ProjectWithRelations[]>, {}, ProjectQuery>, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, technology, status, featured } = req.query

    const take = parseInt(limit as string)
    const skip = (parseInt(page as string) - 1) * take

    const where: Prisma.ProjectWhereInput = {
      AND: [
        search ? {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
            { content: { contains: search as string, mode: 'insensitive' } },
          ],
        } : {},
        technology ? { technologies: { some: { technology: { slug: technology as string } } } } : {},
        status ? { status: status as ProjectStatus } : {},
        featured !== undefined ? { featured: featured === 'true' } : {},
      ],
    }

    const [projects, total] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        take,
        skip,
        include: {
          author: { select: { id: true, username: true, firstName: true, lastName: true } },
          technologies: { include: { technology: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ])

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    })
  } catch (error) {
    console.error('Get all projects error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get projects'
    })
  }
}

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Project ID is required'
      })
      return
    }
    const projectId = parseInt(id)

    if (isNaN(projectId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      })
      return
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        author: { select: { id: true, username: true, firstName: true, lastName: true } },
        technologies: { include: { technology: true } },
      },
    })

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      })
      return
    }

    // Note: viewCount field doesn't exist in Project model, skipping for now

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Get project by ID error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get project'
    })
  }
}

export const createProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
      return
    }

    const { title, description, content, technologyIds, featured, status, githubUrl, demoUrl, imageUrl } = req.body as CreateProjectRequest

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim()

    // Check if slug already exists
    const existingProject = await prisma.project.findUnique({
      where: { slug }
    })

    if (existingProject) {
      res.status(400).json({
        success: false,
        error: 'A project with this title already exists'
      })
      return
    }

    // Create project
    const projectData: any = {
      title,
      slug,
      description,
      content: content || null,
      authorId: req.user.userId,
      featured: featured || false,
      status: status || ProjectStatus.PLANNING,
      githubUrl: githubUrl || null,
      demoUrl: demoUrl || null,
      imageUrl: imageUrl || null,
    }

    if (technologyIds && technologyIds.length > 0) {
      projectData.technologies = {
        create: technologyIds.map((techId: number) => ({
          technology: { connect: { id: techId } }
        }))
      }
    }

    const project = await prisma.project.create({
      data: projectData,
      include: {
        author: { select: { id: true, username: true, firstName: true, lastName: true } },
        technologies: { include: { technology: true } },
      },
    })

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    })
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    })
  }
}

export const updateProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
      return
    }

    const { id } = req.params
    const projectId = parseInt(id)

    if (isNaN(projectId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      })
      return
    }

    // Check if project exists and user owns it
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { authorId: true, slug: true }
    })

    if (!existingProject) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      })
      return
    }

    if (existingProject.authorId !== req.user.userId) {
      res.status(403).json({
        success: false,
        error: 'You can only update your own projects'
      })
      return
    }

    const { title, description, content, technologyIds, featured, status, githubUrl, demoUrl, imageUrl } = req.body

    // Generate new slug if title changed
    let slug = existingProject.slug
    if (title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim()

      // Check if new slug conflicts with existing projects
      const slugConflict = await prisma.project.findFirst({
        where: { 
          slug,
          id: { not: projectId }
        }
      })

      if (slugConflict) {
        res.status(400).json({
          success: false,
          error: 'A project with this title already exists'
        })
        return
      }
    }

    // Update project
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(title && { title, slug }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(featured !== undefined && { featured }),
        ...(status !== undefined && { status }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(demoUrl !== undefined && { demoUrl }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(technologyIds && {
          technologies: {
            deleteMany: {},
            create: technologyIds.map((techId: number) => ({
              technology: { connect: { id: techId } }
            }))
          }
        }),
      },
      include: {
        author: { select: { id: true, username: true, firstName: true, lastName: true } },
        technologies: { include: { technology: true } },
      },
    })

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    })
  } catch (error) {
    console.error('Update project error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update project'
    })
  }
}

export const deleteProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
      return
    }

    const { id } = req.params
    const projectId = parseInt(id)

    if (isNaN(projectId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      })
      return
    }

    // Check if project exists and user owns it
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { authorId: true }
    })

    if (!existingProject) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      })
      return
    }

    if (existingProject.authorId !== req.user.userId) {
      res.status(403).json({
        success: false,
        error: 'You can only delete your own projects'
      })
      return
    }

    await prisma.project.delete({
      where: { id: projectId }
    })

    res.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Delete project error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    })
  }
}
