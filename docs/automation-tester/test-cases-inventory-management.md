# Test Cases: Inventory Management (EPIC-002)

## Overview
Test cases cho Epic Quản Lý Kho Hàng & Tồn Trữ (EPIC-002) bao gồm quản lý kho, nhập xuất kho, chuyển kho, và kiểm kê.

## Test Scenarios

### Feature 1: Warehouse Management

#### TC-INV-001: Create Warehouse - Happy Path
**Priority**: High  
**Type**: E2E  
**Description**: Tạo kho hàng mới

**Test Steps**:
1. Navigate to `/admin/inventory/warehouses`
2. Click "Add Warehouse"
3. Fill form:
   - Name: "Kho Hà Nội"
   - Code: "WH-HN-001"
   - Type: Main Warehouse
   - Address: "123 Đường ABC, Hà Nội"
   - Contact: "0123456789"
4. Click "Save"

**Expected Results**:
- Warehouse được tạo thành công
- Hiển thị trong danh sách warehouses
- Code là unique

#### TC-INV-002: Create Warehouse - Duplicate Code
**Priority**: High  
**Type**: E2E  
**Description**: Tạo kho với code đã tồn tại

**Preconditions**:
- Đã có warehouse với code "WH-HN-001"

**Test Steps**:
1. Try to create warehouse với code "WH-HN-001"
2. Click "Save"

**Expected Results**:
- Validation error: "Warehouse code đã tồn tại"
- Warehouse không được tạo

#### TC-INV-003: Create Warehouse - Required Fields
**Priority**: High  
**Type**: E2E  
**Description**: Tạo kho thiếu required fields

**Test Steps**:
1. Click "Add Warehouse"
2. Không fill bất kỳ field nào
3. Click "Save"

**Expected Results**:
- Validation errors cho required fields:
  - Name is required
  - Code is required
  - Type is required

### Feature 2: Area & Location Management

#### TC-INV-004: Create Area
**Priority**: Medium  
**Type**: E2E  
**Description**: Tạo khu vực trong kho

**Preconditions**:
- Đã có warehouse

**Test Steps**:
1. Navigate to `/admin/inventory/warehouses/{id}/areas`
2. Click "Add Area"
3. Fill form:
   - Name: "Khu A"
   - Type: Storage
   - Warehouse: Select warehouse
4. Click "Save"

**Expected Results**:
- Area được tạo thành công
- Area được link với warehouse

#### TC-INV-005: Create Location
**Priority**: Medium  
**Type**: E2E  
**Description**: Tạo vị trí trong khu vực

**Preconditions**:
- Đã có area

**Test Steps**:
1. Navigate to `/admin/inventory/areas/{id}/locations`
2. Click "Add Location"
3. Fill form:
   - Zone: "Zone 1"
   - Aisle: "Aisle A"
   - Rack: "Rack 1"
   - Shelf: "Shelf 1"
   - Position: "Position 1"
4. Click "Save"

**Expected Results**:
- Location được tạo thành công
- Location code được generate tự động

### Feature 3: Inventory Tracking & Movements

#### TC-INV-006: View Inventory Levels
**Priority**: High  
**Type**: E2E  
**Description**: Xem tồn kho real-time

**Preconditions**:
- Đã có products trong inventory

**Test Steps**:
1. Navigate to `/admin/inventory`
2. View inventory list
3. Check quantity_on_hand, quantity_reserved, quantity_available

**Expected Results**:
- Hiển thị đúng inventory levels
- quantity_available = quantity_on_hand - quantity_reserved
- Data được update real-time

#### TC-INV-007: View Inventory Movements
**Priority**: Medium  
**Type**: E2E  
**Description**: Xem lịch sử chuyển động tồn kho

**Preconditions**:
- Đã có inventory movements

**Test Steps**:
1. Navigate to `/admin/inventory/movements`
2. Filter by product
3. View movement history

**Expected Results**:
- Hiển thị đầy đủ movements
- Movements có timestamp và user info
- Movements link với reference documents

### Feature 4: Goods Receipt Management

#### TC-INV-008: Create Goods Receipt from Purchase Order - Happy Path
**Priority**: Critical  
**Type**: E2E  
**Description**: Tạo phiếu nhập kho từ đơn mua hàng

**Preconditions**:
- Đã có purchase order với status = Approved
- Purchase order có items

**Test Steps**:
1. Navigate to `/admin/inventory/goods-receipts`
2. Click "Create from Purchase Order"
3. Select purchase order
4. Fill received quantities:
   - Item 1: Quantity = 10
   - Item 2: Quantity = 5
5. For batch-managed products, enter batch numbers
6. Click "Verify"

**Expected Results**:
- Goods receipt được tạo với status = Received
- Inventory levels được cập nhật
- Inventory movements được tạo (type = IN)
- Purchase order received quantity được cập nhật

