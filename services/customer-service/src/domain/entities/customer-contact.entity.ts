export class CustomerContact {
  constructor(
    public readonly id: number,
    public readonly customerId: string, // UUID của customer
    public readonly title: string,
    public readonly contactPerson?: string,
    public readonly phone?: string,
    public readonly email?: string,
    public readonly department?: string,
    public readonly position?: string,
    public readonly notes?: string,
    public readonly isPrimary: boolean = false,
    public readonly isActive: boolean = true,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly createdBy?: number,
    public readonly updatedBy?: number,
  ) {}

  static create(
    customerId: string,
    title: string,
    contactPerson?: string,
    phone?: string,
    email?: string,
    department?: string,
    position?: string,
    notes?: string,
    isPrimary: boolean = false,
  ): CustomerContact {
    return new CustomerContact(
      0, // Will be set by repository
      customerId,
      title,
      contactPerson,
      phone,
      email,
      department,
      position,
      notes,
      isPrimary,
      true,
      new Date(),
      new Date(),
    );
  }

  update(
    title?: string,
    contactPerson?: string,
    phone?: string,
    email?: string,
    department?: string,
    position?: string,
    notes?: string,
    isPrimary?: boolean,
    isActive?: boolean,
  ): CustomerContact {
    return new CustomerContact(
      this.id,
      this.customerId,
      title ?? this.title,
      contactPerson ?? this.contactPerson,
      phone ?? this.phone,
      email ?? this.email,
      department ?? this.department,
      position ?? this.position,
      notes ?? this.notes,
      isPrimary ?? this.isPrimary,
      isActive ?? this.isActive,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.updatedBy,
    );
  }

  // Business logic methods
  hasPhone(): boolean {
    return !!this.phone && this.phone.length > 0;
  }

  hasEmail(): boolean {
    return !!this.email && this.email.length > 0;
  }

  getZaloUrl(): string | null {
    if (!this.hasPhone()) return null;
    // Remove all non-digit characters except +
    const phoneNumber = this.phone!.replace(/[^\d+]/g, '');
    return `https://zalo.me/${phoneNumber}`;
  }
}

