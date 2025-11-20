const BasePage = require('./base-page');

/**
 * Purchase Orders Page Object Model
 */
class PurchaseOrdersPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/admin/purchase/orders';
    
    // Selectors
    this.selectors = {
      // Header elements
      header: '.purchase-orders-header, .page-header, [data-testid="purchase-orders-header"]',
      pageTitle: 'h1, .page-title, [data-testid="page-title"]',
      
      // Action buttons
      addOrderButton: 'button:has-text("Tạo đơn hàng"), button:has-text("Create Order"), [data-testid="add-order-btn"]',
      importButton: 'button:has-text("Import"), [data-testid="import-btn"]',
      exportButton: 'button:has-text("Export"), [data-testid="export-btn"]',
      bulkActionsButton: 'button:has-text("Thao tác hàng loạt"), button:has-text("Bulk Actions"), [data-testid="bulk-actions-btn"]',
      
      // Search and filters
      searchInput: 'input[type="search"], input[placeholder*="Tìm kiếm"], input[placeholder*="Search"], [data-testid="search-input"]',
      supplierFilter: 'select[name="supplier"], [data-testid="supplier-filter"]',
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
      supplierName: 'td:nth-child(2), .supplier-name',
      orderDate: 'td:nth-child(3), .order-date',
      totalAmount: 'td:nth-child(4), .total-amount',
      status: 'td:nth-child(5), .status',
      expectedDelivery: 'td:nth-child(6), .expected-delivery',
      orderActions: 'td:last-child, .order-actions',
      
      // Action buttons in table
      editButton: 'button:has-text("Sửa"), button:has-text("Edit"), [data-testid="edit-btn"]',
      deleteButton: 'button:has-text("Xóa"), button:has-text("Delete"), [data-testid="delete-btn"]',
      viewButton: 'button:has-text("Xem"), button:has-text("View"), [data-testid="view-btn"]',
      approveButton: 'button:has-text("Duyệt"), button:has-text("Approve"), [data-testid="approve-btn"]',
      cancelButton: 'button:has-text("Hủy"), button:has-text("Cancel"), [data-testid="cancel-btn"]',
      receiveButton: 'button:has-text("Nhận hàng"), button:has-text("Receive"), [data-testid="receive-btn"]',
      
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
      approveOrderModal: '.modal, [data-testid="approve-order-modal"]',
      receiveOrderModal: '.modal, [data-testid="receive-order-modal"]',
      modalTitle: '.modal-title, .modal h2',
      modalCloseButton: '.modal-close, button:has-text("Đóng"), button:has-text("Close")',
      
      // Form fields
      orderNumberInput: 'input[name="orderNumber"], [data-testid="order-number-input"]',
      supplierSelect: 'select[name="supplierId"], [data-testid="supplier-select"]',
      orderDateInput: 'input[name="orderDate"], [data-testid="order-date-input"]',
      expectedDeliveryInput: 'input[name="expectedDelivery"], [data-testid="expected-delivery-input"]',
      notesTextarea: 'textarea[name="notes"], [data-testid="notes-textarea"]',
      
      // Order items
      addItemButton: 'button:has-text("Thêm sản phẩm"), button:has-text("Add Item"), [data-testid="add-item-btn"]',
      itemRows: '.order-item-row, [data-testid="order-item-row"]',
      itemProductSelect: 'select[name="productId"], [data-testid="item-product-select"]',
      itemQuantityInput: 'input[name="quantity"], [data-testid="item-quantity-input"]',
      itemUnitPriceInput: 'input[name="unitPrice"], [data-testid="item-unit-price-input"]',
      itemTotalInput: 'input[name="total"], [data-testid="item-total-input"]',
      removeItemButton: 'button:has-text("Xóa"), button:has-text("Remove"), [data-testid="remove-item-btn"]',
      
      // Order totals
      subtotalDisplay: '.subtotal, [data-testid="subtotal"]',
      taxDisplay: '.tax, [data-testid="tax"]',
      totalDisplay: '.total, [data-testid="total"]',
      
      // Form buttons
      saveButton: 'button:has-text("Lưu"), button:has-text("Save"), [data-testid="save-btn"]',
      cancelFormButton: 'button:has-text("Hủy"), button:has-text("Cancel"), [data-testid="cancel-btn"]',
      confirmDeleteButton: 'button:has-text("Xác nhận"), button:has-text("Confirm"), [data-testid="confirm-delete-btn"]',
      approveOrderButton: 'button:has-text("Duyệt đơn"), button:has-text("Approve Order"), [data-testid="approve-order-btn"]',
      receiveOrderButton: 'button:has-text("Nhận hàng"), button:has-text("Receive Order"), [data-testid="receive-order-btn"]',
      
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
      approvedOrdersCard: '.approved-orders-card, [data-testid="approved-orders-card"]',
      totalValueCard: '.total-value-card, [data-testid="total-value-card"]',
      
      // Status badges
      pendingBadge: '.status-pending, [data-testid="status-pending"]',
      approvedBadge: '.status-approved, [data-testid="status-approved"]',
      receivedBadge: '.status-received, [data-testid="status-received"]',
      cancelledBadge: '.status-cancelled, [data-testid="status-cancelled"]'
    };
  }

  /**
   * Navigate to purchase orders page
   */
  async goto() {
    await super.goto(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for purchase orders page to load completely
   */
  async waitForPageLoad() {
    await this.waitForElement(this.selectors.header);
    await this.waitForLoading();
  }

  /**
   * Check if purchase orders page is loaded
   * @returns {Promise<boolean>}
   */
  async isPurchaseOrdersPageLoaded() {
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
   * Filter orders by supplier
   * @param {string} supplierId - Supplier ID
   */
  async filterBySupplier(supplierId) {
    await this.page.selectOption(this.selectors.supplierFilter, supplierId);
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
      supplierName: await row.locator(this.selectors.supplierName).textContent(),
      orderDate: await row.locator(this.selectors.orderDate).textContent(),
      totalAmount: await row.locator(this.selectors.totalAmount).textContent(),
      status: await row.locator(this.selectors.status).textContent(),
      expectedDelivery: await row.locator(this.selectors.expectedDelivery).textContent()
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
   * Click approve button for order
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickApproveOrder(rowIndex) {
    const rowSelector = this.selectors.orderRow.replace('{index}', rowIndex);
    const approveBtn = this.page.locator(rowSelector).locator(this.selectors.approveButton);
    await approveBtn.click();
    await this.waitForElement(this.selectors.approveOrderModal);
  }

  /**
   * Click receive button for order
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickReceiveOrder(rowIndex) {
    const rowSelector = this.selectors.orderRow.replace('{index}', rowIndex);
    const receiveBtn = this.page.locator(rowSelector).locator(this.selectors.receiveButton);
    await receiveBtn.click();
    await this.waitForElement(this.selectors.receiveOrderModal);
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
    
    if (orderData.supplierId) {
      await this.page.selectOption(this.selectors.supplierSelect, orderData.supplierId);
    }
    
    if (orderData.orderDate) {
      await this.fill(this.selectors.orderDateInput, orderData.orderDate);
    }
    
    if (orderData.expectedDelivery) {
      await this.fill(this.selectors.expectedDeliveryInput, orderData.expectedDelivery);
    }
    
    if (orderData.notes) {
      await this.fill(this.selectors.notesTextarea, orderData.notes);
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
   * Approve order
   */
  async approveOrder() {
    await this.click(this.selectors.approveOrderButton);
    await this.waitForLoading();
  }

  /**
   * Receive order
   */
  async receiveOrder() {
    await this.click(this.selectors.receiveOrderButton);
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
   * @param {string} modalType - Type of modal (add, edit, view, delete, approve, receive)
   * @returns {Promise<boolean>}
   */
  async isModalOpen(modalType) {
    const modalSelectors = {
      add: this.selectors.addOrderModal,
      edit: this.selectors.editOrderModal,
      view: this.selectors.viewOrderModal,
      delete: this.selectors.deleteConfirmModal,
      approve: this.selectors.approveOrderModal,
      receive: this.selectors.receiveOrderModal
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
    
    if (await this.isVisible(this.selectors.approvedOrdersCard)) {
      stats.approvedOrders = await this.getText(this.selectors.approvedOrdersCard);
    }
    
    if (await this.isVisible(this.selectors.totalValueCard)) {
      stats.totalValue = await this.getText(this.selectors.totalValueCard);
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
   * Validate purchase orders page elements
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

module.exports = PurchaseOrdersPage;

