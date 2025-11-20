/**
 * Test Data Generator
 * Generates test data for various test scenarios
 */

class TestDataGenerator {
  constructor() {
    this.counter = 1;
  }

  /**
   * Generate unique product data
   * @param {Object} overrides - Override default values
   * @returns {Object} Product data
   */
  generateProduct(overrides = {}) {
    const timestamp = Date.now();
    const counter = this.counter++;
    
    return {
      name: overrides.name || `Test Product ${counter}`,
      description: overrides.description || `Test product description ${counter}`,
      sku: overrides.sku || `TEST-${timestamp}-${counter}`,
      price: overrides.price || (Math.random() * 1000000 + 10000).toString(),
      stock: overrides.stock || Math.floor(Math.random() * 100 + 1).toString(),
      category: overrides.category || this.getRandomCategory(),
      status: overrides.status || this.getRandomStatus(),
      ...overrides
    };
  }

  /**
   * Generate invalid product data for testing validation
   * @param {string} type - Type of invalid data
   * @returns {Object} Invalid product data
   */
  generateInvalidProduct(type = 'empty') {
    const baseData = {
      name: '',
      description: '',
      sku: '',
      price: '',
      stock: '',
      category: '',
      status: ''
    };

    switch (type) {
      case 'empty':
        return baseData;
      
      case 'invalid_price':
        return {
          ...baseData,
          name: 'Test Product',
          price: 'invalid_price',
          stock: '50'
        };
      
      case 'invalid_stock':
        return {
          ...baseData,
          name: 'Test Product',
          price: '100000',
          stock: 'invalid_stock'
        };
      
      case 'missing_required':
        return {
          name: 'Test Product',
          description: 'Test description',
          // Missing SKU, price, stock
        };
      
      default:
        return baseData;
    }
  }

  /**
   * Generate user data
   * @param {Object} overrides - Override default values
   * @returns {Object} User data
   */
  generateUser(overrides = {}) {
    const timestamp = Date.now();
    const counter = this.counter++;
    
    return {
      username: overrides.username || `testuser${counter}`,
      email: overrides.email || `testuser${counter}@example.com`,
      password: overrides.password || 'TestPassword123!',
      firstName: overrides.firstName || `Test${counter}`,
      lastName: overrides.lastName || `User${counter}`,
      phone: overrides.phone || `012345678${counter}`,
      role: overrides.role || 'user',
      ...overrides
    };
  }

  /**
   * Generate search terms
   * @param {string} type - Type of search term
   * @returns {string} Search term
   */
  generateSearchTerm(type = 'valid') {
    const searchTerms = {
      valid: ['product', 'test', 'sample', 'demo'],
      invalid: ['xyz123', 'nonexistent', 'invalid'],
      special: ['@#$%', '   ', '\\n\\t'],
      empty: ['']
    };

    const terms = searchTerms[type] || searchTerms.valid;
    return terms[Math.floor(Math.random() * terms.length)];
  }

  /**
   * Get random category
   * @returns {string} Category name
   */
  getRandomCategory() {
    const categories = [
      'Electronics',
      'Clothing',
      'Books',
      'Home & Garden',
      'Sports',
      'Automotive',
      'Health & Beauty',
      'Toys & Games'
    ];
    
    return categories[Math.floor(Math.random() * categories.length)];
  }

  /**
   * Get random status
   * @returns {string} Status value
   */
  getRandomStatus() {
    const statuses = ['active', 'inactive', 'draft', 'archived'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  /**
   * Generate test scenarios
   * @param {string} module - Module name
   * @returns {Array} Test scenarios
   */
  generateTestScenarios(module) {
    const scenarios = {
      products: [
        {
          name: 'Create valid product',
          data: this.generateProduct(),
          expectedResult: 'success'
        },
        {
          name: 'Create product with empty name',
          data: this.generateInvalidProduct('empty'),
          expectedResult: 'validation_error'
        },
        {
          name: 'Create product with invalid price',
          data: this.generateInvalidProduct('invalid_price'),
          expectedResult: 'validation_error'
        },
        {
          name: 'Search for existing product',
          searchTerm: this.generateSearchTerm('valid'),
          expectedResult: 'found'
        },
        {
          name: 'Search for non-existing product',
          searchTerm: this.generateSearchTerm('invalid'),
          expectedResult: 'not_found'
        }
      ],
      
      auth: [
        {
          name: 'Login with valid credentials',
          username: 'admin',
          password: 'admin123',
          expectedResult: 'success'
        },
        {
          name: 'Login with invalid credentials',
          username: 'invalid',
          password: 'invalid',
          expectedResult: 'error'
        },
        {
          name: 'Login with empty credentials',
          username: '',
          password: '',
          expectedResult: 'validation_error'
        }
      ],
      
      dashboard: [
        {
          name: 'Access dashboard as admin',
          role: 'admin',
          expectedResult: 'success'
        },
        {
          name: 'Access dashboard as user',
          role: 'user',
          expectedResult: 'success'
        },
        {
          name: 'Access restricted module',
          role: 'user',
          module: 'users',
          expectedResult: 'access_denied'
        }
      ]
    };

    return scenarios[module] || [];
  }

  /**
   * Generate performance test data
   * @param {number} count - Number of items to generate
   * @returns {Array} Array of test data
   */
  generateBulkData(count = 10) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(this.generateProduct());
    }
    return data;
  }

  /**
   * Generate edge case data
   * @returns {Object} Edge case data
   */
  generateEdgeCaseData() {
    return {
      veryLongName: 'A'.repeat(1000),
      veryLongDescription: 'B'.repeat(5000),
      specialCharacters: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      unicodeCharacters: '测试产品 🚀 ñáéíóú',
      veryLargeNumber: '999999999999999999',
      negativeNumber: '-100',
      zero: '0',
      decimal: '99.99'
    };
  }

  /**
   * Reset counter
   */
  resetCounter() {
    this.counter = 1;
  }
}

module.exports = TestDataGenerator;

