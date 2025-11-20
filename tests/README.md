# DigiERP Test Framework

Đây là bộ test framework hoàn chỉnh cho hệ thống DigiERP, được xây dựng với Playwright và tuân thủ các nguyên tắc testing hiện đại.

## 🏗️ Cấu trúc Test Framework

```
tests/
├── config/                 # Cấu hình test
│   ├── test-config.json   # Cấu hình chung
│   ├── roles.json         # Định nghĩa roles và permissions
│   └── users.json         # Test users cho các roles
├── pages/                  # Page Object Models
│   ├── base-page.js       # Base class cho tất cả pages
│   ├── login-page.js      # Login page
│   ├── dashboard-page.js  # Dashboard page
│   ├── products-page.js   # Products page
│   ├── inventory-page.js  # Inventory page
│   ├── users-page.js      # Users page
│   ├── customer-page.js    # Customer page
│   ├── financial-invoices-page.js # Financial invoices page
│   ├── purchase-orders-page.js # Purchase orders page
│   ├── reports-page.js    # Reports page
│   └── sales-orders-page.js # Sales orders page
├── tests/                  # Test cases
│   ├── auth/              # Authentication tests
│   │   ├── login-tests.js # Login functionality
│   │   └── role-permission-tests.js # Role-based access
│   ├── dashboard/         # Dashboard tests
│   │   └── dashboard-tests.js
│   ├── products/          # Products tests
│   │   ├── products-tests.js # Main products tests
│   │   └── products-tests.spec.js # Comprehensive products tests
│   ├── inventory/         # Inventory tests
│   │   └── inventory-tests.js
│   ├── users/             # Users tests
│   │   └── users-tests.js
│   ├── customers/         # Customer tests
│   │   └── customer-tests.js
│   ├── purchase/          # Purchase orders tests
│   │   └── purchase-orders-tests.js
│   ├── sales/             # Sales orders tests
│   │   └── sales-orders-tests.js
│   ├── financial/         # Financial tests
│   │   └── financial-invoices-tests.js
│   ├── reports/           # Reports tests
│   │   └── reports-tests.js
│   ├── api/               # API integration tests
│   │   └── api-integration-tests.js
│   └── e2e/               # End-to-end workflow tests
│       └── workflow-tests.js
├── utils/                  # Utility functions
│   ├── api-helper.js      # API testing utilities
│   ├── test-data-generator.js # Test data generation
│   ├── browser-helper.js  # Browser utilities
│   ├── global-setup.js    # Global test setup
│   └── global-teardown.js # Global test teardown
├── reports/                # Test reports
│   ├── html-report/       # HTML test reports
│   ├── screenshots/       # Screenshots on failure
│   ├── test-results/      # Test artifacts
│   └── videos/            # Test recordings
├── playwright.config.js   # Playwright configuration
├── playwright-fixed.config.js # Alternative config
├── run-tests.ps1          # PowerShell test runner
├── run-all-tests.ps1      # Comprehensive test runner
├── test-runner.ps1        # Test runner utility
├── test-simple.ps1        # Simple test runner
└── README.md              # This file
```

## 🚀 Cài đặt và Chạy Tests

### 1. Cài đặt Dependencies

**Lưu ý**: Chạy lệnh từ thư mục gốc của project (`D:\Prj\DigiERP_LeHuy-Dev2`)

```bash
# Từ thư mục gốc project
npm install
npx playwright install
```

### 2. Chạy Tests

**Lưu ý**: Tất cả lệnh test phải chạy từ thư mục gốc của project

#### Chạy tất cả tests:
```bash
# Từ thư mục gốc project (D:\Prj\DigiERP_LeHuy-Dev2)
npm test
# hoặc
npx playwright test
```

