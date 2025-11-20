import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { RoleEntity } from '@/domain/entities/role.entity';
import { AssignRolesToTenantDto, AssignRolesToTenantResponseDto } from '../../dtos/tenant-role.dto';

@Injectable()
export class AssignRolesToTenantUseCase {
  constructor(
    @Inject('IRoleRepository') private readonly roleRepository: IRoleRepository,
    @Inject('ITenantRepository') private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(tenantId: number, assignDto: AssignRolesToTenantDto): Promise<AssignRolesToTenantResponseDto> {
    const { roleIds } = assignDto;

    // Check if tenant exists
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Remove duplicates
    const uniqueRoleIds = [...new Set(roleIds)];

    // Validate and get all roles
    const sourceRoles: RoleEntity[] = [];
    for (const roleId of uniqueRoleIds) {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      // Check if role is a system role (cannot be copied/modified)
      if (role.isSystemRole) {
        throw new BadRequestException(
          `Cannot assign system role "${role.name}" (ID: ${roleId}) to tenant. System roles are protected.`
        );
      }

      sourceRoles.push(role);
    }

    const assignedRoles: AssignRolesToTenantResponseDto['roles'] = [];

    // Process each role
    // Simplified: All roles must be TENANT scope and belong to a tenant
    for (const sourceRole of sourceRoles) {
      let assignedRole: RoleEntity;
      let isNew = false;

      // Validate: Only TENANT scope roles are allowed
      if (sourceRole.scope !== 'TENANT') {
        throw new BadRequestException(
          `Role "${sourceRole.name}" (ID: ${sourceRole.id}) has invalid scope "${sourceRole.scope}". Only TENANT scope roles are allowed.`
        );
      }

      if (!sourceRole.tenantId) {
        throw new BadRequestException(
          `Role "${sourceRole.name}" (ID: ${sourceRole.id}) does not have a tenant ID. All roles must belong to a tenant.`
        );
      }

      // Check if role already belongs to this tenant
      if (sourceRole.tenantId === tenantId) {
        // Role already belongs to this tenant
        assignedRole = sourceRole;
      } else {
        // Role belongs to another tenant, create a copy for this tenant
        // Check if tenant already has a role with the same name
        const existingRole = await this.roleRepository.findByNameAndScope(
          sourceRole.name,
          'TENANT',
          tenantId
        );

        if (existingRole) {
          // Role already exists for this tenant
          assignedRole = existingRole;
        } else {
          // Create new TENANT role based on source tenant role
          const tenantRoleEntity = new RoleEntity(
            0, // id will be set by database
            sourceRole.name,
            sourceRole.displayName,
            sourceRole.description,
            false, // isSystemRole - tenant roles are not system roles
            'TENANT', // scope
            tenantId, // tenantId
            sourceRole.isActive,
            new Date(),
            new Date(),
          );

          try {
            assignedRole = await this.roleRepository.create(tenantRoleEntity);
            isNew = true;
          } catch (error: any) {
            // Handle duplicate key error (race condition)
            if (
              error instanceof QueryFailedError &&
              ((error as any).code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry'))
            ) {
              // Role was created by another request, fetch it
              const existingRoleAfterError = await this.roleRepository.findByNameAndScope(
                sourceRole.name,
                'TENANT',
                tenantId
              );
              if (existingRoleAfterError) {
                assignedRole = existingRoleAfterError;
              } else {
                throw new BadRequestException(
                  `Failed to create role "${sourceRole.name}" and could not retrieve existing role`
                );
              }
            } else {
              throw error;
            }
          }
        }
      }

      assignedRoles.push({
        id: assignedRole.id,
        name: assignedRole.name,
        displayName: assignedRole.displayName,
        scope: assignedRole.scope,
        tenantId: assignedRole.tenantId,
        isNew,
      });
    }

    return {
      tenantId: tenant.id,
      tenantCode: tenant.code,
      tenantName: tenant.name,
      roles: assignedRoles,
    };
  }
}

