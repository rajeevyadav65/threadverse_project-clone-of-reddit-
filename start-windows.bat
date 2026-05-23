@echo off
echo.
echo ==========================================
echo    ThreadVerse - Starting Services
echo ==========================================
echo.

REM Start Backend
echo [1/2] Starting Spring Boot backend on :8080...
start "ThreadVerse Backend" cmd /k "cd backend && mvn spring-boot:run"

REM Wait 15 seconds for backend to initialize
echo Waiting for backend to start...
timeout /t 15 /nobreak > NUL

REM Start Frontend
echo [2/2] Starting Next.js frontend on :3000...
start "ThreadVerse Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ✅ Both services starting!
echo    Backend:  http://localhost:8080
echo    Frontend: http://localhost:3000
echo.
echo Opening browser in 20 seconds...
timeout /t 20 /nobreak > NUL
start http://localhost:3000
