# Database Mapping - DigiERP System

## 📋 Tổng Quan

Database Mapping này cung cấp mapping chi tiết giữa Epic/Features và Database Tables trong hệ thống DigiERP.

**Database**: `Hien_DigiERP_LeHuy_Dev2` (MySQL 8.0)

**Mục đích:**
- Xác định tables nào phục vụ feature nào
- Hiểu data model cho mỗi epic
- Impact analysis khi thay đổi schema
- Migration planning

**Last Updated**: November 2025  
**Version**: 1.0

---

## 📊 Epic → Database Tables Mapping

### EPIC-001: Product Management

**Primary Tables**: `products`, `cat_product_categories`, `product_prices`

| Feature | Database Tables | Description |
|---------|----------------|-------------|
| Product Information Management | `products` | Main product table |
| Product Categories Management | `cat_product_categories` | Product categories hierarchy |
| Product Catalog for Aquaculture | `products`, `cat_product_categories` | Product catalog |
| Brand & Model Management | `products`, `brands`, `models` | Brand and model info |
| Unit & Packaging Management | `products`, `units`, `packaging` | Unit and packaging |
| Multi-tier Pricing System | `product_prices` | Multi-tier pricing (consolidated table với price_type field) |
| Product Status & Stock Status | `products`, `inventory` | Product and stock status |
| Batch & Expiry Date Management | `products`, `batches`, `batch_expiry` | Batch management |
| Material & Packaging Type | `products`, `materials`, `packaging_types` | Material and packaging |

**Key Tables:**
- `products` - Main product information
- `cat_product_categories` - Product categories
- `product_prices` - Multi-tier pricing table với các loại:
  - **STANDARD**: Standard pricing (`price_type = 'STANDARD'`)
  - **CUSTOMER**: Customer-specific pricing (`price_type = 'CUSTOMER'`, `customer_id` not null)
  - **CUSTOMER_GROUP**: Customer group pricing (`price_type = 'CUSTOMER_GROUP'`, `customer_group_id` not null)
  - **CONTRACT**: Contract-based pricing (`price_type = 'CONTRACT'`, `contract_id` not null)
  - **VOLUME**: Volume-based pricing (`price_type = 'VOLUME'`, `min_quantity`/`max_quantity` not null)
- `brands` - Brand information
- `models` - Model information
- `units` - Unit of measurement
- `packaging` - Packaging information
- `batches` - Batch tracking
- `materials` - Material types
- `packaging_types` - Packaging types

---

### EPIC-002: Inventory Management

**Primary Tables**: `inventory`, `inventory_movements`, `warehouses`, `areas`, `locations`

| Feature | Database Tables | Description |
|---------|----------------|-------------|
| Warehouse Management | `warehouses` | Warehouse information |
| Area & Location Management | `areas`, `locations` | Area and location in warehouse |
| Inventory Tracking & Movements | `inventory`, `inventory_movements` | Inventory tracking |
| Goods Receipt Management | `goods_receipts`, `goods_receipt_items`, `inventory_movements` | Goods receipt |
| Goods Issue Management | `goods_issues`, `goods_issue_items`, `inventory_movements` | Goods issue |
| Inventory Counting & Adjustment | `inventory_adjustments`, `inventory_movements` | Inventory adjustments |
| Inventory Transfer Management | `inventory_transfers`, `inventory_movements` | Inventory transfers |
| Inventory Revaluation | `inventory`, `inventory_valuations` | Inventory revaluation |
| Safety Stock Management | `products`, `safety_stock_settings` | Safety stock |
| Reorder Point Automation | `products`, `reorder_points` | Reorder points |
| ABC Analysis | `products`, `abc_analysis` | ABC analysis results |
| Demand Forecasting | `products`, `demand_forecasts` | Demand forecasts |

