# Traceability Matrix - DigiERP System

## 📋 Tổng Quan

Traceability Matrix này cung cấp mapping đầy đủ từ Epic → Features → User Stories → Use Cases → Business Rules → Services → Database Tables → API Endpoints.

**Mục đích:**
- Impact Analysis: Xác định ảnh hưởng khi thay đổi requirements
- Coverage Tracking: Đảm bảo mọi requirement được implement
- Dependency Management: Hiểu dependencies giữa components
- Testing Traceability: Map test cases với requirements

**Last Updated**: November 2025  
**Version**: 1.0

---

## 📊 Cấu Trúc Traceability

```
Epic (EPIC-XXX)
  └── Feature (FEAT-XXX-YYY)
      └── User Story (US-XXX-YYY-ZZZ)
          └── Use Case (UC-XXX-YYY-ZZZ)
              └── Business Rule (BR-XXX-YYY-ZZZ)
                  └── Service (service-name)
                      └── Database Tables
                          └── API Endpoints
```

---

## 🔗 Epic Mapping

### EPIC-001: Product Management

| Feature ID | Feature Name | User Stories | Use Cases | Business Rules | Services | Database Tables |
|------------|--------------|--------------|-----------|----------------|----------|-----------------|
| FEAT-001-001 | Product Information Management | US-001-001-001 to US-001-001-003 | - | BR-001-001 to BR-001-003 | product-service | products, cat_product_categories |
| FEAT-001-002 | Product Categories Management | US-001-002-001 to US-001-002-002 | - | BR-001-004 to BR-001-006 | product-service | cat_product_categories |
| FEAT-001-003 | Product Catalog for Aquaculture | US-001-003-001 to US-001-003-002 | - | BR-001-007 to BR-001-009 | product-service | products, cat_product_categories |
| FEAT-001-004 | Brand & Model Management | US-001-004-001 to US-001-004-002 | - | BR-001-010 to BR-001-012 | product-service | products, brands, models |
| FEAT-001-005 | Unit & Packaging Management | US-001-005-001 to US-001-005-003 | - | BR-001-013 to BR-001-015 | product-service | products, units, packaging |
| FEAT-001-006 | Multi-tier Pricing System | US-001-006-001 to US-001-006-004 | UC-001-006-001 to UC-001-006-005 | BR-001-016 to BR-001-019 | product-service | product_prices, customer_prices, volume_prices |
| FEAT-001-007 | Product Status & Stock Status | US-001-007-001 to US-001-007-002 | - | BR-001-020 to BR-001-022 | product-service, inventory-service | products, inventory |
| FEAT-001-008 | Batch & Expiry Date Management | US-001-008-001 to US-001-008-003 | - | BR-001-023 to BR-001-025 | product-service | products, batches |
| FEAT-001-009 | Material & Packaging Type | US-001-009-001 to US-001-009-002 | - | BR-001-026 to BR-001-028 | product-service | products, materials, packaging_types |

**Related Documents:**
- Epic: [epic-product-management.md](./product-owner/epic-product-management.md)
- Use Cases: [use-cases-multi-tier-pricing.md](./business-analyst/use-cases-multi-tier-pricing.md)
- Business Rules: [business-rules-product-management.md](./business-analyst/business-rules-product-management.md)
- Requirements: [requirements-multi-tier-pricing.md](./business-analyst/requirements-multi-tier-pricing.md)

---

### EPIC-002: Inventory Management

