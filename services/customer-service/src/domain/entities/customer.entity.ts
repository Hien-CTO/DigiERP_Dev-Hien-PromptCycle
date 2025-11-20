export class Customer {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly phone?: string,
    public readonly email?: string,
    public readonly address?: string,
    public readonly taxCode?: string,
    public readonly contactPerson?: string,
    public readonly paymentTerms?: string,
    public readonly creditLimit: number = 0,
    public readonly isActive: boolean = true,
    public readonly notes?: string,
    public readonly salesRep?: string,
    public readonly customerGroupId?: string,
    public readonly code?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(
    name: string,
    phone?: string,
    email?: string,
    address?: string,
    taxCode?: string,
    contactPerson?: string,
    paymentTerms?: string,
    creditLimit: number = 0,
    notes?: string,
    salesRep?: string,
    customerGroupId?: string,
  ): Customer {
    return new Customer(
      '', // Will be set by repository
      name,
      phone,
      email,
      address,
      taxCode,
      contactPerson,
      paymentTerms,
      creditLimit,
      true,
      notes,
      salesRep,
      customerGroupId,
    );
  }

  update(
    name?: string,
    phone?: string,
    email?: string,
    address?: string,
    taxCode?: string,
    contactPerson?: string,
    paymentTerms?: string,
    creditLimit?: number,
    isActive?: boolean,
    notes?: string,
    salesRep?: string,
    customerGroupId?: string,
  ): Customer {
    return new Customer(
      this.id,
      name ?? this.name,
      phone ?? this.phone,
      email ?? this.email,
      address ?? this.address,
      taxCode ?? this.taxCode,
      contactPerson ?? this.contactPerson,
      paymentTerms ?? this.paymentTerms,
      creditLimit ?? this.creditLimit,
      isActive ?? this.isActive,
      notes ?? this.notes,
      salesRep ?? this.salesRep,
      customerGroupId ?? this.customerGroupId,
      this.code, // Preserve code
      this.createdAt,
      new Date(),
    );
  }

  // Business logic methods
  isCompanyCustomer(): boolean {
    // This will be determined by the customer group
    return false; // Will be implemented based on customer group
  }

  hasValidTaxCode(): boolean {
    return this.taxCode ? this.taxCode.length > 0 : false;
  }

  canHaveCreditLimit(): boolean {
    return this.creditLimit >= 0;
  }
}
