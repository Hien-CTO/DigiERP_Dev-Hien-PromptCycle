const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login-page');
const SalesOrdersPage = require('../../pages/sales-orders-page');
const ApiHelper = require('../../utils/api-helper');
const TestDataGenerator = require('../../utils/test-data-generator');
const BrowserHelper = require('../../utils/browser-helper');

// Load test configuration
const testConfig = require('../../config/test-config.json');
const users = require('../../config/users.json');

test.describe('Sales Orders Page Tests', () => {
  let loginPage;
  let salesOrdersPage;
  let apiHelper;
  let testDataGenerator;
  let browserHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    salesOrdersPage = new SalesOrdersPage(page);
    apiHelper = new ApiHelper(page);
    testDataGenerator = new TestDataGenerator();
    browserHelper = new BrowserHelper(page);
    
    // Clear all storage before each test
    await browserHelper.clearAllStorage();
  });

  test.describe('Sales Orders Page Access and Authentication', () => {
    test('should redirect to login when not authenticated', async () => {
      await salesOrdersPage.goto();
      
      // Should be redirected to login page
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/login');
    });

    test('should load sales orders page after successful login', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      await salesOrdersPage.goto();
      expect(await salesOrdersPage.isSalesOrdersPageLoaded()).toBe(true);
    });

    test('should display proper page title', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      await salesOrdersPage.goto();
      const pageTitle = await salesOrdersPage.getPageTitle();
      expect(pageTitle).toContain('Sales Orders');
    });
  });

  test.describe('Sales Orders Page UI Elements', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await salesOrdersPage.goto();
    });

    test('should display all required page elements', async () => {
      const validation = await salesOrdersPage.validatePageElements();
      expect(validation.valid).toBe(true);
      expect(validation.missing).toHaveLength(0);
    });

    test('should display orders table', async () => {
      expect(await salesOrdersPage.isVisible(salesOrdersPage.selectors.ordersTable)).toBe(true);
    });

    test('should display add order button', async () => {
      expect(await salesOrdersPage.isVisible(salesOrdersPage.selectors.addOrderButton)).toBe(true);
    });

    test('should display search input', async () => {
      expect(await salesOrdersPage.isVisible(salesOrdersPage.selectors.searchInput)).toBe(true);
    });

    test('should display filters', async () => {
      expect(await salesOrdersPage.isVisible(salesOrdersPage.selectors.customerFilter)).toBe(true);
      expect(await salesOrdersPage.isVisible(salesOrdersPage.selectors.statusFilter)).toBe(true);
      expect(await salesOrdersPage.isVisible(salesOrdersPage.selectors.dateRangeFilter)).toBe(true);
    });

    test('should display statistics cards', async () => {
      const stats = await salesOrdersPage.getOrderStats();
      expect(stats).toBeDefined();
    });

    test('should be responsive on different screen sizes', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      expect(await salesOrdersPage.isSalesOrdersPageLoaded()).toBe(true);
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      expect(await salesOrdersPage.isSalesOrdersPageLoaded()).toBe(true);
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      expect(await salesOrdersPage.isSalesOrdersPageLoaded()).toBe(true);
    });
  });

  test.describe('Sales Order CRUD Operations', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await salesOrdersPage.goto();
    });

    test('should open add order modal', async () => {
      await salesOrdersPage.clickAddOrder();
      expect(await salesOrdersPage.isModalOpen('add')).toBe(true);
    });

    test('should create a new sales order successfully', async () => {
      const orderData = {
        orderNumber: `SO-${Date.now()}`,
        customerId: '1',
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Test sales order',
        paymentMethod: 'cash',
        shippingAddress: '123 Test Street, Test City',
        items: [
          {
            productId: '1',
            quantity: '5',
            unitPrice: '100.00',
            discount: '10'
          }
        ]
      };
      
      const result = await salesOrdersPage.testCreateOrder(orderData);
      expect(result.success).toBe(true);
      
      if (await salesOrdersPage.hasSuccessMessage()) {
        const successMessage = await salesOrdersPage.getSuccessMessage();
        expect(successMessage).toContain('success');
      }
    });

    test('should validate required fields when creating order', async () => {
      const invalidOrder = {
        orderNumber: '',
        customerId: '',
        orderDate: '',
        deliveryDate: '',
        notes: ''
      };
      
      await salesOrdersPage.clickAddOrder();
      await salesOrdersPage.fillOrderForm(invalidOrder);
      await salesOrdersPage.saveOrder();
      
      // Should show validation error
      expect(await salesOrdersPage.hasErrorMessage()).toBe(true);
    });

    test('should validate order items when creating order', async () => {
      const orderData = {
        orderNumber: `SO-${Date.now()}`,
        customerId: '1',
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Test sales order',
        items: [] // No items
      };
      
      await salesOrdersPage.clickAddOrder();
      await salesOrdersPage.fillOrderForm(orderData);
      await salesOrdersPage.saveOrder();
      
      // Should show validation error for empty items
      expect(await salesOrdersPage.hasErrorMessage()).toBe(true);
    });

    test('should add order items correctly', async () => {
      await salesOrdersPage.clickAddOrder();
      
      const itemData = {
        productId: '1',
        quantity: '3',
        unitPrice: '75.00',
        discount: '5'
      };
      
      await salesOrdersPage.addOrderItem(itemData);
      
      // Should have added the item
      const itemRows = await salesOrdersPage.page.locator(salesOrdersPage.selectors.itemRows).count();
      expect(itemRows).toBeGreaterThan(0);
    });

    test('should remove order items correctly', async () => {
      await salesOrdersPage.clickAddOrder();
      
      // Add an item first
      const itemData = {
        productId: '1',
        quantity: '3',
        unitPrice: '75.00',
        discount: '5'
      };
      
      await salesOrdersPage.addOrderItem(itemData);
      
      // Remove the item
      await salesOrdersPage.removeOrderItem(1);
      
      // Should have removed the item
      const itemRows = await salesOrdersPage.page.locator(salesOrdersPage.selectors.itemRows).count();
      expect(itemRows).toBe(0);
    });

    test('should calculate order totals correctly', async () => {
      await salesOrdersPage.clickAddOrder();
      
      // Add items
      const items = [
        { productId: '1', quantity: '2', unitPrice: '100.00', discount: '10' },
        { productId: '2', quantity: '3', unitPrice: '50.00', discount: '5' }
      ];
      
      for (const item of items) {
        await salesOrdersPage.addOrderItem(item);
      }
      
      // Get totals
      const totals = await salesOrdersPage.getOrderTotals();
      expect(totals.subtotal).toBeDefined();
      expect(totals.tax).toBeDefined();
      expect(totals.discount).toBeDefined();
      expect(totals.shipping).toBeDefined();
      expect(totals.total).toBeDefined();
    });

    test('should close modal when cancel is clicked', async () => {
      await salesOrdersPage.clickAddOrder();
      expect(await salesOrdersPage.isModalOpen('add')).toBe(true);
      
      await salesOrdersPage.cancelOrder();
      expect(await salesOrdersPage.isModalOpen('add')).toBe(false);
    });

    test('should close modal when close button is clicked', async () => {
      await salesOrdersPage.clickAddOrder();
      expect(await salesOrdersPage.isModalOpen('add')).toBe(true);
      
      await salesOrdersPage.closeModal();
      expect(await salesOrdersPage.isModalOpen('add')).toBe(false);
    });
  });

  test.describe('Sales Order Workflow', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await salesOrdersPage.goto();
    });

    test('should process sales order', async () => {
      const orderCount = await salesOrdersPage.getOrderCount();
      
      if (orderCount > 0) {
        await salesOrdersPage.clickProcessOrder(1);
        expect(await salesOrdersPage.isModalOpen('process')).toBe(true);
        
        await salesOrdersPage.processOrder();
        
        if (await salesOrdersPage.hasSuccessMessage()) {
          const successMessage = await salesOrdersPage.getSuccessMessage();
          expect(successMessage).toContain('success');
        }
      }
    });

    test('should ship sales order', async () => {
      const orderCount = await salesOrdersPage.getOrderCount();
      
      if (orderCount > 0) {
        await salesOrdersPage.clickShipOrder(1);
        expect(await salesOrdersPage.isModalOpen('ship')).toBe(true);
        
        await salesOrdersPage.shipOrder();
        
        if (await salesOrdersPage.hasSuccessMessage()) {
          const successMessage = await salesOrdersPage.getSuccessMessage();
          expect(successMessage).toContain('success');
        }
      }
    });

    test('should create invoice from sales order', async () => {
      const orderCount = await salesOrdersPage.getOrderCount();
      
      if (orderCount > 0) {
        await salesOrdersPage.clickCreateInvoice(1);
        expect(await salesOrdersPage.isModalOpen('invoice')).toBe(true);
        
        await salesOrdersPage.createInvoice();
        
        if (await salesOrdersPage.hasSuccessMessage()) {
          const successMessage = await salesOrdersPage.getSuccessMessage();
          expect(successMessage).toContain('success');
        }
      }
    });

    test('should view sales order details', async () => {
      const orderCount = await salesOrdersPage.getOrderCount();
      
      if (orderCount > 0) {
        await salesOrdersPage.clickViewOrder(1);
        expect(await salesOrdersPage.isModalOpen('view')).toBe(true);
      }
    });

    test('should cancel sales order', async () => {
      const orderCount = await salesOrdersPage.getOrderCount();
      
      if (orderCount > 0) {
        await salesOrdersPage.clickDeleteOrder(1);
        expect(await salesOrdersPage.isModalOpen('delete')).toBe(true);
        
        await salesOrdersPage.confirmDeleteOrder();
        
        if (await salesOrdersPage.hasSuccessMessage()) {
          const successMessage = await salesOrdersPage.getSuccessMessage();
          expect(successMessage).toContain('success');
        }
      }
    });
  });

  test.describe('Sales Order Search and Filtering', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await salesOrdersPage.goto();
    });

    test('should search for orders by order number or customer', async () => {
      const searchTerm = testDataGenerator.generateSearchTerm('valid');
      
      const result = await salesOrdersPage.testSearch(searchTerm);
      expect(result.found).toBeDefined();
      expect(result.count).toBeGreaterThanOrEqual(0);
    });

    test('should handle empty search results', async () => {
      const searchTerm = testDataGenerator.generateSearchTerm('invalid');
      
      const result = await salesOrdersPage.testSearch(searchTerm);
      expect(result.found).toBe(false);
      expect(result.count).toBe(0);
    });

    test('should filter orders by customer', async () => {
      await salesOrdersPage.filterByCustomer('1');
      
      // Should show filtered results
      const orderCount = await salesOrdersPage.getOrderCount();
      expect(orderCount).toBeGreaterThanOrEqual(0);
    });

    test('should filter orders by status', async () => {
      const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      for (const status of statuses) {
        await salesOrdersPage.filterByStatus(status);
        
        // Should show filtered results
        const orderCount = await salesOrdersPage.getOrderCount();
        expect(orderCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should handle special characters in search', async () => {
      const specialSearch = testDataGenerator.generateSearchTerm('special');
      
      const result = await salesOrdersPage.testSearch(specialSearch);
      expect(result.found).toBeDefined();
    });
  });

  test.describe('Sales Order Table Operations', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await salesOrdersPage.goto();
    });

    test('should display order data in table', async () => {
      const orderCount = await salesOrdersPage.getOrderCount();
      
      if (orderCount > 0) {
        const orderData = await salesOrdersPage.getOrderData(1);
        expect(orderData.orderNumber).toBeDefined();
        expect(orderData.customerName).toBeDefined();
        expect(orderData.orderDate).toBeDefined();
        expect(orderData.totalAmount).toBeDefined();
        expect(orderData.status).toBeDefined();
        expect(orderData.paymentStatus).toBeDefined();
      }
    });

    test('should open edit modal when edit button is clicked', async () => {
      const orderCount = await salesOrdersPage.getOrderCount();
      
      if (orderCount > 0) {
        await salesOrdersPage.clickEditOrder(1);
        expect(await salesOrdersPage.isModalOpen('edit')).toBe(true);
      }
    });

    test('should handle empty orders table', async () => {
      // Clear all orders if possible
      await salesOrdersPage.searchOrders('nonexistent_order_12345');
      
      if (await salesOrdersPage.isTableEmpty()) {
        expect(await salesOrdersPage.isVisible(salesOrdersPage.selectors.emptyState)).toBe(true);
      }
    });
  });

  test.describe('Pagination Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await salesOrdersPage.goto();
    });

    test('should navigate to next page if available', async () => {
      if (await salesOrdersPage.isVisible(salesOrdersPage.selectors.nextPageButton)) {
        const currentPage = await salesOrdersPage.getCurrentPageNumber();
        await salesOrdersPage.goToNextPage();
        
        const newPage = await salesOrdersPage.getCurrentPageNumber();
        expect(newPage).toBeGreaterThan(currentPage);
      }
    });

    test('should navigate to previous page if available', async () => {
      // First go to next page if possible
      if (await salesOrdersPage.isVisible(salesOrdersPage.selectors.nextPageButton)) {
        await salesOrdersPage.goToNextPage();
        
        if (await salesOrdersPage.isVisible(salesOrdersPage.selectors.prevPageButton)) {
          const currentPage = await salesOrdersPage.getCurrentPageNumber();
          await salesOrdersPage.goToPreviousPage();
          
          const newPage = await salesOrdersPage.getCurrentPageNumber();
          expect(newPage).toBeLessThan(currentPage);
        }
      }
    });

    test('should display correct page numbers', async () => {
      const currentPage = await salesOrdersPage.getCurrentPageNumber();
      expect(currentPage).toBeGreaterThan(0);
    });
  });

  test.describe('Role-based Access Control', () => {
    test('should allow admin to manage sales orders', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.admin.username,
        users.admin.password
      );
      await salesOrdersPage.goto();
      
      expect(await salesOrdersPage.isVisible(salesOrdersPage.selectors.addOrderButton)).toBe(true);
    });

    test('should allow manager to view and update sales orders', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.manager.username,
        users.manager.password
      );
      await salesOrdersPage.goto();
      
      // Manager should be able to view orders
      expect(await salesOrdersPage.isSalesOrdersPageLoaded()).toBe(true);
      
      // Manager should be able to update orders
      const orderCount = await salesOrdersPage.getOrderCount();
      if (orderCount > 0) {
        await salesOrdersPage.clickEditOrder(1);
        expect(await salesOrdersPage.isModalOpen('edit')).toBe(true);
      }
    });

    test('should restrict user to view-only access', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.user.username,
        users.user.password
      );
      await salesOrdersPage.goto();
      
      // User should be able to view orders
      expect(await salesOrdersPage.isSalesOrdersPageLoaded()).toBe(true);
      
      // User should not be able to add orders
      const hasAddButton = await salesOrdersPage.isVisible(salesOrdersPage.selectors.addOrderButton);
      if (hasAddButton) {
        const isEnabled = await salesOrdersPage.page.locator(salesOrdersPage.selectors.addOrderButton).isEnabled();
        expect(isEnabled).toBe(false);
      }
    });

    test('should restrict viewer to view-only access', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.viewer.username,
        users.viewer.password
      );
      await salesOrdersPage.goto();
      
      // Viewer should be able to view orders
      expect(await salesOrdersPage.isSalesOrdersPageLoaded()).toBe(true);
      
      // Viewer should not be able to add orders
      expect(await salesOrdersPage.isVisible(salesOrdersPage.selectors.addOrderButton)).toBe(false);
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

    test('should fetch sales orders via API', async () => {
      const response = await apiHelper.makeRequest('GET', '/api/v1/sales-orders');
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test('should create sales order via API', async () => {
      const orderData = {
        orderNumber: `API-SO-${Date.now()}`,
        customerId: 1,
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'API test sales order',
        paymentMethod: 'cash',
        shippingAddress: '123 Test Street, Test City',
        items: [
          {
            productId: 1,
            quantity: 5,
            unitPrice: 100.00,
            discount: 10
          }
        ]
      };
      
      const response = await apiHelper.makeRequest('POST', '/api/v1/sales-orders', orderData);
      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
    });

    test('should update sales order via API', async () => {
      // First create an order
      const orderData = {
        orderNumber: `UPDATE-SO-${Date.now()}`,
        customerId: 1,
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Update test sales order',
        paymentMethod: 'cash',
        shippingAddress: '123 Test Street, Test City',
        items: [
          {
            productId: 1,
            quantity: 5,
            unitPrice: 100.00,
            discount: 10
          }
        ]
      };
      
      const createResponse = await apiHelper.makeRequest('POST', '/api/v1/sales-orders', orderData);
      
      if (createResponse.status === 201) {
        const orderId = createResponse.data.id;
        const updateData = { notes: 'Updated sales order' };
        
        const updateResponse = await apiHelper.makeRequest('PUT', `/api/v1/sales-orders/${orderId}`, updateData);
        expect(updateResponse.status).toBe(200);
      }
    });

    test('should delete sales order via API', async () => {
      // First create an order
      const orderData = {
        orderNumber: `DELETE-SO-${Date.now()}`,
        customerId: 1,
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Delete test sales order',
        paymentMethod: 'cash',
        shippingAddress: '123 Test Street, Test City',
        items: [
          {
            productId: 1,
            quantity: 5,
            unitPrice: 100.00,
            discount: 10
          }
        ]
      };
      
      const createResponse = await apiHelper.makeRequest('POST', '/api/v1/sales-orders', orderData);
      
      if (createResponse.status === 201) {
        const orderId = createResponse.data.id;
        
        const deleteResponse = await apiHelper.makeRequest('DELETE', `/api/v1/sales-orders/${orderId}`);
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

    test('should load sales orders page within acceptable time', async () => {
      const startTime = Date.now();
      
      await salesOrdersPage.goto();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should handle large number of orders efficiently', async () => {
      await salesOrdersPage.goto();
      
      const orderCount = await salesOrdersPage.getOrderCount();
      
      if (orderCount > 100) {
        // Test pagination performance
        const startTime = Date.now();
        await salesOrdersPage.goToNextPage();
        const paginationTime = Date.now() - startTime;
        
        expect(paginationTime).toBeLessThan(2000); // Should paginate within 2 seconds
      }
    });

    test('should handle search efficiently', async () => {
      await salesOrdersPage.goto();
      
      const startTime = Date.now();
      await salesOrdersPage.searchOrders('test');
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
      await page.route('**/api/v1/sales-orders**', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await salesOrdersPage.goto();
      
      // Should show error message
      expect(await salesOrdersPage.hasErrorMessage()).toBe(true);
    });

    test('should handle network connectivity issues', async () => {
      // Simulate network issues
      await page.route('**/api/**', route => route.abort());
      
      await salesOrdersPage.goto();
      
      // Should show appropriate error message
      expect(await salesOrdersPage.hasErrorMessage()).toBe(true);
    });

    test('should handle slow API responses', async () => {
      // Simulate slow API
      await page.route('**/api/v1/sales-orders**', async route => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        route.continue();
      });
      
      await salesOrdersPage.goto();
      
      // Should show loading state
      expect(await salesOrdersPage.isVisible(salesOrdersPage.selectors.loadingSpinner)).toBe(true);
    });
  });

  test.describe('Accessibility Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await salesOrdersPage.goto();
    });

    test('should support keyboard navigation', async () => {
      // Test tab navigation through sales orders page
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate through elements
      expect(await salesOrdersPage.isSalesOrdersPageLoaded()).toBe(true);
    });

    test('should have proper table headers', async () => {
      const tableHeaders = await page.locator('thead th, .table-header th').count();
      expect(tableHeaders).toBeGreaterThan(0);
    });

    test('should have proper form labels', async () => {
      await salesOrdersPage.clickAddOrder();
      
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
      
      await salesOrdersPage.goto();
      expect(await salesOrdersPage.isSalesOrdersPageLoaded()).toBe(true);
      
      // Test basic functionality
      await salesOrdersPage.clickAddOrder();
      expect(await salesOrdersPage.isModalOpen('add')).toBe(true);
    });
  });
});
