/**
 * Browser Helper for common browser operations
 */
class BrowserHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Take screenshot with timestamp
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   */
  async takeScreenshot(name, options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const path = `./tests/reports/screenshots/${filename}`;
    
    await this.page.screenshot({
      path,
      fullPage: options.fullPage || true,
      ...options
    });
    
    return path;
  }

  /**
   * Wait for page to be fully loaded
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForPageLoad(timeout = 30000) {
    await this.page.waitForLoadState('networkidle', { timeout });
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }

  /**
   * Scroll to element
   * @param {string} selector - CSS selector
   */
  async scrollToElement(selector) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Wait for element to be visible and stable
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElementStable(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
    
    // Wait for element to be stable (no movement)
    await this.page.waitForTimeout(500);
  }

  /**
   * Click element with retry
   * @param {string} selector - CSS selector
   * @param {number} retries - Number of retries
   */
  async clickWithRetry(selector, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.click(selector);
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fill input with retry
   * @param {string} selector - CSS selector
   * @param {string} value - Value to fill
   * @param {number} retries - Number of retries
   */
  async fillWithRetry(selector, value, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.fill(selector, '');
        await this.page.fill(selector, value);
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Wait for text to appear
   * @param {string} text - Text to wait for
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForText(text, timeout = 10000) {
    await this.page.waitForSelector(`text=${text}`, { timeout });
  }

  /**
   * Check if element exists
   * @param {string} selector - CSS selector
   * @returns {Promise<boolean>}
   */
  async elementExists(selector) {
    return await this.page.locator(selector).count() > 0;
  }

  /**
   * Get element count
   * @param {string} selector - CSS selector
   * @returns {Promise<number>}
   */
  async getElementCount(selector) {
    return await this.page.locator(selector).count();
  }

  /**
   * Wait for element count to change
   * @param {string} selector - CSS selector
   * @param {number} expectedCount - Expected count
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElementCount(selector, expectedCount, timeout = 10000) {
    await this.page.waitForFunction(
      ({ selector, expectedCount }) => {
        return document.querySelectorAll(selector).length === expectedCount;
      },
      { selector, expectedCount },
      { timeout }
    );
  }

  /**
   * Clear all cookies
   */
  async clearCookies() {
    await this.page.context().clearCookies();
  }

  /**
   * Clear local storage
   */
  async clearLocalStorage() {
    try {
      await this.page.evaluate(() => {
        if (typeof localStorage !== 'undefined' && localStorage) {
          localStorage.clear();
        }
      });
    } catch (error) {
      // Ignore localStorage errors - page might not be ready or in invalid state
      console.log('localStorage clear skipped:', error.message);
    }
  }

  /**
   * Clear session storage
   */
  async clearSessionStorage() {
    try {
      await this.page.evaluate(() => {
        if (typeof sessionStorage !== 'undefined' && sessionStorage) {
          sessionStorage.clear();
        }
      });
    } catch (error) {
      // Ignore sessionStorage errors - page might not be ready or in invalid state
      console.log('sessionStorage clear skipped:', error.message);
    }
  }

  /**
   * Clear all storage
   */
  async clearAllStorage() {
    // Clear cookies first (most reliable)
    await this.clearCookies();
    
    // Clear storage with error handling
    await this.clearLocalStorage();
    await this.clearSessionStorage();
    
    // Add small delay to prevent rate limiting
    await this.page.waitForTimeout(100);
  }

  /**
   * Get page performance metrics
   * @returns {Promise<Object>} Performance metrics
   */
  async getPerformanceMetrics() {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
  }

  /**
   * Monitor console errors
   * @returns {Promise<Array>} Console errors
   */
  async getConsoleErrors() {
    const errors = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location()
        });
      }
    });
    
    return errors;
  }

  /**
   * Monitor network requests
   * @param {string} urlPattern - URL pattern to monitor
   * @returns {Promise<Array>} Network requests
   */
  async monitorNetworkRequests(urlPattern) {
    const requests = [];
    
    this.page.on('request', request => {
      if (request.url().includes(urlPattern)) {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      }
    });
    
    return requests;
  }

  /**
   * Wait for specific network request
   * @param {string} urlPattern - URL pattern
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Response
   */
  async waitForNetworkRequest(urlPattern, timeout = 10000) {
    return await this.page.waitForResponse(
      response => response.url().includes(urlPattern),
      { timeout }
    );
  }

  /**
   * Simulate slow network
   * @param {number} latency - Latency in milliseconds
   */
  async simulateSlowNetwork(latency = 1000) {
    await this.page.route('**/*', route => {
      setTimeout(() => route.continue(), latency);
    });
  }

  /**
   * Block specific requests
   * @param {Array} patterns - URL patterns to block
   */
  async blockRequests(patterns) {
    await this.page.route('**/*', route => {
      const url = route.request().url();
      if (patterns.some(pattern => url.includes(pattern))) {
        route.abort();
      } else {
        route.continue();
      }
    });
  }

  /**
   * Get page title
   * @returns {Promise<string>} Page title
   */
  async getPageTitle() {
    return await this.page.title();
  }

  /**
   * Get current URL
   * @returns {Promise<string>} Current URL
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Check if page is responsive
   * @param {number} width - Viewport width
   * @param {number} height - Viewport height
   * @returns {Promise<boolean>}
   */
  async isResponsive(width, height) {
    await this.page.setViewportSize({ width, height });
    await this.page.waitForTimeout(1000);
    
    // Check if main elements are still visible
    const mainElements = [
      'header',
      'main',
      'nav',
      '.sidebar'
    ];
    
    for (const selector of mainElements) {
      if (await this.elementExists(selector)) {
        const isVisible = await this.page.locator(selector).isVisible();
        if (!isVisible) return false;
      }
    }
    
    return true;
  }

  /**
   * Test keyboard navigation
   * @param {Array} selectors - Selectors to test
   * @returns {Promise<boolean>}
   */
  async testKeyboardNavigation(selectors) {
    for (const selector of selectors) {
      if (await this.elementExists(selector)) {
        await this.page.focus(selector);
        await this.page.keyboard.press('Tab');
        await this.page.waitForTimeout(100);
      }
    }
    return true;
  }
}

module.exports = BrowserHelper;

