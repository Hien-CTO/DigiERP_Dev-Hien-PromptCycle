# Automation Tester Documentation

## Overview
Thư mục này chứa tất cả test cases và documentation cho hệ thống DigiERP, được viết bởi Automation Tester theo quy định trong `.cursorrules.automation-tester`.

## Test Cases Documentation

### Epic Test Cases

1. **[Product Management (EPIC-001)](test-cases-product-management.md)**
   - Product Information Management
   - Product Categories Management
   - Brand & Model Management
   - Multi-tier Pricing System
   - Product Status & Stock Status
   - Batch & Expiry Date Management
   - **Total Test Cases**: 27+ test cases

2. **[Inventory Management (EPIC-002)](test-cases-inventory-management.md)**
   - Warehouse Management
   - Area & Location Management
   - Inventory Tracking & Movements
   - Goods Receipt Management
   - Goods Issue Management
   - Inventory Counting & Adjustment
   - Inventory Transfer Management
   - Inventory Revaluation
   - **Total Test Cases**: 26+ test cases

3. **[Customer Management (EPIC-003)](test-cases-customer-management.md)**
   - Customer Information Management
   - Customer Segmentation
   - Customer Contacts Management
   - Contract Management
   - 360° Customer View
   - Customer Status Management
   - Customer Audit Trail
   - **Total Test Cases**: 24+ test cases

4. **[Sales Management (EPIC-004)](test-cases-sales-management.md)**
   - Quote Generation & Management
   - Order Management
   - Multiple Order Types Management
   - Pricing Engine Integration
   - Credit Management
   - Order Status Tracking
   - Delivery & Logistics Management
   - **Total Test Cases**: 24+ test cases

5. **[Purchase Management (EPIC-005)](test-cases-purchase-management.md)**
   - Supplier Management
   - Purchase Requisition Workflow
   - Purchase Order Management
   - Purchase Order Items Management
   - Goods Receipt Processing
   - Quality Inspection Integration
   - Invoice Matching (3-way Matching)
   - **Total Test Cases**: 24+ test cases

6. **[Financial Management (EPIC-006)](test-cases-financial-management.md)**
   - Invoice Management
   - Invoice Items Management
   - Payment Processing & Tracking
   - Accounts Receivable Management
   - Accounts Payable Management
   - Invoice Status Management
   - Credit Note & Debit Note Management
   - Payment Method Management
   - **Total Test Cases**: 24+ test cases

7. **[HR Management (EPIC-008)](test-cases-hr-management.md)**
   - Employee Management
   - Department Management
   - Position Management
   - Contract Management
   - Attendance Management
   - Leave Management
   - Employee-User Integration & Authorization
   - **Total Test Cases**: 25+ test cases

## Test Case Structure

Mỗi test case bao gồm:

- **Test Case ID**: Unique identifier (e.g., TC-PM-001)
- **Priority**: High, Medium, Low, Critical
- **Type**: E2E, Integration, Unit
- **Description**: Mô tả ngắn gọn test case
- **Preconditions**: Điều kiện cần thiết trước khi test
- **Test Steps**: Các bước thực hiện test
- **Expected Results**: Kết quả mong đợi

## Test Categories

### Happy Path Tests
Test các scenarios thành công, user flow bình thường.

### Edge Cases Tests
Test các boundary conditions, empty inputs, max values, special characters.

### Error Cases Tests
Test invalid inputs, unauthorized access, server errors, network issues.

### Business Rules Tests
Test validation theo business rules, data integrity, workflow enforcement.

## Test Coverage Summary

| Epic | Happy Path | Edge Cases | Error Cases | Business Rules | Total |
|------|------------|------------|-------------|----------------|-------|
| Product Management | ✅ | ✅ | ✅ | ✅ | 27+ |
| Inventory Management | ✅ | ✅ | ✅ | ✅ | 26+ |
| Customer Management | ✅ | ✅ | ✅ | ✅ | 24+ |
| Sales Management | ✅ | ✅ | ✅ | ✅ | 24+ |
| Purchase Management | ✅ | ✅ | ✅ | ✅ | 24+ |
| Financial Management | ✅ | ✅ | ✅ | ✅ | 24+ |
| HR Management | ✅ | ✅ | ✅ | ✅ | 25+ |
| **TOTAL** | | | | | **174+** |

## Test Implementation Guidelines

### Test Independence
- Mỗi test phải độc lập, không phụ thuộc vào test khác
- Sử dụng test fixtures để setup data
- Cleanup sau mỗi test

### Test Data Management
- Sử dụng test data generators
- Test data được isolate per test
- Test fixtures trong `/tests/config/`

### Page Object Model
- Sử dụng page objects trong `/tests/pages/`
- Base page class cho common functionality
- Page-specific methods trong page classes

### Assertions
- Clear và meaningful assertions
- Verify both UI và data
- Check error messages

### Retry Logic
- Handle flaky tests với retry logic
- Configurable retry trong Playwright config

### Parallel Execution
- Tests có thể chạy parallel
- No shared state between tests
- Independent test data

## Test Execution

### Run All Tests
```bash
npm run test
```

### Run Specific Epic Tests
```bash
npm run test -- tests/products/products-tests.spec.js
npm run test -- tests/inventory/inventory-tests.spec.js
npm run test -- tests/sales/sales-orders-tests.spec.js
```

### Run Tests with UI
```bash
npm run test:ui
```

### Generate Test Reports
```bash
npm run test:report
```

## Test Reports

Test reports được generate trong `/tests/reports/`:
- HTML Report: `reports/html-report/index.html`
- JSON Report: `reports/test-results.json`
- JUnit Report: `reports/junit-results.xml`

## CI/CD Integration

Tests được tích hợp vào CI/CD pipeline:
- Run tests on every commit
- Generate test reports
- Fail build on test failures
- Test results được publish

## Notes

- All test cases follow `.cursorrules.automation-tester` guidelines
- Test cases cover happy path, edge cases, error cases, và business rules
- Test data requirements được document trong mỗi test case file
- Test coverage được track và maintain
- Tests should be updated khi có thay đổi requirements

## Maintenance

- Review và update test cases khi có thay đổi requirements
- Add new test cases cho new features
- Remove obsolete test cases
- Maintain test data và fixtures
- Update test documentation

---

**Last Updated**: November 2025  
**Maintained By**: Automation Tester Team

