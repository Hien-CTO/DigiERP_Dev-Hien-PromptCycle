# Database Architecture - DigiERP System

## 📋 Tổng Quan

**Database**: `Hien_DigiERP_LeHuy_Dev2` (MySQL 8.0)  
**Version**: 5.0  
**Last Updated**: November 2025  
**Architect**: Database Engineer Expert

Tài liệu này mô tả kiến trúc database toàn diện cho hệ thống DigiERP, bao gồm:
- Phân tích từ Epic → Business Rules → Use Cases
- Cấu trúc database hiện tại
- Các tables cần thêm mới
- Các tables/fields cần điều chỉnh
- Migration plan và scripts

---

## 🎯 Mục Tiêu

1. **Đảm bảo ACID Compliance**: Tất cả transactions đáp ứng ACID properties
2. **Normalization**: Tối thiểu 3NF, cân nhắc denormalization cho performance
3. **Data Integrity**: Referential integrity, constraints, triggers
4. **Performance**: Indexes tối ưu cho queries thường dùng
5. **Scalability**: Database structure hỗ trợ mở rộng
6. **Audit Trail**: Tracking đầy đủ cho compliance

---

## 📊 Phân Tích Requirements

### Epic → Business Rules → Use Cases Mapping

#### EPIC-001: Product Management
**Business Rules**: BR-PM-001 đến BR-PM-019  
**Use Cases**: Multi-tier Pricing, Batch Management  
**Database Impact**:
- ✅ `products` - Cần thêm fields: `customer_type`, `rating`, `total_orders`, `total_spent`, `last_order_date`
- ✅ `product_prices` - Đã có với multi-tier pricing support (price_type, customer_id, customer_group_id, contract_id, min_quantity, max_quantity, discount_percentage, discount_amount, valid_from, valid_to)
- ✅ `inventory_batches` - Đã có, cần verify structure

#### EPIC-002: Inventory Management
**Business Rules**: BR-INV-001 đến BR-INV-021  
**Use Cases**: Goods Receipt, Inventory Counting, Transfers  
**Database Impact**:
- ❌ `safety_stock_settings` - **CẦN TẠO MỚI**
- ❌ `reorder_points` - **CẦN TẠO MỚI**
- ❌ `abc_analysis` - **CẦN TẠO MỚI**
- ❌ `demand_forecasts` - **CẦN TẠO MỚI**
- ✅ `inventory` - Cần thêm: `safety_stock`, `reorder_point` (hoặc tách ra table riêng)

#### EPIC-003: Customer Management
**Business Rules**: Customer segmentation, contracts, RFM  
**Use Cases**: Customer 360° view, Contract management  
**Database Impact**:
- ✅ `customers` - Cần thêm: `status_id`, `customer_type`, `rating`, `total_orders`, `total_spent`, `last_order_date`
- ✅ `contracts` - Đã có, cần verify
- ❌ `rfm_scores` - **CẦN TẠO MỚI**
- ❌ `customer_support_tickets` - **CẦN TẠO MỚI**

#### EPIC-004: Sales Management
**Business Rules**: BR-SALES-001 đến BR-SALES-016  
**Use Cases**: Order management, Quote generation, Delivery  
**Database Impact**:
- ✅ `sales_orders` - Cần thêm: `order_type` (ENUM)
- ❌ `quotes` - **CẦN TẠO MỚI**
- ❌ `quote_items` - **CẦN TẠO MỚI**
- ❌ `deliveries` - **CẦN TẠO MỚI**
- ❌ `delivery_items` - **CẦN TẠO MỚI**

#### EPIC-005: Purchase Management
**Business Rules**: Purchase requisition, RFQ, Quality inspection  
**Use Cases**: Purchase workflow, Goods receipt  
**Database Impact**:
- ❌ `purchase_requisitions` - **CẦN TẠO MỚI**
- ❌ `purchase_requisition_items` - **CẦN TẠO MỚI**
- ❌ `rfqs` - **CẦN TẠO MỚI**
- ❌ `rfq_items` - **CẦN TẠO MỚI**
- ❌ `quality_inspections` - **CẦN TẠO MỚI**
- ❌ `supplier_contracts` - **CẦN TẠO MỚI**
- ✅ `cat_suppliers` - Cần verify structure

#### EPIC-006: Financial Management
**Business Rules**: Invoice, Payment, AR/AP, Tax  
**Use Cases**: Invoice processing, Payment tracking  
**Database Impact**:
- ✅ `invoices` - Đã có, cần verify
- ❌ `payments` - **CẦN TẠO MỚI**
- ❌ `payment_items` - **CẦN TẠO MỚI**
- ❌ `accounts_receivable` - **CẦN TẠO MỚI**
- ❌ `accounts_payable` - **CẦN TẠO MỚI**
- ❌ `cash_flow` - **CẦN TẠO MỚI**
- ❌ `cash_flow_items` - **CẦN TẠO MỚI**
- ❌ `credit_notes` - **CẦN TẠO MỚI**
- ❌ `debit_notes` - **CẦN TẠO MỚI**
- ❌ `taxes` - **CẦN TẠO MỚI**
- ❌ `tax_rates` - **CẦN TẠO MỚI**
- ❌ `currencies` - **CẦN TẠO MỚI**
- ❌ `exchange_rates` - **CẦN TẠO MỚI**

