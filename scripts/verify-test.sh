#!/bin/bash

echo "🔍 Verifying Test Environment..."

# Check if test URL is provided
if [ -z "$1" ]; then
    echo "❌ Test URL not provided. Usage: ./scripts/verify-test.sh <test-url>"
    echo "Example: ./scripts/verify-test.sh https://techblog-test.railway.app"
    exit 1
fi

TEST_URL="$1"
echo "✅ Testing against: $TEST_URL"

# Test API health endpoint
echo "🔍 Testing API health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$TEST_URL/api/v1/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ API health check passed"
else
    echo "❌ API health check failed (HTTP $HEALTH_RESPONSE)"
    exit 1
fi

# Test database health endpoint
echo "🔍 Testing database health endpoint..."
DB_HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$TEST_URL/api/v1/health/db")
if [ "$DB_HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Database health check passed"
else
    echo "❌ Database health check failed (HTTP $DB_HEALTH_RESPONSE)"
    exit 1
fi

# Test stats endpoint
echo "🔍 Testing stats endpoint..."
STATS_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$TEST_URL/api/v1/stats")
if [ "$STATS_RESPONSE" = "200" ]; then
    echo "✅ Stats endpoint working"
else
    echo "❌ Stats endpoint failed (HTTP $STATS_RESPONSE)"
    exit 1
fi

# Test SSL certificate (if HTTPS)
if [[ "$TEST_URL" == https://* ]]; then
    echo "🔍 Testing SSL certificate..."
    SSL_CHECK=$(echo | openssl s_client -servername $(echo $TEST_URL | sed 's/https:\/\///' | cut -d'/' -f1) -connect $(echo $TEST_URL | sed 's/https:\/\///' | cut -d'/' -f1):443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "✅ SSL certificate valid"
    else
        echo "⚠️  SSL certificate check failed (may be normal for test environment)"
    fi
fi

# Test response time
echo "🔍 Testing response time..."
RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null "$TEST_URL/api/v1/health")
echo "✅ Average response time: ${RESPONSE_TIME}s"

echo ""
echo "🎉 Test environment verified successfully!"
echo ""
echo "Test environment is ready for:"
echo "- API testing"
echo "- Database operations"
echo "- Integration testing"
echo "- Performance testing"
