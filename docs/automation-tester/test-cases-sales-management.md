# Test Cases: Sales Management (EPIC-004)

## Overview
Test cases cho Epic Quản Lý Đơn Hàng & Bán Hàng (EPIC-004) bao gồm quản lý đơn hàng, báo giá, pricing engine, credit management, và delivery.

## Test Scenarios

### Feature 1: Quote Generation & Management

#### TC-SALES-001: Create Quote - Happy Path
**Priority**: High  
**Type**: E2E  
**Description**: Tạo báo giá từ template

**Preconditions**:
- Đã có customer
- Đã có products với pricing

**Test Steps**:
1. Navigate to `/admin/sales/quotes`
2. Click "Create Quote"
3. Select customer
4. Add products:
   - Product 1: Quantity = 10
   - Product 2: Quantity = 5
5. System tự động tính giá từ pricing engine
6. Click "Save"

**Expected Results**:
- Quote được tạo thành công
- Prices được tính đúng theo pricing engine
- Quote có validity period
- Quote status = Draft

#### TC-SALES-002: Convert Quote to Order
**Priority**: High  
**Type**: E2E  
**Description**: Chuyển đổi báo giá thành đơn hàng

**Preconditions**:
- Đã có quote với status = Approved

**Test Steps**:
1. Navigate to quote detail
2. Click "Convert to Order"
3. Confirm conversion

**Expected Results**:
- Sales order được tạo từ quote
- Order items giống quote items
- Quote status = Converted
- Order status = PENDING

### Feature 2: Order Management

#### TC-SALES-003: Create Sales Order - Happy Path
**Priority**: Critical  
**Type**: E2E  
**Description**: Tạo đơn hàng bán với validation đầy đủ

**Preconditions**:
- Đã có customer với credit limit = 10000000
- Đã có products với inventory available
- Customer có credit available

**Test Steps**:
1. Navigate to `/admin/sales/orders`
2. Click "Create Order"
3. Select customer
4. Add products:
   - Product 1: Quantity = 10
   - Product 2: Quantity = 5
5. System validate:
   - Customer exists
   - Products exist
   - Credit limit check
   - Inventory availability check
6. System calculate prices từ pricing engine
7. Click "Save"

**Expected Results**:
- Order được tạo thành công với status = PENDING
- Validation passed
- Prices được tính đúng
- Order total được tính đúng
- Credit limit được check

#### TC-SALES-004: Create Order - Credit Limit Exceeded
**Priority**: High  
**Type**: E2E  
**Description**: Tạo đơn hàng vượt quá hạn mức tín dụng

**Preconditions**:
- Customer có credit limit = 1000000
- Customer có outstanding balance = 900000
- Order total = 200000

**Test Steps**:
1. Create order với total = 200000
2. Click "Save"

**Expected Results**:
- Validation error: "Vượt quá hạn mức tín dụng. Available: 100000, Required: 200000"
- Order không được tạo
- User được thông báo cần approval hoặc thanh toán trước

#### TC-SALES-005: Create Order - Insufficient Inventory
**Priority**: High  
**Type**: E2E  
**Description**: Tạo đơn hàng khi không đủ tồn kho

**Preconditions**:
- Product có quantity_available = 10
- Order yêu cầu quantity = 20

**Test Steps**:
1. Create order với quantity = 20
2. Click "Save"

**Expected Results**:
- Warning: "Không đủ tồn kho cho Product X. Available: 10, Required: 20"
- Order có thể được tạo với status = PENDING (backorder)
- Hoặc order không được tạo tùy business rule

#### TC-SALES-006: Create Order - Invalid Customer
**Priority**: High  
**Type**: E2E  
**Description**: Tạo đơn hàng với customer không tồn tại

**Test Steps**:
1. Create order
2. Select invalid customer ID
3. Click "Save"

**Expected Results**:
- Validation error: "Customer không tồn tại"
- Order không được tạo

#### TC-SALES-007: Create Order - Invalid Product
**Priority**: High  
**Type**: E2E  
**Description**: Tạo đơn hàng với product không tồn tại

**Test Steps**:
1. Create order
2. Add invalid product ID
3. Click "Save"

**Expected Results**:
- Validation error: "Product không tồn tại"
- Order không được tạo

#### TC-SALES-008: Update Order Status
**Priority**: High  
**Type**: E2E  
**Description**: Cập nhật trạng thái đơn hàng

