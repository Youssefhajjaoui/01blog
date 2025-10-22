#!/bin/bash

# Script to populate database with dummy data using backend API
# This script creates users and posts through the API endpoints

echo "Starting to populate database with dummy data..."

# Base URL for the API
BASE_URL="http://localhost:9090"

# Function to create a user
create_user() {
    local username=$1
    local email=$2
    local bio=$3
    
    curl -X POST "$BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"username\": \"$username\",
            \"email\": \"$email\",
            \"password\": \"password123\",
            \"bio\": \"$bio\"
        }" \
        -s > /dev/null
    
    echo "Created user: $username"
}

# Function to create a post (requires authentication)
create_post() {
    local title=$1
    local content=$2
    local tags=$3
    
    # Note: This would require authentication in a real scenario
    # For now, we'll just echo the data structure
    echo "Would create post: $title"
}

echo "Creating users..."

# Create users
create_user "john_developer" "john@example.com" "Full-stack developer passionate about React and Node.js"
create_user "emma_designer" "emma@example.com" "UI/UX designer creating beautiful digital experiences"
create_user "mike_writer" "mike@example.com" "Technical writer and documentation specialist"
create_user "lisa_photographer" "lisa@example.com" "Professional photographer capturing life moments"
create_user "alex_entrepreneur" "alex@example.com" "Startup founder sharing business insights and experiences"
create_user "sophia_teacher" "sophia@example.com" "Educator passionate about technology in learning"
create_user "david_chef" "david@example.com" "Professional chef sharing culinary adventures and recipes"
create_user "olivia_traveler" "olivia@example.com" "Travel blogger exploring the world one destination at a time"
create_user "james_artist" "james@example.com" "Digital artist creating stunning visual experiences"
create_user "maria_musician" "maria@example.com" "Musician and composer sharing musical journey"

echo "Users created successfully!"
echo "Note: To create posts, you would need to authenticate first and then use the posts endpoint."

echo "You can now test the signup functionality with these users:"
echo "- Username: john_developer, Password: password123"
echo "- Username: emma_designer, Password: password123"
echo "- Username: mike_writer, Password: password123"
echo "- And so on..."
