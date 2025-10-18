#!/bin/bash

# Enhanced Data Seeding Script for 01Blog
# This script will populate the database with realistic data for testing suggestions and trending features

echo "🌱 Starting Enhanced Data Seeding for 01Blog..."
echo "================================================"

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 -U admin; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Check if database exists
if ! psql -h localhost -U admin -d blogdb -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Database 'blogdb' does not exist. Please create it first."
    exit 1
fi

echo "✅ Database connection verified"

# Option 1: Use SQL script
echo ""
echo "📊 Option 1: Using SQL Script (Recommended)"
echo "This will create:"
echo "  - 500 users with realistic profiles"
echo "  - 2000 posts with trending tags"
echo "  - 5000 comments"
echo "  - 8000 likes"
echo "  - 2000 subscriptions"
echo "  - 1000 notifications"
echo ""

read -p "Do you want to proceed with SQL seeding? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Running SQL seeding script..."
    
    # Run the enhanced SQL script
    psql -h localhost -U admin -d blogdb -f enhanced_fake_data.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ SQL seeding completed successfully!"
    else
        echo "❌ SQL seeding failed. Please check the error messages above."
        exit 1
    fi
fi

# Option 2: Use Spring Boot application
echo ""
echo "🚀 Option 2: Using Spring Boot Application"
echo "This will use the DataSeederService to create data programmatically."
echo ""

read -p "Do you want to run Spring Boot seeding? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Starting Spring Boot application for seeding..."
    
    # Navigate to backend directory
    cd backend
    
    # Run Spring Boot application
    mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=seeding"
    
    if [ $? -eq 0 ]; then
        echo "✅ Spring Boot seeding completed successfully!"
    else
        echo "❌ Spring Boot seeding failed. Please check the error messages above."
        exit 1
    fi
    
    cd ..
fi

# Show final statistics
echo ""
echo "📊 Final Database Statistics:"
echo "============================="

psql -h localhost -U admin -d blogdb -c "
SELECT 
    'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 
    'Posts' as table_name, COUNT(*) as count FROM posts
UNION ALL
SELECT 
    'Comments' as table_name, COUNT(*) as count FROM comments
UNION ALL
SELECT 
    'Likes' as table_name, COUNT(*) as count FROM likes
UNION ALL
SELECT 
    'Subscriptions' as table_name, COUNT(*) as count FROM subscriptions
UNION ALL
SELECT 
    'Notifications' as table_name, COUNT(*) as count FROM notifications
ORDER BY table_name;
"

echo ""
echo "🔥 Top Trending Tags:"
echo "===================="

psql -h localhost -U admin -d blogdb -c "
WITH tag_counts AS (
    SELECT 
        unnest(tags) as tag,
        COUNT(*) as post_count
    FROM posts 
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY unnest(tags)
)
SELECT 
    '#' || tag as trending_tag,
    post_count as posts_last_week
FROM tag_counts 
ORDER BY post_count DESC 
LIMIT 10;
"

echo ""
echo "✅ Data seeding completed successfully!"
echo "🎯 You now have a rich dataset for testing suggestions and trending features."
echo ""
echo "📝 Next steps:"
echo "  1. Start your Spring Boot application"
echo "  2. Test the suggestion endpoints:"
echo "     - GET /api/suggestions/trending-tags"
echo "     - GET /api/suggestions/posts"
echo "     - GET /api/suggestions/users"
echo "     - GET /api/suggestions/feed"
echo "  3. Implement frontend components to display suggestions"
echo ""
echo "🚀 Happy coding!"
