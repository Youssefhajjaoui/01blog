#!/bin/bash

# Emergency Admin Unban Script
# Use this if you accidentally banned your admin account

echo "🚨 Emergency Admin Unban Script"
echo "================================"
echo ""

# Check if backend is running
if ! curl -s http://localhost:9090/api/admin/stats > /dev/null 2>&1; then
    echo "❌ Backend is not running on port 9090"
    echo "Please start the backend first with: docker-compose -f docker-compose.dev.yml up -d"
    exit 1
fi

echo "✅ Backend is running"
echo ""

# Use the emergency endpoint
echo "🔓 Unbanning all admin users..."
response=$(curl -s -X POST "http://localhost:9090/api/admin/emergency/unban-admin?secretKey=EMERGENCY_ADMIN_UNBAN_2024")

if [[ $response == *"successfully"* ]]; then
    echo "✅ $response"
    echo ""
    echo "🎉 Your admin account has been unbanned!"
    echo "You can now login to the admin dashboard."
else
    echo "❌ Failed to unban admin: $response"
    echo ""
    echo "💡 Alternative solution:"
    echo "Run this SQL command directly in the database:"
    echo "UPDATE users SET banned = false, ban_end = NULL WHERE role = 'ADMIN';"
fi