| Feature ID | Feature Name | User Stories | Use Cases | Business Rules | Services | Database Tables |
|------------|--------------|--------------|-----------|----------------|----------|-----------------|
| FEAT-002-001 | Warehouse Management | US-002-001-001 to US-002-001-002 | - | BR-002-001 to BR-002-003 | inventory-service | warehouses |
| FEAT-002-002 | Area & Location Management | US-002-002-001 to US-002-002-002 | - | BR-002-004 to BR-002-006 | inventory-service | areas, locations |
| FEAT-002-003 | Inventory Tracking & Movements | US-002-003-001 to US-002-003-003 | - | BR-002-007 to BR-002-010 | inventory-service | inventory, inventory_movements |
| FEAT-002-004 | Goods Receipt Management | US-002-004-001 to US-002-004-003 | UC-GR-001 to UC-GR-004 | BR-002-011 to BR-002-014 | inventory-service, purchase-service | goods_receipts, goods_receipt_items, inventory_movements |
| FEAT-002-005 | Goods Issue Management | US-002-005-001 to US-002-005-003 | - | BR-002-015 to BR-002-018 | inventory-service, sales-service | goods_issues, goods_issue_items, inventory_movements |
| FEAT-002-006 | Inventory Counting & Adjustment | US-002-006-001 to US-002-006-002 | - | BR-002-019 to BR-002-021 | inventory-service | inventory_adjustments, inventory_movements |
| FEAT-002-007 | Inventory Transfer Management | US-002-007-001 to US-002-007-002 | - | BR-002-022 to BR-002-024 | inventory-service | inventory_transfers, inventory_movements |
| FEAT-002-008 | Inventory Revaluation | US-002-008-001 to US-002-008-002 | - | BR-002-025 to BR-002-027 | inventory-service, financial-service | inventory, inventory_valuations |
| FEAT-002-009 | Safety Stock Management | US-002-009-001 to US-002-009-002 | - | BR-002-028 to BR-002-030 | inventory-service | products, safety_stock_settings |
| FEAT-002-010 | Reorder Point Automation | US-002-010-001 to US-002-010-002 | - | BR-002-031 to BR-002-033 | inventory-service | products, reorder_points |
| FEAT-002-011 | ABC Analysis | US-002-011-001 to US-002-011-002 | - | BR-002-034 to BR-002-036 | inventory-service | products, abc_analysis |
| FEAT-002-012 | Demand Forecasting | US-002-012-001 to US-002-012-002 | - | BR-002-037 to BR-002-039 | inventory-service | products, demand_forecasts |

**Related Documents:**
- Epic: [epic-inventory-management.md](./product-owner/epic-inventory-management.md)
- Use Cases: [use-cases-goods-receipt.md](./business-analyst/use-cases-goods-receipt.md)
- Business Rules: [business-rules-inventory-management.md](./business-analyst/business-rules-inventory-management.md)

---

### EPIC-003: Customer Management

| Feature ID | Feature Name | User Stories | Use Cases | Business Rules | Services | Database Tables |
|------------|--------------|--------------|-----------|----------------|----------|-----------------|
| FEAT-003-001 | Customer Information Management | US-003-001-001 to US-003-001-003 | - | BR-003-001 to BR-003-003 | customer-service | customers, customer_companies |
| FEAT-003-002 | Customer Segmentation | US-003-002-001 to US-003-002-002 | - | BR-003-004 to BR-003-006 | customer-service | customers, customer_segments |
| FEAT-003-003 | Customer Contacts Management | US-003-003-001 to US-003-003-002 | - | BR-003-007 to BR-003-009 | customer-service | customer_contacts |
| FEAT-003-004 | Contract Management | US-003-004-001 to US-003-004-003 | - | BR-003-010 to BR-003-012 | customer-service | customer_contracts |
| FEAT-003-005 | 360° Customer View | US-003-005-001 to US-003-005-002 | - | BR-003-013 to BR-003-015 | customer-service, sales-service, financial-service | customers, sales_orders, invoices |
| FEAT-003-006 | Customer Status Management | US-003-006-001 to US-003-006-002 | - | BR-003-016 to BR-003-018 | customer-service | customers |
| FEAT-003-007 | Customer Audit Trail | US-003-007-001 to US-003-007-002 | - | BR-003-019 to BR-003-021 | customer-service | customers, customer_audit_logs |
| FEAT-003-008 | RFM Analysis | US-003-008-001 to US-003-008-002 | - | BR-003-022 to BR-003-024 | customer-service, sales-service | customers, rfm_scores |
| FEAT-003-009 | Customer Support Management | US-003-009-001 to US-003-009-002 | - | BR-003-025 to BR-003-027 | customer-service | customer_support_tickets |

**Related Documents:**
- Epic: [epic-customer-management.md](./product-owner/epic-customer-management.md)

---

### EPIC-004: Sales Management

