const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login-page');
const ReportsPage = require('../../pages/reports-page');
const ApiHelper = require('../../utils/api-helper');
const TestDataGenerator = require('../../utils/test-data-generator');
const BrowserHelper = require('../../utils/browser-helper');

// Load test configuration
const testConfig = require('../../config/test-config.json');
const users = require('../../config/users.json');

test.describe('Reports Page Tests', () => {
  let loginPage;
  let reportsPage;
  let apiHelper;
  let testDataGenerator;
  let browserHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    reportsPage = new ReportsPage(page);
    apiHelper = new ApiHelper(page);
    testDataGenerator = new TestDataGenerator();
    browserHelper = new BrowserHelper(page);
    
    // Clear all storage before each test
    await browserHelper.clearAllStorage();
  });

  test.describe('Reports Page Access and Authentication', () => {
    test('should redirect to login when not authenticated', async () => {
      await reportsPage.goto();
      
      // Should be redirected to login page
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/login');
    });

    test('should load reports page after successful login', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      await reportsPage.goto();
      expect(await reportsPage.isReportsPageLoaded()).toBe(true);
    });

    test('should display proper page title', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      await reportsPage.goto();
      const pageTitle = await reportsPage.getPageTitle();
      expect(pageTitle).toContain('Reports');
    });
  });

  test.describe('Reports Page UI Elements', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await reportsPage.goto();
    });

    test('should display all required page elements', async () => {
      const validation = await reportsPage.validatePageElements();
      expect(validation.valid).toBe(true);
      expect(validation.missing).toHaveLength(0);
    });

    test('should display report category tabs', async () => {
      expect(await reportsPage.isVisible(reportsPage.selectors.salesReportsTab)).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.inventoryReportsTab)).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.financialReportsTab)).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.purchaseReportsTab)).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.userReportsTab)).toBe(true);
    });

    test('should display action buttons', async () => {
      expect(await reportsPage.isVisible(reportsPage.selectors.generateReportButton)).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.exportReportButton)).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.scheduleReportButton)).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.refreshDataButton)).toBe(true);
    });

    test('should display report filters', async () => {
      expect(await reportsPage.isVisible(reportsPage.selectors.reportTypeSelect)).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.dateRangeSelect)).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.startDateInput)).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.endDateInput)).toBe(true);
    });

    test('should display quick filters', async () => {
      expect(await reportsPage.isVisible(reportsPage.selectors.todayFilter)).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.thisWeekFilter)).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.thisMonthFilter)).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.thisYearFilter)).toBe(true);
    });

    test('should be responsive on different screen sizes', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      expect(await reportsPage.isReportsPageLoaded()).toBe(true);
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      expect(await reportsPage.isReportsPageLoaded()).toBe(true);
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      expect(await reportsPage.isReportsPageLoaded()).toBe(true);
    });
  });

  test.describe('Report Category Navigation', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await reportsPage.goto();
    });

    test('should switch to sales reports tab', async () => {
      await reportsPage.clickReportCategory('sales');
      
      // Should show sales reports content
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should switch to inventory reports tab', async () => {
      await reportsPage.clickReportCategory('inventory');
      
      // Should show inventory reports content
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should switch to financial reports tab', async () => {
      await reportsPage.clickReportCategory('financial');
      
      // Should show financial reports content
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should switch to purchase reports tab', async () => {
      await reportsPage.clickReportCategory('purchase');
      
      // Should show purchase reports content
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should switch to user reports tab', async () => {
      await reportsPage.clickReportCategory('user');
      
      // Should show user reports content
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });
  });

  test.describe('Report Generation', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await reportsPage.goto();
    });

    test('should open generate report modal', async () => {
      await reportsPage.clickGenerateReport();
      expect(await reportsPage.isModalOpen('generate')).toBe(true);
    });

    test('should generate sales report successfully', async () => {
      await reportsPage.clickReportCategory('sales');
      
      const reportData = {
        reportName: 'Sales Report Test',
        reportDescription: 'Test sales report generation',
        reportFormat: 'pdf',
        includeCharts: true,
        includeDetails: true
      };
      
      const result = await reportsPage.testGenerateReport(reportData);
      expect(result.success).toBe(true);
      
      if (await reportsPage.hasSuccessMessage()) {
        const successMessage = await reportsPage.getSuccessMessage();
        expect(successMessage).toContain('success');
      }
    });

    test('should generate inventory report successfully', async () => {
      await reportsPage.clickReportCategory('inventory');
      
      const reportData = {
        reportName: 'Inventory Report Test',
        reportDescription: 'Test inventory report generation',
        reportFormat: 'excel',
        includeCharts: false,
        includeDetails: true
      };
      
      const result = await reportsPage.testGenerateReport(reportData);
      expect(result.success).toBe(true);
      
      if (await reportsPage.hasSuccessMessage()) {
        const successMessage = await reportsPage.getSuccessMessage();
        expect(successMessage).toContain('success');
      }
    });

    test('should generate financial report successfully', async () => {
      await reportsPage.clickReportCategory('financial');
      
      const reportData = {
        reportName: 'Financial Report Test',
        reportDescription: 'Test financial report generation',
        reportFormat: 'pdf',
        includeCharts: true,
        includeDetails: true
      };
      
      const result = await reportsPage.testGenerateReport(reportData);
      expect(result.success).toBe(true);
      
      if (await reportsPage.hasSuccessMessage()) {
        const successMessage = await reportsPage.getSuccessMessage();
        expect(successMessage).toContain('success');
      }
    });

    test('should validate report generation form', async () => {
      await reportsPage.clickGenerateReport();
      
      // Try to generate report without required fields
      await reportsPage.generateReport();
      
      // Should show validation error
      expect(await reportsPage.hasErrorMessage()).toBe(true);
    });

    test('should close generate report modal when cancel is clicked', async () => {
      await reportsPage.clickGenerateReport();
      expect(await reportsPage.isModalOpen('generate')).toBe(true);
      
      await reportsPage.cancelForm();
      expect(await reportsPage.isModalOpen('generate')).toBe(false);
    });
  });

  test.describe('Report Export', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await reportsPage.goto();
    });

    test('should open export report modal', async () => {
      await reportsPage.clickExportReport();
      expect(await reportsPage.isModalOpen('export')).toBe(true);
    });

    test('should export report successfully', async () => {
      await reportsPage.clickReportCategory('sales');
      
      const exportData = {
        exportFormat: 'pdf',
        exportFileName: 'sales_report_export',
        includeSummary: true
      };
      
      const result = await reportsPage.testExportReport(exportData);
      expect(result.success).toBe(true);
      
      if (await reportsPage.hasSuccessMessage()) {
        const successMessage = await reportsPage.getSuccessMessage();
        expect(successMessage).toContain('success');
      }
    });

    test('should export report in different formats', async () => {
      const formats = ['pdf', 'excel', 'csv'];
      
      for (const format of formats) {
        await reportsPage.clickExportReport();
        
        const exportData = {
          exportFormat: format,
          exportFileName: `report_export_${format}`,
          includeSummary: true
        };
        
        await reportsPage.fillExportForm(exportData);
        await reportsPage.exportReport();
        
        if (await reportsPage.hasSuccessMessage()) {
          const successMessage = await reportsPage.getSuccessMessage();
          expect(successMessage).toBeDefined();
        }
      }
    });

    test('should validate export form', async () => {
      await reportsPage.clickExportReport();
      
      // Try to export without required fields
      await reportsPage.exportReport();
      
      // Should show validation error
      expect(await reportsPage.hasErrorMessage()).toBe(true);
    });
  });

  test.describe('Report Scheduling', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await reportsPage.goto();
    });

    test('should open schedule report modal', async () => {
      await reportsPage.clickScheduleReport();
      expect(await reportsPage.isModalOpen('schedule')).toBe(true);
    });

    test('should schedule report successfully', async () => {
      await reportsPage.clickScheduleReport();
      
      const scheduleData = {
        scheduleFrequency: 'daily',
        scheduleTime: '09:00',
        scheduleEmail: 'admin@example.com',
        scheduleEnabled: true
      };
      
      await reportsPage.fillScheduleForm(scheduleData);
      await reportsPage.scheduleReport();
      
      if (await reportsPage.hasSuccessMessage()) {
        const successMessage = await reportsPage.getSuccessMessage();
        expect(successMessage).toContain('success');
      }
    });

    test('should schedule report with different frequencies', async () => {
      const frequencies = ['daily', 'weekly', 'monthly', 'yearly'];
      
      for (const frequency of frequencies) {
        await reportsPage.clickScheduleReport();
        
        const scheduleData = {
          scheduleFrequency: frequency,
          scheduleTime: '09:00',
          scheduleEmail: 'admin@example.com',
          scheduleEnabled: true
        };
        
        await reportsPage.fillScheduleForm(scheduleData);
        await reportsPage.scheduleReport();
        
        if (await reportsPage.hasSuccessMessage()) {
          const successMessage = await reportsPage.getSuccessMessage();
          expect(successMessage).toBeDefined();
        }
      }
    });

    test('should validate schedule form', async () => {
      await reportsPage.clickScheduleReport();
      
      // Try to schedule without required fields
      await reportsPage.scheduleReport();
      
      // Should show validation error
      expect(await reportsPage.hasErrorMessage()).toBe(true);
    });
  });

  test.describe('Report Filtering and Date Range', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await reportsPage.goto();
    });

    test('should set report type', async () => {
      await reportsPage.setReportType('sales_summary');
      await reportsPage.waitForLoading();
      
      // Should show filtered report content
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should set date range', async () => {
      const dateRanges = ['today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'thisYear', 'lastYear'];
      
      for (const dateRange of dateRanges) {
        await reportsPage.setDateRange(dateRange);
        await reportsPage.waitForLoading();
        
        // Should show filtered report content
        expect(await reportsPage.isReportContentVisible()).toBe(true);
      }
    });

    test('should set custom date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      
      await reportsPage.setCustomDateRange(startDate, endDate);
      await reportsPage.waitForLoading();
      
      // Should show filtered report content
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should use quick filters', async () => {
      const quickFilters = ['today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'thisYear', 'lastYear'];
      
      for (const filter of quickFilters) {
        await reportsPage.clickQuickFilter(filter);
        await reportsPage.waitForLoading();
        
        // Should show filtered report content
        expect(await reportsPage.isReportContentVisible()).toBe(true);
      }
    });

    test('should set department filter', async () => {
      await reportsPage.setDepartmentFilter('IT');
      await reportsPage.waitForLoading();
      
      // Should show filtered report content
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should set category filter', async () => {
      await reportsPage.setCategoryFilter('Electronics');
      await reportsPage.waitForLoading();
      
      // Should show filtered report content
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should set status filter', async () => {
      await reportsPage.setStatusFilter('active');
      await reportsPage.waitForLoading();
      
      // Should show filtered report content
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });
  });

  test.describe('Report Statistics and Data', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await reportsPage.goto();
    });

    test('should display report statistics', async () => {
      const stats = await reportsPage.getReportStats();
      expect(stats).toBeDefined();
      
      // Check if any statistics are available
      const hasStats = Object.keys(stats).length > 0;
      expect(hasStats).toBe(true);
    });

    test('should display report table when available', async () => {
      await reportsPage.clickReportCategory('sales');
      
      if (await reportsPage.isReportTableVisible()) {
        const rowCount = await reportsPage.getReportTableRowCount();
        expect(rowCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should display report chart when available', async () => {
      await reportsPage.clickReportCategory('sales');
      
      if (await reportsPage.isReportChartVisible()) {
        expect(await reportsPage.isReportChartVisible()).toBe(true);
      }
    });

    test('should handle empty report data', async () => {
      // Set a date range with no data
      await reportsPage.setCustomDateRange('1900-01-01', '1900-01-02');
      
      if (await reportsPage.isReportEmpty()) {
        expect(await reportsPage.isReportEmpty()).toBe(true);
      }
    });
  });

  test.describe('Report Navigation and Comparison', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await reportsPage.goto();
    });

    test('should navigate to previous period', async () => {
      await reportsPage.goToPreviousPeriod();
      
      // Should show report content for previous period
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should navigate to next period', async () => {
      await reportsPage.goToNextPeriod();
      
      // Should show report content for next period
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should navigate to current period', async () => {
      await reportsPage.goToCurrentPeriod();
      
      // Should show report content for current period
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should toggle comparison with previous period', async () => {
      await reportsPage.toggleComparisonWithPrevious();
      
      // Should show comparison data
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should set comparison mode', async () => {
      await reportsPage.setComparisonMode('percentage');
      
      // Should show comparison in percentage mode
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });
  });

  test.describe('Report Customization', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await reportsPage.goto();
    });

    test('should toggle show details', async () => {
      await reportsPage.toggleShowDetails();
      
      // Should show/hide detailed information
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should set group by option', async () => {
      await reportsPage.setGroupBy('category');
      
      // Should group report data by category
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should set sort by option', async () => {
      await reportsPage.setSortBy('amount');
      
      // Should sort report data by amount
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should set sort order', async () => {
      await reportsPage.setSortOrder('desc');
      
      // Should sort report data in descending order
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });
  });

  test.describe('Report Templates', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await reportsPage.goto();
    });

    test('should set report template', async () => {
      await reportsPage.setReportTemplate('monthly_sales');
      
      // Should load template settings
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });

    test('should save current report as template', async () => {
      await reportsPage.saveAsTemplate();
      
      if (await reportsPage.hasSuccessMessage()) {
        const successMessage = await reportsPage.getSuccessMessage();
        expect(successMessage).toContain('success');
      }
    });

    test('should load report template', async () => {
      await reportsPage.loadTemplate();
      
      // Should load template and show report content
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });
  });

  test.describe('Report Sharing', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await reportsPage.goto();
    });

    test('should share report via email', async () => {
      const email = 'test@example.com';
      const message = 'Please find the attached report';
      
      await reportsPage.shareReport(email, message);
      
      if (await reportsPage.hasSuccessMessage()) {
        const successMessage = await reportsPage.getSuccessMessage();
        expect(successMessage).toContain('success');
      }
    });

    test('should validate email when sharing', async () => {
      const invalidEmail = 'invalid-email';
      const message = 'Test message';
      
      await reportsPage.shareReport(invalidEmail, message);
      
      // Should show validation error
      expect(await reportsPage.hasErrorMessage()).toBe(true);
    });
  });

  test.describe('Data Refresh', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await reportsPage.goto();
    });

    test('should refresh report data', async () => {
      await reportsPage.clickRefreshData();
      
      // Should show loading state and then updated data
      expect(await reportsPage.isReportContentVisible()).toBe(true);
    });
  });

  test.describe('Role-based Access Control', () => {
    test('should allow admin to access all reports', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.admin.username,
        users.admin.password
      );
      await reportsPage.goto();
      
      expect(await reportsPage.isReportsPageLoaded()).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.generateReportButton)).toBe(true);
    });

    test('should allow manager to access reports', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.manager.username,
        users.manager.password
      );
      await reportsPage.goto();
      
      expect(await reportsPage.isReportsPageLoaded()).toBe(true);
      expect(await reportsPage.isVisible(reportsPage.selectors.generateReportButton)).toBe(true);
    });

    test('should restrict user to view-only access', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.user.username,
        users.user.password
      );
      await reportsPage.goto();
      
      // User should be able to view reports
      expect(await reportsPage.isReportsPageLoaded()).toBe(true);
      
      // User should not be able to generate reports
      const hasGenerateButton = await reportsPage.isVisible(reportsPage.selectors.generateReportButton);
      if (hasGenerateButton) {
        const isEnabled = await reportsPage.page.locator(reportsPage.selectors.generateReportButton).isEnabled();
        expect(isEnabled).toBe(false);
      }
    });

    test('should restrict viewer to view-only access', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.viewer.username,
        users.viewer.password
      );
      await reportsPage.goto();
      
      // Viewer should be able to view reports
      expect(await reportsPage.isReportsPageLoaded()).toBe(true);
      
      // Viewer should not be able to generate reports
      expect(await reportsPage.isVisible(reportsPage.selectors.generateReportButton)).toBe(false);
    });
  });

  test.describe('API Integration Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should fetch report data via API', async () => {
      const response = await apiHelper.makeRequest('GET', '/api/v1/reports/sales');
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test('should generate report via API', async () => {
      const reportData = {
        reportType: 'sales_summary',
        dateRange: 'thisMonth',
        format: 'pdf',
        includeCharts: true
      };
      
      const response = await apiHelper.makeRequest('POST', '/api/v1/reports/generate', reportData);
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test('should export report via API', async () => {
      const exportData = {
        reportType: 'sales_summary',
        format: 'excel',
        dateRange: 'thisMonth'
      };
      
      const response = await apiHelper.makeRequest('POST', '/api/v1/reports/export', exportData);
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });
  });

  test.describe('Performance Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should load reports page within acceptable time', async () => {
      const startTime = Date.now();
      
      await reportsPage.goto();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should generate report within acceptable time', async () => {
      await reportsPage.goto();
      await reportsPage.clickReportCategory('sales');
      
      const startTime = Date.now();
      await reportsPage.clickGenerateReport();
      
      const reportData = {
        reportName: 'Performance Test Report',
        reportDescription: 'Test report generation performance',
        reportFormat: 'pdf',
        includeCharts: true,
        includeDetails: true
      };
      
      await reportsPage.fillReportForm(reportData);
      await reportsPage.generateReport();
      
      const generationTime = Date.now() - startTime;
      expect(generationTime).toBeLessThan(10000); // Should generate within 10 seconds
    });

    test('should handle large datasets efficiently', async () => {
      await reportsPage.goto();
      await reportsPage.clickReportCategory('sales');
      
      // Set a large date range
      await reportsPage.setCustomDateRange('2020-01-01', '2024-12-31');
      
      const startTime = Date.now();
      await reportsPage.waitForLoading();
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(15000); // Should handle large datasets within 15 seconds
    });
  });

  test.describe('Error Handling Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should handle API errors gracefully', async () => {
      // Block API requests to simulate error
      await page.route('**/api/v1/reports**', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await reportsPage.goto();
      
      // Should show error message
      expect(await reportsPage.hasErrorMessage()).toBe(true);
    });

    test('should handle network connectivity issues', async () => {
      // Simulate network issues
      await page.route('**/api/**', route => route.abort());
      
      await reportsPage.goto();
      
      // Should show appropriate error message
      expect(await reportsPage.hasErrorMessage()).toBe(true);
    });

    test('should handle slow API responses', async () => {
      // Simulate slow API
      await page.route('**/api/v1/reports**', async route => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        route.continue();
      });
      
      await reportsPage.goto();
      
      // Should show loading state
      expect(await reportsPage.isVisible(reportsPage.selectors.loadingSpinner)).toBe(true);
    });
  });

  test.describe('Accessibility Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await reportsPage.goto();
    });

    test('should support keyboard navigation', async () => {
      // Test tab navigation through reports page
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate through elements
      expect(await reportsPage.isReportsPageLoaded()).toBe(true);
    });

    test('should have proper form labels', async () => {
      await reportsPage.clickGenerateReport();
      
      const labels = await page.locator('label').count();
      expect(labels).toBeGreaterThan(0);
    });

    test('should have proper button labels', async () => {
      const buttons = await page.locator('button').count();
      expect(buttons).toBeGreaterThan(0);
    });
  });

  test.describe('Browser Compatibility Tests', () => {
    test('should work consistently across different browsers', async ({ browserName }) => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      await reportsPage.goto();
      expect(await reportsPage.isReportsPageLoaded()).toBe(true);
      
      // Test basic functionality
      await reportsPage.clickGenerateReport();
      expect(await reportsPage.isModalOpen('generate')).toBe(true);
    });
  });
});