#### Chạy tests theo module:
```bash
# Authentication tests
npm run test:auth
npm run test:auth:chrome:single    # Chrome + 1 worker (tránh rate limiting)
npm run test:auth:chrome:slow      # Chrome + 1 worker + timeout 60s

# Dashboard tests
npm run test:dashboard
npm run test:dashboard:chrome:single    # Chrome + 1 worker
npm run test:dashboard:chrome:slow      # Chrome + 1 worker + timeout 60s

# Products tests
npm run test:products
npm run test:products:chrome:single     # Chrome + 1 worker
npm run test:products:chrome:slow       # Chrome + 1 worker + timeout 60s

# Inventory tests
npm run test:inventory
npm run test:inventory:chrome:single    # Chrome + 1 worker
npm run test:inventory:chrome:slow      # Chrome + 1 worker + timeout 60s

# Users tests
npm run test:users
npm run test:users:chrome:single        # Chrome + 1 worker
npm run test:users:chrome:slow          # Chrome + 1 worker + timeout 60s

# Customer tests
npm run test:customers
npm run test:customers:chrome:single    # Chrome + 1 worker
npm run test:customers:chrome:slow      # Chrome + 1 worker + timeout 60s

# Purchase orders tests
npm run test:purchase
npm run test:purchase:chrome:single     # Chrome + 1 worker
npm run test:purchase:chrome:slow       # Chrome + 1 worker + timeout 60s

# Sales orders tests
npm run test:sales
npm run test:sales:chrome:single        # Chrome + 1 worker
npm run test:sales:chrome:slow          # Chrome + 1 worker + timeout 60s

# Financial tests
npm run test:financial
npm run test:financial:chrome:single    # Chrome + 1 worker
npm run test:financial:chrome:slow      # Chrome + 1 worker + timeout 60s

# Reports tests
npm run test:reports
npm run test:reports:chrome:single     # Chrome + 1 worker
npm run test:reports:chrome:slow        # Chrome + 1 worker + timeout 60s

# API integration tests
npm run test:api
npm run test:api:chrome:single          # Chrome + 1 worker
npm run test:api:chrome:slow            # Chrome + 1 worker + timeout 60s

# End-to-end workflow tests
npm run test:e2e
npm run test:e2e:chrome:single           # Chrome + 1 worker
npm run test:e2e:chrome:slow            # Chrome + 1 worker + timeout 60s
```

#### Chạy tests theo browser:
```bash
# Chrome/Chromium
npm run test:chromium

# Firefox
npm run test:firefox

# Safari/WebKit
npm run test:webkit

# Tất cả browsers
npm run test:all-browsers
```

#### Chạy tests với UI:
```bash
npm run test:ui
```

#### Chạy tests với debug mode:
```bash
npm run test:debug
```

#### Chạy tests với browser hiển thị:
```bash
npm run test:headed
```

### 3. Sử dụng PowerShell Script

**Lưu ý**: Chạy từ thư mục gốc của project

```powershell
# Từ thư mục gốc project (D:\Prj\DigiERP_LeHuy-Dev2)
# Chạy tất cả tests
.\tests\run-all-tests.ps1

# Chạy smoke tests
.\tests\run-all-tests.ps1 -TestType smoke

# Chạy tests với Firefox
.\tests\run-all-tests.ps1 -TestType all -Browser firefox

# Chạy tests với debug mode
.\tests\run-all-tests.ps1 -TestType auth -Debug

# Chạy customer tests
.\tests\run-all-tests.ps1 -TestType customers

# Xem help
.\tests\run-all-tests.ps1 -Help
```

### 4. Chạy Tests Cụ Thể

#### Chạy test đơn giản:
```bash
npx playwright test tests/digierp-test.spec.js
```

#### Chạy test với browser hiển thị:
```bash
npx playwright test tests/digierp-test.spec.js --headed
```

#### Chạy test với UI mode:
```bash
npx playwright test --ui
```

#### Chạy test với debug mode:
```bash
npx playwright test --debug
```

#### Xem báo cáo test:
```bash
npx playwright show-report
```

### 5. Chạy Tests với Rate Limiting Protection