**Preconditions**:
- Đã có order với status = PENDING

**Test Steps**:
1. Navigate to order detail
2. Click "Confirm Order"
3. Status chuyển: PENDING → CONFIRMED

**Expected Results**:
- Order status = CONFIRMED
- Status change history được ghi nhận
- Notification được gửi (nếu có)

#### TC-SALES-009: Cancel Order
**Priority**: Medium  
**Type**: E2E  
**Description**: Hủy đơn hàng

**Preconditions**:
- Đã có order với status = PENDING hoặc CONFIRMED

**Test Steps**:
1. Navigate to order detail
2. Click "Cancel Order"
3. Enter cancellation reason
4. Confirm cancellation

**Expected Results**:
- Order status = CANCELLED
- Cancellation reason được lưu
- Reserved inventory được release (nếu có)

### Feature 3: Multiple Order Types Management

#### TC-SALES-010: Create Order - RETAIL Type
**Priority**: High  
**Type**: E2E  
**Description**: Tạo đơn hàng bán lẻ

**Test Steps**:
1. Create order
2. Select Order Type: RETAIL
3. Add products
4. Click "Save"

**Expected Results**:
- Order được tạo với type = RETAIL
- Pricing rules cho RETAIL được áp dụng
- Order được xử lý đúng theo RETAIL workflow

#### TC-SALES-011: Create Order - WHOLESALE Type
**Priority**: High  
**Type**: E2E  
**Description**: Tạo đơn hàng bán buôn

**Test Steps**:
1. Create order
2. Select Order Type: WHOLESALE
3. Add products
4. Click "Save"

**Expected Results**:
- Order được tạo với type = WHOLESALE
- Wholesale pricing được áp dụng
- Order được xử lý đúng theo WHOLESALE workflow

#### TC-SALES-012: Create Order - FOC Type
**Priority**: Medium  
**Type**: E2E  
**Description**: Tạo đơn hàng Free of Charge

**Test Steps**:
1. Create order
2. Select Order Type: FOC
3. Add products
4. Click "Save"

**Expected Results**:
- Order được tạo với type = FOC
- Order total = 0
- FOC approval workflow được trigger (nếu có)

#### TC-SALES-013: Create Order - RETURN Type
**Priority**: High  
**Type**: E2E  
**Description**: Tạo đơn hàng trả hàng

**Preconditions**:
- Đã có original order

**Test Steps**:
1. Create order
2. Select Order Type: RETURN
3. Link to original order
4. Add returned products
5. Click "Save"

**Expected Results**:
- Order được tạo với type = RETURN
- Return được link với original order
- Inventory được cập nhật (tăng)
- Credit note được tạo (nếu có)

### Feature 4: Pricing Engine Integration

#### TC-SALES-014: Price Calculation - Contract Price Priority
**Priority**: Critical  
**Type**: E2E  
**Description**: Tính giá với contract price (highest priority)

**Preconditions**:
- Customer có contract với product
- Contract price = 80000
- Customer price = 90000
- Standard price = 100000

**Test Steps**:
1. Create order cho customer có contract
2. Add product
3. Check price được áp dụng

**Expected Results**:
- Contract price (80000) được áp dụng
- Price calculation đúng theo priority

#### TC-SALES-015: Price Calculation - Customer Price Priority
**Priority**: Critical  
**Type**: E2E  
**Description**: Tính giá với customer price

**Preconditions**:
- Customer có customer price = 90000
- No contract price
- Standard price = 100000

**Test Steps**:
1. Create order cho customer
2. Add product
3. Check price được áp dụng

**Expected Results**:
- Customer price (90000) được áp dụng
- Price calculation đúng

#### TC-SALES-016: Price Calculation - Volume Pricing
**Priority**: High  
**Type**: E2E  
**Description**: Tính giá theo số lượng

**Preconditions**:
- Product có volume pricing:
  - Quantity 1-9: 100000
  - Quantity 10-50: 80000
  - Quantity 51+: 70000

**Test Steps**:
1. Create order
2. Add product với quantity = 20
3. Check price được áp dụng

**Expected Results**:
- Volume price (80000) được áp dụng cho quantity 20
- Price calculation đúng

#### TC-SALES-017: Price Calculation - Discount Application
**Priority**: High  
**Type**: E2E  
**Description**: Áp dụng discount cho đơn hàng

