# GitHub Setup Guide

This guide will help you set up the GitHub repository for the Tech Blog & Portfolio project.

## 🚀 **Your Tasks (Bob):**

### 1. Create GitHub Repository

1. **Go to GitHub.com** and sign in to your account
2. **Click "New repository"** (green button)
3. **Repository settings:**
   - **Repository name**: `tech-blog-portfolio`
   - **Description**: `A modern tech blog and portfolio website built with Node.js, Express, PostgreSQL, and Prisma`
   - **Visibility**: Public (or Private if you prefer)
   - **Initialize with README**: ❌ (we already have one)
   - **Add .gitignore**: ❌ (we already have one)
   - **Choose a license**: MIT License

4. **Click "Create repository"**

### 2. Connect Local Repository to GitHub

```bash
# Navigate to your project directory
cd /Users/bobmaguire/repos/learning/migstrat/tech-blog-portfolio

# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Project setup with database schema and basic server"

# Add GitHub remote (replace with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/tech-blog-portfolio.git

# Push to GitHub
git push -u origin main
```

### 3. Create Development Branch

```bash
# Create and switch to develop branch
git checkout -b develop

# Push develop branch to GitHub
git push -u origin develop
```

### 4. Configure Branch Protection Rules

1. **Go to your repository on GitHub**
2. **Click "Settings" tab**
3. **Click "Branches" in the left sidebar**
4. **Click "Add rule"**
5. **Configure main branch protection:**
   - **Branch name pattern**: `main`
   - **Require a pull request before merging**: ✅
   - **Require approvals**: 1
   - **Dismiss stale PR approvals when new commits are pushed**: ✅
   - **Require status checks to pass before merging**: ✅
   - **Require branches to be up to date before merging**: ✅
   - **Status checks required**: Select "test" job
   - **Restrict pushes that create files**: ✅
   - **Restrict pushes that delete files**: ✅
   - **Allow force pushes**: ❌
   - **Allow deletions**: ❌

6. **Click "Create"**

### 5. Configure GitHub Actions Secrets

1. **Go to repository Settings**
2. **Click "Secrets and variables" → "Actions"**
3. **Add the following secrets:**

#### Required Secrets:
- `DATABASE_URL`: Your production database connection string
- `TEST_DATABASE_URL`: Your test database connection string
- `JWT_SECRET`: Your JWT signing secret (generate a strong one)
- `CORS_ORIGIN`: Your production domain (e.g., https://techblog.com)

#### Optional Secrets (for deployment):
- `RAILWAY_TOKEN`: If using Railway for deployment
- `HEROKU_API_KEY`: If using Heroku for deployment
- `VERCEL_TOKEN`: If using Vercel for deployment

### 6. Enable GitHub Features

1. **Go to repository Settings**
2. **Enable the following features:**
   - **Issues**: ✅ (for bug reports and feature requests)
   - **Projects**: ✅ (for project management)
   - **Wiki**: ❌ (not needed for this project)
   - **Discussions**: ❌ (not needed for this project)

### 7. Configure Dependabot

Dependabot is already configured via `.github/dependabot.yml`. It will:
- Check for npm package updates weekly
- Check for GitHub Actions updates weekly
- Create pull requests for updates
- Assign them to you for review

### 8. Set Up Project Board (Optional)

1. **Go to your repository**
2. **Click "Projects" tab**
3. **Click "New project"**
4. **Choose "Board" template**
5. **Name it**: "Tech Blog Development"
6. **Add columns:**
   - To Do
   - In Progress
   - Review
   - Done

## 🔧 **Repository Structure After Setup**

```
tech-blog-portfolio/
├── .github/
│   ├── workflows/
│   │   └── ci.yml              # CI/CD pipeline
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md       # Bug report template
│   │   └── feature_request.md  # Feature request template
│   ├── pull_request_template.md # PR template
│   ├── dependabot.yml          # Dependency updates
│   ├── CODEOWNERS              # Code ownership
│   └── SECURITY.md             # Security policy
├── src/                        # Source code
├── prisma/                     # Database schema
├── test/                       # Tests
├── scripts/                    # Verification scripts
└── README.md                   # Project documentation
```

## 🚀 **Development Workflow**

### Branch Strategy:
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Feature development branches
- **hotfix/***: Critical bug fixes

### Workflow:
1. **Create feature branch** from `develop`
2. **Make changes** and commit
3. **Push branch** to GitHub
4. **Create pull request** to `develop`
5. **Review and merge** after CI passes
6. **Deploy to test** environment
7. **Create PR** from `develop` to `main` for production

## 🔍 **Verification**

After setup, verify everything works:

1. **Check CI/CD pipeline** runs on push
2. **Test branch protection** by trying to push directly to main
3. **Verify issue templates** work
4. **Check Dependabot** is enabled
5. **Test pull request template**

## 📝 **Next Steps**

Once GitHub is set up:
1. Complete local development setup
2. Run verification scripts
3. Start Phase 2: API Development

## 🆘 **Troubleshooting**

### Common Issues:

**"Repository not found" error:**
- Check your GitHub username in the remote URL
- Ensure you have access to the repository

**"Permission denied" error:**
- Use SSH instead of HTTPS: `git@github.com:USERNAME/tech-blog-portfolio.git`
- Or configure GitHub CLI: `gh auth login`

**CI/CD not running:**
- Check if GitHub Actions is enabled in repository settings
- Verify the workflow file is in `.github/workflows/`

**Branch protection not working:**
- Ensure you're trying to push to the protected branch
- Check that the required status checks are passing