#### EPIC-008: HR Management
**Business Rules**: BR-HR-001 đến BR-HR-010  
**Use Cases**: Employee Management, Attendance, Leave, Employee-User Integration  
**Database Impact**:
- ❌ `employees` - **CẦN TẠO MỚI**
- ❌ `departments` - **CẦN TẠO MỚI**
- ❌ `positions` - **CẦN TẠO MỚI**
- ❌ `employee_contracts` - **CẦN TẠO MỚI**
- ❌ `attendance_records` - **CẦN TẠO MỚI**
- ❌ `leave_requests` - **CẦN TẠO MỚI**
- ❌ `leave_balances` - **CẦN TẠO MỚI**
- ❌ `leave_types` - **CẦN TẠO MỚI**
- ✅ `users` - Đã có, cần thêm field `employee_id` để link với employees

---

## 🆕 Tables Cần Tạo Mới

### 1. Sales Management Tables

#### 1.1. quotes
**Mục đích**: Quản lý báo giá cho khách hàng  
**Epic**: EPIC-004  
**Business Rule**: BR-SALES-007

```sql
CREATE TABLE quotes (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    quote_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(36) NOT NULL,
    quote_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    status ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED') DEFAULT 'DRAFT',
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    notes TEXT NULL,
    terms_conditions TEXT NULL,
    converted_to_order_id INT NULL,
    created_by INT NULL,
    sent_by INT NULL,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (converted_to_order_id) REFERENCES sales_orders(id),
    INDEX idx_quotes_customer (customer_id),
    INDEX idx_quotes_status (status),
    INDEX idx_quotes_date (quote_date)
);
```

#### 1.2. quote_items
**Mục đích**: Chi tiết sản phẩm trong báo giá

```sql
CREATE TABLE quote_items (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    quote_id VARCHAR(36) NOT NULL,
    product_id INT NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(20) NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    line_total DECIMAL(15,2) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_quote_items_quote (quote_id),
    INDEX idx_quote_items_product (product_id)
);
```

#### 1.3. deliveries
**Mục đích**: Quản lý giao hàng và logistics  
**Epic**: EPIC-004 Feature 7

```sql
CREATE TABLE deliveries (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    delivery_number VARCHAR(50) NOT NULL UNIQUE,
    sales_order_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    delivery_date DATE NOT NULL,
    status ENUM('DRAFT', 'SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED') DEFAULT 'DRAFT',
    delivery_method VARCHAR(50) NULL,
    vehicle_number VARCHAR(50) NULL,
    driver_name VARCHAR(100) NULL,
    driver_phone VARCHAR(20) NULL,
    tracking_number VARCHAR(200) NULL,
    delivered_at TIMESTAMP NULL,
    delivered_by VARCHAR(255) NULL,
    customer_signature TEXT NULL,
    notes TEXT NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    INDEX idx_deliveries_order (sales_order_id),
    INDEX idx_deliveries_status (status),
    INDEX idx_deliveries_date (delivery_date)
);
```

#### 1.4. delivery_items
**Mục đích**: Chi tiết sản phẩm trong giao hàng

```sql
CREATE TABLE delivery_items (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    delivery_id VARCHAR(36) NOT NULL,
    product_id INT NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(20) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_delivery_items_delivery (delivery_id)
);
```

### 2. Purchase Management Tables

#### 2.1. purchase_requisitions
**Mục đích**: Yêu cầu mua hàng từ phòng ban  
**Epic**: EPIC-005 Feature 3

```sql
CREATE TABLE purchase_requisitions (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    requisition_number VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NULL,
    requested_by INT NOT NULL,
    request_date DATE NOT NULL,
    required_date DATE NULL,
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CONVERTED') DEFAULT 'DRAFT',
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    notes TEXT NULL,
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    converted_to_po_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (converted_to_po_id) REFERENCES purchase_orders(id),
    INDEX idx_requisitions_status (status),
    INDEX idx_requisitions_date (request_date)
);
```

#### 2.2. purchase_requisition_items
**Mục đích**: Chi tiết sản phẩm trong yêu cầu mua hàng

```sql
CREATE TABLE purchase_requisition_items (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    requisition_id VARCHAR(36) NOT NULL,
    product_id INT NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20) NULL,
    estimated_unit_cost DECIMAL(15,2) NULL,
    estimated_total DECIMAL(15,2) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requisition_id) REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_requisition_items_requisition (requisition_id)
);
```

#### 2.3. rfqs
**Mục đích**: Yêu cầu báo giá từ nhà cung cấp  
**Epic**: EPIC-005 Feature 4

```sql
CREATE TABLE rfqs (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    rfq_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    rfq_date DATE NOT NULL,
    closing_date DATE NOT NULL,
    status ENUM('DRAFT', 'SENT', 'OPEN', 'CLOSED', 'CANCELLED') DEFAULT 'DRAFT',
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rfqs_status (status),
    INDEX idx_rfqs_date (rfq_date)
);
```

