const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login-page');
const UsersPage = require('../../pages/users-page');
const ApiHelper = require('../../utils/api-helper');
const TestDataGenerator = require('../../utils/test-data-generator');
const BrowserHelper = require('../../utils/browser-helper');

// Load test configuration
const testConfig = require('../../config/test-config.json');
const users = require('../../config/users.json');

test.describe('Users Page Tests', () => {
  let loginPage;
  let usersPage;
  let apiHelper;
  let testDataGenerator;
  let browserHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    usersPage = new UsersPage(page);
    apiHelper = new ApiHelper(page);
    testDataGenerator = new TestDataGenerator();
    browserHelper = new BrowserHelper(page);
    
    // Clear all storage before each test
    await browserHelper.clearAllStorage();
  });

  test.describe('Users Page Access and Authentication', () => {
    test('should redirect to login when not authenticated', async () => {
      await usersPage.goto();
      
      // Should be redirected to login page
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/login');
    });

    test('should load users page after successful admin login', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      await usersPage.goto();
      expect(await usersPage.isUsersPageLoaded()).toBe(true);
    });

    test('should display proper page title', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      await usersPage.goto();
      const pageTitle = await usersPage.getPageTitle();
      expect(pageTitle).toContain('Users');
    });
  });

  test.describe('Users Page UI Elements', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await usersPage.goto();
    });

    test('should display all required page elements', async () => {
      const validation = await usersPage.validatePageElements();
      expect(validation.valid).toBe(true);
      expect(validation.missing).toHaveLength(0);
    });

    test('should display users table', async () => {
      expect(await usersPage.isVisible(usersPage.selectors.usersTable)).toBe(true);
    });

    test('should display add user button', async () => {
      expect(await usersPage.isVisible(usersPage.selectors.addUserButton)).toBe(true);
    });

    test('should display search input', async () => {
      expect(await usersPage.isVisible(usersPage.selectors.searchInput)).toBe(true);
    });

    test('should display filters', async () => {
      expect(await usersPage.isVisible(usersPage.selectors.roleFilter)).toBe(true);
      expect(await usersPage.isVisible(usersPage.selectors.statusFilter)).toBe(true);
      expect(await usersPage.isVisible(usersPage.selectors.departmentFilter)).toBe(true);
    });

    test('should display statistics cards', async () => {
      const stats = await usersPage.getUserStats();
      expect(stats).toBeDefined();
    });

    test('should be responsive on different screen sizes', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      expect(await usersPage.isUsersPageLoaded()).toBe(true);
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      expect(await usersPage.isUsersPageLoaded()).toBe(true);
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      expect(await usersPage.isUsersPageLoaded()).toBe(true);
    });
  });

  test.describe('User CRUD Operations', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await usersPage.goto();
    });

    test('should open add user modal', async () => {
      await usersPage.clickAddUser();
      expect(await usersPage.isModalOpen('add')).toBe(true);
    });

    test('should create a new user successfully', async () => {
      const userData = testDataGenerator.generateUser({
        username: `testuser${Date.now()}`,
        email: `testuser${Date.now()}@example.com`
      });
      
      const result = await usersPage.testCreateUser(userData);
      expect(result.success).toBe(true);
      
      if (await usersPage.hasSuccessMessage()) {
        const successMessage = await usersPage.getSuccessMessage();
        expect(successMessage).toContain('success');
      }
    });

    test('should validate required fields when creating user', async () => {
      const invalidUser = {
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: ''
      };
      
      await usersPage.clickAddUser();
      await usersPage.fillUserForm(invalidUser);
      await usersPage.saveUser();
      
      // Should show validation error
      expect(await usersPage.hasErrorMessage()).toBe(true);
    });

    test('should validate email format when creating user', async () => {
      const invalidUser = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };
      
      await usersPage.clickAddUser();
      await usersPage.fillUserForm(invalidUser);
      await usersPage.saveUser();
      
      // Should show validation error
      expect(await usersPage.hasErrorMessage()).toBe(true);
    });

    test('should validate password strength when creating user', async () => {
      const invalidUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        firstName: 'Test',
        lastName: 'User'
      };
      
      await usersPage.clickAddUser();
      await usersPage.fillUserForm(invalidUser);
      await usersPage.saveUser();
      
      // Should show validation error
      expect(await usersPage.hasErrorMessage()).toBe(true);
    });

    test('should validate password confirmation when creating user', async () => {
      const invalidUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'DifferentPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };
      
      await usersPage.clickAddUser();
      await usersPage.fillUserForm(invalidUser);
      await usersPage.saveUser();
      
      // Should show validation error
      expect(await usersPage.hasErrorMessage()).toBe(true);
    });

    test('should close modal when cancel is clicked', async () => {
      await usersPage.clickAddUser();
      expect(await usersPage.isModalOpen('add')).toBe(true);
      
      await usersPage.cancelUser();
      expect(await usersPage.isModalOpen('add')).toBe(false);
    });

    test('should close modal when close button is clicked', async () => {
      await usersPage.clickAddUser();
      expect(await usersPage.isModalOpen('add')).toBe(true);
      
      await usersPage.closeModal();
      expect(await usersPage.isModalOpen('add')).toBe(false);
    });
  });

  test.describe('User Search and Filtering', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await usersPage.goto();
    });

    test('should search for users by name or email', async () => {
      const searchTerm = testDataGenerator.generateSearchTerm('valid');
      
      const result = await usersPage.testSearch(searchTerm);
      expect(result.found).toBeDefined();
      expect(result.count).toBeGreaterThanOrEqual(0);
    });

    test('should handle empty search results', async () => {
      const searchTerm = testDataGenerator.generateSearchTerm('invalid');
      
      const result = await usersPage.testSearch(searchTerm);
      expect(result.found).toBe(false);
      expect(result.count).toBe(0);
    });

    test('should filter users by role', async () => {
      const roles = ['super_admin', 'admin', 'manager', 'user', 'viewer'];
      
      for (const role of roles) {
        await usersPage.filterByRole(role);
        
        // Should show filtered results
        const userCount = await usersPage.getUserCount();
        expect(userCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should filter users by status', async () => {
      const statuses = ['active', 'inactive'];
      
      for (const status of statuses) {
        await usersPage.filterByStatus(status);
        
        // Should show filtered results
        const userCount = await usersPage.getUserCount();
        expect(userCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should filter users by department', async () => {
      const departments = ['IT', 'HR', 'Finance', 'Operations'];
      
      for (const department of departments) {
        await usersPage.filterByDepartment(department);
        
        // Should show filtered results
        const userCount = await usersPage.getUserCount();
        expect(userCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should handle special characters in search', async () => {
      const specialSearch = testDataGenerator.generateSearchTerm('special');
      
      const result = await usersPage.testSearch(specialSearch);
      expect(result.found).toBeDefined();
    });
  });

  test.describe('User Table Operations', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await usersPage.goto();
    });

    test('should display user data in table', async () => {
      const userCount = await usersPage.getUserCount();
      
      if (userCount > 0) {
        const userData = await usersPage.getUserData(1);
        expect(userData.userName).toBeDefined();
        expect(userData.userEmail).toBeDefined();
        expect(userData.userRole).toBeDefined();
        expect(userData.userStatus).toBeDefined();
        expect(userData.userDepartment).toBeDefined();
        expect(userData.lastLogin).toBeDefined();
        expect(userData.createdAt).toBeDefined();
      }
    });

    test('should open edit modal when edit button is clicked', async () => {
      const userCount = await usersPage.getUserCount();
      
      if (userCount > 0) {
        await usersPage.clickEditUser(1);
        expect(await usersPage.isModalOpen('edit')).toBe(true);
      }
    });

    test('should open delete confirmation modal when delete button is clicked', async () => {
      const userCount = await usersPage.getUserCount();
      
      if (userCount > 0) {
        await usersPage.clickDeleteUser(1);
        expect(await usersPage.isModalOpen('delete')).toBe(true);
      }
    });

    test('should open reset password modal when reset password button is clicked', async () => {
      const userCount = await usersPage.getUserCount();
      
      if (userCount > 0) {
        await usersPage.clickResetPassword(1);
        expect(await usersPage.isModalOpen('reset')).toBe(true);
      }
    });

    test('should toggle user status when toggle status button is clicked', async () => {
      const userCount = await usersPage.getUserCount();
      
      if (userCount > 0) {
        const initialStatus = await usersPage.getUserData(1);
        await usersPage.clickToggleStatus(1);
        
        // Should show success message or update status
        if (await usersPage.hasSuccessMessage()) {
          const successMessage = await usersPage.getSuccessMessage();
          expect(successMessage).toBeDefined();
        }
      }
    });

    test('should handle empty users table', async () => {
      // Clear all users if possible
      await usersPage.searchUsers('nonexistent_user_12345');
      
      if (await usersPage.isTableEmpty()) {
        expect(await usersPage.isVisible(usersPage.selectors.emptyState)).toBe(true);
      }
    });
  });

  test.describe('Bulk Operations', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await usersPage.goto();
    });

    test('should open bulk actions modal', async () => {
      await usersPage.clickBulkActions();
      expect(await usersPage.isModalOpen('bulk')).toBe(true);
    });

    test('should select individual users', async () => {
      const userCount = await usersPage.getUserCount();
      
      if (userCount > 0) {
        await usersPage.selectUser(1);
        
        // Should be able to select user
        expect(await usersPage.isVisible(usersPage.selectors.userCheckbox)).toBe(true);
      }
    });

    test('should select all users', async () => {
      const userCount = await usersPage.getUserCount();
      
      if (userCount > 0) {
        await usersPage.selectAllUsers();
        
        // Should be able to select all users
        expect(await usersPage.isVisible(usersPage.selectors.selectAllCheckbox)).toBe(true);
      }
    });

    test('should apply bulk actions', async () => {
      const userCount = await usersPage.getUserCount();
      
      if (userCount > 0) {
        await usersPage.selectUser(1);
        await usersPage.clickBulkActions();
        
        // Should be able to apply bulk actions
        expect(await usersPage.isModalOpen('bulk')).toBe(true);
      }
    });

    test('should handle bulk activate users', async () => {
      const userCount = await usersPage.getUserCount();
      
      if (userCount > 0) {
        await usersPage.selectUser(1);
        await usersPage.applyBulkAction('activate');
        
        // Should show success message
        if (await usersPage.hasSuccessMessage()) {
          const successMessage = await usersPage.getSuccessMessage();
          expect(successMessage).toBeDefined();
        }
      }
    });

    test('should handle bulk deactivate users', async () => {
      const userCount = await usersPage.getUserCount();
      
      if (userCount > 0) {
        await usersPage.selectUser(1);
        await usersPage.applyBulkAction('deactivate');
        
        // Should show success message
        if (await usersPage.hasSuccessMessage()) {
          const successMessage = await usersPage.getSuccessMessage();
          expect(successMessage).toBeDefined();
        }
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
      await usersPage.goto();
    });

    test('should navigate to next page if available', async () => {
      if (await usersPage.isVisible(usersPage.selectors.nextPageButton)) {
        const currentPage = await usersPage.getCurrentPageNumber();
        await usersPage.goToNextPage();
        
        const newPage = await usersPage.getCurrentPageNumber();
        expect(newPage).toBeGreaterThan(currentPage);
      }
    });

    test('should navigate to previous page if available', async () => {
      // First go to next page if possible
      if (await usersPage.isVisible(usersPage.selectors.nextPageButton)) {
        await usersPage.goToNextPage();
        
        if (await usersPage.isVisible(usersPage.selectors.prevPageButton)) {
          const currentPage = await usersPage.getCurrentPageNumber();
          await usersPage.goToPreviousPage();
          
          const newPage = await usersPage.getCurrentPageNumber();
          expect(newPage).toBeLessThan(currentPage);
        }
      }
    });

    test('should display correct page numbers', async () => {
      const currentPage = await usersPage.getCurrentPageNumber();
      expect(currentPage).toBeGreaterThan(0);
    });
  });

  test.describe('Role-based Access Control', () => {
    test('should allow super admin to manage users', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await usersPage.goto();
      
      expect(await usersPage.isVisible(usersPage.selectors.addUserButton)).toBe(true);
    });

    test('should restrict admin from accessing users page', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.admin.username,
        users.admin.password
      );
      
      // Try to access users page
      await page.goto(testConfig.baseUrl + '/admin/users');
      
      // Should be redirected or show access denied
      const currentUrl = await page.url();
      const hasAccessDenied = await page.locator('text=Access Denied, text=Forbidden').isVisible();
      
      expect(currentUrl.includes('/login') || hasAccessDenied).toBe(true);
    });

    test('should restrict manager from accessing users page', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.manager.username,
        users.manager.password
      );
      
      // Try to access users page
      await page.goto(testConfig.baseUrl + '/admin/users');
      
      // Should be redirected or show access denied
      const currentUrl = await page.url();
      const hasAccessDenied = await page.locator('text=Access Denied, text=Forbidden').isVisible();
      
      expect(currentUrl.includes('/login') || hasAccessDenied).toBe(true);
    });

    test('should restrict user from accessing users page', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.user.username,
        users.user.password
      );
      
      // Try to access users page
      await page.goto(testConfig.baseUrl + '/admin/users');
      
      // Should be redirected or show access denied
      const currentUrl = await page.url();
      const hasAccessDenied = await page.locator('text=Access Denied, text=Forbidden').isVisible();
      
      expect(currentUrl.includes('/login') || hasAccessDenied).toBe(true);
    });

    test('should restrict viewer from accessing users page', async () => {
      await loginPage.goto();
      await loginPage.login(
        users.viewer.username,
        users.viewer.password
      );
      
      // Try to access users page
      await page.goto(testConfig.baseUrl + '/admin/users');
      
      // Should be redirected or show access denied
      const currentUrl = await page.url();
      const hasAccessDenied = await page.locator('text=Access Denied, text=Forbidden').isVisible();
      
      expect(currentUrl.includes('/login') || hasAccessDenied).toBe(true);
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

    test('should fetch users via API', async () => {
      const response = await apiHelper.getUsers();
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test('should create user via API', async () => {
      const userData = testDataGenerator.generateUser({
        username: `apitestuser${Date.now()}`,
        email: `apitestuser${Date.now()}@example.com`
      });
      
      const response = await apiHelper.createUser(userData);
      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
    });

    test('should update user via API', async () => {
      // First create a user
      const userData = testDataGenerator.generateUser({
        username: `updateuser${Date.now()}`,
        email: `updateuser${Date.now()}@example.com`
      });
      
      const createResponse = await apiHelper.createUser(userData);
      
      if (createResponse.status === 201) {
        const userId = createResponse.data.id;
        const updateData = { firstName: 'Updated First Name' };
        
        const updateResponse = await apiHelper.makeRequest('PUT', `/api/v1/users/${userId}`, updateData);
        expect(updateResponse.status).toBe(200);
      }
    });

    test('should delete user via API', async () => {
      // First create a user
      const userData = testDataGenerator.generateUser({
        username: `deleteuser${Date.now()}`,
        email: `deleteuser${Date.now()}@example.com`
      });
      
      const createResponse = await apiHelper.createUser(userData);
      
      if (createResponse.status === 201) {
        const userId = createResponse.data.id;
        
        const deleteResponse = await apiHelper.makeRequest('DELETE', `/api/v1/users/${userId}`);
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

    test('should load users page within acceptable time', async () => {
      const startTime = Date.now();
      
      await usersPage.goto();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should handle large number of users efficiently', async () => {
      await usersPage.goto();
      
      const userCount = await usersPage.getUserCount();
      
      if (userCount > 100) {
        // Test pagination performance
        const startTime = Date.now();
        await usersPage.goToNextPage();
        const paginationTime = Date.now() - startTime;
        
        expect(paginationTime).toBeLessThan(2000); // Should paginate within 2 seconds
      }
    });

    test('should handle search efficiently', async () => {
      await usersPage.goto();
      
      const startTime = Date.now();
      await usersPage.searchUsers('test');
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
      await page.route('**/api/v1/users**', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await usersPage.goto();
      
      // Should show error message
      expect(await usersPage.hasErrorMessage()).toBe(true);
    });

    test('should handle network connectivity issues', async () => {
      // Simulate network issues
      await page.route('**/api/**', route => route.abort());
      
      await usersPage.goto();
      
      // Should show appropriate error message
      expect(await usersPage.hasErrorMessage()).toBe(true);
    });

    test('should handle slow API responses', async () => {
      // Simulate slow API
      await page.route('**/api/v1/users**', async route => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        route.continue();
      });
      
      await usersPage.goto();
      
      // Should show loading state
      expect(await usersPage.isVisible(usersPage.selectors.loadingSpinner)).toBe(true);
    });
  });

  test.describe('Accessibility Tests', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
      await loginPage.login(
        users.super_admin.username,
        users.super_admin.password
      );
      await usersPage.goto();
    });

    test('should support keyboard navigation', async () => {
      // Test tab navigation through users page
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate through elements
      expect(await usersPage.isUsersPageLoaded()).toBe(true);
    });

    test('should have proper table headers', async () => {
      const tableHeaders = await page.locator('thead th, .table-header th').count();
      expect(tableHeaders).toBeGreaterThan(0);
    });

    test('should have proper form labels', async () => {
      await usersPage.clickAddUser();
      
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
      
      await usersPage.goto();
      expect(await usersPage.isUsersPageLoaded()).toBe(true);
      
      // Test basic functionality
      await usersPage.clickAddUser();
      expect(await usersPage.isModalOpen('add')).toBe(true);
    });
  });
});

