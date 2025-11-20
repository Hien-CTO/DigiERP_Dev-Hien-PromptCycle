export class Supplier {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly contactPerson?: string,
    public readonly phone?: string,
    public readonly email?: string,
    public readonly address?: string,
    public readonly taxCode?: string,
    public readonly paymentTerms?: string,
    public readonly bankName?: string,
    public readonly bankAccountName?: string,
    public readonly bankAccountNumber?: string,
    public readonly creditLimit: number = 0,
    public readonly isActive: boolean = true,
    public readonly notes?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(
    name: string,
    contactPerson?: string,
    phone?: string,
    email?: string,
    address?: string,
    taxCode?: string,
    paymentTerms?: string,
    bankName?: string,
    bankAccountName?: string,
    bankAccountNumber?: string,
    creditLimit: number = 0,
    notes?: string,
  ): Supplier {
    return new Supplier(
      '', // Will be set by repository
      name,
      contactPerson,
      phone,
      email,
      address,
      taxCode,
      paymentTerms,
      bankName,
      bankAccountName,
      bankAccountNumber,
      creditLimit,
      true,
      notes,
    );
  }

  update(
    name?: string,
    contactPerson?: string,
    phone?: string,
    email?: string,
    address?: string,
    taxCode?: string,
    paymentTerms?: string,
    bankName?: string,
    bankAccountName?: string,
    bankAccountNumber?: string,
    creditLimit?: number,
    isActive?: boolean,
    notes?: string,
  ): Supplier {
    return new Supplier(
      this.id,
      name ?? this.name,
      contactPerson ?? this.contactPerson,
      phone ?? this.phone,
      email ?? this.email,
      address ?? this.address,
      taxCode ?? this.taxCode,
      paymentTerms ?? this.paymentTerms,
      bankName ?? this.bankName,
      bankAccountName ?? this.bankAccountName,
      bankAccountNumber ?? this.bankAccountNumber,
      creditLimit ?? this.creditLimit,
      isActive ?? this.isActive,
      notes ?? this.notes,
      this.createdAt,
      new Date(),
    );
  }
}
