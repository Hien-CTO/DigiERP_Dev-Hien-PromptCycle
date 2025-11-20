import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { AssignRoleToUserDto } from '../../dtos/role.dto';

@Injectable()
export class AssignRolesToUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(userId: number, assignRolesDto: AssignRoleToUserDto, assignedBy?: number): Promise<void> {
    const { roleIds } = assignRolesDto;

    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if all roles exist and validate they are GLOBAL roles
    for (const roleId of roleIds) {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }
      
      // Only allow assigning GLOBAL roles through this endpoint
      // TENANT roles must be assigned through user_tenants endpoint
      if (role.scope !== 'GLOBAL') {
        throw new BadRequestException(
          `Cannot assign TENANT scope role (ID: ${roleId}) through this endpoint. ` +
          `TENANT roles must be assigned through tenant user assignment endpoint.`
        );
      }
    }

    // Assign roles to user (only GLOBAL roles)
    for (const roleId of roleIds) {
      const success = await this.roleRepository.assignRoleToUser(userId, roleId, assignedBy);
      if (!success) {
        throw new Error(`Failed to assign role ${roleId} to user`);
      }
    }
  }
}
