comm#!/usr/bin/env node

const { execSync } = require('child_process');

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
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Step-by-Step Railway Setup', 'bright');
  log('============================', 'bright');

  log('\n📋 Current Status:', 'cyan');
  execCommand('railway status', 'Checking current status');

  log('\n🔧 Step 1: Add a service to your project', 'yellow');
  log('This will create a service in your Railway project...', 'blue');
  
  if (execCommand('railway add', 'Adding service to project')) {
    log('\n✅ Service added successfully!', 'green');
  } else {
    log('\n❌ Failed to add service. You may need to do this manually in the Railway dashboard.', 'red');
    log('Go to railway.app → Select your project → Click "New" → Select "GitHub Repo"', 'yellow');
    return;
  }

  log('\n🔧 Step 2: Set environment variables', 'yellow');
  log('Now we can set the environment variables...', 'blue');

  const envVars = [
    'NODE_ENV=test',
    'PORT=3000',
    'JWT_SECRET=test-secret-key-change-this',
    'JWT_EXPIRES_IN=1h',
    'CORS_ORIGIN=https://techblog.railway.app',
    'LOG_LEVEL=error',
    'ENABLE_SWAGGER=false',
    'ENABLE_DEBUG_ROUTES=false',
    'RATE_LIMIT_WINDOW_MS=900000',
    'RATE_LIMIT_MAX_REQUESTS=100'
  ];

  for (const envVar of envVars) {
    const [key, value] = envVar.split('=');
    execCommand(`railway variables --set "${key}=${value}"`, `Setting ${key}`);
  }

  log('\n🔧 Step 3: Deploy your project', 'yellow');
  log('Deploying to Railway...', 'blue');
  
  if (execCommand('railway up', 'Deploying project')) {
    log('\n✅ Deployment successful!', 'green');
  } else {
    log('\n❌ Deployment failed. Check the logs above.', 'red');
    return;
  }

  log('\n🔧 Step 4: Get your deployment URL', 'yellow');
  execCommand('railway domain', 'Getting deployment URL');

  log('\n🎉 Railway setup complete!', 'green');
  log('\nNext steps:', 'yellow');
  log('1. Copy the URL from above', 'blue');
  log('2. Run: ./scripts/verify-test.sh <your-railway-url>', 'blue');
  log('3. Test your deployment!', 'blue');
}

main();
