const fs = require('fs');
const path = require('path');

// Read schema JSON (remove BOM if present)
let jsonContent = fs.readFileSync(path.join(__dirname, 'schema-output.json'), 'utf8');
// Remove BOM if present
if (jsonContent.charCodeAt(0) === 0xFEFF) {
  jsonContent = jsonContent.slice(1);
}
const schema = JSON.parse(jsonContent);

function getColumnType(col) {
  let type = col.COLUMN_TYPE;
  if (col.IS_NULLABLE === 'YES') {
    type += ' NULL';
  } else {
    type += ' NOT NULL';
  }
  if (col.COLUMN_DEFAULT !== null) {
    if (typeof col.COLUMN_DEFAULT === 'string' && !col.COLUMN_DEFAULT.match(/^CURRENT_TIMESTAMP|^\(|^'|^"/)) {
      type += ` DEFAULT '${col.COLUMN_DEFAULT}'`;
    } else {
      type += ` DEFAULT ${col.COLUMN_DEFAULT}`;
    }
  }
  if (col.EXTRA) {
    type += ` ${col.EXTRA}`;
  }
  if (col.COLUMN_COMMENT) {
    type += ` COMMENT '${col.COLUMN_COMMENT}'`;
  }
  return type;
}

function generateTableSQL(tableName, tableData) {
  let sql = `CREATE TABLE ${tableName} (\n`;
  
  // Columns
  const columns = tableData.columns.map(col => {
    const type = getColumnType(col);
    return `    ${col.COLUMN_NAME} ${type}`;
  });
  sql += columns.join(',\n');
  
  // Primary keys
  const primaryKeys = tableData.columns
    .filter(col => col.COLUMN_KEY === 'PRI')
    .map(col => col.COLUMN_NAME);
  if (primaryKeys.length > 0) {
    sql += `,\n    PRIMARY KEY (${primaryKeys.join(', ')})`;
  }
  
  // Foreign keys (remove duplicates)
  const fkGroups = {};
  const fkSeen = new Set();
  tableData.foreignKeys.forEach(fk => {
    const fkKey = `${fk.COLUMN_NAME}_${fk.REFERENCED_TABLE_NAME}_${fk.REFERENCED_COLUMN_NAME}`;
    if (fkSeen.has(fkKey)) return; // Skip duplicate
    fkSeen.add(fkKey);
    
    if (!fkGroups[fk.CONSTRAINT_NAME]) {
      fkGroups[fk.CONSTRAINT_NAME] = {
        columns: [],
        referencedTable: fk.REFERENCED_TABLE_NAME,
        referencedColumns: [],
        updateRule: fk.UPDATE_RULE,
        deleteRule: fk.DELETE_RULE
      };
    }
    fkGroups[fk.CONSTRAINT_NAME].columns.push(fk.COLUMN_NAME);
    fkGroups[fk.CONSTRAINT_NAME].referencedColumns.push(fk.REFERENCED_COLUMN_NAME);
  });
  
  Object.entries(fkGroups).forEach(([constraintName, fk]) => {
    sql += `,\n    FOREIGN KEY (${fk.columns.join(', ')}) REFERENCES ${fk.referencedTable}(${fk.referencedColumns.join(', ')})`;
    if (fk.updateRule) sql += ` ON UPDATE ${fk.updateRule}`;
    if (fk.deleteRule) sql += ` ON DELETE ${fk.deleteRule}`;
  });
  
  // Indexes (non-primary, non-foreign)
  const indexGroups = {};
  tableData.indexes.forEach(idx => {
    if (idx.INDEX_NAME === 'PRIMARY') return;
    if (tableData.foreignKeys.some(fk => fk.CONSTRAINT_NAME === idx.INDEX_NAME)) return;
    
    if (!indexGroups[idx.INDEX_NAME]) {
      indexGroups[idx.INDEX_NAME] = {
        columns: [],
        unique: idx.NON_UNIQUE === 0,
        type: idx.INDEX_TYPE
      };
    }
    indexGroups[idx.INDEX_NAME].columns.push(idx.COLUMN_NAME);
  });
  
  Object.entries(indexGroups).forEach(([indexName, idx]) => {
    if (idx.unique) {
      sql += `,\n    UNIQUE KEY ${indexName} (${idx.columns.join(', ')})`;
    } else {
      sql += `,\n    INDEX ${indexName} (${idx.columns.join(', ')})`;
    }
  });
  
  sql += '\n);';
  
  if (tableData.comment) {
    sql += ` COMMENT='${tableData.comment}'`;
  }
  
  return sql;
}

function generateMarkdown() {
  let md = `# Database Design - DigiERP System - Version 4.0\n\n`;
  md += `## 📋 Tổng Quan Cơ Sở Dữ Liệu\n\n`;
  md += `Hệ thống DigiERP sử dụng cơ sở dữ liệu MySQL với kiến trúc microservices, database tập trung.\n\n`;
  
  md += `### 🏗️ Kiến Trúc Database tập trung: ${schema.database}\n\n`;
  md += `Hệ thống sử dụng **database tập trung** \`${schema.database}\` cho tất cả các microservices, đảm bảo tính nhất quán dữ liệu và dễ dàng quản lý.\n\n`;
  
  md += `### 🔌 Thông Tin Kết Nối Database\n\n`;
  md += `\`\`\`yaml\n`;
  md += `Database Name: ${schema.database}\n`;
  md += `Host: ${schema.host}\n`;
  md += `Port: ${schema.port}\n`;
  md += `Username: erp_user\n`;
  md += `Password: Digi!passw0rd\n`;
  md += `Charset: utf8mb4\n`;
  md += `Timezone: +07:00 (Asia/Ho_Chi_Minh)\n`;
  md += `\`\`\`\n\n`;
  
  md += `### 📝 Truy Cập Trực Tiếp Database\n\n`;
  md += `#### **Kết Nối Qua MySQL Client:**\n\n`;
  md += `\`\`\`bash\n`;
  md += `# Sử dụng MySQL Command Line\n`;
  md += `mysql -h ${schema.host} -P ${schema.port} -u erp_user -p ${schema.database}\n\n`;
  md += `# Hoặc sử dụng connection string\n`;
  md += `mysql -h ${schema.host} -P ${schema.port} -u erp_user -p'Digi!passw0rd' ${schema.database}\n`;
  md += `\`\`\`\n\n`;
  
  md += `#### **Kết Nối Qua MySQL Workbench / DBeaver / phpMyAdmin:**\n\n`;
  md += `**Connection Settings:**\n`;
  md += `- **Hostname**: \`${schema.host}\`\n`;
  md += `- **Port**: \`${schema.port}\`\n`;
  md += `- **Username**: \`erp_user\`\n`;
  md += `- **Password**: \`Digi!passw0rd\`\n`;
  md += `- **Default Database**: \`${schema.database}\`\n\n`;
  
  md += `**Connection String (JDBC):**\n`;
  md += `\`\`\`\n`;
  md += `jdbc:mysql://${schema.host}:${schema.port}/${schema.database}?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&charset=utf8mb4\n`;
  md += `\`\`\`\n\n`;
  
  md += `**Connection String (MySQL):**\n`;
  md += `\`\`\`\n`;
  md += `mysql://erp_user:Digi!passw0rd@${schema.host}:${schema.port}/${schema.database}\n`;
  md += `\`\`\`\n\n`;
  
  md += `#### **Kết Nối Qua Node.js (TypeORM):**\n\n`;
  md += `\`\`\`typescript\n`;
  md += `{\n`;
  md += `  type: 'mysql',\n`;
  md += `  host: '${schema.host}',\n`;
  md += `  port: ${schema.port},\n`;
  md += `  username: 'erp_user',\n`;
  md += `  password: 'Digi!passw0rd',\n`;
  md += `  database: '${schema.database}',\n`;
  md += `  charset: 'utf8mb4',\n`;
  md += `  timezone: '+07:00',\n`;
  md += `  synchronize: false,\n`;
  md += `  logging: true\n`;
  md += `}\n`;
  md += `\`\`\`\n\n`;
  
  md += `#### **Environment Variables:**\n\n`;
  md += `\`\`\`env\n`;
  md += `DB_HOST=${schema.host}\n`;
  md += `DB_PORT=${schema.port}\n`;
  md += `DB_USERNAME=erp_user\n`;
  md += `DB_PASSWORD=Digi!passw0rd\n`;
  md += `DB_DATABASE=${schema.database}\n`;
  md += `\`\`\`\n\n`;
  
  md += `### ⚠️ Lưu Ý Quan Trọng\n\n`;
  md += `1. **Không thay đổi cấu trúc database trực tiếp**: Mọi thay đổi schema phải được thực hiện thông qua migration scripts hoặc TypeORM migrations\n`;
  md += `2. **Backup trước khi thay đổi**: Luôn backup database trước khi thực hiện các thay đổi quan trọng\n`;
  md += `3. **Sử dụng transactions**: Mọi thao tác cập nhật dữ liệu quan trọng phải được bọc trong database transactions\n`;
  md += `4. **Kiểm tra constraints**: Trước khi INSERT/UPDATE, kiểm tra foreign key constraints và unique constraints\n`;
  md += `5. **Quyền truy cập**: Chỉ sử dụng user \`erp_user\` với quyền phù hợp, không sử dụng root user cho ứng dụng\n\n`;
  
  // Group tables by service/module
  const tableGroups = {
    'User Service': [],
    'Product Service': [],
    'Inventory Service': [],
    'Customer Service': [],
    'Sales Service': [],
    'Purchase Service': [],
    'Financial Service': [],
    'Common Reference Tables': [],
    'Other Tables': []
  };
  
  Object.keys(schema.tables).forEach(tableName => {
    if (tableName.startsWith('user') || tableName.includes('role') || tableName.includes('permission') || tableName.includes('tenant')) {
      tableGroups['User Service'].push(tableName);
    } else if (tableName.includes('product') || tableName.includes('brand') || tableName.includes('category') || tableName.includes('unit') || tableName.includes('material') || tableName.includes('packaging')) {
      tableGroups['Product Service'].push(tableName);
    } else if (tableName.includes('inventory') || tableName.includes('warehouse') || tableName.includes('area') || tableName.includes('counting') || tableName.includes('transfer') || tableName.includes('revaluation') || tableName.includes('posting')) {
      tableGroups['Inventory Service'].push(tableName);
    } else if (tableName.includes('customer') || tableName.includes('contract')) {
      tableGroups['Customer Service'].push(tableName);
    } else if (tableName.includes('sales_order')) {
      tableGroups['Sales Service'].push(tableName);
    } else if (tableName.includes('purchase') || tableName.includes('supplier') || tableName.includes('goods_receipt') || tableName.includes('goods_issue')) {
      tableGroups['Purchase Service'].push(tableName);
    } else if (tableName.includes('invoice') || tableName.includes('payment') || tableName.includes('chart_of_account')) {
      tableGroups['Financial Service'].push(tableName);
    } else if (tableName.startsWith('cat_')) {
      tableGroups['Common Reference Tables'].push(tableName);
    } else {
      tableGroups['Other Tables'].push(tableName);
    }
  });
  
  // Generate tables section
  md += `## 🗂️ Danh Mục Bảng (Tables)\n\n`;
  
  let sectionNum = 1;
  Object.entries(tableGroups).forEach(([groupName, tables]) => {
    if (tables.length === 0) return;
    
    md += `### ${sectionNum}. ${groupName}\n\n`;
    sectionNum++;
    
    tables.sort().forEach((tableName, idx) => {
      const tableData = schema.tables[tableName];
      md += `#### ${sectionNum - 1}.${idx + 1}. Bảng ${tableName}\n`;
      md += `\`\`\`sql\n`;
      md += generateTableSQL(tableName, tableData);
      md += `\n\`\`\`\n\n`;
    });
  });
  
  // Views section
  if (schema.views.length > 0) {
    md += `## 👁️ Danh Mục Views\n\n`;
    schema.views.forEach((view, idx) => {
      md += `### ${idx + 1}. View ${view.name}\n\n`;
      md += `\`\`\`sql\n`;
      md += `CREATE VIEW ${view.name} AS\n`;
      md += view.definition;
      md += `\n\`\`\`\n\n`;
    });
  }
  
  // Stored Procedures section
  if (schema.procedures.length > 0) {
    md += `## 🔧 Stored Procedures\n\n`;
    schema.procedures.forEach((proc, idx) => {
      md += `### ${idx + 1}. ${proc.name}\n\n`;
      md += `\`\`\`sql\n`;
      md += proc.definition;
      md += `\n\`\`\`\n\n`;
    });
  }
  
  // Summary
  md += `## 📊 Tổng Kết Database Design\n\n`;
  md += `### ✅ **Thống Kê:**\n\n`;
  md += `- **Tổng số tables**: ${Object.keys(schema.tables).length} tables\n`;
  md += `- **Tổng số views**: ${schema.views.length} views\n`;
  md += `- **Tổng số stored procedures**: ${schema.procedures.length} procedures\n`;
  
  let totalFKs = 0;
  Object.values(schema.tables).forEach(table => {
    totalFKs += table.foreignKeys.length;
  });
  md += `- **Foreign key relationships**: ${totalFKs} relationships\n`;
  
  md += `\n---\n\n`;
  md += `*Database Design được cập nhật trực tiếp từ database ${schema.database} - ${new Date().toLocaleDateString('vi-VN')}*\n`;
  
  return md;
}

const markdown = generateMarkdown();
// Write with UTF-8 encoding and BOM for better compatibility
fs.writeFileSync(path.join(__dirname, '../../Database-Architect_v4.md'), '\uFEFF' + markdown, 'utf8');
console.log('✅ Đã tạo file Database-Architect_v4.md thành công!');

