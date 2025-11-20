# Database Migrations - DigiERP System

## 📋 Tổng Quan

Thư mục này chứa các migration scripts để cập nhật database schema cho hệ thống DigiERP.

**Database**: `Hien_DigiERP_LeHuy_Dev2` (MySQL 8.0)  
**Migration Tool**: TypeORM  
**Last Updated**: November 2025

---

## 🚀 Cách Chạy Migrations

### Prerequisites

1. Đảm bảo đã cài đặt Node.js và npm
2. Đảm bảo database connection đã được cấu hình đúng
3. Backup database trước khi chạy migrations

### Chạy Migrations

#### Option 1: Sử dụng TypeORM CLI

```bash
# Chạy tất cả migrations chưa được apply
npm run migration:run

# Revert migration cuối cùng
npm run migration:revert

# Xem trạng thái migrations
npm run migration:show
```

#### Option 2: Chạy từng migration thủ công

```bash
# Chạy migration cụ thể
npx typeorm migration:run -d path/to/data-source.ts

# Revert migration cụ thể
npx typeorm migration:revert -d path/to/data-source.ts
```

#### Option 3: Chạy SQL trực tiếp (không khuyến nghị)

Nếu cần chạy SQL trực tiếp, có thể extract SQL từ migration files và chạy trong MySQL client.

---

## 📦 Migration Files

### Phase 1: Sales Management (Priority: High)
**File**: `20251119000001-Phase1-SalesManagement-Tables.ts`

**Tables Created**:
- `quotes` - Quản lý báo giá
- `quote_items` - Chi tiết báo giá
- `deliveries` - Quản lý giao hàng
- `delivery_items` - Chi tiết giao hàng

**Tables Modified**:
- `sales_orders` - Thêm field `order_type`

**Epic**: EPIC-004 - Sales Management

---

### Phase 2: Purchase Management (Priority: High)
**File**: `20251119000002-Phase2-PurchaseManagement-Tables.ts`

**Tables Created**:
- `purchase_requisitions` - Yêu cầu mua hàng
- `purchase_requisition_items` - Chi tiết yêu cầu mua hàng
- `rfqs` - Yêu cầu báo giá
- `rfq_items` - Chi tiết RFQ
- `quality_inspections` - Kiểm tra chất lượng
- `supplier_contracts` - Hợp đồng nhà cung cấp

**Epic**: EPIC-005 - Purchase Management

---

### Phase 3: Financial Management (Priority: Critical)
**File**: `20251119000003-Phase3-FinancialManagement-Tables.ts`

**Tables Created**:
- `payments` - Thanh toán
- `payment_items` - Chi tiết thanh toán
- `accounts_receivable` - Công nợ phải thu
- `accounts_payable` - Công nợ phải trả
- `cash_flow` - Dòng tiền
- `credit_notes` - Ghi có
- `debit_notes` - Ghi nợ
- `taxes` - Thuế
- `tax_rates` - Mức thuế suất
- `currencies` - Tiền tệ
- `exchange_rates` - Tỷ giá hối đoái

**Epic**: EPIC-006 - Financial Management

---

### Phase 4: Customer Management (Priority: Medium)
**File**: `20251119000004-Phase4-CustomerManagement-Tables.ts`

**Tables Created**:
- `rfm_scores` - Phân tích RFM
- `customer_support_tickets` - Hỗ trợ khách hàng

**Tables Modified**:
- `customers` - Thêm fields: `status_id`, `customer_type`, `rating`, `total_orders`, `total_spent`, `last_order_date`

**Epic**: EPIC-003 - Customer Management

---

### Phase 5: Inventory Management (Priority: Medium)
**File**: `20251119000005-Phase5-InventoryManagement-Tables.ts`

**Tables Created**:
- `safety_stock_settings` - Cấu hình tồn kho an toàn
- `reorder_points` - Điểm đặt hàng lại
- `abc_analysis` - Phân tích ABC
- `demand_forecasts` - Dự báo nhu cầu

**Epic**: EPIC-002 - Inventory Management

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Backup Database
**LUÔN backup database trước khi chạy migrations:**

```bash
# Backup database
mysqldump -h 103.245.255.55 -u erp_user -p Hien_DigiERP_LeHuy_Dev2 > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Thứ Tự Chạy Migrations
Migrations phải được chạy theo thứ tự:
1. Phase 1 (Sales Management)
2. Phase 2 (Purchase Management)
3. Phase 3 (Financial Management)
4. Phase 4 (Customer Management)
5. Phase 5 (Inventory Management)

### 3. Dependencies
- Phase 3 phụ thuộc vào `cat_payment_methods` table (phải tồn tại)
- Phase 4 phụ thuộc vào `cat_customer_status` table (phải tồn tại)
- Tất cả phases phụ thuộc vào các base tables: `users`, `products`, `customers`, `warehouses`, `invoices`, `sales_orders`, `purchase_orders`

### 4. Rollback
Nếu cần rollback, chạy `down()` method của migration theo thứ tự ngược lại.

### 5. Data Migration
Một số migrations chỉ tạo tables mới, không migrate data. Cần chạy data migration scripts riêng nếu cần.

---

## 🔍 Kiểm Tra Migrations

### Xem trạng thái migrations

```bash
# Sử dụng TypeORM CLI
npm run migration:show

# Hoặc query trực tiếp database
SELECT * FROM migrations ORDER BY timestamp DESC;
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

---

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

---

## 📚 Tài Liệu Tham Khảo

- [Database Architecture](../docs/database-engineer/Database-Architecture.md)
- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)

---

## 🔄 Update History

- **2025-11-19**: Initial migration scripts created
  - Phase 1: Sales Management
  - Phase 2: Purchase Management
  - Phase 3: Financial Management
  - Phase 4: Customer Management
  - Phase 5: Inventory Management

---

**Last Updated**: November 2025  
**Version**: 1.0

