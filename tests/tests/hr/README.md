# HR Management Tests

## Attendance Management (Chấm Công) Tests

### Test Files
- **Page Object**: `tests/pages/attendance-page.js`
- **E2E Tests**: `tests/tests/hr/attendance-tests.js`
- **Test Documentation**: `docs/automation-tester/test-cases-attendance-management.md`

### Running Tests

#### Prerequisites
1. Ensure all dependencies are installed:
```bash
npm install
npx playwright install
```

2. Start the application:
```bash
# Start admin panel
cd apps/admin-panel
npm run dev

# Or start all services with docker-compose
docker-compose up -d
```

#### Run Attendance Tests

```bash
# Run all attendance tests (Chrome, single worker)
npm run test:hr:attendance:chrome:single

# Run with slow timeout (for complex scenarios)
npm run test:hr:attendance:chrome:slow

# Run all HR tests
npm run test:hr

# Run with UI mode
npm run test:hr:attendance -- --ui

# Run with headed browser
npm run test:hr:attendance -- --headed

# Run with debug mode
npm run test:hr:attendance -- --debug
```

### Test Coverage

#### Use Cases Covered
- ✅ UC-ATT-001: Employee Check-In
- ✅ UC-ATT-002: Employee Check-Out
- ✅ UC-ATT-003: View Attendance History
- ✅ UC-ATT-004: Edit Attendance Record
- ✅ UC-ATT-005: Approve/Reject Attendance Record
- ✅ UC-ATT-006: Attendance Dashboard and Reports
- ✅ UC-ATT-007: Export Attendance Data

#### Test Scenarios
- **Happy Path**: Check-in/check-out, view history, edit, approve/reject
- **Edge Cases**: Duplicate check-in/check-out, late/early leave, weekend/holiday
- **Error Cases**: API errors, validation errors
- **Business Rules**: Approval workflow, overtime calculation

### Test Reports

After running tests, view reports:

```bash
# View HTML report
npm run test:report
# or
npx playwright show-report tests/reports/html-report

# Reports location
# - HTML: tests/reports/html-report/index.html
# - JSON: tests/reports/test-results.json
# - JUnit: tests/reports/junit-results.xml
```

### Test Structure

```
tests/
├── pages/
│   └── attendance-page.js          # Page Object Model
├── tests/
│   └── hr/
│       └── attendance-tests.js     # E2E Tests
└── reports/
    ├── html-report/                # HTML reports
    ├── test-results.json           # JSON results
    └── junit-results.xml           # JUnit results
```

### Notes

- Tests require the application to be running on `http://localhost:3000`
- Tests use test users from `tests/config/users.json`
- Page Object Model pattern is used for maintainability
- Tests are independent and can run in parallel
- All tests include proper cleanup and error handling

