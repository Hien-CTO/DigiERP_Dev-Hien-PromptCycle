import { Injectable, ConflictException, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { IUserTenantRepository } from '@/domain/repositories/user-tenant.repository.interface';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { CreateUserDto, UserResponseDto } from '../../dtos/user.dto';
import { UserEntity } from '@/domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IUserTenantRepository') private readonly userTenantRepository: IUserTenantRepository,
    @Inject('ITenantRepository') private readonly tenantRepository: ITenantRepository,
    @Inject('IRoleRepository') private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      avatarUrl,
      isActive = true,
      isVerified = false,
      tenantId,
      roleId,
      isPrimary = false,
    } = createUserDto;

    // Check if username already exists
    const existingUserByUsername = await this.userRepository.existsByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const existingUserByEmail = await this.userRepository.existsByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user entity
    const userEntity = new UserEntity(
      0, // id will be set by database
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      avatarUrl,
      isActive,
      isVerified,
      undefined, // lastLoginAt
      new Date(), // createdAt
      new Date(), // updatedAt
    );

    // Validate tenant assignment if provided
    if (tenantId) {
      if (!roleId) {
        throw new BadRequestException('Role ID is required when assigning user to a tenant');
      }

      // Check if tenant exists
      const tenant = await this.tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      // Check if role exists
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }

    // Save user
    const createdUser = await this.userRepository.create(userEntity);

    // Assign user to tenant if provided
    if (tenantId && roleId) {
      try {
        await this.userTenantRepository.assignUserToTenant(
          createdUser.id,
          tenantId,
          roleId,
          isPrimary,
          undefined, // invitedBy - can be added later if needed
        );
      } catch (error) {
        // If assignment fails, log error but don't fail user creation
        console.error(`Failed to assign user ${createdUser.id} to tenant ${tenantId}:`, error);
        // Optionally, you could throw the error if you want user creation to fail on assignment failure
        // throw error;
      }
    }

    return {
      id: createdUser.id,
      username: createdUser.username,
      email: createdUser.email,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      fullName: createdUser.fullName,
      phone: createdUser.phone,
      avatarUrl: createdUser.avatarUrl,
      isActive: createdUser.isActive,
      isVerified: createdUser.isVerified,
      lastLoginAt: createdUser.lastLoginAt,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };
  }
}
