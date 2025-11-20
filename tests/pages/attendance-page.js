const BasePage = require('./base-page');

/**
 * Attendance Page Object Model
 * Handles all attendance-related operations: check-in, check-out, view history, edit, approve/reject
 */
class AttendancePage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/admin/hr/attendance';
    
    // Selectors
    this.selectors = {
      // Main page elements
      pageHeader: 'h1:has-text("Chấm công"), h1:has-text("Attendance"), .page-header',
      checkInButton: 'button:has-text("Check In"), button:has-text("Chấm công vào"), [data-testid="check-in-btn"]',
      checkOutButton: 'button:has-text("Check Out"), button:has-text("Chấm công ra"), [data-testid="check-out-btn"]',
      
      // Attendance status
      attendanceStatus: '.attendance-status, [data-testid="attendance-status"]',
      checkInTime: '.check-in-time, [data-testid="check-in-time"]',
      checkOutTime: '.check-out-time, [data-testid="check-out-time"]',
      workingHours: '.working-hours, [data-testid="working-hours"]',
      overtimeHours: '.overtime-hours, [data-testid="overtime-hours"]',
      
      // Attendance history table
      historyTable: '.attendance-table, table, [data-testid="attendance-table"]',
      historyRows: '.attendance-table tbody tr, table tbody tr, [data-testid="attendance-row"]',
      dateColumn: 'td:nth-child(1), [data-testid="date"]',
      checkInColumn: 'td:nth-child(2), [data-testid="check-in"]',
      checkOutColumn: 'td:nth-child(3), [data-testid="check-out"]',
      hoursColumn: 'td:nth-child(4), [data-testid="hours"]',
      statusColumn: 'td:nth-child(5), [data-testid="status"]',
      
      // Filters
      dateRangeFilter: 'input[type="date"], [data-testid="date-range"]',
      statusFilter: 'select[name="status"], [data-testid="status-filter"]',
      searchInput: 'input[type="search"], input[placeholder*="Tìm kiếm"], [data-testid="search"]',
      
      // Edit attendance
      editButton: 'button:has-text("Edit"), button:has-text("Chỉnh sửa"), [data-testid="edit-btn"]',
      editModal: '.modal, .edit-modal, [data-testid="edit-modal"]',
      editCheckInTime: 'input[name="checkInTime"], input[type="time"][name*="check-in"], [data-testid="edit-check-in"]',
      editCheckOutTime: 'input[name="checkOutTime"], input[type="time"][name*="check-out"], [data-testid="edit-check-out"]',
      editReason: 'textarea[name="reason"], textarea[placeholder*="Lý do"], [data-testid="edit-reason"]',
      saveEditButton: 'button:has-text("Save"), button:has-text("Lưu"), [data-testid="save-edit"]',
      cancelEditButton: 'button:has-text("Cancel"), button:has-text("Hủy"), [data-testid="cancel-edit"]',
      
      // Approval section (for managers)
      approvalSection: '.approval-section, [data-testid="approval-section"]',
      pendingApprovals: '.pending-approvals, [data-testid="pending-approvals"]',
      approveButton: 'button:has-text("Approve"), button:has-text("Phê duyệt"), [data-testid="approve-btn"]',
      rejectButton: 'button:has-text("Reject"), button:has-text("Từ chối"), [data-testid="reject-btn"]',
      rejectionReason: 'textarea[name="rejectionReason"], textarea[placeholder*="Lý do từ chối"], [data-testid="rejection-reason"]',
      confirmRejectButton: 'button:has-text("Confirm Reject"), button:has-text("Xác nhận từ chối"), [data-testid="confirm-reject"]',
      
      // Messages
      successMessage: '.success-message, .alert-success, .text-green-500, [data-testid="success-message"]',
      errorMessage: '.error-message, .alert-error, .text-red-500, [data-testid="error-message"]',
      infoMessage: '.info-message, .alert-info, [data-testid="info-message"]',
      
      // Late/Early leave indicators
      lateIndicator: '.late-indicator, .text-warning, [data-testid="late"]',
      earlyLeaveIndicator: '.early-leave-indicator, [data-testid="early-leave"]',
      lateReason: '.late-reason, [data-testid="late-reason"]',
      earlyLeaveReason: '.early-leave-reason, [data-testid="early-leave-reason"]',
      
      // Loading
      loadingSpinner: '.loading, .spinner, .animate-spin, [data-testid="loading"]',
      
      // Empty state
      emptyState: '.empty-state, .no-data, [data-testid="empty-state"]',
      
      // Export button
      exportButton: 'button:has-text("Export"), button:has-text("Xuất"), [data-testid="export-btn"]'
    };
  }

  /**
   * Navigate to attendance page
   */
  async goto() {
    await super.goto(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for attendance page to load completely
   */
  async waitForPageLoad() {
    // Wait for either check-in button or history table to appear
    try {
      await Promise.race([
        this.waitForElement(this.selectors.checkInButton, 5000),
        this.waitForElement(this.selectors.historyTable, 5000),
        this.waitForElement(this.selectors.pageHeader, 5000)
      ]);
    } catch (error) {
      // Page might still be loading, continue
    }
    await this.waitForLoading();
  }

  /**
   * Perform check-in
   * @param {string} reason - Optional late reason
   * @returns {Promise<{success: boolean, message?: string, checkInTime?: string}>}
   */
  async checkIn(reason = null) {
    try {
      // Check if already checked in
      if (await this.isCheckedIn()) {
        return {
          success: false,
          message: 'Đã check-in trong ngày hôm nay'
        };
      }

      // Click check-in button
      await this.click(this.selectors.checkInButton);
      
      // Wait for confirmation or error
      await this.page.waitForTimeout(2000);
      
      // If late reason is required
      if (reason && await this.exists(this.selectors.lateReason)) {
        await this.fill(this.selectors.lateReason, reason);
        await this.click('button:has-text("Confirm"), button:has-text("Xác nhận")');
      }
      
      // Wait for success message or check status
      await this.page.waitForTimeout(2000);
      
      const success = await this.hasSuccessMessage() || await this.isCheckedIn();
      const message = success ? await this.getSuccessMessage() : await this.getErrorMessage();
      const checkInTime = success ? await this.getCheckInTime() : null;
      
      return {
        success,
        message,
        checkInTime
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Check-in failed'
      };
    }
  }

  /**
   * Perform check-out
   * @param {string} reason - Optional early leave reason
   * @returns {Promise<{success: boolean, message?: string, checkOutTime?: string, workingHours?: number}>}
   */
  async checkOut(reason = null) {
    try {
      // Check if already checked in
      if (!(await this.isCheckedIn())) {
        return {
          success: false,
          message: 'Chưa check-in trong ngày hôm nay'
        };
      }

      // Check if already checked out
      if (await this.isCheckedOut()) {
        return {
          success: false,
          message: 'Đã check-out trong ngày hôm nay'
        };
      }

      // Click check-out button
      await this.click(this.selectors.checkOutButton);
      
      // Wait for confirmation
      await this.page.waitForTimeout(2000);
      
      // If early leave reason is required
      if (reason && await this.exists(this.selectors.earlyLeaveReason)) {
        await this.fill(this.selectors.earlyLeaveReason, reason);
        await this.click('button:has-text("Confirm"), button:has-text("Xác nhận")');
      }
      
      // Wait for success message or check status
      await this.page.waitForTimeout(2000);
      
      const success = await this.hasSuccessMessage() || await this.isCheckedOut();
      const message = success ? await this.getSuccessMessage() : await this.getErrorMessage();
      const checkOutTime = success ? await this.getCheckOutTime() : null;
      const workingHours = success ? await this.getWorkingHours() : null;
      
      return {
        success,
        message,
        checkOutTime,
        workingHours
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Check-out failed'
      };
    }
  }

  /**
   * Check if user is checked in today
   * @returns {Promise<boolean>}
   */
  async isCheckedIn() {
    // Check if check-out button is visible (means already checked in)
    if (await this.exists(this.selectors.checkOutButton)) {
      return true;
    }
    // Check if check-in time is displayed
    if (await this.exists(this.selectors.checkInTime)) {
      const time = await this.getText(this.selectors.checkInTime);
      return time && time.trim().length > 0;
    }
    return false;
  }

  /**
   * Check if user is checked out today
   * @returns {Promise<boolean>}
   */
  async isCheckedOut() {
    if (await this.exists(this.selectors.checkOutTime)) {
      const time = await this.getText(this.selectors.checkOutTime);
      return time && time.trim().length > 0;
    }
    return false;
  }

  /**
   * Get check-in time
   * @returns {Promise<string>}
   */
  async getCheckInTime() {
    if (await this.exists(this.selectors.checkInTime)) {
      return await this.getText(this.selectors.checkInTime);
    }
    return null;
  }

  /**
   * Get check-out time
   * @returns {Promise<string>}
   */
  async getCheckOutTime() {
    if (await this.exists(this.selectors.checkOutTime)) {
      return await this.getText(this.selectors.checkOutTime);
    }
    return null;
  }

  /**
   * Get working hours
   * @returns {Promise<number>}
   */
  async getWorkingHours() {
    if (await this.exists(this.selectors.workingHours)) {
      const text = await this.getText(this.selectors.workingHours);
      const match = text.match(/(\d+\.?\d*)/);
      return match ? parseFloat(match[1]) : 0;
    }
    return 0;
  }

  /**
   * Get overtime hours
   * @returns {Promise<number>}
   */
  async getOvertimeHours() {
    if (await this.exists(this.selectors.overtimeHours)) {
      const text = await this.getText(this.selectors.overtimeHours);
      const match = text.match(/(\d+\.?\d*)/);
      return match ? parseFloat(match[1]) : 0;
    }
    return 0;
  }

  /**
   * View attendance history
   * @param {Object} filters - Filter options {dateFrom, dateTo, status}
   * @returns {Promise<Array>}
   */
  async viewHistory(filters = {}) {
    // Apply filters if provided
    if (filters.dateFrom && await this.exists(this.selectors.dateRangeFilter)) {
      await this.fill(this.selectors.dateRangeFilter, filters.dateFrom);
    }
    
    if (filters.status && await this.exists(this.selectors.statusFilter)) {
      await this.page.selectOption(this.selectors.statusFilter, filters.status);
    }
    
    // Wait for table to load
    await this.waitForElement(this.selectors.historyTable);
    await this.waitForLoading();
    
    // Get all rows
    const rows = await this.page.locator(this.selectors.historyRows).all();
    const records = [];
    
    for (const row of rows) {
      const date = await row.locator(this.selectors.dateColumn).textContent();
      const checkIn = await row.locator(this.selectors.checkInColumn).textContent();
      const checkOut = await row.locator(this.selectors.checkOutColumn).textContent();
      const hours = await row.locator(this.selectors.hoursColumn).textContent();
      const status = await row.locator(this.selectors.statusColumn).textContent();
      
      records.push({
        date: date?.trim(),
        checkIn: checkIn?.trim(),
        checkOut: checkOut?.trim(),
        hours: hours?.trim(),
        status: status?.trim()
      });
    }
    
    return records;
  }

  /**
   * Edit attendance record
   * @param {string} date - Date of record to edit (YYYY-MM-DD)
   * @param {Object} changes - {checkInTime, checkOutTime, reason}
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async editRecord(date, changes) {
    try {
      // Find and click edit button for the record
      const row = await this.findRecordRow(date);
      if (!row) {
        return {
          success: false,
          message: 'Record not found'
        };
      }
      
      await row.locator(this.selectors.editButton).click();
      
      // Wait for edit modal
      await this.waitForElement(this.selectors.editModal);
      
      // Fill in changes
      if (changes.checkInTime) {
        await this.fill(this.selectors.editCheckInTime, changes.checkInTime);
      }
      
      if (changes.checkOutTime) {
        await this.fill(this.selectors.editCheckOutTime, changes.checkOutTime);
      }
      
      if (changes.reason) {
        await this.fill(this.selectors.editReason, changes.reason);
      }
      
      // Save
      await this.click(this.selectors.saveEditButton);
      await this.page.waitForTimeout(2000);
      
      const success = await this.hasSuccessMessage();
      const message = success ? await this.getSuccessMessage() : await this.getErrorMessage();
      
      return {
        success,
        message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Edit failed'
      };
    }
  }

  /**
   * Approve attendance record
   * @param {string} date - Date of record to approve
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async approveRecord(date) {
    try {
      const row = await this.findRecordRow(date);
      if (!row) {
        return {
          success: false,
          message: 'Record not found'
        };
      }
      
      await row.locator(this.selectors.approveButton).click();
      await this.page.waitForTimeout(2000);
      
      const success = await this.hasSuccessMessage();
      const message = success ? await this.getSuccessMessage() : await this.getErrorMessage();
      
      return {
        success,
        message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Approve failed'
      };
    }
  }

  /**
   * Reject attendance record
   * @param {string} date - Date of record to reject
   * @param {string} reason - Rejection reason
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async rejectRecord(date, reason) {
    try {
      const row = await this.findRecordRow(date);
      if (!row) {
        return {
          success: false,
          message: 'Record not found'
        };
      }
      
      await row.locator(this.selectors.rejectButton).click();
      
      // Wait for rejection reason modal
      await this.waitForElement(this.selectors.rejectionReason);
      await this.fill(this.selectors.rejectionReason, reason);
      await this.click(this.selectors.confirmRejectButton);
      
      await this.page.waitForTimeout(2000);
      
      const success = await this.hasSuccessMessage();
      const message = success ? await this.getSuccessMessage() : await this.getErrorMessage();
      
      return {
        success,
        message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Reject failed'
      };
    }
  }

  /**
   * Find record row by date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Locator|null>}
   */
  async findRecordRow(date) {
    const rows = await this.page.locator(this.selectors.historyRows).all();
    
    for (const row of rows) {
      const rowDate = await row.locator(this.selectors.dateColumn).textContent();
      if (rowDate && rowDate.includes(date)) {
        return row;
      }
    }
    
    return null;
  }

  /**
   * Check if success message is displayed
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
    if (await this.exists(this.selectors.successMessage)) {
      return await this.getText(this.selectors.successMessage);
    }
    return '';
  }

  /**
   * Check if late indicator is shown
   * @returns {Promise<boolean>}
   */
  async isLate() {
    return await this.isVisible(this.selectors.lateIndicator);
  }

  /**
   * Check if early leave indicator is shown
   * @returns {Promise<boolean>}
   */
  async isEarlyLeave() {
    return await this.isVisible(this.selectors.earlyLeaveIndicator);
  }

  /**
   * Check if there are pending approvals
   * @returns {Promise<boolean>}
   */
  async hasPendingApprovals() {
    if (await this.exists(this.selectors.pendingApprovals)) {
      const count = await this.page.locator(this.selectors.pendingApprovals).count();
      return count > 0;
    }
    return false;
  }

  /**
   * Export attendance data
   * @param {Object} options - Export options {dateFrom, dateTo, format}
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async exportData(options = {}) {
    try {
      if (!(await this.exists(this.selectors.exportButton))) {
        return {
          success: false,
          message: 'Export button not found'
        };
      }
      
      await this.click(this.selectors.exportButton);
      
      // Wait for download or confirmation
      await this.page.waitForTimeout(3000);
      
      return {
        success: true,
        message: 'Export initiated'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Export failed'
      };
    }
  }
}

module.exports = AttendancePage;

