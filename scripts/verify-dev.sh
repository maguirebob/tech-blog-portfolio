#!/bin/bash

echo "🔍 Verifying Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js LTS version."
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL."
    exit 1
fi

echo "✅ PostgreSQL is installed: $(psql --version | head -n1)"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy env.development to .env and configure it."
    echo "Run: cp env.development .env"
    exit 1
fi

echo "✅ .env file found"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Please run 'npm install' first."
    exit 1
fi

echo "✅ node_modules found"

# Check database connection
echo "🔍 Testing database connection..."
npx prisma db push --accept-data-loss
if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed. Please check your DATABASE_URL in .env"
    exit 1
fi

# Check if Prisma client is generated
if [ ! -f "node_modules/.prisma/client/index.js" ]; then
    echo "🔍 Generating Prisma client..."
    npx prisma generate
    if [ $? -eq 0 ]; then
        echo "✅ Prisma client generated"
    else
        echo "❌ Failed to generate Prisma client"
        exit 1
    fi
else
    echo "✅ Prisma client found"
fi

# Check if server can start
echo "🔍 Testing server startup..."
timeout 10s npm run dev > /dev/null 2>&1 &
SERVER_PID=$!
sleep 5

# Check if server is responding
if curl -f http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    echo "✅ API server responding"
else
    echo "❌ API server not responding. Please check server logs."
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Kill the test server
kill $SERVER_PID 2>/dev/null

# Run tests
echo "🔍 Running tests..."
npm test
if [ $? -eq 0 ]; then
    echo "✅ All tests passing"
else
    echo "❌ Tests failing. Please check test output above."
    exit 1
fi

echo ""
echo "🎉 Development environment verified successfully!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Run 'npx prisma studio' to view the database"