#### TC-INV-009: Create Goods Receipt - Partial Receiving
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
- Goods receipt được tạo với received quantity = 50
- Purchase order có remaining quantity = 50
- Inventory được cập nhật với quantity = 50

#### TC-INV-010: Create Goods Receipt - Over Receiving
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
- Goods receipt không được verify
- User phải điều chỉnh quantity

#### TC-INV-011: Create Goods Receipt - Batch Number Required
**Priority**: High  
**Type**: E2E  
**Description**: Nhập kho sản phẩm có batch management

**Preconditions**:
- Product có is_batch_managed = true
- Purchase order có product này

**Test Steps**:
1. Create goods receipt
2. Receive product với batch management
3. Không nhập batch number
4. Click "Verify"

**Expected Results**:
- Validation error: "Batch number is required"
- Goods receipt không được verify

#### TC-INV-012: Create Goods Receipt - Expiry Date Required
**Priority**: High  
**Type**: E2E  
**Description**: Nhập kho sản phẩm có expiry date

**Preconditions**:
- Product có has_expiry_date = true
- Purchase order có product này

**Test Steps**:
1. Create goods receipt
2. Receive product với expiry date
3. Không nhập expiry date
4. Click "Verify"

**Expected Results**:
- Validation error: "Expiry date is required"
- Goods receipt không được verify

#### TC-INV-013: Verify Goods Receipt
**Priority**: High  
**Type**: E2E  
**Description**: Xác nhận phiếu nhập kho

**Preconditions**:
- Đã có goods receipt với status = Received

**Test Steps**:
1. Navigate to goods receipt detail
2. Click "Verify"
3. Confirm verification

**Expected Results**:
- Goods receipt status = Verified
- Inventory levels được cập nhật
- Inventory movements được tạo
- Purchase order status được cập nhật

### Feature 5: Goods Issue Management

#### TC-INV-014: Create Goods Issue from Sales Order - Happy Path
**Priority**: Critical  
**Type**: E2E  
**Description**: Tạo phiếu xuất kho từ đơn hàng bán

**Preconditions**:
- Đã có sales order với status = Confirmed
- Sales order có items
- Inventory đủ số lượng

**Test Steps**:
1. Navigate to `/admin/inventory/goods-issues`
2. Click "Create from Sales Order"
3. Select sales order
4. Fill issued quantities:
   - Item 1: Quantity = 10
5. For batch-managed products, select batch (FIFO)
6. Click "Verify"

**Expected Results**:
- Goods issue được tạo với status = Issued
- Inventory levels được cập nhật (quantity giảm)
- Inventory movements được tạo (type = OUT)
- Sales order issued quantity được cập nhật

#### TC-INV-015: Create Goods Issue - Insufficient Inventory
**Priority**: High  
**Type**: E2E  
**Description**: Xuất kho khi không đủ tồn kho

**Preconditions**:
- Sales order có item với quantity = 100
- Inventory chỉ có quantity = 50

**Test Steps**:
1. Create goods issue
2. Try to issue quantity = 100
3. Click "Verify"

**Expected Results**:
- Validation error: "Không đủ tồn kho. Available: 50, Required: 100"
- Goods issue không được verify
- User phải điều chỉnh quantity hoặc chờ nhập kho

#### TC-INV-016: Create Goods Issue - Batch Selection FIFO
**Priority**: High  
**Type**: E2E  
**Description**: Xuất kho với batch selection FIFO

**Preconditions**:
- Product có multiple batches với expiry dates khác nhau
- Batch 1: Expiry = 2025-12-31
- Batch 2: Expiry = 2025-11-30

**Test Steps**:
1. Create goods issue
2. Select batch (FIFO mode)
3. System tự động chọn batch có expiry date sớm nhất

**Expected Results**:
- Batch 2 (expiry sớm hơn) được chọn tự động
- FIFO logic hoạt động đúng

#### TC-INV-017: Create Goods Issue - Batch Selection LIFO
**Priority**: High  
**Type**: E2E  
**Description**: Xuất kho với batch selection LIFO

**Preconditions**:
- Product có multiple batches
- Batch 1: Received date = 2025-01-01
- Batch 2: Received date = 2025-01-15

**Test Steps**:
1. Create goods issue
2. Select batch (LIFO mode)
3. System tự động chọn batch mới nhất

**Expected Results**:
- Batch 2 (mới nhất) được chọn tự động
- LIFO logic hoạt động đúng

### Feature 6: Inventory Counting & Adjustment

#### TC-INV-018: Create Inventory Counting
**Priority**: High  
**Type**: E2E  
**Description**: Tạo phiếu kiểm kê

**Preconditions**:
- Đã có products trong inventory

