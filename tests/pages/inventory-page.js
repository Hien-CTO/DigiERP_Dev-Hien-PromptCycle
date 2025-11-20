const BasePage = require('./base-page');

/**
 * Inventory Page Object Model
 */
class InventoryPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/admin/inventory';
    
    // Selectors
    this.selectors = {
      // Header elements
      header: '.inventory-header, .page-header, [data-testid="inventory-header"]',
      pageTitle: 'h1, .page-title, [data-testid="page-title"]',
      
      // Action buttons
      addInventoryButton: 'button:has-text("Thêm tồn kho"), button:has-text("Add Inventory"), [data-testid="add-inventory-btn"]',
      importButton: 'button:has-text("Import"), [data-testid="import-btn"]',
      exportButton: 'button:has-text("Export"), [data-testid="export-btn"]',
      adjustStockButton: 'button:has-text("Điều chỉnh"), button:has-text("Adjust Stock"), [data-testid="adjust-stock-btn"]',
      
      // Search and filters
      searchInput: 'input[type="search"], input[placeholder*="Tìm kiếm"], input[placeholder*="Search"], [data-testid="search-input"]',
      productFilter: 'select[name="product"], [data-testid="product-filter"]',
      warehouseFilter: 'select[name="warehouse"], [data-testid="warehouse-filter"]',
      statusFilter: 'select[name="status"], [data-testid="status-filter"]',
      stockLevelFilter: 'select[name="stockLevel"], [data-testid="stock-level-filter"]',
      
      // Inventory table
      inventoryTable: '.inventory-table, table, [data-testid="inventory-table"]',
      tableHeader: 'thead, .table-header',
      tableBody: 'tbody, .table-body',
      inventoryRows: 'tbody tr, .inventory-row',
      inventoryRow: 'tbody tr:nth-child({index}), .inventory-row:nth-child({index})',
      
      // Inventory row elements
      productName: 'td:nth-child(1), .product-name',
      productSku: 'td:nth-child(2), .product-sku',
      warehouseName: 'td:nth-child(3), .warehouse-name',
      currentStock: 'td:nth-child(4), .current-stock',
      reservedStock: 'td:nth-child(5), .reserved-stock',
      availableStock: 'td:nth-child(6), .available-stock',
      stockStatus: 'td:nth-child(7), .stock-status',
      lastUpdated: 'td:nth-child(8), .last-updated',
      inventoryActions: 'td:last-child, .inventory-actions',
      
      // Action buttons in table
      editButton: 'button:has-text("Sửa"), button:has-text("Edit"), [data-testid="edit-btn"]',
      deleteButton: 'button:has-text("Xóa"), button:has-text("Delete"), [data-testid="delete-btn"]',
      viewButton: 'button:has-text("Xem"), button:has-text("View"), [data-testid="view-btn"]',
      adjustButton: 'button:has-text("Điều chỉnh"), button:has-text("Adjust"), [data-testid="adjust-btn"]',
      
      // Pagination
      pagination: '.pagination, [data-testid="pagination"]',
      pageNumbers: '.page-number, .pagination button',
      nextPageButton: 'button:has-text("Trang sau"), button:has-text("Next"), [data-testid="next-page"]',
      prevPageButton: 'button:has-text("Trang trước"), button:has-text("Previous"), [data-testid="prev-page"]',
      
      // Modals
      addInventoryModal: '.modal, [data-testid="add-inventory-modal"]',
      editInventoryModal: '.modal, [data-testid="edit-inventory-modal"]',
      adjustStockModal: '.modal, [data-testid="adjust-stock-modal"]',
      deleteConfirmModal: '.modal, [data-testid="delete-confirm-modal"]',
      modalTitle: '.modal-title, .modal h2',
      modalCloseButton: '.modal-close, button:has-text("Đóng"), button:has-text("Close")',
      
      // Form fields
      productSelect: 'select[name="productId"], [data-testid="product-select"]',
      warehouseSelect: 'select[name="warehouseId"], [data-testid="warehouse-select"]',
      currentStockInput: 'input[name="currentStock"], [data-testid="current-stock-input"]',
      reservedStockInput: 'input[name="reservedStock"], [data-testid="reserved-stock-input"]',
      minStockInput: 'input[name="minStock"], [data-testid="min-stock-input"]',
      maxStockInput: 'input[name="maxStock"], [data-testid="max-stock-input"]',
      adjustmentTypeSelect: 'select[name="adjustmentType"], [data-testid="adjustment-type-select"]',
      adjustmentQuantityInput: 'input[name="adjustmentQuantity"], [data-testid="adjustment-quantity-input"]',
      adjustmentReasonInput: 'textarea[name="reason"], [data-testid="adjustment-reason-input"]',
      
      // Form buttons
      saveButton: 'button:has-text("Lưu"), button:has-text("Save"), [data-testid="save-btn"]',
      cancelButton: 'button:has-text("Hủy"), button:has-text("Cancel"), [data-testid="cancel-btn"]',
      confirmDeleteButton: 'button:has-text("Xác nhận"), button:has-text("Confirm"), [data-testid="confirm-delete-btn"]',
      applyAdjustmentButton: 'button:has-text("Áp dụng"), button:has-text("Apply"), [data-testid="apply-adjustment-btn"]',
      
      // Loading states
      loadingSpinner: '.loading, .spinner, .animate-spin, [data-testid="loading"]',
      
      // Messages
      successMessage: '.success-message, .alert-success, .text-green-500, [data-testid="success-message"]',
      errorMessage: '.error-message, .alert-error, .text-red-500, [data-testid="error-message"]',
      
      // Empty state
      emptyState: '.empty-state, [data-testid="empty-state"]',
      noInventoryMessage: '.no-inventory, [data-testid="no-inventory"]',
      
      // Stock alerts
      lowStockAlert: '.low-stock-alert, [data-testid="low-stock-alert"]',
      outOfStockAlert: '.out-of-stock-alert, [data-testid="out-of-stock-alert"]',
      
      // Statistics cards
      totalProductsCard: '.total-products-card, [data-testid="total-products-card"]',
      lowStockCard: '.low-stock-card, [data-testid="low-stock-card"]',
      outOfStockCard: '.out-of-stock-card, [data-testid="out-of-stock-card"]',
      totalValueCard: '.total-value-card, [data-testid="total-value-card"]'
    };
  }

  /**
   * Navigate to inventory page
   */
  async goto() {
    await super.goto(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for inventory page to load completely
   */
  async waitForPageLoad() {
    await this.waitForElement(this.selectors.header);
    await this.waitForLoading();
  }

  /**
   * Check if inventory page is loaded
   * @returns {Promise<boolean>}
   */
  async isInventoryPageLoaded() {
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
   * Click add inventory button
   */
  async clickAddInventory() {
    await this.click(this.selectors.addInventoryButton);
    await this.waitForElement(this.selectors.addInventoryModal);
  }

  /**
   * Click adjust stock button
   */
  async clickAdjustStock() {
    await this.click(this.selectors.adjustStockButton);
    await this.waitForElement(this.selectors.adjustStockModal);
  }

  /**
   * Search for inventory items
   * @param {string} searchTerm - Search term
   */
  async searchInventory(searchTerm) {
    await this.fill(this.selectors.searchInput, searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForLoading();
  }

  /**
   * Filter inventory by product
   * @param {string} productId - Product ID
   */
  async filterByProduct(productId) {
    await this.page.selectOption(this.selectors.productFilter, productId);
    await this.waitForLoading();
  }

  /**
   * Filter inventory by warehouse
   * @param {string} warehouseId - Warehouse ID
   */
  async filterByWarehouse(warehouseId) {
    await this.page.selectOption(this.selectors.warehouseFilter, warehouseId);
    await this.waitForLoading();
  }

  /**
   * Filter inventory by stock level
   * @param {string} stockLevel - Stock level (low, normal, high, out)
   */
  async filterByStockLevel(stockLevel) {
    await this.page.selectOption(this.selectors.stockLevelFilter, stockLevel);
    await this.waitForLoading();
  }

  /**
   * Get all inventory rows
   * @returns {Promise<Array>}
   */
  async getInventoryRows() {
    if (!(await this.isVisible(this.selectors.inventoryTable))) {
      return [];
    }
    
    const rows = await this.page.locator(this.selectors.inventoryRows).all();
    return rows;
  }

  /**
   * Get inventory count
   * @returns {Promise<number>}
   */
  async getInventoryCount() {
    const rows = await this.getInventoryRows();
    return rows.length;
  }

  /**
   * Get inventory data from row
   * @param {number} rowIndex - Row index (1-based)
   * @returns {Promise<Object>}
   */
  async getInventoryData(rowIndex) {
    const rowSelector = this.selectors.inventoryRow.replace('{index}', rowIndex);
    
    if (!(await this.exists(rowSelector))) {
      throw new Error(`Inventory row ${rowIndex} not found`);
    }
    
    const row = this.page.locator(rowSelector);
    
    return {
      productName: await row.locator(this.selectors.productName).textContent(),
      productSku: await row.locator(this.selectors.productSku).textContent(),
      warehouseName: await row.locator(this.selectors.warehouseName).textContent(),
      currentStock: await row.locator(this.selectors.currentStock).textContent(),
      reservedStock: await row.locator(this.selectors.reservedStock).textContent(),
      availableStock: await row.locator(this.selectors.availableStock).textContent(),
      stockStatus: await row.locator(this.selectors.stockStatus).textContent(),
      lastUpdated: await row.locator(this.selectors.lastUpdated).textContent()
    };
  }

  /**
   * Click edit button for inventory item
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickEditInventory(rowIndex) {
    const rowSelector = this.selectors.inventoryRow.replace('{index}', rowIndex);
    const editBtn = this.page.locator(rowSelector).locator(this.selectors.editButton);
    await editBtn.click();
    await this.waitForElement(this.selectors.editInventoryModal);
  }

  /**
   * Click adjust button for inventory item
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickAdjustInventory(rowIndex) {
    const rowSelector = this.selectors.inventoryRow.replace('{index}', rowIndex);
    const adjustBtn = this.page.locator(rowSelector).locator(this.selectors.adjustButton);
    await adjustBtn.click();
    await this.waitForElement(this.selectors.adjustStockModal);
  }

  /**
   * Click delete button for inventory item
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickDeleteInventory(rowIndex) {
    const rowSelector = this.selectors.inventoryRow.replace('{index}', rowIndex);
    const deleteBtn = this.page.locator(rowSelector).locator(this.selectors.deleteButton);
    await deleteBtn.click();
    await this.waitForElement(this.selectors.deleteConfirmModal);
  }

  /**
   * Fill inventory form
   * @param {Object} inventoryData - Inventory data
   */
  async fillInventoryForm(inventoryData) {
    if (inventoryData.productId) {
      await this.page.selectOption(this.selectors.productSelect, inventoryData.productId);
    }
    
    if (inventoryData.warehouseId) {
      await this.page.selectOption(this.selectors.warehouseSelect, inventoryData.warehouseId);
    }
    
    if (inventoryData.currentStock) {
      await this.fill(this.selectors.currentStockInput, inventoryData.currentStock);
    }
    
    if (inventoryData.reservedStock) {
      await this.fill(this.selectors.reservedStockInput, inventoryData.reservedStock);
    }
    
    if (inventoryData.minStock) {
      await this.fill(this.selectors.minStockInput, inventoryData.minStock);
    }
    
    if (inventoryData.maxStock) {
      await this.fill(this.selectors.maxStockInput, inventoryData.maxStock);
    }
  }

  /**
   * Fill stock adjustment form
   * @param {Object} adjustmentData - Adjustment data
   */
  async fillAdjustmentForm(adjustmentData) {
    if (adjustmentData.adjustmentType) {
      await this.page.selectOption(this.selectors.adjustmentTypeSelect, adjustmentData.adjustmentType);
    }
    
    if (adjustmentData.adjustmentQuantity) {
      await this.fill(this.selectors.adjustmentQuantityInput, adjustmentData.adjustmentQuantity);
    }
    
    if (adjustmentData.reason) {
      await this.fill(this.selectors.adjustmentReasonInput, adjustmentData.reason);
    }
  }

  /**
   * Save inventory form
   */
  async saveInventory() {
    await this.click(this.selectors.saveButton);
    await this.waitForLoading();
  }

  /**
   * Apply stock adjustment
   */
  async applyAdjustment() {
    await this.click(this.selectors.applyAdjustmentButton);
    await this.waitForLoading();
  }

  /**
   * Cancel inventory form
   */
  async cancelInventory() {
    await this.click(this.selectors.cancelButton);
  }

  /**
   * Confirm delete inventory
   */
  async confirmDeleteInventory() {
    await this.click(this.selectors.confirmDeleteButton);
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
   * @param {string} modalType - Type of modal (add, edit, adjust, delete)
   * @returns {Promise<boolean>}
   */
  async isModalOpen(modalType) {
    const modalSelectors = {
      add: this.selectors.addInventoryModal,
      edit: this.selectors.editInventoryModal,
      adjust: this.selectors.adjustStockModal,
      delete: this.selectors.deleteConfirmModal
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
   * Check if inventory table is empty
   * @returns {Promise<boolean>}
   */
  async isTableEmpty() {
    return await this.isVisible(this.selectors.emptyState) || 
           await this.isVisible(this.selectors.noInventoryMessage);
  }

  /**
   * Get stock alerts
   * @returns {Promise<Object>}
   */
  async getStockAlerts() {
    return {
      lowStock: await this.isVisible(this.selectors.lowStockAlert),
      outOfStock: await this.isVisible(this.selectors.outOfStockAlert)
    };
  }

  /**
   * Get inventory statistics
   * @returns {Promise<Object>}
   */
  async getInventoryStats() {
    const stats = {};
    
    if (await this.isVisible(this.selectors.totalProductsCard)) {
      stats.totalProducts = await this.getText(this.selectors.totalProductsCard);
    }
    
    if (await this.isVisible(this.selectors.lowStockCard)) {
      stats.lowStock = await this.getText(this.selectors.lowStockCard);
    }
    
    if (await this.isVisible(this.selectors.outOfStockCard)) {
      stats.outOfStock = await this.getText(this.selectors.outOfStockCard);
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
   * Validate inventory page elements
   * @returns {Promise<{valid: boolean, missing: string[]}>}
   */
  async validatePageElements() {
    const requiredElements = [
      { selector: this.selectors.header, name: 'Header' },
      { selector: this.selectors.inventoryTable, name: 'Inventory Table' },
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
   * Test inventory creation flow
   * @param {Object} inventoryData - Inventory data
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testCreateInventory(inventoryData) {
    try {
      await this.clickAddInventory();
      await this.fillInventoryForm(inventoryData);
      await this.saveInventory();
      
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
   * Test stock adjustment flow
   * @param {Object} adjustmentData - Adjustment data
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testStockAdjustment(adjustmentData) {
    try {
      await this.clickAdjustStock();
      await this.fillAdjustmentForm(adjustmentData);
      await this.applyAdjustment();
      
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
   * Test inventory search
   * @param {string} searchTerm - Search term
   * @returns {Promise<{found: boolean, count: number}>}
   */
  async testSearch(searchTerm) {
    const initialCount = await this.getInventoryCount();
    await this.searchInventory(searchTerm);
    const searchCount = await this.getInventoryCount();
    
    return {
      found: searchCount > 0,
      count: searchCount
    };
  }
}

module.exports = InventoryPage;