**Test Steps**:
1. Create order
2. Add products
3. Apply discount:
   - Type: Percentage
   - Value: 10%
4. Check final total

**Expected Results**:
- Discount được tính đúng
- Final total = Subtotal - Discount
- Discount được hiển thị trong order

### Feature 5: Credit Management

#### TC-SALES-018: Check Credit Limit Before Order Creation
**Priority**: Critical  
**Type**: E2E  
**Description**: Kiểm tra hạn mức tín dụng trước khi tạo đơn hàng

**Preconditions**:
- Customer có credit limit = 1000000
- Customer có outstanding balance = 600000
- Available credit = 400000

**Test Steps**:
1. Create order với total = 500000
2. System check credit limit

**Expected Results**:
- Validation error: "Vượt quá hạn mức tín dụng"
- Order không được tạo
- User được thông báo available credit

#### TC-SALES-019: Credit Hold Functionality
**Priority**: High  
**Type**: E2E  
**Description**: Đặt customer vào credit hold

**Preconditions**:
- Customer có overdue invoices

**Test Steps**:
1. Navigate to customer detail
2. Click "Credit Hold"
3. Try to create order cho customer này

**Expected Results**:
- Customer status = Credit Hold
- Order creation bị block
- Error message: "Customer đang trong credit hold"

#### TC-SALES-020: Aging Analysis
**Priority**: Medium  
**Type**: E2E  
**Description**: Xem aging analysis của customer

**Preconditions**:
- Customer có invoices với different due dates

**Test Steps**:
1. Navigate to customer detail
2. View "Aging Analysis"
3. Check aging buckets

**Expected Results**:
- Aging analysis hiển thị:
  - Current: 0-30 days
  - 30 days: 31-60 days
  - 60 days: 61-90 days
  - 90+ days: >90 days
- Totals được tính đúng

### Feature 6: Order Status Tracking

#### TC-SALES-021: Order Status Workflow
**Priority**: High  
**Type**: E2E  
**Description**: Theo dõi workflow trạng thái đơn hàng

**Test Steps**:
1. Create order → Status = PENDING
2. Confirm order → Status = CONFIRMED
3. Process order → Status = PROCESSING
4. Ship order → Status = SHIPPED
5. Deliver order → Status = DELIVERED

**Expected Results**:
- Status transitions đúng theo workflow
- Status change history được ghi nhận
- Notifications được gửi ở mỗi status change

#### TC-SALES-022: Order Status - Cannot Skip Steps
**Priority**: High  
**Type**: E2E  
**Description**: Không thể skip status steps

**Preconditions**:
- Order có status = PENDING

**Test Steps**:
1. Try to change status từ PENDING → SHIPPED (skip CONFIRMED, PROCESSING)

**Expected Results**:
- Validation error: "Không thể skip status steps"
- Status không được thay đổi

### Feature 7: Delivery & Logistics Management

#### TC-SALES-023: Schedule Delivery
**Priority**: High  
**Type**: E2E  
**Description**: Lập lịch giao hàng

**Preconditions**:
- Đã có order với status = CONFIRMED

**Test Steps**:
1. Navigate to order detail
2. Click "Schedule Delivery"
3. Fill delivery details:
   - Delivery Date: Tomorrow
   - Delivery Address: Customer address
   - Delivery Staff: Select staff
4. Click "Save"

**Expected Results**:
- Delivery được schedule thành công
- Delivery status = Scheduled
- Delivery staff được assign

#### TC-SALES-024: Track Delivery Status
**Priority**: Medium  
**Type**: E2E  
**Description**: Theo dõi trạng thái giao hàng

**Preconditions**:
- Đã có delivery

**Test Steps**:
1. Navigate to delivery detail
2. Update delivery status:
   - In Transit
   - Delivered
3. Check status updates

**Expected Results**:
- Delivery status được cập nhật
- Status history được ghi nhận
- Customer có thể track delivery (nếu có customer portal)

## Edge Cases

#### TC-SALES-EC-001: Order with Zero Quantity
**Priority**: Low  
**Type**: E2E  
**Description**: Tạo đơn hàng với quantity = 0

**Test Steps**:
1. Create order
2. Add product với quantity = 0
3. Click "Save"

**Expected Results**:
- Validation error: "Quantity phải > 0"
- Order không được tạo

