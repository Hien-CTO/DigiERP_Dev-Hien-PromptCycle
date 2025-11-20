# Database Migrations - UAT Environment

## 📋 Tổng Quan

Script này dùng để chạy tất cả database migrations trên môi trường UAT.

## 🚀 Cách Sử Dụng

### Prerequisites

1. Đảm bảo đã cài đặt Node.js (>= 18.0.0) và npm
2. Đảm bảo đã cài đặt dependencies:
   ```bash
   cd scripts/database
   npm install
   ```
3. Backup database trước khi chạy migrations

### Chạy Migrations

#### Windows (PowerShell)

```powershell
cd scripts\database
node run-migrations-uat.js
```

#### Linux/Mac

```bash
cd scripts/database
chmod +x run-migrations-uat.sh
./run-migrations-uat.sh
```

### Cấu Hình Environment Variables

Có thể set environment variables trước khi chạy:

**Windows (PowerShell):**
```powershell
$env:DB_HOST="your-host"
$env:DB_PORT="3306"
$env:DB_USERNAME="your-username"
$env:DB_PASSWORD="your-password"
$env:DB_DATABASE="your-database"
node run-migrations-uat.js
```

**Linux/Mac:**
```bash
export DB_HOST="your-host"
export DB_PORT="3306"
export DB_USERNAME="your-username"
export DB_PASSWORD="your-password"
export DB_DATABASE="your-database"
./run-migrations-uat.sh
```

## 📦 Migrations Được Chạy

### 1. SQL Migration
- **File**: `006_create_hr_management_tables.sql`
- **Mô tả**: Tạo các tables cho HR Management module
- **Tables**: `leave_types`, `departments`, `employees`, `employee_leave_balances`, `leave_requests`, `leave_request_items`, `attendance_records`, `payrolls`, `payroll_items`, `employee_contracts`, `performance_reviews`

### 2. TypeORM Migrations

#### Phase 1: Sales Management
- **File**: `20251119000001-Phase1-SalesManagement-Tables.ts`
- **Tables**: `quotes`, `quote_items`, `deliveries`, `delivery_items`
- **Modifications**: Thêm `order_type` vào `sales_orders`

#### Phase 2: Purchase Management
- **File**: `20251119000002-Phase2-PurchaseManagement-Tables.ts`
- **Tables**: `purchase_requisitions`, `purchase_requisition_items`, `rfqs`, `rfq_items`, `quality_inspections`, `supplier_contracts`

#### Phase 3: Financial Management
- **File**: `20251119000003-Phase3-FinancialManagement-Tables.ts`
- **Tables**: `payments`, `payment_items`, `accounts_receivable`, `accounts_payable`, `cash_flow`, `credit_notes`, `debit_notes`, `taxes`, `tax_rates`, `currencies`, `exchange_rates`

#### Phase 4: Customer Management
- **File**: `20251119000004-Phase4-CustomerManagement-Tables.ts`
- **Tables**: `rfm_scores`, `customer_support_tickets`
- **Modifications**: Thêm fields vào `customers` table

#### Phase 5: Inventory Management
- **File**: `20251119000005-Phase5-InventoryManagement-Tables.ts`
- **Tables**: `safety_stock_settings`, `reorder_points`, `abc_analysis`, `demand_forecasts`

## ⚠️ Lưu Ý Quan Trọng

### 1. Backup Database
**LUÔN backup database trước khi chạy migrations:**

```bash
mysqldump -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD $DB_DATABASE > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Thứ Tự Chạy Migrations
Migrations được chạy theo thứ tự:
1. SQL migration (HR Management)
2. Phase 1 (Sales Management)
3. Phase 2 (Purchase Management)
4. Phase 3 (Financial Management)
5. Phase 4 (Customer Management)
6. Phase 5 (Inventory Management)

### 3. Dependencies
- Phase 3 phụ thuộc vào `cat_payment_methods` table (phải tồn tại)
- Phase 4 phụ thuộc vào `cat_customer_status` table (phải tồn tại)
- Tất cả phases phụ thuộc vào các base tables: `users`, `products`, `customers`, `warehouses`, `invoices`, `sales_orders`, `purchase_orders`, `goods_receipts`, `cat_suppliers`

### 4. Rollback
Nếu cần rollback, chạy:
```bash
npm run migration:revert
```

## 🔍 Kiểm Tra Migrations

### Xem trạng thái migrations

```bash
npm run migration:show
```

### Verify Tables

```sql
-- Kiểm tra tables đã được tạo
SHOW TABLES LIKE 'quotes';
SHOW TABLES LIKE 'payments';
SHOW TABLES LIKE 'rfm_scores';

-- Kiểm tra structure
DESCRIBE quotes;
DESCRIBE payments;
```

## 📝 Troubleshooting

### Lỗi Foreign Key Constraint

Nếu gặp lỗi foreign key constraint:
1. Kiểm tra các tables reference đã tồn tại
2. Kiểm tra data integrity
3. Có thể cần disable foreign key checks tạm thời:

```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Run migration
SET FOREIGN_KEY_CHECKS = 1;
```

### Lỗi Duplicate Key

Nếu gặp lỗi duplicate key:
1. Kiểm tra data đã tồn tại
2. Có thể cần clean up data trước khi chạy migration

### Lỗi Column Already Exists

Nếu gặp lỗi column already exists:
1. Migration đã được chạy trước đó
2. Kiểm tra migration status
3. Có thể cần rollback và chạy lại

## 📚 Tài Liệu Tham Khảo

- [Database Architecture](../../docs/database-engineer/Database-Architecture.md)
- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)

---

**Last Updated**: November 2025  
**Version**: 1.0

