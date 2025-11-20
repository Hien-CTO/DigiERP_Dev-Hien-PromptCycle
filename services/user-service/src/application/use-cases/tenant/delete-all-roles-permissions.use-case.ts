import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { RolePermission } from '@/infrastructure/database/entities/role-permission.entity';
import { UserRole } from '@/infrastructure/database/entities/user-role.entity';

@Injectable()
export class DeleteAllRolesAndPermissionsUseCase {
  constructor(
    @Inject('IRoleRepository') private readonly roleRepository: IRoleRepository,
    @Inject('IPermissionRepository') private readonly permissionRepository: IPermissionRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(): Promise<{ message: string; deletedRoles: number; deletedPermissions: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete all role_permissions first (foreign key constraint)
      const rolePermissionRepo = queryRunner.manager.getRepository(RolePermission);
      const deletedRolePermissions = await rolePermissionRepo.delete({});
      const deletedRolePermissionsCount = deletedRolePermissions.affected || 0;

      // Delete all user_roles
      const userRoleRepo = queryRunner.manager.getRepository(UserRole);
      const deletedUserRoles = await userRoleRepo.delete({});
      const deletedUserRolesCount = deletedUserRoles.affected || 0;

      // Delete all roles
      const allRoles = await this.roleRepository.findAll(1, 10000);
      let deletedRolesCount = 0;
      for (const role of allRoles.roles) {
        const deleted = await this.roleRepository.delete(role.id);
        if (deleted) {
          deletedRolesCount++;
        }
      }

      // Delete all permissions
      const allPermissions = await this.permissionRepository.findAll();
      let deletedPermissionsCount = 0;
      for (const permission of allPermissions.permissions) {
        const deleted = await this.permissionRepository.delete(permission.id);
        if (deleted) {
          deletedPermissionsCount++;
        }
      }

      await queryRunner.commitTransaction();

      return {
        message: 'All roles and permissions deleted successfully',
        deletedRoles: deletedRolesCount,
        deletedPermissions: deletedPermissionsCount,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