**Key Tables:**
- `inventory` - Current inventory levels
- `inventory_movements` - All inventory movements (IN, OUT, TRANSFER, ADJUSTMENT)
- `warehouses` - Warehouse information
- `areas` - Areas within warehouses
- `locations` - Specific locations in areas
- `goods_receipts` - Goods receipt documents
- `goods_receipt_items` - Goods receipt line items
- `goods_issues` - Goods issue documents
- `goods_issue_items` - Goods issue line items
- `inventory_adjustments` - Inventory adjustment documents
- `inventory_transfers` - Inventory transfer documents
- `inventory_valuations` - Inventory valuation records
- `safety_stock_settings` - Safety stock configuration
- `reorder_points` - Reorder point settings
- `abc_analysis` - ABC analysis results
- `demand_forecasts` - Demand forecast data

---

### EPIC-003: Customer Management

**Primary Tables**: `customers`, `customer_companies`, `customer_contacts`, `customer_contracts`

| Feature | Database Tables | Description |
|---------|----------------|-------------|
| Customer Information Management | `customers`, `customer_companies` | Customer information |
| Customer Segmentation | `customers`, `customer_segments` | Customer segments |
| Customer Contacts Management | `customer_contacts` | Customer contacts |
| Contract Management | `customer_contracts` | Customer contracts |
| 360° Customer View | `customers`, `sales_orders`, `invoices`, `payments` | Aggregated customer data |
| Customer Status Management | `customers` | Customer status |
| Customer Audit Trail | `customers`, `customer_audit_logs` | Customer audit logs |
| RFM Analysis | `customers`, `rfm_scores` | RFM analysis |
| Customer Support Management | `customer_support_tickets` | Support tickets |

**Key Tables:**
- `customers` - Main customer table
- `customer_companies` - Company information
- `customer_contacts` - Contact persons
- `customer_contracts` - Customer contracts
- `customer_segments` - Customer segments
- `customer_audit_logs` - Audit trail
- `rfm_scores` - RFM analysis scores
- `customer_support_tickets` - Support tickets

---

### EPIC-004: Sales Management

**Primary Tables**: `sales_orders`, `sales_order_items`, `quotes`, `quote_items`, `deliveries`

| Feature | Database Tables | Description |
|---------|----------------|-------------|
| Quote Generation & Management | `quotes`, `quote_items` | Quote management |
| Order Management | `sales_orders`, `sales_order_items` | Sales order management |
| Multiple Order Types Management | `sales_orders` | Order types |
| Pricing Engine Integration | `sales_order_items`, `product_prices` | Price calculation |
| Credit Management | `customers`, `sales_orders`, `invoices` | Credit limit checking |
| Order Status Tracking | `sales_orders` | Order status |
| Delivery & Logistics Management | `deliveries`, `delivery_items` | Delivery management |
| Delivery Documentation | `deliveries`, `delivery_documents` | Delivery documents |
| Sales Analytics & Reporting | `sales_orders`, `sales_reports` | Sales reports |
| Customer Analytics Integration | `sales_orders`, `customers` | Customer analytics |

**Key Tables:**
- `sales_orders` - Sales order header
- `sales_order_items` - Sales order line items
- `quotes` - Quote header
- `quote_items` - Quote line items
- `deliveries` - Delivery documents
- `delivery_items` - Delivery line items
- `delivery_documents` - Delivery documents (PDF, etc.)
- `sales_reports` - Sales report data

---

### EPIC-005: Purchase Management

**Primary Tables**: `purchase_orders`, `purchase_order_items`, `suppliers`, `goods_receipts`