#### Tránh "Too Many requests" errors:
```bash
# Chạy với 1 worker (an toàn nhất)
npm run test:auth:chrome:single         # Auth tests
npm run test:api:chrome:single          # API tests
npm run test:e2e:chrome:single            # E2E tests

# Chạy với timeout tăng (cho tests phức tạp)
npm run test:reports:chrome:slow         # Reports tests
npm run test:financial:chrome:slow       # Financial tests
```

#### Các loại scripts theo tốc độ:
```bash
# Nhanh (2 workers, tất cả browsers)
npm run test:products                    # Products tests
npm run test:dashboard                   # Dashboard tests

# Cân bằng (Chrome + 2 workers)
npm run test:products:chrome             # Products với Chrome
npm run test:inventory:chrome            # Inventory với Chrome

# An toàn (Chrome + 1 worker)
npm run test:auth:chrome:single          # Auth tests
npm run test:api:chrome:single           # API tests

# Chậm nhưng ổn định (Chrome + 1 worker + timeout 60s)
npm run test:reports:chrome:slow         # Reports tests
npm run test:financial:chrome:slow      # Financial tests
```

## 📋 Các loại Tests

### 1. Authentication Tests
- Login/Logout functionality
- Role-based access control
- Session management
- Token handling

### 2. Dashboard Tests
- Page loading
- UI elements
- Navigation
- Responsive design

### 3. Products Tests
- CRUD operations
- Search and filtering
- Validation
- Bulk operations
- Role-based permissions
- API integration
- Performance testing
- Error handling
- Accessibility testing

### 4. Inventory Tests
- Stock management
- Stock adjustments
- Alerts and monitoring
- Warehouse management

### 5. Users Tests
- User management
- Role assignment
- Password reset
- Bulk operations

### 6. Customer Tests
- Customer CRUD operations
- Customer search and filtering
- Customer groups management
- Customer contracts
- Customer validation
- Customer API integration
- Customer permissions

### 7. Purchase Orders Tests
- Order creation
- Approval workflow
- Receiving process
- Status management

### 8. Sales Orders Tests
- Order processing
- Customer management
- Payment handling
- Status tracking

### 9. Financial Tests
- Invoice management
- Payment processing
- Financial reporting
- Tax calculations

### 10. Reports Tests
- Report generation
- Data visualization
- Export functionality
- Report scheduling

### 11. API Integration Tests
- Authentication API
- CRUD operations
- Error handling
- Performance testing

### 12. End-to-End Workflow Tests
- Complete business workflows
- Cross-module integration
- Data consistency
- Error recovery

## 🔧 Cấu hình

### Test Configuration (`tests/config/test-config.json`)
```json
{
  "baseUrl": "http://localhost:3000",
  "apiBaseUrl": "http://localhost:4000",
  "timeout": 30000,
  "retries": 2,
  "parallel": true,
  "workers": 4
}
```

### Roles Configuration (`tests/config/roles.json`)
```json
{
  "super_admin": {
    "name": "Super Administrator",
    "permissions": ["*"]
  },
  "admin": {
    "name": "Administrator",
    "permissions": ["products.*", "inventory.*", "purchase.*"]
  },
  "manager": {
    "name": "Manager",
    "permissions": ["products.read", "inventory.read", "purchase.read"]
  },
  "user": {
    "name": "User",
    "permissions": ["products.read"]
  },
  "viewer": {
    "name": "Viewer",
    "permissions": ["products.read"]
  }
}
```

### Users Configuration (`tests/config/users.json`)
```json
{
  "super_admin": {
    "username": "admin",
    "password": "admin123",
    "email": "admin@digierp.com"
  },
  "manager": {
    "username": "manager",
    "password": "manager123",
    "email": "manager@digierp.com"
  },
  "user": {
    "username": "user",
    "password": "user123",
    "email": "user@digierp.com"
  }
}
```

## 🎯 Test Data Management