| Feature ID | Feature Name | User Stories | Use Cases | Business Rules | Services | Database Tables |
|------------|--------------|--------------|-----------|----------------|----------|-----------------|
| FEAT-004-001 | Quote Generation & Management | US-004-001-001 to US-004-001-003 | - | BR-004-001 to BR-004-003 | sales-service | quotes, quote_items |
| FEAT-004-002 | Order Management | US-004-002-001 to US-004-002-003 | - | BR-004-004 to BR-004-007 | sales-service | sales_orders, sales_order_items |
| FEAT-004-003 | Multiple Order Types Management | US-004-003-001 to US-004-003-002 | - | BR-004-008 to BR-004-010 | sales-service | sales_orders |
| FEAT-004-004 | Pricing Engine Integration | US-004-004-001 to US-004-004-003 | - | BR-004-011 to BR-004-013 | sales-service, product-service | sales_order_items, product_prices |
| FEAT-004-005 | Credit Management | US-004-005-001 to US-004-005-003 | - | BR-004-014 to BR-004-016 | sales-service, customer-service, financial-service | customers, sales_orders, invoices |
| FEAT-004-006 | Order Status Tracking | US-004-006-001 to US-004-006-002 | - | BR-004-017 to BR-004-019 | sales-service | sales_orders |
| FEAT-004-007 | Delivery & Logistics Management | US-004-007-001 to US-004-007-003 | - | BR-004-020 to BR-004-022 | sales-service | deliveries, delivery_items |
| FEAT-004-008 | Delivery Documentation | US-004-008-001 to US-004-008-002 | - | BR-004-023 to BR-004-025 | sales-service | deliveries, delivery_documents |
| FEAT-004-009 | Sales Analytics & Reporting | US-004-009-001 to US-004-009-002 | - | BR-004-026 to BR-004-028 | sales-service | sales_orders, sales_reports |
| FEAT-004-010 | Customer Analytics Integration | US-004-010-001 to US-004-010-002 | - | BR-004-029 to BR-004-031 | sales-service, customer-service | sales_orders, customers |

**Related Documents:**
- Epic: [epic-sales-management.md](./product-owner/epic-sales-management.md)
- Business Rules: [business-rules-sales-management.md](./business-analyst/business-rules-sales-management.md)

---

### EPIC-005: Purchase Management

| Feature ID | Feature Name | User Stories | Use Cases | Business Rules | Services | Database Tables |
|------------|--------------|--------------|-----------|----------------|----------|-----------------|
| FEAT-005-001 | Supplier Management | US-005-001-001 to US-005-001-003 | - | BR-005-001 to BR-005-003 | purchase-service | suppliers, supplier_companies |
| FEAT-005-002 | Supplier Qualification & Performance | US-005-002-001 to US-005-002-002 | - | BR-005-004 to BR-005-006 | purchase-service | suppliers, supplier_performance |
| FEAT-005-003 | Purchase Requisition Workflow | US-005-003-001 to US-005-003-003 | - | BR-005-007 to BR-005-009 | purchase-service | purchase_requisitions, purchase_requisition_items |
| FEAT-005-004 | RFQ/RFP Management | US-005-004-001 to US-005-004-002 | - | BR-005-010 to BR-005-012 | purchase-service | rfqs, rfq_items |
| FEAT-005-005 | Purchase Order Management | US-005-005-001 to US-005-005-003 | - | BR-005-013 to BR-005-016 | purchase-service | purchase_orders, purchase_order_items |
| FEAT-005-006 | Purchase Order Items Management | US-005-006-001 to US-005-006-002 | - | BR-005-017 to BR-005-019 | purchase-service | purchase_order_items |
| FEAT-005-007 | Goods Receipt Processing | US-005-007-001 to US-005-007-003 | UC-GR-001 to UC-GR-004 | BR-005-020 to BR-005-022 | purchase-service, inventory-service | goods_receipts, goods_receipt_items |
| FEAT-005-008 | Quality Inspection Integration | US-005-008-001 to US-005-008-002 | - | BR-005-023 to BR-005-025 | purchase-service | quality_inspections |
| FEAT-005-009 | Invoice Matching (3-way Matching) | US-005-009-001 to US-005-009-003 | - | BR-005-026 to BR-005-028 | purchase-service, financial-service | purchase_orders, invoices, invoice_matching |
| FEAT-005-010 | Supplier Contract Management | US-005-010-001 to US-005-010-002 | - | BR-005-029 to BR-005-031 | purchase-service | supplier_contracts |

**Related Documents:**
- Epic: [epic-purchase-management.md](./product-owner/epic-purchase-management.md)

---

### EPIC-006: Financial Management

