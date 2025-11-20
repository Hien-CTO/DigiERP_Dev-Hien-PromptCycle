#!/bin/bash
# Docker Compose wrapper script for Linux/Mac
# This script ensures .env file exists before running docker compose

echo "========================================"
echo "DigiERP Docker Compose Helper"
echo "========================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "[ERROR] .env.local not found!"
    echo "Please create .env.local from env.example first."
    echo ""
    echo "Run: cp env.example .env.local"
    exit 1
fi

# Copy .env.local to .env for Docker Compose
echo "[INFO] Copying .env.local to .env..."
cp .env.local .env
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to create .env file"
    exit 1
fi
echo "[SUCCESS] .env file created successfully"
echo ""

# Run docker compose with provided arguments
echo "[INFO] Running docker compose..."
docker compose "$@"

# Exit with docker compose exit code
exit $?