#### 2.4. rfq_items
**Mục đích**: Chi tiết sản phẩm trong RFQ

```sql
CREATE TABLE rfq_items (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    rfq_id VARCHAR(36) NOT NULL,
    product_id INT NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20) NULL,
    specifications TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_rfq_items_rfq (rfq_id)
);
```

#### 2.5. quality_inspections
**Mục đích**: Kiểm tra chất lượng hàng nhận  
**Epic**: EPIC-005 Feature 8

```sql
CREATE TABLE quality_inspections (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    inspection_number VARCHAR(50) NOT NULL UNIQUE,
    goods_receipt_id VARCHAR(36) NOT NULL,
    inspection_date DATE NOT NULL,
    status ENUM('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'CONDITIONAL') DEFAULT 'PENDING',
    inspector_name VARCHAR(255) NULL,
    inspector_id INT NULL,
    passed_quantity DECIMAL(10,3) NULL,
    failed_quantity DECIMAL(10,3) NULL,
    conditional_quantity DECIMAL(10,3) NULL,
    inspection_notes TEXT NULL,
    test_results JSON NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (goods_receipt_id) REFERENCES goods_receipts(id),
    FOREIGN KEY (inspector_id) REFERENCES users(id),
    INDEX idx_inspections_receipt (goods_receipt_id),
    INDEX idx_inspections_status (status)
);
```

#### 2.6. supplier_contracts
**Mục đích**: Hợp đồng với nhà cung cấp  
**Epic**: EPIC-005 Feature 10

```sql
CREATE TABLE supplier_contracts (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    contract_number VARCHAR(100) NOT NULL UNIQUE,
    supplier_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    contract_value DECIMAL(15,2) NULL,
    status ENUM('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED') DEFAULT 'DRAFT',
    terms_conditions TEXT NULL,
    signed_by VARCHAR(255) NULL,
    signed_date DATE NULL,
    auto_renewal TINYINT(1) DEFAULT 0,
    renewal_period_months INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES cat_suppliers(id),
    INDEX idx_supplier_contracts_supplier (supplier_id),
    INDEX idx_supplier_contracts_status (status)
);
```

### 3. Financial Management Tables

#### 3.1. payments
**Mục đích**: Quản lý thanh toán  
**Epic**: EPIC-006 Feature 3

```sql
CREATE TABLE payments (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    payment_number VARCHAR(50) NOT NULL UNIQUE,
    payment_type ENUM('CUSTOMER_PAYMENT', 'SUPPLIER_PAYMENT', 'EXPENSE', 'REFUND') NOT NULL,
    customer_id VARCHAR(36) NULL,
    supplier_id VARCHAR(36) NULL,
    payment_date DATE NOT NULL,
    payment_method_id BIGINT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
    reference_number VARCHAR(100) NULL,
    bank_account VARCHAR(100) NULL,
    notes TEXT NULL,
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'PROCESSED', 'CANCELLED') DEFAULT 'DRAFT',
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    processed_at TIMESTAMP NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (supplier_id) REFERENCES cat_suppliers(id),
    FOREIGN KEY (payment_method_id) REFERENCES cat_payment_methods(id),
    INDEX idx_payments_customer (customer_id),
    INDEX idx_payments_supplier (supplier_id),
    INDEX idx_payments_date (payment_date),
    INDEX idx_payments_status (status)
);
```

#### 3.2. payment_items
**Mục đích**: Chi tiết thanh toán cho từng hóa đơn

```sql
CREATE TABLE payment_items (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    payment_id VARCHAR(36) NOT NULL,
    invoice_id VARCHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    INDEX idx_payment_items_payment (payment_id),
    INDEX idx_payment_items_invoice (invoice_id)
);
```

#### 3.3. accounts_receivable
**Mục đích**: Công nợ phải thu  
**Epic**: EPIC-006 Feature 4

```sql
CREATE TABLE accounts_receivable (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    invoice_id VARCHAR(36) NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    original_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    balance_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    aging_category ENUM('CURRENT', '30_DAYS', '60_DAYS', '90_DAYS', 'OVER_90_DAYS') NULL,
    days_overdue INT NULL,
    status ENUM('CURRENT', 'OVERDUE', 'PAID', 'WRITTEN_OFF') DEFAULT 'CURRENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    INDEX idx_ar_customer (customer_id),
    INDEX idx_ar_invoice (invoice_id),
    INDEX idx_ar_status (status),
    INDEX idx_ar_due_date (due_date)
);
```

#### 3.4. accounts_payable
**Mục đích**: Công nợ phải trả  
**Epic**: EPIC-006 Feature 5

```sql
CREATE TABLE accounts_payable (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL,
    invoice_id VARCHAR(36) NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    original_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    balance_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    aging_category ENUM('CURRENT', '30_DAYS', '60_DAYS', '90_DAYS', 'OVER_90_DAYS') NULL,
    days_until_due INT NULL,
    status ENUM('CURRENT', 'DUE', 'PAID', 'OVERDUE') DEFAULT 'CURRENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES cat_suppliers(id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    INDEX idx_ap_supplier (supplier_id),
    INDEX idx_ap_invoice (invoice_id),
    INDEX idx_ap_status (status),
    INDEX idx_ap_due_date (due_date)
);
```

