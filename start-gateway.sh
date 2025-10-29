#!/bin/bash

# =============================================================================
# API Gateway Quick Start Script
# =============================================================================

set -e

echo "=========================================="
echo "Starting API Gateway Infrastructure"
echo "=========================================="

# Check if .env file exists, if not create from example
if [ ! -f .env ]; then
    echo "Creating .env file from gateway.env.example..."
    cp gateway.env.example .env
    
    # Generate secure secrets
    echo ""
    echo "Generating secure secrets..."
    GATEWAY_SECRET=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 64)
    
    # Update .env with generated secrets
    sed -i "s|GATEWAY_SECRET=.*|GATEWAY_SECRET=$GATEWAY_SECRET|" .env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
    
    echo "✓ Generated GATEWAY_SECRET"
    echo "✓ Generated JWT_SECRET"
    echo ""
    echo "⚠️  IMPORTANT: Save these secrets! They are in .env file"
    echo ""
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "Building services..."
echo ""

# Build gateway
echo "📦 Building Gateway..."
cd gateway
./mvnw clean package -DskipTests
cd ..
echo "✓ Gateway built successfully"
echo ""

# Start services
echo "🚀 Starting Docker containers..."
docker-compose -f docker-compose.gateway.yml up -d

echo ""
echo "⏳ Waiting for services to be ready..."

# Wait for Redis
echo -n "Checking Redis..."
until docker exec redis redis-cli ping &> /dev/null; do
    echo -n "."
    sleep 1
done
echo " ✓"

# Wait for PostgreSQL
echo -n "Checking PostgreSQL..."
until docker exec postgres pg_isready -U admin &> /dev/null; do
    echo -n "."
    sleep 1
done
echo " ✓"

# Wait for Backend
echo -n "Checking Backend..."
until curl -s http://localhost:9090/actuator/health &> /dev/null; do
    echo -n "."
    sleep 2
done
echo " ✓"

# Wait for Gateway
echo -n "Checking Gateway..."
until curl -s http://localhost:8080/actuator/health &> /dev/null; do
    echo -n "."
    sleep 2
done
echo " ✓"

echo ""
echo "=========================================="
echo "✅ All services are running!"
echo "=========================================="
echo ""
echo "Services:"
echo "  📡 API Gateway:  http://localhost:8080"
echo "  🔧 Backend:      http://localhost:9090 (internal only)"
echo "  🗄️  PostgreSQL:   localhost:5432"
echo "  📦 Redis:        localhost:6379"
echo "  🌐 Frontend:     http://localhost:4200"
echo ""
echo "Health Checks:"
echo "  Gateway:  http://localhost:8080/actuator/health"
echo "  Backend:  http://localhost:9090/actuator/health"
echo ""
echo "Rate Limiting Test:"
echo "  Run this to test rate limiting:"
echo '  for i in {1..20}; do curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '"'"'{"username":"test","password":"test"}'"'"'; echo ""; done'
echo ""
echo "Logs:"
echo "  Gateway:  docker logs -f api-gateway"
echo "  Backend:  docker logs -f backend"
echo "  All:      docker-compose -f docker-compose.gateway.yml logs -f"
echo ""
echo "Stop:"
echo "  docker-compose -f docker-compose.gateway.yml down"
echo ""
echo "=========================================="

