# Test Cases: Financial Management (EPIC-006)

## Overview
Test cases cho Epic Quản Lý Tài Chính (EPIC-006) bao gồm quản lý hóa đơn, thanh toán, công nợ phải thu/phải trả, và báo cáo tài chính.

## Test Scenarios

### Feature 1: Invoice Management

#### TC-FIN-001: Create Invoice from Sales Order - Happy Path
**Priority**: Critical  
**Type**: E2E  
**Description**: Tạo hóa đơn từ đơn hàng bán

**Preconditions**:
- Đã có sales order với status = Delivered
- Sales order có items

**Test Steps**:
1. Navigate to `/admin/financial/invoices`
2. Click "Create from Sales Order"
3. Select sales order
4. Review invoice items (copied from order)
5. System calculate totals:
   - Subtotal
   - Tax
   - Discount
   - Total
6. Click "Save"

**Expected Results**:
- Invoice được tạo với status = Draft
- Invoice items giống order items
- Totals được tính đúng
- Invoice được link với sales order

#### TC-FIN-002: Create Invoice - Manual
**Priority**: High  
**Type**: E2E  
**Description**: Tạo hóa đơn thủ công

**Preconditions**:
- Đã có customer

**Test Steps**:
1. Navigate to `/admin/financial/invoices`
2. Click "Create Invoice"
3. Select customer
4. Select invoice type: SALES
5. Add items:
   - Product 1: Quantity = 10, Unit Price = 100000
   - Product 2: Quantity = 5, Unit Price = 200000
6. System calculate totals
7. Click "Save"

**Expected Results**:
- Invoice được tạo với status = Draft
- Totals được tính đúng
- Invoice có thể được sent

#### TC-FIN-003: Send Invoice
**Priority**: High  
**Type**: E2E  
**Description**: Gửi hóa đơn cho khách hàng

**Preconditions**:
- Đã có invoice với status = Draft

**Test Steps**:
1. Navigate to invoice detail
2. Click "Send Invoice"
3. Confirm sending

**Expected Results**:
- Invoice status = SENT
- Invoice được gửi đến customer email
- Invoice PDF được generate
- Due date được set

#### TC-FIN-004: Update Invoice Status
**Priority**: High  
**Type**: E2E  
**Description**: Cập nhật trạng thái hóa đơn

**Preconditions**:
- Đã có invoice với status = SENT

**Test Steps**:
1. Navigate to invoice detail
2. Update status: PAID
3. Confirm update

**Expected Results**:
- Invoice status = PAID
- Status change history được ghi nhận
- Payment được link với invoice

#### TC-FIN-005: Mark Invoice as Overdue
**Priority**: High  
**Type**: E2E  
**Description**: Đánh dấu hóa đơn quá hạn

**Preconditions**:
- Đã có invoice với due_date = yesterday
- Invoice status = SENT

**Test Steps**:
1. System check overdue invoices (scheduled job)
2. View invoice status

**Expected Results**:
- Invoice status = OVERDUE (auto update)
- Overdue notification được gửi
- Invoice được hiển thị trong overdue list

### Feature 2: Invoice Items Management

#### TC-FIN-006: Add Item to Invoice
**Priority**: High  
**Type**: E2E  
**Description**: Thêm sản phẩm vào hóa đơn

**Preconditions**:
- Đã có invoice với status = Draft

**Test Steps**:
1. Navigate to invoice detail
2. Click "Add Item"
3. Select product
4. Enter quantity = 10
5. Enter unit price = 100000
6. Click "Save"

**Expected Results**:
- Item được thêm vào invoice
- Line total = quantity * unit_price
- Invoice total được recalculate

#### TC-FIN-007: Update Item in Invoice
**Priority**: Medium  
**Type**: E2E  
**Description**: Cập nhật item trong hóa đơn

**Preconditions**:
- Đã có invoice với items

**Test Steps**:
1. Navigate to invoice detail
2. Click "Edit" cho item
3. Update quantity = 15
4. Click "Save"

**Expected Results**:
- Item được cập nhật
- Line total được recalculate
- Invoice total được recalculate

#### TC-FIN-008: Remove Item from Invoice
**Priority**: Medium  
**Type**: E2E  
**Description**: Xóa item khỏi hóa đơn

**Preconditions**:
- Đã có invoice với multiple items

**Test Steps**:
1. Navigate to invoice detail
2. Click "Delete" cho item
3. Confirm deletion

