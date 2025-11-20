# Test Cases: Purchase Management (EPIC-005)

## Overview
Test cases cho Epic Quản Lý Mua Hàng & Nhà Cung Cấp (EPIC-005) bao gồm quản lý nhà cung cấp, đơn mua hàng, yêu cầu mua hàng, và goods receipt.

## Test Scenarios

### Feature 1: Supplier Management

#### TC-PUR-001: Create Supplier - Happy Path
**Priority**: Critical  
**Type**: E2E  
**Description**: Tạo nhà cung cấp mới

**Test Steps**:
1. Navigate to `/admin/purchase/suppliers`
2. Click "Add Supplier"
3. Fill form:
   - Code: "SUP-001"
   - Name: "Nhà Cung Cấp ABC"
   - Tax Code: "0123456789"
   - Address: "123 Đường XYZ, Hà Nội"
   - Phone: "0123456789"
   - Email: "contact@supplier.com"
   - Payment Terms: Net 30
   - Credit Limit: 5000000
   - Status: Active
4. Click "Save"

**Expected Results**:
- Supplier được tạo thành công
- Hiển thị trong danh sách suppliers
- Code là unique

#### TC-PUR-002: Create Supplier - Duplicate Code
**Priority**: High  
**Type**: E2E  
**Description**: Tạo nhà cung cấp với code đã tồn tại

**Preconditions**:
- Đã có supplier với code "SUP-001"

**Test Steps**:
1. Try to create supplier với code "SUP-001"
2. Click "Save"

**Expected Results**:
- Validation error: "Supplier code đã tồn tại"
- Supplier không được tạo

#### TC-PUR-003: Update Supplier
**Priority**: High  
**Type**: E2E  
**Description**: Cập nhật thông tin nhà cung cấp

**Preconditions**:
- Đã có supplier với ID = 1

**Test Steps**:
1. Navigate to supplier detail
2. Click "Edit"
3. Update Name: "Nhà Cung Cấp ABC - Updated"
4. Update Credit Limit: 10000000
5. Click "Save"

**Expected Results**:
- Supplier được cập nhật thành công
- Audit trail ghi nhận thay đổi

### Feature 2: Purchase Requisition Workflow

#### TC-PUR-004: Create Purchase Requisition - Happy Path
**Priority**: High  
**Type**: E2E  
**Description**: Tạo yêu cầu mua hàng

**Preconditions**:
- User có quyền tạo purchase requisition

**Test Steps**:
1. Navigate to `/admin/purchase/requisitions`
2. Click "Create Requisition"
3. Fill form:
   - Department: Select department
   - Requested By: Current user
   - Items:
     - Product 1: Quantity = 10, Unit Cost = 100000
     - Product 2: Quantity = 5, Unit Cost = 200000
4. Click "Submit"

**Expected Results**:
- Requisition được tạo với status = Pending
- Requisition chờ approval
- Budget allocation được check (nếu có)

#### TC-PUR-005: Approve Purchase Requisition
**Priority**: High  
**Type**: E2E  
**Description**: Phê duyệt yêu cầu mua hàng

**Preconditions**:
- Đã có requisition với status = Pending
- User có quyền approve

**Test Steps**:
1. Navigate to requisition detail
2. Click "Approve"
3. Enter approval comments
4. Confirm approval

**Expected Results**:
- Requisition status = Approved
- Approval comments được lưu
- Requisition có thể được convert thành purchase order

#### TC-PUR-006: Reject Purchase Requisition
**Priority**: Medium  
**Type**: E2E  
**Description**: Từ chối yêu cầu mua hàng

**Preconditions**:
- Đã có requisition với status = Pending

**Test Steps**:
1. Navigate to requisition detail
2. Click "Reject"
3. Enter rejection reason
4. Confirm rejection

**Expected Results**:
- Requisition status = Rejected
- Rejection reason được lưu
- Requester được thông báo

### Feature 3: Purchase Order Management

#### TC-PUR-007: Create Purchase Order from Requisition - Happy Path
**Priority**: Critical  
**Type**: E2E  
**Description**: Tạo đơn mua hàng từ yêu cầu đã approved

**Preconditions**:
- Đã có requisition với status = Approved
- Đã có supplier

**Test Steps**:
1. Navigate to requisition detail
2. Click "Create Purchase Order"
3. Select supplier
4. Review items from requisition
5. Adjust quantities if needed
6. Click "Save"

**Expected Results**:
- Purchase order được tạo từ requisition
- PO status = Draft
- Items được copy từ requisition
- Requisition được link với PO

#### TC-PUR-008: Create Purchase Order - Direct
**Priority**: High  
**Type**: E2E  
**Description**: Tạo đơn mua hàng trực tiếp (không từ requisition)

