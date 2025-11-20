#!/usr/bin/env node

/**
 * Script chạy tất cả database migrations cho môi trường UAT
 * 
 * Usage:
 *   node run-migrations-uat.js
 * 
 * Environment Variables:
 *   DB_HOST - Database host (default: from config)
 *   DB_PORT - Database port (default: 3306)
 *   DB_USERNAME - Database username
 *   DB_PASSWORD - Database password
 *   DB_DATABASE - Database name
 *   NODE_ENV - Environment (default: production)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Database Migrations for UAT Environment\n');
console.log('='.repeat(60));

// Check environment variables
const dbHost = process.env.DB_HOST || '103.245.255.55';
const dbPort = process.env.DB_PORT || '3306';
const dbUsername = process.env.DB_USERNAME || 'erp_user';
const dbPassword = process.env.DB_PASSWORD || 'Digi!passw0rd';
const dbDatabase = process.env.DB_DATABASE || 'Hien_DigiERP_LeHuy_Dev2';

console.log('📋 Configuration:');
console.log(`   Host: ${dbHost}`);
console.log(`   Port: ${dbPort}`);
console.log(`   Database: ${dbDatabase}`);
console.log(`   Username: ${dbUsername}`);
console.log('');

// Set environment variables for child processes
process.env.DB_HOST = dbHost;
process.env.DB_PORT = dbPort;
process.env.DB_USERNAME = dbUsername;
process.env.DB_PASSWORD = dbPassword;
process.env.DB_DATABASE = dbDatabase;
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const scriptsDir = __dirname;

try {
  // Step 1: Run SQL migration
  console.log('📦 Step 1: Running SQL migration (HR Management Tables)...');
  console.log('-'.repeat(60));
  
  try {
    execSync('node run-sql-migration.js', {
      cwd: scriptsDir,
      stdio: 'inherit',
      env: process.env
    });
    console.log('✅ SQL migration completed successfully!\n');
  } catch (error) {
    console.error('❌ SQL migration failed:', error.message);
    console.log('⚠️  Continuing with TypeORM migrations...\n');
  }

  // Step 2: Run TypeORM migrations
  console.log('📦 Step 2: Running TypeORM migrations (Phase 1-5)...');
  console.log('-'.repeat(60));
  
  try {
    execSync('npm run migration:run', {
      cwd: scriptsDir,
      stdio: 'inherit',
      env: process.env
    });
    console.log('✅ TypeORM migrations completed successfully!\n');
  } catch (error) {
    console.error('❌ TypeORM migrations failed:', error.message);
    throw error;
  }

  // Step 3: Verify migrations
  console.log('📦 Step 3: Verifying migrations...');
  console.log('-'.repeat(60));
  
  try {
    execSync('npm run migration:show', {
      cwd: scriptsDir,
      stdio: 'inherit',
      env: process.env
    });
    console.log('✅ Migration verification completed!\n');
  } catch (error) {
    console.error('⚠️  Migration verification failed:', error.message);
    console.log('⚠️  Please check manually...\n');
  }

  console.log('='.repeat(60));
  console.log('✨ All migrations completed successfully!');
  console.log('='.repeat(60));

} catch (error) {
  console.error('\n❌ Migration process failed!');
  console.error('Error:', error.message);
  process.exit(1);
}