**Test Steps**:
1. Navigate to `/admin/inventory/counting`
2. Click "Create Counting"
3. Select warehouse
4. Add items to count:
   - Item 1: Expected = 100
   - Item 2: Expected = 50
5. Click "Start Counting"

**Expected Results**:
- Counting document được tạo với status = In Progress
- Counting form được hiển thị

#### TC-INV-019: Record Counted Quantities
**Priority**: High  
**Type**: E2E  
**Description**: Ghi nhận số lượng kiểm kê

**Preconditions**:
- Đã có counting document với status = In Progress

**Test Steps**:
1. Navigate to counting detail
2. Enter counted quantities:
   - Item 1: Counted = 95 (variance = -5)
   - Item 2: Counted = 52 (variance = +2)
3. Click "Complete Counting"

**Expected Results**:
- Counted quantities được lưu
- Variance được tính toán đúng
- Counting status = Completed

#### TC-INV-020: Create Inventory Adjustment from Counting
**Priority**: High  
**Type**: E2E  
**Description**: Tạo điều chỉnh tồn kho từ kiểm kê

**Preconditions**:
- Đã có counting với status = Completed
- Counting có variances

**Test Steps**:
1. Navigate to counting detail
2. Click "Create Adjustment"
3. Review variances
4. Click "Post Adjustment"

**Expected Results**:
- Adjustment document được tạo
- Inventory levels được điều chỉnh theo variances
- Inventory movements được tạo (type = ADJUSTMENT)
- Counting status = Posted

#### TC-INV-021: Create Inventory Adjustment - Manual
**Priority**: Medium  
**Type**: E2E  
**Description**: Tạo điều chỉnh tồn kho thủ công

**Test Steps**:
1. Navigate to `/admin/inventory/adjustments`
2. Click "Create Adjustment"
3. Select product and warehouse
4. Enter adjustment quantity: +10
5. Enter reason: "Điều chỉnh do lỗi nhập liệu"
6. Click "Post"

**Expected Results**:
- Adjustment được tạo và posted
- Inventory được điều chỉnh
- Movement được tạo với reason

### Feature 7: Inventory Transfer Management

#### TC-INV-022: Create Transfer Request
**Priority**: High  
**Type**: E2E  
**Description**: Tạo yêu cầu chuyển kho

**Preconditions**:
- Đã có 2 warehouses
- Source warehouse có inventory

**Test Steps**:
1. Navigate to `/admin/inventory/transfers`
2. Click "Create Transfer Request"
3. Fill form:
   - From Warehouse: Warehouse A
   - To Warehouse: Warehouse B
   - Items: Product 1, Quantity = 20
4. Click "Submit"

**Expected Results**:
- Transfer request được tạo với status = Pending
- Request chờ approval

#### TC-INV-023: Approve Transfer Request
**Priority**: High  
**Type**: E2E  
**Description**: Phê duyệt yêu cầu chuyển kho

**Preconditions**:
- Đã có transfer request với status = Pending

**Test Steps**:
1. Navigate to transfer request detail
2. Click "Approve"
3. Confirm approval

**Expected Results**:
- Transfer request status = Approved
- Transfer document có thể được tạo

#### TC-INV-024: Create Transfer from Approved Request
**Priority**: High  
**Type**: E2E  
**Description**: Tạo chuyển kho từ request đã approved

**Preconditions**:
- Đã có transfer request với status = Approved
- Source warehouse có đủ inventory

**Test Steps**:
1. Navigate to transfer request detail
2. Click "Create Transfer"
3. Verify items and quantities
4. Click "Complete Transfer"

**Expected Results**:
- Transfer document được tạo với status = Completed
- Source warehouse inventory giảm
- Destination warehouse inventory tăng
- Inventory movements được tạo (type = TRANSFER)

#### TC-INV-025: Create Transfer - Insufficient Inventory
**Priority**: High  
**Type**: E2E  
**Description**: Chuyển kho khi không đủ tồn kho

**Preconditions**:
- Transfer request yêu cầu quantity = 100
- Source warehouse chỉ có quantity = 50

**Test Steps**:
1. Try to create transfer
2. System check inventory

**Expected Results**:
- Validation error: "Không đủ tồn kho tại kho nguồn"
- Transfer không được tạo

### Feature 8: Inventory Revaluation

#### TC-INV-026: Create Inventory Revaluation
**Priority**: Medium  
**Type**: E2E  
**Description**: Đánh giá lại giá trị tồn kho

**Preconditions**:
- Đã có product trong inventory với unit_cost = 100000

**Test Steps**:
1. Navigate to `/admin/inventory/revaluations`
2. Click "Create Revaluation"
3. Select product and warehouse
4. Enter new unit cost: 120000
5. Click "Post"

**Expected Results**:
- Revaluation được tạo và posted
- Unit cost được cập nhật
- Revaluation amount = (120000 - 100000) * quantity
- Audit trail được ghi nhận