**Preconditions**:
- Đã có supplier
- Đã có products

**Test Steps**:
1. Navigate to `/admin/purchase/orders`
2. Click "Create Purchase Order"
3. Select supplier
4. Add items:
   - Product 1: Quantity = 10, Unit Cost = 100000
   - Product 2: Quantity = 5, Unit Cost = 200000
5. System calculate totals
6. Click "Save"

**Expected Results**:
- Purchase order được tạo với status = Draft
- Totals được tính đúng:
  - Subtotal = sum(items)
  - Tax = subtotal * tax_rate
  - Discount (if any)
  - Final Amount = subtotal + tax - discount

#### TC-PUR-009: Approve Purchase Order
**Priority**: High  
**Type**: E2E  
**Description**: Phê duyệt đơn mua hàng

**Preconditions**:
- Đã có purchase order với status = Draft

**Test Steps**:
1. Navigate to purchase order detail
2. Click "Submit for Approval"
3. Approver reviews PO
4. Click "Approve"
5. Confirm approval

**Expected Results**:
- PO status = Approved
- Approval workflow được thực hiện
- Supplier có thể xem approved PO (nếu có supplier portal)

#### TC-PUR-010: Reject Purchase Order
**Priority**: Medium  
**Type**: E2E  
**Description**: Từ chối đơn mua hàng

**Preconditions**:
- Đã có purchase order pending approval

**Test Steps**:
1. Navigate to purchase order detail
2. Click "Reject"
3. Enter rejection reason
4. Confirm rejection

**Expected Results**:
- PO status = Rejected
- Rejection reason được lưu
- Creator được thông báo

#### TC-PUR-011: Update Purchase Order - Before Approval
**Priority**: Medium  
**Type**: E2E  
**Description**: Cập nhật đơn mua hàng trước khi approve

**Preconditions**:
- Đã có purchase order với status = Draft

**Test Steps**:
1. Navigate to purchase order detail
2. Click "Edit"
3. Update items or quantities
4. Click "Save"

**Expected Results**:
- PO được cập nhật thành công
- Totals được recalculate
- Status vẫn là Draft

#### TC-PUR-012: Update Purchase Order - After Approval
**Priority**: High  
**Type**: E2E  
**Description**: Cập nhật đơn mua hàng sau khi approve

**Preconditions**:
- Đã có purchase order với status = Approved

**Test Steps**:
1. Navigate to purchase order detail
2. Try to edit PO

**Expected Results**:
- Error: "Không thể chỉnh sửa PO đã được approve"
- Hoặc PO cần được cancel và tạo lại
- Hoặc PO cần approval lại cho changes

### Feature 4: Purchase Order Items Management

#### TC-PUR-013: Add Item to Purchase Order
**Priority**: High  
**Type**: E2E  
**Description**: Thêm sản phẩm vào đơn mua hàng

**Preconditions**:
- Đã có purchase order với status = Draft

**Test Steps**:
1. Navigate to purchase order detail
2. Click "Add Item"
3. Select product
4. Enter quantity = 10
5. Enter unit cost = 100000
6. Click "Save"

**Expected Results**:
- Item được thêm vào PO
- Line total = quantity * unit_cost
- PO total được recalculate

#### TC-PUR-014: Update Item in Purchase Order
**Priority**: Medium  
**Type**: E2E  
**Description**: Cập nhật item trong đơn mua hàng

**Preconditions**:
- Đã có purchase order với items

**Test Steps**:
1. Navigate to purchase order detail
2. Click "Edit" cho item
3. Update quantity = 15
4. Click "Save"

**Expected Results**:
- Item được cập nhật
- Line total được recalculate
- PO total được recalculate

#### TC-PUR-015: Remove Item from Purchase Order
**Priority**: Medium  
**Type**: E2E  
**Description**: Xóa item khỏi đơn mua hàng

**Preconditions**:
- Đã có purchase order với multiple items

**Test Steps**:
1. Navigate to purchase order detail
2. Click "Delete" cho item
3. Confirm deletion

**Expected Results**:
- Item được xóa khỏi PO
- PO total được recalculate
- PO phải có ít nhất 1 item

### Feature 5: Goods Receipt Processing

#### TC-PUR-016: Create Goods Receipt from Purchase Order - Happy Path
**Priority**: Critical  
**Type**: E2E  
**Description**: Tạo phiếu nhập kho từ đơn mua hàng

**Preconditions**:
- Đã có purchase order với status = Approved
- PO có items

**Test Steps**:
1. Navigate to purchase order detail
2. Click "Create Goods Receipt"
3. Fill received quantities:
   - Item 1: Received = 10 (ordered = 10)
   - Item 2: Received = 5 (ordered = 5)
