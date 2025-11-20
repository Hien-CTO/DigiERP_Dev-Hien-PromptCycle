/**
 * Base Page Object Model
 * Contains common functionality for all pages
 */
class BasePage {
  constructor(page) {
    this.page = page;
    this.baseUrl = 'http://localhost:3000';
  }

  /**
   * Navigate to a specific URL
   * @param {string} url - The URL to navigate to
   */
  async goto(url) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for an element to be visible
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Wait for an element to be hidden
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElementHidden(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  /**
   * Click an element
   * @param {string} selector - CSS selector
   */
  async click(selector) {
    await this.page.click(selector);
  }

  /**
   * Fill an input field
   * @param {string} selector - CSS selector
   * @param {string} value - Value to fill
   */
  async fill(selector, value) {
    await this.page.fill(selector, value);
  }

  /**
   * Get text content of an element
   * @param {string} selector - CSS selector
   * @returns {Promise<string>} Text content
   */
  async getText(selector) {
    return await this.page.textContent(selector);
  }

  /**
   * Check if element is visible
   * @param {string} selector - CSS selector
   * @returns {Promise<boolean>} True if visible
   */
  async isVisible(selector) {
    return await this.page.isVisible(selector);
  }

  /**
   * Check if element exists
   * @param {string} selector - CSS selector
   * @returns {Promise<boolean>} True if exists
   */
  async exists(selector) {
    return await this.page.locator(selector).count() > 0;
  }

  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   */
  async screenshot(name) {
    await this.page.screenshot({ 
      path: `./tests/reports/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for navigation to complete
   * @param {string} url - Expected URL pattern
   */
  async waitForNavigation(url) {
    await this.page.waitForURL(url);
  }

  /**
   * Get current URL
   * @returns {Promise<string>} Current URL
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Wait for API response
   * @param {string} url - API URL pattern
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForApiResponse(url, timeout = 10000) {
    return await this.page.waitForResponse(response => 
      response.url().includes(url) && response.status() === 200,
      { timeout }
    );
  }

  /**
   * Check for error messages
   * @returns {Promise<boolean>} True if error message is visible
   */
  async hasErrorMessage() {
    const errorSelectors = [
      '.error-message',
      '.alert-error',
      '.text-red-500',
      '[data-testid="error-message"]'
    ];
    
    for (const selector of errorSelectors) {
      if (await this.isVisible(selector)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get error message text
   * @returns {Promise<string>} Error message
   */
  async getErrorMessage() {
    const errorSelectors = [
      '.error-message',
      '.alert-error', 
      '.text-red-500',
      '[data-testid="error-message"]'
    ];
    
    for (const selector of errorSelectors) {
      if (await this.isVisible(selector)) {
        return await this.getText(selector);
      }
    }
    return '';
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoading() {
    // Wait for loading spinners to disappear
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '.animate-spin',
      '[data-testid="loading"]'
    ];
    
    for (const selector of loadingSelectors) {
      if (await this.exists(selector)) {
        await this.waitForElementHidden(selector);
      }
    }
  }
}

module.exports = BasePage;
