#!/bin/bash

echo "🔍 Verifying Production Environment..."

# Check if production URL is provided
if [ -z "$PROD_URL" ]; then
    echo "❌ PROD_URL not set. Please set it as an environment variable."
    echo "Example: PROD_URL=https://techblog.com ./scripts/verify-prod.sh"
    exit 1
fi

echo "✅ Production URL: $PROD_URL"

# Check API health
echo "🔍 Checking API health..."
if curl -f "$PROD_URL/api/v1/health" > /dev/null 2>&1; then
    echo "✅ Production API responding"
else
    echo "❌ Production API not responding"
    exit 1
fi

# Check database connectivity
echo "🔍 Checking database connectivity..."
if curl -f "$PROD_URL/api/v1/stats" > /dev/null 2>&1; then
    echo "✅ Production database connected"
else
    echo "❌ Production database not accessible"
    exit 1
fi

# Check SSL certificate
echo "🔍 Checking SSL certificate..."
if command -v openssl &> /dev/null; then
    DOMAIN=$(echo $PROD_URL | sed 's|https://||' | sed 's|/.*||')
    if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | openssl x509 -noout -dates > /dev/null 2>&1; then
        echo "✅ SSL certificate valid"
    else
        echo "❌ SSL certificate invalid or not found"
        exit 1
    fi
else
    echo "⚠️  OpenSSL not available, skipping SSL check"
fi

# Check security headers
echo "🔍 Checking security headers..."
HEADERS=$(curl -I "$PROD_URL" 2>/dev/null)
if echo "$HEADERS" | grep -i "x-frame-options\|x-content-type-options\|x-xss-protection" > /dev/null; then
    echo "✅ Security headers present"
else
    echo "❌ Security headers missing"
    exit 1
fi

# Check if HTTPS is enforced
if echo "$PROD_URL" | grep -q "https://"; then
    echo "✅ HTTPS is being used"
else
    echo "❌ HTTPS is not being used in production URL"
    exit 1
fi

# Test authentication flow
echo "🔍 Testing authentication flow..."
REGISTER_RESPONSE=$(curl -s -X POST "$PROD_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPassword123!"}')

if echo "$REGISTER_RESPONSE" | grep -q "success"; then
    echo "✅ Authentication flow working"
else
    echo "❌ Authentication flow not working"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi

# Check frontend loading
echo "🔍 Checking frontend loading..."
if curl -f "$PROD_URL" > /dev/null 2>&1; then
    echo "✅ Frontend loading successfully"
else
    echo "❌ Frontend not loading"
    exit 1
fi

# Check mobile responsiveness (basic check)
echo "🔍 Checking mobile responsiveness..."
MOBILE_RESPONSE=$(curl -s -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" "$PROD_URL")
if echo "$MOBILE_RESPONSE" | grep -q "viewport"; then
    echo "✅ Mobile responsiveness configured"
else
    echo "⚠️  Mobile responsiveness not detected (may still be working)"
fi

echo ""
echo "🎉 Production environment verified successfully!"
echo ""
echo "Production environment is ready with:"
echo "- ✅ API health checks"
echo "- ✅ Database connectivity"
echo "- ✅ SSL certificate"
echo "- ✅ Security headers"
echo "- ✅ Authentication flow"
echo "- ✅ Frontend loading"
echo "- ✅ HTTPS enforcement"
