const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login-page');
const DashboardPage = require('../../pages/dashboard-page');
const ApiHelper = require('../../utils/api-helper');
const BrowserHelper = require('../../utils/browser-helper');

// Load test configuration
const testConfig = require('../../config/test-config.json');
const users = require('../../config/users.json');

test.describe('Dashboard Page Tests', () => {
  let loginPage;
  let dashboardPage;
  let apiHelper;
  let browserHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    apiHelper = new ApiHelper(page);
    browserHelper = new BrowserHelper(page);
    
    // Clear all storage before each test
    await browserHelper.clearAllStorage();
  });

  test.describe('Dashboard Access and Authentication', () => {
    test('should redirect to login when not authenticated', async () => {
      await dashboardPage.goto();
      
      // Should be redirected to login page
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/login');
    });

    test('should load dashboard after successful login', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(await dashboardPage.isDashboardLoaded()).toBe(true);
      expect(await dashboardPage.isAuthenticated()).toBe(true);
    });

    test('should display user information correctly', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      const userInfo = await dashboardPage.getUserInfo();
      expect(userInfo.name).toBeDefined();
      expect(userInfo.role).toBeDefined();
    });
  });

  test.describe('Dashboard UI Elements', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should display all required dashboard elements', async () => {
      const validation = await dashboardPage.validateDashboardElements();
      expect(validation.valid).toBe(true);
      expect(validation.missing).toHaveLength(0);
    });

    test('should have proper page title', async () => {
      const pageTitle = await page.title();
      expect(pageTitle).toContain('Dashboard');
    });

    test('should display navigation sidebar', async () => {
      expect(await dashboardPage.isVisible(dashboardPage.selectors.sidebar)).toBe(true);
    });

    test('should display header with user menu', async () => {
      expect(await dashboardPage.isVisible(dashboardPage.selectors.header)).toBe(true);
      expect(await dashboardPage.isVisible(dashboardPage.selectors.userMenu)).toBe(true);
    });

    test('should be responsive on different screen sizes', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      expect(await dashboardPage.isDashboardLoaded()).toBe(true);
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      expect(await dashboardPage.isDashboardLoaded()).toBe(true);
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      expect(await dashboardPage.isDashboardLoaded()).toBe(true);
    });
  });

  test.describe('Navigation Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should navigate to products page', async () => {
      await dashboardPage.navigateToProducts();
      
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/products');
    });

    test('should navigate to inventory page', async () => {
      await dashboardPage.navigateToInventory();
      
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/inventory');
    });

    test('should navigate to users page (admin only)', async () => {
      await dashboardPage.navigateToUsers();
      
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/users');
    });

    test('should navigate to reports page', async () => {
      await dashboardPage.navigateToReports();
      
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/reports');
    });

    test('should navigate to settings page (admin only)', async () => {
      await dashboardPage.navigateToSettings();
      
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/settings');
    });

    test('should toggle sidebar visibility', async () => {
      const initialCollapsed = await dashboardPage.isSidebarCollapsed();
      
      await dashboardPage.toggleSidebar();
      
      const afterToggle = await dashboardPage.isSidebarCollapsed();
      expect(afterToggle).not.toBe(initialCollapsed);
    });
  });

  test.describe('Dashboard Data and Statistics', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should display dashboard statistics', async () => {
      await dashboardPage.waitForDashboardData();
      
      const stats = await dashboardPage.getDashboardStats();
      expect(stats).toBeDefined();
      expect(Array.isArray(stats)).toBe(true);
    });

    test('should display recent activities', async () => {
      await dashboardPage.waitForDashboardData();
      
      const activities = await dashboardPage.getRecentActivities();
      expect(activities).toBeDefined();
      expect(Array.isArray(activities)).toBe(true);
    });

    test('should display quick actions', async () => {
      await dashboardPage.waitForDashboardData();
      
      const actions = await dashboardPage.getQuickActions();
      expect(actions).toBeDefined();
      expect(Array.isArray(actions)).toBe(true);
    });

    test('should load dashboard data within acceptable time', async () => {
      const startTime = Date.now();
      
      await dashboardPage.waitForDashboardData();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    });
  });

  test.describe('Logout Functionality', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should logout successfully', async () => {
      await dashboardPage.logout();
      
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/login');
    });

    test('should clear user session after logout', async () => {
      await dashboardPage.logout();
      
      // Try to access dashboard directly
      await page.goto(testConfig.baseUrl + '/admin');
      
      // Should be redirected to login
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/login');
    });
  });

  test.describe('Role-based Dashboard Access', () => {
    test('should show different navigation items based on role', async () => {
      const roleTests = [
        {
          role: 'super_admin',
          user: users.super_admin,
          shouldSee: ['products', 'inventory', 'users', 'reports', 'settings']
        },
        {
          role: 'admin',
          user: users.admin,
          shouldSee: ['products', 'inventory', 'reports'],
          shouldNotSee: ['users', 'settings']
        },
        {
          role: 'manager',
          user: users.manager,
          shouldSee: ['products', 'inventory'],
          shouldNotSee: ['users', 'settings', 'reports']
        },
        {
          role: 'user',
          user: users.user,
          shouldSee: ['products', 'inventory'],
          shouldNotSee: ['users', 'settings', 'reports']
        }
      ];

      for (const roleTest of roleTests) {
        await loginPage.goto();
        await loginPage.login(roleTest.user.username, roleTest.user.password);
        
        // Check visible navigation items
        for (const item of roleTest.shouldSee) {
          const isVisible = await dashboardPage.isNavigationItemVisible(item);
          expect(isVisible).toBe(true);
        }
        
        // Check hidden navigation items
        for (const item of roleTest.shouldNotSee || []) {
          const isVisible = await dashboardPage.isNavigationItemVisible(item);
          expect(isVisible).toBe(false);
        }
        
        await dashboardPage.logout();
      }
    });

    test('should enforce access control for restricted modules', async () => {
      // Test with regular user
      await loginPage.goto();
      await loginPage.login(
        users.user.username,
        users.user.password
      );
      
      const restrictedModules = ['users', 'settings'];
      
      for (const module of restrictedModules) {
        const accessResult = await dashboardPage.checkModuleAccess(module);
        expect(accessResult.hasAccess).toBe(false);
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

    test('should load dashboard within acceptable time', async () => {
      const startTime = Date.now();
      
      await dashboardPage.waitForPageLoad();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should handle dashboard refresh efficiently', async () => {
      const startTime = Date.now();
      
      await dashboardPage.refresh();
      
      const refreshTime = Date.now() - startTime;
      expect(refreshTime).toBeLessThan(3000); // Should refresh within 3 seconds
    });

    test('should have good performance metrics', async () => {
      const metrics = await browserHelper.getPerformanceMetrics();
      
      expect(metrics.loadTime).toBeLessThan(3000);
      expect(metrics.domContentLoaded).toBeLessThan(2000);
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
      await page.route('**/api/**', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await dashboardPage.refresh();
      
      // Dashboard should still be functional
      expect(await dashboardPage.isDashboardLoaded()).toBe(true);
    });

    test('should handle network connectivity issues', async () => {
      // Simulate network issues
      await page.route('**/*', route => route.abort());
      
      await dashboardPage.refresh();
      
      // Should show appropriate error message or fallback
      const hasError = await dashboardPage.hasErrors();
      expect(hasError).toBe(true);
    });

    test('should handle slow API responses', async () => {
      // Simulate slow API
      await page.route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        route.continue();
      });
      
      await dashboardPage.refresh();
      
      // Should show loading state
      expect(await dashboardPage.isVisible(dashboardPage.selectors.loadingSpinner)).toBe(true);
    });
  });

  test.describe('Accessibility Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should support keyboard navigation', async () => {
      // Test tab navigation through dashboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate through elements
      expect(await dashboardPage.isDashboardLoaded()).toBe(true);
    });

    test('should have proper ARIA labels and roles', async () => {
      // Check for proper ARIA attributes
      const navElements = await page.locator('nav, [role="navigation"]').count();
      expect(navElements).toBeGreaterThan(0);
      
      const mainElements = await page.locator('main, [role="main"]').count();
      expect(mainElements).toBeGreaterThan(0);
    });

    test('should have proper heading hierarchy', async () => {
      const h1Elements = await page.locator('h1').count();
      expect(h1Elements).toBeGreaterThan(0);
      
      const h2Elements = await page.locator('h2').count();
      expect(h2Elements).toBeGreaterThan(0);
    });
  });

  test.describe('Browser Compatibility Tests', () => {
    test('should work consistently across different browsers', async ({ browserName }) => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(await dashboardPage.isDashboardLoaded()).toBe(true);
      
      // Test navigation
      await dashboardPage.navigateToProducts();
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/products');
    });
  });

  test.describe('Session Management Tests', () => {
    test('should handle session timeout gracefully', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      // Simulate session timeout by clearing tokens
      await browserHelper.clearLocalStorage();
      
      // Try to navigate
      await dashboardPage.navigateToProducts();
      
      // Should be redirected to login
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/login');
    });

    test('should maintain session across page refreshes', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      // Refresh page
      await page.reload();
      
      // Should still be authenticated
      expect(await dashboardPage.isAuthenticated()).toBe(true);
    });
  });
});

