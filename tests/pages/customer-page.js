const { expect } = require('@playwright/test');

class CustomerPage {
  constructor(page) {
    this.page = page;
    this.baseUrl = 'http://localhost:3000';
  }

  async goto() {
    await this.page.goto(`${this.baseUrl}/admin/customers`);
    await this.page.waitForLoadState('networkidle');
  }

  async goToGroupsTab() {
    await this.page.click('[data-testid="customer-groups-tab"]');
    await this.page.waitForLoadState('networkidle');
  }

  async goToCustomersTab() {
    await this.page.click('[data-testid="customers-tab"]');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreateCustomer() {
    await this.page.click('[data-testid="create-customer-button"]');
    await this.page.waitForSelector('[data-testid="customer-form"]');
  }

  async clickCreateGroup() {
    await this.page.click('[data-testid="create-group-button"]');
    await this.page.waitForSelector('[data-testid="group-form"]');
  }

  async fillCustomerForm(customerData) {
    await this.page.fill('[data-testid="customer-name-input"]', customerData.name);
    await this.page.fill('[data-testid="customer-email-input"]', customerData.email);
    await this.page.fill('[data-testid="customer-phone-input"]', customerData.phone);
    
    if (customerData.address) {
      await this.page.fill('[data-testid="customer-address-input"]', customerData.address);
    }
    
    if (customerData.company) {
      await this.page.fill('[data-testid="customer-company-input"]', customerData.company);
    }
    
    if (customerData.group) {
      await this.page.selectOption('[data-testid="customer-group-select"]', customerData.group);
    }
  }

  async fillGroupForm(groupData) {
    await this.page.fill('[data-testid="group-name-input"]', groupData.name);
    await this.page.fill('[data-testid="group-description-input"]', groupData.description);
    await this.page.fill('[data-testid="group-discount-input"]', groupData.discount.toString());
  }

  async saveCustomer() {
    await this.page.click('[data-testid="save-customer-button"]');
    await this.page.waitForLoadState('networkidle');
  }

  async saveGroup() {
    await this.page.click('[data-testid="save-group-button"]');
    await this.page.waitForLoadState('networkidle');
  }

  async createCustomer(customerData) {
    await this.clickCreateCustomer();
    await this.fillCustomerForm(customerData);
    await this.saveCustomer();
  }

  async createGroup(groupData) {
    await this.clickCreateGroup();
    await this.fillGroupForm(groupData);
    await this.saveGroup();
  }

  async editCustomer(customerName) {
    await this.page.click(`[data-testid="edit-customer-${customerName}"]`);
    await this.page.waitForSelector('[data-testid="customer-form"]');
  }

  async deleteCustomer(customerName) {
    await this.page.click(`[data-testid="delete-customer-${customerName}"]`);
  }

  async viewCustomer(customerName) {
    await this.page.click(`[data-testid="view-customer-${customerName}"]`);
    await this.page.waitForSelector('[data-testid="customer-details-modal"]');
  }

  async createContract(customerName, contractData) {
    await this.page.click(`[data-testid="create-contract-${customerName}"]`);
    await this.page.waitForSelector('[data-testid="contract-form"]');
    
    await this.page.fill('[data-testid="contract-title-input"]', contractData.title);
    await this.page.fill('[data-testid="contract-start-date-input"]', contractData.startDate);
    await this.page.fill('[data-testid="contract-end-date-input"]', contractData.endDate);
    await this.page.fill('[data-testid="contract-value-input"]', contractData.value.toString());
    
    if (contractData.terms) {
      await this.page.fill('[data-testid="contract-terms-input"]', contractData.terms);
    }
    
    await this.page.click('[data-testid="save-contract-button"]');
    await this.page.waitForLoadState('networkidle');
  }

  async viewContract(contractTitle) {
    await this.page.click(`[data-testid="view-contract-${contractTitle}"]`);
    await this.page.waitForSelector('[data-testid="contract-details-modal"]');
  }

  async assignCustomerToGroup(customerName, groupName) {
    await this.page.click(`[data-testid="assign-group-${customerName}"]`);
    await this.page.selectOption('[data-testid="group-select"]', groupName);
    await this.page.click('[data-testid="confirm-assignment-button"]');
    await this.page.waitForLoadState('networkidle');
  }

  async searchCustomers(searchTerm) {
    await this.page.fill('[data-testid="customer-search-input"]', searchTerm);
    await this.page.press('[data-testid="customer-search-input"]', 'Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async filterByStatus(status) {
    await this.page.selectOption('[data-testid="status-filter-select"]', status);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByGroup(group) {
    await this.page.selectOption('[data-testid="group-filter-select"]', group);
    await this.page.waitForLoadState('networkidle');
  }

  async confirmDelete() {
    await this.page.click('[data-testid="confirm-delete-button"]');
    await this.page.waitForLoadState('networkidle');
  }

  // Getters for assertions
  async getSuccessMessage() {
    return this.page.locator('[data-testid="success-message"]');
  }

  async getErrorMessage() {
    return this.page.locator('[data-testid="error-message"]');
  }

  async getAccessDeniedMessage() {
    return this.page.locator('[data-testid="access-denied-message"]');
  }

  async getCustomerInList(customerName) {
    return this.page.locator(`[data-testid="customer-item-${customerName}"]`);
  }

  async getGroupInList(groupName) {
    return this.page.locator(`[data-testid="group-item-${groupName}"]`);
  }

  async getContractInList(contractTitle) {
    return this.page.locator(`[data-testid="contract-item-${contractTitle}"]`);
  }

  async getCustomerDetailsModal() {
    return this.page.locator('[data-testid="customer-details-modal"]');
  }

  async getContractDetailsModal() {
    return this.page.locator('[data-testid="contract-details-modal"]');
  }

  async getConfirmationDialog() {
    return this.page.locator('[data-testid="confirmation-dialog"]');
  }

  async getCustomerList() {
    return this.page.locator('[data-testid="customer-list"]');
  }

  async getCreateButton() {
    return this.page.locator('[data-testid="create-customer-button"]');
  }

  async getFieldError(fieldName) {
    return this.page.locator(`[data-testid="${fieldName}-error"]`);
  }

  async getCustomerName() {
    return this.page.locator('[data-testid="customer-name"]');
  }

  async getCustomerEmail() {
    return this.page.locator('[data-testid="customer-email"]');
  }

  async getCustomerGroup(customerName) {
    return this.page.locator(`[data-testid="customer-group-${customerName}"]`);
  }

  async getContractTitle() {
    return this.page.locator('[data-testid="contract-title"]');
  }

  async getContractValue() {
    return this.page.locator('[data-testid="contract-value"]');
  }

  async getCustomerList() {
    const customers = [];
    const customerItems = await this.page.locator('[data-testid^="customer-item-"]').all();
    
    for (const item of customerItems) {
      const name = await item.locator('[data-testid="customer-name"]').textContent();
      const email = await item.locator('[data-testid="customer-email"]').textContent();
      const status = await item.locator('[data-testid="customer-status"]').textContent();
      const group = await item.locator('[data-testid="customer-group"]').textContent();
      
      customers.push({ name, email, status, group });
    }
    
    return customers;
  }
}

module.exports = CustomerPage;
