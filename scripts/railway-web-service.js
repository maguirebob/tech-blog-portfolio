#!/usr/bin/env node

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
  log('🚀 Railway Web Service Setup', 'bright');
  log('============================', 'bright');

  log('\n📋 Current Status:', 'cyan');
  execCommand('railway status', 'Checking current status');

  log('\n🔧 Step 1: Add a web service for your Node.js app', 'yellow');
  log('This will create a web service in your Railway project...', 'blue');
  
  // Try to add a web service
  if (execCommand('railway add --template nodejs', 'Adding Node.js web service')) {
    log('\n✅ Web service added successfully!', 'green');
  } else {
    log('\n⚠️  Service addition may have failed. Let\'s try a different approach...', 'yellow');
    log('You may need to add the service manually in the Railway dashboard.', 'blue');
    log('Go to railway.app → Select your project → Click "New" → Select "GitHub Repo"', 'yellow');
    return;
  }

  log('\n🔧 Step 2: Link to the web service', 'yellow');
  log('Now we need to link to the web service (not postgres)...', 'blue');

  // List available services
  execCommand('railway service', 'Listing available services');

  log('\n📝 Please select the web service (not postgres) from the list above.', 'yellow');
  log('Then run: railway service <web-service-name>', 'blue');

  log('\n🔧 Step 3: Set environment variables', 'yellow');
  log('After linking to the web service, we can set environment variables...', 'blue');

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

  log('\nEnvironment variables to set:', 'cyan');
  envVars.forEach(envVar => {
    log(`railway variables --set "${envVar}"`, 'blue');
  });

  log('\n🔧 Step 4: Deploy your project', 'yellow');
  log('After setting variables, deploy with: railway up', 'blue');

  log('\n🎯 Next Steps:', 'green');
  log('1. Run: railway add --template nodejs', 'blue');
  log('2. Run: railway service (select the web service)', 'blue');
  log('3. Set environment variables (see list above)', 'blue');
  log('4. Run: railway up', 'blue');
  log('5. Test with: ./scripts/verify-test.sh <your-url>', 'blue');
}

main();
