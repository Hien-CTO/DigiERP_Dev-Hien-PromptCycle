export class UserEntity {
  constructor(
    public readonly id: number,
    public readonly username: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone?: string,
    public readonly avatarUrl?: string,
    public readonly isActive: boolean = true,
    public readonly isVerified: boolean = false,
    public readonly lastLoginAt?: Date,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  isPasswordValid(password: string, hashedPassword: string): boolean {
    // This will be implemented in the infrastructure layer with bcrypt
    return password === hashedPassword; // Placeholder
  }

  canLogin(): boolean {
    return this.isActive && this.isVerified;
  }

  updateLastLogin(): UserEntity {
    return new UserEntity(
      this.id,
      this.username,
      this.email,
      this.passwordHash,
      this.firstName,
      this.lastName,
      this.phone,
      this.avatarUrl,
      this.isActive,
      this.isVerified,
      new Date(),
      this.createdAt,
      new Date(),
    );
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      phone: this.phone,
      avatarUrl: this.avatarUrl,
      isActive: this.isActive,
      isVerified: this.isVerified,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
