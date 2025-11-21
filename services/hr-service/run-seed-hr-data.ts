import { AppDataSource } from './src/infrastructure/database/config/data-source';
import * as fs from 'fs';
import * as path from 'path';

async function runSeedData() {
  try {
    console.log('🔌 Connecting to database...');
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Connected to database');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'src/infrastructure/database/migrations/seed-hr-data.sql');
    console.log(`📖 Reading SQL file: ${sqlFilePath}`);
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`❌ SQL file not found: ${sqlFilePath}`);
      process.exit(1);
    }

    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Remove comments and split by semicolon
    const cleanedScript = sqlScript
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n');
    
    // Split by semicolon and filter empty statements
    const statements = cleanedScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\s*$/));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    console.log('🚀 Executing seed data...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;

      try {
        await AppDataSource.query(statement);
        successCount++;
        console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
      } catch (error: any) {
        // Ignore duplicate key errors (data already exists)
        if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
          console.log(`⚠️  Statement ${i + 1}/${statements.length} - Data already exists (skipped)`);
          successCount++;
        } else {
          errorCount++;
          console.error(`❌ Statement ${i + 1}/${statements.length} failed:`, error.message);
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);

    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error running seed data:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

runSeedData();

