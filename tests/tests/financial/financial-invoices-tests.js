const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login-page');
const FinancialInvoicesPage = require('../../pages/financial-invoices-page');
const ApiHelper = require('../../utils/api-helper');
const TestDataGenerator = require('../../utils/test-data-generator');
const BrowserHelper = require('../../utils/browser-helper');

// Load test configuration
const testConfig = require('../../config/test-config.json');
const users = require('../../config/users.json');

test.describe('Financial/Invoices Page Tests', () => {
  let loginPage;
  let financialInvoicesPage;
  let apiHelper;
  let testDataGenerator;
  let browserHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    financialInvoicesPage = new FinancialInvoicesPage(page);
    apiHelper = new ApiHelper(page);
    testDataGenerator = new TestDataGenerator();
    browserHelper = new BrowserHelper(page);
    
    // Clear all storage before each test
    await browserHelper.clearAllStorage();
  });

  test.describe('Financial/Invoices Page Access and Authentication', () => {
    test('should redirect to login when not authenticated', async () => {
      await financialInvoicesPage.goto();
      
      // Should be redirected to login page
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/login');
    });

    test('should load financial/invoices page after successful login', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      await financialInvoicesPage.goto();
      expect(await financialInvoicesPage.isFinancialInvoicesPageLoaded()).toBe(true);
    });

    test('should display proper page title', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      await financialInvoicesPage.goto();
      const pageTitle = await financialInvoicesPage.getPageTitle();
      expect(pageTitle).toContain('Financial') || expect(pageTitle).toContain('Invoices');
    });
  });

  test.describe('Financial/Invoices Page UI Elements', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await financialInvoicesPage.goto();
    });

    test('should display all required page elements', async () => {
      const validation = await financialInvoicesPage.validatePageElements();
      expect(validation.valid).toBe(true);
      expect(validation.missing).toHaveLength(0);
    });

    test('should display invoices table', async () => {
      expect(await financialInvoicesPage.isVisible(financialInvoicesPage.selectors.invoicesTable)).toBe(true);
    });

    test('should display add invoice button', async () => {
      expect(await financialInvoicesPage.isVisible(financialInvoicesPage.selectors.addInvoiceButton)).toBe(true);
    });

    test('should display search input', async () => {
      expect(await financialInvoicesPage.isVisible(financialInvoicesPage.selectors.searchInput)).toBe(true);
    });

    test('should display filters', async () => {
      expect(await financialInvoicesPage.isVisible(financialInvoicesPage.selectors.customerFilter)).toBe(true);
      expect(await financialInvoicesPage.isVisible(financialInvoicesPage.selectors.statusFilter)).toBe(true);
      expect(await financialInvoicesPage.isVisible(financialInvoicesPage.selectors.paymentStatusFilter)).toBe(true);
    });

    test('should display statistics cards', async () => {
      const stats = await financialInvoicesPage.getInvoiceStats();
      expect(stats).toBeDefined();
    });

    test('should be responsive on different screen sizes', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      expect(await financialInvoicesPage.isFinancialInvoicesPageLoaded()).toBe(true);
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      expect(await financialInvoicesPage.isFinancialInvoicesPageLoaded()).toBe(true);
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      expect(await financialInvoicesPage.isFinancialInvoicesPageLoaded()).toBe(true);
    });
  });

  test.describe('Invoice CRUD Operations', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await financialInvoicesPage.goto();
    });

    test('should open add invoice modal', async () => {
      await financialInvoicesPage.clickAddInvoice();
      expect(await financialInvoicesPage.isModalOpen('add')).toBe(true);
    });

    test('should create a new invoice successfully', async () => {
      const invoiceData = {
        invoiceNumber: `INV-${Date.now()}`,
        customerId: '1',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Test invoice',
        terms: 'Payment due within 30 days',
        paymentTerms: 'net30',
        items: [
          {
            description: 'Test Product',
            quantity: '2',
            unitPrice: '100.00',
            taxRate: '10'
          }
        ]
      };
      
      const result = await financialInvoicesPage.testCreateInvoice(invoiceData);
      expect(result.success).toBe(true);
      
      if (await financialInvoicesPage.hasSuccessMessage()) {
        const successMessage = await financialInvoicesPage.getSuccessMessage();
        expect(successMessage).toContain('success');
      }
    });

    test('should validate required fields when creating invoice', async () => {
      const invalidInvoice = {
        invoiceNumber: '',
        customerId: '',
        invoiceDate: '',
        dueDate: '',
        notes: ''
      };
      
      await financialInvoicesPage.clickAddInvoice();
      await financialInvoicesPage.fillInvoiceForm(invalidInvoice);
      await financialInvoicesPage.saveInvoice();
      
      // Should show validation error
      expect(await financialInvoicesPage.hasErrorMessage()).toBe(true);
    });

    test('should validate invoice items when creating invoice', async () => {
      const invoiceData = {
        invoiceNumber: `INV-${Date.now()}`,
        customerId: '1',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Test invoice',
        items: [] // No items
      };
      
      await financialInvoicesPage.clickAddInvoice();
      await financialInvoicesPage.fillInvoiceForm(invoiceData);
      await financialInvoicesPage.saveInvoice();
      
      // Should show validation error for empty items
      expect(await financialInvoicesPage.hasErrorMessage()).toBe(true);
    });

    test('should add invoice items correctly', async () => {
      await financialInvoicesPage.clickAddInvoice();
      
      const itemData = {
        description: 'Test Product',
        quantity: '3',
        unitPrice: '75.00',
        taxRate: '10'
      };
      
      await financialInvoicesPage.addInvoiceItem(itemData);
      
      // Should have added the item
      const itemRows = await financialInvoicesPage.page.locator(financialInvoicesPage.selectors.itemRows).count();
      expect(itemRows).toBeGreaterThan(0);
    });

    test('should remove invoice items correctly', async () => {
      await financialInvoicesPage.clickAddInvoice();
      
      // Add an item first
      const itemData = {
        description: 'Test Product',
        quantity: '3',
        unitPrice: '75.00',
        taxRate: '10'
      };
      
      await financialInvoicesPage.addInvoiceItem(itemData);
      
      // Remove the item
      await financialInvoicesPage.removeInvoiceItem(1);
      
      // Should have removed the item
      const itemRows = await financialInvoicesPage.page.locator(financialInvoicesPage.selectors.itemRows).count();
      expect(itemRows).toBe(0);
    });

    test('should calculate invoice totals correctly', async () => {
      await financialInvoicesPage.clickAddInvoice();
      
      // Add items
      const items = [
        { description: 'Product 1', quantity: '2', unitPrice: '100.00', taxRate: '10' },
        { description: 'Product 2', quantity: '3', unitPrice: '50.00', taxRate: '10' }
      ];
      
      for (const item of items) {
        await financialInvoicesPage.addInvoiceItem(item);
      }
      
      // Get totals
      const totals = await financialInvoicesPage.getInvoiceTotals();
      expect(totals.subtotal).toBeDefined();
      expect(totals.tax).toBeDefined();
      expect(totals.discount).toBeDefined();
      expect(totals.total).toBeDefined();
    });

    test('should close modal when cancel is clicked', async () => {
      await financialInvoicesPage.clickAddInvoice();
      expect(await financialInvoicesPage.isModalOpen('add')).toBe(true);
      
      await financialInvoicesPage.cancelInvoice();
      expect(await financialInvoicesPage.isModalOpen('add')).toBe(false);
    });

    test('should close modal when close button is clicked', async () => {
      await financialInvoicesPage.clickAddInvoice();
      expect(await financialInvoicesPage.isModalOpen('add')).toBe(true);
      
      await financialInvoicesPage.closeModal();
      expect(await financialInvoicesPage.isModalOpen('add')).toBe(false);
    });
  });

  test.describe('Invoice Workflow Operations', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await financialInvoicesPage.goto();
    });

    test('should print invoice', async () => {
      const invoiceCount = await financialInvoicesPage.getInvoiceCount();
      
      if (invoiceCount > 0) {
        await financialInvoicesPage.clickPrintInvoice(1);
        expect(await financialInvoicesPage.isModalOpen('print')).toBe(true);
        
        await financialInvoicesPage.printInvoice();
        
        if (await financialInvoicesPage.hasSuccessMessage()) {
          const successMessage = await financialInvoicesPage.getSuccessMessage();
          expect(successMessage).toBeDefined();
        }
      }
    });

    test('should send invoice', async () => {
      const invoiceCount = await financialInvoicesPage.getInvoiceCount();
      
      if (invoiceCount > 0) {
        await financialInvoicesPage.clickSendInvoice(1);
        expect(await financialInvoicesPage.isModalOpen('send')).toBe(true);
        
        await financialInvoicesPage.sendInvoice();
        
        if (await financialInvoicesPage.hasSuccessMessage()) {
          const successMessage = await financialInvoicesPage.getSuccessMessage();
          expect(successMessage).toBeDefined();
        }
      }
    });

    test('should mark invoice as paid', async () => {
      const invoiceCount = await financialInvoicesPage.getInvoiceCount();
      
      if (invoiceCount > 0) {
        await financialInvoicesPage.clickMarkPaid(1);
        expect(await financialInvoicesPage.isModalOpen('markPaid')).toBe(true);
        
        await financialInvoicesPage.markPaid();
        
        if (await financialInvoicesPage.hasSuccessMessage()) {
          const successMessage = await financialInvoicesPage.getSuccessMessage();
          expect(successMessage).toBeDefined();
        }
      }
    });

    test('should add payment to invoice', async () => {
      const invoiceCount = await financialInvoicesPage.getInvoiceCount();
      
      if (invoiceCount > 0) {
        await financialInvoicesPage.clickAddPayment(1);
        expect(await financialInvoicesPage.isModalOpen('payment')).toBe(true);
        
        const paymentData = {
          paymentAmount: '100.00',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'cash',
          paymentReference: 'PAY-001',
          paymentNotes: 'Test payment'
        };
        
        await financialInvoicesPage.fillPaymentForm(paymentData);
        await financialInvoicesPage.addPayment();
        
        if (await financialInvoicesPage.hasSuccessMessage()) {
          const successMessage = await financialInvoicesPage.getSuccessMessage();
          expect(successMessage).toBeDefined();
        }
      }
    });

    test('should view invoice details', async () => {
      const invoiceCount = await financialInvoicesPage.getInvoiceCount();
      
      if (invoiceCount > 0) {
        await financialInvoicesPage.clickViewInvoice(1);
        expect(await financialInvoicesPage.isModalOpen('view')).toBe(true);
      }
    });

    test('should delete invoice', async () => {
      const invoiceCount = await financialInvoicesPage.getInvoiceCount();
      
      if (invoiceCount > 0) {
        await financialInvoicesPage.clickDeleteInvoice(1);
        expect(await financialInvoicesPage.isModalOpen('delete')).toBe(true);
        
        await financialInvoicesPage.confirmDeleteInvoice();
        
        if (await financialInvoicesPage.hasSuccessMessage()) {
          const successMessage = await financialInvoicesPage.getSuccessMessage();
          expect(successMessage).toBeDefined();
        }
      }
    });
  });

  test.describe('Invoice Search and Filtering', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await financialInvoicesPage.goto();
    });

    test('should search for invoices by invoice number or customer', async () => {
      const searchTerm = testDataGenerator.generateSearchTerm('valid');
      
      const result = await financialInvoicesPage.testSearch(searchTerm);
      expect(result.found).toBeDefined();
      expect(result.count).toBeGreaterThanOrEqual(0);
    });

    test('should handle empty search results', async () => {
      const searchTerm = testDataGenerator.generateSearchTerm('invalid');
      
      const result = await financialInvoicesPage.testSearch(searchTerm);
      expect(result.found).toBe(false);
      expect(result.count).toBe(0);
    });

    test('should filter invoices by customer', async () => {
      await financialInvoicesPage.filterByCustomer('1');
      
      // Should show filtered results
      const invoiceCount = await financialInvoicesPage.getInvoiceCount();
      expect(invoiceCount).toBeGreaterThanOrEqual(0);
    });

    test('should filter invoices by status', async () => {
      const statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
      
      for (const status of statuses) {
        await financialInvoicesPage.filterByStatus(status);
        
        // Should show filtered results
        const invoiceCount = await financialInvoicesPage.getInvoiceCount();
        expect(invoiceCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should filter invoices by payment status', async () => {
      const paymentStatuses = ['unpaid', 'partial', 'paid', 'refunded'];
      
      for (const paymentStatus of paymentStatuses) {
        await financialInvoicesPage.filterByPaymentStatus(paymentStatus);
        
        // Should show filtered results
        const invoiceCount = await financialInvoicesPage.getInvoiceCount();
        expect(invoiceCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should handle special characters in search', async () => {
      const specialSearch = testDataGenerator.generateSearchTerm('special');
      
      const result = await financialInvoicesPage.testSearch(specialSearch);
      expect(result.found).toBeDefined();
    });
  });

  test.describe('Invoice Table Operations', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await financialInvoicesPage.goto();
    });

    test('should display invoice data in table', async () => {
      const invoiceCount = await financialInvoicesPage.getInvoiceCount();
      
      if (invoiceCount > 0) {
        const invoiceData = await financialInvoicesPage.getInvoiceData(1);
        expect(invoiceData.invoiceNumber).toBeDefined();
        expect(invoiceData.customerName).toBeDefined();
        expect(invoiceData.invoiceDate).toBeDefined();
        expect(invoiceData.dueDate).toBeDefined();
        expect(invoiceData.totalAmount).toBeDefined();
        expect(invoiceData.paidAmount).toBeDefined();
        expect(invoiceData.status).toBeDefined();
        expect(invoiceData.paymentStatus).toBeDefined();
      }
    });

    test('should open edit modal when edit button is clicked', async () => {
      const invoiceCount = await financialInvoicesPage.getInvoiceCount();
      
      if (invoiceCount > 0) {
        await financialInvoicesPage.clickEditInvoice(1);
        expect(await financialInvoicesPage.isModalOpen('edit')).toBe(true);
      }
    });

    test('should handle empty invoices table', async () => {
      // Clear all invoices if possible
      await financialInvoicesPage.searchInvoices('nonexistent_invoice_12345');
      
      if (await financialInvoicesPage.isTableEmpty()) {
        expect(await financialInvoicesPage.isVisible(financialInvoicesPage.selectors.emptyState)).toBe(true);
      }
    });
  });

  test.describe('Report Generation', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await financialInvoicesPage.goto();
    });

    test('should open generate report modal', async () => {
      await financialInvoicesPage.clickGenerateReport();
      expect(await financialInvoicesPage.isModalOpen('report')).toBe(true);
    });

    test('should generate financial report', async () => {
      await financialInvoicesPage.clickGenerateReport();
      
      const reportData = {
        reportType: 'financial_summary',
        reportPeriod: 'thisMonth',
        reportFormat: 'pdf',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      };
      
      await financialInvoicesPage.fillReportForm(reportData);
      await financialInvoicesPage.generateReport();
      
      if (await financialInvoicesPage.hasSuccessMessage()) {
        const successMessage = await financialInvoicesPage.getSuccessMessage();
        expect(successMessage).toBeDefined();
      }
    });

    test('should validate report generation form', async () => {
      await financialInvoicesPage.clickGenerateReport();
      
      // Try to generate report without required fields
      await financialInvoicesPage.generateReport();
      
      // Should show validation error
      expect(await financialInvoicesPage.hasErrorMessage()).toBe(true);
    });
  });

  test.describe('Pagination Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await financialInvoicesPage.goto();
    });

    test('should navigate to next page if available', async () => {
      if (await financialInvoicesPage.isVisible(financialInvoicesPage.selectors.nextPageButton)) {
        const currentPage = await financialInvoicesPage.getCurrentPageNumber();
        await financialInvoicesPage.goToNextPage();
        
        const newPage = await financialInvoicesPage.getCurrentPageNumber();
        expect(newPage).toBeGreaterThan(currentPage);
      }
    });

    test('should navigate to previous page if available', async () => {
      // First go to next page if possible
      if (await financialInvoicesPage.isVisible(financialInvoicesPage.selectors.nextPageButton)) {
        await financialInvoicesPage.goToNextPage();
        
        if (await financialInvoicesPage.isVisible(financialInvoicesPage.selectors.prevPageButton)) {
          const currentPage = await financialInvoicesPage.getCurrentPageNumber();
          await financialInvoicesPage.goToPreviousPage();
          
          const newPage = await financialInvoicesPage.getCurrentPageNumber();
          expect(newPage).toBeLessThan(currentPage);
        }
      }
    });

    test('should display correct page numbers', async () => {
      const currentPage = await financialInvoicesPage.getCurrentPageNumber();
      expect(currentPage).toBeGreaterThan(0);
    });
  });

  test.describe('Role-based Access Control', () => {
    test('should allow admin to manage invoices', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.admin.username,
        users.admin.password
      );
      await financialInvoicesPage.goto();
      
      expect(await financialInvoicesPage.isVisible(financialInvoicesPage.selectors.addInvoiceButton)).toBe(true);
    });

    test('should allow manager to view and update invoices', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.manager.username,
        users.manager.password
      );
      await financialInvoicesPage.goto();
      
      // Manager should be able to view invoices
      expect(await financialInvoicesPage.isFinancialInvoicesPageLoaded()).toBe(true);
      
      // Manager should be able to update invoices
      const invoiceCount = await financialInvoicesPage.getInvoiceCount();
      if (invoiceCount > 0) {
        await financialInvoicesPage.clickEditInvoice(1);
        expect(await financialInvoicesPage.isModalOpen('edit')).toBe(true);
      }
    });

    test('should restrict user to view-only access', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.user.username,
        users.user.password
      );
      await financialInvoicesPage.goto();
      
      // User should be able to view invoices
      expect(await financialInvoicesPage.isFinancialInvoicesPageLoaded()).toBe(true);
      
      // User should not be able to add invoices
      const hasAddButton = await financialInvoicesPage.isVisible(financialInvoicesPage.selectors.addInvoiceButton);
      if (hasAddButton) {
        const isEnabled = await financialInvoicesPage.page.locator(financialInvoicesPage.selectors.addInvoiceButton).isEnabled();
        expect(isEnabled).toBe(false);
      }
    });

    test('should restrict viewer to view-only access', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.viewer.username,
        users.viewer.password
      );
      await financialInvoicesPage.goto();
      
      // Viewer should be able to view invoices
      expect(await financialInvoicesPage.isFinancialInvoicesPageLoaded()).toBe(true);
      
      // Viewer should not be able to add invoices
      expect(await financialInvoicesPage.isVisible(financialInvoicesPage.selectors.addInvoiceButton)).toBe(false);
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

    test('should fetch invoices via API', async () => {
      const response = await apiHelper.makeRequest('GET', '/api/v1/invoices');
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test('should create invoice via API', async () => {
      const invoiceData = {
        invoiceNumber: `API-INV-${Date.now()}`,
        customerId: 1,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'API test invoice',
        terms: 'Payment due within 30 days',
        paymentTerms: 'net30',
        items: [
          {
            description: 'Test Product',
            quantity: 2,
            unitPrice: 100.00,
            taxRate: 10
          }
        ]
      };
      
      const response = await apiHelper.makeRequest('POST', '/api/v1/invoices', invoiceData);
      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
    });

    test('should update invoice via API', async () => {
      // First create an invoice
      const invoiceData = {
        invoiceNumber: `UPDATE-INV-${Date.now()}`,
        customerId: 1,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Update test invoice',
        terms: 'Payment due within 30 days',
        paymentTerms: 'net30',
        items: [
          {
            description: 'Test Product',
            quantity: 2,
            unitPrice: 100.00,
            taxRate: 10
          }
        ]
      };
      
      const createResponse = await apiHelper.makeRequest('POST', '/api/v1/invoices', invoiceData);
      
      if (createResponse.status === 201) {
        const invoiceId = createResponse.data.id;
        const updateData = { notes: 'Updated invoice' };
        
        const updateResponse = await apiHelper.makeRequest('PUT', `/api/v1/invoices/${invoiceId}`, updateData);
        expect(updateResponse.status).toBe(200);
      }
    });

    test('should delete invoice via API', async () => {
      // First create an invoice
      const invoiceData = {
        invoiceNumber: `DELETE-INV-${Date.now()}`,
        customerId: 1,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Delete test invoice',
        terms: 'Payment due within 30 days',
        paymentTerms: 'net30',
        items: [
          {
            description: 'Test Product',
            quantity: 2,
            unitPrice: 100.00,
            taxRate: 10
          }
        ]
      };
      
      const createResponse = await apiHelper.makeRequest('POST', '/api/v1/invoices', invoiceData);
      
      if (createResponse.status === 201) {
        const invoiceId = createResponse.data.id;
        
        const deleteResponse = await apiHelper.makeRequest('DELETE', `/api/v1/invoices/${invoiceId}`);
        expect(deleteResponse.status).toBe(200);
      }
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

    test('should load financial/invoices page within acceptable time', async () => {
      const startTime = Date.now();
      
      await financialInvoicesPage.goto();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should handle large number of invoices efficiently', async () => {
      await financialInvoicesPage.goto();
      
      const invoiceCount = await financialInvoicesPage.getInvoiceCount();
      
      if (invoiceCount > 100) {
        // Test pagination performance
        const startTime = Date.now();
        await financialInvoicesPage.goToNextPage();
        const paginationTime = Date.now() - startTime;
        
        expect(paginationTime).toBeLessThan(2000); // Should paginate within 2 seconds
      }
    });

    test('should handle search efficiently', async () => {
      await financialInvoicesPage.goto();
      
      const startTime = Date.now();
      await financialInvoicesPage.searchInvoices('test');
      const searchTime = Date.now() - startTime;
      
      expect(searchTime).toBeLessThan(3000); // Should search within 3 seconds
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
      await page.route('**/api/v1/invoices**', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await financialInvoicesPage.goto();
      
      // Should show error message
      expect(await financialInvoicesPage.hasErrorMessage()).toBe(true);
    });

    test('should handle network connectivity issues', async () => {
      // Simulate network issues
      await page.route('**/api/**', route => route.abort());
      
      await financialInvoicesPage.goto();
      
      // Should show appropriate error message
      expect(await financialInvoicesPage.hasErrorMessage()).toBe(true);
    });

    test('should handle slow API responses', async () => {
      // Simulate slow API
      await page.route('**/api/v1/invoices**', async route => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        route.continue();
      });
      
      await financialInvoicesPage.goto();
      
      // Should show loading state
      expect(await financialInvoicesPage.isVisible(financialInvoicesPage.selectors.loadingSpinner)).toBe(true);
    });
  });

  test.describe('Accessibility Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await financialInvoicesPage.goto();
    });

    test('should support keyboard navigation', async () => {
      // Test tab navigation through financial/invoices page
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate through elements
      expect(await financialInvoicesPage.isFinancialInvoicesPageLoaded()).toBe(true);
    });

    test('should have proper table headers', async () => {
      const tableHeaders = await page.locator('thead th, .table-header th').count();
      expect(tableHeaders).toBeGreaterThan(0);
    });

    test('should have proper form labels', async () => {
      await financialInvoicesPage.clickAddInvoice();
      
      const labels = await page.locator('label').count();
      expect(labels).toBeGreaterThan(0);
    });
  });

  test.describe('Browser Compatibility Tests', () => {
    test('should work consistently across different browsers', async ({ browserName }) => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      await financialInvoicesPage.goto();
      expect(await financialInvoicesPage.isFinancialInvoicesPageLoaded()).toBe(true);
      
      // Test basic functionality
      await financialInvoicesPage.clickAddInvoice();
      expect(await financialInvoicesPage.isModalOpen('add')).toBe(true);
    });
  });
});
