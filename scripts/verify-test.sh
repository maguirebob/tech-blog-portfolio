#!/bin/bash

echo "🔍 Verifying Test Environment..."

# Check if test database URL is set
if [ -z "$TEST_DATABASE_URL" ]; then
    echo "❌ TEST_DATABASE_URL not set. Please set it in your environment."
    exit 1
fi

echo "✅ TEST_DATABASE_URL is set"

# Check test database connection
echo "🔍 Testing test database connection..."
NODE_ENV=test npx prisma migrate deploy
if [ $? -eq 0 ]; then
    echo "✅ Test database connection successful"
else
    echo "❌ Test database connection failed. Please check your TEST_DATABASE_URL"
    exit 1
fi

# Reset test database
echo "🔍 Resetting test database..."
NODE_ENV=test npx prisma migrate reset --force
if [ $? -eq 0 ]; then
    echo "✅ Test database reset successful"
else
    echo "❌ Test database reset failed"
    exit 1
fi

# Run test suite
echo "🔍 Running test suite..."
npm test
if [ $? -eq 0 ]; then
    echo "✅ All tests passing"
else
    echo "❌ Tests failing. Please check test output above."
    exit 1
fi

# Run test coverage
echo "🔍 Running test coverage..."
npm run test:coverage
if [ $? -eq 0 ]; then
    echo "✅ Test coverage completed"
else
    echo "❌ Test coverage failed"
    exit 1
fi

# Clean up test database
echo "🔍 Cleaning up test database..."
NODE_ENV=test npx prisma migrate reset --force
if [ $? -eq 0 ]; then
    echo "✅ Test database cleanup successful"
else
    echo "❌ Test database cleanup failed"
    exit 1
fi

echo ""
echo "🎉 Test environment verified successfully!"
echo ""
echo "Test environment is ready for:"
echo "- Unit tests"
echo "- Integration tests"
echo "- Database tests"
echo "- API tests"