#### 3.5. cash_flow
**Mục đích**: Dòng tiền  
**Epic**: EPIC-006 Feature 6

```sql
CREATE TABLE cash_flow (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    flow_date DATE NOT NULL,
    flow_type ENUM('INFLOW', 'OUTFLOW') NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    reference_type VARCHAR(50) NULL,
    reference_id VARCHAR(36) NULL,
    bank_account VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cash_flow_date (flow_date),
    INDEX idx_cash_flow_type (flow_type),
    INDEX idx_cash_flow_category (category)
);
```

#### 3.6. credit_notes
**Mục đích**: Ghi có (điều chỉnh giảm)  
**Epic**: EPIC-006 Feature 9

```sql
CREATE TABLE credit_notes (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    credit_note_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_id VARCHAR(36) NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    credit_note_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    status ENUM('DRAFT', 'ISSUED', 'APPLIED', 'CANCELLED') DEFAULT 'DRAFT',
    applied_to_invoice_id VARCHAR(36) NULL,
    applied_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (applied_to_invoice_id) REFERENCES invoices(id),
    INDEX idx_credit_notes_invoice (invoice_id),
    INDEX idx_credit_notes_customer (customer_id),
    INDEX idx_credit_notes_status (status)
);
```

#### 3.7. debit_notes
**Mục đích**: Ghi nợ (điều chỉnh tăng)  
**Epic**: EPIC-006 Feature 9

```sql
CREATE TABLE debit_notes (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    debit_note_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_id VARCHAR(36) NOT NULL,
    supplier_id VARCHAR(36) NOT NULL,
    debit_note_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    status ENUM('DRAFT', 'ISSUED', 'APPLIED', 'CANCELLED') DEFAULT 'DRAFT',
    applied_to_invoice_id VARCHAR(36) NULL,
    applied_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (supplier_id) REFERENCES cat_suppliers(id),
    FOREIGN KEY (applied_to_invoice_id) REFERENCES invoices(id),
    INDEX idx_debit_notes_invoice (invoice_id),
    INDEX idx_debit_notes_supplier (supplier_id),
    INDEX idx_debit_notes_status (status)
);
```

#### 3.8. taxes
**Mục đích**: Cấu hình thuế  
**Epic**: EPIC-006 Feature 11

```sql
CREATE TABLE taxes (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    tax_type ENUM('PERCENTAGE', 'FIXED') NOT NULL DEFAULT 'PERCENTAGE',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    INDEX idx_taxes_code (code),
    INDEX idx_taxes_active (is_active)
);
```

#### 3.9. tax_rates
**Mục đích**: Mức thuế suất theo thời gian

```sql
CREATE TABLE tax_rates (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tax_id BIGINT NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tax_id) REFERENCES taxes(id),
    INDEX idx_tax_rates_tax (tax_id),
    INDEX idx_tax_rates_dates (effective_from, effective_to)
);
```

#### 3.10. currencies
**Mục đích**: Quản lý tiền tệ  
**Epic**: EPIC-006 Feature 12

```sql
CREATE TABLE currencies (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    is_base_currency TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    decimal_places INT DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_currencies_code (code)
);
```

#### 3.11. exchange_rates
**Mục đích**: Tỷ giá hối đoái

```sql
CREATE TABLE exchange_rates (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    from_currency_id INT NOT NULL,
    to_currency_id INT NOT NULL,
    rate DECIMAL(10,4) NOT NULL,
    effective_date DATE NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (from_currency_id) REFERENCES currencies(id),
    FOREIGN KEY (to_currency_id) REFERENCES currencies(id),
    INDEX idx_exchange_rates_currencies (from_currency_id, to_currency_id),
    INDEX idx_exchange_rates_date (effective_date)
);
```

### 4. Customer Management Tables

#### 4.1. rfm_scores
**Mục đích**: Phân tích RFM (Recency, Frequency, Monetary)  
**Epic**: EPIC-003 Feature 8

```sql
CREATE TABLE rfm_scores (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    analysis_date DATE NOT NULL,
    recency_score INT NOT NULL,
    frequency_score INT NOT NULL,
    monetary_score INT NOT NULL,
    rfm_segment VARCHAR(50) NULL,
    last_purchase_date DATE NULL,
    purchase_frequency INT NULL,
    total_spent DECIMAL(15,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_rfm_customer (customer_id),
    INDEX idx_rfm_analysis_date (analysis_date),
    INDEX idx_rfm_segment (rfm_segment)
);
```

#### 4.2. customer_support_tickets
**Mục đích**: Quản lý hỗ trợ khách hàng  
**Epic**: EPIC-003 Feature 9

```sql
CREATE TABLE customer_support_tickets (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(36) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED') DEFAULT 'OPEN',
    category VARCHAR(100) NULL,
    assigned_to INT NULL,
    created_by INT NULL,
    resolved_at TIMESTAMP NULL,
    resolved_by INT NULL,
    resolution_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id),
    INDEX idx_tickets_customer (customer_id),
    INDEX idx_tickets_status (status),
    INDEX idx_tickets_priority (priority),
    INDEX idx_tickets_assigned (assigned_to)
);
```

