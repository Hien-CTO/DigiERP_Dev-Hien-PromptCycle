export class SupplierDomainError extends Error {
  constructor(message: string, readonly code: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SupplierNameAlreadyExistsError extends SupplierDomainError {
  constructor(name: string) {
    super(`Supplier with name "${name}" already exists`, 'SUPPLIER_NAME_EXISTS');
  }
}

export class SupplierTaxCodeAlreadyExistsError extends SupplierDomainError {
  constructor(taxCode: string) {
    super(`Supplier with tax code "${taxCode}" already exists`, 'SUPPLIER_TAX_CODE_EXISTS');
  }
}

export class SupplierNotFoundError extends SupplierDomainError {
  constructor(id: string | number) {
    super(`Supplier with id "${id}" was not found`, 'SUPPLIER_NOT_FOUND');
  }
}

