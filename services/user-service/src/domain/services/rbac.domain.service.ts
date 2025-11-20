import { IPermissionRepository } from '../repositories/permission.repository.interface';
import { IRoleRepository } from '../repositories/role.repository.interface';

export class RbacDomainService {
  constructor(
    private readonly permissionRepository: IPermissionRepository,
    private readonly roleRepository: IRoleRepository,
  ) {}

  async checkUserPermission(userId: number, resourceId: number, actionId: number): Promise<boolean> {
    return await this.permissionRepository.checkUserPermission(userId, resourceId, actionId);
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const permissions = await this.permissionRepository.findUserPermissions(userId);
    return permissions.map(p => p.getPermissionString());
  }

  async getUserRoles(userId: number): Promise<string[]> {
    const roles = await this.roleRepository.findUserRoles(userId);
    return roles.map(r => r.name);
  }

  async canUserAccessResource(userId: number, resource: string, action: string): Promise<boolean> {
    // This method will be implemented to check permissions by resource/action names
    // For now, we'll use the numeric IDs approach
    return false; // Placeholder
  }
}
