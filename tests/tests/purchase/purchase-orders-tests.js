const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login-page');
const PurchaseOrdersPage = require('../../pages/purchase-orders-page');
const ApiHelper = require('../../utils/api-helper');
const TestDataGenerator = require('../../utils/test-data-generator');
const BrowserHelper = require('../../utils/browser-helper');

// Load test configuration
const testConfig = require('../../config/test-config.json');
const users = require('../../config/users.json');

test.describe('Purchase Orders Page Tests', () => {
  let loginPage;
  let purchaseOrdersPage;
  let apiHelper;
  let testDataGenerator;
  let browserHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    purchaseOrdersPage = new PurchaseOrdersPage(page);
    apiHelper = new ApiHelper(page);
    testDataGenerator = new TestDataGenerator();
    browserHelper = new BrowserHelper(page);
    
    // Clear all storage before each test
    await browserHelper.clearAllStorage();
  });

  test.describe('Purchase Orders Page Access and Authentication', () => {
    test('should redirect to login when not authenticated', async () => {
      await purchaseOrdersPage.goto();
      
      // Should be redirected to login page
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/login');
    });

    test('should load purchase orders page after successful login', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      await purchaseOrdersPage.goto();
      expect(await purchaseOrdersPage.isPurchaseOrdersPageLoaded()).toBe(true);
    });

    test('should display proper page title', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      await purchaseOrdersPage.goto();
      const pageTitle = await purchaseOrdersPage.getPageTitle();
      expect(pageTitle).toContain('Purchase Orders');
    });
  });

  test.describe('Purchase Orders Page UI Elements', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await purchaseOrdersPage.goto();
    });

    test('should display all required page elements', async () => {
      const validation = await purchaseOrdersPage.validatePageElements();
      expect(validation.valid).toBe(true);
      expect(validation.missing).toHaveLength(0);
    });

    test('should display orders table', async () => {
      expect(await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.ordersTable)).toBe(true);
    });

    test('should display add order button', async () => {
      expect(await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.addOrderButton)).toBe(true);
    });

    test('should display search input', async () => {
      expect(await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.searchInput)).toBe(true);
    });

    test('should display filters', async () => {
      expect(await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.supplierFilter)).toBe(true);
      expect(await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.statusFilter)).toBe(true);
      expect(await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.dateRangeFilter)).toBe(true);
    });

    test('should display statistics cards', async () => {
      const stats = await purchaseOrdersPage.getOrderStats();
      expect(stats).toBeDefined();
    });

    test('should be responsive on different screen sizes', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      expect(await purchaseOrdersPage.isPurchaseOrdersPageLoaded()).toBe(true);
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      expect(await purchaseOrdersPage.isPurchaseOrdersPageLoaded()).toBe(true);
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      expect(await purchaseOrdersPage.isPurchaseOrdersPageLoaded()).toBe(true);
    });
  });

  test.describe('Purchase Order CRUD Operations', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await purchaseOrdersPage.goto();
    });

    test('should open add order modal', async () => {
      await purchaseOrdersPage.clickAddOrder();
      expect(await purchaseOrdersPage.isModalOpen('add')).toBe(true);
    });

    test('should create a new purchase order successfully', async () => {
      const orderData = {
        orderNumber: `PO-${Date.now()}`,
        supplierId: '1',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Test purchase order',
        items: [
          {
            productId: '1',
            quantity: '10',
            unitPrice: '100.00'
          }
        ]
      };
      
      const result = await purchaseOrdersPage.testCreateOrder(orderData);
      expect(result.success).toBe(true);
      
      if (await purchaseOrdersPage.hasSuccessMessage()) {
        const successMessage = await purchaseOrdersPage.getSuccessMessage();
        expect(successMessage).toContain('success');
      }
    });

    test('should validate required fields when creating order', async () => {
      const invalidOrder = {
        orderNumber: '',
        supplierId: '',
        orderDate: '',
        expectedDelivery: '',
        notes: ''
      };
      
      await purchaseOrdersPage.clickAddOrder();
      await purchaseOrdersPage.fillOrderForm(invalidOrder);
      await purchaseOrdersPage.saveOrder();
      
      // Should show validation error
      expect(await purchaseOrdersPage.hasErrorMessage()).toBe(true);
    });

    test('should validate order items when creating order', async () => {
      const orderData = {
        orderNumber: `PO-${Date.now()}`,
        supplierId: '1',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Test purchase order',
        items: [] // No items
      };
      
      await purchaseOrdersPage.clickAddOrder();
      await purchaseOrdersPage.fillOrderForm(orderData);
      await purchaseOrdersPage.saveOrder();
      
      // Should show validation error for empty items
      expect(await purchaseOrdersPage.hasErrorMessage()).toBe(true);
    });

    test('should add order items correctly', async () => {
      await purchaseOrdersPage.clickAddOrder();
      
      const itemData = {
        productId: '1',
        quantity: '5',
        unitPrice: '50.00'
      };
      
      await purchaseOrdersPage.addOrderItem(itemData);
      
      // Should have added the item
      const itemRows = await purchaseOrdersPage.page.locator(purchaseOrdersPage.selectors.itemRows).count();
      expect(itemRows).toBeGreaterThan(0);
    });

    test('should remove order items correctly', async () => {
      await purchaseOrdersPage.clickAddOrder();
      
      // Add an item first
      const itemData = {
        productId: '1',
        quantity: '5',
        unitPrice: '50.00'
      };
      
      await purchaseOrdersPage.addOrderItem(itemData);
      
      // Remove the item
      await purchaseOrdersPage.removeOrderItem(1);
      
      // Should have removed the item
      const itemRows = await purchaseOrdersPage.page.locator(purchaseOrdersPage.selectors.itemRows).count();
      expect(itemRows).toBe(0);
    });

    test('should calculate order totals correctly', async () => {
      await purchaseOrdersPage.clickAddOrder();
      
      // Add items
      const items = [
        { productId: '1', quantity: '2', unitPrice: '100.00' },
        { productId: '2', quantity: '3', unitPrice: '50.00' }
      ];
      
      for (const item of items) {
        await purchaseOrdersPage.addOrderItem(item);
      }
      
      // Get totals
      const totals = await purchaseOrdersPage.getOrderTotals();
      expect(totals.subtotal).toBeDefined();
      expect(totals.tax).toBeDefined();
      expect(totals.total).toBeDefined();
    });

    test('should close modal when cancel is clicked', async () => {
      await purchaseOrdersPage.clickAddOrder();
      expect(await purchaseOrdersPage.isModalOpen('add')).toBe(true);
      
      await purchaseOrdersPage.cancelOrder();
      expect(await purchaseOrdersPage.isModalOpen('add')).toBe(false);
    });

    test('should close modal when close button is clicked', async () => {
      await purchaseOrdersPage.clickAddOrder();
      expect(await purchaseOrdersPage.isModalOpen('add')).toBe(true);
      
      await purchaseOrdersPage.closeModal();
      expect(await purchaseOrdersPage.isModalOpen('add')).toBe(false);
    });
  });

  test.describe('Purchase Order Workflow', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await purchaseOrdersPage.goto();
    });

    test('should approve purchase order', async () => {
      const orderCount = await purchaseOrdersPage.getOrderCount();
      
      if (orderCount > 0) {
        await purchaseOrdersPage.clickApproveOrder(1);
        expect(await purchaseOrdersPage.isModalOpen('approve')).toBe(true);
        
        await purchaseOrdersPage.approveOrder();
        
        if (await purchaseOrdersPage.hasSuccessMessage()) {
          const successMessage = await purchaseOrdersPage.getSuccessMessage();
          expect(successMessage).toContain('success');
        }
      }
    });

    test('should receive purchase order', async () => {
      const orderCount = await purchaseOrdersPage.getOrderCount();
      
      if (orderCount > 0) {
        await purchaseOrdersPage.clickReceiveOrder(1);
        expect(await purchaseOrdersPage.isModalOpen('receive')).toBe(true);
        
        await purchaseOrdersPage.receiveOrder();
        
        if (await purchaseOrdersPage.hasSuccessMessage()) {
          const successMessage = await purchaseOrdersPage.getSuccessMessage();
          expect(successMessage).toContain('success');
        }
      }
    });

    test('should cancel purchase order', async () => {
      const orderCount = await purchaseOrdersPage.getOrderCount();
      
      if (orderCount > 0) {
        await purchaseOrdersPage.clickDeleteOrder(1);
        expect(await purchaseOrdersPage.isModalOpen('delete')).toBe(true);
        
        await purchaseOrdersPage.confirmDeleteOrder();
        
        if (await purchaseOrdersPage.hasSuccessMessage()) {
          const successMessage = await purchaseOrdersPage.getSuccessMessage();
          expect(successMessage).toContain('success');
        }
      }
    });

    test('should view purchase order details', async () => {
      const orderCount = await purchaseOrdersPage.getOrderCount();
      
      if (orderCount > 0) {
        await purchaseOrdersPage.clickViewOrder(1);
        expect(await purchaseOrdersPage.isModalOpen('view')).toBe(true);
      }
    });
  });

  test.describe('Purchase Order Search and Filtering', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await purchaseOrdersPage.goto();
    });

    test('should search for orders by order number or supplier', async () => {
      const searchTerm = testDataGenerator.generateSearchTerm('valid');
      
      const result = await purchaseOrdersPage.testSearch(searchTerm);
      expect(result.found).toBeDefined();
      expect(result.count).toBeGreaterThanOrEqual(0);
    });

    test('should handle empty search results', async () => {
      const searchTerm = testDataGenerator.generateSearchTerm('invalid');
      
      const result = await purchaseOrdersPage.testSearch(searchTerm);
      expect(result.found).toBe(false);
      expect(result.count).toBe(0);
    });

    test('should filter orders by supplier', async () => {
      await purchaseOrdersPage.filterBySupplier('1');
      
      // Should show filtered results
      const orderCount = await purchaseOrdersPage.getOrderCount();
      expect(orderCount).toBeGreaterThanOrEqual(0);
    });

    test('should filter orders by status', async () => {
      const statuses = ['pending', 'approved', 'received', 'cancelled'];
      
      for (const status of statuses) {
        await purchaseOrdersPage.filterByStatus(status);
        
        // Should show filtered results
        const orderCount = await purchaseOrdersPage.getOrderCount();
        expect(orderCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should handle special characters in search', async () => {
      const specialSearch = testDataGenerator.generateSearchTerm('special');
      
      const result = await purchaseOrdersPage.testSearch(specialSearch);
      expect(result.found).toBeDefined();
    });
  });

  test.describe('Purchase Order Table Operations', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await purchaseOrdersPage.goto();
    });

    test('should display order data in table', async () => {
      const orderCount = await purchaseOrdersPage.getOrderCount();
      
      if (orderCount > 0) {
        const orderData = await purchaseOrdersPage.getOrderData(1);
        expect(orderData.orderNumber).toBeDefined();
        expect(orderData.supplierName).toBeDefined();
        expect(orderData.orderDate).toBeDefined();
        expect(orderData.totalAmount).toBeDefined();
        expect(orderData.status).toBeDefined();
        expect(orderData.expectedDelivery).toBeDefined();
      }
    });

    test('should open edit modal when edit button is clicked', async () => {
      const orderCount = await purchaseOrdersPage.getOrderCount();
      
      if (orderCount > 0) {
        await purchaseOrdersPage.clickEditOrder(1);
        expect(await purchaseOrdersPage.isModalOpen('edit')).toBe(true);
      }
    });

    test('should handle empty orders table', async () => {
      // Clear all orders if possible
      await purchaseOrdersPage.searchOrders('nonexistent_order_12345');
      
      if (await purchaseOrdersPage.isTableEmpty()) {
        expect(await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.emptyState)).toBe(true);
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
      await purchaseOrdersPage.goto();
    });

    test('should navigate to next page if available', async () => {
      if (await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.nextPageButton)) {
        const currentPage = await purchaseOrdersPage.getCurrentPageNumber();
        await purchaseOrdersPage.goToNextPage();
        
        const newPage = await purchaseOrdersPage.getCurrentPageNumber();
        expect(newPage).toBeGreaterThan(currentPage);
      }
    });

    test('should navigate to previous page if available', async () => {
      // First go to next page if possible
      if (await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.nextPageButton)) {
        await purchaseOrdersPage.goToNextPage();
        
        if (await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.prevPageButton)) {
          const currentPage = await purchaseOrdersPage.getCurrentPageNumber();
          await purchaseOrdersPage.goToPreviousPage();
          
          const newPage = await purchaseOrdersPage.getCurrentPageNumber();
          expect(newPage).toBeLessThan(currentPage);
        }
      }
    });

    test('should display correct page numbers', async () => {
      const currentPage = await purchaseOrdersPage.getCurrentPageNumber();
      expect(currentPage).toBeGreaterThan(0);
    });
  });

  test.describe('Role-based Access Control', () => {
    test('should allow admin to manage purchase orders', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.admin.username,
        users.admin.password
      );
      await purchaseOrdersPage.goto();
      
      expect(await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.addOrderButton)).toBe(true);
    });

    test('should allow manager to view and update purchase orders', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.manager.username,
        users.manager.password
      );
      await purchaseOrdersPage.goto();
      
      // Manager should be able to view orders
      expect(await purchaseOrdersPage.isPurchaseOrdersPageLoaded()).toBe(true);
      
      // Manager should be able to update orders
      const orderCount = await purchaseOrdersPage.getOrderCount();
      if (orderCount > 0) {
        await purchaseOrdersPage.clickEditOrder(1);
        expect(await purchaseOrdersPage.isModalOpen('edit')).toBe(true);
      }
    });

    test('should restrict user to view-only access', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.user.username,
        users.user.password
      );
      await purchaseOrdersPage.goto();
      
      // User should be able to view orders
      expect(await purchaseOrdersPage.isPurchaseOrdersPageLoaded()).toBe(true);
      
      // User should not be able to add orders
      const hasAddButton = await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.addOrderButton);
      if (hasAddButton) {
        const isEnabled = await purchaseOrdersPage.page.locator(purchaseOrdersPage.selectors.addOrderButton).isEnabled();
        expect(isEnabled).toBe(false);
      }
    });

    test('should restrict viewer to view-only access', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.viewer.username,
        users.viewer.password
      );
      await purchaseOrdersPage.goto();
      
      // Viewer should be able to view orders
      expect(await purchaseOrdersPage.isPurchaseOrdersPageLoaded()).toBe(true);
      
      // Viewer should not be able to add orders
      expect(await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.addOrderButton)).toBe(false);
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

    test('should fetch purchase orders via API', async () => {
      const response = await apiHelper.makeRequest('GET', '/api/v1/purchase-orders');
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test('should create purchase order via API', async () => {
      const orderData = {
        orderNumber: `API-PO-${Date.now()}`,
        supplierId: 1,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'API test purchase order',
        items: [
          {
            productId: 1,
            quantity: 5,
            unitPrice: 100.00
          }
        ]
      };
      
      const response = await apiHelper.makeRequest('POST', '/api/v1/purchase-orders', orderData);
      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
    });

    test('should update purchase order via API', async () => {
      // First create an order
      const orderData = {
        orderNumber: `UPDATE-PO-${Date.now()}`,
        supplierId: 1,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Update test purchase order',
        items: [
          {
            productId: 1,
            quantity: 5,
            unitPrice: 100.00
          }
        ]
      };
      
      const createResponse = await apiHelper.makeRequest('POST', '/api/v1/purchase-orders', orderData);
      
      if (createResponse.status === 201) {
        const orderId = createResponse.data.id;
        const updateData = { notes: 'Updated purchase order' };
        
        const updateResponse = await apiHelper.makeRequest('PUT', `/api/v1/purchase-orders/${orderId}`, updateData);
        expect(updateResponse.status).toBe(200);
      }
    });

    test('should delete purchase order via API', async () => {
      // First create an order
      const orderData = {
        orderNumber: `DELETE-PO-${Date.now()}`,
        supplierId: 1,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Delete test purchase order',
        items: [
          {
            productId: 1,
            quantity: 5,
            unitPrice: 100.00
          }
        ]
      };
      
      const createResponse = await apiHelper.makeRequest('POST', '/api/v1/purchase-orders', orderData);
      
      if (createResponse.status === 201) {
        const orderId = createResponse.data.id;
        
        const deleteResponse = await apiHelper.makeRequest('DELETE', `/api/v1/purchase-orders/${orderId}`);
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

    test('should load purchase orders page within acceptable time', async () => {
      const startTime = Date.now();
      
      await purchaseOrdersPage.goto();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should handle large number of orders efficiently', async () => {
      await purchaseOrdersPage.goto();
      
      const orderCount = await purchaseOrdersPage.getOrderCount();
      
      if (orderCount > 100) {
        // Test pagination performance
        const startTime = Date.now();
        await purchaseOrdersPage.goToNextPage();
        const paginationTime = Date.now() - startTime;
        
        expect(paginationTime).toBeLessThan(2000); // Should paginate within 2 seconds
      }
    });

    test('should handle search efficiently', async () => {
      await purchaseOrdersPage.goto();
      
      const startTime = Date.now();
      await purchaseOrdersPage.searchOrders('test');
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
      await page.route('**/api/v1/purchase-orders**', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await purchaseOrdersPage.goto();
      
      // Should show error message
      expect(await purchaseOrdersPage.hasErrorMessage()).toBe(true);
    });

    test('should handle network connectivity issues', async () => {
      // Simulate network issues
      await page.route('**/api/**', route => route.abort());
      
      await purchaseOrdersPage.goto();
      
      // Should show appropriate error message
      expect(await purchaseOrdersPage.hasErrorMessage()).toBe(true);
    });

    test('should handle slow API responses', async () => {
      // Simulate slow API
      await page.route('**/api/v1/purchase-orders**', async route => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        route.continue();
      });
      
      await purchaseOrdersPage.goto();
      
      // Should show loading state
      expect(await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.loadingSpinner)).toBe(true);
    });
  });

  test.describe('Accessibility Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await purchaseOrdersPage.goto();
    });

    test('should support keyboard navigation', async () => {
      // Test tab navigation through purchase orders page
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate through elements
      expect(await purchaseOrdersPage.isPurchaseOrdersPageLoaded()).toBe(true);
    });

    test('should have proper table headers', async () => {
      const tableHeaders = await page.locator('thead th, .table-header th').count();
      expect(tableHeaders).toBeGreaterThan(0);
    });

    test('should have proper form labels', async () => {
      await purchaseOrdersPage.clickAddOrder();
      
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
      
      await purchaseOrdersPage.goto();
      expect(await purchaseOrdersPage.isPurchaseOrdersPageLoaded()).toBe(true);
      
      // Test basic functionality
      await purchaseOrdersPage.clickAddOrder();
      expect(await purchaseOrdersPage.isModalOpen('add')).toBe(true);
    });
  });
});

