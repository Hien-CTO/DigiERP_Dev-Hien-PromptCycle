# Epic: Quản Lý Khách Hàng & CRM

## 📋 Thông Tin Epic

**Epic ID**: EPIC-003  
**Epic Name**: Quản Lý Khách Hàng & CRM (Customer Management)  
**Priority**: High  
**Business Value**: High  
**Status**: In Progress  
**Owner**: Product Owner  
**Created**: November 2025

**Related Services**: customer-service, sales-service, financial-service, product-service  
**Related Database Tables**: customers, customer_companies, customer_contacts, customer_contracts, customer_segments, customer_audit_logs, rfm_scores, customer_support_tickets  
**Traceability**: [Traceability Matrix](../traceability-matrix.md#epic-003-customer-management)  
**Service Mapping**: [Service Mapping](../service-mapping.md#epic-003-customer-management)  
**Database Mapping**: [Database Mapping](../database-mapping.md#epic-003-customer-management)  
**Dependencies**: [Dependencies](../dependencies.md#epic-003-customer-management)

---

## 🎯 Mô Tả Epic

Epic này tập trung vào quản lý thông tin khách hàng, phân khúc khách hàng, hợp đồng, và quan hệ khách hàng 360 độ. Hệ thống hỗ trợ quản lý các loại khách hàng đặc thù của ngành thủy sản như trang trại nuôi tôm, trang trại nuôi cá, nhà phân phối, và phòng thí nghiệm.

---

## 💼 Mục Tiêu Kinh Doanh

1. **Tăng tỷ lệ chuyển đổi**: Tăng 25% tỷ lệ chuyển đổi thông qua CRM tích hợp
2. **Cải thiện quan hệ khách hàng**: Quản lý 360° customer view
3. **Tối ưu phân khúc**: Phân khúc khách hàng hiệu quả để tối đa hóa giá trị
4. **Quản lý hợp đồng**: Quản lý hợp đồng và điều khoản hiệu quả

---

## 🚀 Features

### Feature 1: Customer Information Management
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Quản lý thông tin cơ bản của khách hàng bao gồm thông tin liên hệ, địa chỉ, mã số thuế, và thông tin thanh toán.

**User Stories**:
- As a **Sales Representative**, I want to **create and manage customer information** so that **I can maintain accurate customer data**
- As a **Sales Manager**, I want to **view customer details** so that **I can understand customer needs**
- As an **Accountant**, I want to **see customer payment information** so that **I can manage accounts receivable**

**Acceptance Criteria**:
- ✅ System allows creating customers with code, name, contact information
- ✅ System supports customer types: Company, Individual
- ✅ System tracks customer tax code and business information
- ✅ System manages customer credit limit and payment terms
- ✅ System supports customer status management (Active, Inactive, Suspended)
- ✅ System maintains customer creation and update history

---

### Feature 2: Customer Segmentation
**Priority**: High  
**Status**: Completed

**Mô tả**: Phân khúc khách hàng theo ngành thủy sản và quy mô kinh doanh.

**User Stories**:
- As a **Sales Manager**, I want to **segment customers by industry type** so that **I can tailor sales strategies**
- As a **Marketing Manager**, I want to **target specific customer segments** so that **I can run effective campaigns**

**Acceptance Criteria**:
- ✅ System supports customer groups: Trang Trại Nuôi Tôm, Trang Trại Nuôi Cá, Nhà Phân Phối, Phòng Thí Nghiệm
- ✅ System allows creating custom customer groups
- ✅ System supports customer group colors for visual identification
- ✅ System allows assigning customers to multiple groups
- ✅ System displays customer group information in customer listings

**Customer Segments**:
- **Trang Trại Nuôi Tôm**: Quy mô lớn (>50ha), trung bình (10-50ha), nhỏ (<10ha)
- **Trang Trại Nuôi Cá**: Nước ngọt, nước mặn, nước lợ
- **Nhà Phân Phối**: Cấp 1, Cấp 2, Đại lý
- **Phòng Thí Nghiệm**: Kiểm định chất lượng, xét nghiệm bệnh

---

### Feature 3: Customer Contacts Management
**Priority**: High  
**Status**: Completed

**Mô tả**: Quản lý nhiều liên hệ cho mỗi khách hàng với các vai trò khác nhau.

**User Stories**:
- As a **Sales Representative**, I want to **manage multiple contacts per customer** so that **I can communicate with the right person**
- As a **Customer Service Representative**, I want to **see customer contact information** so that **I can provide support efficiently**

**Acceptance Criteria**:
- ✅ System allows creating multiple contacts per customer
- ✅ System supports contact roles: Kế Toán, Nhận Hàng, Bộ Phận Kho, etc.
- ✅ System tracks contact person, phone, email, department, position
- ✅ System supports primary contact designation
- ✅ System maintains contact history and notes

---

### Feature 4: Contract Management
**Priority**: High  
**Status**: Completed

**Mô tả**: Quản lý hợp đồng với khách hàng bao gồm các loại hợp đồng và lifecycle.

**User Stories**:
- As a **Sales Manager**, I want to **create and manage customer contracts** so that **I can formalize business agreements**
- As a **Sales Representative**, I want to **see active contracts for a customer** so that **I can apply contract pricing**
- As a **Finance Manager**, I want to **track contract performance** so that **I can monitor contract compliance**

**Acceptance Criteria**:
- ✅ System supports contract types: Distribution, Retail, Wholesale, Service
- ✅ System manages contract lifecycle: Draft → Active → Expired → Renewed
- ✅ System tracks contract dates (start_date, end_date)
- ✅ System supports contract value and terms
- ✅ System allows contract auto-renewal configuration
- ✅ System links contracts to pricing rules
- ✅ System tracks contract performance metrics

**Contract Features**:
- Auto-renewal contracts
- Credit limit management
- Minimum/Maximum order values
- Special discount terms
- Contract-based pricing

---

### Feature 5: 360° Customer View
**Priority**: High  
**Status**: In Progress

**Mô tả**: Cung cấp cái nhìn toàn diện về khách hàng bao gồm thông tin, lịch sử giao dịch, và behavior patterns.

**User Stories**:
- As a **Sales Representative**, I want to **see complete customer information in one view** so that **I can understand customer context**
- As a **Sales Manager**, I want to **analyze customer behavior** so that **I can identify opportunities**

**Acceptance Criteria**:
- ✅ System displays customer basic information and contacts
- ✅ System shows customer transaction history (orders, invoices, payments)
- ✅ System displays customer preferences and behavior patterns
- ✅ System shows communication history
- ✅ System provides customer lifetime value (CLV) metrics
- ✅ System displays customer purchase frequency and patterns

---

### Feature 6: Customer Status Management
**Priority**: Medium  
**Status**: Completed

**Mô tả**: Quản lý trạng thái khách hàng với màu sắc và phân loại.

**User Stories**:
- As a **Sales Manager**, I want to **categorize customers by status** so that **I can prioritize sales efforts**
- As a **System Administrator**, I want to **configure customer statuses** so that **statuses match business needs**

**Acceptance Criteria**:
- ✅ System allows creating custom customer statuses
- ✅ System supports status colors for visual identification
- ✅ System allows assigning customers to statuses
- ✅ System displays status information in customer listings
- ✅ System supports status-based filtering

---

### Feature 7: Customer Audit Trail
**Priority**: Medium  
**Status**: Completed

**Mô tả**: Theo dõi lịch sử thay đổi thông tin khách hàng để audit và compliance.

**User Stories**:
- As a **System Administrator**, I want to **see customer data change history** so that **I can audit data modifications**
- As a **Compliance Officer**, I want to **track customer information changes** so that **I can ensure data integrity**

**Acceptance Criteria**:
- ✅ System records all customer data changes
- ✅ System tracks field name, old value, new value
- ✅ System records who made changes and when
- ✅ System provides audit log search and filtering
- ✅ System maintains audit trail for compliance

---

### Feature 8: RFM Analysis
**Priority**: Medium  
**Status**: Planned

**Mô tả**: Phân tích khách hàng theo Recency, Frequency, Monetary để phân khúc hiệu quả.

**User Stories**:
- As a **Marketing Manager**, I want to **analyze customers using RFM** so that **I can target high-value customers**
- As a **Sales Manager**, I want to **identify customer segments** so that **I can prioritize sales efforts**

**Acceptance Criteria**:
- ✅ System calculates Recency (last purchase date)
- ✅ System calculates Frequency (purchase frequency)
- ✅ System calculates Monetary (total spending)
- ✅ System segments customers into RFM groups
- ✅ System provides RFM analysis reports
- ✅ System allows filtering customers by RFM segments

---

### Feature 9: Customer Support Management
**Priority**: Medium  
**Status**: Planned

**Mô tả**: Quản lý hỗ trợ khách hàng và theo dõi yêu cầu.

**User Stories**:
- As a **Customer Service Representative**, I want to **track customer support requests** so that **I can provide timely support**
- As a **Customer Service Manager**, I want to **see support metrics** so that **I can measure service quality**

**Acceptance Criteria**:
- ✅ System allows creating support tickets
- ✅ System tracks support request status
- ✅ System links support requests to customers
- ✅ System maintains support history
- ✅ System provides support metrics and reports

---

## 📊 Metrics & KPIs

### Business Metrics
- **Customer Data Accuracy**: > 95%
- **Customer Satisfaction Score**: > 4.0/5.0
- **Customer Retention Rate**: > 80%
- **Average Customer Lifetime Value**: Tracked monthly

### Technical Metrics
- **Customer Search Performance**: < 500ms
- **360° View Load Time**: < 2 seconds
- **System Uptime**: > 99.9%

---

## 🔗 Dependencies

### Internal Dependencies
- **Sales Service**: For order history
- **Financial Service**: For invoice and payment history
- **Product Service**: For contract-based pricing

### External Dependencies
- None

---

## 📝 Notes

- Customer segmentation is critical for targeted marketing and sales
- 360° customer view provides comprehensive customer insights
- Contract management enables contract-based pricing
- RFM analysis helps identify high-value customers

---

**Last Updated**: November 2025  
**Next Review**: December 2025

