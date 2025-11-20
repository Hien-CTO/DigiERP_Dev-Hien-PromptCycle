# Test Cases: Customer Management (EPIC-003)

## Overview
Test cases cho Epic Quản Lý Khách Hàng & CRM (EPIC-003) bao gồm quản lý thông tin khách hàng, phân khúc, contacts, contracts, và 360° customer view.

## Test Scenarios

### Feature 1: Customer Information Management

#### TC-CUST-001: Create Customer - Happy Path
**Priority**: Critical  
**Type**: E2E  
**Description**: Tạo khách hàng mới với đầy đủ thông tin

**Test Steps**:
1. Navigate to `/admin/customers`
2. Click "Add Customer"
3. Fill form:
   - Code: "CUST-001"
   - Name: "Trang Trại Tôm ABC"
   - Type: Company
   - Tax Code: "0123456789"
   - Address: "123 Đường XYZ, Hà Nội"
   - Phone: "0123456789"
   - Email: "contact@abc.com"
   - Credit Limit: 10000000
   - Payment Terms: Net 30
   - Status: Active
4. Click "Save"

**Expected Results**:
- Customer được tạo thành công
- Hiển thị trong danh sách customers
- Code là unique
- All fields được lưu đúng

#### TC-CUST-002: Create Customer - Duplicate Code
**Priority**: High  
**Type**: E2E  
**Description**: Tạo khách hàng với code đã tồn tại

**Preconditions**:
- Đã có customer với code "CUST-001"

**Test Steps**:
1. Try to create customer với code "CUST-001"
2. Click "Save"

**Expected Results**:
- Validation error: "Customer code đã tồn tại"
- Customer không được tạo

#### TC-CUST-003: Create Customer - Required Fields
**Priority**: High  
**Type**: E2E  
**Description**: Tạo khách hàng thiếu required fields

**Test Steps**:
1. Click "Add Customer"
2. Không fill required fields
3. Click "Save"

**Expected Results**:
- Validation errors cho required fields:
  - Code is required
  - Name is required
  - Type is required

#### TC-CUST-004: Update Customer
**Priority**: High  
**Type**: E2E  
**Description**: Cập nhật thông tin khách hàng

**Preconditions**:
- Đã có customer với ID = 1

**Test Steps**:
1. Navigate to customer detail
2. Click "Edit"
3. Update Name: "Trang Trại Tôm ABC - Updated"
4. Update Credit Limit: 15000000
5. Click "Save"

**Expected Results**:
- Customer được cập nhật thành công
- Audit trail ghi nhận thay đổi
- Thông tin mới được hiển thị

#### TC-CUST-005: Delete Customer - Without Dependencies
**Priority**: Medium  
**Type**: E2E  
**Description**: Xóa khách hàng không có dependencies

**Preconditions**:
- Đã có customer không có orders hoặc invoices

**Test Steps**:
1. Navigate to customer detail
2. Click "Delete"
3. Confirm deletion

**Expected Results**:
- Customer được xóa thành công
- Customer không còn trong danh sách

#### TC-CUST-006: Delete Customer - With Dependencies
**Priority**: High  
**Type**: E2E  
**Description**: Xóa khách hàng có orders

**Preconditions**:
- Đã có customer có sales orders

**Test Steps**:
1. Try to delete customer có orders
2. Confirm deletion

**Expected Results**:
- Error: "Không thể xóa khách hàng đã có đơn hàng"
- Customer không bị xóa
- Hoặc soft delete (status = Inactive)

### Feature 2: Customer Segmentation

#### TC-CUST-007: Assign Customer to Group
**Priority**: High  
**Type**: E2E  
**Description**: Gán khách hàng vào nhóm

**Preconditions**:
- Đã có customer group "Trang Trại Nuôi Tôm"
- Đã có customer

**Test Steps**:
1. Navigate to customer detail
2. Click "Edit"
3. Select Customer Group: "Trang Trại Nuôi Tôm"
4. Click "Save"

**Expected Results**:
- Customer được assign vào group
- Group được hiển thị trong customer detail
- Customer có thể thuộc multiple groups

#### TC-CUST-008: Filter Customers by Group
**Priority**: Medium  
**Type**: E2E  
**Description**: Lọc khách hàng theo nhóm

**Preconditions**:
- Đã có customers thuộc different groups

