# Test Cases: Product Management (EPIC-001)

## Overview
Test cases cho Epic Quản Lý Sản Phẩm & Danh Mục (EPIC-001) bao gồm các tính năng quản lý sản phẩm, danh mục, thương hiệu, và hệ thống giá đa tầng.

## Test Scenarios

### Feature 1: Product Information Management

#### TC-PM-001: Create Product - Happy Path
**Priority**: High  
**Type**: E2E  
**Description**: Tạo sản phẩm mới với đầy đủ thông tin hợp lệ

**Preconditions**:
- User đã login với quyền Product Manager hoặc Admin
- Đã có ít nhất 1 category, brand, unit trong hệ thống

**Test Steps**:
1. Navigate to `/admin/products`
2. Click "Add Product" button
3. Fill form với thông tin:
   - SKU: "PROD-001"
   - Name: "Thức ăn tôm cao cấp"
   - Description: "Thức ăn cho tôm thẻ chân trắng"
   - Category: Select existing category
   - Brand: Select existing brand
   - Unit: Select existing unit
   - Status: Active
4. Click "Save"

**Expected Results**:
- Product được tạo thành công
- Hiển thị success message
- Product xuất hiện trong danh sách
- SKU là unique

#### TC-PM-002: Create Product - Duplicate SKU
**Priority**: High  
**Type**: E2E  
**Description**: Tạo sản phẩm với SKU đã tồn tại

**Preconditions**:
- Đã có product với SKU "PROD-001"

**Test Steps**:
1. Navigate to `/admin/products`
2. Click "Add Product"
3. Fill form với SKU "PROD-001" (đã tồn tại)
4. Fill các fields khác
5. Click "Save"

**Expected Results**:
- Hiển thị validation error: "SKU đã tồn tại"
- Product không được tạo
- Form vẫn mở để user sửa

#### TC-PM-003: Create Product - Required Fields Validation
**Priority**: High  
**Type**: E2E  
**Description**: Tạo sản phẩm thiếu required fields

**Test Steps**:
1. Navigate to `/admin/products`
2. Click "Add Product"
3. Không fill bất kỳ field nào
4. Click "Save"

**Expected Results**:
- Hiển thị validation errors cho tất cả required fields:
  - SKU is required
  - Name is required
  - Category is required
- Product không được tạo

#### TC-PM-004: Update Product
**Priority**: High  
**Type**: E2E  
**Description**: Cập nhật thông tin sản phẩm

**Preconditions**:
- Đã có product với ID = 1

**Test Steps**:
1. Navigate to `/admin/products`
2. Click "Edit" button cho product ID = 1
3. Update Name: "Thức ăn tôm cao cấp - Updated"
4. Click "Save"

**Expected Results**:
- Product được cập nhật thành công
- Hiển thị success message
- Thông tin mới được hiển thị trong danh sách
- Audit trail ghi nhận thay đổi

#### TC-PM-005: Delete Product
**Priority**: Medium  
**Type**: E2E  
**Description**: Xóa sản phẩm

**Preconditions**:
- Đã có product với ID = 1
- Product không có liên kết với orders hoặc inventory

**Test Steps**:
1. Navigate to `/admin/products`
2. Click "Delete" button cho product ID = 1
3. Confirm deletion trong modal

**Expected Results**:
- Product được xóa thành công
- Product không còn hiển thị trong danh sách
- Hiển thị success message

#### TC-PM-006: Delete Product - With Dependencies
**Priority**: High  
**Type**: E2E  
**Description**: Xóa sản phẩm có liên kết với orders

**Preconditions**:
- Đã có product với ID = 1
- Product đã có trong sales order

**Test Steps**:
1. Navigate to `/admin/products`
2. Click "Delete" button cho product ID = 1
3. Confirm deletion

**Expected Results**:
- Hiển thị error: "Không thể xóa sản phẩm đã có trong đơn hàng"
- Product không bị xóa

#### TC-PM-007: Search Products
**Priority**: Medium  
**Type**: E2E  
**Description**: Tìm kiếm sản phẩm theo tên

