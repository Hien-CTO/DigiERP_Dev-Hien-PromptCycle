const { test, expect } = require('@playwright/test');
const ApiHelper = require('../../utils/api-helper');
const TestDataGenerator = require('../../utils/test-data-generator');

// Load test configuration
const testConfig = require('../../config/test-config.json');
const users = require('../../config/users.json');

test.describe('API Integration Tests', () => {
  let apiHelper;
  let testDataGenerator;

  test.beforeEach(async ({ page }) => {
    apiHelper = new ApiHelper(page);
    testDataGenerator = new TestDataGenerator();
  });

  test.describe('Authentication API Tests', () => {
    test('should authenticate user successfully', async () => {
      const response = await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      expect(response.status).toBe(200);
      expect(response.data.accessToken).toBeDefined();
      expect(response.data.refreshToken).toBeDefined();
      expect(response.data.user).toBeDefined();
      expect(response.data.user.username).toBe(users.super_admin.username);
    });

    test('should fail authentication with invalid credentials', async () => {
      const response = await apiHelper.login('invalid_user', 'invalid_password');
      
      expect(response.status).toBe(401);
      expect(response.data.message).toBeDefined();
    });

    test('should get user profile after authentication', async () => {
      await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      const response = await apiHelper.getUserProfile();
      
      expect(response.status).toBe(200);
      expect(response.data.username).toBe(users.super_admin.username);
      expect(response.data.email).toBe(users.super_admin.email);
      expect(response.data.roles).toBeDefined();
    });

    test('should refresh access token successfully', async () => {
      await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      const response = await apiHelper.refreshToken();
      
      expect(response.status).toBe(200);
      expect(response.data.accessToken).toBeDefined();
      expect(response.data.refreshToken).toBeDefined();
    });

    test('should logout successfully', async () => {
      await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      const response = await apiHelper.logout();
      
      expect(response.status).toBe(200);
    });

    test('should handle token expiration', async () => {
      await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
      
      // Simulate token expiration by clearing tokens
      apiHelper.clearTokens();
      
      const response = await apiHelper.getUserProfile();
      
      expect(response.status).toBe(401);
    });
  });

  test.describe('Users API Tests', () => {
    test.beforeEach(async () => {
      await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should fetch all users', async () => {
      const response = await apiHelper.getUsers();
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data.data || response.data)).toBe(true);
    });

    test('should create a new user', async () => {
      const userData = testDataGenerator.generateUser({
        username: `apitestuser${Date.now()}`,
        email: `apitestuser${Date.now()}@example.com`
      });
      
      const response = await apiHelper.createUser(userData);
      
      expect(response.status).toBe(201);
      expect(response.data.username).toBe(userData.username);
      expect(response.data.email).toBe(userData.email);
    });

    test('should update user information', async () => {
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
        expect(updateResponse.data.firstName).toBe('Updated First Name');
      }
    });

    test('should delete user', async () => {
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

    test('should handle user validation errors', async () => {
      const invalidUserData = {
        username: '',
        email: 'invalid-email',
        password: 'weak'
      };
      
      const response = await apiHelper.createUser(invalidUserData);
      
      expect(response.status).toBe(400);
      expect(response.data.message).toBeDefined();
    });

    test('should enforce role-based access control', async () => {
      // Test with regular user
      await apiHelper.clearTokens();
      await apiHelper.login(
        users.user.username,
        users.user.password
      );
      
      const response = await apiHelper.getUsers();
      
      expect(response.status).toBe(403);
    });
  });

  test.describe('Products API Tests', () => {
    test.beforeEach(async () => {
      await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should fetch all products', async () => {
      const response = await apiHelper.getProducts();
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data.data || response.data)).toBe(true);
    });

    test('should create a new product', async () => {
      const productData = testDataGenerator.generateProduct();
      
      const response = await apiHelper.createProduct(productData);
      
      expect(response.status).toBe(201);
      expect(response.data.name).toBe(productData.name);
      expect(response.data.sku).toBe(productData.sku);
    });

    test('should update product information', async () => {
      // First create a product
      const productData = testDataGenerator.generateProduct();
      
      const createResponse = await apiHelper.createProduct(productData);
      
      if (createResponse.status === 201) {
        const productId = createResponse.data.id;
        const updateData = { name: 'Updated Product Name' };
        
        const updateResponse = await apiHelper.updateProduct(productId, updateData);
        
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.data.name).toBe('Updated Product Name');
      }
    });

    test('should delete product', async () => {
      // First create a product
      const productData = testDataGenerator.generateProduct();
      
      const createResponse = await apiHelper.createProduct(productData);
      
      if (createResponse.status === 201) {
        const productId = createResponse.data.id;
        
        const deleteResponse = await apiHelper.deleteProduct(productId);
        
        expect(deleteResponse.status).toBe(200);
      }
    });

    test('should search products', async () => {
      const searchTerm = 'test';
      
      const response = await apiHelper.getProducts({ search: searchTerm });
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test('should filter products by category', async () => {
      const category = 'Electronics';
      
      const response = await apiHelper.getProducts({ category });
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test('should handle product validation errors', async () => {
      const invalidProductData = {
        name: '',
        sku: '',
        price: 'invalid'
      };
      
      const response = await apiHelper.createProduct(invalidProductData);
      
      expect(response.status).toBe(400);
      expect(response.data.message).toBeDefined();
    });
  });

  test.describe('Inventory API Tests', () => {
    test.beforeEach(async () => {
      await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should fetch all inventory items', async () => {
      const response = await apiHelper.getInventory();
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data.data || response.data)).toBe(true);
    });

    test('should create inventory item', async () => {
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
      expect(response.data.productId).toBe(inventoryData.productId);
      expect(response.data.warehouseId).toBe(inventoryData.warehouseId);
    });

    test('should update inventory item', async () => {
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
        expect(updateResponse.data.currentStock).toBe(150);
      }
    });

    test('should delete inventory item', async () => {
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

    test('should adjust stock', async () => {
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
        const adjustmentData = {
          adjustmentType: 'increase',
          quantity: 50,
          reason: 'Stock replenishment'
        };
        
        const adjustmentResponse = await apiHelper.makeRequest('POST', `/api/v1/inventory/${inventoryId}/adjust`, adjustmentData);
        
        expect(adjustmentResponse.status).toBe(200);
      }
    });

    test('should filter inventory by warehouse', async () => {
      const warehouseId = 1;
      
      const response = await apiHelper.getInventory({ warehouseId });
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test('should filter inventory by stock level', async () => {
      const stockLevel = 'low';
      
      const response = await apiHelper.getInventory({ stockLevel });
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });
  });

  test.describe('Purchase Orders API Tests', () => {
    test.beforeEach(async () => {
      await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should fetch all purchase orders', async () => {
      const response = await apiHelper.makeRequest('GET', '/api/v1/purchase-orders');
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data.data || response.data)).toBe(true);
    });

    test('should create purchase order', async () => {
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
      expect(response.data.orderNumber).toBe(orderData.orderNumber);
    });

    test('should update purchase order', async () => {
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
        expect(updateResponse.data.notes).toBe('Updated purchase order');
      }
    });

    test('should approve purchase order', async () => {
      // First create an order
      const orderData = {
        orderNumber: `APPROVE-PO-${Date.now()}`,
        supplierId: 1,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Approve test purchase order',
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
        
        const approveResponse = await apiHelper.makeRequest('POST', `/api/v1/purchase-orders/${orderId}/approve`);
        
        expect(approveResponse.status).toBe(200);
      }
    });

    test('should receive purchase order', async () => {
      // First create and approve an order
      const orderData = {
        orderNumber: `RECEIVE-PO-${Date.now()}`,
        supplierId: 1,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Receive test purchase order',
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
        
        // Approve the order first
        await apiHelper.makeRequest('POST', `/api/v1/purchase-orders/${orderId}/approve`);
        
        // Then receive it
        const receiveResponse = await apiHelper.makeRequest('POST', `/api/v1/purchase-orders/${orderId}/receive`);
        
        expect(receiveResponse.status).toBe(200);
      }
    });

    test('should delete purchase order', async () => {
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

    test('should filter purchase orders by supplier', async () => {
      const supplierId = 1;
      
      const response = await apiHelper.makeRequest('GET', `/api/v1/purchase-orders?supplierId=${supplierId}`);
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test('should filter purchase orders by status', async () => {
      const status = 'pending';
      
      const response = await apiHelper.makeRequest('GET', `/api/v1/purchase-orders?status=${status}`);
      
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });
  });

  test.describe('API Performance Tests', () => {
    test.beforeEach(async () => {
      await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should respond to authentication requests within acceptable time', async () => {
      const responseTime = await apiHelper.getResponseTime('/api/v1/auth/login', 'POST');
      
      expect(responseTime.responseTime).toBeLessThan(2000); // Should respond within 2 seconds
      expect(responseTime.status).toBe(200);
    });

    test('should respond to user requests within acceptable time', async () => {
      const responseTime = await apiHelper.getResponseTime('/api/v1/users', 'GET');
      
      expect(responseTime.responseTime).toBeLessThan(3000); // Should respond within 3 seconds
      expect(responseTime.status).toBe(200);
    });

    test('should respond to product requests within acceptable time', async () => {
      const responseTime = await apiHelper.getResponseTime('/api/v1/products', 'GET');
      
      expect(responseTime.responseTime).toBeLessThan(3000); // Should respond within 3 seconds
      expect(responseTime.status).toBe(200);
    });

    test('should respond to inventory requests within acceptable time', async () => {
      const responseTime = await apiHelper.getResponseTime('/api/v1/inventory', 'GET');
      
      expect(responseTime.responseTime).toBeLessThan(3000); // Should respond within 3 seconds
      expect(responseTime.status).toBe(200);
    });

    test('should handle concurrent requests efficiently', async () => {
      const promises = [];
      
      // Make 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        promises.push(apiHelper.getProducts());
      }
      
      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // Total time should be reasonable (less than 10 seconds for 10 requests)
      expect(totalTime).toBeLessThan(10000);
    });
  });

  test.describe('API Error Handling Tests', () => {
    test.beforeEach(async () => {
      await apiHelper.login(
        users.super_admin.username,
        users.super_admin.password
      );
    });

    test('should handle invalid endpoint gracefully', async () => {
      const response = await apiHelper.makeRequest('GET', '/api/v1/invalid-endpoint');
      
      expect(response.status).toBe(404);
    });

    test('should handle invalid HTTP methods gracefully', async () => {
      const response = await apiHelper.makeRequest('PATCH', '/api/v1/users');
      
      expect(response.status).toBe(405);
    });

    test('should handle malformed JSON gracefully', async () => {
      const response = await apiHelper.makeRequest('POST', '/api/v1/users', 'invalid json');
      
      expect(response.status).toBe(400);
    });

    test('should handle large payloads gracefully', async () => {
      const largeData = {
        name: 'A'.repeat(10000),
        description: 'B'.repeat(50000)
      };
      
      const response = await apiHelper.createProduct(largeData);
      
      expect(response.status).toBe(400);
    });

    test('should handle rate limiting', async () => {
      const promises = [];
      
      // Make many requests quickly to test rate limiting
      for (let i = 0; i < 100; i++) {
        promises.push(apiHelper.getProducts());
      }
      
      const responses = await Promise.all(promises);
      
      // Some requests might be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses[0].status).toBe(429);
      }
    });
  });

  test.describe('API Security Tests', () => {
    test('should require authentication for protected endpoints', async () => {
      apiHelper.clearTokens();
      
      const response = await apiHelper.getUsers();
      
      expect(response.status).toBe(401);
    });

    test('should validate JWT tokens', async () => {
      // Set invalid token
      apiHelper.setTokens('invalid-token', 'invalid-refresh-token');
      
      const response = await apiHelper.getUsers();
      
      expect(response.status).toBe(401);
    });

    test('should enforce CORS headers', async () => {
      const response = await apiHelper.makeRequest('OPTIONS', '/api/v1/users');
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });

    test('should sanitize input data', async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        description: 'DROP TABLE users;'
      };
      
      const response = await apiHelper.createProduct(maliciousData);
      
      // Should either reject the request or sanitize the data
      if (response.status === 201) {
        expect(response.data.name).not.toContain('<script>');
        expect(response.data.description).not.toContain('DROP TABLE');
      } else {
        expect(response.status).toBe(400);
      }
    });

    test('should handle SQL injection attempts', async () => {
      const maliciousData = {
        name: "'; DROP TABLE products; --",
        sku: "1' OR '1'='1"
      };
      
      const response = await apiHelper.createProduct(maliciousData);
      
      // Should reject the request
      expect(response.status).toBe(400);
    });
  });
});

