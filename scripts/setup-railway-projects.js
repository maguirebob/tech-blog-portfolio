#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment configuration
const envConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'railway-env.json'), 'utf8'));

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  try {
    log(`🔧 ${description}...`, 'blue');
    const result = execSync(command, { stdio: 'pipe', encoding: 'utf8' });
    log(`✅ ${description} completed`, 'green');
    return { success: true, output: result };
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

function listProjects() {
  const result = execCommand('railway list', 'Listing Railway projects');
  if (result.success) {
    log('\n📋 Available projects:', 'cyan');
    console.log(result.output);
    return result.output;
  }
  return null;
}

function createProject(projectName) {
  log(`\n🚀 Creating project: ${projectName}`, 'cyan');
  
  // Create project
  const createResult = execCommand(`railway init ${projectName}`, `Creating project ${projectName}`);
  if (!createResult.success) {
    log(`⚠️  Project ${projectName} might already exist, continuing...`, 'yellow');
  }
  
  return true;
}

function linkToProject(projectName, environment = 'test') {
  log(`\n🔗 Linking to project: ${projectName} (${environment})`, 'cyan');
  
  // Try to link to project using --project and --environment flags
  const linkResult = execCommand(`railway link --project ${projectName} --environment ${environment}`, `Linking to ${projectName}`);
  if (!linkResult.success) {
    log(`❌ Failed to link to ${projectName}`, 'red');
    return false;
  }
  
  return true;
}

function setEnvironmentVariables(environment) {
  log(`\n⚙️  Setting environment variables for ${environment}`, 'cyan');
  
  const envVars = envConfig.environments[environment];
  if (!envVars) {
    log(`❌ Environment configuration not found for: ${environment}`, 'red');
    return false;
  }

  // Set each environment variable
  for (const [key, value] of Object.entries(envVars)) {
    const result = execCommand(`railway variables --set "${key}=${value}"`, `Setting ${key}`);
    if (!result.success) {
      log(`⚠️  Failed to set ${key}, continuing...`, 'yellow');
    }
  }

  return true;
}

function main() {
  log('🚀 Railway Project Setup', 'bright');
  log('=======================', 'bright');

  // Check if Railway CLI is installed
  if (!execCommand('railway --version', 'Checking Railway CLI').success) {
    log('Please install Railway CLI: npm install -g @railway/cli', 'yellow');
    process.exit(1);
  }

  // Check if user is logged in
  if (!execCommand('railway whoami', 'Checking Railway login status').success) {
    log('Please login to Railway: railway login', 'yellow');
    process.exit(1);
  }

  // List existing projects
  listProjects();

  log('\n📝 Setup Options:', 'yellow');
  log('1. Use existing "techblog" project for both test and production', 'blue');
  log('2. Create new projects for test and production', 'blue');
  log('3. Manual setup (you handle it)', 'blue');

  // For now, let's use the existing project and set up environments
  log('\n🔧 Setting up existing "techblog" project...', 'cyan');
  
  // Link to existing project for test environment
  if (!linkToProject('techblog', 'test')) {
    log('❌ Failed to link to techblog project for test environment', 'red');
    process.exit(1);
  }

  // Set up test environment
  log('\n🧪 Setting up TEST environment...', 'cyan');
  if (!setEnvironmentVariables('test')) {
    log('❌ Failed to set up test environment', 'red');
  }

  // Note: For production, you would need to link again with production environment
  log('\n📝 Note: For production environment, you would need to:', 'yellow');
  log('1. Run: railway link --project techblog --environment production', 'blue');
  log('2. Set production environment variables', 'blue');

  log('\n🎉 Railway project setup complete!', 'green');
  log('\nNext steps:', 'yellow');
  log('1. Deploy your project: railway up', 'blue');
  log('2. Get your URL from Railway dashboard', 'blue');
  log('3. Run: ./scripts/verify-test.sh <your-railway-url>', 'blue');
}

main();
