const BasePage = require('./base-page');

/**
 * Financial/Invoices Page Object Model
 */
class FinancialInvoicesPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/admin/financial/invoices';
    
    // Selectors
    this.selectors = {
      // Header elements
      header: '.financial-invoices-header, .page-header, [data-testid="financial-invoices-header"]',
      pageTitle: 'h1, .page-title, [data-testid="page-title"]',
      
      // Action buttons
      addInvoiceButton: 'button:has-text("Tạo hóa đơn"), button:has-text("Create Invoice"), [data-testid="add-invoice-btn"]',
      importButton: 'button:has-text("Import"), [data-testid="import-btn"]',
      exportButton: 'button:has-text("Export"), [data-testid="export-btn"]',
      bulkActionsButton: 'button:has-text("Thao tác hàng loạt"), button:has-text("Bulk Actions"), [data-testid="bulk-actions-btn"]',
      generateReportButton: 'button:has-text("Tạo báo cáo"), button:has-text("Generate Report"), [data-testid="generate-report-btn"]',
      
      // Search and filters
      searchInput: 'input[type="search"], input[placeholder*="Tìm kiếm"], input[placeholder*="Search"], [data-testid="search-input"]',
      customerFilter: 'select[name="customer"], [data-testid="customer-filter"]',
      statusFilter: 'select[name="status"], [data-testid="status-filter"]',
      paymentStatusFilter: 'select[name="paymentStatus"], [data-testid="payment-status-filter"]',
      dateRangeFilter: 'input[name="dateRange"], [data-testid="date-range-filter"]',
      amountRangeFilter: 'input[name="amountRange"], [data-testid="amount-range-filter"]',
      
      // Invoices table
      invoicesTable: '.invoices-table, table, [data-testid="invoices-table"]',
      tableHeader: 'thead, .table-header',
      tableBody: 'tbody, .table-body',
      invoiceRows: 'tbody tr, .invoice-row',
      invoiceRow: 'tbody tr:nth-child({index}), .invoice-row:nth-child({index})',
      
      // Invoice row elements
      invoiceNumber: 'td:nth-child(1), .invoice-number',
      customerName: 'td:nth-child(2), .customer-name',
      invoiceDate: 'td:nth-child(3), .invoice-date',
      dueDate: 'td:nth-child(4), .due-date',
      totalAmount: 'td:nth-child(5), .total-amount',
      paidAmount: 'td:nth-child(6), .paid-amount',
      status: 'td:nth-child(7), .status',
      paymentStatus: 'td:nth-child(8), .payment-status',
      invoiceActions: 'td:last-child, .invoice-actions',
      
      // Action buttons in table
      editButton: 'button:has-text("Sửa"), button:has-text("Edit"), [data-testid="edit-btn"]',
      deleteButton: 'button:has-text("Xóa"), button:has-text("Delete"), [data-testid="delete-btn"]',
      viewButton: 'button:has-text("Xem"), button:has-text("View"), [data-testid="view-btn"]',
      printButton: 'button:has-text("In"), button:has-text("Print"), [data-testid="print-btn"]',
      sendButton: 'button:has-text("Gửi"), button:has-text("Send"), [data-testid="send-btn"]',
      markPaidButton: 'button:has-text("Đánh dấu đã thanh toán"), button:has-text("Mark Paid"), [data-testid="mark-paid-btn"]',
      addPaymentButton: 'button:has-text("Thêm thanh toán"), button:has-text("Add Payment"), [data-testid="add-payment-btn"]',
      
      // Pagination
      pagination: '.pagination, [data-testid="pagination"]',
      pageNumbers: '.page-number, .pagination button',
      nextPageButton: 'button:has-text("Trang sau"), button:has-text("Next"), [data-testid="next-page"]',
      prevPageButton: 'button:has-text("Trang trước"), button:has-text("Previous"), [data-testid="prev-page"]',
      
      // Modals
      addInvoiceModal: '.modal, [data-testid="add-invoice-modal"]',
      editInvoiceModal: '.modal, [data-testid="edit-invoice-modal"]',
      viewInvoiceModal: '.modal, [data-testid="view-invoice-modal"]',
      deleteConfirmModal: '.modal, [data-testid="delete-confirm-modal"]',
      printInvoiceModal: '.modal, [data-testid="print-invoice-modal"]',
      sendInvoiceModal: '.modal, [data-testid="send-invoice-modal"]',
      addPaymentModal: '.modal, [data-testid="add-payment-modal"]',
      markPaidModal: '.modal, [data-testid="mark-paid-modal"]',
      generateReportModal: '.modal, [data-testid="generate-report-modal"]',
      modalTitle: '.modal-title, .modal h2',
      modalCloseButton: '.modal-close, button:has-text("Đóng"), button:has-text("Close")',
      
      // Form fields
      invoiceNumberInput: 'input[name="invoiceNumber"], [data-testid="invoice-number-input"]',
      customerSelect: 'select[name="customerId"], [data-testid="customer-select"]',
      invoiceDateInput: 'input[name="invoiceDate"], [data-testid="invoice-date-input"]',
      dueDateInput: 'input[name="dueDate"], [data-testid="due-date-input"]',
      notesTextarea: 'textarea[name="notes"], [data-testid="notes-textarea"]',
      termsTextarea: 'textarea[name="terms"], [data-testid="terms-textarea"]',
      paymentTermsSelect: 'select[name="paymentTerms"], [data-testid="payment-terms-select"]',
      
      // Invoice items
      addItemButton: 'button:has-text("Thêm sản phẩm"), button:has-text("Add Item"), [data-testid="add-item-btn"]',
      itemRows: '.invoice-item-row, [data-testid="invoice-item-row"]',
      itemDescriptionInput: 'input[name="description"], [data-testid="item-description-input"]',
      itemQuantityInput: 'input[name="quantity"], [data-testid="item-quantity-input"]',
      itemUnitPriceInput: 'input[name="unitPrice"], [data-testid="item-unit-price-input"]',
      itemTaxRateInput: 'input[name="taxRate"], [data-testid="item-tax-rate-input"]',
      itemTotalInput: 'input[name="total"], [data-testid="item-total-input"]',
      removeItemButton: 'button:has-text("Xóa"), button:has-text("Remove"), [data-testid="remove-item-btn"]',
      
      // Invoice totals
      subtotalDisplay: '.subtotal, [data-testid="subtotal"]',
      taxDisplay: '.tax, [data-testid="tax"]',
      discountDisplay: '.discount, [data-testid="discount"]',
      totalDisplay: '.total, [data-testid="total"]',
      
      // Payment form fields
      paymentAmountInput: 'input[name="paymentAmount"], [data-testid="payment-amount-input"]',
      paymentDateInput: 'input[name="paymentDate"], [data-testid="payment-date-input"]',
      paymentMethodSelect: 'select[name="paymentMethod"], [data-testid="payment-method-select"]',
      paymentReferenceInput: 'input[name="paymentReference"], [data-testid="payment-reference-input"]',
      paymentNotesTextarea: 'textarea[name="paymentNotes"], [data-testid="payment-notes-textarea"]',
      
      // Form buttons
      saveButton: 'button:has-text("Lưu"), button:has-text("Save"), [data-testid="save-btn"]',
      cancelFormButton: 'button:has-text("Hủy"), button:has-text("Cancel"), [data-testid="cancel-btn"]',
      confirmDeleteButton: 'button:has-text("Xác nhận"), button:has-text("Confirm"), [data-testid="confirm-delete-btn"]',
      printInvoiceButton: 'button:has-text("In hóa đơn"), button:has-text("Print Invoice"), [data-testid="print-invoice-btn"]',
      sendInvoiceButton: 'button:has-text("Gửi hóa đơn"), button:has-text("Send Invoice"), [data-testid="send-invoice-btn"]',
      addPaymentButton: 'button:has-text("Thêm thanh toán"), button:has-text("Add Payment"), [data-testid="add-payment-btn"]',
      markPaidButton: 'button:has-text("Đánh dấu đã thanh toán"), button:has-text("Mark Paid"), [data-testid="mark-paid-btn"]',
      generateReportButton: 'button:has-text("Tạo báo cáo"), button:has-text("Generate Report"), [data-testid="generate-report-btn"]',
      
      // Loading states
      loadingSpinner: '.loading, .spinner, .animate-spin, [data-testid="loading"]',
      
      // Messages
      successMessage: '.success-message, .alert-success, .text-green-500, [data-testid="success-message"]',
      errorMessage: '.error-message, .alert-error, .text-red-500, [data-testid="error-message"]',
      
      // Empty state
      emptyState: '.empty-state, [data-testid="empty-state"]',
      noInvoicesMessage: '.no-invoices, [data-testid="no-invoices"]',
      
      // Statistics cards
      totalInvoicesCard: '.total-invoices-card, [data-testid="total-invoices-card"]',
      pendingInvoicesCard: '.pending-invoices-card, [data-testid="pending-invoices-card"]',
      paidInvoicesCard: '.paid-invoices-card, [data-testid="paid-invoices-card"]',
      overdueInvoicesCard: '.overdue-invoices-card, [data-testid="overdue-invoices-card"]',
      totalRevenueCard: '.total-revenue-card, [data-testid="total-revenue-card"]',
      outstandingAmountCard: '.outstanding-amount-card, [data-testid="outstanding-amount-card"]',
      
      // Status badges
      draftBadge: '.status-draft, [data-testid="status-draft"]',
      sentBadge: '.status-sent, [data-testid="status-sent"]',
      paidBadge: '.status-paid, [data-testid="status-paid"]',
      overdueBadge: '.status-overdue, [data-testid="status-overdue"]',
      cancelledBadge: '.status-cancelled, [data-testid="status-cancelled"]',
      
      // Payment status badges
      unpaidBadge: '.payment-unpaid, [data-testid="payment-unpaid"]',
      partialBadge: '.payment-partial, [data-testid="payment-partial"]',
      paidBadge: '.payment-paid, [data-testid="payment-paid"]',
      refundedBadge: '.payment-refunded, [data-testid="payment-refunded"]',
      
      // Report options
      reportTypeSelect: 'select[name="reportType"], [data-testid="report-type-select"]',
      reportPeriodSelect: 'select[name="reportPeriod"], [data-testid="report-period-select"]',
      reportFormatSelect: 'select[name="reportFormat"], [data-testid="report-format-select"]',
      reportStartDateInput: 'input[name="startDate"], [data-testid="report-start-date-input"]',
      reportEndDateInput: 'input[name="endDate"], [data-testid="report-end-date-input"]'
    };
  }

  /**
   * Navigate to financial/invoices page
   */
  async goto() {
    await super.goto(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for financial/invoices page to load completely
   */
  async waitForPageLoad() {
    await this.waitForElement(this.selectors.header);
    await this.waitForLoading();
  }

  /**
   * Check if financial/invoices page is loaded
   * @returns {Promise<boolean>}
   */
  async isFinancialInvoicesPageLoaded() {
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
   * Click add invoice button
   */
  async clickAddInvoice() {
    await this.click(this.selectors.addInvoiceButton);
    await this.waitForElement(this.selectors.addInvoiceModal);
  }

  /**
   * Click bulk actions button
   */
  async clickBulkActions() {
    await this.click(this.selectors.bulkActionsButton);
    await this.waitForElement(this.selectors.bulkActionsModal);
  }

  /**
   * Click generate report button
   */
  async clickGenerateReport() {
    await this.click(this.selectors.generateReportButton);
    await this.waitForElement(this.selectors.generateReportModal);
  }

  /**
   * Search for invoices
   * @param {string} searchTerm - Search term
   */
  async searchInvoices(searchTerm) {
    await this.fill(this.selectors.searchInput, searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForLoading();
  }

  /**
   * Filter invoices by customer
   * @param {string} customerId - Customer ID
   */
  async filterByCustomer(customerId) {
    await this.page.selectOption(this.selectors.customerFilter, customerId);
    await this.waitForLoading();
  }

  /**
   * Filter invoices by status
   * @param {string} status - Invoice status
   */
  async filterByStatus(status) {
    await this.page.selectOption(this.selectors.statusFilter, status);
    await this.waitForLoading();
  }

  /**
   * Filter invoices by payment status
   * @param {string} paymentStatus - Payment status
   */
  async filterByPaymentStatus(paymentStatus) {
    await this.page.selectOption(this.selectors.paymentStatusFilter, paymentStatus);
    await this.waitForLoading();
  }

  /**
   * Get all invoice rows
   * @returns {Promise<Array>}
   */
  async getInvoiceRows() {
    if (!(await this.isVisible(this.selectors.invoicesTable))) {
      return [];
    }
    
    const rows = await this.page.locator(this.selectors.invoiceRows).all();
    return rows;
  }

  /**
   * Get invoice count
   * @returns {Promise<number>}
   */
  async getInvoiceCount() {
    const rows = await this.getInvoiceRows();
    return rows.length;
  }

  /**
   * Get invoice data from row
   * @param {number} rowIndex - Row index (1-based)
   * @returns {Promise<Object>}
   */
  async getInvoiceData(rowIndex) {
    const rowSelector = this.selectors.invoiceRow.replace('{index}', rowIndex);
    
    if (!(await this.exists(rowSelector))) {
      throw new Error(`Invoice row ${rowIndex} not found`);
    }
    
    const row = this.page.locator(rowSelector);
    
    return {
      invoiceNumber: await row.locator(this.selectors.invoiceNumber).textContent(),
      customerName: await row.locator(this.selectors.customerName).textContent(),
      invoiceDate: await row.locator(this.selectors.invoiceDate).textContent(),
      dueDate: await row.locator(this.selectors.dueDate).textContent(),
      totalAmount: await row.locator(this.selectors.totalAmount).textContent(),
      paidAmount: await row.locator(this.selectors.paidAmount).textContent(),
      status: await row.locator(this.selectors.status).textContent(),
      paymentStatus: await row.locator(this.selectors.paymentStatus).textContent()
    };
  }

  /**
   * Click edit button for invoice
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickEditInvoice(rowIndex) {
    const rowSelector = this.selectors.invoiceRow.replace('{index}', rowIndex);
    const editBtn = this.page.locator(rowSelector).locator(this.selectors.editButton);
    await editBtn.click();
    await this.waitForElement(this.selectors.editInvoiceModal);
  }

  /**
   * Click view button for invoice
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickViewInvoice(rowIndex) {
    const rowSelector = this.selectors.invoiceRow.replace('{index}', rowIndex);
    const viewBtn = this.page.locator(rowSelector).locator(this.selectors.viewButton);
    await viewBtn.click();
    await this.waitForElement(this.selectors.viewInvoiceModal);
  }

  /**
   * Click print button for invoice
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickPrintInvoice(rowIndex) {
    const rowSelector = this.selectors.invoiceRow.replace('{index}', rowIndex);
    const printBtn = this.page.locator(rowSelector).locator(this.selectors.printButton);
    await printBtn.click();
    await this.waitForElement(this.selectors.printInvoiceModal);
  }

  /**
   * Click send button for invoice
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickSendInvoice(rowIndex) {
    const rowSelector = this.selectors.invoiceRow.replace('{index}', rowIndex);
    const sendBtn = this.page.locator(rowSelector).locator(this.selectors.sendButton);
    await sendBtn.click();
    await this.waitForElement(this.selectors.sendInvoiceModal);
  }

  /**
   * Click mark paid button for invoice
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickMarkPaid(rowIndex) {
    const rowSelector = this.selectors.invoiceRow.replace('{index}', rowIndex);
    const markPaidBtn = this.page.locator(rowSelector).locator(this.selectors.markPaidButton);
    await markPaidBtn.click();
    await this.waitForElement(this.selectors.markPaidModal);
  }

  /**
   * Click add payment button for invoice
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickAddPayment(rowIndex) {
    const rowSelector = this.selectors.invoiceRow.replace('{index}', rowIndex);
    const addPaymentBtn = this.page.locator(rowSelector).locator(this.selectors.addPaymentButton);
    await addPaymentBtn.click();
    await this.waitForElement(this.selectors.addPaymentModal);
  }

  /**
   * Click delete button for invoice
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickDeleteInvoice(rowIndex) {
    const rowSelector = this.selectors.invoiceRow.replace('{index}', rowIndex);
    const deleteBtn = this.page.locator(rowSelector).locator(this.selectors.deleteButton);
    await deleteBtn.click();
    await this.waitForElement(this.selectors.deleteConfirmModal);
  }

  /**
   * Fill invoice form
   * @param {Object} invoiceData - Invoice data
   */
  async fillInvoiceForm(invoiceData) {
    if (invoiceData.invoiceNumber) {
      await this.fill(this.selectors.invoiceNumberInput, invoiceData.invoiceNumber);
    }
    
    if (invoiceData.customerId) {
      await this.page.selectOption(this.selectors.customerSelect, invoiceData.customerId);
    }
    
    if (invoiceData.invoiceDate) {
      await this.fill(this.selectors.invoiceDateInput, invoiceData.invoiceDate);
    }
    
    if (invoiceData.dueDate) {
      await this.fill(this.selectors.dueDateInput, invoiceData.dueDate);
    }
    
    if (invoiceData.notes) {
      await this.fill(this.selectors.notesTextarea, invoiceData.notes);
    }
    
    if (invoiceData.terms) {
      await this.fill(this.selectors.termsTextarea, invoiceData.terms);
    }
    
    if (invoiceData.paymentTerms) {
      await this.page.selectOption(this.selectors.paymentTermsSelect, invoiceData.paymentTerms);
    }
  }

  /**
   * Add invoice item
   * @param {Object} itemData - Item data
   */
  async addInvoiceItem(itemData) {
    await this.click(this.selectors.addItemButton);
    
    // Wait for new item row to appear
    await this.waitForElement(this.selectors.itemRows);
    
    const lastItemRow = this.page.locator(this.selectors.itemRows).last();
    
    if (itemData.description) {
      await lastItemRow.locator(this.selectors.itemDescriptionInput).fill(itemData.description);
    }
    
    if (itemData.quantity) {
      await lastItemRow.locator(this.selectors.itemQuantityInput).fill(itemData.quantity);
    }
    
    if (itemData.unitPrice) {
      await lastItemRow.locator(this.selectors.itemUnitPriceInput).fill(itemData.unitPrice);
    }
    
    if (itemData.taxRate) {
      await lastItemRow.locator(this.selectors.itemTaxRateInput).fill(itemData.taxRate);
    }
  }

  /**
   * Remove invoice item
   * @param {number} itemIndex - Item index (1-based)
   */
  async removeInvoiceItem(itemIndex) {
    const itemRow = this.page.locator(this.selectors.itemRows).nth(itemIndex - 1);
    await itemRow.locator(this.selectors.removeItemButton).click();
  }

  /**
   * Get invoice totals
   * @returns {Promise<Object>}
   */
  async getInvoiceTotals() {
    return {
      subtotal: await this.getText(this.selectors.subtotalDisplay),
      tax: await this.getText(this.selectors.taxDisplay),
      discount: await this.getText(this.selectors.discountDisplay),
      total: await this.getText(this.selectors.totalDisplay)
    };
  }

  /**
   * Fill payment form
   * @param {Object} paymentData - Payment data
   */
  async fillPaymentForm(paymentData) {
    if (paymentData.paymentAmount) {
      await this.fill(this.selectors.paymentAmountInput, paymentData.paymentAmount);
    }
    
    if (paymentData.paymentDate) {
      await this.fill(this.selectors.paymentDateInput, paymentData.paymentDate);
    }
    
    if (paymentData.paymentMethod) {
      await this.page.selectOption(this.selectors.paymentMethodSelect, paymentData.paymentMethod);
    }
    
    if (paymentData.paymentReference) {
      await this.fill(this.selectors.paymentReferenceInput, paymentData.paymentReference);
    }
    
    if (paymentData.paymentNotes) {
      await this.fill(this.selectors.paymentNotesTextarea, paymentData.paymentNotes);
    }
  }

  /**
   * Fill report form
   * @param {Object} reportData - Report data
   */
  async fillReportForm(reportData) {
    if (reportData.reportType) {
      await this.page.selectOption(this.selectors.reportTypeSelect, reportData.reportType);
    }
    
    if (reportData.reportPeriod) {
      await this.page.selectOption(this.selectors.reportPeriodSelect, reportData.reportPeriod);
    }
    
    if (reportData.reportFormat) {
      await this.page.selectOption(this.selectors.reportFormatSelect, reportData.reportFormat);
    }
    
    if (reportData.startDate) {
      await this.fill(this.selectors.reportStartDateInput, reportData.startDate);
    }
    
    if (reportData.endDate) {
      await this.fill(this.selectors.reportEndDateInput, reportData.endDate);
    }
  }

  /**
   * Save invoice form
   */
  async saveInvoice() {
    await this.click(this.selectors.saveButton);
    await this.waitForLoading();
  }

  /**
   * Cancel invoice form
   */
  async cancelInvoice() {
    await this.click(this.selectors.cancelFormButton);
  }

  /**
   * Confirm delete invoice
   */
  async confirmDeleteInvoice() {
    await this.click(this.selectors.confirmDeleteButton);
    await this.waitForLoading();
  }

  /**
   * Print invoice
   */
  async printInvoice() {
    await this.click(this.selectors.printInvoiceButton);
    await this.waitForLoading();
  }

  /**
   * Send invoice
   */
  async sendInvoice() {
    await this.click(this.selectors.sendInvoiceButton);
    await this.waitForLoading();
  }

  /**
   * Add payment
   */
  async addPayment() {
    await this.click(this.selectors.addPaymentButton);
    await this.waitForLoading();
  }

  /**
   * Mark invoice as paid
   */
  async markPaid() {
    await this.click(this.selectors.markPaidButton);
    await this.waitForLoading();
  }

  /**
   * Generate report
   */
  async generateReport() {
    await this.click(this.selectors.generateReportButton);
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
   * @param {string} modalType - Type of modal (add, edit, view, delete, print, send, payment, markPaid, report)
   * @returns {Promise<boolean>}
   */
  async isModalOpen(modalType) {
    const modalSelectors = {
      add: this.selectors.addInvoiceModal,
      edit: this.selectors.editInvoiceModal,
      view: this.selectors.viewInvoiceModal,
      delete: this.selectors.deleteConfirmModal,
      print: this.selectors.printInvoiceModal,
      send: this.selectors.sendInvoiceModal,
      payment: this.selectors.addPaymentModal,
      markPaid: this.selectors.markPaidModal,
      report: this.selectors.generateReportModal
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
   * Check if invoices table is empty
   * @returns {Promise<boolean>}
   */
  async isTableEmpty() {
    return await this.isVisible(this.selectors.emptyState) || 
           await this.isVisible(this.selectors.noInvoicesMessage);
  }

  /**
   * Get invoice statistics
   * @returns {Promise<Object>}
   */
  async getInvoiceStats() {
    const stats = {};
    
    if (await this.isVisible(this.selectors.totalInvoicesCard)) {
      stats.totalInvoices = await this.getText(this.selectors.totalInvoicesCard);
    }
    
    if (await this.isVisible(this.selectors.pendingInvoicesCard)) {
      stats.pendingInvoices = await this.getText(this.selectors.pendingInvoicesCard);
    }
    
    if (await this.isVisible(this.selectors.paidInvoicesCard)) {
      stats.paidInvoices = await this.getText(this.selectors.paidInvoicesCard);
    }
    
    if (await this.isVisible(this.selectors.overdueInvoicesCard)) {
      stats.overdueInvoices = await this.getText(this.selectors.overdueInvoicesCard);
    }
    
    if (await this.isVisible(this.selectors.totalRevenueCard)) {
      stats.totalRevenue = await this.getText(this.selectors.totalRevenueCard);
    }
    
    if (await this.isVisible(this.selectors.outstandingAmountCard)) {
      stats.outstandingAmount = await this.getText(this.selectors.outstandingAmountCard);
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
   * Validate financial/invoices page elements
   * @returns {Promise<{valid: boolean, missing: string[]}>}
   */
  async validatePageElements() {
    const requiredElements = [
      { selector: this.selectors.header, name: 'Header' },
      { selector: this.selectors.invoicesTable, name: 'Invoices Table' },
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
   * Test invoice creation flow
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testCreateInvoice(invoiceData) {
    try {
      await this.clickAddInvoice();
      await this.fillInvoiceForm(invoiceData);
      
      // Add items if provided
      if (invoiceData.items && invoiceData.items.length > 0) {
        for (const item of invoiceData.items) {
          await this.addInvoiceItem(item);
        }
      }
      
      await this.saveInvoice();
      
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
   * Test invoice search
   * @param {string} searchTerm - Search term
   * @returns {Promise<{found: boolean, count: number}>}
   */
  async testSearch(searchTerm) {
    const initialCount = await this.getInvoiceCount();
    await this.searchInvoices(searchTerm);
    const searchCount = await this.getInvoiceCount();
    
    return {
      found: searchCount > 0,
      count: searchCount
    };
  }
}

module.exports = FinancialInvoicesPage;
