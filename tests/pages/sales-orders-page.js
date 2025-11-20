const BasePage = require('./base-page');

/**
 * Sales Orders Page Object Model
 */
class SalesOrdersPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/admin/sales/orders';
    
    // Selectors
    this.selectors = {
      // Header elements
      header: '.sales-orders-header, .page-header, [data-testid="sales-orders-header"]',
      pageTitle: 'h1, .page-title, [data-testid="page-title"]',
      
      // Action buttons
      addOrderButton: 'button:has-text("Tạo đơn hàng"), button:has-text("Create Order"), [data-testid="add-order-btn"]',
      importButton: 'button:has-text("Import"), [data-testid="import-btn"]',
      exportButton: 'button:has-text("Export"), [data-testid="export-btn"]',
      bulkActionsButton: 'button:has-text("Thao tác hàng loạt"), button:has-text("Bulk Actions"), [data-testid="bulk-actions-btn"]',
      
      // Search and filters
      searchInput: 'input[type="search"], input[placeholder*="Tìm kiếm"], input[placeholder*="Search"], [data-testid="search-input"]',
      customerFilter: 'select[name="customer"], [data-testid="customer-filter"]',
      statusFilter: 'select[name="status"], [data-testid="status-filter"]',
      dateRangeFilter: 'input[name="dateRange"], [data-testid="date-range-filter"]',
      amountRangeFilter: 'input[name="amountRange"], [data-testid="amount-range-filter"]',
      
      // Orders table
      ordersTable: '.orders-table, table, [data-testid="orders-table"]',
      tableHeader: 'thead, .table-header',
      tableBody: 'tbody, .table-body',
      orderRows: 'tbody tr, .order-row',
      orderRow: 'tbody tr:nth-child({index}), .order-row:nth-child({index})',
      
      // Order row elements
      orderNumber: 'td:nth-child(1), .order-number',
      customerName: 'td:nth-child(2), .customer-name',
      orderDate: 'td:nth-child(3), .order-date',
      totalAmount: 'td:nth-child(4), .total-amount',
      status: 'td:nth-child(5), .status',
      paymentStatus: 'td:nth-child(6), .payment-status',
      orderActions: 'td:last-child, .order-actions',
      
      // Action buttons in table
      editButton: 'button:has-text("Sửa"), button:has-text("Edit"), [data-testid="edit-btn"]',
      deleteButton: 'button:has-text("Xóa"), button:has-text("Delete"), [data-testid="delete-btn"]',
      viewButton: 'button:has-text("Xem"), button:has-text("View"), [data-testid="view-btn"]',
      processButton: 'button:has-text("Xử lý"), button:has-text("Process"), [data-testid="process-btn"]',
      shipButton: 'button:has-text("Giao hàng"), button:has-text("Ship"), [data-testid="ship-btn"]',
      invoiceButton: 'button:has-text("Tạo hóa đơn"), button:has-text("Create Invoice"), [data-testid="invoice-btn"]',
      
      // Pagination
      pagination: '.pagination, [data-testid="pagination"]',
      pageNumbers: '.page-number, .pagination button',
      nextPageButton: 'button:has-text("Trang sau"), button:has-text("Next"), [data-testid="next-page"]',
      prevPageButton: 'button:has-text("Trang trước"), button:has-text("Previous"), [data-testid="prev-page"]',
      
      // Modals
      addOrderModal: '.modal, [data-testid="add-order-modal"]',
      editOrderModal: '.modal, [data-testid="edit-order-modal"]',
      viewOrderModal: '.modal, [data-testid="view-order-modal"]',
      deleteConfirmModal: '.modal, [data-testid="delete-confirm-modal"]',
      processOrderModal: '.modal, [data-testid="process-order-modal"]',
      shipOrderModal: '.modal, [data-testid="ship-order-modal"]',
      createInvoiceModal: '.modal, [data-testid="create-invoice-modal"]',
      modalTitle: '.modal-title, .modal h2',
      modalCloseButton: '.modal-close, button:has-text("Đóng"), button:has-text("Close")',
      
      // Form fields
      orderNumberInput: 'input[name="orderNumber"], [data-testid="order-number-input"]',
      customerSelect: 'select[name="customerId"], [data-testid="customer-select"]',
      orderDateInput: 'input[name="orderDate"], [data-testid="order-date-input"]',
      deliveryDateInput: 'input[name="deliveryDate"], [data-testid="delivery-date-input"]',
      notesTextarea: 'textarea[name="notes"], [data-testid="notes-textarea"]',
      paymentMethodSelect: 'select[name="paymentMethod"], [data-testid="payment-method-select"]',
      shippingAddressTextarea: 'textarea[name="shippingAddress"], [data-testid="shipping-address-textarea"]',
      
      // Order items
      addItemButton: 'button:has-text("Thêm sản phẩm"), button:has-text("Add Item"), [data-testid="add-item-btn"]',
      itemRows: '.order-item-row, [data-testid="order-item-row"]',
      itemProductSelect: 'select[name="productId"], [data-testid="item-product-select"]',
      itemQuantityInput: 'input[name="quantity"], [data-testid="item-quantity-input"]',
      itemUnitPriceInput: 'input[name="unitPrice"], [data-testid="item-unit-price-input"]',
      itemDiscountInput: 'input[name="discount"], [data-testid="item-discount-input"]',
      itemTotalInput: 'input[name="total"], [data-testid="item-total-input"]',
      removeItemButton: 'button:has-text("Xóa"), button:has-text("Remove"), [data-testid="remove-item-btn"]',
      
      // Order totals
      subtotalDisplay: '.subtotal, [data-testid="subtotal"]',
      taxDisplay: '.tax, [data-testid="tax"]',
      discountDisplay: '.discount, [data-testid="discount"]',
      shippingDisplay: '.shipping, [data-testid="shipping"]',
      totalDisplay: '.total, [data-testid="total"]',
      
      // Form buttons
      saveButton: 'button:has-text("Lưu"), button:has-text("Save"), [data-testid="save-btn"]',
      cancelFormButton: 'button:has-text("Hủy"), button:has-text("Cancel"), [data-testid="cancel-btn"]',
      confirmDeleteButton: 'button:has-text("Xác nhận"), button:has-text("Confirm"), [data-testid="confirm-delete-btn"]',
      processOrderButton: 'button:has-text("Xử lý đơn"), button:has-text("Process Order"), [data-testid="process-order-btn"]',
      shipOrderButton: 'button:has-text("Giao hàng"), button:has-text("Ship Order"), [data-testid="ship-order-btn"]',
      createInvoiceButton: 'button:has-text("Tạo hóa đơn"), button:has-text("Create Invoice"), [data-testid="create-invoice-btn"]',
      
      // Loading states
      loadingSpinner: '.loading, .spinner, .animate-spin, [data-testid="loading"]',
      
      // Messages
      successMessage: '.success-message, .alert-success, .text-green-500, [data-testid="success-message"]',
      errorMessage: '.error-message, .alert-error, .text-red-500, [data-testid="error-message"]',
      
      // Empty state
      emptyState: '.empty-state, [data-testid="empty-state"]',
      noOrdersMessage: '.no-orders, [data-testid="no-orders"]',
      
      // Statistics cards
      totalOrdersCard: '.total-orders-card, [data-testid="total-orders-card"]',
      pendingOrdersCard: '.pending-orders-card, [data-testid="pending-orders-card"]',
      processedOrdersCard: '.processed-orders-card, [data-testid="processed-orders-card"]',
      totalRevenueCard: '.total-revenue-card, [data-testid="total-revenue-card"]',
      
      // Status badges
      pendingBadge: '.status-pending, [data-testid="status-pending"]',
      processingBadge: '.status-processing, [data-testid="status-processing"]',
      shippedBadge: '.status-shipped, [data-testid="status-shipped"]',
      deliveredBadge: '.status-delivered, [data-testid="status-delivered"]',
      cancelledBadge: '.status-cancelled, [data-testid="status-cancelled"]',
      
      // Payment status badges
      unpaidBadge: '.payment-unpaid, [data-testid="payment-unpaid"]',
      partialBadge: '.payment-partial, [data-testid="payment-partial"]',
      paidBadge: '.payment-paid, [data-testid="payment-paid"]',
      refundedBadge: '.payment-refunded, [data-testid="payment-refunded"]'
    };
  }

  /**
   * Navigate to sales orders page
   */
  async goto() {
    await super.goto(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for sales orders page to load completely
   */
  async waitForPageLoad() {
    await this.waitForElement(this.selectors.header);
    await this.waitForLoading();
  }

  /**
   * Check if sales orders page is loaded
   * @returns {Promise<boolean>}
   */
  async isSalesOrdersPageLoaded() {
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
   * Click add order button
   */
  async clickAddOrder() {
    await this.click(this.selectors.addOrderButton);
    await this.waitForElement(this.selectors.addOrderModal);
  }

  /**
   * Click bulk actions button
   */
  async clickBulkActions() {
    await this.click(this.selectors.bulkActionsButton);
    await this.waitForElement(this.selectors.bulkActionsModal);
  }

  /**
   * Search for orders
   * @param {string} searchTerm - Search term
   */
  async searchOrders(searchTerm) {
    await this.fill(this.selectors.searchInput, searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForLoading();
  }

  /**
   * Filter orders by customer
   * @param {string} customerId - Customer ID
   */
  async filterByCustomer(customerId) {
    await this.page.selectOption(this.selectors.customerFilter, customerId);
    await this.waitForLoading();
  }

  /**
   * Filter orders by status
   * @param {string} status - Order status
   */
  async filterByStatus(status) {
    await this.page.selectOption(this.selectors.statusFilter, status);
    await this.waitForLoading();
  }

  /**
   * Get all order rows
   * @returns {Promise<Array>}
   */
  async getOrderRows() {
    if (!(await this.isVisible(this.selectors.ordersTable))) {
      return [];
    }
    
    const rows = await this.page.locator(this.selectors.orderRows).all();
    return rows;
  }

  /**
   * Get order count
   * @returns {Promise<number>}
   */
  async getOrderCount() {
    const rows = await this.getOrderRows();
    return rows.length;
  }

  /**
   * Get order data from row
   * @param {number} rowIndex - Row index (1-based)
   * @returns {Promise<Object>}
   */
  async getOrderData(rowIndex) {
    const rowSelector = this.selectors.orderRow.replace('{index}', rowIndex);
    
    if (!(await this.exists(rowSelector))) {
      throw new Error(`Order row ${rowIndex} not found`);
    }
    
    const row = this.page.locator(rowSelector);
    
    return {
      orderNumber: await row.locator(this.selectors.orderNumber).textContent(),
      customerName: await row.locator(this.selectors.customerName).textContent(),
      orderDate: await row.locator(this.selectors.orderDate).textContent(),
      totalAmount: await row.locator(this.selectors.totalAmount).textContent(),
      status: await row.locator(this.selectors.status).textContent(),
      paymentStatus: await row.locator(this.selectors.paymentStatus).textContent()
    };
  }

  /**
   * Click edit button for order
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickEditOrder(rowIndex) {
    const rowSelector = this.selectors.orderRow.replace('{index}', rowIndex);
    const editBtn = this.page.locator(rowSelector).locator(this.selectors.editButton);
    await editBtn.click();
    await this.waitForElement(this.selectors.editOrderModal);
  }

  /**
   * Click view button for order
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickViewOrder(rowIndex) {
    const rowSelector = this.selectors.orderRow.replace('{index}', rowIndex);
    const viewBtn = this.page.locator(rowSelector).locator(this.selectors.viewButton);
    await viewBtn.click();
    await this.waitForElement(this.selectors.viewOrderModal);
  }

  /**
   * Click process button for order
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickProcessOrder(rowIndex) {
    const rowSelector = this.selectors.orderRow.replace('{index}', rowIndex);
    const processBtn = this.page.locator(rowSelector).locator(this.selectors.processButton);
    await processBtn.click();
    await this.waitForElement(this.selectors.processOrderModal);
  }

  /**
   * Click ship button for order
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickShipOrder(rowIndex) {
    const rowSelector = this.selectors.orderRow.replace('{index}', rowIndex);
    const shipBtn = this.page.locator(rowSelector).locator(this.selectors.shipButton);
    await shipBtn.click();
    await this.waitForElement(this.selectors.shipOrderModal);
  }

  /**
   * Click invoice button for order
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickCreateInvoice(rowIndex) {
    const rowSelector = this.selectors.orderRow.replace('{index}', rowIndex);
    const invoiceBtn = this.page.locator(rowSelector).locator(this.selectors.invoiceButton);
    await invoiceBtn.click();
    await this.waitForElement(this.selectors.createInvoiceModal);
  }

  /**
   * Click delete button for order
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickDeleteOrder(rowIndex) {
    const rowSelector = this.selectors.orderRow.replace('{index}', rowIndex);
    const deleteBtn = this.page.locator(rowSelector).locator(this.selectors.deleteButton);
    await deleteBtn.click();
    await this.waitForElement(this.selectors.deleteConfirmModal);
  }

  /**
   * Fill order form
   * @param {Object} orderData - Order data
   */
  async fillOrderForm(orderData) {
    if (orderData.orderNumber) {
      await this.fill(this.selectors.orderNumberInput, orderData.orderNumber);
    }
    
    if (orderData.customerId) {
      await this.page.selectOption(this.selectors.customerSelect, orderData.customerId);
    }
    
    if (orderData.orderDate) {
      await this.fill(this.selectors.orderDateInput, orderData.orderDate);
    }
    
    if (orderData.deliveryDate) {
      await this.fill(this.selectors.deliveryDateInput, orderData.deliveryDate);
    }
    
    if (orderData.notes) {
      await this.fill(this.selectors.notesTextarea, orderData.notes);
    }
    
    if (orderData.paymentMethod) {
      await this.page.selectOption(this.selectors.paymentMethodSelect, orderData.paymentMethod);
    }
    
    if (orderData.shippingAddress) {
      await this.fill(this.selectors.shippingAddressTextarea, orderData.shippingAddress);
    }
  }

  /**
   * Add order item
   * @param {Object} itemData - Item data
   */
  async addOrderItem(itemData) {
    await this.click(this.selectors.addItemButton);
    
    // Wait for new item row to appear
    await this.waitForElement(this.selectors.itemRows);
    
    const lastItemRow = this.page.locator(this.selectors.itemRows).last();
    
    if (itemData.productId) {
      await lastItemRow.locator(this.selectors.itemProductSelect).selectOption(itemData.productId);
    }
    
    if (itemData.quantity) {
      await lastItemRow.locator(this.selectors.itemQuantityInput).fill(itemData.quantity);
    }
    
    if (itemData.unitPrice) {
      await lastItemRow.locator(this.selectors.itemUnitPriceInput).fill(itemData.unitPrice);
    }
    
    if (itemData.discount) {
      await lastItemRow.locator(this.selectors.itemDiscountInput).fill(itemData.discount);
    }
  }

  /**
   * Remove order item
   * @param {number} itemIndex - Item index (1-based)
   */
  async removeOrderItem(itemIndex) {
    const itemRow = this.page.locator(this.selectors.itemRows).nth(itemIndex - 1);
    await itemRow.locator(this.selectors.removeItemButton).click();
  }

  /**
   * Get order totals
   * @returns {Promise<Object>}
   */
  async getOrderTotals() {
    return {
      subtotal: await this.getText(this.selectors.subtotalDisplay),
      tax: await this.getText(this.selectors.taxDisplay),
      discount: await this.getText(this.selectors.discountDisplay),
      shipping: await this.getText(this.selectors.shippingDisplay),
      total: await this.getText(this.selectors.totalDisplay)
    };
  }

  /**
   * Save order form
   */
  async saveOrder() {
    await this.click(this.selectors.saveButton);
    await this.waitForLoading();
  }

  /**
   * Cancel order form
   */
  async cancelOrder() {
    await this.click(this.selectors.cancelFormButton);
  }

  /**
   * Confirm delete order
   */
  async confirmDeleteOrder() {
    await this.click(this.selectors.confirmDeleteButton);
    await this.waitForLoading();
  }

  /**
   * Process order
   */
  async processOrder() {
    await this.click(this.selectors.processOrderButton);
    await this.waitForLoading();
  }

  /**
   * Ship order
   */
  async shipOrder() {
    await this.click(this.selectors.shipOrderButton);
    await this.waitForLoading();
  }

  /**
   * Create invoice
   */
  async createInvoice() {
    await this.click(this.selectors.createInvoiceButton);
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
   * @param {string} modalType - Type of modal (add, edit, view, delete, process, ship, invoice)
   * @returns {Promise<boolean>}
   */
  async isModalOpen(modalType) {
    const modalSelectors = {
      add: this.selectors.addOrderModal,
      edit: this.selectors.editOrderModal,
      view: this.selectors.viewOrderModal,
      delete: this.selectors.deleteConfirmModal,
      process: this.selectors.processOrderModal,
      ship: this.selectors.shipOrderModal,
      invoice: this.selectors.createInvoiceModal
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
   * Check if orders table is empty
   * @returns {Promise<boolean>}
   */
  async isTableEmpty() {
    return await this.isVisible(this.selectors.emptyState) || 
           await this.isVisible(this.selectors.noOrdersMessage);
  }

  /**
   * Get order statistics
   * @returns {Promise<Object>}
   */
  async getOrderStats() {
    const stats = {};
    
    if (await this.isVisible(this.selectors.totalOrdersCard)) {
      stats.totalOrders = await this.getText(this.selectors.totalOrdersCard);
    }
    
    if (await this.isVisible(this.selectors.pendingOrdersCard)) {
      stats.pendingOrders = await this.getText(this.selectors.pendingOrdersCard);
    }
    
    if (await this.isVisible(this.selectors.processedOrdersCard)) {
      stats.processedOrders = await this.getText(this.selectors.processedOrdersCard);
    }
    
    if (await this.isVisible(this.selectors.totalRevenueCard)) {
      stats.totalRevenue = await this.getText(this.selectors.totalRevenueCard);
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
   * Validate sales orders page elements
   * @returns {Promise<{valid: boolean, missing: string[]}>}
   */
  async validatePageElements() {
    const requiredElements = [
      { selector: this.selectors.header, name: 'Header' },
      { selector: this.selectors.ordersTable, name: 'Orders Table' },
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
   * Test order creation flow
   * @param {Object} orderData - Order data
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testCreateOrder(orderData) {
    try {
      await this.clickAddOrder();
      await this.fillOrderForm(orderData);
      
      // Add items if provided
      if (orderData.items && orderData.items.length > 0) {
        for (const item of orderData.items) {
          await this.addOrderItem(item);
        }
      }
      
      await this.saveOrder();
      
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
   * Test order search
   * @param {string} searchTerm - Search term
   * @returns {Promise<{found: boolean, count: number}>}
   */
  async testSearch(searchTerm) {
    const initialCount = await this.getOrderCount();
    await this.searchOrders(searchTerm);
    const searchCount = await this.getOrderCount();
    
    return {
      found: searchCount > 0,
      count: searchCount
    };
  }
}

module.exports = SalesOrdersPage;
