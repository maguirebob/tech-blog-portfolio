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
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  try {
    log(`🔧 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return false;
  }
}

function setupRailwayProject(projectName, environment) {
  log(`\n🚀 Setting up Railway project: ${projectName} (${environment})`, 'cyan');
  
  const envVars = envConfig.environments[environment];
  if (!envVars) {
    log(`❌ Environment configuration not found for: ${environment}`, 'red');
    return false;
  }

  // Set each environment variable
  for (const [key, value] of Object.entries(envVars)) {
    const command = `railway variables set ${key}="${value}" --project ${projectName}`;
    if (!execCommand(command, `Setting ${key}`)) {
      return false;
    }
  }

  return true;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    log('Usage: node auto-setup-railway.js <test-project-name> <production-project-name>', 'yellow');
    log('Example: node auto-setup-railway.js techblog-test techblog-prod', 'yellow');
    process.exit(1);
  }

  const [testProject, prodProject] = args;

  log('🚀 Railway Environment Auto-Setup', 'bright');
  log('================================', 'bright');

  // Check if Railway CLI is installed
  if (!execCommand('railway --version', 'Checking Railway CLI')) {
    log('Please install Railway CLI: npm install -g @railway/cli', 'yellow');
    process.exit(1);
  }

  // Check if user is logged in
  if (!execCommand('railway whoami', 'Checking Railway login status')) {
    log('Please login to Railway: railway login', 'yellow');
    process.exit(1);
  }

  // Setup test environment
  if (!setupRailwayProject(testProject, 'test')) {
    log('❌ Failed to setup test environment', 'red');
    process.exit(1);
  }

  // Setup production environment
  if (!setupRailwayProject(prodProject, 'production')) {
    log('❌ Failed to setup production environment', 'red');
    process.exit(1);
  }

  log('\n🎉 Railway environment setup complete!', 'green');
  log('\nNext steps:', 'yellow');
  log('1. Deploy your projects to Railway', 'blue');
  log('2. Run: ./scripts/verify-test.sh https://' + testProject + '.railway.app', 'blue');
  log('3. Run: ./scripts/verify-prod.sh https://' + prodProject + '.railway.app', 'blue');
}

main();
