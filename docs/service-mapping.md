# Service Mapping - DigiERP System

## 📋 Tổng Quan

Service Mapping này cung cấp mapping chi tiết giữa Epic/Features và các Microservices trong hệ thống DigiERP.

**Mục đích:**
- Xác định service nào implement feature nào
- Hiểu service responsibilities
- Quản lý service dependencies
- Impact analysis khi thay đổi service

**Last Updated**: November 2025  
**Version**: 1.0

---

## 🏗️ Kiến Trúc Microservices

Hệ thống DigiERP sử dụng kiến trúc microservices với các services sau:

1. **api-gateway** - API Gateway, routing, authentication, aggregation
2. **user-service** - User management, authentication, authorization, RBAC
3. **product-service** - Product management, pricing, categories
4. **inventory-service** - Inventory management, warehouse, movements
5. **customer-service** - Customer management, CRM, contracts
6. **sales-service** - Sales orders, quotes, order management
7. **purchase-service** - Purchase orders, suppliers, procurement
8. **financial-service** - Invoices, payments, financial management
9. **hr-service** - HR management, employees, attendance

---

## 📊 Epic → Service Mapping

### EPIC-001: Product Management

**Primary Service**: `product-service`

| Feature | Service | Responsibility | API Endpoints |
|---------|---------|---------------|---------------|
| Product Information Management | product-service | CRUD products, product search | `/products`, `/products/:id` |
| Product Categories Management | product-service | CRUD categories, category tree | `/categories`, `/categories/:id` |
| Product Catalog for Aquaculture | product-service | Product catalog, filtering | `/products/catalog` |
| Brand & Model Management | product-service | Brand/model CRUD | `/brands`, `/models` |
| Unit & Packaging Management | product-service | Unit/packaging CRUD | `/units`, `/packaging` |
| Multi-tier Pricing System | product-service | Pricing engine, price calculation | `/prices`, `/prices/calculate` |
| Product Status & Stock Status | product-service, inventory-service | Product status, stock sync | `/products/:id/status`, `/inventory/:id` |
| Batch & Expiry Date Management | product-service | Batch management | `/products/:id/batches` |
| Material & Packaging Type | product-service | Material/packaging type CRUD | `/materials`, `/packaging-types` |

**Dependencies:**
- `inventory-service` - For stock status
- `customer-service` - For customer-based pricing
- `sales-service` - For price calculation in orders

---

### EPIC-002: Inventory Management

**Primary Service**: `inventory-service`

| Feature | Service | Responsibility | API Endpoints |
|---------|---------|---------------|---------------|
| Warehouse Management | inventory-service | CRUD warehouses | `/warehouses`, `/warehouses/:id` |
| Area & Location Management | inventory-service | CRUD areas/locations | `/areas`, `/locations` |
| Inventory Tracking & Movements | inventory-service | Track inventory, movements | `/inventory`, `/inventory/movements` |
| Goods Receipt Management | inventory-service, purchase-service | Receive goods, update inventory | `/goods-receipts`, `/goods-receipts/:id` |
| Goods Issue Management | inventory-service, sales-service | Issue goods, update inventory | `/goods-issues`, `/goods-issues/:id` |
| Inventory Counting & Adjustment | inventory-service | Inventory adjustments | `/inventory/adjustments` |
| Inventory Transfer Management | inventory-service | Transfer between warehouses | `/inventory/transfers` |
| Inventory Revaluation | inventory-service, financial-service | Revalue inventory | `/inventory/revaluations` |
| Safety Stock Management | inventory-service | Safety stock settings | `/inventory/safety-stock` |
| Reorder Point Automation | inventory-service | Reorder point management | `/inventory/reorder-points` |
| ABC Analysis | inventory-service | ABC analysis calculation | `/inventory/abc-analysis` |
| Demand Forecasting | inventory-service | Demand forecasting | `/inventory/forecasts` |

**Dependencies:**
- `product-service` - For product information
- `sales-service` - For sales order integration
- `purchase-service` - For purchase order integration
- `financial-service` - For inventory valuation

---

### EPIC-003: Customer Management

**Primary Service**: `customer-service`

