@echo off
REM Docker Compose wrapper script for Windows
REM This script ensures .env file exists before running docker compose

echo ========================================
echo DigiERP Docker Compose Helper
echo ========================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo [ERROR] .env.local not found!
    echo Please create .env.local from env.example first.
    echo.
    echo Run: copy env.example .env.local
    pause
    exit /b 1
)

REM Copy .env.local to .env for Docker Compose
echo [INFO] Copying .env.local to .env...
copy /Y .env.local .env >nul
if errorlevel 1 (
    echo [ERROR] Failed to create .env file
    pause
    exit /b 1
)
echo [SUCCESS] .env file created successfully
echo.

REM Run docker compose with provided arguments
echo [INFO] Running docker compose...
docker compose %*

REM Exit with docker compose exit code
exit /b %errorlevel%

