#!/bin/bash
set -Eeuo pipefail

# Initialize failure tracking
FAIL=0

# Prefer NEXTAUTH_URL (env) or .env.local, else default to localhost
BASE_URL="${NEXTAUTH_URL:-}"
if [ -z "${BASE_URL}" ] && [ -f ".env.local" ]; then
  BASE_URL="$(sed -nE 's/^[[:space:]]*NEXTAUTH_URL[[:space:]]*=\s*"?([^"#]+)"?.*$/\1/p' .env.local | tail -n1 || true)"
fi
[ -z "${BASE_URL}" ] && BASE_URL="http://localhost:3000"

echo "🔐 Testing Google OAuth Setup..."
echo "================================="

# Test if server is running
if curl -fsS --connect-timeout 1 --max-time 3 -o /dev/null "${BASE_URL}/api/auth/providers"; then
    echo "✅ NextAuth API is responding at ${BASE_URL}"
    
    # Check if Google provider is available
    PROVIDERS=$(curl -s "${BASE_URL}/api/auth/providers")
    if echo "$PROVIDERS" | grep -q "google"; then
        echo "✅ Google OAuth provider is configured"
    else
        echo "❌ Google OAuth provider not found"
        FAIL=1
    fi
    
    # Check environment variables (don't show actual values for security)
    if [ -f ".env.local" ]; then
        read_env() {
            # usage: read_env KEY
            sed -nE "s/^[[:space:]]*$1[[:space:]]*=\s*\"?([^\"#]+)\"?.*$/\1/p" .env.local | tail -n1
        }
        GCID="$(read_env GOOGLE_CLIENT_ID || true)"
        GSEC="$(read_env GOOGLE_CLIENT_SECRET || true)"
        NASEC="$(read_env NEXTAUTH_SECRET || true)"

        if [ -n "${GCID:-}" ] && [ "${GCID}" != "your_google_client_id_from_console" ]; then
            echo "✅ GOOGLE_CLIENT_ID is set"
        else
            echo "❌ GOOGLE_CLIENT_ID needs to be updated"
            FAIL=1
        fi

        if [ -n "${GSEC:-}" ] && [ "${GSEC}" != "your_google_client_secret_from_console" ]; then
            echo "✅ GOOGLE_CLIENT_SECRET is set"
        else
            echo "❌ GOOGLE_CLIENT_SECRET needs to be updated"
            FAIL=1
        fi

        if [ -n "${NASEC:-}" ] && [ "${NASEC}" != "your-secret-key-here-generate-with-openssl-rand-base64-32" ] && [ "${#NASEC}" -ge 32 ]; then
            echo "✅ NEXTAUTH_SECRET is set"
        else
            echo "❌ NEXTAUTH_SECRET needs to be updated"
            FAIL=1
        fi
    else
        echo "❌ .env.local file not found"
        FAIL=1
    fi
    
    echo ""
    echo "🌐 Test your Google OAuth at: ${BASE_URL}/login"
    echo "📋 Make sure you've:"
    echo "   1. ✅ Created Google OAuth app in Google Cloud Console"
    echo "   2. ❓ Added your Client ID and Secret to .env.local"
    echo "   3. ✅ Restarted the development server"
    
else
    echo "❌ Development server is not running at ${BASE_URL}"
    echo "Run 'npm run dev' first"
    FAIL=1
fi

# Exit with failure code if any checks failed
exit $FAIL
