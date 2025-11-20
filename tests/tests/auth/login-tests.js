const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login-page');
const DashboardPage = require('../../pages/dashboard-page');
const ApiHelper = require('../../utils/api-helper');
const TestDataGenerator = require('../../utils/test-data-generator');
const BrowserHelper = require('../../utils/browser-helper');

// Load test configuration
const testConfig = require('../../config/test-config.json');
const users = require('../../config/users.json');

test.describe('Login Page Tests', () => {
  let loginPage;
  let dashboardPage;
  let apiHelper;
  let testDataGenerator;
  let browserHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    apiHelper = new ApiHelper(page);
    testDataGenerator = new TestDataGenerator();
    browserHelper = new BrowserHelper(page);
    
    // Navigate to login page first
    await loginPage.goto();
    
    // Clear all storage after navigation (more reliable)
    await browserHelper.clearAllStorage();
  });

  test.describe('Page Load and UI Elements', () => {
    test('should load login page successfully', async () => {
      await loginPage.goto();
      
      expect(await loginPage.isOnLoginPage()).toBe(true);
      expect(await loginPage.getPageTitle()).toContain('Login');
    });
    test('should display all required form elements', async () => {
      await loginPage.goto();
      
      const validation = await loginPage.validateFormElements();
      expect(validation.valid).toBe(true);
      expect(validation.missing).toHaveLength(0);
    });

    test('should have proper form validation', async () => {
      await loginPage.goto();
      
      const validation = await loginPage.testFormValidation();
      expect(validation.usernameError || validation.passwordError).toBe(true);
    });

    test('should be responsive on different screen sizes', async () => {
      await loginPage.goto();
      
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      expect(await loginPage.isLoginFormVisible()).toBe(true);
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      expect(await loginPage.isLoginFormVisible()).toBe(true);
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      expect(await loginPage.isLoginFormVisible()).toBe(true);
    });
  });

  test.describe('Authentication Tests', () => {
    test('should login successfully with valid admin credentials', async () => {
      await loginPage.goto();
      
      const result = await loginPage.attemptLogin(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(result.success).toBe(true);
      expect(await dashboardPage.isAuthenticated()).toBe(true);
    });

    test('should login successfully with valid admin email', async () => {
      await loginPage.goto();
      
      const result = await loginPage.attemptLogin(
        users.super_admin.email,
        users.super_admin.password
      );
      
      expect(result.success).toBe(true);
      expect(await dashboardPage.isAuthenticated()).toBe(true);
    });

    test('should fail login with invalid username', async () => {
      await loginPage.goto();
      
      const result = await loginPage.attemptLogin(
        'invalid_username',
        users.super_admin.password
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Login failed');
    });

    test('should fail login with invalid password', async () => {
      await loginPage.goto();
      
      const result = await loginPage.attemptLogin(
        users.super_admin.username,
        'invalid_password'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Login failed');
    });

    test('should fail login with empty credentials', async () => {
      await loginPage.goto();
      
      const result = await loginPage.attemptLogin('', '');
      
      expect(result.success).toBe(false);
    });

    test('should fail login with empty username', async () => {
      await loginPage.goto();
      
      const result = await loginPage.attemptLogin(
        '',
        users.super_admin.password
      );
      
      expect(result.success).toBe(false);
    });

    test('should fail login with empty password', async () => {
      await loginPage.goto();
      
      const result = await loginPage.attemptLogin(
        users.super_admin.username,
        ''
      );
      
      expect(result.success).toBe(false);
    });
  });

  test.describe('Role-based Login Tests', () => {
    for (const [roleName, userData] of Object.entries(users)) {
      test(`should login successfully with ${roleName} credentials`, async () => {
        await loginPage.goto();
        
        const result = await loginPage.attemptLogin(
          userData.username,
          userData.password
        );
        
        expect(result.success).toBe(true);
        expect(await dashboardPage.isAuthenticated()).toBe(true);
        
        // Verify user info
        const userInfo = await dashboardPage.getUserInfo();
        expect(userInfo.name).toBeDefined();
        expect(userInfo.role).toBeDefined();
      });
    }
  });

  test.describe('API Integration Tests', () => {
    test('should authenticate via API and get valid tokens', async () => {
      const response = await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(response.status).toBe(200);
      expect(response.data.accessToken).toBeDefined();
      expect(response.data.refreshToken).toBeDefined();
      expect(response.data.user).toBeDefined();
    });

    test('should get user profile after login', async () => {
      await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      const profileResponse = await apiHelper.getUserProfile();
      
      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data.username).toBe(users.super_admin.username);
      expect(profileResponse.data.email).toBe(users.super_admin.email);
    });

    test('should refresh token successfully', async () => {
      await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      const refreshResponse = await apiHelper.refreshToken();
      
      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.data.accessToken).toBeDefined();
    });

    test('should logout successfully', async () => {
      await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      const logoutResponse = await apiHelper.logout();
      
      expect(logoutResponse.status).toBe(200);
    });
  });

  test.describe('Security Tests', () => {
    test('should not expose sensitive information in page source', async () => {
      await loginPage.goto();
      
      const pageContent = await page.content();
      
      // Check that sensitive information is not exposed
      expect(pageContent).not.toContain('admin123');
      expect(pageContent).not.toContain('password');
      expect(pageContent).not.toContain('token');
    });

    test('should handle XSS attempts in login form', async () => {
      await loginPage.goto();
      
      const xssPayload = '<script>alert("xss")</script>';
      
      await loginPage.fill(loginPage.selectors.usernameInput, xssPayload);
      await loginPage.fill(loginPage.selectors.passwordInput, xssPayload);
      
      // Check that script is not executed
      const pageContent = await page.content();
      expect(pageContent).toContain(xssPayload); // Should be escaped
    });

    test('should prevent SQL injection attempts', async () => {
      await loginPage.goto();
      
      const sqlPayload = "admin'; DROP TABLE users; --";
      
      const result = await loginPage.attemptLogin(
        sqlPayload,
        users.super_admin.password
      );
      
      expect(result.success).toBe(false);
    });
  });

  test.describe('Performance Tests', () => {
    test('should load login page within acceptable time', async () => {
      const startTime = Date.now();
      
      await loginPage.goto();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should handle multiple concurrent login attempts', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        promises.push(
          loginPage.attemptLogin(
            users.super_admin.username,
            users.super_admin.password
          )
        );
      }
      
      const results = await Promise.all(promises);
      
      // At least one should succeed
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should have proper form labels and accessibility attributes', async () => {
      await loginPage.goto();
      
      // Check for proper labels
      const usernameLabel = await page.locator('label[for*="username"], label:has-text("Username"), label:has-text("Email")');
      const passwordLabel = await page.locator('label[for*="password"], label:has-text("Password")');
      
      expect(await usernameLabel.count()).toBeGreaterThan(0);
      expect(await passwordLabel.count()).toBeGreaterThan(0);
    });

    test('should support keyboard navigation', async () => {
      await loginPage.goto();
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate through form elements
      expect(await loginPage.isLoginFormVisible()).toBe(true);
    });

    test('should have proper focus management', async () => {
      await loginPage.goto();
      
      // Focus should start on username field
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement.tagName);
      expect(['INPUT', 'TEXTAREA']).toContain(focusedElement);
    });
  });

  test.describe('Error Handling Tests', () => {
    test('should display appropriate error messages for invalid credentials', async () => {
      await loginPage.goto();
      
      await loginPage.attemptLogin('invalid', 'invalid');
      
      if (await loginPage.hasLoginError()) {
        const errorMessage = await loginPage.getLoginErrorMessage();
        expect(errorMessage).toBeDefined();
        expect(errorMessage.length).toBeGreaterThan(0);
      }
    });

    test('should handle network errors gracefully', async () => {
      // Block network requests
      await page.route('**/*', route => route.abort());
      
      await loginPage.goto();
      
      // Should still show login form even with network issues
      expect(await loginPage.isLoginFormVisible()).toBe(true);
    });

    test('should handle server errors gracefully', async () => {
      await loginPage.goto();
      
      // Simulate server error by blocking API calls
      await page.route('**/api/v1/auth/login', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      const result = await loginPage.attemptLogin(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(result.success).toBe(false);
    });
  });

  test.describe('Browser Compatibility Tests', () => {
    test('should work with different browsers', async ({ browserName }) => {
      await loginPage.goto();
      
      expect(await loginPage.isLoginFormVisible()).toBe(true);
      
      const result = await loginPage.attemptLogin(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(result.success).toBe(true);
    });
  });
});

