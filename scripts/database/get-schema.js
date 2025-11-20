const mysql = require('mysql2/promise');

const config = {
  host: '103.245.255.55',
  port: 3306,
  user: 'erp_user',
  password: 'Digi!passw0rd',
  database: 'DigiERP_LeHuy_Dev2',
  charset: 'utf8mb4'
};

async function getSchema() {
  const connection = await mysql.createConnection(config);
  
  try {
    // Get all tables
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    const schema = {
      database: config.database,
      host: config.host,
      port: config.port,
      tables: {},
      views: [],
      procedures: []
    };
    
    // Get table structures
    for (const tableName of tableNames) {
      // Check if it's a view
      const [tableInfo] = await connection.execute(
        `SELECT TABLE_TYPE FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
        [config.database, tableName]
      );
      
      if (tableInfo[0]?.TABLE_TYPE === 'VIEW') {
        // Get view definition
        const [viewDef] = await connection.execute(
          `SELECT VIEW_DEFINITION FROM information_schema.VIEWS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
          [config.database, tableName]
        );
        schema.views.push({
          name: tableName,
          definition: viewDef[0]?.VIEW_DEFINITION || ''
        });
        continue;
      }
      
      // Get columns
      const [columns] = await connection.execute(
        `SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          NUMERIC_PRECISION,
          NUMERIC_SCALE,
          IS_NULLABLE,
          COLUMN_DEFAULT,
          COLUMN_TYPE,
          COLUMN_KEY,
          EXTRA,
          COLUMN_COMMENT
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION`,
        [config.database, tableName]
      );
      
      // Get indexes
      const [indexes] = await connection.execute(
        `SELECT 
          INDEX_NAME,
          COLUMN_NAME,
          SEQ_IN_INDEX,
          NON_UNIQUE,
          INDEX_TYPE
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY INDEX_NAME, SEQ_IN_INDEX`,
        [config.database, tableName]
      );
      
      // Get foreign keys
      const [foreignKeys] = await connection.execute(
        `SELECT 
          k.CONSTRAINT_NAME,
          k.COLUMN_NAME,
          k.REFERENCED_TABLE_NAME,
          k.REFERENCED_COLUMN_NAME,
          r.UPDATE_RULE,
          r.DELETE_RULE
        FROM information_schema.KEY_COLUMN_USAGE k
        JOIN information_schema.REFERENTIAL_CONSTRAINTS r
          ON k.CONSTRAINT_NAME = r.CONSTRAINT_NAME
          AND k.TABLE_SCHEMA = r.CONSTRAINT_SCHEMA
        WHERE k.TABLE_SCHEMA = ? AND k.TABLE_NAME = ?
          AND k.REFERENCED_TABLE_NAME IS NOT NULL
        ORDER BY k.CONSTRAINT_NAME, k.ORDINAL_POSITION`,
        [config.database, tableName]
      );
      
      // Get table comment
      const [tableComment] = await connection.execute(
        `SELECT TABLE_COMMENT FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
        [config.database, tableName]
      );
      
      schema.tables[tableName] = {
        columns: columns,
        indexes: indexes,
        foreignKeys: foreignKeys,
        comment: tableComment[0]?.TABLE_COMMENT || ''
      };
    }
    
    // Get stored procedures
    const [procedures] = await connection.execute(
      `SELECT 
        ROUTINE_NAME,
        ROUTINE_DEFINITION,
        ROUTINE_TYPE
      FROM information_schema.ROUTINES
      WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'`,
      [config.database]
    );
    
    schema.procedures = procedures.map(p => ({
      name: p.ROUTINE_NAME,
      definition: p.ROUTINE_DEFINITION || ''
    }));
    
    return schema;
  } finally {
    await connection.end();
  }
}

getSchema()
  .then(schema => {
    console.log(JSON.stringify(schema, null, 2));
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });

