export class CustomerGroup {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description?: string,
    public readonly isActive: boolean = true,
    public readonly isCompany: boolean = false,
    public readonly color?: string,
    public readonly sortOrder: number = 0,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(
    name: string,
    description?: string,
    isCompany: boolean = false,
    color?: string,
    sortOrder: number = 0,
  ): CustomerGroup {
    return new CustomerGroup(
      '', // Will be set by repository
      name,
      description,
      true,
      isCompany,
      color,
      sortOrder,
    );
  }

  update(
    name?: string,
    description?: string,
    isActive?: boolean,
    isCompany?: boolean,
    color?: string,
    sortOrder?: number,
  ): CustomerGroup {
    return new CustomerGroup(
      this.id,
      name ?? this.name,
      description ?? this.description,
      isActive ?? this.isActive,
      isCompany ?? this.isCompany,
      color ?? this.color,
      sortOrder ?? this.sortOrder,
      this.createdAt,
      new Date(),
    );
  }
}
