#!/bin/bash

# Test Ban Expiration Script
# This script helps test the ban expiration functionality

echo "🔍 Testing Ban Expiration Functionality"
echo "======================================"
echo ""

# Check if backend is running
if ! curl -s http://localhost:9090/api/admin/stats > /dev/null 2>&1; then
    echo "❌ Backend is not running on port 9090"
    echo "Please start the backend first with: docker-compose -f docker-compose.dev.yml up -d"
    exit 1
fi

echo "✅ Backend is running"
echo ""

# Test the manual ban expiration check endpoint
echo "🔓 Checking for expired bans..."
response=$(curl -s -X POST "http://localhost:9090/api/admin/users/check-expired-bans" \
    -H "Content-Type: application/json" \
    -b "jwt=your-admin-jwt-token" \
    --cookie-jar /tmp/cookies.txt)

if [[ $response == *"message"* ]]; then
    echo "✅ Response: $response"
else
    echo "❌ Failed to check expired bans: $response"
fi

echo ""
echo "💡 Manual Testing Steps:"
echo "1. Ban a user with a short duration (e.g., 1 minute)"
echo "2. Wait for the duration to expire"
echo "3. Try to login with that user"
echo "4. The user should be automatically unbanned"
echo ""
echo "🔄 Automatic Process:"
echo "- The system checks for expired bans every 5 minutes"
echo "- Users are automatically unbanned when their ban period expires"
echo "- The 'isEnabled()' method now properly checks ban expiration"
