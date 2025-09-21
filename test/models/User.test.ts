import { prisma } from '../setup'
import { Role } from '@prisma/client'

describe('User Model', () => {
  test('should create user with lowercase username', async () => {
    const user = await prisma.user.create({
      data: {
        username: 'TestUser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        role: Role.USER
      }
    })

    expect(user.username).toBe('testuser')
    expect(user.email).toBe('test@example.com')
    expect(user.role).toBe(Role.USER)
  })

  test('should prevent duplicate usernames (case-insensitive)', async () => {
    await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test1@example.com',
        passwordHash: 'hashedpassword'
      }
    })

    await expect(
      prisma.user.create({
        data: {
          username: 'TestUser',
          email: 'test2@example.com',
          passwordHash: 'hashedpassword'
        }
      })
    ).rejects.toThrow()
  })

  test('should prevent duplicate emails', async () => {
    await prisma.user.create({
      data: {
        username: 'user1',
        email: 'test@example.com',
        passwordHash: 'hashedpassword'
      }
    })

    await expect(
      prisma.user.create({
        data: {
          username: 'user2',
          email: 'test@example.com',
          passwordHash: 'hashedpassword'
        }
      })
    ).rejects.toThrow()
  })

  test('should find user by username (case-insensitive)', async () => {
    await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword'
      }
    })

    const foundUser = await prisma.user.findFirst({
      where: { username: 'TestUser' }
    })

    expect(foundUser).toBeTruthy()
    expect(foundUser?.username).toBe('testuser')
  })

  test('should create user with all optional fields', async () => {
    const user = await prisma.user.create({
      data: {
        username: 'fulluser',
        email: 'full@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Software developer',
        avatar: 'https://example.com/avatar.jpg',
        role: Role.AUTHOR
      }
    })

    expect(user.firstName).toBe('John')
    expect(user.lastName).toBe('Doe')
    expect(user.bio).toBe('Software developer')
    expect(user.avatar).toBe('https://example.com/avatar.jpg')
    expect(user.role).toBe(Role.AUTHOR)
  })
})
