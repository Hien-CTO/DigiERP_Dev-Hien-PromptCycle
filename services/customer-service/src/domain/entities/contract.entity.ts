export class Contract {
  constructor(
    public readonly id: string,
    public readonly contractNumber: string,
    public readonly title: string,
    public readonly description?: string,
    public readonly startDate: Date = new Date(),
    public readonly endDate: Date = new Date(),
    public readonly contractValue?: number,
    public readonly status: string = 'ACTIVE',
    public readonly termsConditions?: string,
    public readonly signedBy?: string,
    public readonly signedDate?: Date,
    public readonly customerId: string = '',
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(
    contractNumber: string,
    title: string,
    startDate: Date,
    endDate: Date,
    customerId: string,
    description?: string,
    contractValue?: number,
    termsConditions?: string,
    signedBy?: string,
    signedDate?: Date,
  ): Contract {
    return new Contract(
      '', // Will be set by repository
      contractNumber,
      title,
      description,
      startDate,
      endDate,
      contractValue,
      'ACTIVE',
      termsConditions,
      signedBy,
      signedDate,
      customerId,
    );
  }

  update(
    title?: string,
    description?: string,
    startDate?: Date,
    endDate?: Date,
    contractValue?: number,
    status?: string,
    termsConditions?: string,
    signedBy?: string,
    signedDate?: Date,
  ): Contract {
    return new Contract(
      this.id,
      this.contractNumber,
      title ?? this.title,
      description ?? this.description,
      startDate ?? this.startDate,
      endDate ?? this.endDate,
      contractValue ?? this.contractValue,
      status ?? this.status,
      termsConditions ?? this.termsConditions,
      signedBy ?? this.signedBy,
      signedDate ?? this.signedDate,
      this.customerId,
      this.createdAt,
      new Date(),
    );
  }

  // Business logic methods
  isActive(): boolean {
    const now = new Date();
    return this.status === 'ACTIVE' && 
           this.startDate <= now && 
           this.endDate >= now;
  }

  isExpired(): boolean {
    return new Date() > this.endDate;
  }

  getDaysRemaining(): number {
    const now = new Date();
    const diffTime = this.endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