**Preconditions**:
- Đã có ít nhất 5 products trong hệ thống

**Test Steps**:
1. Navigate to `/admin/products`
2. Enter search term: "Thức ăn"
3. Wait for results

**Expected Results**:
- Hiển thị danh sách products có tên chứa "Thức ăn"
- Kết quả tìm kiếm chính xác
- Response time < 1 second

#### TC-PM-008: Filter Products by Category
**Priority**: Medium  
**Type**: E2E  
**Description**: Lọc sản phẩm theo danh mục

**Preconditions**:
- Đã có products thuộc nhiều categories khác nhau

**Test Steps**:
1. Navigate to `/admin/products`
2. Select category filter: "Phụ liệu thức ăn"
3. Wait for results

**Expected Results**:
- Chỉ hiển thị products thuộc category "Phụ liệu thức ăn"
- Filter hoạt động chính xác

#### TC-PM-009: Filter Products by Status
**Priority**: Medium  
**Type**: E2E  
**Description**: Lọc sản phẩm theo trạng thái

**Test Steps**:
1. Navigate to `/admin/products`
2. Select status filter: "Active"
3. Wait for results

**Expected Results**:
- Chỉ hiển thị products có status = "Active"
- Filter hoạt động chính xác

### Feature 2: Product Categories Management

#### TC-PM-010: Create Category - Happy Path
**Priority**: High  
**Type**: E2E  
**Description**: Tạo danh mục mới

**Test Steps**:
1. Navigate to `/admin/products/categories`
2. Click "Add Category"
3. Fill form:
   - Name: "Men vi sinh"
   - Description: "Danh mục men vi sinh"
   - Parent Category: None (root category)
4. Click "Save"

**Expected Results**:
- Category được tạo thành công
- Hiển thị trong category tree
- Name là unique

#### TC-PM-011: Create Category - Hierarchical Structure
**Priority**: High  
**Type**: E2E  
**Description**: Tạo danh mục con

**Preconditions**:
- Đã có parent category "Phụ liệu thức ăn"

**Test Steps**:
1. Navigate to `/admin/products/categories`
2. Click "Add Category"
3. Fill form:
   - Name: "Thức ăn tôm"
   - Parent Category: "Phụ liệu thức ăn"
4. Click "Save"

**Expected Results**:
- Category được tạo thành công
- Hiển thị dưới parent category trong tree
- Hierarchical structure đúng

#### TC-PM-012: Create Category - Circular Reference Prevention
**Priority**: High  
**Type**: E2E  
**Description**: Ngăn chặn circular reference trong category tree

**Preconditions**:
- Đã có category A
- Category B là con của A

**Test Steps**:
1. Navigate to `/admin/products/categories`
2. Edit category A
3. Set Parent Category = B (con của A)
4. Click "Save"

**Expected Results**:
- Hiển thị error: "Không thể tạo circular reference"
- Category không được cập nhật

#### TC-PM-013: Update Category
**Priority**: Medium  
**Type**: E2E  
**Description**: Cập nhật thông tin danh mục

**Preconditions**:
- Đã có category với ID = 1

**Test Steps**:
1. Navigate to `/admin/products/categories`
2. Click "Edit" cho category ID = 1
3. Update Name: "Men vi sinh - Updated"
4. Click "Save"

**Expected Results**:
- Category được cập nhật thành công
- Thông tin mới được hiển thị

#### TC-PM-014: Delete Category - Without Products
**Priority**: Medium  
**Type**: E2E  
**Description**: Xóa danh mục không có sản phẩm

**Preconditions**:
- Đã có category không có products

**Test Steps**:
1. Navigate to `/admin/products/categories`
2. Click "Delete" cho category
3. Confirm deletion

**Expected Results**:
- Category được xóa thành công
- Category không còn trong tree

#### TC-PM-015: Delete Category - With Products
**Priority**: High  
**Type**: E2E  
**Description**: Xóa danh mục có sản phẩm

**Preconditions**:
- Đã có category có products

**Test Steps**:
1. Navigate to `/admin/products/categories`
2. Click "Delete" cho category có products
3. Confirm deletion