## Edge Cases

#### TC-INV-EC-001: Goods Receipt - Multiple Batches
**Priority**: Medium  
**Type**: E2E  
**Description**: Nhập kho với nhiều batches cùng lúc

**Test Steps**:
1. Create goods receipt
2. Receive same product với multiple batches:
   - Batch 1: Quantity = 10
   - Batch 2: Quantity = 20
3. Verify

**Expected Results**:
- Tất cả batches được nhập kho thành công
- Inventory được cập nhật đúng

#### TC-INV-EC-002: Goods Issue - Partial Batch
**Priority**: Medium  
**Type**: E2E  
**Description**: Xuất kho một phần batch

**Preconditions**:
- Batch có quantity = 100

**Test Steps**:
1. Create goods issue
2. Issue quantity = 30 từ batch có quantity = 100
3. Verify

**Expected Results**:
- Batch quantity giảm còn 70
- Issue thành công

#### TC-INV-EC-003: Inventory Movement - Concurrent Updates
**Priority**: High  
**Type**: Integration  
**Description**: Cập nhật inventory đồng thời từ nhiều sources

**Test Steps**:
1. User A tạo goods receipt
2. User B tạo goods issue
3. Cả 2 cùng verify

**Expected Results**:
- Data consistency được đảm bảo
- Inventory levels đúng
- Movements được ghi nhận đầy đủ

#### TC-INV-EC-004: Transfer - Same Warehouse
**Priority**: Low  
**Type**: E2E  
**Description**: Chuyển kho cùng một kho

**Test Steps**:
1. Try to create transfer với from = to warehouse

**Expected Results**:
- Validation error: "Source và destination warehouse không được giống nhau"
- Transfer không được tạo

## Error Cases

#### TC-INV-ERR-001: API Error - Inventory Service Down
**Priority**: High  
**Type**: E2E  
**Description**: Xử lý khi Inventory Service down

**Test Steps**:
1. Mock Inventory Service 500 error
2. Try to create goods receipt

**Expected Results**:
- Error message được hiển thị
- User có thể retry
- Transaction được rollback

#### TC-INV-ERR-002: Network Timeout
**Priority**: Medium  
**Type**: E2E  
**Description**: Xử lý network timeout

**Test Steps**:
1. Simulate network timeout
2. Try to verify goods receipt

**Expected Results**:
- Timeout error được hiển thị
- User có thể retry
- Data không bị mất

## Business Rules Validation

#### TC-INV-BR-001: Quantity Available Calculation
**Priority**: Critical  
**Type**: E2E  
**Description**: quantity_available = quantity_on_hand - quantity_reserved

**Expected Results**:
- Calculation đúng trong mọi trường hợp
- Real-time update

#### TC-INV-BR-002: Inventory Cannot Go Negative
**Priority**: Critical  
**Type**: E2E  
**Description**: Tồn kho không được âm

**Test Steps**:
1. Try to issue quantity > available

**Expected Results**:
- Validation error
- Issue không được thực hiện

#### TC-INV-BR-003: Batch FIFO/LIFO Rules
**Priority**: High  
**Type**: E2E  
**Description**: Batch selection theo FIFO/LIFO

**Expected Results**:
- FIFO: Chọn batch cũ nhất
- LIFO: Chọn batch mới nhất

## Test Data Requirements

### Test Warehouses
- Warehouse 1: "Kho Hà Nội", Code="WH-HN-001", Type=Main
- Warehouse 2: "Kho Hồ Chí Minh", Code="WH-HCM-001", Type=Main

### Test Products
- Product 1: SKU="PROD-001", is_batch_managed=true, has_expiry_date=true
- Product 2: SKU="PROD-002", is_batch_managed=false

### Test Inventory
- Product 1 at Warehouse 1: quantity_on_hand=100, quantity_reserved=20, quantity_available=80
- Product 2 at Warehouse 1: quantity_on_hand=50, quantity_reserved=0, quantity_available=50

### Test Batches
- Batch 1: Product=Product 1, Quantity=50, Expiry=2025-12-31
- Batch 2: Product=Product 1, Quantity=30, Expiry=2025-11-30

## Test Coverage

### Happy Path Coverage: ✅
- Warehouse management
- Area & Location management
- Goods receipt/issue
- Inventory counting & adjustment
- Inventory transfer
- Inventory revaluation

### Edge Cases Coverage: ✅
- Multiple batches
- Partial operations
- Concurrent updates
- Same warehouse transfer

### Error Cases Coverage: ✅
- API errors
- Network issues

### Business Rules Coverage: ✅
- Quantity calculations
- Negative inventory prevention
- Batch selection rules

## Notes
- All inventory operations should be transactional
- Test data should be isolated per test
- Use test fixtures for warehouses and products
- Tests should verify data consistency
- Follow Page Object Model pattern