### 5. Inventory Management Tables

#### 5.1. safety_stock_settings
**Mục đích**: Cấu hình tồn kho an toàn  
**Epic**: EPIC-002 Feature 9

```sql
CREATE TABLE safety_stock_settings (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    safety_stock_quantity DECIMAL(10,3) NOT NULL,
    calculation_method ENUM('MANUAL', 'AUTOMATIC') DEFAULT 'MANUAL',
    lead_time_days INT NULL,
    average_daily_demand DECIMAL(10,3) NULL,
    demand_std_deviation DECIMAL(10,3) NULL,
    service_level_target DECIMAL(5,2) NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    UNIQUE KEY uk_safety_stock_product_warehouse (product_id, warehouse_id),
    INDEX idx_safety_stock_product (product_id),
    INDEX idx_safety_stock_warehouse (warehouse_id)
);
```

#### 5.2. reorder_points
**Mục đích**: Điểm đặt hàng lại  
**Epic**: EPIC-002 Feature 10

```sql
CREATE TABLE reorder_points (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    reorder_point DECIMAL(10,3) NOT NULL,
    reorder_quantity DECIMAL(10,3) NOT NULL,
    calculation_method ENUM('MANUAL', 'AUTOMATIC') DEFAULT 'MANUAL',
    lead_time_days INT NULL,
    average_daily_demand DECIMAL(10,3) NULL,
    safety_stock_id BIGINT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (safety_stock_id) REFERENCES safety_stock_settings(id),
    UNIQUE KEY uk_reorder_point_product_warehouse (product_id, warehouse_id),
    INDEX idx_reorder_point_product (product_id),
    INDEX idx_reorder_point_warehouse (warehouse_id)
);
```

#### 5.3. abc_analysis
**Mục đích**: Phân tích ABC  
**Epic**: EPIC-002 Feature 11

```sql
CREATE TABLE abc_analysis (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    analysis_date DATE NOT NULL,
    annual_usage_value DECIMAL(15,2) NOT NULL,
    annual_usage_quantity DECIMAL(10,3) NOT NULL,
    classification ENUM('A', 'B', 'C') NOT NULL,
    cumulative_value_percentage DECIMAL(5,2) NULL,
    recommendation TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_abc_product (product_id),
    INDEX idx_abc_classification (classification),
    INDEX idx_abc_analysis_date (analysis_date)
);
```

#### 5.4. demand_forecasts
**Mục đích**: Dự báo nhu cầu  
**Epic**: EPIC-002 Feature 12

```sql
CREATE TABLE demand_forecasts (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    forecast_date DATE NOT NULL,
    forecast_period ENUM('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    forecasted_quantity DECIMAL(10,3) NOT NULL,
    confidence_level DECIMAL(5,2) NULL,
    forecast_method VARCHAR(50) NULL,
    actual_quantity DECIMAL(10,3) NULL,
    accuracy_percentage DECIMAL(5,2) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    INDEX idx_forecasts_product (product_id),
    INDEX idx_forecasts_warehouse (warehouse_id),
    INDEX idx_forecasts_date (forecast_date)
);
```

---

### 6. HR Management Tables

#### 6.1. employees
**Mục đích**: Quản lý thông tin nhân viên  
**Epic**: EPIC-008 Feature 1  
**Business Rule**: BR-HR-001

```sql
CREATE TABLE employees (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NULL UNIQUE COMMENT 'Link to users table - one-to-one relationship',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) STORED,
    date_of_birth DATE NOT NULL,
    id_number VARCHAR(20) NOT NULL UNIQUE COMMENT 'CMND/CCCD',
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NULL,
    photo_url VARCHAR(500) NULL,
    emergency_contact_name VARCHAR(100) NULL,
    emergency_contact_phone VARCHAR(20) NULL,
    bank_account VARCHAR(50) NULL,
    bank_name VARCHAR(100) NULL,
    tax_code VARCHAR(20) NULL,
    department_id INT NULL,
    position_id INT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
    employment_start_date DATE NULL,
    employment_end_date DATE NULL,
    termination_reason TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
    INDEX idx_employees_code (employee_code),
    INDEX idx_employees_user (user_id),
    INDEX idx_employees_email (email),
    INDEX idx_employees_id_number (id_number),
    INDEX idx_employees_status (status),
    INDEX idx_employees_department (department_id),
    INDEX idx_employees_position (position_id)
) COMMENT='Employee information and profile management';
```

#### 6.2. departments
**Mục đích**: Quản lý phòng ban với cấu trúc phân cấp  
**Epic**: EPIC-008 Feature 2  
**Business Rule**: BR-HR-003

```sql
CREATE TABLE departments (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    department_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    parent_department_id INT NULL,
    manager_id INT NULL COMMENT 'Employee ID of department manager',
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    FOREIGN KEY (parent_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_departments_code (department_code),
    INDEX idx_departments_parent (parent_department_id),
    INDEX idx_departments_manager (manager_id),
    INDEX idx_departments_status (status),
    CHECK (parent_department_id != id) COMMENT 'Prevent self-reference'
) COMMENT='Department management with hierarchical structure';
```

