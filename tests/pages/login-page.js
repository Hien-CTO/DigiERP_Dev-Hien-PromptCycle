const BasePage = require('./base-page');

/**
 * Login Page Object Model
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/login';
    
    // Selectors
    this.selectors = {
      usernameInput: 'input[name="usernameOrEmail"], input[type="text"]',
      passwordInput: 'input[name="password"], input[type="password"]',
      loginButton: 'button[type="submit"], button:has-text("Đăng nhập"), button:has-text("Login")',
      errorMessage: '.error-message, .alert-error, .text-red-500, [data-testid="error-message"]',
      loadingSpinner: '.loading, .spinner, .animate-spin, [data-testid="loading"]',
      form: 'form',
      rememberMe: 'input[type="checkbox"]',
      forgotPassword: 'a:has-text("Quên mật khẩu"), a:has-text("Forgot Password")',
      registerLink: 'a:has-text("Đăng ký"), a:has-text("Register")'
    };
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await super.goto(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for login page to load completely
   */
  async waitForPageLoad() {
    await this.waitForElement(this.selectors.form);
    await this.waitForElement(this.selectors.usernameInput);
    await this.waitForElement(this.selectors.passwordInput);
    await this.waitForElement(this.selectors.loginButton);
  }

  /**
   * Perform login with username/email and password
   * @param {string} usernameOrEmail - Username or email
   * @param {string} password - Password
   * @param {boolean} rememberMe - Whether to check remember me
   */
  async login(usernameOrEmail, password, rememberMe = false) {
    // Clear and fill username/email
    await this.page.fill(this.selectors.usernameInput, '');
    await this.fill(this.selectors.usernameInput, usernameOrEmail);
    
    // Clear and fill password
    await this.page.fill(this.selectors.passwordInput, '');
    await this.fill(this.selectors.passwordInput, password);
    
    // Check remember me if requested
    if (rememberMe) {
      await this.click(this.selectors.rememberMe);
    }
    
    // Click login button
    await this.click(this.selectors.loginButton);
    
    // Wait for navigation or error
    try {
      await this.page.waitForURL('**/admin**', { timeout: 10000 });
    } catch (error) {
      // If navigation doesn't happen, check for error message
      if (await this.hasErrorMessage()) {
        throw new Error(`Login failed: ${await this.getErrorMessage()}`);
      }
      throw error;
    }
  }

  /**
   * Attempt login and return result without throwing
   * @param {string} usernameOrEmail - Username or email
   * @param {string} password - Password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async attemptLogin(usernameOrEmail, password) {
    try {
      await this.login(usernameOrEmail, password);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Login failed'
      };
    }
  }

  /**
   * Check if login form is visible
   * @returns {Promise<boolean>}
   */
  async isLoginFormVisible() {
    return await this.isVisible(this.selectors.form);
  }

  /**
   * Check if error message is displayed
   * @returns {Promise<boolean>}
   */
  async hasLoginError() {
    return await this.hasErrorMessage();
  }

  /**
   * Get login error message
   * @returns {Promise<string>}
   */
  async getLoginErrorMessage() {
    return await this.getErrorMessage();
  }

  /**
   * Check if login button is enabled
   * @returns {Promise<boolean>}
   */
  async isLoginButtonEnabled() {
    const button = this.page.locator(this.selectors.loginButton);
    return await button.isEnabled();
  }

  /**
   * Check if loading spinner is visible
   * @returns {Promise<boolean>}
   */
  async isLoading() {
    return await this.isVisible(this.selectors.loadingSpinner);
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete() {
    await this.waitForLoading();
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.click(this.selectors.forgotPassword);
  }

  /**
   * Click register link
   */
  async clickRegister() {
    await this.click(this.selectors.registerLink);
  }

  /**
   * Clear login form
   */
  async clearForm() {
    await this.page.fill(this.selectors.usernameInput, '');
    await this.page.fill(this.selectors.passwordInput, '');
  }

  /**
   * Validate login form elements
   * @returns {Promise<{valid: boolean, missing: string[]}>}
   */
  async validateFormElements() {
    const requiredElements = [
      { selector: this.selectors.usernameInput, name: 'Username Input' },
      { selector: this.selectors.passwordInput, name: 'Password Input' },
      { selector: this.selectors.loginButton, name: 'Login Button' }
    ];

    const missing = [];
    
    for (const element of requiredElements) {
      if (!(await this.exists(element.selector))) {
        missing.push(element.name);
      }
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Test form validation with empty fields
   * @returns {Promise<{usernameError: boolean, passwordError: boolean}>}
   */
  async testFormValidation() {
    // Clear form
    await this.clearForm();
    
    // Try to submit empty form
    await this.click(this.selectors.loginButton);
    
    // Wait a bit for validation messages
    await this.page.waitForTimeout(1000);
    
    return {
      usernameError: await this.hasErrorMessage(),
      passwordError: await this.hasErrorMessage()
    };
  }

  /**
   * Get page title
   * @returns {Promise<string>}
   */
  async getPageTitle() {
    return await this.page.title();
  }

  /**
   * Check if current page is login page
   * @returns {Promise<boolean>}
   */
  async isOnLoginPage() {
    const currentUrl = await this.getCurrentUrl();
    return currentUrl.includes('/login');
  }
}

module.exports = LoginPage;

