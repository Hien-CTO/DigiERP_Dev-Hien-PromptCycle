const BasePage = require('./base-page');

/**
 * Users Page Object Model
 */
class UsersPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/admin/users';
    
    // Selectors
    this.selectors = {
      // Header elements
      header: '.users-header, .page-header, [data-testid="users-header"]',
      pageTitle: 'h1, .page-title, [data-testid="page-title"]',
      
      // Action buttons
      addUserButton: 'button:has-text("Thêm người dùng"), button:has-text("Add User"), [data-testid="add-user-btn"]',
      importButton: 'button:has-text("Import"), [data-testid="import-btn"]',
      exportButton: 'button:has-text("Export"), [data-testid="export-btn"]',
      bulkActionsButton: 'button:has-text("Thao tác hàng loạt"), button:has-text("Bulk Actions"), [data-testid="bulk-actions-btn"]',
      
      // Search and filters
      searchInput: 'input[type="search"], input[placeholder*="Tìm kiếm"], input[placeholder*="Search"], [data-testid="search-input"]',
      roleFilter: 'select[name="role"], [data-testid="role-filter"]',
      statusFilter: 'select[name="status"], [data-testid="status-filter"]',
      departmentFilter: 'select[name="department"], [data-testid="department-filter"]',
      dateRangeFilter: 'input[name="dateRange"], [data-testid="date-range-filter"]',
      
      // Users table
      usersTable: '.users-table, table, [data-testid="users-table"]',
      tableHeader: 'thead, .table-header',
      tableBody: 'tbody, .table-body',
      userRows: 'tbody tr, .user-row',
      userRow: 'tbody tr:nth-child({index}), .user-row:nth-child({index})',
      
      // User row elements
      userName: 'td:nth-child(1), .user-name',
      userEmail: 'td:nth-child(2), .user-email',
      userRole: 'td:nth-child(3), .user-role',
      userStatus: 'td:nth-child(4), .user-status',
      userDepartment: 'td:nth-child(5), .user-department',
      lastLogin: 'td:nth-child(6), .last-login',
      createdAt: 'td:nth-child(7), .created-at',
      userActions: 'td:last-child, .user-actions',
      
      // Action buttons in table
      editButton: 'button:has-text("Sửa"), button:has-text("Edit"), [data-testid="edit-btn"]',
      deleteButton: 'button:has-text("Xóa"), button:has-text("Delete"), [data-testid="delete-btn"]',
      viewButton: 'button:has-text("Xem"), button:has-text("View"), [data-testid="view-btn"]',
      resetPasswordButton: 'button:has-text("Đặt lại mật khẩu"), button:has-text("Reset Password"), [data-testid="reset-password-btn"]',
      toggleStatusButton: 'button:has-text("Kích hoạt"), button:has-text("Deactivate"), [data-testid="toggle-status-btn"]',
      
      // Pagination
      pagination: '.pagination, [data-testid="pagination"]',
      pageNumbers: '.page-number, .pagination button',
      nextPageButton: 'button:has-text("Trang sau"), button:has-text("Next"), [data-testid="next-page"]',
      prevPageButton: 'button:has-text("Trang trước"), button:has-text("Previous"), [data-testid="prev-page"]',
      
      // Modals
      addUserModal: '.modal, [data-testid="add-user-modal"]',
      editUserModal: '.modal, [data-testid="edit-user-modal"]',
      deleteConfirmModal: '.modal, [data-testid="delete-confirm-modal"]',
      resetPasswordModal: '.modal, [data-testid="reset-password-modal"]',
      bulkActionsModal: '.modal, [data-testid="bulk-actions-modal"]',
      modalTitle: '.modal-title, .modal h2',
      modalCloseButton: '.modal-close, button:has-text("Đóng"), button:has-text("Close")',
      
      // Form fields
      usernameInput: 'input[name="username"], [data-testid="username-input"]',
      emailInput: 'input[name="email"], [data-testid="email-input"]',
      passwordInput: 'input[name="password"], [data-testid="password-input"]',
      confirmPasswordInput: 'input[name="confirmPassword"], [data-testid="confirm-password-input"]',
      firstNameInput: 'input[name="firstName"], [data-testid="first-name-input"]',
      lastNameInput: 'input[name="lastName"], [data-testid="last-name-input"]',
      phoneInput: 'input[name="phone"], [data-testid="phone-input"]',
      departmentSelect: 'select[name="department"], [data-testid="department-select"]',
      roleSelect: 'select[name="role"], [data-testid="role-select"]',
      statusSelect: 'select[name="status"], [data-testid="status-select"]',
      isActiveCheckbox: 'input[name="isActive"], [data-testid="is-active-checkbox"]',
      isVerifiedCheckbox: 'input[name="isVerified"], [data-testid="is-verified-checkbox"]',
      
      // Form buttons
      saveButton: 'button:has-text("Lưu"), button:has-text("Save"), [data-testid="save-btn"]',
      cancelButton: 'button:has-text("Hủy"), button:has-text("Cancel"), [data-testid="cancel-btn"]',
      confirmDeleteButton: 'button:has-text("Xác nhận"), button:has-text("Confirm"), [data-testid="confirm-delete-btn"]',
      resetPasswordConfirmButton: 'button:has-text("Đặt lại"), button:has-text("Reset"), [data-testid="reset-password-confirm-btn"]',
      applyBulkActionsButton: 'button:has-text("Áp dụng"), button:has-text("Apply"), [data-testid="apply-bulk-actions-btn"]',
      
      // Loading states
      loadingSpinner: '.loading, .spinner, .animate-spin, [data-testid="loading"]',
      
      // Messages
      successMessage: '.success-message, .alert-success, .text-green-500, [data-testid="success-message"]',
      errorMessage: '.error-message, .alert-error, .text-red-500, [data-testid="error-message"]',
      
      // Empty state
      emptyState: '.empty-state, [data-testid="empty-state"]',
      noUsersMessage: '.no-users, [data-testid="no-users"]',
      
      // Statistics cards
      totalUsersCard: '.total-users-card, [data-testid="total-users-card"]',
      activeUsersCard: '.active-users-card, [data-testid="active-users-card"]',
      inactiveUsersCard: '.inactive-users-card, [data-testid="inactive-users-card"]',
      newUsersCard: '.new-users-card, [data-testid="new-users-card"]',
      
      // Bulk actions
      selectAllCheckbox: 'input[type="checkbox"][data-select-all], [data-testid="select-all-checkbox"]',
      userCheckbox: 'input[type="checkbox"][data-user-id], [data-testid="user-checkbox"]',
      bulkActionSelect: 'select[name="bulkAction"], [data-testid="bulk-action-select"]',
      
      // User profile elements
      userAvatar: '.user-avatar, [data-testid="user-avatar"]',
      userInfo: '.user-info, [data-testid="user-info"]',
      userPermissions: '.user-permissions, [data-testid="user-permissions"]',
      userActivity: '.user-activity, [data-testid="user-activity"]'
    };
  }

  /**
   * Navigate to users page
   */
  async goto() {
    await super.goto(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for users page to load completely
   */
  async waitForPageLoad() {
    await this.waitForElement(this.selectors.header);
    await this.waitForLoading();
  }

  /**
   * Check if users page is loaded
   * @returns {Promise<boolean>}
   */
  async isUsersPageLoaded() {
    return await this.isVisible(this.selectors.header);
  }

  /**
   * Get page title
   * @returns {Promise<string>}
   */
  async getPageTitle() {
    return await this.getText(this.selectors.pageTitle);
  }

  /**
   * Click add user button
   */
  async clickAddUser() {
    await this.click(this.selectors.addUserButton);
    await this.waitForElement(this.selectors.addUserModal);
  }

  /**
   * Click bulk actions button
   */
  async clickBulkActions() {
    await this.click(this.selectors.bulkActionsButton);
    await this.waitForElement(this.selectors.bulkActionsModal);
  }

  /**
   * Search for users
   * @param {string} searchTerm - Search term
   */
  async searchUsers(searchTerm) {
    await this.fill(this.selectors.searchInput, searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForLoading();
  }

  /**
   * Filter users by role
   * @param {string} role - Role name
   */
  async filterByRole(role) {
    await this.page.selectOption(this.selectors.roleFilter, role);
    await this.waitForLoading();
  }

  /**
   * Filter users by status
   * @param {string} status - Status (active, inactive)
   */
  async filterByStatus(status) {
    await this.page.selectOption(this.selectors.statusFilter, status);
    await this.waitForLoading();
  }

  /**
   * Filter users by department
   * @param {string} department - Department name
   */
  async filterByDepartment(department) {
    await this.page.selectOption(this.selectors.departmentFilter, department);
    await this.waitForLoading();
  }

  /**
   * Get all user rows
   * @returns {Promise<Array>}
   */
  async getUserRows() {
    if (!(await this.isVisible(this.selectors.usersTable))) {
      return [];
    }
    
    const rows = await this.page.locator(this.selectors.userRows).all();
    return rows;
  }

  /**
   * Get user count
   * @returns {Promise<number>}
   */
  async getUserCount() {
    const rows = await this.getUserRows();
    return rows.length;
  }

  /**
   * Get user data from row
   * @param {number} rowIndex - Row index (1-based)
   * @returns {Promise<Object>}
   */
  async getUserData(rowIndex) {
    const rowSelector = this.selectors.userRow.replace('{index}', rowIndex);
    
    if (!(await this.exists(rowSelector))) {
      throw new Error(`User row ${rowIndex} not found`);
    }
    
    const row = this.page.locator(rowSelector);
    
    return {
      userName: await row.locator(this.selectors.userName).textContent(),
      userEmail: await row.locator(this.selectors.userEmail).textContent(),
      userRole: await row.locator(this.selectors.userRole).textContent(),
      userStatus: await row.locator(this.selectors.userStatus).textContent(),
      userDepartment: await row.locator(this.selectors.userDepartment).textContent(),
      lastLogin: await row.locator(this.selectors.lastLogin).textContent(),
      createdAt: await row.locator(this.selectors.createdAt).textContent()
    };
  }

  /**
   * Click edit button for user
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickEditUser(rowIndex) {
    const rowSelector = this.selectors.userRow.replace('{index}', rowIndex);
    const editBtn = this.page.locator(rowSelector).locator(this.selectors.editButton);
    await editBtn.click();
    await this.waitForElement(this.selectors.editUserModal);
  }

  /**
   * Click delete button for user
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickDeleteUser(rowIndex) {
    const rowSelector = this.selectors.userRow.replace('{index}', rowIndex);
    const deleteBtn = this.page.locator(rowSelector).locator(this.selectors.deleteButton);
    await deleteBtn.click();
    await this.waitForElement(this.selectors.deleteConfirmModal);
  }

  /**
   * Click reset password button for user
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickResetPassword(rowIndex) {
    const rowSelector = this.selectors.userRow.replace('{index}', rowIndex);
    const resetBtn = this.page.locator(rowSelector).locator(this.selectors.resetPasswordButton);
    await resetBtn.click();
    await this.waitForElement(this.selectors.resetPasswordModal);
  }

  /**
   * Click toggle status button for user
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickToggleStatus(rowIndex) {
    const rowSelector = this.selectors.userRow.replace('{index}', rowIndex);
    const toggleBtn = this.page.locator(rowSelector).locator(this.selectors.toggleStatusButton);
    await toggleBtn.click();
    await this.waitForLoading();
  }

  /**
   * Fill user form
   * @param {Object} userData - User data
   */
  async fillUserForm(userData) {
    if (userData.username) {
      await this.fill(this.selectors.usernameInput, userData.username);
    }
    
    if (userData.email) {
      await this.fill(this.selectors.emailInput, userData.email);
    }
    
    if (userData.password) {
      await this.fill(this.selectors.passwordInput, userData.password);
    }
    
    if (userData.confirmPassword) {
      await this.fill(this.selectors.confirmPasswordInput, userData.confirmPassword);
    }
    
    if (userData.firstName) {
      await this.fill(this.selectors.firstNameInput, userData.firstName);
    }
    
    if (userData.lastName) {
      await this.fill(this.selectors.lastNameInput, userData.lastName);
    }
    
    if (userData.phone) {
      await this.fill(this.selectors.phoneInput, userData.phone);
    }
    
    if (userData.department) {
      await this.page.selectOption(this.selectors.departmentSelect, userData.department);
    }
    
    if (userData.role) {
      await this.page.selectOption(this.selectors.roleSelect, userData.role);
    }
    
    if (userData.status) {
      await this.page.selectOption(this.selectors.statusSelect, userData.status);
    }
    
    if (userData.isActive !== undefined) {
      const checkbox = this.page.locator(this.selectors.isActiveCheckbox);
      const isChecked = await checkbox.isChecked();
      if (userData.isActive !== isChecked) {
        await checkbox.click();
      }
    }
    
    if (userData.isVerified !== undefined) {
      const checkbox = this.page.locator(this.selectors.isVerifiedCheckbox);
      const isChecked = await checkbox.isChecked();
      if (userData.isVerified !== isChecked) {
        await checkbox.click();
      }
    }
  }

  /**
   * Save user form
   */
  async saveUser() {
    await this.click(this.selectors.saveButton);
    await this.waitForLoading();
  }

  /**
   * Cancel user form
   */
  async cancelUser() {
    await this.click(this.selectors.cancelButton);
  }

  /**
   * Confirm delete user
   */
  async confirmDeleteUser() {
    await this.click(this.selectors.confirmDeleteButton);
    await this.waitForLoading();
  }

  /**
   * Confirm reset password
   */
  async confirmResetPassword() {
    await this.click(this.selectors.resetPasswordConfirmButton);
    await this.waitForLoading();
  }

  /**
   * Close modal
   */
  async closeModal() {
    if (await this.isVisible(this.selectors.modalCloseButton)) {
      await this.click(this.selectors.modalCloseButton);
    } else {
      await this.page.keyboard.press('Escape');
    }
  }

  /**
   * Check if modal is open
   * @param {string} modalType - Type of modal (add, edit, delete, reset, bulk)
   * @returns {Promise<boolean>}
   */
  async isModalOpen(modalType) {
    const modalSelectors = {
      add: this.selectors.addUserModal,
      edit: this.selectors.editUserModal,
      delete: this.selectors.deleteConfirmModal,
      reset: this.selectors.resetPasswordModal,
      bulk: this.selectors.bulkActionsModal
    };
    
    const selector = modalSelectors[modalType];
    return selector ? await this.isVisible(selector) : false;
  }

  /**
   * Select user checkbox
   * @param {number} rowIndex - Row index (1-based)
   */
  async selectUser(rowIndex) {
    const rowSelector = this.selectors.userRow.replace('{index}', rowIndex);
    const checkbox = this.page.locator(rowSelector).locator(this.selectors.userCheckbox);
    await checkbox.check();
  }

  /**
   * Select all users
   */
  async selectAllUsers() {
    await this.page.locator(this.selectors.selectAllCheckbox).check();
  }

  /**
   * Apply bulk action
   * @param {string} action - Bulk action (activate, deactivate, delete, changeRole)
   */
  async applyBulkAction(action) {
    await this.page.selectOption(this.selectors.bulkActionSelect, action);
    await this.click(this.selectors.applyBulkActionsButton);
    await this.waitForLoading();
  }

  /**
   * Check if success message is visible
   * @returns {Promise<boolean>}
   */
  async hasSuccessMessage() {
    return await this.isVisible(this.selectors.successMessage);
  }

  /**
   * Get success message
   * @returns {Promise<string>}
   */
  async getSuccessMessage() {
    return await this.getText(this.selectors.successMessage);
  }

  /**
   * Check if error message is visible
   * @returns {Promise<boolean>}
   */
  async hasErrorMessage() {
    return await this.isVisible(this.selectors.errorMessage);
  }

  /**
   * Get error message
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    return await this.getText(this.selectors.errorMessage);
  }

  /**
   * Check if users table is empty
   * @returns {Promise<boolean>}
   */
  async isTableEmpty() {
    return await this.isVisible(this.selectors.emptyState) || 
           await this.isVisible(this.selectors.noUsersMessage);
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>}
   */
  async getUserStats() {
    const stats = {};
    
    if (await this.isVisible(this.selectors.totalUsersCard)) {
      stats.totalUsers = await this.getText(this.selectors.totalUsersCard);
    }
    
    if (await this.isVisible(this.selectors.activeUsersCard)) {
      stats.activeUsers = await this.getText(this.selectors.activeUsersCard);
    }
    
    if (await this.isVisible(this.selectors.inactiveUsersCard)) {
      stats.inactiveUsers = await this.getText(this.selectors.inactiveUsersCard);
    }
    
    if (await this.isVisible(this.selectors.newUsersCard)) {
      stats.newUsers = await this.getText(this.selectors.newUsersCard);
    }
    
    return stats;
  }

  /**
   * Navigate to next page
   */
  async goToNextPage() {
    if (await this.isVisible(this.selectors.nextPageButton)) {
      await this.click(this.selectors.nextPageButton);
      await this.waitForLoading();
    }
  }

  /**
   * Navigate to previous page
   */
  async goToPreviousPage() {
    if (await this.isVisible(this.selectors.prevPageButton)) {
      await this.click(this.selectors.prevPageButton);
      await this.waitForLoading();
    }
  }

  /**
   * Get current page number
   * @returns {Promise<number>}
   */
  async getCurrentPageNumber() {
    const activePage = await this.page.locator('.pagination .active, .page-number.active').textContent();
    return activePage ? parseInt(activePage) : 1;
  }

  /**
   * Validate users page elements
   * @returns {Promise<{valid: boolean, missing: string[]}>}
   */
  async validatePageElements() {
    const requiredElements = [
      { selector: this.selectors.header, name: 'Header' },
      { selector: this.selectors.usersTable, name: 'Users Table' },
      { selector: this.selectors.searchInput, name: 'Search Input' }
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
   * Test user creation flow
   * @param {Object} userData - User data
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testCreateUser(userData) {
    try {
      await this.clickAddUser();
      await this.fillUserForm(userData);
      await this.saveUser();
      
      if (await this.hasSuccessMessage()) {
        return { success: true };
      } else if (await this.hasErrorMessage()) {
        return { success: false, error: await this.getErrorMessage() };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test user search
   * @param {string} searchTerm - Search term
   * @returns {Promise<{found: boolean, count: number}>}
   */
  async testSearch(searchTerm) {
    const initialCount = await this.getUserCount();
    await this.searchUsers(searchTerm);
    const searchCount = await this.getUserCount();
    
    return {
      found: searchCount > 0,
      count: searchCount
    };
  }
}

module.exports = UsersPage;