**Expected Results**:
- Hiển thị error: "Không thể xóa danh mục có sản phẩm"
- Category không bị xóa

### Feature 3: Brand & Model Management

#### TC-PM-016: Create Brand
**Priority**: Medium  
**Type**: E2E  
**Description**: Tạo thương hiệu mới

**Test Steps**:
1. Navigate to `/admin/products/brands`
2. Click "Add Brand"
3. Fill form:
   - Name: "Brand ABC"
   - Description: "Thương hiệu ABC"
4. Click "Save"

**Expected Results**:
- Brand được tạo thành công
- Hiển thị trong danh sách brands

#### TC-PM-017: Create Model
**Priority**: Medium  
**Type**: E2E  
**Description**: Tạo model mới

**Preconditions**:
- Đã có brand

**Test Steps**:
1. Navigate to `/admin/products/models`
2. Click "Add Model"
3. Fill form:
   - Name: "Model XYZ"
   - Brand: Select existing brand
4. Click "Save"

**Expected Results**:
- Model được tạo thành công
- Model được link với brand

### Feature 4: Multi-tier Pricing System

#### TC-PM-018: Set Standard Price
**Priority**: High  
**Type**: E2E  
**Description**: Thiết lập giá chuẩn cho sản phẩm

**Preconditions**:
- Đã có product với ID = 1

**Test Steps**:
1. Navigate to `/admin/products/1/pricing`
2. Click "Add Price"
3. Fill form:
   - Price Type: Standard
   - Unit Price: 100000
   - Valid From: Today
   - Valid To: None
4. Click "Save"

**Expected Results**:
- Standard price được lưu thành công
- Price được hiển thị trong pricing list

#### TC-PM-019: Set Customer Price
**Priority**: High  
**Type**: E2E  
**Description**: Thiết lập giá cho khách hàng cụ thể

**Preconditions**:
- Đã có product với ID = 1
- Đã có customer với ID = 1

**Test Steps**:
1. Navigate to `/admin/products/1/pricing`
2. Click "Add Price"
3. Fill form:
   - Price Type: Customer
   - Customer: Select customer ID = 1
   - Unit Price: 90000
   - Valid From: Today
4. Click "Save"

**Expected Results**:
- Customer price được lưu thành công
- Price được áp dụng cho customer ID = 1

#### TC-PM-020: Price Priority - Contract > Customer > Customer Group > Volume > Standard
**Priority**: Critical  
**Type**: E2E  
**Description**: Kiểm tra priority của pricing

**Preconditions**:
- Product có:
  - Standard price: 100000
  - Customer Group price: 95000
  - Customer price: 90000
  - Contract price: 85000

**Test Steps**:
1. Navigate to `/admin/sales/orders/new`
2. Select customer có contract price
3. Add product to order
4. Check price được áp dụng

**Expected Results**:
- Contract price (85000) được áp dụng (highest priority)
- Price calculation đúng theo priority

#### TC-PM-021: Price Priority - Customer > Customer Group > Volume > Standard
**Priority**: Critical  
**Type**: E2E  
**Description**: Kiểm tra priority khi không có contract price

**Preconditions**:
- Product có:
  - Standard price: 100000
  - Customer Group price: 95000
  - Customer price: 90000
  - No Contract price

**Test Steps**:
1. Navigate to `/admin/sales/orders/new`
2. Select customer có customer price
3. Add product to order
4. Check price được áp dụng

**Expected Results**:
- Customer price (90000) được áp dụng
- Price calculation đúng theo priority

#### TC-PM-022: Volume Pricing
**Priority**: High  
**Type**: E2E  
**Description**: Thiết lập giá theo số lượng

**Preconditions**:
- Đã có product với ID = 1

**Test Steps**:
1. Navigate to `/admin/products/1/pricing`
2. Click "Add Price"
3. Fill form:
   - Price Type: Volume
   - Min Quantity: 10
   - Max Quantity: 50
   - Unit Price: 80000
4. Click "Save"

