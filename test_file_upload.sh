#!/bin/bash

# Test File Upload Script
# This script helps test the file upload functionality

echo "📁 Testing File Upload Functionality"
echo "===================================="
echo ""

# Check if backend is running
if ! curl -s http://localhost:9090/api/files/test > /dev/null 2>&1; then
    echo "❌ Backend is not running on port 9090"
    echo "Please start the backend first with: docker-compose -f docker-compose.dev.yml up -d"
    exit 1
fi

echo "✅ Backend is running"
echo ""

# Test the file upload endpoint
echo "🔍 Testing file upload endpoint..."
response=$(curl -s -X GET "http://localhost:9090/api/files/test")

if [[ $response == *"working"* ]]; then
    echo "✅ File controller is working: $response"
else
    echo "❌ File controller test failed: $response"
fi

echo ""
echo "💡 Manual Testing Steps:"
echo "1. Login to the application"
echo "2. Go to create post page"
echo "3. Select an image file"
echo "4. The image should upload successfully"
echo "5. Create the post with the uploaded image"
echo ""
echo "🔧 What Was Fixed:"
echo "- Frontend now sends FormData instead of JSON"
echo "- Backend expects multipart/form-data for /api/files/upload"
echo "- File upload uses proper multipart request format"
echo ""
echo "📋 Available Endpoints:"
echo "- POST /api/files/upload (multipart form data)"
echo "- POST /api/files/upload-base64 (JSON with base64 data)"
echo "- GET /api/files/uploads/{filename} (serve uploaded files)"