**Expected Results**:
- Item được xóa khỏi invoice
- Invoice total được recalculate
- Invoice phải có ít nhất 1 item

### Feature 3: Payment Processing & Tracking

#### TC-FIN-009: Record Payment - Full Payment
**Priority**: Critical  
**Type**: E2E  
**Description**: Ghi nhận thanh toán đầy đủ cho hóa đơn

**Preconditions**:
- Đã có invoice với total = 1000000
- Invoice status = SENT

**Test Steps**:
1. Navigate to invoice detail
2. Click "Record Payment"
3. Fill payment details:
   - Payment Method: Bank Transfer
   - Payment Amount: 1000000 (full)
   - Payment Date: Today
   - Reference Number: "REF-001"
4. Click "Save"

**Expected Results**:
- Payment được ghi nhận
- Invoice paid_amount = 1000000
- Invoice balance = 0
- Invoice status = PAID
- Accounts Receivable được cập nhật

#### TC-FIN-010: Record Payment - Partial Payment
**Priority**: High  
**Type**: E2E  
**Description**: Ghi nhận thanh toán một phần

**Preconditions**:
- Đã có invoice với total = 1000000

**Test Steps**:
1. Navigate to invoice detail
2. Click "Record Payment"
3. Fill payment details:
   - Payment Amount: 500000 (partial)
4. Click "Save"

**Expected Results**:
- Payment được ghi nhận
- Invoice paid_amount = 500000
- Invoice balance = 500000
- Invoice status = SENT (vẫn còn balance)
- Accounts Receivable được cập nhật

#### TC-FIN-011: Record Payment - Over Payment
**Priority**: High  
**Type**: E2E  
**Description**: Ghi nhận thanh toán vượt quá số tiền hóa đơn

**Preconditions**:
- Đã có invoice với total = 1000000

**Test Steps**:
1. Try to record payment với amount = 1500000 (over)

**Expected Results**:
- Validation error: "Payment amount không được vượt quá invoice balance"
- Hoặc system cho phép over payment và tạo credit balance
- Payment không được ghi nhận (nếu business rule không cho phép)

#### TC-FIN-012: Record Multiple Payments
**Priority**: Medium  
**Type**: E2E  
**Description**: Ghi nhận nhiều thanh toán cho cùng hóa đơn

**Preconditions**:
- Đã có invoice với total = 1000000

**Test Steps**:
1. Record payment 1: 300000
2. Record payment 2: 400000
3. Record payment 3: 300000
4. Check invoice status

**Expected Results**:
- All payments được ghi nhận
- Total paid = 1000000
- Invoice balance = 0
- Invoice status = PAID
- Payment history được maintain

### Feature 4: Accounts Receivable Management

#### TC-FIN-013: View Accounts Receivable Aging
**Priority**: High  
**Type**: E2E  
**Description**: Xem aging analysis công nợ phải thu

**Preconditions**:
- Customer có invoices với different due dates

**Test Steps**:
1. Navigate to `/admin/financial/accounts-receivable`
2. View aging analysis
3. Check aging buckets:
   - Current (0-30 days)
   - 30 days (31-60 days)
   - 60 days (61-90 days)
   - 90+ days (>90 days)

**Expected Results**:
- Aging analysis hiển thị đúng
- Totals được tính đúng cho mỗi bucket
- Customers được list với aging amounts

#### TC-FIN-014: View Customer Outstanding Balance
**Priority**: Medium  
**Type**: E2E  
**Description**: Xem số dư công nợ của khách hàng

**Preconditions**:
- Customer có multiple invoices

**Test Steps**:
1. Navigate to customer detail
2. View "Accounts Receivable" section
3. Check outstanding balance

**Expected Results**:
- Outstanding balance = sum of all unpaid invoice balances
- Balance được tính real-time
- Aging breakdown được hiển thị

#### TC-FIN-015: Calculate Days Sales Outstanding (DSO)
**Priority**: Medium  
**Type**: E2E  
**Description**: Tính toán DSO

**Preconditions**:
- Customer có sales và receivables history

**Test Steps**:
1. Navigate to accounts receivable report
2. View DSO calculation

**Expected Results**:
- DSO = (Accounts Receivable / Total Sales) * Number of Days
- DSO được tính đúng
- DSO được hiển thị trong report

### Feature 5: Accounts Payable Management

#### TC-FIN-016: View Accounts Payable Aging
**Priority**: High  
**Type**: E2E  
**Description**: Xem aging analysis công nợ phải trả

