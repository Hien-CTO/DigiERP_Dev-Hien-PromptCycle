export class PermissionEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly displayName: string,
    public readonly resourceId: number,
    public readonly actionId: number,
    public readonly description?: string,
    public readonly scope: 'GLOBAL' | 'TENANT' = 'GLOBAL',
    public readonly tenantId?: number,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  getPermissionString(): string {
    // This will be used for RBAC checks
    // Format: resource:action (e.g., "user:create", "product:read")
    return `${this.resourceId}:${this.actionId}`;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      resourceId: this.resourceId,
      actionId: this.actionId,
      scope: this.scope,
      tenantId: this.tenantId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