### Test Data Generator
```javascript
const testDataGenerator = new TestDataGenerator();

// Generate user data
const userData = testDataGenerator.generateUser({
  username: 'testuser',
  email: 'test@example.com'
});

// Generate product data
const productData = testDataGenerator.generateProduct({
  name: 'Test Product',
  sku: 'TEST-001'
});

// Generate customer data
const customerData = testDataGenerator.generateCustomer({
  name: 'Test Customer',
  email: 'customer@example.com'
});
```

## 📊 Test Reports

### HTML Report
```bash
npm run test:report
# hoặc
npx playwright show-report
```

### Screenshots
Screenshots được tự động lưu trong `tests/reports/screenshots/` khi tests fail.

### Test Results
Test results được lưu trong `tests/reports/test-results/`.

### Videos
Test recordings được lưu trong `tests/reports/videos/` khi tests fail.

## 🔍 Debugging

### Debug Mode
```bash
npm run test:debug
# hoặc
npx playwright test --debug
```

### Headed Mode
```bash
npm run test:headed
# hoặc
npx playwright test --headed
```

### Code Generation
```bash
npm run test:codegen
# hoặc
npx playwright codegen
```

### Trace Viewer
```bash
npx playwright show-trace tests/reports/test-results/trace.zip
```

## 🚨 Best Practices

### 1. Test Organization
- Mỗi module có thư mục riêng
- Tests được nhóm theo chức năng
- Sử dụng Page Object Model
- Tách biệt test data và test logic

### 2. Test Data
- Sử dụng test data generator
- Không hardcode test data
- Cleanup sau mỗi test
- Sử dụng unique identifiers

### 3. Assertions
- Sử dụng meaningful assertions
- Test cả positive và negative cases
- Validate error messages
- Test edge cases

### 4. Performance
- Tests chạy song song khi có thể
- Sử dụng appropriate timeouts
- Optimize test execution time
- Monitor test stability

### 5. Maintenance
- Regular test review
- Update tests khi UI thay đổi
- Monitor test stability
- Keep tests independent

## 🐛 Troubleshooting

### Common Issues

#### 1. "No tests found" Error
**Nguyên nhân**: Chạy lệnh từ sai thư mục hoặc cấu hình sai
**Giải pháp**: 
```bash
# Đảm bảo chạy từ thư mục gốc project
cd D:\Prj\DigiERP_LeHuy-Dev2
npx playwright test
```

#### 2. Tests fail với timeout
```bash
# Tăng timeout trong test-config.json
"timeout": 60000
```

#### 3. Browser không được cài đặt
```bash
npx playwright install
```

#### 4. Services không chạy
```bash
# Khởi động tất cả services
docker-compose up -d

# Hoặc khởi động từng service riêng
npm run dev:api-gateway
npm run dev:user-service
npm run dev:customer-service
# ... các service khác
```

#### 5. Permission issues
```bash
# Windows
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Linux/Mac
chmod +x run-all-tests.ps1
```

#### 6. Global setup fails
**Nguyên nhân**: Application chưa chạy hoặc API không accessible
**Giải pháp**:
```bash
# Kiểm tra application đang chạy
curl http://localhost:3000

# Kiểm tra API
curl http://user-service:3001/api/v1/auth/login
```

#### 7. localStorage SecurityError
**Nguyên nhân**: Cố gắng clear localStorage trước khi page load
**Giải pháp**: 
- Đảm bảo page đã load trước khi clear storage
- Hoặc bỏ qua clear storage trong beforeEach

#### 8. TypeScript/NestJS Test Conflicts
**Nguyên nhân**: Playwright cố gắng chạy TypeScript tests
**Giải pháp**:
- Sử dụng `testMatch: '**/*.spec.js'` trong config
- Chỉ chạy JavaScript tests với Playwright

