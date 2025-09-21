#!/bin/bash

echo "🚀 Setting up Railway environment variables..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

# Function to set environment variables for a project
setup_project_env() {
    local project_name=$1
    local environment=$2
    local cors_origin=$3
    
    echo "🔧 Setting up environment for $project_name ($environment)..."
    
    # Set environment variables
    railway variables set NODE_ENV=$environment --project $project_name
    railway variables set PORT=3000 --project $project_name
    railway variables set JWT_SECRET="$environment-secret-key-change-this" --project $project_name
    railway variables set JWT_EXPIRES_IN="24h" --project $project_name
    railway variables set CORS_ORIGIN=$cors_origin --project $project_name
    railway variables set LOG_LEVEL="info" --project $project_name
    railway variables set ENABLE_SWAGGER="false" --project $project_name
    railway variables set ENABLE_DEBUG_ROUTES="false" --project $project_name
    railway variables set RATE_LIMIT_WINDOW_MS="900000" --project $project_name
    railway variables set RATE_LIMIT_MAX_REQUESTS="100" --project $project_name
    
    echo "✅ Environment variables set for $project_name"
}

# Check if project names are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <test-project-name> <production-project-name>"
    echo "Example: $0 techblog-test techblog-prod"
    exit 1
fi

TEST_PROJECT=$1
PROD_PROJECT=$2

# Get Railway URLs (you'll need to update these after deployment)
TEST_URL="https://$TEST_PROJECT.railway.app"
PROD_URL="https://$PROD_PROJECT.railway.app"

echo "🔍 Setting up test environment..."
setup_project_env $TEST_PROJECT "test" $TEST_URL

echo "🔍 Setting up production environment..."
setup_project_env $PROD_PROJECT "production" $PROD_URL

echo ""
echo "🎉 Railway environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Deploy your projects to Railway"
echo "2. Update the URLs in this script if they change"
echo "3. Run: ./scripts/verify-test.sh $TEST_URL"
echo "4. Run: ./scripts/verify-prod.sh $PROD_URL"