**Expected Results**:
- Volume price được lưu thành công
- Price được áp dụng khi quantity trong range 10-50

#### TC-PM-023: Price Validity Period
**Priority**: Medium  
**Type**: E2E  
**Description**: Kiểm tra price validity period

**Preconditions**:
- Product có price với Valid To = Yesterday

**Test Steps**:
1. Navigate to `/admin/sales/orders/new`
2. Add product to order
3. Check price được áp dụng

**Expected Results**:
- Expired price không được áp dụng
- Standard price được áp dụng thay thế

### Feature 5: Product Status & Stock Status

#### TC-PM-024: Update Product Status
**Priority**: Medium  
**Type**: E2E  
**Description**: Cập nhật trạng thái sản phẩm

**Preconditions**:
- Đã có product với status = Active

**Test Steps**:
1. Navigate to `/admin/products`
2. Click "Edit" cho product
3. Change Status: Inactive
4. Click "Save"

**Expected Results**:
- Product status được cập nhật thành công
- Product không hiển thị trong active products list
- Status được hiển thị đúng

#### TC-PM-025: Stock Status - Auto Update
**Priority**: High  
**Type**: Integration  
**Description**: Stock status tự động cập nhật từ inventory

**Preconditions**:
- Product có inventory quantity = 0

**Test Steps**:
1. Inventory Service cập nhật quantity = 0
2. Check product stock status

**Expected Results**:
- Stock status tự động chuyển thành "Out of Stock"
- Status được sync từ Inventory Service

### Feature 6: Batch & Expiry Date Management

#### TC-PM-026: Enable Batch Management
**Priority**: Medium  
**Type**: E2E  
**Description**: Bật batch management cho sản phẩm

**Preconditions**:
- Đã có product

**Test Steps**:
1. Navigate to `/admin/products/{id}/edit`
2. Enable "Batch Management"
3. Click "Save"

**Expected Results**:
- Batch management được enable
- Batch number field required khi nhập kho

#### TC-PM-027: Enable Expiry Date Management
**Priority**: Medium  
**Type**: E2E  
**Description**: Bật expiry date management cho sản phẩm

**Preconditions**:
- Đã có product

**Test Steps**:
1. Navigate to `/admin/products/{id}/edit`
2. Enable "Has Expiry Date"
3. Set Expiry Warning Days: 30
4. Click "Save"

**Expected Results**:
- Expiry date management được enable
- Expiry date field required khi nhập kho
- System cảnh báo khi sắp hết hạn

## Edge Cases

#### TC-PM-EC-001: Create Product - Max Length Fields
**Priority**: Medium  
**Type**: E2E  
**Description**: Tạo sản phẩm với fields có độ dài tối đa

**Test Steps**:
1. Fill form với:
   - SKU: 255 characters
   - Name: 255 characters
   - Description: 5000 characters
2. Click "Save"

**Expected Results**:
- Product được tạo thành công
- Tất cả fields được lưu đúng

#### TC-PM-EC-002: Create Product - Special Characters
**Priority**: Medium  
**Type**: E2E  
**Description**: Tạo sản phẩm với special characters

**Test Steps**:
1. Fill form với:
   - Name: "Sản phẩm @#$%^&*()"
   - Description: "Mô tả có ký tự đặc biệt: <script>alert('xss')</script>"
2. Click "Save"

**Expected Results**:
- Product được tạo thành công
- Special characters được escape đúng
- Không có XSS vulnerability

#### TC-PM-EC-003: Search - Empty Results
**Priority**: Low  
**Type**: E2E  
**Description**: Tìm kiếm không có kết quả

**Test Steps**:
1. Search với term: "NonexistentProduct12345"
2. Wait for results

**Expected Results**:
- Hiển thị "No products found"
- Empty state được hiển thị đúng

#### TC-PM-EC-004: Price Calculation - Negative Price
**Priority**: High  
**Type**: E2E  
**Description**: Thiết lập giá âm

**Test Steps**:
1. Set price = -1000
2. Click "Save"

**Expected Results**:
- Hiển thị validation error: "Price must be >= 0"
- Price không được lưu