#### 9. "Too Many requests from this IP" Error
**Nguyên nhân**: Quá nhiều workers chạy đồng thời gây rate limiting
**Giải pháp**:
```bash
# Sử dụng 1 worker thay vì 10 workers
npm run test:auth:chrome:single         # Auth tests
npm run test:api:chrome:single          # API tests

# Hoặc giảm workers trong config
# playwright.config.js: workers: 2
```

#### 10. Database Connection Pool Exhausted
**Nguyên nhân**: Quá nhiều database connections đồng thời
**Giải pháp**:
```bash
# Chạy tests tuần tự
npm run test:auth:chrome:single         # 1 worker
npm run test:api:chrome:single          # 1 worker

# Hoặc tăng database connection pool
# Trong database config
```

## 📈 CI/CD Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx playwright install
      - run: npm test
```

### Jenkins
```groovy
pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                sh 'npm install'
                sh 'npx playwright install'
                sh 'npm test'
            }
        }
    }
}
```

## 🤝 Contributing

### Adding New Tests
1. Tạo Page Object Model mới trong `tests/pages/`
2. Tạo test cases trong `tests/tests/`
3. Update configuration files nếu cần
4. Add test scripts vào `package.json`

### Test Naming Convention
- Test files: `module-name-tests.js` hoặc `module-name-tests.spec.js`
- Test functions: `should do something when condition`
- Page objects: `ModuleNamePage`
- Test data: `testDataGenerator.generateModuleName()`

### Customer Service Tests
Customer service tests đã được thêm vào framework với các tính năng:
- Customer CRUD operations
- Customer groups management
- Customer contracts
- Customer search and filtering
- Customer validation
- Customer API integration
- Customer permissions

**Chạy customer tests**:
```bash
# Từ thư mục gốc project
npm run test:customers
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Test Automation Best Practices](https://testautomationu.applitools.com/)
- [Page Object Model Pattern](https://martinfowler.com/bliki/PageObject.html)
- [DigiERP Documentation](./README.md)

## 🆘 Support

Nếu gặp vấn đề với test framework, vui lòng:
1. Check troubleshooting section
2. Review test logs
3. Contact development team
4. Create issue trong repository

## 📊 Test Statistics

Hiện tại hệ thống có:
- **147 tests** tổng cộng
- **4 test files** chính
- **3 browsers** được hỗ trợ (Chromium, Firefox, WebKit)
- **12 modules** được test
- **100% JavaScript** tests (không có TypeScript conflicts)

## 🎯 Quick Start

```bash
# 1. Cài đặt dependencies
npm install
npx playwright install

# 2. Khởi động ứng dụng
docker-compose up -d

# 3. Chạy test đơn giản
npx playwright test tests/digierp-test.spec.js

# 4. Chạy tests an toàn (tránh rate limiting)
npm run test:auth:chrome:single         # Auth tests
npm run test:products:chrome:single     # Products tests

# 5. Chạy tất cả tests
npx playwright test

# 6. Xem báo cáo
npx playwright show-report
```

## 🚀 Test Scripts Summary

### **Các loại scripts có sẵn:**

#### **Basic Scripts:**
- `npm run test:auth` - Auth tests (tất cả browsers)
- `npm run test:products` - Products tests (tất cả browsers)
- `npm run test:dashboard` - Dashboard tests (tất cả browsers)

#### **Chrome-only Scripts:**
- `npm run test:auth:chrome` - Auth tests (Chrome only)
- `npm run test:products:chrome` - Products tests (Chrome only)

#### **Single Worker Scripts (An toàn):**
- `npm run test:auth:chrome:single` - Auth tests (Chrome + 1 worker)
- `npm run test:api:chrome:single` - API tests (Chrome + 1 worker)

#### **Slow Scripts (Ổn định):**
- `npm run test:reports:chrome:slow` - Reports tests (Chrome + 1 worker + timeout 60s)
- `npm run test:financial:chrome:slow` - Financial tests (Chrome + 1 worker + timeout 60s)

---

**🎉 DigiERP Test Framework - Hoàn chỉnh và sẵn sàng sử dụng!**