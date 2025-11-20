const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login-page');
const ProductsPage = require('../../pages/products-page');
const ApiHelper = require('../../utils/api-helper');
const TestDataGenerator = require('../../utils/test-data-generator');
const BrowserHelper = require('../../utils/browser-helper');

// Load test configuration
const testConfig = require('../../config/test-config.json');
const users = require('../../config/users.json');

test.describe('Products Page Tests', () => {
  let loginPage;
  let productsPage;
  let apiHelper;
  let testDataGenerator;
  let browserHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    apiHelper = new ApiHelper(page);
    testDataGenerator = new TestDataGenerator();
    browserHelper = new BrowserHelper(page);
    
    // Skip clear storage to avoid localStorage error
    // await browserHelper.clearAllStorage();
  });

  test.describe('Products Page Access and Authentication', () => {
    test('should redirect to login when not authenticated', async () => {


      // await productsPage.goto();

      await page.goto('http://localhost:3000/admin/products', { 
        waitUntil: 'networkidle' 
      });

      await page.waitForURL("/login", {timeout})
      
      // Should be redirected to login page
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/login');

      const isLoginFormVisible = await loginPage.isLoginFormVisible();
      expect(isLoginFormVisible).toBe(true);
    });

    // test('should load products page after successful login', async () => {
    //   await loginPage.goto();
    //   await loginPage.login(
    //     users.super_admin.username,
    //     users.super_admin.password
    //   );
      
    //   await productsPage.goto();
    //   expect(await productsPage.isProductsPageLoaded()).toBe(true);
    // });

    // test('should display proper page title', async () => {
    //   await loginPage.goto();
    //   await loginPage.login(
    //     users.super_admin.username,
    //     users.super_admin.password
    //   );
      
    //   await productsPage.goto();
    //   const pageTitle = await productsPage.getPageTitle();
    //   expect(pageTitle).toContain('Products');
    // });
  });

  // test.describe('Products Page UI Elements', () => {
  //   test.beforeEach(async () => {
  //     await loginPage.goto();
  //     await loginPage.login(
  //       users.super_admin.username,
  //       users.super_admin.password
  //     );
  //     await productsPage.goto();
  //   });

  //   test('should display all required page elements', async () => {
  //     const validation = await productsPage.validatePageElements();
  //     expect(validation.valid).toBe(true);
  //     expect(validation.missing).toHaveLength(0);
  //   });

  //   test('should display products table', async () => {
  //     expect(await productsPage.isVisible(productsPage.selectors.productsTable)).toBe(true);
  //   });

  //   test('should display add product button', async () => {
  //     expect(await productsPage.isVisible(productsPage.selectors.addProductButton)).toBe(true);
  //   });

  //   test('should display search input', async () => {
  //     expect(await productsPage.isVisible(productsPage.selectors.searchInput)).toBe(true);
  //   });

  //   test('should display category filter', async () => {
  //     expect(await productsPage.isVisible(productsPage.selectors.categoryFilter)).toBe(true);
  //   });

  //   test('should be responsive on different screen sizes', async () => {
  //     // Test mobile viewport
  //     await page.setViewportSize({ width: 375, height: 667 });
  //     expect(await productsPage.isProductsPageLoaded()).toBe(true);
      
  //     // Test tablet viewport
  //     await page.setViewportSize({ width: 768, height: 1024 });
  //     expect(await productsPage.isProductsPageLoaded()).toBe(true);
      
  //     // Test desktop viewport
  //     await page.setViewportSize({ width: 1920, height: 1080 });
  //     expect(await productsPage.isProductsPageLoaded()).toBe(true);
  //   });
  // });

  // test.describe('Product CRUD Operations', () => {
  //   test.beforeEach(async () => {
  //     await loginPage.goto();
  //     await loginPage.login(
  //       users.super_admin.username,
  //       users.super_admin.password
  //     );
  //     await productsPage.goto();
  //   });

  //   test('should open add product modal', async () => {
  //     await productsPage.clickAddProduct();
  //     expect(await productsPage.isModalOpen('add')).toBe(true);
  //   });

  //   test('should create a new product successfully', async () => {
  //     const productData = testDataGenerator.generateProduct();
      
  //     const result = await productsPage.testCreateProduct(productData);
  //     expect(result.success).toBe(true);
      
  //     if (await productsPage.hasSuccessMessage()) {
  //       const successMessage = await productsPage.getSuccessMessage();
  //       expect(successMessage).toContain('success');
  //     }
  //   });

  //   test('should validate required fields when creating product', async () => {
  //     const invalidProduct = testDataGenerator.generateInvalidProduct('empty');
      
  //     await productsPage.clickAddProduct();
  //     await productsPage.fillProductForm(invalidProduct);
  //     await productsPage.saveProduct();
      
  //     // Should show validation error
  //     expect(await productsPage.hasErrorMessage()).toBe(true);
  //   });

  //   test('should validate price format when creating product', async () => {
  //     const invalidProduct = testDataGenerator.generateInvalidProduct('invalid_price');
      
  //     await productsPage.clickAddProduct();
  //     await productsPage.fillProductForm(invalidProduct);
  //     await productsPage.saveProduct();
      
  //     // Should show validation error
  //     expect(await productsPage.hasErrorMessage()).toBe(true);
  //   });

  //   test('should validate stock format when creating product', async () => {
  //     const invalidProduct = testDataGenerator.generateInvalidProduct('invalid_stock');
      
  //     await productsPage.clickAddProduct();
  //     await productsPage.fillProductForm(invalidProduct);
  //     await productsPage.saveProduct();
      
  //     // Should show validation error
  //     expect(await productsPage.hasErrorMessage()).toBe(true);
  //   });

  //   test('should close modal when cancel is clicked', async () => {
  //     await productsPage.clickAddProduct();
  //     expect(await productsPage.isModalOpen('add')).toBe(true);
      
  //     await productsPage.cancelProduct();
  //     expect(await productsPage.isModalOpen('add')).toBe(false);
  //   });

  //   test('should close modal when close button is clicked', async () => {
  //     await productsPage.clickAddProduct();
  //     expect(await productsPage.isModalOpen('add')).toBe(true);
      
  //     await productsPage.closeModal();
  //     expect(await productsPage.isModalOpen('add')).toBe(false);
  //   });
  // });

  // test.describe('Product Search and Filtering', () => {
  //   test.beforeEach(async () => {
  //     await loginPage.goto();
  //     await loginPage.login(
  //       users.super_admin.username,
  //       users.super_admin.password
  //     );
  //     await productsPage.goto();
  //   });

  //   test('should search for products by name', async () => {
  //     const searchTerm = testDataGenerator.generateSearchTerm('valid');
      
  //     const result = await productsPage.testSearch(searchTerm);
  //     expect(result.found).toBeDefined();
  //     expect(result.count).toBeGreaterThanOrEqual(0);
  //   });

  //   test('should handle empty search results', async () => {
  //     const searchTerm = testDataGenerator.generateSearchTerm('invalid');
      
  //     const result = await productsPage.testSearch(searchTerm);
  //     expect(result.found).toBe(false);
  //     expect(result.count).toBe(0);
  //   });

  //   test('should filter products by category', async () => {
  //     const category = testDataGenerator.getRandomCategory();
      
  //     await productsPage.filterByCategory(category);
      
  //     // Should show filtered results
  //     const productCount = await productsPage.getProductCount();
  //     expect(productCount).toBeGreaterThanOrEqual(0);
  //   });

  //   test('should filter products by status', async () => {
  //     const status = testDataGenerator.getRandomStatus();
      
  //     await productsPage.filterByStatus(status);
      
  //     // Should show filtered results
  //     const productCount = await productsPage.getProductCount();
  //     expect(productCount).toBeGreaterThanOrEqual(0);
  //   });

  //   test('should handle special characters in search', async () => {
  //     const specialSearch = testDataGenerator.generateSearchTerm('special');
      
  //     const result = await productsPage.testSearch(specialSearch);
  //     expect(result.found).toBeDefined();
  //   });
  // });

  // test.describe('Product Table Operations', () => {
  //   test.beforeEach(async () => {
  //     await loginPage.goto();
  //     await loginPage.login(
  //       users.super_admin.username,
  //       users.super_admin.password
  //     );
  //     await productsPage.goto();
  //   });

  //   test('should display product data in table', async () => {
  //     const productCount = await productsPage.getProductCount();
      
  //     if (productCount > 0) {
  //       const productData = await productsPage.getProductData(1);
  //       expect(productData.name).toBeDefined();
  //       expect(productData.sku).toBeDefined();
  //       expect(productData.category).toBeDefined();
  //       expect(productData.price).toBeDefined();
  //       expect(productData.stock).toBeDefined();
  //       expect(productData.status).toBeDefined();
  //     }
  //   });

  //   test('should open edit modal when edit button is clicked', async () => {
  //     const productCount = await productsPage.getProductCount();
      
  //     if (productCount > 0) {
  //       await productsPage.clickEditProduct(1);
  //       expect(await productsPage.isModalOpen('edit')).toBe(true);
  //     }
  //   });

  //   test('should open delete confirmation modal when delete button is clicked', async () => {
  //     const productCount = await productsPage.getProductCount();
      
  //     if (productCount > 0) {
  //       await productsPage.clickDeleteProduct(1);
  //       expect(await productsPage.isModalOpen('delete')).toBe(true);
  //     }
  //   });

  //   test('should handle empty product table', async () => {
  //     // Clear all products if possible
  //     await productsPage.searchProducts('nonexistent_product_12345');
      
  //     if (await productsPage.isTableEmpty()) {
  //       expect(await productsPage.isVisible(productsPage.selectors.emptyState)).toBe(true);
  //     }
  //   });
  // });

  // test.describe('Pagination Tests', () => {
  //   test.beforeEach(async () => {
  //     await loginPage.goto();
  //     await loginPage.login(
  //       users.super_admin.username,
  //       users.super_admin.password
  //     );
  //     await productsPage.goto();
  //   });

  //   test('should navigate to next page if available', async () => {
  //     if (await productsPage.isVisible(productsPage.selectors.nextPageButton)) {
  //       const currentPage = await productsPage.getCurrentPageNumber();
  //       await productsPage.goToNextPage();
        
  //       const newPage = await productsPage.getCurrentPageNumber();
  //       expect(newPage).toBeGreaterThan(currentPage);
  //     }
  //   });

  //   test('should navigate to previous page if available', async () => {
  //     // First go to next page if possible
  //     if (await productsPage.isVisible(productsPage.selectors.nextPageButton)) {
  //       await productsPage.goToNextPage();
        
  //       if (await productsPage.isVisible(productsPage.selectors.prevPageButton)) {
  //         const currentPage = await productsPage.getCurrentPageNumber();
  //         await productsPage.goToPreviousPage();
          
  //         const newPage = await productsPage.getCurrentPageNumber();
  //         expect(newPage).toBeLessThan(currentPage);
  //       }
  //     }
  //   });

  //   test('should display correct page numbers', async () => {
  //     const currentPage = await productsPage.getCurrentPageNumber();
  //     expect(currentPage).toBeGreaterThan(0);
  //   });
  // });

  // test.describe('Role-based Access Control', () => {
  //   test('should allow admin to create products', async () => {
  //     await loginPage.goto();
  //     await loginPage.login(
  //       users.admin.username,
  //       users.admin.password
  //     );
  //     await productsPage.goto();
      
  //     expect(await productsPage.isVisible(productsPage.selectors.addProductButton)).toBe(true);
  //   });

  //   test('should allow manager to create products', async () => {
  //     await loginPage.goto();
  //     await loginPage.login(
  //       users.manager.username,
  //       users.manager.password
  //     );
  //     await productsPage.goto();
      
  //     expect(await productsPage.isVisible(productsPage.selectors.addProductButton)).toBe(true);
  //   });

  //   test('should restrict user from creating products', async () => {
  //     await loginPage.goto();
  //     await loginPage.login(
  //       users.user.username,
  //       users.user.password
  //     );
  //     await productsPage.goto();
      
  //     const hasAddButton = await productsPage.isVisible(productsPage.selectors.addProductButton);
  //     if (hasAddButton) {
  //       const isEnabled = await productsPage.page.locator(productsPage.selectors.addProductButton).isEnabled();
  //       expect(isEnabled).toBe(false);
  //     }
  //   });

  //   test('should restrict viewer from creating products', async () => {
  //     await loginPage.goto();
  //     await loginPage.login(
  //       users.viewer.username,
  //       users.viewer.password
  //     );
  //     await productsPage.goto();
      
  //     expect(await productsPage.isVisible(productsPage.selectors.addProductButton)).toBe(false);
  //   });
  // });

  // test.describe('API Integration Tests', () => {
  //   test.beforeEach(async () => {
  //     await loginPage.goto();
  //     await loginPage.login(
  //       users.super_admin.username,
  //       users.super_admin.password
  //     );
  //   });

  //   test('should fetch products via API', async () => {
  //     const response = await apiHelper.getProducts();
  //     expect(response.status).toBe(200);
  //     expect(response.data).toBeDefined();
  //   });

  //   test('should create product via API', async () => {
  //     const productData = testDataGenerator.generateProduct();
      
  //     const response = await apiHelper.createProduct(productData);
  //     expect(response.status).toBe(201);
  //     expect(response.data).toBeDefined();
  //   });

  //   test('should update product via API', async () => {
  //     // First create a product
  //     const productData = testDataGenerator.generateProduct();
  //     const createResponse = await apiHelper.createProduct(productData);
      
  //     if (createResponse.status === 201) {
  //       const productId = createResponse.data.id;
  //       const updateData = { name: 'Updated Product Name' };
        
  //       const updateResponse = await apiHelper.updateProduct(productId, updateData);
  //       expect(updateResponse.status).toBe(200);
  //     }
  //   });

  //   test('should delete product via API', async () => {
  //     // First create a product
  //     const productData = testDataGenerator.generateProduct();
  //     const createResponse = await apiHelper.createProduct(productData);
      
  //     if (createResponse.status === 201) {
  //       const productId = createResponse.data.id;
        
  //       const deleteResponse = await apiHelper.deleteProduct(productId);
  //       expect(deleteResponse.status).toBe(200);
  //     }
  //   });
  // });

  // test.describe('Performance Tests', () => {
  //   test.beforeEach(async () => {
  //     await loginPage.goto();
  //     await loginPage.login(
  //       users.super_admin.username,
  //       users.super_admin.password
  //     );
  //   });

  //   test('should load products page within acceptable time', async () => {
  //     const startTime = Date.now();
      
  //     await productsPage.goto();
      
  //     const loadTime = Date.now() - startTime;
  //     expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
  //   });

  //   test('should handle large number of products efficiently', async () => {
  //     await productsPage.goto();
      
  //     const productCount = await productsPage.getProductCount();
      
  //     if (productCount > 100) {
  //       // Test pagination performance
  //       const startTime = Date.now();
  //       await productsPage.goToNextPage();
  //       const paginationTime = Date.now() - startTime;
        
  //       expect(paginationTime).toBeLessThan(2000); // Should paginate within 2 seconds
  //     }
  //   });

  //   test('should handle search efficiently', async () => {
  //     await productsPage.goto();
      
  //     const startTime = Date.now();
  //     await productsPage.searchProducts('test');
  //     const searchTime = Date.now() - startTime;
      
  //     expect(searchTime).toBeLessThan(3000); // Should search within 3 seconds
  //   });
  // });

  // test.describe('Error Handling Tests', () => {
  //   test.beforeEach(async () => {
  //     await loginPage.goto();
  //     await loginPage.login(
  //       users.super_admin.username,
  //       users.super_admin.password
  //     );
  //   });

  //   test('should handle API errors gracefully', async () => {
  //     // Block API requests to simulate error
  //     await page.route('**/api/v1/products**', route => 
  //       route.fulfill({ status: 500, body: 'Internal Server Error' })
  //     );
      
  //     await productsPage.goto();
      
  //     // Should show error message
  //     expect(await productsPage.hasErrorMessage()).toBe(true);
  //   });

  //   test('should handle network connectivity issues', async () => {
  //     // Simulate network issues
  //     await page.route('**/api/**', route => route.abort());
      
  //     await productsPage.goto();
      
  //     // Should show appropriate error message
  //     expect(await productsPage.hasErrorMessage()).toBe(true);
  //   });

  //   test('should handle slow API responses', async () => {
  //     // Simulate slow API
  //     await page.route('**/api/v1/products**', async route => {
  //       await new Promise(resolve => setTimeout(resolve, 10000));
  //       route.continue();
  //     });
      
  //     await productsPage.goto();
      
  //     // Should show loading state
  //     expect(await productsPage.isVisible(productsPage.selectors.loadingSpinner)).toBe(true);
  //   });
  // });

  // test.describe('Accessibility Tests', () => {
  //   test.beforeEach(async () => {
  //     await loginPage.goto();
  //     await loginPage.login(
  //       users.super_admin.username,
  //       users.super_admin.password
  //     );
  //     await productsPage.goto();
  //   });

  //   test('should support keyboard navigation', async () => {
  //     // Test tab navigation through products page
  //     await page.keyboard.press('Tab');
  //     await page.keyboard.press('Tab');
  //     await page.keyboard.press('Tab');
      
  //     // Should be able to navigate through elements
  //     expect(await productsPage.isProductsPageLoaded()).toBe(true);
  //   });

  //   test('should have proper table headers', async () => {
  //     const tableHeaders = await page.locator('thead th, .table-header th').count();
  //     expect(tableHeaders).toBeGreaterThan(0);
  //   });

  //   test('should have proper form labels', async () => {
  //     await productsPage.clickAddProduct();
      
  //     const labels = await page.locator('label').count();
  //     expect(labels).toBeGreaterThan(0);
  //   });
  // });

  // test.describe('Browser Compatibility Tests', () => {
  //   test('should work consistently across different browsers', async ({ browserName }) => {
  //     await loginPage.goto();
  //     await loginPage.login(
  //       users.super_admin.username,
  //       users.super_admin.password
  //     );
      
  //     await productsPage.goto();
  //     expect(await productsPage.isProductsPageLoaded()).toBe(true);
      
  //     // Test basic functionality
  //     await productsPage.clickAddProduct();
  //     expect(await productsPage.isModalOpen('add')).toBe(true);
  //   });
  // });
});