| Feature ID | Feature Name | User Stories | Use Cases | Business Rules | Services | Database Tables |
|------------|--------------|--------------|-----------|----------------|----------|-----------------|
| FEAT-006-001 | Invoice Management | US-006-001-001 to US-006-001-003 | - | BR-006-001 to BR-006-003 | financial-service | invoices, invoice_items |
| FEAT-006-002 | Invoice Items Management | US-006-002-001 to US-006-002-002 | - | BR-006-004 to BR-006-006 | financial-service | invoice_items |
| FEAT-006-003 | Payment Processing & Tracking | US-006-003-001 to US-006-003-003 | - | BR-006-007 to BR-006-010 | financial-service | payments, payment_items |
| FEAT-006-004 | Accounts Receivable Management | US-006-004-001 to US-006-004-002 | - | BR-006-011 to BR-006-013 | financial-service | accounts_receivable, aging_reports |
| FEAT-006-005 | Accounts Payable Management | US-006-005-001 to US-006-005-002 | - | BR-006-014 to BR-006-016 | financial-service | accounts_payable, aging_reports |
| FEAT-006-006 | Cash Flow Management | US-006-006-001 to US-006-006-002 | - | BR-006-017 to BR-006-019 | financial-service | cash_flow, cash_flow_items |
| FEAT-006-007 | Financial Reporting | US-006-007-001 to US-006-007-002 | - | BR-006-020 to BR-006-022 | financial-service | financial_reports |
| FEAT-006-008 | Invoice Status Management | US-006-008-001 to US-006-008-002 | - | BR-006-023 to BR-006-025 | financial-service | invoices |
| FEAT-006-009 | Credit Note & Debit Note | US-006-009-001 to US-006-009-002 | - | BR-006-026 to BR-006-028 | financial-service | credit_notes, debit_notes |
| FEAT-006-010 | Payment Method Management | US-006-010-001 to US-006-010-002 | - | BR-006-029 to BR-006-031 | financial-service | payment_methods |
| FEAT-006-011 | Tax Management | US-006-011-001 to US-006-011-002 | - | BR-006-032 to BR-006-034 | financial-service | taxes, tax_rates |
| FEAT-006-012 | Multi-currency Support | US-006-012-001 to US-006-012-002 | - | BR-006-035 to BR-006-037 | financial-service | currencies, exchange_rates |

**Related Documents:**
- Epic: [epic-financial-management.md](./product-owner/epic-financial-management.md)

---

### EPIC-007: Analytics & Business Intelligence

| Feature ID | Feature Name | User Stories | Use Cases | Business Rules | Services | Database Tables |
|------------|--------------|--------------|-----------|----------------|----------|-----------------|
| FEAT-007-001 | Real-time Dashboard | US-007-001-001 to US-007-001-002 | - | BR-007-001 to BR-007-003 | api-gateway, all services | All tables (read-only) |
| FEAT-007-002 | Sales Analytics & Reporting | US-007-002-001 to US-007-002-002 | - | BR-007-004 to BR-007-006 | sales-service, api-gateway | sales_orders, sales_reports |
| FEAT-007-003 | Inventory Analytics | US-007-003-001 to US-007-003-002 | - | BR-007-007 to BR-007-009 | inventory-service, api-gateway | inventory, inventory_movements |
| FEAT-007-004 | Customer Analytics | US-007-004-001 to US-007-004-002 | - | BR-007-010 to BR-007-012 | customer-service, sales-service | customers, sales_orders |
| FEAT-007-005 | Financial Analytics | US-007-005-001 to US-007-005-002 | - | BR-007-013 to BR-007-015 | financial-service, api-gateway | invoices, payments |
| FEAT-007-006 | Predictive Analytics | US-007-006-001 to US-007-006-002 | - | BR-007-016 to BR-007-018 | All services | All tables |
| FEAT-007-007 | Custom Reports Builder | US-007-007-001 to US-007-007-002 | - | BR-007-019 to BR-007-021 | api-gateway | All tables |
| FEAT-007-008 | Data Export & Integration | US-007-008-001 to US-007-008-002 | - | BR-007-022 to BR-007-024 | api-gateway | All tables |

**Related Documents:**
- Epic: [epic-analytics-bi.md](./product-owner/epic-analytics-bi.md)

---

### EPIC-008: HR Management

| Feature ID | Feature Name | User Stories | Use Cases | Business Rules | Services | Database Tables |
|------------|--------------|--------------|-----------|----------------|----------|-----------------|
| FEAT-008-001 | Employee Management | US-008-001-001 to US-008-001-003 | - | BR-008-001 to BR-008-003 | hr-service, user-service | employees, users |
| FEAT-008-002 | Department Management | US-008-002-001 to US-008-002-002 | - | BR-008-004 to BR-008-006 | hr-service | departments |
| FEAT-008-003 | Position Management | US-008-003-001 to US-008-003-002 | - | BR-008-007 to BR-008-009 | hr-service | positions |
| FEAT-008-004 | Contract Management | US-008-004-001 to US-008-004-003 | - | BR-008-010 to BR-008-012 | hr-service | employee_contracts |
| FEAT-008-005 | Attendance Management | US-008-005-001 to US-008-005-002 | - | BR-008-013 to BR-008-015 | hr-service | attendance_records |
| FEAT-008-006 | Leave Management | US-008-006-001 to US-008-006-003 | - | BR-008-016 to BR-008-018 | hr-service | leave_requests, leave_balances |
| FEAT-008-007 | Employee Self-Service | US-008-007-001 to US-008-007-002 | - | BR-008-019 to BR-008-021 | hr-service, user-service | employees, users |
| FEAT-008-008 | HR Reporting | US-008-008-001 to US-008-008-002 | - | BR-008-022 to BR-008-024 | hr-service | employees, hr_reports |

