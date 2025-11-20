/**
 * API Helper for testing API endpoints
 */
class ApiHelper {
  constructor(page) {
    this.page = page;
    // Use API Gateway instead of direct user-service call
    this.baseUrl = process.env.API_GATEWAY_URL || 'http://localhost:4000';
    this.accessToken = null;
    this.refreshToken = null;
  }

  /**
   * Set authentication tokens
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   */
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  /**
   * Clear authentication tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  /**
   * Make API request
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} Response data
   */
  async makeRequest(method, endpoint, data = null, headers = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    if (this.accessToken) {
      requestHeaders.Authorization = `Bearer ${this.accessToken}`;
    }

    const options = {
      method,
      headers: requestHeaders
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.data = data;
    }

    try {
      const response = await this.page.request[method.toLowerCase()](url, options);
      return {
        status: response.status(),
        data: await response.json(),
        headers: response.headers()
      };
    } catch (error) {
      return {
        status: 0,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Login via API
   * @param {string} usernameOrEmail - Username or email
   * @param {string} password - Password
   * @returns {Promise<Object>} Login response
   */
  async login(usernameOrEmail, password) {
    // API Gateway route: /api/auth/login (not /api/v1/auth/login)
    const response = await this.makeRequest('POST', '/api/auth/login', {
      usernameOrEmail,
      password
    });

    if (response.status === 200 && response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  /**
   * Get user profile
   * @returns {Promise<Object>} User profile response
   */
  async getUserProfile() {
    // API Gateway route: /api/auth/me
    return await this.makeRequest('GET', '/api/auth/me');
  }

  /**
   * Refresh access token
   * @returns {Promise<Object>} Refresh response
   */
  async refreshToken() {
    if (!this.refreshToken) {
      return { status: 400, error: 'No refresh token available' };
    }

    // API Gateway route: /api/auth/refresh
    const response = await this.makeRequest('POST', '/api/auth/refresh', {
      refreshToken: this.refreshToken
    });

    if (response.status === 200 && response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  /**
   * Logout
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    // API Gateway route: /api/auth/logout
    const response = await this.makeRequest('POST', '/api/auth/logout');
    this.clearTokens();
    return response;
  }

  /**
   * Get products
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Products response
   */
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    // API Gateway route: /api/products
    const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;
    return await this.makeRequest('GET', endpoint);
  }

  /**
   * Create product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Create response
   */
  async createProduct(productData) {
    // API Gateway route: /api/products
    return await this.makeRequest('POST', '/api/products', productData);
  }

  /**
   * Update product
   * @param {string} productId - Product ID
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Update response
   */
  async updateProduct(productId, productData) {
    // API Gateway route: /api/products/:id
    return await this.makeRequest('PUT', `/api/products/${productId}`, productData);
  }

  /**
   * Delete product
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteProduct(productId) {
    // API Gateway route: /api/products/:id
    return await this.makeRequest('DELETE', `/api/products/${productId}`);
  }

  /**
   * Get users
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Users response
   */
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    // API Gateway route: /api/users
    const endpoint = `/api/users${queryString ? `?${queryString}` : ''}`;
    return await this.makeRequest('GET', endpoint);
  }

  /**
   * Create user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Create response
   */
  async createUser(userData) {
    // API Gateway route: /api/users
    return await this.makeRequest('POST', '/api/users', userData);
  }

  /**
   * Get inventory
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Inventory response
   */
  async getInventory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    // API Gateway route: /api/inventory
    const endpoint = `/api/inventory${queryString ? `?${queryString}` : ''}`;
    return await this.makeRequest('GET', endpoint);
  }

  /**
   * Check API health
   * @returns {Promise<Object>} Health response
   */
  async checkHealth() {
    // API Gateway route: /health
    return await this.makeRequest('GET', '/health');
  }

  /**
   * Wait for API response
   * @param {string} endpoint - API endpoint
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Response
   */
  async waitForApiResponse(endpoint, timeout = 10000) {
    try {
      const response = await this.page.waitForResponse(
        response => response.url().includes(endpoint) && response.status() === 200,
        { timeout }
      );
      return {
        status: response.status(),
        data: await response.json()
      };
    } catch (error) {
      return {
        status: 0,
        error: error.message
      };
    }
  }

  /**
   * Test API endpoint accessibility
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @returns {Promise<{accessible: boolean, status?: number, error?: string}>}
   */
  async testEndpointAccessibility(endpoint, method = 'GET') {
    try {
      const response = await this.makeRequest(method, endpoint);
      return {
        accessible: response.status > 0 && response.status < 500,
        status: response.status,
        error: response.error
      };
    } catch (error) {
      return {
        accessible: false,
        error: error.message
      };
    }
  }

  /**
   * Get API response time
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @returns {Promise<{responseTime: number, status: number}>}
   */
  async getResponseTime(endpoint, method = 'GET') {
    const startTime = Date.now();
    const response = await this.makeRequest(method, endpoint);
    const responseTime = Date.now() - startTime;
    
    return {
      responseTime,
      status: response.status
    };
  }
}

module.exports = ApiHelper;