4. For batch-managed products, enter batch numbers
5. For products with expiry, enter expiry dates
6. Click "Verify"

**Expected Results**:
- Goods receipt được tạo với status = Received
- Inventory levels được cập nhật
- PO received quantities được cập nhật
- Inventory movements được tạo (type = IN)

#### TC-PUR-017: Create Goods Receipt - Partial Receiving
**Priority**: High  
**Type**: E2E  
**Description**: Nhập kho một phần từ đơn mua hàng

**Preconditions**:
- Purchase order có item với quantity = 100

**Test Steps**:
1. Create goods receipt
2. Receive quantity = 50 (partial)
3. Click "Verify"

**Expected Results**:
- Goods receipt được tạo với received = 50
- PO có remaining quantity = 50
- PO status vẫn là Approved (chờ receive tiếp)
- Inventory được cập nhật với quantity = 50

#### TC-PUR-018: Create Goods Receipt - Over Receiving
**Priority**: High  
**Type**: E2E  
**Description**: Nhập kho vượt quá số lượng đơn mua hàng

**Preconditions**:
- Purchase order có item với quantity = 100

**Test Steps**:
1. Create goods receipt
2. Try to receive quantity = 150 (over)
3. Click "Verify"

**Expected Results**:
- Validation error: "Received quantity không được vượt quá ordered quantity"
- Hoặc system cho phép over receiving với approval
- Goods receipt không được verify nếu không có approval

#### TC-PUR-019: Complete Purchase Order Receiving
**Priority**: High  
**Type**: E2E  
**Description**: Hoàn thành nhập kho cho đơn mua hàng

**Preconditions**:
- Purchase order có items
- Tất cả items đã được receive đầy đủ

**Test Steps**:
1. Receive all items from PO
2. Check PO status

**Expected Results**:
- PO status = Received (hoặc Completed)
- All items có received quantity = ordered quantity
- PO có thể được closed

### Feature 6: Quality Inspection Integration

#### TC-PUR-020: Create Quality Inspection
**Priority**: Medium  
**Type**: E2E  
**Description**: Tạo kiểm tra chất lượng cho goods receipt

**Preconditions**:
- Đã có goods receipt với status = Received

**Test Steps**:
1. Navigate to goods receipt detail
2. Click "Create Quality Inspection"
3. Fill inspection details:
   - Inspector: Select inspector
   - Inspection Date: Today
   - Results: Pass/Fail/Conditional
   - Notes: "Quality check passed"
4. Click "Save"

**Expected Results**:
- Quality inspection được tạo
- Inspection results được lưu
- Goods receipt có thể được verify hoặc reject dựa trên inspection

#### TC-PUR-021: Reject Goods Based on Inspection
**Priority**: High  
**Type**: E2E  
**Description**: Từ chối hàng hóa dựa trên kết quả kiểm tra

**Preconditions**:
- Đã có quality inspection với result = Fail

**Test Steps**:
1. Navigate to goods receipt detail
2. View inspection results
3. Click "Reject Goods"
4. Enter rejection reason
5. Confirm rejection

**Expected Results**:
- Goods receipt status = Rejected
- Rejected goods không được nhập vào inventory
- Supplier được thông báo về rejection

### Feature 7: Invoice Matching (3-way Matching)

#### TC-PUR-022: Match Invoice with PO and Receipt - Happy Path
**Priority**: High  
**Type**: E2E  
**Description**: Đối chiếu hóa đơn với đơn mua hàng và phiếu nhận hàng

**Preconditions**:
- Đã có purchase order với status = Received
- Đã có goods receipt verified
- Đã có supplier invoice

**Test Steps**:
1. Navigate to `/admin/purchase/invoices`
2. Click "Match Invoice"
3. Select purchase order
4. Select goods receipt
5. Enter invoice details:
   - Invoice Number: "INV-001"
   - Invoice Date: Today
   - Invoice Amount: Match PO amount
6. System perform 3-way matching
7. Click "Approve Match"

**Expected Results**:
- 3-way matching được thực hiện:
  - PO amount = Invoice amount ✓
  - Receipt quantity = Invoice quantity ✓
  - All matches pass
- Invoice status = Matched
- Invoice có thể được paid

#### TC-PUR-023: Invoice Matching - Amount Mismatch
**Priority**: High  
**Type**: E2E  
**Description**: Đối chiếu hóa đơn với amount không khớp

**Preconditions**:
- PO amount = 1000000
- Invoice amount = 1200000

**Test Steps**:
1. Try to match invoice với PO
2. System check amounts

**Expected Results**:
- Warning: "Invoice amount không khớp với PO amount"
- Mismatch được flag
- Approval required để proceed
- Hoặc invoice không được match

