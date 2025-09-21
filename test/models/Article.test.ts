import { prisma } from '../setup'
import { ArticleStatus, Role } from '@prisma/client'

describe('Article Model', () => {
  let authorId: number
  let categoryId: number

  beforeEach(async () => {
    // Create test author
    const author = await prisma.user.create({
      data: {
        username: 'author',
        email: 'author@example.com',
        passwordHash: 'hashedpassword',
        role: Role.AUTHOR
      }
    })
    authorId = author.id

    // Create test category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category description'
      }
    })
    categoryId = category.id
  })

  test('should create article with slug generation', async () => {
    const article = await prisma.article.create({
      data: {
        title: 'Test Article Title',
        slug: 'test-article-title',
        content: 'Article content...',
        authorId,
        categoryId
      }
    })

    expect(article.slug).toBe('test-article-title')
    expect(article.status).toBe(ArticleStatus.DRAFT)
    expect(article.featured).toBe(false)
    expect(article.viewCount).toBe(0)
  })

  test('should prevent duplicate slugs', async () => {
    await prisma.article.create({
      data: {
        title: 'First Article',
        slug: 'first-article',
        content: 'Content...',
        authorId,
        categoryId
      }
    })

    await expect(
      prisma.article.create({
        data: {
          title: 'Second Article',
          slug: 'first-article',
          content: 'Content...',
          authorId,
          categoryId
        }
      })
    ).rejects.toThrow()
  })

  test('should create published article', async () => {
    const publishedAt = new Date()
    const article = await prisma.article.create({
      data: {
        title: 'Published Article',
        slug: 'published-article',
        content: 'Published content...',
        status: ArticleStatus.PUBLISHED,
        featured: true,
        publishedAt,
        authorId,
        categoryId
      }
    })

    expect(article.status).toBe(ArticleStatus.PUBLISHED)
    expect(article.featured).toBe(true)
    expect(article.publishedAt).toEqual(publishedAt)
  })

  test('should increment view count', async () => {
    const article = await prisma.article.create({
      data: {
        title: 'View Count Article',
        slug: 'view-count-article',
        content: 'Content...',
        authorId,
        categoryId
      }
    })

    const updatedArticle = await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    })

    expect(updatedArticle.viewCount).toBe(1)
  })

  test('should cascade delete when author is deleted', async () => {
    const article = await prisma.article.create({
      data: {
        title: 'Cascade Test Article',
        slug: 'cascade-test-article',
        content: 'Content...',
        authorId,
        categoryId
      }
    })

    await prisma.user.delete({
      where: { id: authorId }
    })

    const deletedArticle = await prisma.article.findUnique({
      where: { id: article.id }
    })

    expect(deletedArticle).toBeNull()
  })
})
