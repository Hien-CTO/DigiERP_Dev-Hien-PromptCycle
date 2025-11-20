export class TenantEntity {
  constructor(
    public readonly id: number,
    public readonly code: string,
    public readonly name: string,
    public readonly displayName: string,
    public readonly description?: string,
    public readonly taxCode?: string,
    public readonly email?: string,
    public readonly phone?: string,
    public readonly address?: string,
    public readonly cityId?: number,
    public readonly provinceId?: number,
    public readonly countryId?: number,
    public readonly logoUrl?: string,
    public readonly website?: string,
    public readonly status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' = 'ACTIVE',
    public readonly subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE' = 'BASIC',
    public readonly subscriptionExpiresAt?: Date,
    public readonly maxUsers: number = 10,
    public readonly maxStorageGb: number = 10,
    public readonly settings?: Record<string, any>,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly createdBy?: number,
    public readonly updatedBy?: number,
  ) {}

  canBeDeleted(): boolean {
    return this.status === 'INACTIVE';
  }

  canBeModified(): boolean {
    return this.isActive;
  }

  isSubscriptionActive(): boolean {
    if (!this.subscriptionExpiresAt) {
      return true;
    }
    return new Date() < this.subscriptionExpiresAt;
  }

  toJSON() {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      taxCode: this.taxCode,
      email: this.email,
      phone: this.phone,
      address: this.address,
      cityId: this.cityId,
      provinceId: this.provinceId,
      countryId: this.countryId,
      logoUrl: this.logoUrl,
      website: this.website,
      status: this.status,
      subscriptionTier: this.subscriptionTier,
      subscriptionExpiresAt: this.subscriptionExpiresAt,
      maxUsers: this.maxUsers,
      maxStorageGb: this.maxStorageGb,
      settings: this.settings,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
    };
  }
}