**Test Steps**:
1. Navigate to `/admin/customers`
2. Select group filter: "Trang Trại Nuôi Tôm"
3. View filtered results

**Expected Results**:
- Chỉ hiển thị customers thuộc group "Trang Trại Nuôi Tôm"
- Filter hoạt động chính xác

#### TC-CUST-009: Create Customer Group
**Priority**: Medium  
**Type**: E2E  
**Description**: Tạo nhóm khách hàng mới

**Test Steps**:
1. Navigate to `/admin/customers/groups`
2. Click "Add Group"
3. Fill form:
   - Name: "Nhà Phân Phối Cấp 1"
   - Description: "Nhà phân phối cấp 1"
   - Color: #FF0000
4. Click "Save"

**Expected Results**:
- Customer group được tạo thành công
- Group hiển thị với color đã chọn
- Group có thể được assign cho customers

### Feature 3: Customer Contacts Management

#### TC-CUST-010: Add Contact to Customer
**Priority**: High  
**Type**: E2E  
**Description**: Thêm liên hệ cho khách hàng

**Preconditions**:
- Đã có customer

**Test Steps**:
1. Navigate to customer detail
2. Click "Add Contact"
3. Fill form:
   - Name: "Nguyễn Văn A"
   - Role: "Kế Toán"
   - Phone: "0987654321"
   - Email: "contact@abc.com"
   - Department: "Kế Toán"
   - Position: "Trưởng Phòng"
   - Is Primary: Yes
4. Click "Save"

**Expected Results**:
- Contact được thêm thành công
- Contact hiển thị trong customer contacts list
- Primary contact được đánh dấu

#### TC-CUST-011: Update Contact
**Priority**: Medium  
**Type**: E2E  
**Description**: Cập nhật thông tin liên hệ

**Preconditions**:
- Đã có customer contact

**Test Steps**:
1. Navigate to contact detail
2. Click "Edit"
3. Update Phone: "0123456789"
4. Click "Save"

**Expected Results**:
- Contact được cập nhật thành công
- Thông tin mới được hiển thị

#### TC-CUST-012: Set Primary Contact
**Priority**: Medium  
**Type**: E2E  
**Description**: Đặt liên hệ làm primary contact

**Preconditions**:
- Customer có multiple contacts
- Đã có primary contact

**Test Steps**:
1. Navigate to contact detail
2. Click "Set as Primary"
3. Confirm

**Expected Results**:
- Contact được set làm primary
- Previous primary contact được unset
- Chỉ có 1 primary contact tại một thời điểm

### Feature 4: Contract Management

#### TC-CUST-013: Create Contract - Happy Path
**Priority**: High  
**Type**: E2E  
**Description**: Tạo hợp đồng với khách hàng

**Preconditions**:
- Đã có customer

**Test Steps**:
1. Navigate to customer detail
2. Click "Add Contract"
3. Fill form:
   - Contract Number: "CT-001"
   - Type: Distribution
   - Start Date: Today
   - End Date: Today + 1 year
   - Value: 100000000
   - Terms: "Payment Net 30"
4. Click "Save"

**Expected Results**:
- Contract được tạo với status = Draft
- Contract được link với customer
- Contract có thể được activated

#### TC-CUST-014: Activate Contract
**Priority**: High  
**Type**: E2E  
**Description**: Kích hoạt hợp đồng

**Preconditions**:
- Đã có contract với status = Draft

**Test Steps**:
1. Navigate to contract detail
2. Click "Activate Contract"
3. Confirm activation

**Expected Results**:
- Contract status = Active
- Contract pricing được áp dụng cho orders
- Contract start date = today

#### TC-CUST-015: Contract Expiry
**Priority**: Medium  
**Type**: E2E  
**Description**: Hợp đồng hết hạn

**Preconditions**:
- Đã có contract với end_date = yesterday

**Test Steps**:
1. System check contract expiry
2. View contract status

**Expected Results**:
- Contract status = Expired (auto update)
- Contract pricing không còn được áp dụng
- System có thể renew contract

#### TC-CUST-016: Renew Contract
**Priority**: Medium  
**Type**: E2E  
**Description**: Gia hạn hợp đồng

**Preconditions**:
- Đã có contract với status = Expired

**Test Steps**:
1. Navigate to contract detail
2. Click "Renew Contract"
3. Set new end date
4. Click "Save"

**Expected Results**:
- New contract được tạo từ expired contract
- Contract status = Active
- Contract history được maintain

