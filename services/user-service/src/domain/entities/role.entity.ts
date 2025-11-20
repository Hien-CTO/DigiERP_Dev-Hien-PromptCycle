export class RoleEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly displayName: string,
    public readonly description?: string,
    public readonly isSystemRole: boolean = false,
    public readonly scope: 'GLOBAL' | 'TENANT' = 'GLOBAL',
    public readonly tenantId?: number,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  canBeDeleted(): boolean {
    return !this.isSystemRole;
  }

  canBeModified(): boolean {
    return !this.isSystemRole;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      isSystemRole: this.isSystemRole,
      scope: this.scope,
      tenantId: this.tenantId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
