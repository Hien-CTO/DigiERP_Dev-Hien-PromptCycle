# Epic: Quản Lý Mua Hàng & Nhà Cung Cấp

## 📋 Thông Tin Epic

**Epic ID**: EPIC-005  
**Epic Name**: Quản Lý Mua Hàng & Nhà Cung Cấp (Purchase & Supplier Management)  
**Priority**: High  
**Business Value**: High  
**Status**: In Progress  
**Owner**: Product Owner  
**Created**: November 2025

**Related Services**: purchase-service, product-service, inventory-service, financial-service  
**Related Database Tables**: purchase_orders, purchase_order_items, suppliers, supplier_companies, purchase_requisitions, rfqs, goods_receipts, quality_inspections, supplier_contracts  
**Traceability**: [Traceability Matrix](../traceability-matrix.md#epic-005-purchase-management)  
**Service Mapping**: [Service Mapping](../service-mapping.md#epic-005-purchase-management)  
**Database Mapping**: [Database Mapping](../database-mapping.md#epic-005-purchase-management)  
**Dependencies**: [Dependencies](../dependencies.md#epic-005-purchase-management)

---

## 🎯 Mô Tả Epic

Epic này tập trung vào quản lý quy trình mua hàng từ yêu cầu mua hàng, đơn đặt hàng, đến nhận hàng và thanh toán. Hệ thống hỗ trợ quản lý nhà cung cấp, đánh giá hiệu suất, và tối ưu hóa quy trình mua hàng.

---

## 💼 Mục Tiêu Kinh Doanh

1. **Tối ưu chi phí**: Giảm 15% chi phí mua hàng thông qua đàm phán và lựa chọn nhà cung cấp
2. **Tăng hiệu quả**: Giảm 50% thời gian xử lý đơn mua hàng
3. **Cải thiện chất lượng**: Đảm bảo chất lượng hàng hóa thông qua quản lý nhà cung cấp
4. **Tối ưu tồn kho**: Đảm bảo tồn kho đủ thông qua quy trình mua hàng hiệu quả

---

## 🚀 Features

### Feature 1: Supplier Management
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Quản lý thông tin nhà cung cấp bao gồm thông tin liên hệ, điều khoản thanh toán, và đánh giá hiệu suất.

**User Stories**:
- As a **Purchase Manager**, I want to **create and manage supplier information** so that **I can maintain supplier database**
- As a **Purchase Staff**, I want to **view supplier details** so that **I can contact suppliers for quotes**
- As a **Quality Manager**, I want to **track supplier performance** so that **I can ensure quality standards**

**Acceptance Criteria**:
- ✅ System allows creating suppliers with name, contact information, address
- ✅ System tracks supplier tax code and business information
- ✅ System manages supplier payment terms and credit limit
- ✅ System supports supplier status management (Active, Inactive, Suspended)
- ✅ System maintains supplier creation and update history

---

### Feature 2: Supplier Qualification & Performance Tracking
**Priority**: High  
**Status**: Planned

**Mô tả**: Đánh giá và theo dõi hiệu suất nhà cung cấp.

**User Stories**:
- As a **Purchase Manager**, I want to **qualify suppliers** so that **I can ensure supplier capability**
- As a **Quality Manager**, I want to **track supplier performance** so that **I can maintain quality standards**
- As a **Business Analyst**, I want to **analyze supplier performance** so that **I can optimize supplier selection**

**Acceptance Criteria**:
- ✅ System supports supplier qualification process
- ✅ System tracks supplier performance metrics (on-time delivery, quality score, price competitiveness)
- ✅ System provides supplier performance reports
- ✅ System supports supplier risk assessment
- ✅ System maintains supplier performance history

---

### Feature 3: Purchase Requisition Workflow
**Priority**: High  
**Status**: Planned

**Mô tả**: Quy trình yêu cầu mua hàng từ phòng ban với approval workflow.

**User Stories**:
- As a **Department Head**, I want to **create purchase requisitions** so that **I can request purchases for my department**
- As a **Department Manager**, I want to **approve purchase requisitions** so that **I can control department spending**
- As a **Purchase Manager**, I want to **see purchase requisitions** so that **I can process purchase requests**

**Acceptance Criteria**:
- ✅ System allows creating purchase requisitions with items and quantities
- ✅ System supports requisition status: Draft, Pending, Approved, Rejected, Cancelled
- ✅ System requires approval workflow for requisitions
- ✅ System tracks requisition budget allocation
- ✅ System links requisitions to purchase orders

---

### Feature 4: RFQ/RFP Management
**Priority**: Medium  
**Status**: Planned

**Mô tả**: Quản lý yêu cầu báo giá và đề xuất từ nhà cung cấp.

**User Stories**:
- As a **Purchase Staff**, I want to **create RFQ/RFP** so that **I can request quotes from suppliers**
- As a **Supplier**, I want to **submit quotes** so that **I can compete for orders**
- As a **Purchase Manager**, I want to **evaluate quotes** so that **I can select the best supplier**

**Acceptance Criteria**:
- ✅ System allows creating RFQ/RFP with technical specifications
- ✅ System supports sending RFQ/RFP to multiple suppliers
- ✅ System allows suppliers to submit quotes
- ✅ System supports quote evaluation and comparison
- ✅ System tracks RFQ/RFP status and responses

---

### Feature 5: Purchase Order Management
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Quản lý đơn đặt hàng với approval workflow và tracking.

**User Stories**:
- As a **Purchase Staff**, I want to **create purchase orders** so that **I can order from suppliers**
- As a **Purchase Manager**, I want to **approve purchase orders** so that **I can control purchasing**
- As a **Supplier**, I want to **see purchase orders** so that **I can fulfill orders**
- As a **Warehouse Manager**, I want to **track purchase orders** so that **I can plan receiving**

**Acceptance Criteria**:
- ✅ System allows creating purchase orders from requisitions or directly
- ✅ System supports purchase order status: Draft, Pending, Approved, Received, Cancelled
- ✅ System requires approval workflow for purchase orders
- ✅ System tracks purchase order dates (order_date, expected_delivery_date)
- ✅ System calculates purchase order totals (subtotal, tax, discount, final_amount)
- ✅ System maintains purchase order history

---

### Feature 6: Purchase Order Items Management
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Quản lý chi tiết sản phẩm trong đơn mua hàng.

**User Stories**:
- As a **Purchase Staff**, I want to **add items to purchase orders** so that **I can specify what to purchase**
- As a **Warehouse Manager**, I want to **see purchase order items** so that **I can plan receiving**

**Acceptance Criteria**:
- ✅ System allows adding products to purchase orders
- ✅ System tracks quantity, unit cost, discounts, taxes per item
- ✅ System calculates line totals and order totals
- ✅ System tracks received quantity per item
- ✅ System supports partial receiving

---

### Feature 7: Goods Receipt Processing
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Xử lý nhận hàng từ đơn mua hàng và cập nhật tồn kho.

**User Stories**:
- As a **Warehouse Staff**, I want to **receive goods from purchase orders** so that **I can update inventory**
- As a **Warehouse Manager**, I want to **verify goods receipt** so that **I can ensure accuracy**
- As a **Purchase Manager**, I want to **track goods receipt status** so that **I can monitor order fulfillment**

**Acceptance Criteria**:
- ✅ System allows creating goods receipt from purchase order
- ✅ System supports goods receipt status: Draft, Received, Verified, Cancelled
- ✅ System allows receiving partial quantities
- ✅ System updates inventory when goods receipt is verified
- ✅ System creates inventory movements for received goods
- ✅ System links goods receipt to purchase order

---

### Feature 8: Quality Inspection Integration
**Priority**: High  
**Status**: Planned

**Mô tả**: Tích hợp kiểm tra chất lượng trong quy trình nhận hàng.

**User Stories**:
- As a **Quality Control Manager**, I want to **inspect received goods** so that **I can ensure quality standards**
- As a **Warehouse Manager**, I want to **see quality inspection results** so that **I can decide whether to accept goods**

**Acceptance Criteria**:
- ✅ System supports quality inspection workflow
- ✅ System tracks inspection results (Pass, Fail, Conditional)
- ✅ System allows rejecting goods based on inspection
- ✅ System maintains inspection history
- ✅ System links inspection to goods receipt

---

### Feature 9: Invoice Matching (3-way Matching)
**Priority**: High  
**Status**: Planned

**Mô tả**: Đối chiếu hóa đơn với đơn mua hàng và phiếu nhận hàng.

**User Stories**:
- As an **Accountant**, I want to **match invoices with purchase orders and receipts** so that **I can ensure invoice accuracy**
- As a **Finance Manager**, I want to **see invoice matching status** so that **I can control payment processing**

**Acceptance Criteria**:
- ✅ System supports 3-way matching (PO, Receipt, Invoice)
- ✅ System validates invoice amounts against purchase order
- ✅ System validates invoice quantities against goods receipt
- ✅ System flags discrepancies for review
- ✅ System requires matching before payment approval

---

### Feature 10: Supplier Contract Management
**Priority**: Medium  
**Status**: Planned

**Mô tả**: Quản lý hợp đồng với nhà cung cấp.

**User Stories**:
- As a **Purchase Manager**, I want to **manage supplier contracts** so that **I can formalize supplier agreements**
- As a **Legal Manager**, I want to **track contract terms** so that **I can ensure compliance**

**Acceptance Criteria**:
- ✅ System allows creating supplier contracts
- ✅ System tracks contract dates and terms
- ✅ System manages contract lifecycle
- ✅ System links contracts to purchase orders
- ✅ System tracks contract performance

---

## 📊 Metrics & KPIs

### Business Metrics
- **Purchase Order Processing Time**: < 2 days
- **Purchase Order Accuracy**: > 98%
- **Supplier On-time Delivery Rate**: > 90%
- **Cost Savings from Negotiation**: Tracked monthly
- **Supplier Quality Score**: > 4.0/5.0

### Technical Metrics
- **Purchase Order Creation Performance**: < 2 seconds
- **Goods Receipt Processing**: < 1 second
- **System Uptime**: > 99.9%

---

## 🔗 Dependencies

### Internal Dependencies
- **Product Service**: For product information
- **Inventory Service**: For inventory updates
- **Financial Service**: For invoice matching and payment
- **Supplier Service**: For supplier information (if separate service)

### External Dependencies
- None

---

## 📝 Notes

- Purchase order management is critical for inventory replenishment
- Supplier performance tracking helps optimize supplier selection
- Quality inspection ensures product quality
- 3-way matching prevents payment errors
- Purchase requisition workflow controls spending

---

**Last Updated**: November 2025  
**Next Review**: December 2025

