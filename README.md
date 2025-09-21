# Tech Blog & Portfolio Website

A modern tech blog and portfolio website built with Node.js, Express, PostgreSQL, and Prisma.

## 🚀 Quick Start

### Prerequisites

- Node.js (LTS version)
- PostgreSQL
- npm or yarn
- Git
- GitHub account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tech-blog-portfolio.git
   cd tech-blog-portfolio
   ```

2. **Setup GitHub (if not already done)**
   ```bash
   # Follow the detailed guide
   cat GITHUB_SETUP.md
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Setup environment variables**
   ```bash
   # For development
   cp .env.dev .env
   # Edit .env with your database credentials
   
   # For test environment
   cp .env.test .env.test
   # Edit .env.test with your test database credentials
   
   # For production (when deploying)
   cp .env.production .env.production
   # Edit .env.production with your production credentials
   ```

5. **Setup database**
   ```bash
   # Create development database
   createdb techblog_dev
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed the database
   npx prisma db seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Verify setup**
   ```bash
   ./scripts/verify-dev.sh
   ```

## 📁 Project Structure

```
tech-blog-portfolio/
├── src/
│   ├── lib/           # Shared libraries (Prisma client, etc.)
│   ├── models/        # Database models (will be added in Phase 2)
│   ├── routes/        # API routes (will be added in Phase 2)
│   ├── middleware/    # Express middleware (will be added in Phase 2)
│   ├── services/      # Business logic services (will be added in Phase 2)
│   ├── utils/         # Utility functions (will be added in Phase 2)
│   └── server.ts      # Main server file
├── prisma/
│   ├── schema.prisma  # Database schema
│   └── seed.ts        # Seed data script
├── test/
│   ├── models/        # Database model tests
│   ├── api/           # API endpoint tests (will be added in Phase 2)
│   └── setup.ts       # Test setup
├── scripts/
│   ├── verify-dev.sh  # Development environment verification
│   ├── verify-test.sh # Test environment verification
│   └── verify-prod.sh # Production environment verification
└── public/            # Static files (will be added in Phase 3)
```

## 🗄️ Database Schema

The application uses the following main entities:

- **Users**: Authentication and user management
- **Articles**: Blog posts with categories and tags
- **Projects**: Portfolio items with technologies
- **Categories**: Article organization
- **Tags**: Article tagging system
- **Technologies**: Project technology stack
- **Comments**: Article comments
- **SiteStats**: Dynamic site statistics

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run specific test suites
```bash
npm run test:api          # API tests
npm run test:integration  # Integration tests
npm run test:components   # Component tests
npm run test:frontend     # Frontend tests
```

### Test coverage
```bash
npm run test:coverage
```

## 🚀 Deployment

### Development Environment
```bash
npm run dev
```

### Test Environment
```bash
./scripts/verify-test.sh
```

### Production Environment
```bash
./scripts/verify-prod.sh
```

## 📊 API Endpoints

### Health Checks
- `GET /api/v1/health` - Server health
- `GET /api/v1/health/db` - Database health
- `GET /api/v1/stats` - Site statistics

### Authentication (Phase 2)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

### Articles (Phase 2)
- `GET /api/v1/articles` - List articles
- `GET /api/v1/articles/:slug` - Get article by slug
- `POST /api/v1/articles` - Create article (authenticated)
- `PUT /api/v1/articles/:id` - Update article (authenticated)
- `DELETE /api/v1/articles/:id` - Delete article (authenticated)

### Projects (Phase 2)
- `GET /api/v1/projects` - List projects
- `GET /api/v1/projects/:slug` - Get project by slug
- `POST /api/v1/projects` - Create project (authenticated)
- `PUT /api/v1/projects/:id` - Update project (authenticated)
- `DELETE /api/v1/projects/:id` - Delete project (authenticated)

## 🔧 Development

### Database Management
```bash
npx prisma studio          # Open Prisma Studio
npx prisma migrate dev     # Create and apply migration
npx prisma migrate reset   # Reset database
npx prisma generate        # Generate Prisma client
```

### Code Quality
```bash
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint issues
npm run format            # Format code with Prettier
```

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `TEST_DATABASE_URL` | Test database connection | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `debug` |

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support, please open an issue in the repository or contact the development team.
