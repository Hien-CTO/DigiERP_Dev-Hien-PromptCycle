# Epic: Quản Lý Kho Hàng & Tồn Trữ

## 📋 Thông Tin Epic

**Epic ID**: EPIC-002  
**Epic Name**: Quản Lý Kho Hàng & Tồn Trữ (Inventory Management)  
**Priority**: Critical  
**Business Value**: High  
**Status**: In Progress  
**Owner**: Product Owner  
**Created**: November 2025

**Related Services**: inventory-service, product-service, sales-service, purchase-service, financial-service  
**Related Database Tables**: inventory, inventory_movements, warehouses, areas, locations, goods_receipts, goods_receipt_items, goods_issues, goods_issue_items, inventory_adjustments, inventory_transfers  
**Traceability**: [Traceability Matrix](../traceability-matrix.md#epic-002-inventory-management)  
**Service Mapping**: [Service Mapping](../service-mapping.md#epic-002-inventory-management)  
**Database Mapping**: [Database Mapping](../database-mapping.md#epic-002-inventory-management)  
**Dependencies**: [Dependencies](../dependencies.md#epic-002-inventory-management)  
**Business Analyst Docs**: [Use Cases](../business-analyst/use-cases-goods-receipt.md), [Business Rules](../business-analyst/business-rules-inventory-management.md)

---

## 🎯 Mô Tả Epic

Epic này tập trung vào quản lý kho hàng, tồn kho, nhập xuất kho, và tối ưu hóa tồn kho với các tính năng dự báo, cảnh báo, và phân tích. Hệ thống hỗ trợ quản lý nhiều kho, khu vực trong kho, và theo dõi chuyển động hàng hóa.

---

## 💼 Mục Tiêu Kinh Doanh

1. **Tối ưu tồn kho**: Giảm 30% chi phí tồn kho thông qua tối ưu hóa và dự báo
2. **Tăng độ chính xác**: Đảm bảo độ chính xác tồn kho > 95%
3. **Giảm thiểu hết hàng**: Cảnh báo sớm khi tồn kho thấp
4. **Tối ưu không gian**: Quản lý hiệu quả không gian kho

---

## 🚀 Features

### Feature 1: Warehouse Management
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Quản lý thông tin kho hàng bao gồm kho chính, kho ảo, và kho trung chuyển.

**User Stories**:
- As a **Warehouse Manager**, I want to **create and manage warehouses** so that **I can organize inventory by location**
- As a **System Administrator**, I want to **configure warehouse settings** so that **warehouses operate according to business rules**

**Acceptance Criteria**:
- ✅ System allows creating warehouses with name, code, address, and contact information
- ✅ System supports warehouse types: Main Warehouse, Virtual Warehouse, Transit Warehouse
- ✅ System tracks warehouse capacity and current utilization
- ✅ System supports warehouse status management (Active, Inactive, Maintenance)
- ✅ System allows assigning warehouse managers

---

### Feature 2: Area & Location Management
**Priority**: High  
**Status**: Completed

**Mô tả**: Quản lý khu vực và vị trí trong kho để tối ưu hóa việc lưu trữ và tìm kiếm hàng hóa.

**User Stories**:
- As a **Warehouse Manager**, I want to **organize warehouse into areas** so that **I can efficiently manage inventory locations**
- As a **Warehouse Staff**, I want to **see product locations** so that **I can quickly find and retrieve products**

**Acceptance Criteria**:
- ✅ System supports creating areas within warehouses
- ✅ System supports area types: Storage, Picking, Receiving, Shipping, Quality Control, Maintenance
- ✅ System tracks area capacity and utilization
- ✅ System supports area status management (Active, Inactive, Maintenance)
- ✅ System allows assigning products to specific areas

---

### Feature 3: Inventory Tracking & Movements
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Theo dõi tồn kho real-time và lịch sử chuyển động hàng hóa.

**User Stories**:
- As a **Warehouse Manager**, I want to **track inventory movements** so that **I can monitor stock changes**
- As a **Sales Representative**, I want to **see real-time inventory levels** so that **I can confirm product availability**
- As an **Accountant**, I want to **see inventory movement history** so that **I can reconcile inventory values**

**Acceptance Criteria**:
- ✅ System tracks quantity_on_hand, quantity_reserved, quantity_available
- ✅ System records all inventory movements (IN, OUT, TRANSFER, ADJUSTMENT)
- ✅ System links movements to reference documents (Purchase, Sales, Transfer, Adjustment)
- ✅ System maintains movement history with timestamps and user information
- ✅ System automatically updates inventory levels when movements occur
- ✅ System calculates available quantity = on_hand - reserved

---

### Feature 4: Goods Receipt Management
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Quản lý quy trình nhập kho từ đơn mua hàng hoặc điều chỉnh.

**User Stories**:
- As a **Warehouse Staff**, I want to **receive goods into warehouse** so that **I can update inventory when products arrive**
- As a **Warehouse Manager**, I want to **verify goods receipt** so that **I can ensure accuracy of received items**
- As a **Purchase Manager**, I want to **track goods receipt status** so that **I can monitor purchase order fulfillment**

**Acceptance Criteria**:
- ✅ System allows creating goods receipt from purchase order
- ✅ System supports goods receipt status: Draft, Received, Verified, Cancelled
- ✅ System allows receiving partial quantities from purchase order
- ✅ System updates inventory levels when goods receipt is verified
- ✅ System creates inventory movements for received goods
- ✅ System supports batch number entry for batch-managed products
- ✅ System supports expiry date entry for products with expiry dates

---

### Feature 5: Goods Issue Management
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Quản lý quy trình xuất kho cho đơn hàng bán hoặc điều chỉnh.

**User Stories**:
- As a **Warehouse Staff**, I want to **issue goods from warehouse** so that **I can fulfill sales orders**
- As a **Warehouse Manager**, I want to **verify goods issue** so that **I can ensure correct items are shipped**
- As a **Sales Manager**, I want to **track goods issue status** so that **I can monitor order fulfillment**

**Acceptance Criteria**:
- ✅ System allows creating goods issue from sales order
- ✅ System supports goods issue status: Draft, Pending, Issued, Verified, Cancelled
- ✅ System checks inventory availability before issuing
- ✅ System updates inventory levels when goods issue is verified
- ✅ System creates inventory movements for issued goods
- ✅ System supports batch selection for batch-managed products (FIFO/LIFO)

---

### Feature 6: Inventory Counting & Adjustment
**Priority**: High  
**Status**: Completed

**Mô tả**: Quản lý kiểm kê định kỳ và điều chỉnh chênh lệch tồn kho.

**User Stories**:
- As a **Warehouse Manager**, I want to **conduct periodic inventory counts** so that **I can maintain inventory accuracy**
- As a **Warehouse Staff**, I want to **record counted quantities** so that **I can identify discrepancies**
- As an **Accountant**, I want to **see inventory adjustments** so that **I can reconcile inventory values**

**Acceptance Criteria**:
- ✅ System allows creating inventory counting documents
- ✅ System supports counting status: Draft, In Progress, Completed, Posted, Cancelled
- ✅ System calculates variance between expected and counted quantities
- ✅ System allows creating inventory postings to adjust discrepancies
- ✅ System updates inventory levels when postings are posted
- ✅ System maintains audit trail for all adjustments

---

### Feature 7: Inventory Transfer Management
**Priority**: High  
**Status**: Completed

**Mô tả**: Quản lý chuyển kho nội bộ giữa các kho.

**User Stories**:
- As a **Warehouse Manager**, I want to **transfer inventory between warehouses** so that **I can optimize stock distribution**
- As a **Warehouse Staff**, I want to **request inventory transfers** so that **I can replenish stock in my warehouse**
- As a **System Administrator**, I want to **approve transfer requests** so that **I can control inventory movements**

**Acceptance Criteria**:
- ✅ System allows creating transfer requests between warehouses
- ✅ System supports transfer request status: Draft, Pending, Approved, Rejected, Cancelled
- ✅ System allows creating transfers from approved requests
- ✅ System supports transfer status: Draft, In Transit, Completed, Cancelled
- ✅ System updates inventory levels in both source and destination warehouses
- ✅ System creates inventory movements for transfers

---

### Feature 8: Inventory Revaluation
**Priority**: Medium  
**Status**: Completed

**Mô tả**: Quản lý đánh giá lại giá trị tồn kho.

**User Stories**:
- As an **Accountant**, I want to **revalue inventory** so that **I can adjust inventory values for accounting purposes**
- As a **Finance Manager**, I want to **see inventory revaluation history** so that **I can track value changes**

**Acceptance Criteria**:
- ✅ System allows creating inventory revaluation documents
- ✅ System supports revaluation status: Draft, Posted, Cancelled
- ✅ System allows updating unit cost for inventory items
- ✅ System calculates revaluation amount (new_cost - old_cost) * quantity
- ✅ System maintains audit trail for revaluations

---

### Feature 9: Safety Stock Management
**Priority**: High  
**Status**: Planned

**Mô tả**: Quản lý tồn kho an toàn và cảnh báo khi tồn kho dưới mức an toàn.

**User Stories**:
- As a **Warehouse Manager**, I want to **set safety stock levels** so that **I can prevent stockouts**
- As a **Purchase Manager**, I want to **receive safety stock alerts** so that **I can reorder products in time**
- As a **System Administrator**, I want to **configure safety stock calculation rules** so that **safety stock is calculated automatically**

**Acceptance Criteria**:
- ✅ System allows setting safety stock levels per product per warehouse
- ✅ System calculates safety stock based on lead time and demand variability
- ✅ System generates alerts when inventory falls below safety stock
- ✅ System sends notifications (email/SMS) for safety stock alerts
- ✅ System displays safety stock status in inventory dashboard

---

### Feature 10: Reorder Point Automation
**Priority**: High  
**Status**: Planned

**Mô tả**: Tự động tính toán điểm đặt hàng và tạo yêu cầu mua hàng.

**User Stories**:
- As a **Purchase Manager**, I want to **receive automatic reorder notifications** so that **I can order products before stockout**
- As a **System Administrator**, I want to **configure reorder point rules** so that **reorder points are calculated automatically**
- As a **Warehouse Manager**, I want to **set reorder quantities** so that **optimal order quantities are maintained**

**Acceptance Criteria**:
- ✅ System calculates reorder point based on lead time and average demand
- ✅ System allows setting reorder quantity per product
- ✅ System generates reorder notifications when inventory reaches reorder point
- ✅ System can automatically create purchase requisitions
- ✅ System sends notifications (email/SMS) for reorder alerts

---

### Feature 11: ABC Analysis
**Priority**: Medium  
**Status**: Planned

**Mô tả**: Phân loại sản phẩm theo giá trị để tối ưu hóa quản lý tồn kho.

**User Stories**:
- As a **Warehouse Manager**, I want to **see ABC classification of products** so that **I can prioritize inventory management efforts**
- As a **Finance Manager**, I want to **analyze inventory value distribution** so that **I can optimize inventory investment**

**Acceptance Criteria**:
- ✅ System classifies products into A (80% value), B (15% value), C (5% value)
- ✅ System calculates classification based on annual usage value
- ✅ System displays ABC classification in inventory reports
- ✅ System allows filtering products by ABC classification
- ✅ System provides recommendations for each classification

---

### Feature 12: Demand Forecasting
**Priority**: Medium  
**Status**: Planned

**Mô tả**: Dự báo nhu cầu sản phẩm dựa trên lịch sử tiêu thụ và mùa vụ.

**User Stories**:
- As a **Purchase Manager**, I want to **see demand forecasts** so that **I can plan purchases accurately**
- As a **Sales Manager**, I want to **see seasonal demand patterns** so that **I can adjust sales strategies**

**Acceptance Criteria**:
- ✅ System analyzes historical consumption data
- ✅ System considers seasonal patterns for aquaculture industry
- ✅ System provides demand forecasts for next period
- ✅ System displays forecast accuracy metrics
- ✅ System supports machine learning-based predictions (future enhancement)

---

## 📊 Metrics & KPIs

### Business Metrics
- **Inventory Accuracy**: > 95%
- **Stockout Rate**: < 2%
- **Inventory Turnover Ratio**: > 6 times/year
- **Warehouse Utilization**: 70-85%

### Technical Metrics
- **Real-time Inventory Update**: < 1 second
- **Inventory Movement Processing**: < 500ms
- **System Uptime**: > 99.9%

---

## 🔗 Dependencies

### Internal Dependencies
- **Product Service**: For product information
- **Sales Service**: For sales order integration
- **Purchase Service**: For purchase order integration
- **Financial Service**: For inventory valuation

### External Dependencies
- None

---

## 📝 Notes

- Inventory accuracy is critical for business operations
- Safety stock and reorder point features require historical data analysis
- ABC Analysis helps prioritize inventory management efforts
- Demand forecasting improves with more historical data

---

**Last Updated**: November 2025  
**Next Review**: December 2025