#### TC-SALES-EC-002: Order with Negative Quantity
**Priority**: Low  
**Type**: E2E  
**Description**: Tạo đơn hàng với quantity âm

**Test Steps**:
1. Create order
2. Add product với quantity = -10
3. Click "Save"

**Expected Results**:
- Validation error: "Quantity phải > 0"
- Order không được tạo

#### TC-SALES-EC-003: Order with Very Large Quantity
**Priority**: Medium  
**Type**: E2E  
**Description**: Tạo đơn hàng với quantity rất lớn

**Test Steps**:
1. Create order
2. Add product với quantity = 999999999
3. Click "Save"

**Expected Results**:
- Validation error hoặc warning về quantity quá lớn
- Hoặc order được tạo nếu business rule cho phép

#### TC-SALES-EC-004: Concurrent Order Creation
**Priority**: High  
**Type**: Integration  
**Description**: Tạo nhiều đơn hàng đồng thời cho cùng customer

**Test Steps**:
1. User A tạo order cho customer X với total = 500000
2. User B tạo order cho customer X với total = 600000
3. Cả 2 cùng save

**Expected Results**:
- Credit limit check đúng
- Data consistency được đảm bảo
- Không có race condition

## Error Cases

#### TC-SALES-ERR-001: Pricing Engine Service Down
**Priority**: High  
**Type**: E2E  
**Description**: Xử lý khi Pricing Engine service down

**Test Steps**:
1. Mock Pricing Engine 500 error
2. Try to create order

**Expected Results**:
- Error message: "Không thể tính giá. Vui lòng thử lại sau."
- Order không được tạo
- User có thể retry

#### TC-SALES-ERR-002: Inventory Service Unavailable
**Priority**: High  
**Type**: E2E  
**Description**: Xử lý khi Inventory Service unavailable

**Test Steps**:
1. Mock Inventory Service timeout
2. Try to create order

**Expected Results**:
- Warning: "Không thể kiểm tra tồn kho. Order có thể được tạo nhưng cần verify sau."
- Hoặc order không được tạo tùy business rule

## Business Rules Validation

#### TC-SALES-BR-001: Credit Limit Enforcement
**Priority**: Critical  
**Type**: E2E  
**Description**: Hạn mức tín dụng phải được enforce

**Expected Results**:
- Order không được tạo nếu vượt credit limit
- Credit limit check được thực hiện trước khi save

#### TC-SALES-BR-002: Order Type Business Rules
**Priority**: High  
**Type**: E2E  
**Description**: Mỗi order type có business rules riêng

**Expected Results**:
- RETAIL: Standard pricing
- WHOLESALE: Wholesale pricing
- FOC: Total = 0, requires approval
- RETURN: Links to original order, increases inventory

#### TC-SALES-BR-003: Price Priority Rules
**Priority**: Critical  
**Type**: E2E  
**Description**: Price priority phải đúng

**Expected Results**:
- Contract > Customer > Customer Group > Volume > Standard
- Price calculation đúng theo priority

## Test Data Requirements

### Test Customers
- Customer 1: Code="CUST-001", Credit Limit=10000000, Status=Active
- Customer 2: Code="CUST-002", Credit Limit=5000000, Status=Active, Credit Hold=false

### Test Products
- Product 1: SKU="PROD-001", Standard Price=100000
- Product 2: SKU="PROD-002", Standard Price=200000

### Test Prices
- Customer 1 - Product 1: Customer Price=90000
- Customer 1 - Product 1: Contract Price=80000 (highest priority)
- Product 1: Volume Price (10-50): 80000

### Test Orders
- Order 1: Customer=Customer 1, Type=RETAIL, Status=PENDING
- Order 2: Customer=Customer 1, Type=WHOLESALE, Status=CONFIRMED

## Test Coverage

### Happy Path Coverage: ✅
- Quote creation and conversion
- Order creation with validation
- Multiple order types
- Pricing engine integration
- Credit management
- Order status tracking
- Delivery management

### Edge Cases Coverage: ✅
- Zero/negative quantities
- Large quantities
- Concurrent operations

### Error Cases Coverage: ✅
- Service failures
- Network issues

### Business Rules Coverage: ✅
- Credit limit enforcement
- Order type rules
- Price priority rules

## Notes
- All order operations should validate customer and products
- Credit limit check is mandatory
- Pricing engine integration is critical
- Order status workflow must be followed
- Tests should verify data consistency across services

