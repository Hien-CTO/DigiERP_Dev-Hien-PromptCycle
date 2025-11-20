const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSqlMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '103.245.255.55',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'erp_user',
    password: process.env.DB_PASSWORD || 'Digi!passw0rd',
    database: process.env.DB_DATABASE || 'Hien_DigiERP_LeHuy_Dev2',
    multipleStatements: true,
  });

  try {
    console.log('📦 Running SQL migration: 006_create_hr_management_tables.sql');
    
    const sqlFile = path.join(__dirname, 'migrations', '006_create_hr_management_tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and filter out empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE'));
    
    for (const statement of statements) {
      if (statement.length > 0) {
        try {
          await connection.query(statement);
          console.log('✅ Executed statement successfully');
        } catch (error) {
          // Ignore "table already exists" errors
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_ENTRY') {
            console.log('⚠️  Table/Data already exists, skipping...');
          } else {
            console.error('❌ Error executing statement:', error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('✅ SQL migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

runSqlMigration().catch(console.error);