#### TC-PM-EC-005: Concurrent Price Updates
**Priority**: Medium  
**Type**: Integration  
**Description**: Cập nhật price đồng thời từ nhiều users

**Test Steps**:
1. User A và User B cùng update price cho cùng 1 product
2. User A save trước
3. User B save sau

**Expected Results**:
- Last write wins hoặc conflict resolution
- Data consistency được đảm bảo

## Error Cases

#### TC-PM-ERR-001: API Error - 500 Internal Server Error
**Priority**: High  
**Type**: E2E  
**Description**: Xử lý khi API trả về 500 error

**Test Steps**:
1. Mock API response 500
2. Try to create product

**Expected Results**:
- Hiển thị error message: "Có lỗi xảy ra. Vui lòng thử lại sau."
- User có thể retry

#### TC-PM-ERR-002: Network Timeout
**Priority**: Medium  
**Type**: E2E  
**Description**: Xử lý khi network timeout

**Test Steps**:
1. Simulate network timeout
2. Try to load products list

**Expected Results**:
- Hiển thị timeout error
- User có thể retry
- Loading state được hiển thị

#### TC-PM-ERR-003: Unauthorized Access
**Priority**: High  
**Type**: E2E  
**Description**: Truy cập không có quyền

**Preconditions**:
- User không có quyền quản lý products

**Test Steps**:
1. Navigate to `/admin/products`
2. Try to create product

**Expected Results**:
- Redirect to unauthorized page hoặc hiển thị error
- User không thể tạo product

## Business Rules Validation

#### TC-PM-BR-001: SKU Uniqueness
**Priority**: Critical  
**Type**: E2E  
**Description**: SKU phải unique trong toàn hệ thống

**Test Steps**:
1. Create product với SKU "PROD-001"
2. Try to create another product với SKU "PROD-001"

**Expected Results**:
- Validation error: "SKU đã tồn tại"
- Second product không được tạo

#### TC-PM-BR-002: Category Hierarchy Validation
**Priority**: Critical  
**Type**: E2E  
**Description**: Không cho phép circular reference trong category tree

**Test Steps**:
1. Category A có parent = B
2. Try to set B's parent = A

**Expected Results**:
- Validation error: "Circular reference không được phép"
- Update không thành công

#### TC-PM-BR-003: Price Priority Rules
**Priority**: Critical  
**Type**: E2E  
**Description**: Price priority phải đúng theo business rules

**Expected Results**:
- Contract > Customer > Customer Group > Volume > Standard
- Price calculation đúng theo priority

## Test Data Requirements

### Test Products
- Product 1: SKU="PROD-001", Name="Thức ăn tôm", Status=Active
- Product 2: SKU="PROD-002", Name="Men vi sinh", Status=Active
- Product 3: SKU="PROD-003", Name="Enzyme", Status=Inactive

### Test Categories
- Category 1: "Phụ liệu thức ăn" (root)
- Category 2: "Men vi sinh" (root)
- Category 3: "Thức ăn tôm" (child of Category 1)

### Test Brands
- Brand 1: "Brand ABC"
- Brand 2: "Brand XYZ"

### Test Prices
- Standard Price: 100000
- Customer Price: 90000 (for Customer ID = 1)
- Customer Group Price: 95000 (for Customer Group ID = 1)
- Contract Price: 85000 (for Contract ID = 1)
- Volume Price: 80000 (quantity 10-50)

## Test Coverage

### Happy Path Coverage: ✅
- Product CRUD operations
- Category management
- Brand/Model management
- Pricing management
- Search and filtering

### Edge Cases Coverage: ✅
- Max length fields
- Special characters
- Empty results
- Negative values
- Concurrent updates

### Error Cases Coverage: ✅
- API errors
- Network issues
- Unauthorized access

### Business Rules Coverage: ✅
- SKU uniqueness
- Category hierarchy
- Price priority

## Notes
- All test cases should be independent
- Test data should be cleaned up after each test
- Use test fixtures for consistent test data
- Follow Page Object Model pattern
- Tests should be parallelizable

