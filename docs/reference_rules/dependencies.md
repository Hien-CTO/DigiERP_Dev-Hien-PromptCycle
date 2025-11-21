# Dependencies - DigiERP System

## 📋 Tổng Quan

Dependencies này mô tả các dependencies giữa Epic, Features, Services, và Database Tables trong hệ thống DigiERP.

**Mục đích:**
- Hiểu feature dependencies (Feature A phụ thuộc Feature B)
- Hiểu service dependencies
- Hiểu data flow giữa services
- Impact analysis khi thay đổi

**Last Updated**: November 2025  
**Version**: 1.0

---

## 🔗 Feature Dependencies

### EPIC-001: Product Management

**Dependencies:**
- FEAT-001-006 (Multi-tier Pricing) depends on:
  - FEAT-003-001 (Customer Information Management) - For customer-based pricing
  - FEAT-003-004 (Contract Management) - For contract-based pricing
- FEAT-001-007 (Product Status & Stock Status) depends on:
  - FEAT-002-003 (Inventory Tracking) - For stock status

---

### EPIC-002: Inventory Management

**Dependencies:**
- FEAT-002-004 (Goods Receipt Management) depends on:
  - FEAT-005-005 (Purchase Order Management) - For receiving from PO
  - FEAT-001-001 (Product Information Management) - For product validation
- FEAT-002-005 (Goods Issue Management) depends on:
  - FEAT-004-002 (Order Management) - For issuing to sales orders
  - FEAT-001-001 (Product Information Management) - For product validation
- FEAT-002-008 (Inventory Revaluation) depends on:
  - FEAT-006-001 (Invoice Management) - For valuation updates

---

### EPIC-003: Customer Management

**Dependencies:**
- FEAT-003-005 (360° Customer View) depends on:
  - FEAT-004-002 (Order Management) - For order history
  - FEAT-006-001 (Invoice Management) - For invoice history
  - FEAT-006-003 (Payment Processing) - For payment history
- FEAT-003-008 (RFM Analysis) depends on:
  - FEAT-004-002 (Order Management) - For order data
  - FEAT-006-003 (Payment Processing) - For payment data

---

### EPIC-004: Sales Management

**Dependencies:**
- FEAT-004-001 (Quote Generation) depends on:
  - FEAT-001-006 (Multi-tier Pricing) - For price calculation
  - FEAT-003-001 (Customer Information) - For customer data
- FEAT-004-002 (Order Management) depends on:
  - FEAT-001-006 (Multi-tier Pricing) - For price calculation
  - FEAT-003-001 (Customer Information) - For customer validation
  - FEAT-002-003 (Inventory Tracking) - For inventory availability
  - FEAT-004-005 (Credit Management) - For credit limit checking
- FEAT-004-004 (Pricing Engine Integration) depends on:
  - FEAT-001-006 (Multi-tier Pricing) - For pricing engine
- FEAT-004-005 (Credit Management) depends on:
  - FEAT-003-001 (Customer Information) - For customer credit limits
  - FEAT-006-001 (Invoice Management) - For AR aging
- FEAT-004-007 (Delivery & Logistics) depends on:
  - FEAT-004-002 (Order Management) - For order fulfillment
  - FEAT-002-005 (Goods Issue Management) - For goods issue

---

### EPIC-005: Purchase Management

**Dependencies:**
- FEAT-005-005 (Purchase Order Management) depends on:
  - FEAT-001-001 (Product Information) - For product validation
  - FEAT-005-001 (Supplier Management) - For supplier validation
- FEAT-005-007 (Goods Receipt Processing) depends on:
  - FEAT-005-005 (Purchase Order Management) - For PO reference
  - FEAT-002-004 (Goods Receipt Management) - For inventory update
- FEAT-005-009 (Invoice Matching) depends on:
  - FEAT-005-005 (Purchase Order Management) - For PO matching
  - FEAT-005-007 (Goods Receipt Processing) - For GR matching
  - FEAT-006-001 (Invoice Management) - For invoice matching

---

### EPIC-006: Financial Management

**Dependencies:**
- FEAT-006-001 (Invoice Management) depends on:
  - FEAT-004-002 (Order Management) - For sales invoices
  - FEAT-005-005 (Purchase Order Management) - For purchase invoices
  - FEAT-003-001 (Customer Information) - For customer invoices
  - FEAT-005-001 (Supplier Management) - For supplier invoices
- FEAT-006-003 (Payment Processing) depends on:
  - FEAT-006-001 (Invoice Management) - For invoice payment
  - FEAT-003-001 (Customer Information) - For customer payments
  - FEAT-005-001 (Supplier Management) - For supplier payments
- FEAT-006-004 (Accounts Receivable) depends on:
  - FEAT-006-001 (Invoice Management) - For AR invoices
  - FEAT-006-003 (Payment Processing) - For payment tracking
- FEAT-006-005 (Accounts Payable) depends on:
  - FEAT-006-001 (Invoice Management) - For AP invoices
  - FEAT-006-003 (Payment Processing) - For payment tracking

---

### EPIC-007: Analytics & Business Intelligence

**Dependencies:**
- All analytics features depend on:
  - All other epics for data aggregation
  - FEAT-004-002 (Order Management) - For sales analytics
  - FEAT-002-003 (Inventory Tracking) - For inventory analytics
  - FEAT-003-001 (Customer Information) - For customer analytics
  - FEAT-006-001 (Invoice Management) - For financial analytics

---

### EPIC-008: HR Management

**Dependencies:**
- FEAT-008-001 (Employee Management) depends on:
  - FEAT-009-001 (SSO) - For user accounts
