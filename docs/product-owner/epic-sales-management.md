# Epic: Quản Lý Đơn Hàng & Bán Hàng

## 📋 Thông Tin Epic

**Epic ID**: EPIC-004  
**Epic Name**: Quản Lý Đơn Hàng & Bán Hàng (Sales & Order Management)  
**Priority**: Critical  
**Business Value**: Critical  
**Status**: In Progress  
**Owner**: Product Owner  
**Created**: November 2025

**Related Services**: sales-service, product-service, customer-service, inventory-service, financial-service  
**Related Database Tables**: sales_orders, sales_order_items, quotes, quote_items, deliveries, delivery_items  
**Traceability**: [Traceability Matrix](../traceability-matrix.md#epic-004-sales-management)  
**Service Mapping**: [Service Mapping](../service-mapping.md#epic-004-sales-management)  
**Database Mapping**: [Database Mapping](../database-mapping.md#epic-004-sales-management)  
**Dependencies**: [Dependencies](../dependencies.md#epic-004-sales-management)

---

## 🎯 Mô Tả Epic

Epic này tập trung vào quản lý toàn bộ quy trình bán hàng từ báo giá, đơn hàng, đến giao hàng và logistics. Hệ thống hỗ trợ nhiều loại đơn hàng, pricing engine thông minh, và quản lý tín dụng.

---

## 💼 Mục Tiêu Kinh Doanh

1. **Tăng doanh thu**: Tối đa hóa doanh thu thông qua pricing engine và upsell
2. **Tăng hiệu quả**: Giảm 70% thời gian xử lý đơn hàng
3. **Giảm lỗi**: Giảm 95% lỗi nhập liệu và tính toán
4. **Cải thiện trải nghiệm**: Cải thiện trải nghiệm khách hàng với quy trình tự động

---

## 🚀 Features

### Feature 1: Quote Generation & Management
**Priority**: High  
**Status**: Planned

**Mô tả**: Tự động tạo báo giá từ template với pricing engine và discount rules.

**User Stories**:
- As a **Sales Representative**, I want to **generate quotes automatically** so that **I can provide quick pricing to customers**
- As a **Sales Manager**, I want to **approve quotes** so that **I can control pricing decisions**
- As a **Customer**, I want to **receive professional quotes** so that **I can make informed decisions**

**Acceptance Criteria**:
- ✅ System allows creating quotes from templates
- ✅ System applies pricing engine to calculate prices
- ✅ System supports discount rules and approval workflow
- ✅ System manages quote validity periods
- ✅ System exports quotes to PDF with branding
- ✅ System tracks quote conversion to orders

---

### Feature 2: Order Management
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Quản lý đơn hàng với validation, credit limit checking, và inventory availability check.

**User Stories**:
- As a **Sales Representative**, I want to **create sales orders** so that **I can process customer orders**
- As a **Sales Manager**, I want to **track order status** so that **I can monitor order fulfillment**
- As a **Warehouse Manager**, I want to **see orders requiring fulfillment** so that **I can prepare shipments**

**Acceptance Criteria**:
- ✅ System allows creating orders with customer and product information
- ✅ System validates order data (customer, products, quantities)
- ✅ System checks credit limit before order creation
- ✅ System checks inventory availability
- ✅ System supports order status tracking: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- ✅ System maintains order history and audit trail

---

### Feature 3: Multiple Order Types Management
**Priority**: High  
**Status**: Completed

**Mô tả**: Hỗ trợ nhiều loại đơn hàng phù hợp với nghiệp vụ.

**User Stories**:
- As a **Sales Representative**, I want to **create different order types** so that **I can handle various business scenarios**
- As an **Accountant**, I want to **see order types** so that **I can process accounting correctly**

**Acceptance Criteria**:
- ✅ System supports order types: RETAIL, WHOLESALE, FOC, GIFT, DEMO, CONSIGNMENT, SAMPLE, RETURN
- ✅ System applies different business rules per order type
- ✅ System tracks order type in order records
- ✅ System filters orders by type
- ✅ System applies appropriate pricing rules per order type

**Order Types**:
- **RETAIL**: Bán lẻ
- **WHOLESALE**: Bán buôn
- **FOC**: Free of Charge (hàng miễn phí)
- **GIFT**: Quà tặng
- **DEMO**: Hàng demo
- **CONSIGNMENT**: Hàng ký gửi
- **SAMPLE**: Hàng mẫu
- **RETURN**: Trả hàng

---

### Feature 4: Pricing Engine Integration
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Tích hợp với pricing engine để tính giá tự động dựa trên customer tier, volume, và contract.

**User Stories**:
- As a **Sales Representative**, I want to **see correct prices for customers** so that **I can quote accurately**
- As a **Sales Manager**, I want to **apply volume discounts** so that **I can incentivize larger orders**
- As a **Customer**, I want to **see my contract prices** so that **I know the price I should pay**

**Acceptance Criteria**:
- ✅ System integrates with Product Service pricing engine
- ✅ System applies pricing priority: Contract > Customer > Customer Group > Volume > Standard
- ✅ System calculates discounts (percentage or amount)
- ✅ System applies volume discounts based on quantity
- ✅ System displays price breakdown in orders
- ✅ System maintains price history for audit

**Pricing Priority**:
1. Contract pricing (highest priority)
2. Customer pricing
3. Customer group pricing
4. Volume pricing
5. Standard pricing (lowest priority)

---

### Feature 5: Credit Management
**Priority**: High  
**Status**: Completed

**Mô tả**: Quản lý hạn mức tín dụng và điều khoản thanh toán cho khách hàng.

**User Stories**:
- As a **Credit Manager**, I want to **set credit limits for customers** so that **I can control credit risk**
- As a **Sales Representative**, I want to **see customer credit status** so that **I can process orders correctly**
- As an **Accountant**, I want to **see aging analysis** so that **I can manage accounts receivable**

**Acceptance Criteria**:
- ✅ System allows setting credit limit per customer
- ✅ System checks credit limit before order creation
- ✅ System supports payment terms management
- ✅ System provides aging analysis (current, 30 days, 60 days, 90+ days)
- ✅ System supports credit hold functionality
- ✅ System sends alerts when credit limit is exceeded

---

### Feature 6: Order Status Tracking
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Theo dõi trạng thái đơn hàng từ khi tạo đến khi giao hàng.

**User Stories**:
- As a **Sales Representative**, I want to **update order status** so that **I can track order progress**
- As a **Customer**, I want to **see my order status** so that **I know when to expect delivery**
- As a **Sales Manager**, I want to **see order status dashboard** so that **I can monitor team performance**

**Acceptance Criteria**:
- ✅ System supports order status workflow
- ✅ System tracks status changes with timestamps
- ✅ System maintains status change history
- ✅ System sends notifications on status changes
- ✅ System displays status in order listings and details

**Order Status Flow**:
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → CANCELLED

---

### Feature 7: Delivery & Logistics Management
**Priority**: High  
**Status**: Planned

**Mô tả**: Quản lý giao hàng và logistics bao gồm lập lịch, phân công, và theo dõi.

**User Stories**:
- As a **Logistics Manager**, I want to **schedule deliveries** so that **I can optimize delivery routes**
- As a **Delivery Staff**, I want to **see delivery assignments** so that **I can plan my deliveries**
- As a **Customer**, I want to **track my delivery** so that **I know when to expect my order**

**Acceptance Criteria**:
- ✅ System allows scheduling deliveries
- ✅ System supports delivery staff assignment
- ✅ System tracks delivery status
- ✅ System manages delivery vehicles
- ✅ System provides delivery tracking for customers
- ✅ System sends delivery notifications

---

### Feature 8: Delivery Documentation
**Priority**: Medium  
**Status**: Planned

**Mô tả**: Quản lý tài liệu giao hàng bao gồm phiếu giao hàng, biên lai, và xác nhận.

**User Stories**:
- As a **Delivery Staff**, I want to **generate delivery documents** so that **I can complete deliveries**
- As a **Customer**, I want to **receive delivery confirmation** so that **I have proof of delivery**
- As an **Accountant**, I want to **see delivery documents** so that **I can reconcile deliveries**

**Acceptance Criteria**:
- ✅ System generates delivery notes
- ✅ System creates delivery receipts
- ✅ System supports delivery confirmation
- ✅ System handles delivery complaints
- ✅ System maintains delivery document history

---

### Feature 9: Sales Analytics & Reporting
**Priority**: Medium  
**Status**: Planned

**Mô tả**: Phân tích và báo cáo hiệu suất bán hàng.

**User Stories**:
- As a **Sales Manager**, I want to **see sales performance reports** so that **I can monitor team performance**
- As a **Business Analyst**, I want to **analyze sales trends** so that **I can identify opportunities**
- As a **CEO**, I want to **see sales dashboard** so that **I can track business performance**

**Acceptance Criteria**:
- ✅ System provides revenue reports by product, customer, region
- ✅ System tracks sales team performance metrics
- ✅ System analyzes conversion rates
- ✅ System measures pipeline velocity
- ✅ System provides sales forecasting
- ✅ System exports reports to various formats

---

### Feature 10: Customer Analytics Integration
**Priority**: Medium  
**Status**: Planned

**Mô tả**: Tích hợp với customer analytics để phân tích customer lifetime value và opportunities.

**User Stories**:
- As a **Sales Manager**, I want to **see customer lifetime value** so that **I can prioritize customers**
- As a **Sales Representative**, I want to **see upselling opportunities** so that **I can increase order value**

**Acceptance Criteria**:
- ✅ System calculates customer lifetime value (CLV)
- ✅ System analyzes purchase frequency
- ✅ System identifies churn risk
- ✅ System suggests upselling/cross-selling opportunities
- ✅ System provides customer analytics reports

---

## 📊 Metrics & KPIs

### Business Metrics
- **Order Processing Time**: < 30 minutes
- **Order Accuracy**: > 98%
- **Order Fulfillment Rate**: > 95%
- **Average Order Value**: Tracked monthly
- **Conversion Rate**: Quote to Order > 30%

### Technical Metrics
- **Order Creation Performance**: < 2 seconds
- **Price Calculation Performance**: < 500ms
- **System Uptime**: > 99.9%

---

## 🔗 Dependencies

### Internal Dependencies
- **Product Service**: For product information and pricing
- **Customer Service**: For customer information and credit limits
- **Inventory Service**: For inventory availability
- **Financial Service**: For invoice generation

### External Dependencies
- None

---

## 📝 Notes

- Order management is critical for business operations
- Pricing engine integration ensures accurate pricing
- Credit management prevents credit risk
- Order status tracking improves customer experience
- Sales analytics helps optimize sales performance

---

**Last Updated**: November 2025  
**Next Review**: December 2025

