export interface UserTenantInfo {
  tenantId: number;
  tenantCode: string;
  tenantName: string;
  roleId: number;
  roleName: string;
  isPrimary: boolean;
  joinedAt: Date;
}

export interface UserInfoInTenant {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  roleName: string;
  isPrimary: boolean;
  joinedAt: Date;
  isActive: boolean;
}

export interface IUserTenantRepository {
  /**
   * Lấy primary tenant của user
   */
  findPrimaryTenant(userId: number): Promise<UserTenantInfo | null>;

  /**
   * Lấy tất cả tenants của user
   */
  findAllUserTenants(userId: number): Promise<UserTenantInfo[]>;

  /**
   * Lấy tenant cụ thể của user
   */
  findUserTenant(userId: number, tenantId: number): Promise<UserTenantInfo | null>;

  /**
   * Lấy tất cả users của một tenant
   */
  findAllTenantUsers(tenantId: number): Promise<UserInfoInTenant[]>;

  /**
   * Assign user vào tenant với role
   */
  assignUserToTenant(
    userId: number,
    tenantId: number,
    roleId: number,
    isPrimary: boolean,
    invitedBy?: number,
  ): Promise<UserTenantInfo>;

  /**
   * Update role của user trong tenant
   */
  updateUserTenantRole(
    userId: number,
    tenantId: number,
    roleId: number,
  ): Promise<UserTenantInfo | null>;

  /**
   * Set primary tenant cho user
   */
  setPrimaryTenant(userId: number, tenantId: number): Promise<void>;

  /**
   * Remove user khỏi tenant
   */
  removeUserFromTenant(userId: number, tenantId: number): Promise<boolean>;

  /**
   * Remove role cụ thể từ user-tenant
   */
  removeRoleFromUserTenant(userId: number, tenantId: number, roleId: number): Promise<boolean>;

  /**
   * Check xem user đã có trong tenant chưa
   */
  existsUserInTenant(userId: number, tenantId: number): Promise<boolean>;
}

