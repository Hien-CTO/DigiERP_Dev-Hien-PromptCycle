# Batch Management Fields for Products

## Tổng quan

Các trường mới được thêm vào model Product để hỗ trợ quản lý sản phẩm theo lô và hạn sử dụng (HSD).

## Các trường mới

### 1. `is_batch_managed` (Boolean)
- **Mô tả**: Bật/tắt quản lý theo lô cho sản phẩm
- **Mặc định**: `false`
- **Sử dụng**: 
  - `true`: Sản phẩm cần quản lý theo lô (thức ăn, thuốc, men vi sinh)
  - `false`: Sản phẩm không cần quản lý theo lô (dụng cụ, thiết bị)

### 2. `has_expiry_date` (Boolean)
- **Mô tả**: Sản phẩm có hạn sử dụng hay không
- **Mặc định**: `false`
- **Sử dụng**:
  - `true`: Sản phẩm có hạn sử dụng
  - `false`: Sản phẩm không có hạn sử dụng

### 3. `expiry_warning_days` (Integer)
- **Mô tả**: Số ngày cảnh báo trước khi hết hạn
- **Mặc định**: `30`
- **Sử dụng**: Hệ thống sẽ cảnh báo khi lô còn lại X ngày trước khi hết hạn

### 4. `batch_required` (Boolean)
- **Mô tả**: Bắt buộc nhập số lô khi nhập kho
- **Mặc định**: `false`
- **Sử dụng**:
  - `true`: Bắt buộc nhập số lô khi nhập kho
  - `false`: Không bắt buộc nhập số lô

## Các kết hợp thường dùng

### Sản phẩm có hạn sử dụng (Thức ăn, thuốc)
```json
{
  "isBatchManaged": true,
  "hasExpiryDate": true,
  "expiryWarningDays": 30,
  "batchRequired": true
}
```

### Sản phẩm không có hạn sử dụng (Dụng cụ, thiết bị)
```json
{
  "isBatchManaged": false,
  "hasExpiryDate": false,
  "expiryWarningDays": 0,
  "batchRequired": false
}
```

### Sản phẩm có lô nhưng không có hạn sử dụng
```json
{
  "isBatchManaged": true,
  "hasExpiryDate": false,
  "expiryWarningDays": 0,
  "batchRequired": true
}
```

## API Usage

### Tạo sản phẩm mới
```typescript
POST /products
{
  "sku": "THUOC001",
  "name": "Thuốc kháng sinh cho tôm",
  "isBatchManaged": true,
  "hasExpiryDate": true,
  "expiryWarningDays": 30,
  "batchRequired": true
}
```

### Cập nhật sản phẩm
```typescript
PUT /products/1
{
  "isBatchManaged": true,
  "hasExpiryDate": true,
  "expiryWarningDays": 45
}
```

## Database Migration

Chạy migration script để thêm các trường mới vào database:

```sql
-- File: migrations/add-batch-management-fields.sql
ALTER TABLE products 
ADD COLUMN is_batch_managed BOOLEAN DEFAULT FALSE,
ADD COLUMN has_expiry_date BOOLEAN DEFAULT FALSE,
ADD COLUMN expiry_warning_days INT DEFAULT 30,
ADD COLUMN batch_required BOOLEAN DEFAULT FALSE;
```

## Lưu ý

1. **Tương thích ngược**: Các trường mới có giá trị mặc định, không ảnh hưởng đến dữ liệu hiện tại
2. **Validation**: Cần thêm validation logic trong business layer
3. **UI**: Frontend cần cập nhật để hiển thị và xử lý các trường mới
4. **Inventory**: Cần cập nhật inventory service để hỗ trợ quản lý lô
