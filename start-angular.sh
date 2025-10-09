#!/bin/bash

echo "🚀 Starting 01Blog with Angular Frontend"
echo "======================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists java; then
    echo "❌ Java is not installed. Please install Java 17+ first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "✅ All prerequisites are installed"

# Start Database
echo ""
echo "🗄️  Starting PostgreSQL database..."
cd infra
if port_in_use 5432; then
    echo "⚠️  Port 5432 is already in use. Stopping existing container..."
    docker-compose down
fi

docker-compose up -d
if [ $? -ne 0 ]; then
    echo "❌ Failed to start database"
    exit 1
fi

echo "✅ Database started"
cd ..

# Start Backend
echo ""
echo "🔧 Starting Spring Boot backend..."
cd backend/01blog

# Kill any existing backend process
pkill -f "spring-boot:run" 2>/dev/null || true

# Start backend in background
echo "🚀 Starting backend server..."
nohup ./mvnw spring-boot:run > ../../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

cd ../..

# Wait for backend to start
echo "⏳ Waiting for backend to start (this may take a few minutes)..."
sleep 15
echo "✅ Backend is starting (check backend.log for details)"

# Start Angular Frontend
echo ""
echo "🎨 Starting Angular frontend..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start Angular frontend
echo "🚀 Starting Angular development server..."
echo "n" | npm start &
FRONTEND_PID=$!

cd ..

echo ""
echo "🎉 Application is starting up!"
echo "============================="
echo "📊 Database:  http://localhost:5432"
echo "🔧 Backend:   http://localhost:9090"
echo "🎨 Frontend:  http://localhost:4200"
echo ""
echo "📝 Logs:"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: Check the terminal where npm start is running"
echo ""
echo "🛑 To stop everything:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "  cd infra && docker-compose down"
echo ""
echo "⏳ Please wait for Angular to compile..."
echo "   The frontend will automatically open in your browser"
echo "   This may take 1-2 minutes for the first build"
echo ""
echo "✅ All services are starting! Check your browser for the frontend."
