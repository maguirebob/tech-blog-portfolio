# Security Policy

## Supported Versions

We currently support the following versions of this project:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please report it responsibly:

### How to Report

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: security@techblog.com
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- We will acknowledge receipt within 48 hours
- We will provide a detailed response within 7 days
- We will keep you informed of our progress

### What to Expect

- We take security seriously and will investigate all reports
- We will work with you to understand and resolve the issue
- We will credit you for responsible disclosure (unless you prefer to remain anonymous)
- We will release a fix as soon as possible

## Security Best Practices

### For Developers

- Always validate and sanitize user input
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
- Keep dependencies up to date
- Use HTTPS in production
- Implement rate limiting
- Log security events appropriately

### For Users

- Keep your software up to date
- Use strong, unique passwords
- Enable two-factor authentication when available
- Report suspicious activity immediately

## Security Features

This project includes the following security features:

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention via Prisma ORM
- CORS configuration
- Rate limiting
- Security headers via Helmet.js
- Environment variable protection

## Contact

For security-related questions or concerns, please contact:
- Email: security@techblog.com
- GitHub: @bobmaguire