| Feature | Service | Responsibility | API Endpoints |
|---------|---------|---------------|---------------|
| Customer Information Management | customer-service | CRUD customers | `/customers`, `/customers/:id` |
| Customer Segmentation | customer-service | Customer segments | `/customers/segments` |
| Customer Contacts Management | customer-service | Customer contacts | `/customers/:id/contacts` |
| Contract Management | customer-service | Customer contracts | `/customers/:id/contracts` |
| 360° Customer View | customer-service, sales-service, financial-service | Aggregated customer data | `/customers/:id/360` |
| Customer Status Management | customer-service | Customer status | `/customers/:id/status` |
| Customer Audit Trail | customer-service | Customer audit logs | `/customers/:id/audit` |
| RFM Analysis | customer-service, sales-service | RFM scoring | `/customers/rfm-analysis` |
| Customer Support Management | customer-service | Support tickets | `/customers/:id/support` |

**Dependencies:**
- `sales-service` - For order history
- `financial-service` - For invoice and payment history
- `product-service` - For contract-based pricing

---

### EPIC-004: Sales Management

**Primary Service**: `sales-service`

| Feature | Service | Responsibility | API Endpoints |
|---------|---------|---------------|---------------|
| Quote Generation & Management | sales-service | CRUD quotes | `/quotes`, `/quotes/:id` |
| Order Management | sales-service | CRUD sales orders | `/sales-orders`, `/sales-orders/:id` |
| Multiple Order Types Management | sales-service | Order types | `/sales-orders?type=:type` |
| Pricing Engine Integration | sales-service, product-service | Price calculation | `/sales-orders/:id/calculate-price` |
| Credit Management | sales-service, customer-service, financial-service | Credit limit checking | `/sales-orders/:id/check-credit` |
| Order Status Tracking | sales-service | Order status updates | `/sales-orders/:id/status` |
| Delivery & Logistics Management | sales-service | Delivery management | `/deliveries`, `/deliveries/:id` |
| Delivery Documentation | sales-service | Delivery documents | `/deliveries/:id/documents` |
| Sales Analytics & Reporting | sales-service, api-gateway | Sales reports | `/reports/sales` |
| Customer Analytics Integration | sales-service, customer-service | Customer analytics | `/analytics/customers` |

**Dependencies:**
- `product-service` - For product information and pricing
- `customer-service` - For customer information and credit limits
- `inventory-service` - For inventory availability
- `financial-service` - For invoice generation

---

### EPIC-005: Purchase Management

**Primary Service**: `purchase-service`

| Feature | Service | Responsibility | API Endpoints |
|---------|---------|---------------|---------------|
| Supplier Management | purchase-service | CRUD suppliers | `/suppliers`, `/suppliers/:id` |
| Supplier Qualification & Performance | purchase-service | Supplier performance | `/suppliers/:id/performance` |
| Purchase Requisition Workflow | purchase-service | Purchase requisitions | `/purchase-requisitions` |
| RFQ/RFP Management | purchase-service | RFQ/RFP management | `/rfqs`, `/rfqs/:id` |
| Purchase Order Management | purchase-service | CRUD purchase orders | `/purchase-orders`, `/purchase-orders/:id` |
| Purchase Order Items Management | purchase-service | PO items | `/purchase-orders/:id/items` |
| Goods Receipt Processing | purchase-service, inventory-service | Goods receipt | `/goods-receipts` |
| Quality Inspection Integration | purchase-service | Quality inspections | `/quality-inspections` |
| Invoice Matching (3-way Matching) | purchase-service, financial-service | Invoice matching | `/invoice-matching` |
| Supplier Contract Management | purchase-service | Supplier contracts | `/suppliers/:id/contracts` |

**Dependencies:**
- `product-service` - For product information
- `inventory-service` - For inventory updates
- `financial-service` - For invoice matching and payment

---

### EPIC-006: Financial Management

**Primary Service**: `financial-service`

| Feature | Service | Responsibility | API Endpoints |
|---------|---------|---------------|---------------|
| Invoice Management | financial-service | CRUD invoices | `/invoices`, `/invoices/:id` |
| Invoice Items Management | financial-service | Invoice items | `/invoices/:id/items` |
| Payment Processing & Tracking | financial-service | Payment processing | `/payments`, `/payments/:id` |
| Accounts Receivable Management | financial-service | AR management | `/accounts-receivable` |
| Accounts Payable Management | financial-service | AP management | `/accounts-payable` |
| Cash Flow Management | financial-service | Cash flow tracking | `/cash-flow` |
| Financial Reporting | financial-service | Financial reports | `/reports/financial` |
| Invoice Status Management | financial-service | Invoice status | `/invoices/:id/status` |
| Credit Note & Debit Note | financial-service | Credit/debit notes | `/credit-notes`, `/debit-notes` |
| Payment Method Management | financial-service | Payment methods | `/payment-methods` |
| Tax Management | financial-service | Tax management | `/taxes` |
| Multi-currency Support | financial-service | Currency management | `/currencies`, `/exchange-rates` |