#### 6.3. positions
**Mục đích**: Quản lý chức vụ và cấp độ  
**Epic**: EPIC-008 Feature 3  
**Business Rule**: BR-HR-004

```sql
CREATE TABLE positions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    position_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    level INT NOT NULL DEFAULT 1 COMMENT 'Position level 1-10',
    department_id INT NULL COMMENT 'NULL for company-wide positions',
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_positions_code (position_code),
    INDEX idx_positions_level (level),
    INDEX idx_positions_department (department_id),
    INDEX idx_positions_status (status),
    CHECK (level >= 1 AND level <= 10)
) COMMENT='Position and job role management';
```

#### 6.4. employee_contracts
**Mục đích**: Quản lý hợp đồng lao động  
**Epic**: EPIC-008 Feature 4  
**Business Rule**: BR-HR-005

```sql
CREATE TABLE employee_contracts (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    contract_number VARCHAR(50) NOT NULL UNIQUE,
    employee_id INT NOT NULL,
    contract_type ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL COMMENT 'NULL for indefinite contracts',
    contract_value DECIMAL(15,2) NULL,
    auto_renewal BOOLEAN NOT NULL DEFAULT FALSE,
    terms_conditions TEXT NULL,
    status ENUM('DRAFT', 'ACTIVE', 'EXPIRED', 'RENEWED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    renewed_from_contract_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (renewed_from_contract_id) REFERENCES employee_contracts(id) ON DELETE SET NULL,
    INDEX idx_contracts_number (contract_number),
    INDEX idx_contracts_employee (employee_id),
    INDEX idx_contracts_type (contract_type),
    INDEX idx_contracts_status (status),
    INDEX idx_contracts_dates (start_date, end_date),
    CHECK (end_date IS NULL OR end_date >= start_date)
) COMMENT='Employee contract management';
```

#### 6.5. attendance_records
**Mục đích**: Quản lý chấm công hàng ngày  
**Epic**: EPIC-008 Feature 5  
**Business Rule**: BR-HR-006

```sql
CREATE TABLE attendance_records (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in_time TIME NULL,
    check_out_time TIME NULL,
    break_duration_minutes INT NULL DEFAULT 0,
    working_hours DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN check_in_time IS NOT NULL AND check_out_time IS NOT NULL 
            THEN TIMESTAMPDIFF(MINUTE, check_in_time, check_out_time) / 60.0 - COALESCE(break_duration_minutes, 0) / 60.0
            ELSE 0
        END
    ) STORED,
    overtime_hours DECIMAL(5,2) GENERATED ALWAYS AS (
        GREATEST(0, working_hours - 8.0)
    ) STORED,
    is_late BOOLEAN GENERATED ALWAYS AS (
        check_in_time > '09:00:00'
    ) STORED,
    is_early_leave BOOLEAN GENERATED ALWAYS AS (
        check_out_time < '17:00:00' AND check_out_time IS NOT NULL
    ) STORED,
    is_missing BOOLEAN GENERATED ALWAYS AS (
        check_in_time IS NULL OR check_out_time IS NULL
    ) STORED,
    location VARCHAR(255) NULL COMMENT 'GPS location if available',
    late_reason TEXT NULL,
    early_leave_reason TEXT NULL,
    missing_reason TEXT NULL,
    status ENUM('CHECKED_IN', 'COMPLETED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'CHECKED_IN',
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    UNIQUE KEY uk_attendance_employee_date (employee_id, attendance_date),
    INDEX idx_attendance_employee (employee_id),
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_attendance_status (status),
    CHECK (check_out_time IS NULL OR check_out_time >= check_in_time)
) COMMENT='Daily attendance tracking with check-in/check-out';
```

#### 6.6. leave_types
**Mục đích**: Danh mục loại nghỉ phép  
**Epic**: EPIC-008 Feature 6

```sql
CREATE TABLE leave_types (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    requires_balance BOOLEAN NOT NULL DEFAULT TRUE,
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    requires_medical_certificate BOOLEAN NOT NULL DEFAULT FALSE,
    max_days_per_request INT NULL COMMENT 'NULL for unlimited',
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_leave_types_code (code),
    INDEX idx_leave_types_active (is_active)
) COMMENT='Leave types catalog';
```

#### 6.7. leave_requests
**Mục đích**: Quản lý yêu cầu nghỉ phép  
**Epic**: EPIC-008 Feature 6  
**Business Rule**: BR-HR-007

```sql
CREATE TABLE leave_requests (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_days INT GENERATED ALWAYS AS (DATEDIFF(end_date, start_date) + 1) STORED,
    reason TEXT NOT NULL,
    medical_certificate_url VARCHAR(500) NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'TAKEN') NOT NULL DEFAULT 'PENDING',
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    rejected_by INT NULL,
    rejected_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    cancelled_by INT NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (rejected_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (cancelled_by) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_leave_requests_number (request_number),
    INDEX idx_leave_requests_employee (employee_id),
    INDEX idx_leave_requests_type (leave_type_id),
    INDEX idx_leave_requests_status (status),
    INDEX idx_leave_requests_dates (start_date, end_date),
    CHECK (end_date >= start_date)
) COMMENT='Leave request management';
```