| Feature | Database Tables | Description |
|---------|----------------|-------------|
| Supplier Management | `suppliers`, `supplier_companies` | Supplier information |
| Supplier Qualification & Performance | `suppliers`, `supplier_performance` | Supplier performance |
| Purchase Requisition Workflow | `purchase_requisitions`, `purchase_requisition_items` | Purchase requisitions |
| RFQ/RFP Management | `rfqs`, `rfq_items` | RFQ/RFP management |
| Purchase Order Management | `purchase_orders`, `purchase_order_items` | Purchase order management |
| Purchase Order Items Management | `purchase_order_items` | PO items |
| Goods Receipt Processing | `goods_receipts`, `goods_receipt_items` | Goods receipt |
| Quality Inspection Integration | `quality_inspections` | Quality inspections |
| Invoice Matching (3-way Matching) | `purchase_orders`, `invoices`, `invoice_matching` | Invoice matching |
| Supplier Contract Management | `supplier_contracts` | Supplier contracts |

**Key Tables:**
- `purchase_orders` - Purchase order header
- `purchase_order_items` - Purchase order line items
- `suppliers` - Supplier information
- `supplier_companies` - Supplier company information
- `supplier_performance` - Supplier performance metrics
- `purchase_requisitions` - Purchase requisition header
- `purchase_requisition_items` - Purchase requisition items
- `rfqs` - RFQ header
- `rfq_items` - RFQ items
- `goods_receipts` - Goods receipt documents
- `goods_receipt_items` - Goods receipt items
- `quality_inspections` - Quality inspection records
- `invoice_matching` - Invoice matching records
- `supplier_contracts` - Supplier contracts

---

### EPIC-006: Financial Management

**Primary Tables**: `invoices`, `invoice_items`, `payments`, `payment_items`

| Feature | Database Tables | Description |
|---------|----------------|-------------|
| Invoice Management | `invoices`, `invoice_items` | Invoice management |
| Invoice Items Management | `invoice_items` | Invoice items |
| Payment Processing & Tracking | `payments`, `payment_items` | Payment processing |
| Accounts Receivable Management | `accounts_receivable`, `aging_reports` | AR management |
| Accounts Payable Management | `accounts_payable`, `aging_reports` | AP management |
| Cash Flow Management | `cash_flow`, `cash_flow_items` | Cash flow tracking |
| Financial Reporting | `financial_reports` | Financial reports |
| Invoice Status Management | `invoices` | Invoice status |
| Credit Note & Debit Note | `credit_notes`, `debit_notes` | Credit/debit notes |
| Payment Method Management | `payment_methods` | Payment methods |
| Tax Management | `taxes`, `tax_rates` | Tax management |
| Multi-currency Support | `currencies`, `exchange_rates` | Currency management |

**Key Tables:**
- `invoices` - Invoice header
- `invoice_items` - Invoice line items
- `payments` - Payment records
- `payment_items` - Payment line items
- `accounts_receivable` - AR records
- `accounts_payable` - AP records
- `aging_reports` - Aging analysis reports
- `cash_flow` - Cash flow records
- `cash_flow_items` - Cash flow line items
- `financial_reports` - Financial report data
- `credit_notes` - Credit note records
- `debit_notes` - Debit note records
- `payment_methods` - Payment method configuration
- `taxes` - Tax configuration
- `tax_rates` - Tax rate configuration
- `currencies` - Currency information
- `exchange_rates` - Exchange rate records

---

### EPIC-007: Analytics & Business Intelligence

**Primary Tables**: All tables (read-only for analytics)

| Feature | Database Tables | Description |
|---------|----------------|-------------|
| Real-time Dashboard | All tables | Dashboard aggregation |
| Sales Analytics & Reporting | `sales_orders`, `sales_order_items`, `sales_reports` | Sales analytics |
| Inventory Analytics | `inventory`, `inventory_movements` | Inventory analytics |
| Customer Analytics | `customers`, `sales_orders` | Customer analytics |
| Financial Analytics | `invoices`, `payments` | Financial analytics |
| Predictive Analytics | All tables | Predictive models |
| Custom Reports Builder | All tables | Report builder |
| Data Export & Integration | All tables | Data export |

**Key Tables:**
- All tables for read-only analytics queries
- `sales_reports` - Pre-calculated sales reports
- `financial_reports` - Pre-calculated financial reports
- `analytics_cache` - Cached analytics data (if implemented)

