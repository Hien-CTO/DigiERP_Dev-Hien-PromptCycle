const BasePage = require('./base-page');

/**
 * Reports Page Object Model
 */
class ReportsPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/admin/reports';
    
    // Selectors
    this.selectors = {
      // Header elements
      header: '.reports-header, .page-header, [data-testid="reports-header"]',
      pageTitle: 'h1, .page-title, [data-testid="page-title"]',
      
      // Report categories
      salesReportsTab: 'button:has-text("Báo cáo bán hàng"), [data-testid="sales-reports-tab"]',
      inventoryReportsTab: 'button:has-text("Báo cáo tồn kho"), [data-testid="inventory-reports-tab"]',
      financialReportsTab: 'button:has-text("Báo cáo tài chính"), [data-testid="financial-reports-tab"]',
      purchaseReportsTab: 'button:has-text("Báo cáo mua hàng"), [data-testid="purchase-reports-tab"]',
      userReportsTab: 'button:has-text("Báo cáo người dùng"), [data-testid="user-reports-tab"]',
      
      // Action buttons
      generateReportButton: 'button:has-text("Tạo báo cáo"), button:has-text("Generate Report"), [data-testid="generate-report-btn"]',
      exportReportButton: 'button:has-text("Xuất báo cáo"), button:has-text("Export Report"), [data-testid="export-report-btn"]',
      scheduleReportButton: 'button:has-text("Lên lịch báo cáo"), button:has-text("Schedule Report"), [data-testid="schedule-report-btn"]',
      refreshDataButton: 'button:has-text("Làm mới dữ liệu"), button:has-text("Refresh Data"), [data-testid="refresh-data-btn"]',
      
      // Report filters
      reportTypeSelect: 'select[name="reportType"], [data-testid="report-type-select"]',
      dateRangeSelect: 'select[name="dateRange"], [data-testid="date-range-select"]',
      startDateInput: 'input[name="startDate"], [data-testid="start-date-input"]',
      endDateInput: 'input[name="endDate"], [data-testid="end-date-input"]',
      departmentFilter: 'select[name="department"], [data-testid="department-filter"]',
      categoryFilter: 'select[name="category"], [data-testid="category-filter"]',
      statusFilter: 'select[name="status"], [data-testid="status-filter"]',
      
      // Report content
      reportContent: '.report-content, [data-testid="report-content"]',
      reportTable: '.report-table, table, [data-testid="report-table"]',
      reportChart: '.report-chart, [data-testid="report-chart"]',
      reportSummary: '.report-summary, [data-testid="report-summary"]',
      
      // Report table elements
      tableHeader: 'thead, .table-header',
      tableBody: 'tbody, .table-body',
      tableRows: 'tbody tr, .report-row',
      tableRow: 'tbody tr:nth-child({index}), .report-row:nth-child({index})',
      
      // Report statistics
      totalSalesCard: '.total-sales-card, [data-testid="total-sales-card"]',
      totalRevenueCard: '.total-revenue-card, [data-testid="total-revenue-card"]',
      totalOrdersCard: '.total-orders-card, [data-testid="total-orders-card"]',
      totalCustomersCard: '.total-customers-card, [data-testid="total-customers-card"]',
      totalProductsCard: '.total-products-card, [data-testid="total-products-card"]',
      totalInventoryValueCard: '.total-inventory-value-card, [data-testid="total-inventory-value-card"]',
      lowStockItemsCard: '.low-stock-items-card, [data-testid="low-stock-items-card"]',
      outOfStockItemsCard: '.out-of-stock-items-card, [data-testid="out-of-stock-items-card"]',
      
      // Chart elements
      salesChart: '.sales-chart, [data-testid="sales-chart"]',
      revenueChart: '.revenue-chart, [data-testid="revenue-chart"]',
      inventoryChart: '.inventory-chart, [data-testid="inventory-chart"]',
      customerChart: '.customer-chart, [data-testid="customer-chart"]',
      productChart: '.product-chart, [data-testid="product-chart"]',
      
      // Modals
      generateReportModal: '.modal, [data-testid="generate-report-modal"]',
      exportReportModal: '.modal, [data-testid="export-report-modal"]',
      scheduleReportModal: '.modal, [data-testid="schedule-report-modal"]',
      modalTitle: '.modal-title, .modal h2',
      modalCloseButton: '.modal-close, button:has-text("Đóng"), button:has-text("Close")',
      
      // Report generation form
      reportNameInput: 'input[name="reportName"], [data-testid="report-name-input"]',
      reportDescriptionTextarea: 'textarea[name="reportDescription"], [data-testid="report-description-textarea"]',
      reportFormatSelect: 'select[name="reportFormat"], [data-testid="report-format-select"]',
      includeChartsCheckbox: 'input[name="includeCharts"], [data-testid="include-charts-checkbox"]',
      includeDetailsCheckbox: 'input[name="includeDetails"], [data-testid="include-details-checkbox"]',
      
      // Export options
      exportFormatSelect: 'select[name="exportFormat"], [data-testid="export-format-select"]',
      exportFileNameInput: 'input[name="exportFileName"], [data-testid="export-file-name-input"]',
      includeSummaryCheckbox: 'input[name="includeSummary"], [data-testid="include-summary-checkbox"]',
      
      // Schedule options
      scheduleFrequencySelect: 'select[name="scheduleFrequency"], [data-testid="schedule-frequency-select"]',
      scheduleTimeInput: 'input[name="scheduleTime"], [data-testid="schedule-time-input"]',
      scheduleEmailInput: 'input[name="scheduleEmail"], [data-testid="schedule-email-input"]',
      scheduleEnabledCheckbox: 'input[name="scheduleEnabled"], [data-testid="schedule-enabled-checkbox"]',
      
      // Form buttons
      generateButton: 'button:has-text("Tạo"), button:has-text("Generate"), [data-testid="generate-btn"]',
      exportButton: 'button:has-text("Xuất"), button:has-text("Export"), [data-testid="export-btn"]',
      scheduleButton: 'button:has-text("Lên lịch"), button:has-text("Schedule"), [data-testid="schedule-btn"]',
      cancelButton: 'button:has-text("Hủy"), button:has-text("Cancel"), [data-testid="cancel-btn"]',
      
      // Loading states
      loadingSpinner: '.loading, .spinner, .animate-spin, [data-testid="loading"]',
      reportLoading: '.report-loading, [data-testid="report-loading"]',
      
      // Messages
      successMessage: '.success-message, .alert-success, .text-green-500, [data-testid="success-message"]',
      errorMessage: '.error-message, .alert-error, .text-red-500, [data-testid="error-message"]',
      infoMessage: '.info-message, .alert-info, .text-blue-500, [data-testid="info-message"]',
      
      // Empty state
      emptyState: '.empty-state, [data-testid="empty-state"]',
      noDataMessage: '.no-data, [data-testid="no-data"]',
      
      // Report navigation
      previousPeriodButton: 'button:has-text("Kỳ trước"), button:has-text("Previous Period"), [data-testid="previous-period-btn"]',
      nextPeriodButton: 'button:has-text("Kỳ sau"), button:has-text("Next Period"), [data-testid="next-period-btn"]',
      currentPeriodButton: 'button:has-text("Kỳ hiện tại"), button:has-text("Current Period"), [data-testid="current-period-btn"]',
      
      // Report comparison
      compareWithPreviousCheckbox: 'input[name="compareWithPrevious"], [data-testid="compare-with-previous-checkbox"]',
      comparisonModeSelect: 'select[name="comparisonMode"], [data-testid="comparison-mode-select"]',
      
      // Report customization
      showDetailsToggle: 'input[name="showDetails"], [data-testid="show-details-toggle"]',
      groupBySelect: 'select[name="groupBy"], [data-testid="group-by-select"]',
      sortBySelect: 'select[name="sortBy"], [data-testid="sort-by-select"]',
      sortOrderSelect: 'select[name="sortOrder"], [data-testid="sort-order-select"]',
      
      // Quick filters
      todayFilter: 'button:has-text("Hôm nay"), [data-testid="today-filter"]',
      yesterdayFilter: 'button:has-text("Hôm qua"), [data-testid="yesterday-filter"]',
      thisWeekFilter: 'button:has-text("Tuần này"), [data-testid="this-week-filter"]',
      lastWeekFilter: 'button:has-text("Tuần trước"), [data-testid="last-week-filter"]',
      thisMonthFilter: 'button:has-text("Tháng này"), [data-testid="this-month-filter"]',
      lastMonthFilter: 'button:has-text("Tháng trước"), [data-testid="last-month-filter"]',
      thisYearFilter: 'button:has-text("Năm này"), [data-testid="this-year-filter"]',
      lastYearFilter: 'button:has-text("Năm trước"), [data-testid="last-year-filter"]',
      
      // Report templates
      templateSelect: 'select[name="template"], [data-testid="template-select"]',
      saveAsTemplateButton: 'button:has-text("Lưu làm mẫu"), button:has-text("Save as Template"), [data-testid="save-as-template-btn"]',
      loadTemplateButton: 'button:has-text("Tải mẫu"), button:has-text("Load Template"), [data-testid="load-template-btn"]',
      
      // Report sharing
      shareReportButton: 'button:has-text("Chia sẻ"), button:has-text("Share Report"), [data-testid="share-report-btn"]',
      shareEmailInput: 'input[name="shareEmail"], [data-testid="share-email-input"]',
      shareMessageTextarea: 'textarea[name="shareMessage"], [data-testid="share-message-textarea"]',
      shareButton: 'button:has-text("Gửi"), button:has-text("Send"), [data-testid="share-btn"]'
    };
  }

  /**
   * Navigate to reports page
   */
  async goto() {
    await super.goto(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for reports page to load completely
   */
  async waitForPageLoad() {
    await this.waitForElement(this.selectors.header);
    await this.waitForLoading();
  }

  /**
   * Check if reports page is loaded
   * @returns {Promise<boolean>}
   */
  async isReportsPageLoaded() {
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
   * Click on report category tab
   * @param {string} category - Report category (sales, inventory, financial, purchase, user)
   */
  async clickReportCategory(category) {
    const categorySelectors = {
      sales: this.selectors.salesReportsTab,
      inventory: this.selectors.inventoryReportsTab,
      financial: this.selectors.financialReportsTab,
      purchase: this.selectors.purchaseReportsTab,
      user: this.selectors.userReportsTab
    };
    
    const selector = categorySelectors[category];
    if (selector) {
      await this.click(selector);
      await this.waitForLoading();
    }
  }

  /**
   * Click generate report button
   */
  async clickGenerateReport() {
    await this.click(this.selectors.generateReportButton);
    await this.waitForElement(this.selectors.generateReportModal);
  }

  /**
   * Click export report button
   */
  async clickExportReport() {
    await this.click(this.selectors.exportReportButton);
    await this.waitForElement(this.selectors.exportReportModal);
  }

  /**
   * Click schedule report button
   */
  async clickScheduleReport() {
    await this.click(this.selectors.scheduleReportButton);
    await this.waitForElement(this.selectors.scheduleReportModal);
  }

  /**
   * Click refresh data button
   */
  async clickRefreshData() {
    await this.click(this.selectors.refreshDataButton);
    await this.waitForLoading();
  }

  /**
   * Set report type
   * @param {string} reportType - Report type
   */
  async setReportType(reportType) {
    await this.page.selectOption(this.selectors.reportTypeSelect, reportType);
    await this.waitForLoading();
  }

  /**
   * Set date range
   * @param {string} dateRange - Date range (today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth, thisYear, lastYear, custom)
   */
  async setDateRange(dateRange) {
    await this.page.selectOption(this.selectors.dateRangeSelect, dateRange);
    await this.waitForLoading();
  }

  /**
   * Set custom date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   */
  async setCustomDateRange(startDate, endDate) {
    await this.fill(this.selectors.startDateInput, startDate);
    await this.fill(this.selectors.endDateInput, endDate);
    await this.waitForLoading();
  }

  /**
   * Click quick filter
   * @param {string} filter - Quick filter (today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth, thisYear, lastYear)
   */
  async clickQuickFilter(filter) {
    const filterSelectors = {
      today: this.selectors.todayFilter,
      yesterday: this.selectors.yesterdayFilter,
      thisWeek: this.selectors.thisWeekFilter,
      lastWeek: this.selectors.lastWeekFilter,
      thisMonth: this.selectors.thisMonthFilter,
      lastMonth: this.selectors.lastMonthFilter,
      thisYear: this.selectors.thisYearFilter,
      lastYear: this.selectors.lastYearFilter
    };
    
    const selector = filterSelectors[filter];
    if (selector) {
      await this.click(selector);
      await this.waitForLoading();
    }
  }

  /**
   * Set department filter
   * @param {string} department - Department name
   */
  async setDepartmentFilter(department) {
    await this.page.selectOption(this.selectors.departmentFilter, department);
    await this.waitForLoading();
  }

  /**
   * Set category filter
   * @param {string} category - Category name
   */
  async setCategoryFilter(category) {
    await this.page.selectOption(this.selectors.categoryFilter, category);
    await this.waitForLoading();
  }

  /**
   * Set status filter
   * @param {string} status - Status value
   */
  async setStatusFilter(status) {
    await this.page.selectOption(this.selectors.statusFilter, status);
    await this.waitForLoading();
  }

  /**
   * Get report statistics
   * @returns {Promise<Object>}
   */
  async getReportStats() {
    const stats = {};
    
    const statSelectors = {
      totalSales: this.selectors.totalSalesCard,
      totalRevenue: this.selectors.totalRevenueCard,
      totalOrders: this.selectors.totalOrdersCard,
      totalCustomers: this.selectors.totalCustomersCard,
      totalProducts: this.selectors.totalProductsCard,
      totalInventoryValue: this.selectors.totalInventoryValueCard,
      lowStockItems: this.selectors.lowStockItemsCard,
      outOfStockItems: this.selectors.outOfStockItemsCard
    };
    
    for (const [key, selector] of Object.entries(statSelectors)) {
      if (await this.isVisible(selector)) {
        stats[key] = await this.getText(selector);
      }
    }
    
    return stats;
  }

  /**
   * Check if report content is visible
   * @returns {Promise<boolean>}
   */
  async isReportContentVisible() {
    return await this.isVisible(this.selectors.reportContent);
  }

  /**
   * Check if report table is visible
   * @returns {Promise<boolean>}
   */
  async isReportTableVisible() {
    return await this.isVisible(this.selectors.reportTable);
  }

  /**
   * Check if report chart is visible
   * @returns {Promise<boolean>}
   */
  async isReportChartVisible() {
    return await this.isVisible(this.selectors.reportChart);
  }

  /**
   * Get report table rows
   * @returns {Promise<Array>}
   */
  async getReportTableRows() {
    if (!(await this.isVisible(this.selectors.reportTable))) {
      return [];
    }
    
    const rows = await this.page.locator(this.selectors.tableRows).all();
    return rows;
  }

  /**
   * Get report table row count
   * @returns {Promise<number>}
   */
  async getReportTableRowCount() {
    const rows = await this.getReportTableRows();
    return rows.length;
  }

  /**
   * Fill report generation form
   * @param {Object} reportData - Report data
   */
  async fillReportForm(reportData) {
    if (reportData.reportName) {
      await this.fill(this.selectors.reportNameInput, reportData.reportName);
    }
    
    if (reportData.reportDescription) {
      await this.fill(this.selectors.reportDescriptionTextarea, reportData.reportDescription);
    }
    
    if (reportData.reportFormat) {
      await this.page.selectOption(this.selectors.reportFormatSelect, reportData.reportFormat);
    }
    
    if (reportData.includeCharts !== undefined) {
      const checkbox = this.page.locator(this.selectors.includeChartsCheckbox);
      const isChecked = await checkbox.isChecked();
      if (reportData.includeCharts !== isChecked) {
        await checkbox.click();
      }
    }
    
    if (reportData.includeDetails !== undefined) {
      const checkbox = this.page.locator(this.selectors.includeDetailsCheckbox);
      const isChecked = await checkbox.isChecked();
      if (reportData.includeDetails !== isChecked) {
        await checkbox.click();
      }
    }
  }

  /**
   * Fill export form
   * @param {Object} exportData - Export data
   */
  async fillExportForm(exportData) {
    if (exportData.exportFormat) {
      await this.page.selectOption(this.selectors.exportFormatSelect, exportData.exportFormat);
    }
    
    if (exportData.exportFileName) {
      await this.fill(this.selectors.exportFileNameInput, exportData.exportFileName);
    }
    
    if (exportData.includeSummary !== undefined) {
      const checkbox = this.page.locator(this.selectors.includeSummaryCheckbox);
      const isChecked = await checkbox.isChecked();
      if (exportData.includeSummary !== isChecked) {
        await checkbox.click();
      }
    }
  }

  /**
   * Fill schedule form
   * @param {Object} scheduleData - Schedule data
   */
  async fillScheduleForm(scheduleData) {
    if (scheduleData.scheduleFrequency) {
      await this.page.selectOption(this.selectors.scheduleFrequencySelect, scheduleData.scheduleFrequency);
    }
    
    if (scheduleData.scheduleTime) {
      await this.fill(this.selectors.scheduleTimeInput, scheduleData.scheduleTime);
    }
    
    if (scheduleData.scheduleEmail) {
      await this.fill(this.selectors.scheduleEmailInput, scheduleData.scheduleEmail);
    }
    
    if (scheduleData.scheduleEnabled !== undefined) {
      const checkbox = this.page.locator(this.selectors.scheduleEnabledCheckbox);
      const isChecked = await checkbox.isChecked();
      if (scheduleData.scheduleEnabled !== isChecked) {
        await checkbox.click();
      }
    }
  }

  /**
   * Generate report
   */
  async generateReport() {
    await this.click(this.selectors.generateButton);
    await this.waitForLoading();
  }

  /**
   * Export report
   */
  async exportReport() {
    await this.click(this.selectors.exportButton);
    await this.waitForLoading();
  }

  /**
   * Schedule report
   */
  async scheduleReport() {
    await this.click(this.selectors.scheduleButton);
    await this.waitForLoading();
  }

  /**
   * Cancel form
   */
  async cancelForm() {
    await this.click(this.selectors.cancelButton);
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
   * @param {string} modalType - Type of modal (generate, export, schedule)
   * @returns {Promise<boolean>}
   */
  async isModalOpen(modalType) {
    const modalSelectors = {
      generate: this.selectors.generateReportModal,
      export: this.selectors.exportReportModal,
      schedule: this.selectors.scheduleReportModal
    };
    
    const selector = modalSelectors[modalType];
    return selector ? await this.isVisible(selector) : false;
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
   * Check if info message is visible
   * @returns {Promise<boolean>}
   */
  async hasInfoMessage() {
    return await this.isVisible(this.selectors.infoMessage);
  }

  /**
   * Get info message
   * @returns {Promise<string>}
   */
  async getInfoMessage() {
    return await this.getText(this.selectors.infoMessage);
  }

  /**
   * Check if report is empty
   * @returns {Promise<boolean>}
   */
  async isReportEmpty() {
    return await this.isVisible(this.selectors.emptyState) || 
           await this.isVisible(this.selectors.noDataMessage);
  }

  /**
   * Navigate to previous period
   */
  async goToPreviousPeriod() {
    if (await this.isVisible(this.selectors.previousPeriodButton)) {
      await this.click(this.selectors.previousPeriodButton);
      await this.waitForLoading();
    }
  }

  /**
   * Navigate to next period
   */
  async goToNextPeriod() {
    if (await this.isVisible(this.selectors.nextPeriodButton)) {
      await this.click(this.selectors.nextPeriodButton);
      await this.waitForLoading();
    }
  }

  /**
   * Navigate to current period
   */
  async goToCurrentPeriod() {
    if (await this.isVisible(this.selectors.currentPeriodButton)) {
      await this.click(this.selectors.currentPeriodButton);
      await this.waitForLoading();
    }
  }

  /**
   * Toggle comparison with previous period
   */
  async toggleComparisonWithPrevious() {
    const checkbox = this.page.locator(this.selectors.compareWithPreviousCheckbox);
    await checkbox.click();
    await this.waitForLoading();
  }

  /**
   * Set comparison mode
   * @param {string} mode - Comparison mode
   */
  async setComparisonMode(mode) {
    await this.page.selectOption(this.selectors.comparisonModeSelect, mode);
    await this.waitForLoading();
  }

  /**
   * Toggle show details
   */
  async toggleShowDetails() {
    const toggle = this.page.locator(this.selectors.showDetailsToggle);
    await toggle.click();
    await this.waitForLoading();
  }

  /**
   * Set group by option
   * @param {string} groupBy - Group by option
   */
  async setGroupBy(groupBy) {
    await this.page.selectOption(this.selectors.groupBySelect, groupBy);
    await this.waitForLoading();
  }

  /**
   * Set sort by option
   * @param {string} sortBy - Sort by option
   */
  async setSortBy(sortBy) {
    await this.page.selectOption(this.selectors.sortBySelect, sortBy);
    await this.waitForLoading();
  }

  /**
   * Set sort order
   * @param {string} sortOrder - Sort order (asc, desc)
   */
  async setSortOrder(sortOrder) {
    await this.page.selectOption(this.selectors.sortOrderSelect, sortOrder);
    await this.waitForLoading();
  }

  /**
   * Set report template
   * @param {string} template - Template name
   */
  async setReportTemplate(template) {
    await this.page.selectOption(this.selectors.templateSelect, template);
    await this.waitForLoading();
  }

  /**
   * Save current report as template
   */
  async saveAsTemplate() {
    await this.click(this.selectors.saveAsTemplateButton);
    await this.waitForLoading();
  }

  /**
   * Load report template
   */
  async loadTemplate() {
    await this.click(this.selectors.loadTemplateButton);
    await this.waitForLoading();
  }

  /**
   * Share report
   * @param {string} email - Email address
   * @param {string} message - Share message
   */
  async shareReport(email, message) {
    await this.click(this.selectors.shareReportButton);
    await this.waitForElement(this.selectors.shareEmailInput);
    
    if (email) {
      await this.fill(this.selectors.shareEmailInput, email);
    }
    
    if (message) {
      await this.fill(this.selectors.shareMessageTextarea, message);
    }
    
    await this.click(this.selectors.shareButton);
    await this.waitForLoading();
  }

  /**
   * Validate reports page elements
   * @returns {Promise<{valid: boolean, missing: string[]}>}
   */
  async validatePageElements() {
    const requiredElements = [
      { selector: this.selectors.header, name: 'Header' },
      { selector: this.selectors.salesReportsTab, name: 'Sales Reports Tab' },
      { selector: this.selectors.inventoryReportsTab, name: 'Inventory Reports Tab' },
      { selector: this.selectors.financialReportsTab, name: 'Financial Reports Tab' }
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
   * Test report generation
   * @param {Object} reportData - Report data
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testGenerateReport(reportData) {
    try {
      await this.clickGenerateReport();
      await this.fillReportForm(reportData);
      await this.generateReport();
      
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
   * Test report export
   * @param {Object} exportData - Export data
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testExportReport(exportData) {
    try {
      await this.clickExportReport();
      await this.fillExportForm(exportData);
      await this.exportReport();
      
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
}

module.exports = ReportsPage;
