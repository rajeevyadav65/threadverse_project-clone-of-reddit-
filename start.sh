#!/bin/bash
set -e

echo ""
echo "=========================================="
echo "   ThreadVerse — Starting Services"
echo "=========================================="
echo ""

# Check for required tools
command -v java  >/dev/null 2>&1 || { echo "❌ Java 17+ is required but not installed."; exit 1; }
command -v mvn   >/dev/null 2>&1 || { echo "❌ Maven is required but not installed."; exit 1; }
command -v node  >/dev/null 2>&1 || { echo "❌ Node.js 18+ is required but not installed."; exit 1; }
command -v npm   >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }

echo "✅ All required tools found"
echo ""

# Start Backend
echo "[1/2] Starting Spring Boot backend on :8080..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!
cd ..

# Wait for backend
echo "⏳ Waiting for backend to initialize (15s)..."
sleep 15

# Install frontend deps if needed
if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd frontend && npm install && cd ..
fi

# Start Frontend
echo "[2/2] Starting Next.js frontend on :3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ ThreadVerse is running!"
echo "   Backend:  http://localhost:8080"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both services."
echo ""

# Open browser after 8 seconds
sleep 8
if command -v open >/dev/null 2>&1; then
  open http://localhost:3000
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open http://localhost:3000
fi

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