**Related Documents:**
- Epic: [epic-hr-management.md](./product-owner/epic-hr-management.md)

---

### EPIC-009: System Integration & Infrastructure

| Feature ID | Feature Name | User Stories | Use Cases | Business Rules | Services | Database Tables |
|------------|--------------|--------------|-----------|----------------|----------|-----------------|
| FEAT-009-001 | Single Sign-On (SSO) | US-009-001-001 to US-009-001-002 | - | BR-009-001 to BR-009-003 | user-service, api-gateway | users, sessions |
| FEAT-009-002 | Payment Gateway Integration | US-009-002-001 to US-009-002-002 | - | BR-009-004 to BR-009-006 | financial-service | payments, payment_gateways |
| FEAT-009-003 | Email & Communication | US-009-003-001 to US-009-003-002 | - | BR-009-007 to BR-009-009 | api-gateway | email_logs |
| FEAT-009-004 | Zalo Business Integration | US-009-004-001 to US-009-004-002 | - | BR-009-010 to BR-009-012 | customer-service, api-gateway | zalo_messages |
| FEAT-009-005 | E-commerce Integration | US-009-005-001 to US-009-005-002 | - | BR-009-013 to BR-009-015 | sales-service, product-service | ecommerce_sync |
| FEAT-009-006 | Accounting System Integration | US-009-006-001 to US-009-006-002 | - | BR-009-016 to BR-009-018 | financial-service | accounting_sync |
| FEAT-009-007 | API Management & Security | US-009-007-001 to US-009-007-002 | - | BR-009-019 to BR-009-021 | api-gateway | api_keys, api_logs |
| FEAT-009-008 | Monitoring & Logging | US-009-008-001 to US-009-008-002 | - | BR-009-022 to BR-009-024 | All services | system_logs, metrics |
| FEAT-009-009 | Data Backup & Recovery | US-009-009-001 to US-009-009-002 | - | BR-009-025 to BR-009-027 | All services | backup_logs |
| FEAT-009-010 | IoT & Hardware Integration | US-009-010-001 to US-009-010-002 | - | BR-009-028 to BR-009-030 | inventory-service | iot_devices, iot_data |

**Related Documents:**
- Epic: [epic-system-integration.md](./product-owner/epic-system-integration.md)

---

## 🔍 Cách Sử Dụng Traceability Matrix

### 1. Impact Analysis
Khi có thay đổi requirement:
1. Tìm Epic/Feature trong matrix
2. Xem các Services, Database Tables, Use Cases liên quan
3. Xác định tất cả components cần update

### 2. Coverage Tracking
Đảm bảo mọi requirement được implement:
1. Check Epic → Features → User Stories
2. Verify Use Cases đã được tạo
3. Verify Business Rules đã được document
4. Verify Services đã implement
5. Verify Database Tables đã được tạo

### 3. Dependency Management
Hiểu dependencies:
1. Xem Feature dependencies trong [dependencies.md](./dependencies.md)
2. Xem Service dependencies trong [service-mapping.md](./service-mapping.md)
3. Xem Database dependencies trong [database-mapping.md](./database-mapping.md)

### 4. Testing Traceability
Map test cases với requirements:
1. Epic → Features → User Stories → Test Cases
2. Use Cases → Test Scenarios
3. Business Rules → Test Validations

---

## 📝 Ghi Chú

- **User Story IDs**: Format `US-XXX-YYY-ZZZ` (Epic-Feature-Story)
- **Use Case IDs**: Format `UC-XXX-YYY-ZZZ` hoặc `UC-XXX-YYY` (Epic-Feature-Case)
- **Business Rule IDs**: Format `BR-XXX-YYY-ZZZ` (Epic-Feature-Rule)
- **Feature IDs**: Format `FEAT-XXX-YYY` (Epic-Feature)

---

**Last Updated**: November 2025  
**Version**: 1.0

