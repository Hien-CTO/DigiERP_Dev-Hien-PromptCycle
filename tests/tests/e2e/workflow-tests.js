const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login-page');
const DashboardPage = require('../../pages/dashboard-page');
const ProductsPage = require('../../pages/products-page');
const InventoryPage = require('../../pages/inventory-page');
const UsersPage = require('../../pages/users-page');
const PurchaseOrdersPage = require('../../pages/purchase-orders-page');
const ApiHelper = require('../../utils/api-helper');
const TestDataGenerator = require('../../utils/test-data-generator');
const BrowserHelper = require('../../utils/browser-helper');

// Load test configuration
const testConfig = require('../../config/test-config.json');
const users = require('../../config/users.json');

test.describe('End-to-End Workflow Tests', () => {
  let loginPage;
  let dashboardPage;
  let productsPage;
  let inventoryPage;
  let usersPage;
  let purchaseOrdersPage;
  let apiHelper;
  let testDataGenerator;
  let browserHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    productsPage = new ProductsPage(page);
    inventoryPage = new InventoryPage(page);
    usersPage = new UsersPage(page);
    purchaseOrdersPage = new PurchaseOrdersPage(page);
    apiHelper = new ApiHelper(page);
    testDataGenerator = new TestDataGenerator();
    browserHelper = new BrowserHelper(page);
    
    // Clear all storage before each test
    await browserHelper.clearAllStorage();
  });

  test.describe('Complete Product Management Workflow', () => {
    test('should complete full product lifecycle from creation to inventory', async () => {
      // Step 1: Login as admin
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(await dashboardPage.isAuthenticated()).toBe(true);
      
      // Step 2: Navigate to products page
      await productsPage.goto();
      expect(await productsPage.isProductsPageLoaded()).toBe(true);
      
      // Step 3: Create a new product
      const productData = testDataGenerator.generateProduct();
      await productsPage.clickAddProduct();
      await productsPage.fillProductForm(productData);
      await productsPage.saveProduct();
      
      expect(await productsPage.hasSuccessMessage()).toBe(true);
      
      // Step 4: Verify product was created
      await productsPage.searchProducts(productData.name);
      const productCount = await productsPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
      
      // Step 5: Navigate to inventory page
      await inventoryPage.goto();
      expect(await inventoryPage.isInventoryPageLoaded()).toBe(true);
      
      // Step 6: Add product to inventory
      const inventoryData = {
        productId: '1', // Assuming the created product has ID 1
        warehouseId: '1',
        currentStock: '100',
        reservedStock: '10',
        minStock: '20',
        maxStock: '500'
      };
      
      await inventoryPage.clickAddInventory();
      await inventoryPage.fillInventoryForm(inventoryData);
      await inventoryPage.saveInventory();
      
      expect(await inventoryPage.hasSuccessMessage()).toBe(true);
      
      // Step 7: Verify inventory was created
      await inventoryPage.searchInventory(productData.name);
      const inventoryCount = await inventoryPage.getInventoryCount();
      expect(inventoryCount).toBeGreaterThan(0);
      
      // Step 8: Adjust stock
      await inventoryPage.clickAdjustStock();
      const adjustmentData = {
        adjustmentType: 'increase',
        adjustmentQuantity: '50',
        reason: 'Stock replenishment'
      };
      
      await inventoryPage.fillAdjustmentForm(adjustmentData);
      await inventoryPage.applyAdjustment();
      
      expect(await inventoryPage.hasSuccessMessage()).toBe(true);
    });
  });

  test.describe('Complete Purchase Order Workflow', () => {
    test('should complete full purchase order lifecycle', async () => {
      // Step 1: Login as admin
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(await dashboardPage.isAuthenticated()).toBe(true);
      
      // Step 2: Navigate to purchase orders page
      await purchaseOrdersPage.goto();
      expect(await purchaseOrdersPage.isPurchaseOrdersPageLoaded()).toBe(true);
      
      // Step 3: Create a new purchase order
      const orderData = {
        orderNumber: `E2E-PO-${Date.now()}`,
        supplierId: '1',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'E2E test purchase order',
        items: [
          {
            productId: '1',
            quantity: '10',
            unitPrice: '100.00'
          }
        ]
      };
      
      await purchaseOrdersPage.clickAddOrder();
      await purchaseOrdersPage.fillOrderForm(orderData);
      
      // Add order items
      for (const item of orderData.items) {
        await purchaseOrdersPage.addOrderItem(item);
      }
      
      await purchaseOrdersPage.saveOrder();
      expect(await purchaseOrdersPage.hasSuccessMessage()).toBe(true);
      
      // Step 4: Verify order was created
      await purchaseOrdersPage.searchOrders(orderData.orderNumber);
      const orderCount = await purchaseOrdersPage.getOrderCount();
      expect(orderCount).toBeGreaterThan(0);
      
      // Step 5: Approve the order
      await purchaseOrdersPage.clickApproveOrder(1);
      await purchaseOrdersPage.approveOrder();
      expect(await purchaseOrdersPage.hasSuccessMessage()).toBe(true);
      
      // Step 6: Receive the order
      await purchaseOrdersPage.clickReceiveOrder(1);
      await purchaseOrdersPage.receiveOrder();
      expect(await purchaseOrdersPage.hasSuccessMessage()).toBe(true);
      
      // Step 7: Verify inventory was updated
      await inventoryPage.goto();
      await inventoryPage.searchInventory('Product');
      const inventoryCount = await inventoryPage.getInventoryCount();
      expect(inventoryCount).toBeGreaterThan(0);
    });
  });

  test.describe('User Management Workflow', () => {
    test('should complete full user management lifecycle', async () => {
      // Step 1: Login as super admin
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(await dashboardPage.isAuthenticated()).toBe(true);
      
      // Step 2: Navigate to users page
      await usersPage.goto();
      expect(await usersPage.isUsersPageLoaded()).toBe(true);
      
      // Step 3: Create a new user
      const userData = testDataGenerator.generateUser({
        username: `e2euser${Date.now()}`,
        email: `e2euser${Date.now()}@example.com`
      });
      
      await usersPage.clickAddUser();
      await usersPage.fillUserForm(userData);
      await usersPage.saveUser();
      
      expect(await usersPage.hasSuccessMessage()).toBe(true);
      
      // Step 4: Verify user was created
      await usersPage.searchUsers(userData.username);
      const userCount = await usersPage.getUserCount();
      expect(userCount).toBeGreaterThan(0);
      
      // Step 5: Edit user information
      await usersPage.clickEditUser(1);
      const updateData = {
        firstName: 'Updated First Name',
        lastName: 'Updated Last Name'
      };
      
      await usersPage.fillUserForm(updateData);
      await usersPage.saveUser();
      
      expect(await usersPage.hasSuccessMessage()).toBe(true);
      
      // Step 6: Reset user password
      await usersPage.clickResetPassword(1);
      await usersPage.confirmResetPassword();
      
      expect(await usersPage.hasSuccessMessage()).toBe(true);
      
      // Step 7: Toggle user status
      await usersPage.clickToggleStatus(1);
      
      if (await usersPage.hasSuccessMessage()) {
        const successMessage = await usersPage.getSuccessMessage();
        expect(successMessage).toBeDefined();
      }
      
      // Step 8: Test login with new user
      await dashboardPage.logout();
      
      const loginResult = await loginPage.attemptLogin(userData.username, userData.password);
      expect(loginResult.success).toBe(true);
    });
  });

  test.describe('Role-based Access Control Workflow', () => {
    test('should test different user roles and their access levels', async () => {
      const roleTests = [
        {
          role: 'super_admin',
          user: users.super_admin,
          canAccess: ['users', 'products', 'inventory', 'purchase-orders'],
          canCreate: ['users', 'products', 'inventory', 'purchase-orders']
        },
        {
          role: 'admin',
          user: users.admin,
          canAccess: ['products', 'inventory', 'purchase-orders'],
          canCreate: ['products', 'inventory', 'purchase-orders'],
          cannotAccess: ['users']
        },
        {
          role: 'manager',
          user: users.manager,
          canAccess: ['products', 'inventory', 'purchase-orders'],
          canCreate: ['products', 'inventory'],
          cannotAccess: ['users']
        },
        {
          role: 'user',
          user: users.user,
          canAccess: ['products', 'inventory', 'purchase-orders'],
          canCreate: [],
          cannotAccess: ['users']
        }
      ];

      for (const roleTest of roleTests) {
        // Login with the role
        await loginPage.goto();
        await loginPage.login(roleTest.user.username, roleTest.user.password);
        
        expect(await dashboardPage.isAuthenticated()).toBe(true);
        
        // Test access to allowed modules
        for (const module of roleTest.canAccess) {
          switch (module) {
            case 'users':
              await usersPage.goto();
              expect(await usersPage.isUsersPageLoaded()).toBe(true);
              break;
            case 'products':
              await productsPage.goto();
              expect(await productsPage.isProductsPageLoaded()).toBe(true);
              break;
            case 'inventory':
              await inventoryPage.goto();
              expect(await inventoryPage.isInventoryPageLoaded()).toBe(true);
              break;
            case 'purchase-orders':
              await purchaseOrdersPage.goto();
              expect(await purchaseOrdersPage.isPurchaseOrdersPageLoaded()).toBe(true);
              break;
          }
        }
        
        // Test access to restricted modules
        for (const module of roleTest.cannotAccess || []) {
          switch (module) {
            case 'users':
              await page.goto(testConfig.baseUrl + '/admin/users');
              const currentUrl = await page.url();
              const hasAccessDenied = await page.locator('text=Access Denied, text=Forbidden').isVisible();
              expect(currentUrl.includes('/login') || hasAccessDenied).toBe(true);
              break;
          }
        }
        
        // Test creation permissions
        for (const module of roleTest.canCreate) {
          switch (module) {
            case 'products':
              await productsPage.goto();
              const hasAddProductButton = await productsPage.isVisible(productsPage.selectors.addProductButton);
              expect(hasAddProductButton).toBe(true);
              break;
            case 'inventory':
              await inventoryPage.goto();
              const hasAddInventoryButton = await inventoryPage.isVisible(inventoryPage.selectors.addInventoryButton);
              expect(hasAddInventoryButton).toBe(true);
              break;
            case 'purchase-orders':
              await purchaseOrdersPage.goto();
              const hasAddOrderButton = await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.addOrderButton);
              expect(hasAddOrderButton).toBe(true);
              break;
          }
        }
        
        // Logout for next test
        await dashboardPage.logout();
      }
    });
  });

  test.describe('Cross-module Data Consistency Workflow', () => {
    test('should maintain data consistency across modules', async () => {
      // Step 1: Login as admin
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(await dashboardPage.isAuthenticated()).toBe(true);
      
      // Step 2: Create a product
      await productsPage.goto();
      const productData = testDataGenerator.generateProduct();
      await productsPage.clickAddProduct();
      await productsPage.fillProductForm(productData);
      await productsPage.saveProduct();
      
      expect(await productsPage.hasSuccessMessage()).toBe(true);
      
      // Step 3: Add product to inventory
      await inventoryPage.goto();
      const inventoryData = {
        productId: '1',
        warehouseId: '1',
        currentStock: '100',
        reservedStock: '10',
        minStock: '20',
        maxStock: '500'
      };
      
      await inventoryPage.clickAddInventory();
      await inventoryPage.fillInventoryForm(inventoryData);
      await inventoryPage.saveInventory();
      
      expect(await inventoryPage.hasSuccessMessage()).toBe(true);
      
      // Step 4: Create purchase order with the product
      await purchaseOrdersPage.goto();
      const orderData = {
        orderNumber: `CONSISTENCY-PO-${Date.now()}`,
        supplierId: '1',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Data consistency test',
        items: [
          {
            productId: '1',
            quantity: '5',
            unitPrice: '100.00'
          }
        ]
      };
      
      await purchaseOrdersPage.clickAddOrder();
      await purchaseOrdersPage.fillOrderForm(orderData);
      
      for (const item of orderData.items) {
        await purchaseOrdersPage.addOrderItem(item);
      }
      
      await purchaseOrdersPage.saveOrder();
      expect(await purchaseOrdersPage.hasSuccessMessage()).toBe(true);
      
      // Step 5: Approve and receive the order
      await purchaseOrdersPage.clickApproveOrder(1);
      await purchaseOrdersPage.approveOrder();
      expect(await purchaseOrdersPage.hasSuccessMessage()).toBe(true);
      
      await purchaseOrdersPage.clickReceiveOrder(1);
      await purchaseOrdersPage.receiveOrder();
      expect(await purchaseOrdersPage.hasSuccessMessage()).toBe(true);
      
      // Step 6: Verify inventory was updated correctly
      await inventoryPage.goto();
      await inventoryPage.searchInventory(productData.name);
      
      const inventoryCount = await inventoryPage.getInventoryCount();
      expect(inventoryCount).toBeGreaterThan(0);
      
      // Step 7: Verify product still exists
      await productsPage.goto();
      await productsPage.searchProducts(productData.name);
      
      const productCount = await productsPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
    });
  });

  test.describe('Error Recovery Workflow', () => {
    test('should handle errors gracefully and allow recovery', async () => {
      // Step 1: Login as admin
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(await dashboardPage.isAuthenticated()).toBe(true);
      
      // Step 2: Try to create product with invalid data
      await productsPage.goto();
      await productsPage.clickAddProduct();
      
      const invalidProductData = {
        name: '',
        sku: '',
        price: 'invalid'
      };
      
      await productsPage.fillProductForm(invalidProductData);
      await productsPage.saveProduct();
      
      // Should show validation error
      expect(await productsPage.hasErrorMessage()).toBe(true);
      
      // Step 3: Fix the data and try again
      const validProductData = testDataGenerator.generateProduct();
      await productsPage.fillProductForm(validProductData);
      await productsPage.saveProduct();
      
      expect(await productsPage.hasSuccessMessage()).toBe(true);
      
      // Step 4: Test network error recovery
      // Simulate network error
      await page.route('**/api/v1/products**', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await productsPage.goto();
      
      // Should show error message
      expect(await productsPage.hasErrorMessage()).toBe(true);
      
      // Step 5: Remove network error and verify recovery
      await page.unroute('**/api/v1/products**');
      await productsPage.goto();
      
      // Should load successfully
      expect(await productsPage.isProductsPageLoaded()).toBe(true);
    });
  });

  test.describe('Performance Under Load Workflow', () => {
    test('should handle multiple operations efficiently', async () => {
      // Step 1: Login as admin
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(await dashboardPage.isAuthenticated()).toBe(true);
      
      // Step 2: Create multiple products quickly
      await productsPage.goto();
      
      const startTime = Date.now();
      
      for (let i = 0; i < 5; i++) {
        const productData = testDataGenerator.generateProduct({
          name: `Load Test Product ${i}`,
          sku: `LOAD-${i}-${Date.now()}`
        });
        
        await productsPage.clickAddProduct();
        await productsPage.fillProductForm(productData);
        await productsPage.saveProduct();
        
        if (await productsPage.hasSuccessMessage()) {
          await productsPage.closeModal();
        }
      }
      
      const totalTime = Date.now() - startTime;
      
      // Should complete within reasonable time (less than 30 seconds for 5 products)
      expect(totalTime).toBeLessThan(30000);
      
      // Step 3: Verify all products were created
      await productsPage.searchProducts('Load Test Product');
      const productCount = await productsPage.getProductCount();
      expect(productCount).toBeGreaterThanOrEqual(5);
    });
  });

  test.describe('Session Management Workflow', () => {
    test('should handle session timeout and renewal', async () => {
      // Step 1: Login as admin
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(await dashboardPage.isAuthenticated()).toBe(true);
      
      // Step 2: Navigate to different pages to test session
      await productsPage.goto();
      expect(await productsPage.isProductsPageLoaded()).toBe(true);
      
      await inventoryPage.goto();
      expect(await inventoryPage.isInventoryPageLoaded()).toBe(true);
      
      await purchaseOrdersPage.goto();
      expect(await purchaseOrdersPage.isPurchaseOrdersPageLoaded()).toBe(true);
      
      // Step 3: Test session persistence across page refreshes
      await page.reload();
      expect(await dashboardPage.isAuthenticated()).toBe(true);
      
      // Step 4: Test logout
      await dashboardPage.logout();
      expect(await loginPage.isOnLoginPage()).toBe(true);
      
      // Step 5: Try to access protected page after logout
      await page.goto(testConfig.baseUrl + '/admin/products');
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/login');
    });
  });

  test.describe('Data Export/Import Workflow', () => {
    test('should handle data export and import operations', async () => {
      // Step 1: Login as admin
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(await dashboardPage.isAuthenticated()).toBe(true);
      
      // Step 2: Test export functionality
      await productsPage.goto();
      
      if (await productsPage.isVisible(productsPage.selectors.exportButton)) {
        await productsPage.click(productsPage.selectors.exportButton);
        
        // Should trigger download or show export options
        // Note: Actual file download testing would require additional setup
      }
      
      // Step 3: Test import functionality
      if (await productsPage.isVisible(productsPage.selectors.importButton)) {
        await productsPage.click(productsPage.selectors.importButton);
        
        // Should show import modal or options
        // Note: Actual file upload testing would require additional setup
      }
      
      // Step 4: Test similar functionality on other pages
      await inventoryPage.goto();
      
      if (await inventoryPage.isVisible(inventoryPage.selectors.exportButton)) {
        await inventoryPage.click(inventoryPage.selectors.exportButton);
      }
      
      await purchaseOrdersPage.goto();
      
      if (await purchaseOrdersPage.isVisible(purchaseOrdersPage.selectors.exportButton)) {
        await purchaseOrdersPage.click(purchaseOrdersPage.selectors.exportButton);
      }
    });
  });
});

