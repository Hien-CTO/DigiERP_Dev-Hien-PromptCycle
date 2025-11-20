const BasePage = require('./base-page');

/**
 * Products Page Object Model
 */
class ProductsPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/admin/products';
    
    // Selectors
    this.selectors = {
      // Header elements
      header: '.products-header, .page-header, [data-testid="products-header"]',
      pageTitle: 'h1, .page-title, [data-testid="page-title"]',
      
      // Action buttons
      addProductButton: 'button:has-text("Thêm sản phẩm"), button:has-text("Add Product"), [data-testid="add-product-btn"]',
      importButton: 'button:has-text("Import"), [data-testid="import-btn"]',
      exportButton: 'button:has-text("Export"), [data-testid="export-btn"]',
      
      // Search and filters
      searchInput: 'input[type="search"], input[placeholder*="Tìm kiếm"], input[placeholder*="Search"], [data-testid="search-input"]',
      categoryFilter: 'select[name="category"], [data-testid="category-filter"]',
      statusFilter: 'select[name="status"], [data-testid="status-filter"]',
      priceRangeFilter: '[data-testid="price-range-filter"]',
      
      // Products table
      productsTable: '.products-table, table, [data-testid="products-table"]',
      tableHeader: 'thead, .table-header',
      tableBody: 'tbody, .table-body',
      productRows: 'tbody tr, .product-row',
      productRow: 'tbody tr:nth-child({index}), .product-row:nth-child({index})',
      
      // Product row elements
      productName: 'td:nth-child(1), .product-name',
      productSku: 'td:nth-child(2), .product-sku',
      productCategory: 'td:nth-child(3), .product-category',
      productPrice: 'td:nth-child(4), .product-price',
      productStock: 'td:nth-child(5), .product-stock',
      productStatus: 'td:nth-child(6), .product-status',
      productActions: 'td:last-child, .product-actions',
      
      // Action buttons in table
      editButton: 'button:has-text("Sửa"), button:has-text("Edit"), [data-testid="edit-btn"]',
      deleteButton: 'button:has-text("Xóa"), button:has-text("Delete"), [data-testid="delete-btn"]',
      viewButton: 'button:has-text("Xem"), button:has-text("View"), [data-testid="view-btn"]',
      
      // Pagination
      pagination: '.pagination, [data-testid="pagination"]',
      pageNumbers: '.page-number, .pagination button',
      nextPageButton: 'button:has-text("Trang sau"), button:has-text("Next"), [data-testid="next-page"]',
      prevPageButton: 'button:has-text("Trang trước"), button:has-text("Previous"), [data-testid="prev-page"]',
      
      // Modals
      addProductModal: '.modal, [data-testid="add-product-modal"]',
      editProductModal: '.modal, [data-testid="edit-product-modal"]',
      deleteConfirmModal: '.modal, [data-testid="delete-confirm-modal"]',
      modalTitle: '.modal-title, .modal h2',
      modalCloseButton: '.modal-close, button:has-text("Đóng"), button:has-text("Close")',
      
      // Form fields
      productNameInput: 'input[name="name"], [data-testid="product-name-input"]',
      productDescriptionInput: 'textarea[name="description"], [data-testid="product-description-input"]',
      productSkuInput: 'input[name="sku"], [data-testid="product-sku-input"]',
      productPriceInput: 'input[name="price"], [data-testid="product-price-input"]',
      productStockInput: 'input[name="stock"], [data-testid="product-stock-input"]',
      productCategorySelect: 'select[name="category"], [data-testid="product-category-select"]',
      productStatusSelect: 'select[name="status"], [data-testid="product-status-select"]',
      
      // Form buttons
      saveButton: 'button:has-text("Lưu"), button:has-text("Save"), [data-testid="save-btn"]',
      cancelButton: 'button:has-text("Hủy"), button:has-text("Cancel"), [data-testid="cancel-btn"]',
      confirmDeleteButton: 'button:has-text("Xác nhận"), button:has-text("Confirm"), [data-testid="confirm-delete-btn"]',
      
      // Loading states
      loadingSpinner: '.loading, .spinner, .animate-spin, [data-testid="loading"]',
      
      // Messages
      successMessage: '.success-message, .alert-success, .text-green-500, [data-testid="success-message"]',
      errorMessage: '.error-message, .alert-error, .text-red-500, [data-testid="error-message"]',
      
      // Empty state
      emptyState: '.empty-state, [data-testid="empty-state"]',
      noProductsMessage: '.no-products, [data-testid="no-products"]'
    };
  }

  /**
   * Navigate to products page
   */
  async goto() {
    await super.goto(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for products page to load completely
   */
  async waitForPageLoad() {
    await this.waitForElement(this.selectors.header);
    await this.waitForLoading();
  }

  /**
   * Check if products page is loaded
   * @returns {Promise<boolean>}
   */
  async isProductsPageLoaded() {
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
   * Click add product button
   */
  async clickAddProduct() {
    await this.click(this.selectors.addProductButton);
    await this.waitForElement(this.selectors.addProductModal);
  }

  /**
   * Search for products
   * @param {string} searchTerm - Search term
   */
  async searchProducts(searchTerm) {
    await this.fill(this.selectors.searchInput, searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForLoading();
  }

  /**
   * Filter products by category
   * @param {string} category - Category name
   */
  async filterByCategory(category) {
    await this.page.selectOption(this.selectors.categoryFilter, category);
    await this.waitForLoading();
  }

  /**
   * Filter products by status
   * @param {string} status - Status value
   */
  async filterByStatus(status) {
    await this.page.selectOption(this.selectors.statusFilter, status);
    await this.waitForLoading();
  }

  /**
   * Get all product rows
   * @returns {Promise<Array>}
   */
  async getProductRows() {
    if (!(await this.isVisible(this.selectors.productsTable))) {
      return [];
    }
    
    const rows = await this.page.locator(this.selectors.productRows).all();
    return rows;
  }

  /**
   * Get product count
   * @returns {Promise<number>}
   */
  async getProductCount() {
    const rows = await this.getProductRows();
    return rows.length;
  }

  /**
   * Get product data from row
   * @param {number} rowIndex - Row index (1-based)
   * @returns {Promise<Object>}
   */
  async getProductData(rowIndex) {
    const rowSelector = this.selectors.productRow.replace('{index}', rowIndex);
    
    if (!(await this.exists(rowSelector))) {
      throw new Error(`Product row ${rowIndex} not found`);
    }
    
    const row = this.page.locator(rowSelector);
    
    return {
      name: await row.locator(this.selectors.productName).textContent(),
      sku: await row.locator(this.selectors.productSku).textContent(),
      category: await row.locator(this.selectors.productCategory).textContent(),
      price: await row.locator(this.selectors.productPrice).textContent(),
      stock: await row.locator(this.selectors.productStock).textContent(),
      status: await row.locator(this.selectors.productStatus).textContent()
    };
  }

  /**
   * Click edit button for product
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickEditProduct(rowIndex) {
    const rowSelector = this.selectors.productRow.replace('{index}', rowIndex);
    const editBtn = this.page.locator(rowSelector).locator(this.selectors.editButton);
    await editBtn.click();
    await this.waitForElement(this.selectors.editProductModal);
  }

  /**
   * Click delete button for product
   * @param {number} rowIndex - Row index (1-based)
   */
  async clickDeleteProduct(rowIndex) {
    const rowSelector = this.selectors.productRow.replace('{index}', rowIndex);
    const deleteBtn = this.page.locator(rowSelector).locator(this.selectors.deleteButton);
    await deleteBtn.click();
    await this.waitForElement(this.selectors.deleteConfirmModal);
  }

  /**
   * Fill product form
   * @param {Object} productData - Product data
   */
  async fillProductForm(productData) {
    if (productData.name) {
      await this.fill(this.selectors.productNameInput, productData.name);
    }
    
    if (productData.description) {
      await this.fill(this.selectors.productDescriptionInput, productData.description);
    }
    
    if (productData.sku) {
      await this.fill(this.selectors.productSkuInput, productData.sku);
    }
    
    if (productData.price) {
      await this.fill(this.selectors.productPriceInput, productData.price);
    }
    
    if (productData.stock) {
      await this.fill(this.selectors.productStockInput, productData.stock);
    }
    
    if (productData.category) {
      await this.page.selectOption(this.selectors.productCategorySelect, productData.category);
    }
    
    if (productData.status) {
      await this.page.selectOption(this.selectors.productStatusSelect, productData.status);
    }
  }

  /**
   * Save product form
   */
  async saveProduct() {
    await this.click(this.selectors.saveButton);
    await this.waitForLoading();
  }

  /**
   * Cancel product form
   */
  async cancelProduct() {
    await this.click(this.selectors.cancelButton);
  }

  /**
   * Confirm delete product
   */
  async confirmDeleteProduct() {
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
   * @param {string} modalType - Type of modal (add, edit, delete)
   * @returns {Promise<boolean>}
   */
  async isModalOpen(modalType) {
    const modalSelectors = {
      add: this.selectors.addProductModal,
      edit: this.selectors.editProductModal,
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
   * Check if products table is empty
   * @returns {Promise<boolean>}
   */
  async isTableEmpty() {
    return await this.isVisible(this.selectors.emptyState) || 
           await this.isVisible(this.selectors.noProductsMessage);
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
   * Validate products page elements
   * @returns {Promise<{valid: boolean, missing: string[]}>}
   */
  async validatePageElements() {
    const requiredElements = [
      { selector: this.selectors.header, name: 'Header' },
      { selector: this.selectors.addProductButton, name: 'Add Product Button' },
      { selector: this.selectors.searchInput, name: 'Search Input' },
      { selector: this.selectors.productsTable, name: 'Products Table' }
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
   * Test product creation flow
   * @param {Object} productData - Product data
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testCreateProduct(productData) {
    try {
      await this.clickAddProduct();
      await this.fillProductForm(productData);
      await this.saveProduct();
      
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
   * Test product search
   * @param {string} searchTerm - Search term
   * @returns {Promise<{found: boolean, count: number}>}
   */
  async testSearch(searchTerm) {
    const initialCount = await this.getProductCount();
    await this.searchProducts(searchTerm);
    const searchCount = await this.getProductCount();
    
    return {
      found: searchCount > 0,
      count: searchCount
    };
  }
}

module.exports = ProductsPage;