**Dependencies:**
- `sales-service` - For sales order integration
- `purchase-service` - For purchase order integration
- `customer-service` - For customer information
- `purchase-service` - For supplier information

---

### EPIC-007: Analytics & Business Intelligence

**Primary Service**: `api-gateway` (aggregation)

| Feature | Service | Responsibility | API Endpoints |
|---------|---------|---------------|---------------|
| Real-time Dashboard | api-gateway, all services | Dashboard aggregation | `/dashboard` |
| Sales Analytics & Reporting | sales-service, api-gateway | Sales analytics | `/analytics/sales` |
| Inventory Analytics | inventory-service, api-gateway | Inventory analytics | `/analytics/inventory` |
| Customer Analytics | customer-service, sales-service | Customer analytics | `/analytics/customers` |
| Financial Analytics | financial-service, api-gateway | Financial analytics | `/analytics/financial` |
| Predictive Analytics | All services | Predictive models | `/analytics/predictive` |
| Custom Reports Builder | api-gateway | Report builder | `/reports/builder` |
| Data Export & Integration | api-gateway | Data export | `/export` |

**Dependencies:**
- All services for data aggregation

---

### EPIC-008: HR Management

**Primary Service**: `hr-service`

| Feature | Service | Responsibility | API Endpoints |
|---------|---------|---------------|---------------|
| Employee Management | hr-service, user-service | CRUD employees | `/employees`, `/employees/:id` |
| Department Management | hr-service | CRUD departments | `/departments`, `/departments/:id` |
| Position Management | hr-service | CRUD positions | `/positions`, `/positions/:id` |
| Contract Management | hr-service | Employee contracts | `/employees/:id/contracts` |
| Attendance Management | hr-service | Attendance tracking | `/attendance` |
| Leave Management | hr-service | Leave requests | `/leave-requests` |
| Employee Self-Service | hr-service, user-service | Employee portal | `/employees/self-service` |
| HR Reporting | hr-service | HR reports | `/reports/hr` |

**Dependencies:**
- `user-service` - For user account integration
- `financial-service` - For payroll integration (planned)

---

### EPIC-009: System Integration & Infrastructure

**Primary Service**: `api-gateway`, `user-service`

| Feature | Service | Responsibility | API Endpoints |
|---------|---------|---------------|---------------|
| Single Sign-On (SSO) | user-service, api-gateway | SSO authentication | `/auth/sso` |
| Payment Gateway Integration | financial-service | Payment processing | `/payments/gateway` |
| Email & Communication | api-gateway | Email service | `/email` |
| Zalo Business Integration | customer-service, api-gateway | Zalo integration | `/zalo` |
| E-commerce Integration | sales-service, product-service | E-commerce sync | `/ecommerce/sync` |
| Accounting System Integration | financial-service | Accounting sync | `/accounting/sync` |
| API Management & Security | api-gateway | API security | `/api/keys` |
| Monitoring & Logging | All services | System monitoring | `/monitoring` |
| Data Backup & Recovery | All services | Backup management | `/backup` |
| IoT & Hardware Integration | inventory-service | IoT integration | `/iot` |

**Dependencies:**
- All services for integration

---

## 🔗 Service Dependencies Graph

```
api-gateway
  ├── user-service (authentication, authorization)
  ├── product-service (product data, pricing)
  ├── inventory-service (inventory data)
  ├── customer-service (customer data)
  ├── sales-service (sales data)
  ├── purchase-service (purchase data)
  ├── financial-service (financial data)
  └── hr-service (HR data)

sales-service
  ├── product-service (product info, pricing)
  ├── customer-service (customer info, credit)
  ├── inventory-service (inventory availability)
  └── financial-service (invoice generation)

purchase-service
  ├── product-service (product info)
  ├── inventory-service (inventory updates)
  └── financial-service (invoice matching)

inventory-service
  ├── product-service (product info)
  ├── sales-service (sales order integration)
  └── purchase-service (purchase order integration)

customer-service
  ├── sales-service (order history)
  └── financial-service (invoice/payment history)

financial-service
  ├── sales-service (sales order integration)
  ├── purchase-service (purchase order integration)
  ├── customer-service (customer info)
  └── purchase-service (supplier info)
```

---

## 📝 Ghi Chú

- **Primary Service**: Service chịu trách nhiệm chính cho feature
- **Dependencies**: Services khác được sử dụng bởi primary service
- **API Endpoints**: Các endpoints chính (chi tiết trong Swagger/OpenAPI)

---

**Last Updated**: November 2025  
**Version**: 1.0