**Preconditions**:
- Supplier có invoices với different due dates

**Test Steps**:
1. Navigate to `/admin/financial/accounts-payable`
2. View aging analysis
3. Check aging buckets

**Expected Results**:
- Aging analysis hiển thị đúng
- Totals được tính đúng
- Suppliers được list với aging amounts

#### TC-FIN-017: Record Supplier Payment
**Priority**: High  
**Type**: E2E  
**Description**: Ghi nhận thanh toán cho nhà cung cấp

**Preconditions**:
- Đã có supplier invoice với status = Matched

**Test Steps**:
1. Navigate to supplier invoice detail
2. Click "Record Payment"
3. Fill payment details:
   - Payment Method: Bank Transfer
   - Payment Amount: Full amount
   - Payment Date: Today
4. Click "Save"

**Expected Results**:
- Payment được ghi nhận
- Supplier invoice status = PAID
- Accounts Payable được cập nhật
- Payment được link với invoice

#### TC-FIN-018: Calculate Days Payable Outstanding (DPO)
**Priority**: Medium  
**Type**: E2E  
**Description**: Tính toán DPO

**Preconditions**:
- Company có purchase và payables history

**Test Steps**:
1. Navigate to accounts payable report
2. View DPO calculation

**Expected Results**:
- DPO = (Accounts Payable / Total Purchases) * Number of Days
- DPO được tính đúng
- DPO được hiển thị trong report

### Feature 6: Invoice Status Management

#### TC-FIN-019: Invoice Status Workflow
**Priority**: High  
**Type**: E2E  
**Description**: Theo dõi workflow trạng thái hóa đơn

**Test Steps**:
1. Create invoice → Status = DRAFT
2. Send invoice → Status = SENT
3. Payment received → Status = PAID
4. Or invoice overdue → Status = OVERDUE

**Expected Results**:
- Status transitions đúng theo workflow
- Status change history được ghi nhận
- Notifications được gửi ở mỗi status change

#### TC-FIN-020: Cancel Invoice
**Priority**: Medium  
**Type**: E2E  
**Description**: Hủy hóa đơn

**Preconditions**:
- Đã có invoice với status = DRAFT

**Test Steps**:
1. Navigate to invoice detail
2. Click "Cancel Invoice"
3. Enter cancellation reason
4. Confirm cancellation

**Expected Results**:
- Invoice status = CANCELLED
- Cancellation reason được lưu
- Invoice không thể được sent hoặc paid

### Feature 7: Credit Note & Debit Note Management

#### TC-FIN-021: Create Credit Note
**Priority**: High  
**Type**: E2E  
**Description**: Tạo ghi có để điều chỉnh hóa đơn

**Preconditions**:
- Đã có invoice với status = SENT hoặc PAID

**Test Steps**:
1. Navigate to invoice detail
2. Click "Create Credit Note"
3. Fill credit note details:
   - Reason: "Returned goods"
   - Amount: 100000
   - Items: Select items to credit
4. Click "Save"

**Expected Results**:
- Credit note được tạo
- Credit note được link với original invoice
- Invoice balance được giảm
- Accounts Receivable được cập nhật

#### TC-FIN-022: Create Debit Note
**Priority**: High  
**Type**: E2E  
**Description**: Tạo ghi nợ để điều chỉnh hóa đơn nhà cung cấp

**Preconditions**:
- Đã có supplier invoice

**Test Steps**:
1. Navigate to supplier invoice detail
2. Click "Create Debit Note"
3. Fill debit note details:
   - Reason: "Additional charges"
   - Amount: 50000
4. Click "Save"

**Expected Results**:
- Debit note được tạo
- Debit note được link với original invoice
- Invoice balance được tăng
- Accounts Payable được cập nhật

### Feature 8: Payment Method Management

#### TC-FIN-023: Configure Payment Methods
**Priority**: Medium  
**Type**: E2E  
**Description**: Cấu hình phương thức thanh toán

**Test Steps**:
1. Navigate to `/admin/financial/payment-methods`
2. Click "Add Payment Method"
3. Fill form:
   - Name: "Bank Transfer"
   - Code: "BANK_TRANSFER"
   - Requires Approval: No
4. Click "Save"

**Expected Results**:
- Payment method được tạo
- Payment method có thể được sử dụng khi record payment