---

### EPIC-008: HR Management

**Primary Tables**: `employees`, `departments`, `positions`, `attendance_records`

| Feature | Database Tables | Description |
|---------|----------------|-------------|
| Employee Management | `employees`, `users` | Employee information |
| Department Management | `departments` | Department information |
| Position Management | `positions` | Position information |
| Contract Management | `employee_contracts` | Employee contracts |
| Attendance Management | `attendance_records` | Attendance tracking |
| Leave Management | `leave_requests`, `leave_balances` | Leave management |
| Employee Self-Service | `employees`, `users` | Employee portal |
| HR Reporting | `employees`, `hr_reports` | HR reports |

**Key Tables:**
- `employees` - Employee information
- `departments` - Department information
- `positions` - Position information
- `employee_contracts` - Employee contracts
- `attendance_records` - Attendance records
- `leave_requests` - Leave request records
- `leave_balances` - Leave balance records
- `hr_reports` - HR report data

---

### EPIC-009: System Integration & Infrastructure

**Primary Tables**: `users`, `sessions`, `api_keys`, `system_logs`

| Feature | Database Tables | Description |
|---------|----------------|-------------|
| Single Sign-On (SSO) | `users`, `sessions` | SSO authentication |
| Payment Gateway Integration | `payments`, `payment_gateways` | Payment processing |
| Email & Communication | `email_logs` | Email logs |
| Zalo Business Integration | `zalo_messages` | Zalo messages |
| E-commerce Integration | `ecommerce_sync` | E-commerce sync |
| Accounting System Integration | `accounting_sync` | Accounting sync |
| API Management & Security | `api_keys`, `api_logs` | API security |
| Monitoring & Logging | `system_logs`, `metrics` | System monitoring |
| Data Backup & Recovery | `backup_logs` | Backup logs |
| IoT & Hardware Integration | `iot_devices`, `iot_data` | IoT integration |

**Key Tables:**
- `users` - User accounts
- `sessions` - User sessions
- `api_keys` - API key management
- `api_logs` - API access logs
- `system_logs` - System logs
- `metrics` - System metrics
- `email_logs` - Email logs
- `zalo_messages` - Zalo message logs
- `ecommerce_sync` - E-commerce sync records
- `accounting_sync` - Accounting sync records
- `backup_logs` - Backup log records
- `iot_devices` - IoT device information
- `iot_data` - IoT data records

---

## 🔗 Table Relationships

### Core Relationships

```
products
  ├── cat_product_categories (category_id)
  ├── brands (brand_id)
  ├── models (model_id)
  ├── units (unit_id)
  └── product_prices (product_id)

inventory
  ├── products (product_id)
  ├── warehouses (warehouse_id)
  └── inventory_movements (inventory_id)

sales_orders
  ├── customers (customer_id)
  └── sales_order_items (order_id)
      └── products (product_id)

purchase_orders
  ├── suppliers (supplier_id)
  └── purchase_order_items (order_id)
      └── products (product_id)

invoices
  ├── customers (customer_id) [AR]
  ├── suppliers (supplier_id) [AP]
  └── invoice_items (invoice_id)
      └── products (product_id)

goods_receipts
  ├── purchase_orders (purchase_order_id)
  └── goods_receipt_items (receipt_id)
      └── products (product_id)

goods_issues
  ├── sales_orders (sales_order_id)
  └── goods_issue_items (issue_id)
      └── products (product_id)
```

---

## 📝 Ghi Chú

- **Primary Tables**: Tables chính cho epic/feature
- **Foreign Keys**: Relationships giữa tables
- **Indexes**: Cần indexes cho foreign keys và columns thường query
- **Audit Fields**: Tất cả tables nên có `created_at`, `updated_at`, `created_by`, `updated_by`

---

**Last Updated**: November 2025  
**Version**: 1.0

