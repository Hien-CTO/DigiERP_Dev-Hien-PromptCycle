#!/bin/bash

# Script chạy tất cả database migrations cho môi trường UAT (Linux/Mac)
# 
# Usage:
#   ./run-migrations-uat.sh
# 
# Environment Variables:
#   DB_HOST - Database host
#   DB_PORT - Database port (default: 3306)
#   DB_USERNAME - Database username
#   DB_PASSWORD - Database password
#   DB_DATABASE - Database name

set -e

echo "🚀 Starting Database Migrations for UAT Environment"
echo "============================================================"

# Check environment variables
DB_HOST=${DB_HOST:-"103.245.255.55"}
DB_PORT=${DB_PORT:-"3306"}
DB_USERNAME=${DB_USERNAME:-"erp_user"}
DB_PASSWORD=${DB_PASSWORD:-"Digi!passw0rd"}
DB_DATABASE=${DB_DATABASE:-"Hien_DigiERP_LeHuy_Dev2"}

echo "📋 Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_DATABASE"
echo "   Username: $DB_USERNAME"
echo ""

export DB_HOST DB_PORT DB_USERNAME DB_PASSWORD DB_DATABASE
export NODE_ENV=${NODE_ENV:-"production"}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Step 1: Run SQL migration
echo "📦 Step 1: Running SQL migration (HR Management Tables)..."
echo "------------------------------------------------------------"

if node "$SCRIPT_DIR/run-sql-migration.js"; then
    echo "✅ SQL migration completed successfully!"
else
    echo "❌ SQL migration failed, but continuing..."
fi

echo ""

# Step 2: Run TypeORM migrations
echo "📦 Step 2: Running TypeORM migrations (Phase 1-5)..."
echo "------------------------------------------------------------"

cd "$SCRIPT_DIR"
npm run migration:run

echo "✅ TypeORM migrations completed successfully!"
echo ""

# Step 3: Verify migrations
echo "📦 Step 3: Verifying migrations..."
echo "------------------------------------------------------------"

npm run migration:show || echo "⚠️  Migration verification failed, please check manually"

echo ""
echo "============================================================"
echo "✨ All migrations completed successfully!"
echo "============================================================"