#### TC-PUR-024: Invoice Matching - Quantity Mismatch
**Priority**: High  
**Type**: E2E  
**Description**: Đối chiếu hóa đơn với quantity không khớp

**Preconditions**:
- PO quantity = 100
- Receipt quantity = 100
- Invoice quantity = 80

**Test Steps**:
1. Try to match invoice với PO and receipt
2. System check quantities

**Expected Results**:
- Warning: "Invoice quantity không khớp với receipt quantity"
- Mismatch được flag
- Approval required để proceed

## Edge Cases

#### TC-PUR-EC-001: Purchase Order - Zero Quantity
**Priority**: Low  
**Type**: E2E  
**Description**: Tạo đơn mua hàng với quantity = 0

**Test Steps**:
1. Create purchase order
2. Add item với quantity = 0
3. Click "Save"

**Expected Results**:
- Validation error: "Quantity phải > 0"
- PO không được tạo

#### TC-PUR-EC-002: Purchase Order - Negative Unit Cost
**Priority**: Low  
**Type**: E2E  
**Description**: Tạo đơn mua hàng với unit cost âm

**Test Steps**:
1. Create purchase order
2. Add item với unit cost = -1000
3. Click "Save"

**Expected Results**:
- Validation error: "Unit cost phải >= 0"
- PO không được tạo

#### TC-PUR-EC-003: Concurrent Purchase Order Creation
**Priority**: High  
**Type**: Integration  
**Description**: Tạo nhiều đơn mua hàng đồng thời

**Test Steps**:
1. User A tạo PO cho supplier X
2. User B tạo PO cho supplier X
3. Cả 2 cùng save

**Expected Results**:
- Data consistency được đảm bảo
- Không có race condition
- Both POs được tạo thành công

## Error Cases

#### TC-PUR-ERR-001: API Error - Purchase Service Down
**Priority**: High  
**Type**: E2E  
**Description**: Xử lý khi Purchase Service down

**Test Steps**:
1. Mock Purchase Service 500 error
2. Try to create purchase order

**Expected Results**:
- Error message được hiển thị
- User có thể retry
- Transaction được rollback

#### TC-PUR-ERR-002: Inventory Service Unavailable
**Priority**: High  
**Type**: E2E  
**Description**: Xử lý khi Inventory Service unavailable trong goods receipt

**Test Steps**:
1. Mock Inventory Service timeout
2. Try to verify goods receipt

**Expected Results**:
- Error message được hiển thị
- Goods receipt không được verify
- User có thể retry sau

## Business Rules Validation

#### TC-PUR-BR-001: Purchase Order Approval Required
**Priority**: Critical  
**Type**: E2E  
**Description**: PO phải được approve trước khi receive

**Expected Results**:
- Goods receipt không thể tạo từ PO chưa approved
- Approval workflow được enforce

#### TC-PUR-BR-002: Goods Receipt Cannot Exceed Ordered Quantity
**Priority**: Critical  
**Type**: E2E  
**Description**: Số lượng nhập kho không được vượt quá số lượng đặt hàng

**Expected Results**:
- Validation error nếu received > ordered
- Hoặc approval required cho over receiving

#### TC-PUR-BR-003: 3-way Matching Required
**Priority**: High  
**Type**: E2E  
**Description**: Invoice phải match với PO và receipt trước khi paid

**Expected Results**:
- Invoice không thể paid nếu chưa match
- 3-way matching được enforce

## Test Data Requirements

### Test Suppliers
- Supplier 1: Code="SUP-001", Name="Nhà Cung Cấp ABC", Credit Limit=5000000, Status=Active
- Supplier 2: Code="SUP-002", Name="Nhà Cung Cấp XYZ", Credit Limit=10000000, Status=Active

### Test Purchase Orders
- PO 1: Supplier=Supplier 1, Status=Approved, Total=1000000
- PO 2: Supplier=Supplier 1, Status=Draft, Total=2000000

### Test Products
- Product 1: SKU="PROD-001", Unit Cost=100000
- Product 2: SKU="PROD-002", Unit Cost=200000

## Test Coverage

### Happy Path Coverage: ✅
- Supplier management
- Purchase requisition workflow
- Purchase order management
- Goods receipt processing
- Quality inspection
- Invoice matching

### Edge Cases Coverage: ✅
- Zero/negative values
- Concurrent operations

### Error Cases Coverage: ✅
- Service failures
- Network issues

### Business Rules Coverage: ✅
- Approval workflow
- Quantity validation
- 3-way matching

## Notes
- All purchase operations should follow approval workflow
- Goods receipt must match purchase order
- 3-way matching is critical for payment processing
- Quality inspection ensures product quality
- Tests should verify data consistency across services

