# Epic: Quản Lý Tài Chính

## 📋 Thông Tin Epic

**Epic ID**: EPIC-006  
**Epic Name**: Quản Lý Tài Chính (Financial Management)  
**Priority**: Critical  
**Business Value**: Critical  
**Status**: In Progress  
**Owner**: Product Owner  
**Created**: November 2025

**Related Services**: financial-service, sales-service, purchase-service, customer-service  
**Related Database Tables**: invoices, invoice_items, payments, payment_items, accounts_receivable, accounts_payable, cash_flow, credit_notes, debit_notes, taxes, currencies, exchange_rates  
**Traceability**: [Traceability Matrix](../traceability-matrix.md#epic-006-financial-management)  
**Service Mapping**: [Service Mapping](../service-mapping.md#epic-006-financial-management)  
**Database Mapping**: [Database Mapping](../database-mapping.md#epic-006-financial-management)  
**Dependencies**: [Dependencies](../dependencies.md#epic-006-financial-management)

---

## 🎯 Mô Tả Epic

Epic này tập trung vào quản lý tài chính, hóa đơn, thanh toán, và báo cáo tài chính. Hệ thống hỗ trợ quản lý công nợ phải thu, công nợ phải trả, và báo cáo tài chính.

---

## 💼 Mục Tiêu Kinh Doanh

1. **Quản lý dòng tiền**: Tối ưu hóa dòng tiền thông qua quản lý công nợ hiệu quả
2. **Giảm rủi ro**: Giảm rủi ro tín dụng thông qua quản lý công nợ
3. **Tăng độ chính xác**: Đảm bảo độ chính xác tài chính > 99%
4. **Tuân thủ**: Đảm bảo tuân thủ các quy định tài chính và thuế

---

## 🚀 Features

### Feature 1: Invoice Management
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Quản lý hóa đơn bán hàng và mua hàng với nhiều loại hóa đơn.

**User Stories**:
- As an **Accountant**, I want to **create invoices from sales orders** so that **I can bill customers**
- As a **Finance Manager**, I want to **track invoice status** so that **I can monitor collections**
- As a **Customer**, I want to **receive invoices** so that **I can process payments**

**Acceptance Criteria**:
- ✅ System allows creating invoices from sales orders
- ✅ System supports invoice types: SALES, PURCHASE, CREDIT_NOTE, DEBIT_NOTE
- ✅ System manages invoice status: DRAFT, SENT, PAID, OVERDUE, CANCELLED
- ✅ System calculates invoice totals (subtotal, tax, discount, total)
- ✅ System tracks paid amount and balance
- ✅ System maintains invoice history

---

### Feature 2: Invoice Items Management
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Quản lý chi tiết sản phẩm trong hóa đơn.

**User Stories**:
- As an **Accountant**, I want to **add items to invoices** so that **I can specify what is being billed**
- As a **Finance Manager**, I want to **see invoice line items** so that **I can review invoice details**

**Acceptance Criteria**:
- ✅ System allows adding products to invoices
- ✅ System tracks quantity, unit price, discounts, taxes per item
- ✅ System calculates line totals and invoice totals
- ✅ System supports product descriptions and notes

---

### Feature 3: Payment Processing & Tracking
**Priority**: Critical  
**Status**: In Progress

**Mô tả**: Xử lý và theo dõi thanh toán từ khách hàng và cho nhà cung cấp.

**User Stories**:
- As an **Accountant**, I want to **record customer payments** so that **I can update accounts receivable**
- As a **Finance Manager**, I want to **track payment status** so that **I can monitor cash flow**
- As a **Customer**, I want to **make payments** so that **I can settle my invoices**

**Acceptance Criteria**:
- ✅ System allows recording payments against invoices
- ✅ System supports multiple payment methods
- ✅ System tracks payment dates and amounts
- ✅ System updates invoice paid amount and balance
- ✅ System maintains payment history
- ✅ System supports partial payments

---

### Feature 4: Accounts Receivable Management
**Priority**: Critical  
**Status**: In Progress

**Mô tả**: Quản lý công nợ phải thu từ khách hàng.

**User Stories**:
- As a **Finance Manager**, I want to **see accounts receivable aging** so that **I can prioritize collections**
- As a **Credit Manager**, I want to **track customer credit** so that **I can manage credit risk**
- As an **Accountant**, I want to **see customer balances** so that **I can reconcile accounts**

**Acceptance Criteria**:
- ✅ System tracks customer outstanding balances
- ✅ System provides aging analysis (current, 30, 60, 90+ days)
- ✅ System identifies overdue invoices
- ✅ System calculates days sales outstanding (DSO)
- ✅ System generates accounts receivable reports

---

### Feature 5: Accounts Payable Management
**Priority**: Critical  
**Status**: In Progress

**Mô tả**: Quản lý công nợ phải trả cho nhà cung cấp.

**User Stories**:
- As a **Finance Manager**, I want to **see accounts payable aging** so that **I can plan payments**
- As an **Accountant**, I want to **track supplier balances** so that **I can reconcile accounts**
- As a **Purchase Manager**, I want to **see payment due dates** so that **I can maintain supplier relationships**

**Acceptance Criteria**:
- ✅ System tracks supplier outstanding balances
- ✅ System provides aging analysis (current, 30, 60, 90+ days)
- ✅ System identifies invoices due for payment
- ✅ System calculates days payable outstanding (DPO)
- ✅ System generates accounts payable reports

---

### Feature 6: Cash Flow Management
**Priority**: High  
**Status**: Planned

**Mô tả**: Quản lý và dự báo dòng tiền.

**User Stories**:
- As a **CFO**, I want to **see cash flow forecast** so that **I can plan cash management**
- As a **Finance Manager**, I want to **track cash inflows and outflows** so that **I can optimize cash flow**
- As a **Treasurer**, I want to **see cash position** so that **I can manage liquidity**

**Acceptance Criteria**:
- ✅ System tracks cash inflows (customer payments)
- ✅ System tracks cash outflows (supplier payments, expenses)
- ✅ System provides cash flow forecast
- ✅ System displays cash position dashboard
- ✅ System generates cash flow reports

---

### Feature 7: Financial Reporting
**Priority**: High  
**Status**: Planned

**Mô tả**: Báo cáo tài chính bao gồm P&L, Balance Sheet, và Cash Flow.

**User Stories**:
- As a **CFO**, I want to **see financial reports** so that **I can assess financial performance**
- As an **Accountant**, I want to **generate financial statements** so that **I can prepare for audits**
- As a **Business Owner**, I want to **see profit and loss** so that **I can track business performance**

**Acceptance Criteria**:
- ✅ System generates Profit & Loss (P&L) statements
- ✅ System generates Balance Sheet
- ✅ System generates Cash Flow statements
- ✅ System supports period selection (monthly, quarterly, yearly)
- ✅ System exports reports to various formats (PDF, Excel)
- ✅ System maintains report history

---

### Feature 8: Invoice Status Management
**Priority**: High  
**Status**: Completed

**Mô tả**: Quản lý trạng thái hóa đơn với workflow và notifications.

**User Stories**:
- As an **Accountant**, I want to **update invoice status** so that **I can track invoice lifecycle**
- As a **Finance Manager**, I want to **receive overdue invoice alerts** so that **I can take action**
- As a **Customer**, I want to **see invoice status** so that **I know payment status**

**Acceptance Criteria**:
- ✅ System supports invoice status workflow
- ✅ System tracks status changes with timestamps
- ✅ System sends notifications on status changes
- ✅ System automatically marks invoices as overdue
- ✅ System displays status in invoice listings

**Invoice Status Flow**:
DRAFT → SENT → PAID / OVERDUE → CANCELLED

---

### Feature 9: Credit Note & Debit Note Management
**Priority**: Medium  
**Status**: Completed

**Mô tả**: Quản lý ghi có và ghi nợ để điều chỉnh hóa đơn.

**User Stories**:
- As an **Accountant**, I want to **create credit notes** so that **I can adjust customer invoices**
- As an **Accountant**, I want to **create debit notes** so that **I can adjust supplier invoices**
- As a **Finance Manager**, I want to **track credit and debit notes** so that **I can monitor adjustments**

**Acceptance Criteria**:
- ✅ System allows creating credit notes for customer adjustments
- ✅ System allows creating debit notes for supplier adjustments
- ✅ System links credit/debit notes to original invoices
- ✅ System updates invoice balances when notes are applied
- ✅ System maintains note history

---

### Feature 10: Payment Method Management
**Priority**: Medium  
**Status**: Completed

**Mô tả**: Quản lý phương thức thanh toán và cấu hình.

**User Stories**:
- As a **System Administrator**, I want to **configure payment methods** so that **payment methods match business needs**
- As an **Accountant**, I want to **select payment methods** so that **I can record payments correctly**

**Acceptance Criteria**:
- ✅ System supports multiple payment methods (Cash, Bank Transfer, Credit Card, etc.)
- ✅ System allows configuring payment method settings
- ✅ System supports payment method approval workflow
- ✅ System tracks payment method usage

---

### Feature 11: Tax Management
**Priority**: High  
**Status**: Planned

**Mô tả**: Quản lý thuế và tính toán thuế cho hóa đơn.

**User Stories**:
- As an **Accountant**, I want to **configure tax rates** so that **taxes are calculated correctly**
- As an **Accountant**, I want to **see tax calculations** so that **I can verify tax amounts**
- As a **Tax Officer**, I want to **see tax reports** so that **I can prepare tax returns**

**Acceptance Criteria**:
- ✅ System supports multiple tax rates
- ✅ System calculates tax per invoice item
- ✅ System calculates total tax for invoices
- ✅ System generates tax reports
- ✅ System supports tax exemptions

---

### Feature 12: Multi-currency Support
**Priority**: Medium  
**Status**: Planned

**Mô tả**: Hỗ trợ đa tiền tệ cho hóa đơn và thanh toán.

**User Stories**:
- As an **Accountant**, I want to **create invoices in different currencies** so that **I can handle international transactions**
- As a **Finance Manager**, I want to **see currency exchange rates** so that **I can manage foreign exchange risk**

**Acceptance Criteria**:
- ✅ System supports multiple currencies (VND, USD, EUR, etc.)
- ✅ System tracks exchange rates
- ✅ System converts amounts between currencies
- ✅ System displays currency in invoices and reports

---

## 📊 Metrics & KPIs

### Business Metrics
- **Invoice Accuracy**: > 99%
- **Days Sales Outstanding (DSO)**: < 45 days
- **Days Payable Outstanding (DPO)**: Optimized
- **Collection Rate**: > 90%
- **Bad Debt Rate**: < 2%

### Technical Metrics
- **Invoice Creation Performance**: < 2 seconds
- **Payment Processing**: < 1 second
- **Report Generation**: < 5 seconds
- **System Uptime**: > 99.9%

---

## 🔗 Dependencies

### Internal Dependencies
- **Sales Service**: For sales order integration
- **Purchase Service**: For purchase order integration
- **Customer Service**: For customer information
- **Supplier Service**: For supplier information

### External Dependencies
- **Payment Gateways**: For payment processing
- **Tax Systems**: For tax compliance (Vietnam Tax System)

---

## 📝 Notes

- Financial management is critical for business operations
- Invoice accuracy is essential for compliance
- Accounts receivable management helps optimize cash flow
- Financial reporting supports business decision-making
- Tax management ensures compliance

---

**Last Updated**: November 2025  
**Next Review**: December 2025

