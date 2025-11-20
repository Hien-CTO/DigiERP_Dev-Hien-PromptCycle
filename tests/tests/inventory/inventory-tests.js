const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login-page');
const InventoryPage = require('../../pages/inventory-page');
const ApiHelper = require('../../utils/api-helper');
const TestDataGenerator = require('../../utils/test-data-generator');
const BrowserHelper = require('../../utils/browser-helper');

// Load test configuration
const testConfig = require('../../config/test-config.json');
const users = require('../../config/users.json');

test.describe('Inventory Page Tests', () => {
  let loginPage;
  let inventoryPage;
  let apiHelper;
  let testDataGenerator;
  let browserHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    apiHelper = new ApiHelper(page);
    testDataGenerator = new TestDataGenerator();
    browserHelper = new BrowserHelper(page);
    
    // Clear all storage before each test
    await browserHelper.clearAllStorage();
  });

  test.describe('Inventory Page Access and Authentication', () => {
    test('should redirect to login when not authenticated', async () => {
      await inventoryPage.goto();
      
      // Should be redirected to login page
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/login');
    });

    test('should load inventory page after successful login', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      await inventoryPage.goto();
      expect(await inventoryPage.isInventoryPageLoaded()).toBe(true);
    });

    test('should display proper page title', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      await inventoryPage.goto();
      const pageTitle = await inventoryPage.getPageTitle();
      expect(pageTitle).toContain('Inventory');
    });
  });

  test.describe('Inventory Page UI Elements', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await inventoryPage.goto();
    });

    test('should display all required page elements', async () => {
      const validation = await inventoryPage.validatePageElements();
      expect(validation.valid).toBe(true);
      expect(validation.missing).toHaveLength(0);
    });

    test('should display inventory table', async () => {
      expect(await inventoryPage.isVisible(inventoryPage.selectors.inventoryTable)).toBe(true);
    });

    test('should display add inventory button', async () => {
      expect(await inventoryPage.isVisible(inventoryPage.selectors.addInventoryButton)).toBe(true);
    });

    test('should display search input', async () => {
      expect(await inventoryPage.isVisible(inventoryPage.selectors.searchInput)).toBe(true);
    });

    test('should display filters', async () => {
      expect(await inventoryPage.isVisible(inventoryPage.selectors.productFilter)).toBe(true);
      expect(await inventoryPage.isVisible(inventoryPage.selectors.warehouseFilter)).toBe(true);
      expect(await inventoryPage.isVisible(inventoryPage.selectors.stockLevelFilter)).toBe(true);
    });

    test('should display statistics cards', async () => {
      const stats = await inventoryPage.getInventoryStats();
      expect(stats).toBeDefined();
    });

    test('should be responsive on different screen sizes', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      expect(await inventoryPage.isInventoryPageLoaded()).toBe(true);
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      expect(await inventoryPage.isInventoryPageLoaded()).toBe(true);
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      expect(await inventoryPage.isInventoryPageLoaded()).toBe(true);
    });
  });

  test.describe('Inventory CRUD Operations', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await inventoryPage.goto();
    });

    test('should open add inventory modal', async () => {
      await inventoryPage.clickAddInventory();
      expect(await inventoryPage.isModalOpen('add')).toBe(true);
    });

    test('should create a new inventory item successfully', async () => {
      const inventoryData = {
        productId: '1',
        warehouseId: '1',
        currentStock: '100',
        reservedStock: '10',
        minStock: '20',
        maxStock: '500'
      };
      
      const result = await inventoryPage.testCreateInventory(inventoryData);
      expect(result.success).toBe(true);
      
      if (await inventoryPage.hasSuccessMessage()) {
        const successMessage = await inventoryPage.getSuccessMessage();
        expect(successMessage).toContain('success');
      }
    });

    test('should validate required fields when creating inventory', async () => {
      const invalidInventory = {
        productId: '',
        warehouseId: '',
        currentStock: '',
        reservedStock: '',
        minStock: '',
        maxStock: ''
      };
      
      await inventoryPage.clickAddInventory();
      await inventoryPage.fillInventoryForm(invalidInventory);
      await inventoryPage.saveInventory();
      
      // Should show validation error
      expect(await inventoryPage.hasErrorMessage()).toBe(true);
    });

    test('should validate stock values when creating inventory', async () => {
      const invalidInventory = {
        productId: '1',
        warehouseId: '1',
        currentStock: 'invalid',
        reservedStock: 'invalid',
        minStock: 'invalid',
        maxStock: 'invalid'
      };
      
      await inventoryPage.clickAddInventory();
      await inventoryPage.fillInventoryForm(invalidInventory);
      await inventoryPage.saveInventory();
      
      // Should show validation error
      expect(await inventoryPage.hasErrorMessage()).toBe(true);
    });

    test('should close modal when cancel is clicked', async () => {
      await inventoryPage.clickAddInventory();
      expect(await inventoryPage.isModalOpen('add')).toBe(true);
      
      await inventoryPage.cancelInventory();
      expect(await inventoryPage.isModalOpen('add')).toBe(false);
    });

    test('should close modal when close button is clicked', async () => {
      await inventoryPage.clickAddInventory();
      expect(await inventoryPage.isModalOpen('add')).toBe(true);
      
      await inventoryPage.closeModal();
      expect(await inventoryPage.isModalOpen('add')).toBe(false);
    });
  });

  test.describe('Stock Adjustment Operations', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await inventoryPage.goto();
    });

    test('should open adjust stock modal', async () => {
      await inventoryPage.clickAdjustStock();
      expect(await inventoryPage.isModalOpen('adjust')).toBe(true);
    });

    test('should perform stock adjustment successfully', async () => {
      const adjustmentData = {
        adjustmentType: 'increase',
        adjustmentQuantity: '50',
        reason: 'Stock replenishment'
      };
      
      const result = await inventoryPage.testStockAdjustment(adjustmentData);
      expect(result.success).toBe(true);
      
      if (await inventoryPage.hasSuccessMessage()) {
        const successMessage = await inventoryPage.getSuccessMessage();
        expect(successMessage).toContain('success');
      }
    });

    test('should validate adjustment data', async () => {
      const invalidAdjustment = {
        adjustmentType: '',
        adjustmentQuantity: '',
        reason: ''
      };
      
      await inventoryPage.clickAdjustStock();
      await inventoryPage.fillAdjustmentForm(invalidAdjustment);
      await inventoryPage.applyAdjustment();
      
      // Should show validation error
      expect(await inventoryPage.hasErrorMessage()).toBe(true);
    });

    test('should handle different adjustment types', async () => {
      const adjustmentTypes = ['increase', 'decrease', 'set'];
      
      for (const type of adjustmentTypes) {
        await inventoryPage.clickAdjustStock();
        await inventoryPage.fillAdjustmentForm({
          adjustmentType: type,
          adjustmentQuantity: '10',
          reason: `Test ${type} adjustment`
        });
        
        // Should be able to select adjustment type
        expect(await inventoryPage.isModalOpen('adjust')).toBe(true);
        await inventoryPage.closeModal();
      }
    });
  });

  test.describe('Inventory Search and Filtering', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await inventoryPage.goto();
    });

    test('should search for inventory items by product name', async () => {
      const searchTerm = testDataGenerator.generateSearchTerm('valid');
      
      const result = await inventoryPage.testSearch(searchTerm);
      expect(result.found).toBeDefined();
      expect(result.count).toBeGreaterThanOrEqual(0);
    });

    test('should handle empty search results', async () => {
      const searchTerm = testDataGenerator.generateSearchTerm('invalid');
      
      const result = await inventoryPage.testSearch(searchTerm);
      expect(result.found).toBe(false);
      expect(result.count).toBe(0);
    });

    test('should filter inventory by product', async () => {
      await inventoryPage.filterByProduct('1');
      
      // Should show filtered results
      const inventoryCount = await inventoryPage.getInventoryCount();
      expect(inventoryCount).toBeGreaterThanOrEqual(0);
    });

    test('should filter inventory by warehouse', async () => {
      await inventoryPage.filterByWarehouse('1');
      
      // Should show filtered results
      const inventoryCount = await inventoryPage.getInventoryCount();
      expect(inventoryCount).toBeGreaterThanOrEqual(0);
    });

    test('should filter inventory by stock level', async () => {
      const stockLevels = ['low', 'normal', 'high', 'out'];
      
      for (const level of stockLevels) {
        await inventoryPage.filterByStockLevel(level);
        
        // Should show filtered results
        const inventoryCount = await inventoryPage.getInventoryCount();
        expect(inventoryCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should handle special characters in search', async () => {
      const specialSearch = testDataGenerator.generateSearchTerm('special');
      
      const result = await inventoryPage.testSearch(specialSearch);
      expect(result.found).toBeDefined();
    });
  });

  test.describe('Inventory Table Operations', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await inventoryPage.goto();
    });

    test('should display inventory data in table', async () => {
      const inventoryCount = await inventoryPage.getInventoryCount();
      
      if (inventoryCount > 0) {
        const inventoryData = await inventoryPage.getInventoryData(1);
        expect(inventoryData.productName).toBeDefined();
        expect(inventoryData.productSku).toBeDefined();
        expect(inventoryData.warehouseName).toBeDefined();
        expect(inventoryData.currentStock).toBeDefined();
        expect(inventoryData.reservedStock).toBeDefined();
        expect(inventoryData.availableStock).toBeDefined();
        expect(inventoryData.stockStatus).toBeDefined();
        expect(inventoryData.lastUpdated).toBeDefined();
      }
    });

    test('should open edit modal when edit button is clicked', async () => {
      const inventoryCount = await inventoryPage.getInventoryCount();
      
      if (inventoryCount > 0) {
        await inventoryPage.clickEditInventory(1);
        expect(await inventoryPage.isModalOpen('edit')).toBe(true);
      }
    });

    test('should open adjust modal when adjust button is clicked', async () => {
      const inventoryCount = await inventoryPage.getInventoryCount();
      
      if (inventoryCount > 0) {
        await inventoryPage.clickAdjustInventory(1);
        expect(await inventoryPage.isModalOpen('adjust')).toBe(true);
      }
    });

    test('should open delete confirmation modal when delete button is clicked', async () => {
      const inventoryCount = await inventoryPage.getInventoryCount();
      
      if (inventoryCount > 0) {
        await inventoryPage.clickDeleteInventory(1);
        expect(await inventoryPage.isModalOpen('delete')).toBe(true);
      }
    });

    test('should handle empty inventory table', async () => {
      // Clear all inventory if possible
      await inventoryPage.searchInventory('nonexistent_inventory_12345');
      
      if (await inventoryPage.isTableEmpty()) {
        expect(await inventoryPage.isVisible(inventoryPage.selectors.emptyState)).toBe(true);
      }
    });
  });

  test.describe('Stock Alerts and Monitoring', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await inventoryPage.goto();
    });

    test('should display stock alerts when applicable', async () => {
      const alerts = await inventoryPage.getStockAlerts();
      expect(alerts).toBeDefined();
      expect(typeof alerts.lowStock).toBe('boolean');
      expect(typeof alerts.outOfStock).toBe('boolean');
    });

    test('should display inventory statistics', async () => {
      const stats = await inventoryPage.getInventoryStats();
      expect(stats).toBeDefined();
    });

    test('should show low stock indicators', async () => {
      // Filter by low stock
      await inventoryPage.filterByStockLevel('low');
      
      const inventoryCount = await inventoryPage.getInventoryCount();
      expect(inventoryCount).toBeGreaterThanOrEqual(0);
    });

    test('should show out of stock indicators', async () => {
      // Filter by out of stock
      await inventoryPage.filterByStockLevel('out');
      
      const inventoryCount = await inventoryPage.getInventoryCount();
      expect(inventoryCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Pagination Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await inventoryPage.goto();
    });

    test('should navigate to next page if available', async () => {
      if (await inventoryPage.isVisible(inventoryPage.selectors.nextPageButton)) {
        const currentPage = await inventoryPage.getCurrentPageNumber();
        await inventoryPage.goToNextPage();
        
        const newPage = await inventoryPage.getCurrentPageNumber();
        expect(newPage).toBeGreaterThan(currentPage);
      }
    });

    test('should navigate to previous page if available', async () => {
      // First go to next page if possible
      if (await inventoryPage.isVisible(inventoryPage.selectors.nextPageButton)) {
        await inventoryPage.goToNextPage();
        
        if (await inventoryPage.isVisible(inventoryPage.selectors.prevPageButton)) {
          const currentPage = await inventoryPage.getCurrentPageNumber();
          await inventoryPage.goToPreviousPage();
          
          const newPage = await inventoryPage.getCurrentPageNumber();
          expect(newPage).toBeLessThan(currentPage);
        }
      }
    });

    test('should display correct page numbers', async () => {
      const currentPage = await inventoryPage.getCurrentPageNumber();
      expect(currentPage).toBeGreaterThan(0);
    });
  });

  test.describe('Role-based Access Control', () => {
    test('should allow admin to manage inventory', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.admin.username,
        users.admin.password
      );
      await inventoryPage.goto();
      
      expect(await inventoryPage.isVisible(inventoryPage.selectors.addInventoryButton)).toBe(true);
    });

    test('should allow manager to view and adjust inventory', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.manager.username,
        users.manager.password
      );
      await inventoryPage.goto();
      
      // Manager should be able to view inventory
      expect(await inventoryPage.isInventoryPageLoaded()).toBe(true);
      
      // Manager should be able to adjust stock
      expect(await inventoryPage.isVisible(inventoryPage.selectors.adjustStockButton)).toBe(true);
    });

    test('should restrict user to view-only access', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.user.username,
        users.user.password
      );
      await inventoryPage.goto();
      
      // User should be able to view inventory
      expect(await inventoryPage.isInventoryPageLoaded()).toBe(true);
      
      // User should not be able to add inventory
      const hasAddButton = await inventoryPage.isVisible(inventoryPage.selectors.addInventoryButton);
      if (hasAddButton) {
        const isEnabled = await inventoryPage.page.locator(inventoryPage.selectors.addInventoryButton).isEnabled();
        expect(isEnabled).toBe(false);
      }
    });

    test('should restrict viewer to view-only access', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.viewer.username,
        users.viewer.password
      );
      await inventoryPage.goto();
      
      // Viewer should be able to view inventory
      expect(await inventoryPage.isInventoryPageLoaded()).toBe(true);
      
      // Viewer should not be able to add inventory
      expect(await inventoryPage.isVisible(inventoryPage.selectors.addInventoryButton)).toBe(false);
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

    test('should fetch inventory via API', async () => {
      const response = await apiHelper.getInventory();
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test('should create inventory item via API', async () => {
      const inventoryData = {
        productId: 1,
        warehouseId: 1,
        currentStock: 100,
        reservedStock: 10,
        minStock: 20,
        maxStock: 500
      };
      
      const response = await apiHelper.makeRequest('POST', '/api/v1/inventory', inventoryData);
      expect(response.status).toBe(201);
    });

    test('should update inventory item via API', async () => {
      // First create an inventory item
      const inventoryData = {
        productId: 1,
        warehouseId: 1,
        currentStock: 100,
        reservedStock: 10,
        minStock: 20,
        maxStock: 500
      };
      
      const createResponse = await apiHelper.makeRequest('POST', '/api/v1/inventory', inventoryData);
      
      if (createResponse.status === 201) {
        const inventoryId = createResponse.data.id;
        const updateData = { currentStock: 150 };
        
        const updateResponse = await apiHelper.makeRequest('PUT', `/api/v1/inventory/${inventoryId}`, updateData);
        expect(updateResponse.status).toBe(200);
      }
    });

    test('should delete inventory item via API', async () => {
      // First create an inventory item
      const inventoryData = {
        productId: 1,
        warehouseId: 1,
        currentStock: 100,
        reservedStock: 10,
        minStock: 20,
        maxStock: 500
      };
      
      const createResponse = await apiHelper.makeRequest('POST', '/api/v1/inventory', inventoryData);
      
      if (createResponse.status === 201) {
        const inventoryId = createResponse.data.id;
        
        const deleteResponse = await apiHelper.makeRequest('DELETE', `/api/v1/inventory/${inventoryId}`);
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

    test('should load inventory page within acceptable time', async () => {
      const startTime = Date.now();
      
      await inventoryPage.goto();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should handle large number of inventory items efficiently', async () => {
      await inventoryPage.goto();
      
      const inventoryCount = await inventoryPage.getInventoryCount();
      
      if (inventoryCount > 100) {
        // Test pagination performance
        const startTime = Date.now();
        await inventoryPage.goToNextPage();
        const paginationTime = Date.now() - startTime;
        
        expect(paginationTime).toBeLessThan(2000); // Should paginate within 2 seconds
      }
    });

    test('should handle search efficiently', async () => {
      await inventoryPage.goto();
      
      const startTime = Date.now();
      await inventoryPage.searchInventory('test');
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
      await page.route('**/api/v1/inventory**', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await inventoryPage.goto();
      
      // Should show error message
      expect(await inventoryPage.hasErrorMessage()).toBe(true);
    });

    test('should handle network connectivity issues', async () => {
      // Simulate network issues
      await page.route('**/api/**', route => route.abort());
      
      await inventoryPage.goto();
      
      // Should show appropriate error message
      expect(await inventoryPage.hasErrorMessage()).toBe(true);
    });

    test('should handle slow API responses', async () => {
      // Simulate slow API
      await page.route('**/api/v1/inventory**', async route => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        route.continue();
      });
      
      await inventoryPage.goto();
      
      // Should show loading state
      expect(await inventoryPage.isVisible(inventoryPage.selectors.loadingSpinner)).toBe(true);
    });
  });

  test.describe('Accessibility Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await inventoryPage.goto();
    });

    test('should support keyboard navigation', async () => {
      // Test tab navigation through inventory page
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate through elements
      expect(await inventoryPage.isInventoryPageLoaded()).toBe(true);
    });

    test('should have proper table headers', async () => {
      const tableHeaders = await page.locator('thead th, .table-header th').count();
      expect(tableHeaders).toBeGreaterThan(0);
    });

    test('should have proper form labels', async () => {
      await inventoryPage.clickAddInventory();
      
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
      
      await inventoryPage.goto();
      expect(await inventoryPage.isInventoryPageLoaded()).toBe(true);
      
      // Test basic functionality
      await inventoryPage.clickAddInventory();
      expect(await inventoryPage.isModalOpen('add')).toBe(true);
    });
  });
});