#### 6.8. leave_balances
**Mục đích**: Quản lý số ngày nghỉ phép còn lại của nhân viên  
**Epic**: EPIC-008 Feature 6  
**Business Rule**: BR-HR-007

```sql
CREATE TABLE leave_balances (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    balance_year YEAR NOT NULL,
    initial_balance DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Balance at start of year',
    used_balance DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Days used',
    current_balance DECIMAL(5,2) GENERATED ALWAYS AS (initial_balance - used_balance) STORED,
    carried_forward DECIMAL(5,2) NULL DEFAULT 0.00 COMMENT 'Balance from previous year',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE RESTRICT,
    UNIQUE KEY uk_leave_balance (employee_id, leave_type_id, balance_year),
    INDEX idx_leave_balances_employee (employee_id),
    INDEX idx_leave_balances_type (leave_type_id),
    INDEX idx_leave_balances_year (balance_year),
    CHECK (used_balance >= 0),
    CHECK (current_balance >= 0)
) COMMENT='Employee leave balance tracking';
```

---

## 🔧 Tables Cần Điều Chỉnh

### 1. customers
**Thay đổi**: Thêm các fields cho customer management

```sql
ALTER TABLE customers
ADD COLUMN status_id INT NULL AFTER is_active,
ADD COLUMN customer_type ENUM('COMPANY', 'INDIVIDUAL') NULL AFTER status_id,
ADD COLUMN rating DECIMAL(3,2) NULL DEFAULT 0.00,
ADD COLUMN total_orders INT NULL DEFAULT 0,
ADD COLUMN total_spent DECIMAL(15,2) NULL DEFAULT 0.00,
ADD COLUMN last_order_date DATE NULL,
ADD FOREIGN KEY (status_id) REFERENCES cat_customer_status(id),
ADD INDEX idx_customers_status (status_id),
ADD INDEX idx_customers_type (customer_type);
```

### 2. sales_orders
**Thay đổi**: Thêm order_type field

```sql
ALTER TABLE sales_orders
ADD COLUMN order_type ENUM('RETAIL', 'WHOLESALE', 'FOC', 'GIFT', 'DEMO', 'CONSIGNMENT', 'SAMPLE', 'RETURN') 
    NOT NULL DEFAULT 'RETAIL' AFTER status,
ADD INDEX idx_sales_orders_type (order_type);
```

### 3. inventory
**Thay đổi**: Thêm safety_stock và reorder_point (hoặc tách ra table riêng - đã tạo ở trên)

```sql
ALTER TABLE inventory
ADD COLUMN safety_stock DECIMAL(10,3) NULL DEFAULT 0.000 AFTER reorder_quantity,
ADD COLUMN reorder_point DECIMAL(10,3) NULL DEFAULT 0.000 AFTER safety_stock;
```

**Note**: Có thể giữ trong `inventory` hoặc sử dụng `safety_stock_settings` và `reorder_points` tables riêng. Khuyến nghị sử dụng tables riêng để linh hoạt hơn.

### 4. product_prices
**Thay đổi**: Thêm các fields cho multi-tier pricing system

```sql
ALTER TABLE product_prices
ADD COLUMN price_type ENUM('STANDARD', 'CUSTOMER', 'CUSTOMER_GROUP', 'CONTRACT', 'VOLUME') 
    NOT NULL DEFAULT 'STANDARD' AFTER document_price,
ADD COLUMN customer_id INT NULL AFTER price_type,
ADD COLUMN customer_group_id INT NULL AFTER customer_id,
ADD COLUMN contract_id INT NULL AFTER customer_group_id,
ADD COLUMN min_quantity DECIMAL(10,3) NULL AFTER contract_id,
ADD COLUMN max_quantity DECIMAL(10,3) NULL AFTER min_quantity,
ADD COLUMN discount_percentage DECIMAL(5,2) NULL AFTER max_quantity,
ADD COLUMN discount_amount DECIMAL(15,2) NULL AFTER discount_percentage,
ADD COLUMN valid_from DATE NULL AFTER discount_amount,
ADD COLUMN valid_to DATE NULL AFTER valid_from,
ADD INDEX idx_product_prices_type (price_type),
ADD INDEX idx_product_prices_customer (customer_id),
ADD INDEX idx_product_prices_product_type (product_id, price_type),
ADD INDEX idx_product_prices_product_customer (product_id, price_type, customer_id);
```

**Note**: 
- Table `product_prices` được consolidate để hỗ trợ tất cả các loại pricing trong một table thay vì tách thành nhiều tables (`customer_prices`, `volume_prices`, `contract_prices`)
- `price_type` xác định loại pricing: STANDARD, CUSTOMER, CUSTOMER_GROUP, CONTRACT, VOLUME
- Các fields `customer_id`, `customer_group_id`, `contract_id`, `min_quantity`, `max_quantity` chỉ có giá trị khi `price_type` tương ứng

