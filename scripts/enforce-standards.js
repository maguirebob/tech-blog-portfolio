#!/usr/bin/env node

/**
 * Learning Enforcement Script
 * 
 * This script automatically checks that all mandatory learnings
 * from the Tech Blog Portfolio project are implemented.
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class StandardsEnforcer {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const color = type === 'error' ? colors.red : 
                  type === 'warning' ? colors.yellow : 
                  type === 'success' ? colors.green : colors.blue;
    
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.passed.push(`✅ ${description}: ${filePath}`);
      return true;
    } else {
      this.errors.push(`❌ ${description}: ${filePath} - FILE MISSING`);
      return false;
    }
  }

  checkFileContent(filePath, patterns, description) {
    if (!fs.existsSync(filePath)) {
      this.errors.push(`❌ ${description}: ${filePath} - FILE MISSING`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const missing = [];

    patterns.forEach(pattern => {
      if (!content.includes(pattern)) {
        missing.push(pattern);
      }
    });

    if (missing.length === 0) {
      this.passed.push(`✅ ${description}: All required patterns found`);
      return true;
    } else {
      this.errors.push(`❌ ${description}: Missing patterns: ${missing.join(', ')}`);
      return false;
    }
  }

  checkServerFile() {
    this.log('🔍 Checking server.ts file...', 'info');
    
    const serverPath = path.join(process.cwd(), 'src', 'server.ts');
    
    if (!this.checkFileExists(serverPath, 'Server file')) {
      return false;
    }

    const mandatoryPatterns = [
      'process.on("uncaughtException"',
      'process.on("unhandledRejection"',
      'process.exit(1)',
      'await prisma.$connect()',
      'app.listen(PORT, \'0.0.0.0\'',
      '/api/v1/health',
      'Number(process.env.PORT)'
    ];

    return this.checkFileContent(serverPath, mandatoryPatterns, 'Server error handling');
  }

  checkHealthEndpoints() {
    this.log('🔍 Checking health check endpoints...', 'info');
    
    const serverPath = path.join(process.cwd(), 'src', 'server.ts');
    
    if (!fs.existsSync(serverPath)) {
      this.errors.push('❌ Cannot check health endpoints - server.ts missing');
      return false;
    }

    const content = fs.readFileSync(serverPath, 'utf8');
    
    // Check for lightweight health check
    const healthEndpointMatch = content.match(/app\.get\('\/api\/v1\/health'[^}]+}/);
    if (healthEndpointMatch && 
        !healthEndpointMatch[0].includes('await prisma') && 
        healthEndpointMatch[0].includes('res.status(200)')) {
      this.passed.push('✅ Lightweight health check endpoint found');
    } else {
      this.errors.push('❌ Lightweight health check endpoint missing or incorrect');
    }

    // Check for database health check
    if (content.includes('app.get(\'/api/v1/health/db\'') && 
        content.includes('await prisma.$queryRaw')) {
      this.passed.push('✅ Database health check endpoint found');
    } else {
      this.errors.push('❌ Database health check endpoint missing or incorrect');
    }

    return true;
  }

  checkTestFiles() {
    this.log('🔍 Checking test files...', 'info');
    
    const testDir = path.join(process.cwd(), 'test');
    
    if (!fs.existsSync(testDir)) {
      this.warnings.push('⚠️ Test directory not found');
      return false;
    }

    // Check for unique test data patterns
    const testFiles = fs.readdirSync(testDir, { recursive: true })
      .filter(file => file.endsWith('.test.ts') || file.endsWith('.test.js'));

    if (testFiles.length === 0) {
      this.warnings.push('⚠️ No test files found');
      return false;
    }

    let hasUniqueData = false;
    testFiles.forEach(file => {
      const filePath = path.join(testDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('Date.now()') || content.includes('timestamp')) {
        hasUniqueData = true;
      }
    });

    if (hasUniqueData) {
      this.passed.push('✅ Test files use unique data patterns');
    } else {
      this.warnings.push('⚠️ Test files may not use unique data patterns');
    }

    return true;
  }

  checkDeploymentConfig() {
    this.log('🔍 Checking deployment configuration...', 'info');
    
    const railwayPath = path.join(process.cwd(), 'railway.json');
    const nixpacksPath = path.join(process.cwd(), 'nixpacks.toml');
    
    if (this.checkFileExists(railwayPath, 'Railway configuration')) {
      const content = fs.readFileSync(railwayPath, 'utf8');
      
      if (content.includes('healthcheckPath') && content.includes('healthcheckTimeout')) {
        this.passed.push('✅ Railway health check configuration found');
      } else {
        this.errors.push('❌ Railway health check configuration missing');
      }
    }

    if (fs.existsSync(nixpacksPath)) {
      this.passed.push('✅ Nixpacks configuration found');
    } else {
      this.warnings.push('⚠️ Nixpacks configuration not found');
    }

    return true;
  }

  checkPackageJson() {
    this.log('🔍 Checking package.json...', 'info');
    
    const packagePath = path.join(process.cwd(), 'package.json');
    
    if (!this.checkFileExists(packagePath, 'Package.json')) {
      return false;
    }

    const content = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check for required scripts
    const requiredScripts = ['build', 'start', 'test'];
    const missingScripts = requiredScripts.filter(script => !content.scripts[script]);
    
    if (missingScripts.length === 0) {
      this.passed.push('✅ All required scripts found in package.json');
    } else {
      this.errors.push(`❌ Missing required scripts: ${missingScripts.join(', ')}`);
    }

    // Check for required dependencies
    const requiredDeps = ['express', '@prisma/client', 'dotenv'];
    const missingDeps = requiredDeps.filter(dep => !content.dependencies[dep]);
    
    if (missingDeps.length === 0) {
      this.passed.push('✅ All required dependencies found');
    } else {
      this.errors.push(`❌ Missing required dependencies: ${missingDeps.join(', ')}`);
    }

    return true;
  }

  runAllChecks() {
    this.log('🚀 Starting standards enforcement check...', 'info');
    this.log('', 'info');
    
    this.checkServerFile();
    this.checkHealthEndpoints();
    this.checkTestFiles();
    this.checkDeploymentConfig();
    this.checkPackageJson();
    
    this.log('', 'info');
    this.log('📊 CHECK RESULTS:', 'info');
    this.log('', 'info');
    
    // Display passed checks
    if (this.passed.length > 0) {
      this.log('✅ PASSED CHECKS:', 'success');
      this.passed.forEach(check => this.log(`  ${check}`, 'success'));
      this.log('', 'info');
    }
    
    // Display warnings
    if (this.warnings.length > 0) {
      this.log('⚠️ WARNINGS:', 'warning');
      this.warnings.forEach(warning => this.log(`  ${warning}`, 'warning'));
      this.log('', 'info');
    }
    
    // Display errors
    if (this.errors.length > 0) {
      this.log('❌ ERRORS (DEPLOYMENT BLOCKERS):', 'error');
      this.errors.forEach(error => this.log(`  ${error}`, 'error'));
      this.log('', 'info');
    }
    
    // Summary
    const totalChecks = this.passed.length + this.warnings.length + this.errors.length;
    this.log(`📈 SUMMARY: ${this.passed.length} passed, ${this.warnings.length} warnings, ${this.errors.length} errors`, 'info');
    
    if (this.errors.length > 0) {
      this.log('', 'info');
      this.log('🚨 DEPLOYMENT BLOCKED: Critical errors must be fixed before deployment', 'error');
      process.exit(1);
    } else if (this.warnings.length > 0) {
      this.log('', 'info');
      this.log('⚠️ DEPLOYMENT ALLOWED: Warnings should be addressed but are not blocking', 'warning');
      process.exit(0);
    } else {
      this.log('', 'info');
      this.log('🎉 DEPLOYMENT APPROVED: All standards met!', 'success');
      process.exit(0);
    }
  }
}

// Run the enforcer
const enforcer = new StandardsEnforcer();
enforcer.runAllChecks();