### Feature 5: 360° Customer View

#### TC-CUST-017: View Customer 360° Dashboard
**Priority**: High  
**Type**: E2E  
**Description**: Xem dashboard 360° của khách hàng

**Preconditions**:
- Đã có customer với:
  - Orders
  - Invoices
  - Payments
  - Contracts

**Test Steps**:
1. Navigate to customer detail
2. View 360° dashboard
3. Check all sections:
   - Basic Information
   - Contacts
   - Contracts
   - Order History
   - Invoice History
   - Payment History
   - Communication History

**Expected Results**:
- Tất cả thông tin được hiển thị trong 1 view
- Data được load đúng
- Performance < 2 seconds

#### TC-CUST-018: View Customer Order History
**Priority**: Medium  
**Type**: E2E  
**Description**: Xem lịch sử đơn hàng của khách hàng

**Preconditions**:
- Customer có multiple orders

**Test Steps**:
1. Navigate to customer detail
2. Click "Order History" tab
3. View orders list

**Expected Results**:
- Hiển thị tất cả orders của customer
- Orders được sort theo date (newest first)
- Order details có thể được xem

#### TC-CUST-019: View Customer Invoice History
**Priority**: Medium  
**Type**: E2E  
**Description**: Xem lịch sử hóa đơn của khách hàng

**Preconditions**:
- Customer có multiple invoices

**Test Steps**:
1. Navigate to customer detail
2. Click "Invoice History" tab
3. View invoices list

**Expected Results**:
- Hiển thị tất cả invoices của customer
- Invoices được sort theo date
- Invoice status được hiển thị

#### TC-CUST-020: View Customer Payment History
**Priority**: Medium  
**Type**: E2E  
**Description**: Xem lịch sử thanh toán của khách hàng

**Preconditions**:
- Customer có multiple payments

**Test Steps**:
1. Navigate to customer detail
2. Click "Payment History" tab
3. View payments list

**Expected Results**:
- Hiển thị tất cả payments của customer
- Payments được sort theo date
- Payment methods được hiển thị

#### TC-CUST-021: Calculate Customer Lifetime Value (CLV)
**Priority**: Medium  
**Type**: E2E  
**Description**: Tính toán CLV của khách hàng

**Preconditions**:
- Customer có order history và payment history

**Test Steps**:
1. Navigate to customer detail
2. View "Customer Analytics" section
3. Check CLV calculation

**Expected Results**:
- CLV được tính toán đúng
- CLV = Total Revenue - Total Cost
- CLV được hiển thị trong dashboard

### Feature 6: Customer Status Management

#### TC-CUST-022: Update Customer Status
**Priority**: Medium  
**Type**: E2E  
**Description**: Cập nhật trạng thái khách hàng

**Preconditions**:
- Đã có customer với status = Active

**Test Steps**:
1. Navigate to customer detail
2. Click "Edit"
3. Change Status: Inactive
4. Click "Save"

**Expected Results**:
- Customer status được cập nhật
- Inactive customer không thể tạo orders (tùy business rule)

#### TC-CUST-023: Suspend Customer
**Priority**: High  
**Type**: E2E  
**Description**: Đình chỉ khách hàng

**Preconditions**:
- Đã có customer với overdue invoices

**Test Steps**:
1. Navigate to customer detail
2. Click "Suspend Customer"
3. Enter suspension reason
4. Confirm

**Expected Results**:
- Customer status = Suspended
- Customer không thể tạo orders
- Suspension reason được lưu

### Feature 7: Customer Audit Trail

#### TC-CUST-024: View Customer Audit Log
**Priority**: Medium  
**Type**: E2E  
**Description**: Xem audit log của khách hàng

**Preconditions**:
- Customer đã có thay đổi thông tin

**Test Steps**:
1. Navigate to customer detail
2. Click "Audit Log" tab
3. View audit history

**Expected Results**:
- Hiển thị tất cả changes:
  - Field name
  - Old value
  - New value
  - Changed by
  - Changed at
- Audit log được sort theo date

## Edge Cases

#### TC-CUST-EC-001: Create Customer - Max Length Fields
**Priority**: Low  
**Type**: E2E  
**Description**: Tạo khách hàng với fields có độ dài tối đa

**Test Steps**:
1. Fill form với:
   - Code: 255 characters
   - Name: 255 characters
   - Address: 500 characters
2. Click "Save"

