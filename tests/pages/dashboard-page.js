const BasePage = require('./base-page');

/**
 * Dashboard Page Object Model
 */
class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/admin';
    
    // Selectors
    this.selectors = {
      // Header elements
      header: '.dashboard-header, header, [data-testid="dashboard-header"]',
      userMenu: '.user-menu, [data-testid="user-menu"]',
      logoutButton: 'button:has-text("Đăng xuất"), button:has-text("Logout"), [data-testid="logout-btn"]',
      
      // Navigation
      sidebar: '.sidebar, nav, [data-testid="sidebar"]',
      navItems: '.nav-item, .menu-item, [data-testid="nav-item"]',
      productsLink: 'a:has-text("Sản phẩm"), a:has-text("Products"), [href*="/products"]',
      inventoryLink: 'a:has-text("Kho"), a:has-text("Inventory"), [href*="/inventory"]',
      usersLink: 'a:has-text("Người dùng"), a:has-text("Users"), [href*="/users"]',
      reportsLink: 'a:has-text("Báo cáo"), a:has-text("Reports"), [href*="/reports"]',
      settingsLink: 'a:has-text("Cài đặt"), a:has-text("Settings"), [href*="/settings"]',
      
      // Dashboard content
      statsCards: '.stats-cards, .dashboard-cards, [data-testid="stats-cards"]',
      recentActivities: '.recent-activities, [data-testid="recent-activities"]',
      quickActions: '.quick-actions, [data-testid="quick-actions"]',
      charts: '.charts, .dashboard-charts, [data-testid="charts"]',
      
      // Loading states
      loadingSpinner: '.loading, .spinner, .animate-spin, [data-testid="loading"]',
      
      // Error messages
      errorMessage: '.error-message, .alert-error, .text-red-500, [data-testid="error-message"]',
      
      // Access denied
      accessDenied: '.access-denied, [data-testid="access-denied"]',
      
      // User info
      userInfo: '.user-info, [data-testid="user-info"]',
      userName: '.user-name, [data-testid="user-name"]',
      userRole: '.user-role, [data-testid="user-role"]'
    };
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await super.goto(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for dashboard to load completely
   */
  async waitForPageLoad() {
    await this.waitForElement(this.selectors.header);
    await this.waitForLoading();
  }

  /**
   * Check if dashboard is loaded
   * @returns {Promise<boolean>}
   */
  async isDashboardLoaded() {
    return await this.isVisible(this.selectors.header);
  }

  /**
   * Check if user is authenticated and on dashboard
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    const currentUrl = await this.getCurrentUrl();
    return currentUrl.includes('/admin') && !currentUrl.includes('/login');
  }

  /**
   * Get user information
   * @returns {Promise<{name?: string, role?: string}>}
   */
  async getUserInfo() {
    const userInfo = {};
    
    if (await this.isVisible(this.selectors.userName)) {
      userInfo.name = await this.getText(this.selectors.userName);
    }
    
    if (await this.isVisible(this.selectors.userRole)) {
      userInfo.role = await this.getText(this.selectors.userRole);
    }
    
    return userInfo;
  }

  /**
   * Logout from dashboard
   */
  async logout() {
    // Click user menu if it exists
    if (await this.isVisible(this.selectors.userMenu)) {
      await this.click(this.selectors.userMenu);
    }
    
    // Click logout button
    await this.click(this.selectors.logoutButton);
    
    // Wait for redirect to login page
    await this.page.waitForURL('**/login**');
  }

  /**
   * Navigate to products page
   */
  async navigateToProducts() {
    await this.click(this.selectors.productsLink);
    await this.page.waitForURL('**/products**');
  }

  /**
   * Navigate to inventory page
   */
  async navigateToInventory() {
    await this.click(this.selectors.inventoryLink);
    await this.page.waitForURL('**/inventory**');
  }

  /**
   * Navigate to users page
   */
  async navigateToUsers() {
    await this.click(this.selectors.usersLink);
    await this.page.waitForURL('**/users**');
  }

  /**
   * Navigate to reports page
   */
  async navigateToReports() {
    await this.click(this.selectors.reportsLink);
    await this.page.waitForURL('**/reports**');
  }

  /**
   * Navigate to settings page
   */
  async navigateToSettings() {
    await this.click(this.selectors.settingsLink);
    await this.page.waitForURL('**/settings**');
  }

  /**
   * Check if navigation item is visible
   * @param {string} itemName - Name of navigation item
   * @returns {Promise<boolean>}
   */
  async isNavigationItemVisible(itemName) {
    const itemSelectors = {
      'products': this.selectors.productsLink,
      'inventory': this.selectors.inventoryLink,
      'users': this.selectors.usersLink,
      'reports': this.selectors.reportsLink,
      'settings': this.selectors.settingsLink
    };
    
    const selector = itemSelectors[itemName.toLowerCase()];
    return selector ? await this.isVisible(selector) : false;
  }

  /**
   * Check if user has access to specific module
   * @param {string} moduleName - Name of module
   * @returns {Promise<{hasAccess: boolean, error?: string}>}
   */
  async checkModuleAccess(moduleName) {
    try {
      switch (moduleName.toLowerCase()) {
        case 'products':
          await this.navigateToProducts();
          break;
        case 'inventory':
          await this.navigateToInventory();
          break;
        case 'users':
          await this.navigateToUsers();
          break;
        case 'reports':
          await this.navigateToReports();
          break;
        case 'settings':
          await this.navigateToSettings();
          break;
        default:
          return { hasAccess: false, error: 'Unknown module' };
      }
      
      // Check if access denied message appears
      if (await this.isVisible(this.selectors.accessDenied)) {
        return { hasAccess: false, error: 'Access denied' };
      }
      
      return { hasAccess: true };
    } catch (error) {
      return { hasAccess: false, error: error.message };
    }
  }

  /**
   * Get dashboard statistics
   * @returns {Promise<Array>}
   */
  async getDashboardStats() {
    if (!(await this.isVisible(this.selectors.statsCards))) {
      return [];
    }
    
    const statsElements = await this.page.locator(this.selectors.statsCards + ' .stat-card, .card').all();
    const stats = [];
    
    for (const element of statsElements) {
      const title = await element.locator('.stat-title, .card-title, h3').textContent();
      const value = await element.locator('.stat-value, .card-value, .number').textContent();
      stats.push({ title, value });
    }
    
    return stats;
  }

  /**
   * Get recent activities
   * @returns {Promise<Array>}
   */
  async getRecentActivities() {
    if (!(await this.isVisible(this.selectors.recentActivities))) {
      return [];
    }
    
    const activityElements = await this.page.locator(this.selectors.recentActivities + ' .activity-item, .activity').all();
    const activities = [];
    
    for (const element of activityElements) {
      const text = await element.textContent();
      activities.push(text);
    }
    
    return activities;
  }

  /**
   * Get quick actions
   * @returns {Promise<Array>}
   */
  async getQuickActions() {
    if (!(await this.isVisible(this.selectors.quickActions))) {
      return [];
    }
    
    const actionElements = await this.page.locator(this.selectors.quickActions + ' button, .action-btn').all();
    const actions = [];
    
    for (const element of actionElements) {
      const text = await element.textContent();
      actions.push(text);
    }
    
    return actions;
  }

  /**
   * Validate dashboard elements
   * @returns {Promise<{valid: boolean, missing: string[]}>}
   */
  async validateDashboardElements() {
    const requiredElements = [
      { selector: this.selectors.header, name: 'Header' },
      { selector: this.selectors.sidebar, name: 'Sidebar' }
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
   * Check if sidebar is collapsed
   * @returns {Promise<boolean>}
   */
  async isSidebarCollapsed() {
    const sidebar = this.page.locator(this.selectors.sidebar);
    const classes = await sidebar.getAttribute('class');
    return classes ? classes.includes('collapsed') : false;
  }

  /**
   * Toggle sidebar
   */
  async toggleSidebar() {
    const toggleButton = this.page.locator('[data-testid="sidebar-toggle"], .sidebar-toggle');
    if (await this.exists('[data-testid="sidebar-toggle"], .sidebar-toggle')) {
      await this.click('[data-testid="sidebar-toggle"], .sidebar-toggle');
    }
  }

  /**
   * Check if there are any error messages
   * @returns {Promise<boolean>}
   */
  async hasErrors() {
    return await this.hasErrorMessage();
  }

  /**
   * Get error messages
   * @returns {Promise<string>}
   */
  async getErrors() {
    return await this.getErrorMessage();
  }

  /**
   * Wait for dashboard data to load
   */
  async waitForDashboardData() {
    // Wait for stats cards to load
    if (await this.exists(this.selectors.statsCards)) {
      await this.waitForElement(this.selectors.statsCards);
    }
    
    // Wait for any loading to complete
    await this.waitForLoading();
  }

  /**
   * Refresh dashboard
   */
  async refresh() {
    await this.page.reload();
    await this.waitForPageLoad();
  }
}

module.exports = DashboardPage;

