const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login-page');
const DashboardPage = require('../../pages/dashboard-page');
const ProductsPage = require('../../pages/products-page');
const ApiHelper = require('../../utils/api-helper');
const BrowserHelper = require('../../utils/browser-helper');

// Load test configuration
const testConfig = require('../../config/test-config.json');
const users = require('../../config/users.json');
const roles = require('../../config/roles.json');

test.describe('Role-based Access Control Tests', () => {
  let loginPage;
  let dashboardPage;
  let productsPage;
  let apiHelper;
  let browserHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    productsPage = new ProductsPage(page);
    apiHelper = new ApiHelper(page);
    browserHelper = new BrowserHelper(page);
    
    // Clear all storage before each test
    await browserHelper.clearAllStorage();
  });

  test.describe('Super Admin Access Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should have access to all modules', async () => {
      const modules = [
        'products',
        'inventory', 
        'users',
        'reports',
        'settings'
      ];

      for (const module of modules) {
        const hasAccess = await dashboardPage.isNavigationItemVisible(module);
        expect(hasAccess).toBe(true);
      }
    });

    test('should be able to access user management', async () => {
      const accessResult = await dashboardPage.checkModuleAccess('users');
      expect(accessResult.hasAccess).toBe(true);
    });

    test('should be able to access system settings', async () => {
      const accessResult = await dashboardPage.checkModuleAccess('settings');
      expect(accessResult.hasAccess).toBe(true);
    });

    test('should have all permissions via API', async () => {
      const profileResponse = await apiHelper.getUserProfile();
      expect(profileResponse.status).toBe(200);
      
      const userRoles = profileResponse.data.roles || [];
      expect(userRoles.length).toBeGreaterThan(0);
      
      // Check if user has super_admin role
      const hasSuperAdminRole = userRoles.some(role => 
        role.name === 'super_admin' || role.name === 'SUPER_ADMIN'
      );
      expect(hasSuperAdminRole).toBe(true);
    });
  });

  test.describe('Admin Access Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.admin.username,
        users.admin.password
      );
    });

    test('should have access to most modules', async () => {
      const allowedModules = [
        'products',
        'inventory',
        'reports'
      ];

      for (const module of allowedModules) {
        const hasAccess = await dashboardPage.isNavigationItemVisible(module);
        expect(hasAccess).toBe(true);
      }
    });

    test('should not have access to user management', async () => {
      const accessResult = await dashboardPage.checkModuleAccess('users');
      expect(accessResult.hasAccess).toBe(false);
    });

    test('should not have access to system settings', async () => {
      const accessResult = await dashboardPage.checkModuleAccess('settings');
      expect(accessResult.hasAccess).toBe(false);
    });

    test('should be able to manage products', async () => {
      const accessResult = await dashboardPage.checkModuleAccess('products');
      expect(accessResult.hasAccess).toBe(true);
      
      // Navigate to products page and verify access
      await productsPage.goto();
      expect(await productsPage.isProductsPageLoaded()).toBe(true);
    });
  });

  test.describe('Manager Access Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.manager.username,
        users.manager.password
      );
    });

    test('should have limited access to modules', async () => {
      const allowedModules = [
        'products',
        'inventory'
      ];

      for (const module of allowedModules) {
        const hasAccess = await dashboardPage.isNavigationItemVisible(module);
        expect(hasAccess).toBe(true);
      }
    });

    test('should not have access to restricted modules', async () => {
      const restrictedModules = [
        'users',
        'settings'
      ];

      for (const module of restrictedModules) {
        const accessResult = await dashboardPage.checkModuleAccess(module);
        expect(accessResult.hasAccess).toBe(false);
      }
    });

    test('should be able to view products but with limited actions', async () => {
      await productsPage.goto();
      expect(await productsPage.isProductsPageLoaded()).toBe(true);
      
      // Check if add button is visible (manager should have create access)
      const hasAddButton = await productsPage.isVisible(productsPage.selectors.addProductButton);
      expect(hasAddButton).toBe(true);
    });
  });

  test.describe('User Access Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.user.username,
        users.user.password
      );
    });

    test('should have read-only access to most modules', async () => {
      const allowedModules = [
        'products',
        'inventory'
      ];

      for (const module of allowedModules) {
        const hasAccess = await dashboardPage.isNavigationItemVisible(module);
        expect(hasAccess).toBe(true);
      }
    });

    test('should not have access to restricted modules', async () => {
      const restrictedModules = [
        'users',
        'settings',
        'reports'
      ];

      for (const module of restrictedModules) {
        const accessResult = await dashboardPage.checkModuleAccess(module);
        expect(accessResult.hasAccess).toBe(false);
      }
    });

    test('should not be able to create products', async () => {
      await productsPage.goto();
      expect(await productsPage.isProductsPageLoaded()).toBe(true);
      
      // Check if add button is not visible or disabled
      const hasAddButton = await productsPage.isVisible(productsPage.selectors.addProductButton);
      if (hasAddButton) {
        const isEnabled = await productsPage.page.locator(productsPage.selectors.addProductButton).isEnabled();
        expect(isEnabled).toBe(false);
      }
    });
  });

  test.describe('Viewer Access Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.viewer.username,
        users.viewer.password
      );
    });

    test('should have read-only access to basic modules', async () => {
      const allowedModules = [
        'products',
        'inventory'
      ];

      for (const module of allowedModules) {
        const hasAccess = await dashboardPage.isNavigationItemVisible(module);
        expect(hasAccess).toBe(true);
      }
    });

    test('should not have access to any management modules', async () => {
      const restrictedModules = [
        'users',
        'settings',
        'reports'
      ];

      for (const module of restrictedModules) {
        const accessResult = await dashboardPage.checkModuleAccess(module);
        expect(accessResult.hasAccess).toBe(false);
      }
    });

    test('should only be able to view products', async () => {
      await productsPage.goto();
      expect(await productsPage.isProductsPageLoaded()).toBe(true);
      
      // Should not have add button
      const hasAddButton = await productsPage.isVisible(productsPage.selectors.addProductButton);
      expect(hasAddButton).toBe(false);
    });
  });

  test.describe('API Permission Tests', () => {
    test('should enforce API permissions based on role', async () => {
      const testCases = [
        {
          role: 'super_admin',
          user: users.super_admin,
          shouldHaveAccess: ['users', 'products', 'settings']
        },
        {
          role: 'admin',
          user: users.admin,
          shouldHaveAccess: ['products'],
          shouldNotHaveAccess: ['users', 'settings']
        },
        {
          role: 'manager',
          user: users.manager,
          shouldHaveAccess: ['products'],
          shouldNotHaveAccess: ['users', 'settings']
        },
        {
          role: 'user',
          user: users.user,
          shouldHaveAccess: ['products'],
          shouldNotHaveAccess: ['users', 'settings']
        }
      ];

      for (const testCase of testCases) {
        // Login with the role
        await apiHelper.login(testCase.user.username, testCase.user.password);
        
        // Test API access
        for (const endpoint of testCase.shouldHaveAccess || []) {
          const response = await apiHelper.makeRequest('GET', `/api/v1/${endpoint}`);
          expect(response.status).not.toBe(403); // Should not be forbidden
        }
        
        for (const endpoint of testCase.shouldNotHaveAccess || []) {
          const response = await apiHelper.makeRequest('GET', `/api/v1/${endpoint}`);
          expect(response.status).toBe(403); // Should be forbidden
        }
        
        // Clear tokens for next test
        apiHelper.clearTokens();
      }
    });
  });

  test.describe('Cross-Role Access Tests', () => {
    test('should prevent privilege escalation', async () => {
      // Login as regular user
      await loginPage.goto();
      await loginPage.login(
        users.user.username,
        users.user.password
      );
      
      // Try to access admin-only URLs directly
      const adminUrls = [
        '/admin/users',
        '/admin/settings',
        '/admin/roles'
      ];
      
      for (const url of adminUrls) {
        await page.goto(testConfig.baseUrl + url);
        
        // Should be redirected or show access denied
        const currentUrl = await page.url();
        const hasAccessDenied = await page.locator('text=Access Denied, text=Forbidden').isVisible();
        
        expect(currentUrl.includes('/login') || hasAccessDenied).toBe(true);
      }
    });

    test('should maintain session security across role changes', async () => {
      // Login as admin
      await loginPage.goto();
      await loginPage.login(
        users.admin.username,
        users.admin.password
      );
      
      // Get current session info
      const userInfo1 = await dashboardPage.getUserInfo();
      
      // Logout
      await dashboardPage.logout();
      
      // Login as different role
      await loginPage.login(
        users.user.username,
        users.user.password
      );
      
      // Get new session info
      const userInfo2 = await dashboardPage.getUserInfo();
      
      // Should be different users
      expect(userInfo1.name).not.toBe(userInfo2.name);
    });
  });

  test.describe('Permission Boundary Tests', () => {
    test('should enforce permission boundaries in UI', async () => {
      const roleTests = [
        {
          role: 'admin',
          user: users.admin,
          shouldSee: ['Add Product', 'Edit', 'Delete'],
          shouldNotSee: ['User Management', 'System Settings']
        },
        {
          role: 'user',
          user: users.user,
          shouldSee: ['View Products'],
          shouldNotSee: ['Add Product', 'Edit', 'Delete', 'User Management']
        }
      ];

      for (const roleTest of roleTests) {
        await loginPage.goto();
        await loginPage.login(roleTest.user.username, roleTest.user.password);
        
        // Check what UI elements should be visible
        for (const element of roleTest.shouldSee) {
          const isVisible = await page.locator(`text=${element}`).isVisible();
          expect(isVisible).toBe(true);
        }
        
        // Check what UI elements should not be visible
        for (const element of roleTest.shouldNotSee) {
          const isVisible = await page.locator(`text=${element}`).isVisible();
          expect(isVisible).toBe(false);
        }
        
        await dashboardPage.logout();
      }
    });
  });

  test.describe('Session Management Tests', () => {
    test('should handle token expiration gracefully', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      // Simulate token expiration by clearing tokens
      await browserHelper.clearLocalStorage();
      
      // Try to access protected page
      await page.goto(testConfig.baseUrl + '/admin/products');
      
      // Should be redirected to login
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/login');
    });

    test('should refresh tokens automatically', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      // Wait for automatic token refresh
      await page.waitForTimeout(2000);
      
      // Should still be authenticated
      expect(await dashboardPage.isAuthenticated()).toBe(true);
    });
  });
});

