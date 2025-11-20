const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login-page');
const CustomerPage = require('../../pages/customer-page');
const ApiHelper = require('../../utils/api-helper');
const TestDataGenerator = require('../../utils/test-data-generator');
const BrowserHelper = require('../../utils/browser-helper');

// Load test configuration
const testConfig = require('../../config/test-config.json');
const users = require('../../config/users.json');

test.describe('Customer Management Tests', () => {
  let loginPage;
  let customerPage;
  let apiHelper;
  let testDataGenerator;
  let browserHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    customerPage = new CustomerPage(page);
    apiHelper = new ApiHelper(page);
    testDataGenerator = new TestDataGenerator();
    browserHelper = new BrowserHelper(page);
    
    // Login as admin first
    await loginPage.goto();
    await loginPage.login(users.admin.username, users.admin.password);
    await expect(loginPage.page).toHaveURL(/.*dashboard/);
    
    // Skip clear storage to avoid localStorage error
    // await browserHelper.clearAllStorage();
  });

  test.describe('Customer CRUD Operations', () => {
    test('should create a new customer', async () => {
      await customerPage.goto();
      
      const customerData = testDataGenerator.generateCustomer({
        name: 'Test Customer',
        email: 'test@customer.com',
        phone: '0123456789'
      });
      
      await customerPage.clickCreateCustomer();
      await customerPage.fillCustomerForm(customerData);
      await customerPage.saveCustomer();
      
      await expect(customerPage.getSuccessMessage()).toBeVisible();
      await expect(customerPage.getCustomerInList(customerData.name)).toBeVisible();
    });

    test('should edit an existing customer', async () => {
      await customerPage.goto();
      
      // Create a customer first
      const customerData = testDataGenerator.generateCustomer({
        name: 'Edit Test Customer',
        email: 'edit@customer.com'
      });
      
      await customerPage.createCustomer(customerData);
      
      // Edit the customer
      const updatedData = {
        ...customerData,
        name: 'Updated Customer Name',
        email: 'updated@customer.com'
      };
      
      await customerPage.editCustomer(customerData.name);
      await customerPage.fillCustomerForm(updatedData);
      await customerPage.saveCustomer();
      
      await expect(customerPage.getSuccessMessage()).toBeVisible();
      await expect(customerPage.getCustomerInList(updatedData.name)).toBeVisible();
    });

    test('should delete a customer', async () => {
      await customerPage.goto();
      
      const customerData = testDataGenerator.generateCustomer({
        name: 'Delete Test Customer',
        email: 'delete@customer.com'
      });
      
      await customerPage.createCustomer(customerData);
      await customerPage.deleteCustomer(customerData.name);
      
      await expect(customerPage.getConfirmationDialog()).toBeVisible();
      await customerPage.confirmDelete();
      
      await expect(customerPage.getSuccessMessage()).toBeVisible();
      await expect(customerPage.getCustomerInList(customerData.name)).not.toBeVisible();
    });

    test('should view customer details', async () => {
      await customerPage.goto();
      
      const customerData = testDataGenerator.generateCustomer({
        name: 'View Test Customer',
        email: 'view@customer.com'
      });
      
      await customerPage.createCustomer(customerData);
      await customerPage.viewCustomer(customerData.name);
      
      await expect(customerPage.getCustomerDetailsModal()).toBeVisible();
      await expect(customerPage.getCustomerName()).toContain(customerData.name);
      await expect(customerPage.getCustomerEmail()).toContain(customerData.email);
    });
  });

  test.describe('Customer Search and Filtering', () => {
    test('should search customers by name', async () => {
      await customerPage.goto();
      
      const customerData = testDataGenerator.generateCustomer({
        name: 'Search Test Customer',
        email: 'search@customer.com'
      });
      
      await customerPage.createCustomer(customerData);
      await customerPage.searchCustomers('Search Test');
      
      await expect(customerPage.getCustomerInList(customerData.name)).toBeVisible();
    });

    test('should filter customers by status', async () => {
      await customerPage.goto();
      
      await customerPage.filterByStatus('Active');
      
      const customers = await customerPage.getCustomerList();
      for (const customer of customers) {
        await expect(customer.status).toBe('Active');
      }
    });

    test('should filter customers by group', async () => {
      await customerPage.goto();
      
      await customerPage.filterByGroup('VIP');
      
      const customers = await customerPage.getCustomerList();
      for (const customer of customers) {
        await expect(customer.group).toBe('VIP');
      }
    });
  });

  test.describe('Customer Validation', () => {
    test('should validate required fields', async () => {
      await customerPage.goto();
      await customerPage.clickCreateCustomer();
      await customerPage.saveCustomer();
      
      await expect(customerPage.getFieldError('name')).toBeVisible();
      await expect(customerPage.getFieldError('email')).toBeVisible();
    });

    test('should validate email format', async () => {
      await customerPage.goto();
      await customerPage.clickCreateCustomer();
      
      const invalidData = {
        name: 'Test Customer',
        email: 'invalid-email',
        phone: '0123456789'
      };
      
      await customerPage.fillCustomerForm(invalidData);
      await customerPage.saveCustomer();
      
      await expect(customerPage.getFieldError('email')).toBeVisible();
    });

    test('should validate phone format', async () => {
      await customerPage.goto();
      await customerPage.clickCreateCustomer();
      
      const invalidData = {
        name: 'Test Customer',
        email: 'test@customer.com',
        phone: 'invalid-phone'
      };
      
      await customerPage.fillCustomerForm(invalidData);
      await customerPage.saveCustomer();
      
      await expect(customerPage.getFieldError('phone')).toBeVisible();
    });
  });

  test.describe('Customer Groups Management', () => {
    test('should create a new customer group', async () => {
      await customerPage.goto();
      
      const groupData = {
        name: 'Test Group',
        description: 'Test customer group',
        discount: 10
      };
      
      await customerPage.goToGroupsTab();
      await customerPage.clickCreateGroup();
      await customerPage.fillGroupForm(groupData);
      await customerPage.saveGroup();
      
      await expect(customerPage.getSuccessMessage()).toBeVisible();
      await expect(customerPage.getGroupInList(groupData.name)).toBeVisible();
    });

    test('should assign customer to group', async () => {
      await customerPage.goto();
      
      // Create a group first
      const groupData = {
        name: 'VIP Group',
        description: 'VIP customers',
        discount: 20
      };
      
      await customerPage.goToGroupsTab();
      await customerPage.createGroup(groupData);
      
      // Create a customer
      const customerData = testDataGenerator.generateCustomer({
        name: 'VIP Customer',
        email: 'vip@customer.com'
      });
      
      await customerPage.goToCustomersTab();
      await customerPage.createCustomer(customerData);
      
      // Assign customer to group
      await customerPage.assignCustomerToGroup(customerData.name, groupData.name);
      
      await expect(customerPage.getSuccessMessage()).toBeVisible();
      await expect(customerPage.getCustomerGroup(customerData.name)).toContain(groupData.name);
    });
  });

  test.describe('Customer Contracts', () => {
    test('should create a contract for customer', async () => {
      await customerPage.goto();
      
      const customerData = testDataGenerator.generateCustomer({
        name: 'Contract Customer',
        email: 'contract@customer.com'
      });
      
      await customerPage.createCustomer(customerData);
      
      const contractData = {
        title: 'Test Contract',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        value: 100000,
        terms: 'Standard terms and conditions'
      };
      
      await customerPage.createContract(customerData.name, contractData);
      
      await expect(customerPage.getSuccessMessage()).toBeVisible();
      await expect(customerPage.getContractInList(contractData.title)).toBeVisible();
    });

    test('should view contract details', async () => {
      await customerPage.goto();
      
      const customerData = testDataGenerator.generateCustomer({
        name: 'Contract View Customer',
        email: 'contractview@customer.com'
      });
      
      await customerPage.createCustomer(customerData);
      
      const contractData = {
        title: 'View Test Contract',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        value: 50000
      };
      
      await customerPage.createContract(customerData.name, contractData);
      await customerPage.viewContract(contractData.title);
      
      await expect(customerPage.getContractDetailsModal()).toBeVisible();
      await expect(customerPage.getContractTitle()).toContain(contractData.title);
      await expect(customerPage.getContractValue()).toContain('50,000');
    });
  });

  test.describe('Customer API Integration', () => {
    test('should create customer via API', async () => {
      const customerData = testDataGenerator.generateCustomer({
        name: 'API Test Customer',
        email: 'api@customer.com',
        phone: '0123456789'
      });
      
      const response = await apiHelper.createCustomer(customerData);
      
      expect(response.status).toBe(201);
      expect(response.data.name).toBe(customerData.name);
      expect(response.data.email).toBe(customerData.email);
    });

    test('should get customer list via API', async () => {
      const response = await apiHelper.getCustomers();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('should update customer via API', async () => {
      const customerData = testDataGenerator.generateCustomer({
        name: 'API Update Customer',
        email: 'apiupdate@customer.com'
      });
      
      const createResponse = await apiHelper.createCustomer(customerData);
      const customerId = createResponse.data.id;
      
      const updateData = {
        ...customerData,
        name: 'Updated API Customer'
      };
      
      const updateResponse = await apiHelper.updateCustomer(customerId, updateData);
      
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.name).toBe(updateData.name);
    });

    test('should delete customer via API', async () => {
      const customerData = testDataGenerator.generateCustomer({
        name: 'API Delete Customer',
        email: 'apidelete@customer.com'
      });
      
      const createResponse = await apiHelper.createCustomer(customerData);
      const customerId = createResponse.data.id;
      
      const deleteResponse = await apiHelper.deleteCustomer(customerId);
      
      expect(deleteResponse.status).toBe(204);
    });
  });

  test.describe('Customer Permissions', () => {
    test('should restrict customer access for non-admin users', async () => {
      // Login as regular user
      await loginPage.logout();
      await loginPage.login(users.user.username, users.user.password);
      
      await customerPage.goto();
      
      // Should be redirected or see access denied
      await expect(customerPage.getAccessDeniedMessage()).toBeVisible();
    });

    test('should allow customer management for admin users', async () => {
      await customerPage.goto();
      
      // Should be able to access customer management
      await expect(customerPage.getCustomerList()).toBeVisible();
      await expect(customerPage.getCreateButton()).toBeVisible();
    });
  });
});