#### TC-FIN-024: Payment Method Approval Workflow
**Priority**: Medium  
**Type**: E2E  
**Description**: Phương thức thanh toán cần approval

**Preconditions**:
- Payment method có requires_approval = true

**Test Steps**:
1. Record payment với payment method cần approval
2. Payment status = Pending Approval
3. Approver reviews và approves

**Expected Results**:
- Payment chờ approval
- Approval workflow được trigger
- Payment được approve và processed

## Edge Cases

#### TC-FIN-EC-001: Invoice with Zero Amount
**Priority**: Low  
**Type**: E2E  
**Description**: Tạo hóa đơn với tổng tiền = 0

**Test Steps**:
1. Create invoice
2. Add items với total = 0
3. Click "Save"

**Expected Results**:
- Validation error: "Invoice total phải > 0"
- Hoặc invoice được tạo nếu business rule cho phép

#### TC-FIN-EC-002: Payment with Negative Amount
**Priority**: Low  
**Type**: E2E  
**Description**: Ghi nhận thanh toán với số tiền âm

**Test Steps**:
1. Try to record payment với amount = -1000

**Expected Results**:
- Validation error: "Payment amount phải > 0"
- Payment không được ghi nhận

#### TC-FIN-EC-003: Multiple Invoices for Same Order
**Priority**: Medium  
**Type**: E2E  
**Description**: Tạo nhiều hóa đơn cho cùng đơn hàng

**Preconditions**:
- Sales order có total = 1000000

**Test Steps**:
1. Create invoice 1 từ order: 600000
2. Create invoice 2 từ order: 400000
3. Check order invoiced amount

**Expected Results**:
- Both invoices được tạo
- Order invoiced amount = 1000000
- Order có thể được fully invoiced

## Error Cases

#### TC-FIN-ERR-001: API Error - Financial Service Down
**Priority**: High  
**Type**: E2E  
**Description**: Xử lý khi Financial Service down

**Test Steps**:
1. Mock Financial Service 500 error
2. Try to create invoice

**Expected Results**:
- Error message được hiển thị
- User có thể retry
- Transaction được rollback

#### TC-FIN-ERR-002: Payment Gateway Error
**Priority**: High  
**Type**: E2E  
**Description**: Xử lý khi payment gateway error

**Test Steps**:
1. Mock payment gateway error
2. Try to process payment

**Expected Results**:
- Error message được hiển thị
- Payment không được processed
- User có thể retry

## Business Rules Validation

#### TC-FIN-BR-001: Invoice Total Calculation
**Priority**: Critical  
**Type**: E2E  
**Description**: Tính tổng hóa đơn phải đúng

**Expected Results**:
- Total = Subtotal + Tax - Discount
- Calculation đúng trong mọi trường hợp

#### TC-FIN-BR-002: Payment Cannot Exceed Invoice Balance
**Priority**: Critical  
**Type**: E2E  
**Description**: Thanh toán không được vượt quá số dư hóa đơn

**Expected Results**:
- Validation error nếu payment > balance
- Hoặc approval required cho over payment

#### TC-FIN-BR-003: Invoice Must Have At Least One Item
**Priority**: High  
**Type**: E2E  
**Description**: Hóa đơn phải có ít nhất 1 item

**Expected Results**:
- Validation error nếu invoice không có items
- Invoice không được tạo

## Test Data Requirements

### Test Customers
- Customer 1: Code="CUST-001", Credit Limit=10000000

### Test Invoices
- Invoice 1: Customer=Customer 1, Type=SALES, Status=SENT, Total=1000000, Due Date=Today+30
- Invoice 2: Customer=Customer 1, Type=SALES, Status=PAID, Total=500000

### Test Payments
- Payment 1: Invoice=Invoice 1, Amount=1000000, Method=Bank Transfer, Status=Completed

## Test Coverage

### Happy Path Coverage: ✅
- Invoice creation and management
- Payment processing
- Accounts receivable/payable management
- Credit/debit note management
- Payment method management

### Edge Cases Coverage: ✅
- Zero amounts
- Negative amounts
- Multiple invoices

### Error Cases Coverage: ✅
- Service failures
- Payment gateway errors

### Business Rules Coverage: ✅
- Invoice total calculation
- Payment validation
- Invoice item requirements

## Notes
- All financial operations should maintain audit trail
- Invoice totals must be calculated correctly
- Payments must be validated against invoice balances
- Accounts receivable/payable must be updated in real-time
- Financial data accuracy is critical