- FEAT-008-007 (Employee Self-Service) depends on:
  - FEAT-009-001 (SSO) - For authentication

---

### EPIC-009: System Integration & Infrastructure

**Dependencies:**
- All integration features depend on:
  - All other epics for integration
  - FEAT-009-001 (SSO) - For authentication
  - FEAT-009-007 (API Management) - For API security

---

## 🔗 Service Dependencies

### Service Dependency Graph

```
api-gateway
  └── Depends on: All services (for routing and aggregation)

user-service
  └── No dependencies (core service)

product-service
  └── No dependencies (core service)

inventory-service
  ├── Depends on: product-service (for product information)
  └── Depends on: sales-service (for sales order integration)
  └── Depends on: purchase-service (for purchase order integration)

customer-service
  ├── Depends on: sales-service (for order history)
  └── Depends on: financial-service (for invoice/payment history)

sales-service
  ├── Depends on: product-service (for product info and pricing)
  ├── Depends on: customer-service (for customer info and credit)
  ├── Depends on: inventory-service (for inventory availability)
  └── Depends on: financial-service (for invoice generation)

purchase-service
  ├── Depends on: product-service (for product info)
  ├── Depends on: inventory-service (for inventory updates)
  └── Depends on: financial-service (for invoice matching)

financial-service
  ├── Depends on: sales-service (for sales order integration)
  ├── Depends on: purchase-service (for purchase order integration)
  ├── Depends on: customer-service (for customer info)
  └── Depends on: purchase-service (for supplier info)

hr-service
  ├── Depends on: user-service (for user account integration)
  └── Depends on: financial-service (for payroll - planned)
```

---

## 📊 Data Flow Dependencies

### Sales Order Flow

```
1. Customer Service → Customer Information
2. Product Service → Product Information & Pricing
3. Inventory Service → Inventory Availability Check
4. Customer Service → Credit Limit Check
5. Sales Service → Create Sales Order
6. Inventory Service → Reserve Inventory
7. Financial Service → Generate Invoice
8. Inventory Service → Goods Issue (on delivery)
```

### Purchase Order Flow

```
1. Product Service → Product Information
2. Purchase Service → Create Purchase Order
3. Inventory Service → Goods Receipt (on arrival)
4. Financial Service → Invoice Matching (3-way matching)
5. Financial Service → Payment Processing
```

### Inventory Movement Flow

```
1. Purchase Service → Purchase Order Created
2. Inventory Service → Goods Receipt → Inventory IN
3. Sales Service → Sales Order Created
4. Inventory Service → Reserve Inventory
5. Inventory Service → Goods Issue → Inventory OUT
6. Financial Service → Inventory Valuation Update
```

---

## ⚠️ Critical Dependencies

### Must Have Before Implementation

**Sales Order Management requires:**
1. ✅ Product Management (EPIC-001)
2. ✅ Customer Management (EPIC-003)
3. ✅ Inventory Management (EPIC-002) - At least basic tracking
4. ✅ Financial Management (EPIC-006) - For invoicing

**Purchase Order Management requires:**
1. ✅ Product Management (EPIC-001)
2. ✅ Inventory Management (EPIC-002) - At least basic tracking
3. ✅ Financial Management (EPIC-006) - For invoice matching

**Goods Receipt requires:**
1. ✅ Purchase Order Management (EPIC-005)
2. ✅ Inventory Management (EPIC-002)
3. ✅ Product Management (EPIC-001)

**Goods Issue requires:**
1. ✅ Sales Order Management (EPIC-004)
2. ✅ Inventory Management (EPIC-002)
3. ✅ Product Management (EPIC-001)

**Invoice Generation requires:**
1. ✅ Sales Order Management (EPIC-004) or Purchase Order Management (EPIC-005)
2. ✅ Financial Management (EPIC-006)
3. ✅ Customer Management (EPIC-003) or Supplier Management (EPIC-005)

---

## 🔄 Circular Dependencies (To Avoid)

### Potential Circular Dependencies

1. **Sales Service ↔ Inventory Service**
   - Sales Service needs inventory availability
   - Inventory Service needs sales order for goods issue
   - **Solution**: Use events/messaging for async communication

2. **Financial Service ↔ Sales/Purchase Services**
   - Financial Service needs order data for invoicing
   - Sales/Purchase Services may need invoice status
   - **Solution**: Use events/messaging for async communication

3. **Customer Service ↔ Sales Service**
   - Customer Service needs order history
   - Sales Service needs customer information
   - **Solution**: Customer Service owns customer data, Sales Service references it

---

## 📝 Dependency Resolution Strategy

### 1. Event-Driven Architecture
- Use message queue (RabbitMQ) for async communication
- Services publish events, other services subscribe
- Reduces tight coupling

### 2. API Gateway Aggregation
- API Gateway aggregates data from multiple services
- Reduces direct service-to-service calls
- Better for read operations

### 3. Database Views (if needed)
- Create views for cross-service queries
- Read-only access
- Use with caution in microservices

### 4. Service Mesh (Future)
- Consider service mesh for advanced routing
- Better observability
- Circuit breakers for resilience

---

## 🎯 Implementation Order

### Phase 1: Core Services (Foundation)
1. User Service
2. Product Service
3. Customer Service
4. Inventory Service (Basic)

### Phase 2: Business Services
1. Sales Service
2. Purchase Service
3. Financial Service

### Phase 3: Advanced Features
1. Analytics & BI
2. HR Management
3. System Integration

---

**Last Updated**: November 2025  
**Version**: 1.0

