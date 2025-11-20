import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { 
  AssignUserToTenantWithRolesDto, 
  AssignUserToTenantWithRolesResponseDto,
  UserTenantResponseDto 
} from '../../dtos/user-tenant.dto';

@Injectable()
export class AssignUserToTenantWithRolesUseCase {
  constructor(
    @Inject('IUserTenantRepository')
    private readonly userTenantRepository: IUserTenantRepository,
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(
    assignDto: AssignUserToTenantWithRolesDto,
    invitedBy?: number,
  ): Promise<AssignUserToTenantWithRolesResponseDto> {
    const { userId, tenantId, roleId, isPrimary = false } = assignDto;

    // Normalize roleId to array (handle both single number and array)
    const roleIds = Array.isArray(roleId) ? roleId : [roleId];

    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if tenant exists
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Remove duplicates
    const uniqueRoleIds = [...new Set(roleIds)];

    // Validate and check all roles exist and belong to tenant
    const roles = [];
    for (const roleIdItem of uniqueRoleIds) {
      const role = await this.roleRepository.findById(roleIdItem);
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleIdItem} not found`);
      }

      // Check if role is TENANT scope and belongs to this tenant
      if (role.scope === 'TENANT' && role.tenantId !== tenantId) {
        throw new BadRequestException(
          `Role with ID ${roleIdItem} does not belong to tenant ${tenantId}`
        );
      }

      // Only allow TENANT scope roles for tenant assignment
      if (role.scope === 'GLOBAL') {
        throw new BadRequestException(
          `Cannot assign GLOBAL scope role (ID: ${roleIdItem}) through tenant assignment. ` +
          `GLOBAL roles must be assigned through user role assignment endpoint.`
        );
      }

      roles.push(role);
    }

    // Check if user already in tenant
    const existing = await this.userTenantRepository.findUserTenant(userId, tenantId);
    
    const assignedRoles: UserTenantResponseDto[] = [];

    // If user already exists in tenant, update existing roles or add new ones
    if (existing) {
      // For each role, check if user already has this role in this tenant
      for (const roleId of uniqueRoleIds) {
        // Check if user already has this role (we'll need to check all user-tenant records)
        const allUserTenants = await this.userTenantRepository.findAllUserTenants(userId);
        const hasRoleInTenant = allUserTenants.some(
          ut => ut.tenantId === tenantId && ut.roleId === roleId
        );

        if (!hasRoleInTenant) {
          // Assign new role
          const userTenant = await this.userTenantRepository.assignUserToTenant(
            userId,
            tenantId,
            roleId,
            isPrimary && roleId === uniqueRoleIds[0], // Only first role can be primary
            invitedBy,
          );

          assignedRoles.push({
            tenantId: userTenant.tenantId,
            tenantCode: userTenant.tenantCode,
            tenantName: userTenant.tenantName,
            roleId: userTenant.roleId,
            roleName: userTenant.roleName,
            isPrimary: userTenant.isPrimary,
            joinedAt: userTenant.joinedAt,
          });
        }
      }

      // If no new roles were assigned, throw error
      if (assignedRoles.length === 0) {
        throw new ConflictException('User already has all specified roles in this tenant');
      }
    } else {
      // User is new to tenant, assign all roles
      for (let i = 0; i < uniqueRoleIds.length; i++) {
        const roleId = uniqueRoleIds[i];
        const isFirstRole = i === 0;
        
        const userTenant = await this.userTenantRepository.assignUserToTenant(
          userId,
          tenantId,
          roleId,
          isPrimary && isFirstRole, // Only first role can be primary
          invitedBy,
        );

        assignedRoles.push({
          tenantId: userTenant.tenantId,
          tenantCode: userTenant.tenantCode,
          tenantName: userTenant.tenantName,
          roleId: userTenant.roleId,
          roleName: userTenant.roleName,
          isPrimary: userTenant.isPrimary,
          joinedAt: userTenant.joinedAt,
        });
      }
    }

    return {
      userId,
      tenantId: tenant.id,
      tenantCode: tenant.code,
      tenantName: tenant.name,
      roles: assignedRoles,
    };
  }
}