### 5. users
**Thay đổi**: Thêm employee_id để link với employees table

```sql
ALTER TABLE users
ADD COLUMN employee_id INT NULL UNIQUE AFTER id,
ADD FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
ADD INDEX idx_users_employee (employee_id);
```

**Note**: 
- `employee_id` là UNIQUE để đảm bảo one-to-one relationship
- `ON DELETE SET NULL` để khi employee bị xóa, user account vẫn tồn tại nhưng không link với employee nào

---

## 📋 Migration Plan

### Phase 1: Sales Management (Priority: High)
1. ✅ Create `quotes` table
2. ✅ Create `quote_items` table
3. ✅ Create `deliveries` table
4. ✅ Create `delivery_items` table
5. ✅ Alter `sales_orders` - add `order_type`

### Phase 2: Purchase Management (Priority: High)
1. ✅ Create `purchase_requisitions` table
2. ✅ Create `purchase_requisition_items` table
3. ✅ Create `rfqs` table
4. ✅ Create `rfq_items` table
5. ✅ Create `quality_inspections` table
6. ✅ Create `supplier_contracts` table

### Phase 3: Financial Management (Priority: Critical)
1. ✅ Create `payments` table
2. ✅ Create `payment_items` table
3. ✅ Create `accounts_receivable` table
4. ✅ Create `accounts_payable` table
5. ✅ Create `cash_flow` table
6. ✅ Create `credit_notes` table
7. ✅ Create `debit_notes` table
8. ✅ Create `taxes` table
9. ✅ Create `tax_rates` table
10. ✅ Create `currencies` table
11. ✅ Create `exchange_rates` table

### Phase 4: Customer Management (Priority: Medium)
1. ✅ Create `rfm_scores` table
2. ✅ Create `customer_support_tickets` table
3. ✅ Alter `customers` - add fields

### Phase 5: Inventory Management (Priority: Medium)
1. ✅ Create `safety_stock_settings` table
2. ✅ Create `reorder_points` table
3. ✅ Create `abc_analysis` table
4. ✅ Create `demand_forecasts` table
5. ✅ Alter `inventory` - add fields (optional)

### Phase 6: HR Management (Priority: Medium)
1. ✅ Create `leave_types` table (reference data)
2. ✅ Create `departments` table
3. ✅ Create `positions` table
4. ✅ Create `employees` table
5. ✅ Create `employee_contracts` table
6. ✅ Create `attendance_records` table
7. ✅ Create `leave_requests` table
8. ✅ Create `leave_balances` table
9. ✅ Alter `users` table - add `employee_id` field

---

## 🔍 Indexes Strategy

### Primary Indexes (Foreign Keys)
- Tất cả foreign keys đều có indexes
- Composite indexes cho các queries thường dùng

### Query Optimization Indexes
- Date fields: `created_at`, `updated_at`, `date` fields
- Status fields: `status`, `order_type`, etc.
- Search fields: `code`, `number`, `name`

### Composite Indexes
- `(customer_id, status)` cho customer queries
- `(product_id, warehouse_id)` cho inventory queries
- `(invoice_id, status)` cho financial queries

---

## 🔐 Constraints & Data Integrity

### Foreign Key Constraints
- Tất cả foreign keys có `ON DELETE` và `ON UPDATE` rules phù hợp
- `CASCADE` cho child records khi parent bị xóa
- `RESTRICT` cho critical relationships
- `SET NULL` cho optional relationships

### Unique Constraints
- Business keys: `code`, `number` fields
- Composite unique: `(product_id, warehouse_id)` cho inventory

### Check Constraints
- `quantity >= 0` cho inventory quantities
- `amount >= 0` cho financial amounts
- `percentage >= 0 AND <= 100` cho discount/tax percentages

---

## 📊 Performance Considerations

### Partitioning Strategy
- Có thể partition các tables lớn theo date:
  - `inventory_movements` by `created_at`
  - `payments` by `payment_date`
  - `cash_flow` by `flow_date`

### Archiving Strategy
- Archive old records (> 2 years) cho:
  - `inventory_movements`
  - `payment_items`
  - `cash_flow`

### Caching Strategy
- Cache reference data: `currencies`, `taxes`, `payment_methods`
- Cache calculated values: `rfm_scores`, `abc_analysis`

---

## 🔄 Backup & Recovery

### Backup Strategy
- Daily full backup
- Transaction log backup every 6 hours
- Point-in-time recovery support

### Recovery Procedures
- Document recovery procedures
- Test recovery regularly
- Maintain backup retention policy

---

## 📝 Notes

1. **UUID vs INT**: Sử dụng UUID (VARCHAR(36)) cho các tables mới để hỗ trợ distributed systems tốt hơn
2. **Audit Fields**: Tất cả tables đều có `created_at`, `updated_at`, `created_by`, `updated_by`
3. **Soft Delete**: Cân nhắc thêm `deleted_at` cho soft delete
4. **Versioning**: Có thể cần versioning cho critical tables (contracts, prices)

---

**Last Updated**: November 2025  
**Next Review**: December 2025  
**Version**: 5.0

