import { User, Article, Project, Category, Tag, Technology, Comment, Role, ArticleStatus } from '@prisma/client'

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// User Types
export interface CreateUserRequest {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  bio?: string
  avatar?: string
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  bio?: string
  avatar?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>
  token: string
}

// Article Types
export interface CreateArticleRequest {
  title: string
  content: string
  excerpt?: string
  categoryId: number
  tagIds?: number[]
  featured?: boolean
  status?: ArticleStatus
}

export interface UpdateArticleRequest {
  title?: string
  content?: string
  excerpt?: string
  categoryId?: number
  tagIds?: number[]
  featured?: boolean
  status?: ArticleStatus
}

export interface ArticleWithRelations extends Article {
  author: Omit<User, 'passwordHash'>
  category: Category
  tags: Tag[]
  comments: Comment[]
}

// Project Types
export interface CreateProjectRequest {
  title: string
  description: string
  content?: string
  imageUrl?: string
  demoUrl?: string
  githubUrl?: string
  technologyIds?: number[]
  featured?: boolean
  status?: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
}

export interface UpdateProjectRequest {
  title?: string
  description?: string
  content?: string
  imageUrl?: string
  demoUrl?: string
  githubUrl?: string
  technologyIds?: number[]
  featured?: boolean
  status?: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
}

export interface ProjectWithRelations extends Project {
  technologies: Technology[]
}

// Category Types
export interface CreateCategoryRequest {
  name: string
  slug: string
  description?: string
}

export interface UpdateCategoryRequest {
  name?: string
  slug?: string
  description?: string
}

// Tag Types
export interface CreateTagRequest {
  name: string
  slug: string
  description?: string
}

export interface UpdateTagRequest {
  name?: string
  slug?: string
  description?: string
}

// Technology Types
export interface CreateTechnologyRequest {
  name: string
  slug: string
  description?: string
  category?: string
  websiteUrl?: string
}

export interface UpdateTechnologyRequest {
  name?: string
  slug?: string
  description?: string
  category?: string
  websiteUrl?: string
}

// Comment Types
export interface CreateCommentRequest {
  content: string
  articleId: number
  parentId?: number
}

export interface UpdateCommentRequest {
  content: string
}

export interface CommentWithRelations extends Comment {
  author: Omit<User, 'passwordHash'>
  article: Pick<Article, 'id' | 'title' | 'slug'>
  parent?: Comment
  replies?: CommentWithRelations[]
}

// Query Parameters
export interface PaginationQuery {
  page?: string
  limit?: string
}

export interface ArticleQuery extends PaginationQuery {
  category?: string
  tag?: string
  author?: string
  status?: ArticleStatus
  featured?: string
  search?: string
}

export interface ProjectQuery extends PaginationQuery {
  technology?: string
  featured?: string
  status?: string
  search?: string
}

// JWT Payload
export interface JwtPayload {
  userId: number
  username: string
  role: Role
  iat?: number
  exp?: number
}

// Request with User
export interface AuthenticatedRequest {
  user?: JwtPayload
  params: any
  query: any
  body: any
  headers: any
}