**Expected Results**:
- Customer được tạo thành công
- Tất cả fields được lưu đúng

#### TC-CUST-EC-002: Create Customer - Special Characters
**Priority**: Low  
**Type**: E2E  
**Description**: Tạo khách hàng với special characters

**Test Steps**:
1. Fill form với:
   - Name: "Trang Trại @#$%^&*()"
   - Address: "Địa chỉ có ký tự đặc biệt"
2. Click "Save"

**Expected Results**:
- Customer được tạo thành công
- Special characters được escape đúng
- Không có XSS vulnerability

#### TC-CUST-EC-003: Search Customer - Empty Results
**Priority**: Low  
**Type**: E2E  
**Description**: Tìm kiếm không có kết quả

**Test Steps**:
1. Search với term: "NonexistentCustomer12345"
2. Wait for results

**Expected Results**:
- Hiển thị "No customers found"
- Empty state được hiển thị đúng

#### TC-CUST-EC-004: Multiple Primary Contacts
**Priority**: High  
**Type**: E2E  
**Description**: Ngăn chặn multiple primary contacts

**Preconditions**:
- Customer đã có primary contact

**Test Steps**:
1. Try to set another contact as primary
2. System check existing primary

**Expected Results**:
- Previous primary contact được unset automatically
- Chỉ có 1 primary contact tại một thời điểm

## Error Cases

#### TC-CUST-ERR-001: API Error - Customer Service Down
**Priority**: High  
**Type**: E2E  
**Description**: Xử lý khi Customer Service down

**Test Steps**:
1. Mock Customer Service 500 error
2. Try to create customer

**Expected Results**:
- Error message được hiển thị
- User có thể retry
- Transaction được rollback

#### TC-CUST-ERR-002: Network Timeout
**Priority**: Medium  
**Type**: E2E  
**Description**: Xử lý network timeout

**Test Steps**:
1. Simulate network timeout
2. Try to load customer list

**Expected Results**:
- Timeout error được hiển thị
- User có thể retry
- Loading state được hiển thị

## Business Rules Validation

#### TC-CUST-BR-001: Customer Code Uniqueness
**Priority**: Critical  
**Type**: E2E  
**Description**: Customer code phải unique

**Expected Results**:
- Validation error nếu code đã tồn tại
- Customer không được tạo với duplicate code

#### TC-CUST-BR-002: Credit Limit Validation
**Priority**: High  
**Type**: E2E  
**Description**: Credit limit phải >= 0

**Test Steps**:
1. Try to set credit limit = -1000

**Expected Results**:
- Validation error: "Credit limit phải >= 0"
- Customer không được tạo/updated

#### TC-CUST-BR-003: Contract Date Validation
**Priority**: High  
**Type**: E2E  
**Description**: Contract end date phải > start date

**Test Steps**:
1. Create contract với end_date < start_date

**Expected Results**:
- Validation error: "End date phải > start date"
- Contract không được tạo

## Test Data Requirements

### Test Customers
- Customer 1: Code="CUST-001", Name="Trang Trại Tôm ABC", Type=Company, Credit Limit=10000000, Status=Active
- Customer 2: Code="CUST-002", Name="Trang Trại Cá XYZ", Type=Company, Credit Limit=5000000, Status=Active

### Test Customer Groups
- Group 1: "Trang Trại Nuôi Tôm", Color=#FF0000
- Group 2: "Nhà Phân Phối", Color=#00FF00

### Test Contracts
- Contract 1: Customer=Customer 1, Type=Distribution, Status=Active, Start Date=Today, End Date=Today+1year

### Test Contacts
- Contact 1: Customer=Customer 1, Name="Nguyễn Văn A", Role="Kế Toán", Is Primary=true

## Test Coverage

### Happy Path Coverage: ✅
- Customer CRUD operations
- Customer segmentation
- Contact management
- Contract management
- 360° customer view
- Customer status management
- Audit trail

### Edge Cases Coverage: ✅
- Max length fields
- Special characters
- Empty results
- Multiple primary contacts

### Error Cases Coverage: ✅
- API errors
- Network issues

### Business Rules Coverage: ✅
- Code uniqueness
- Credit limit validation
- Contract date validation

## Notes
- All customer operations should maintain audit trail
- Customer code must be unique
- Primary contact should be unique per customer
- Contract dates must be valid
- 360° view should load efficiently (< 2 seconds)

