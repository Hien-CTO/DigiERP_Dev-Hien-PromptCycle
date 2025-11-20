import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User as UserEntity } from '../entities/user.entity';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { UserEntity as DomainUserEntity } from '@/domain/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: number): Promise<DomainUserEntity | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ? this.toDomainEntity(user) : null;
  }

  async findByUsername(username: string): Promise<DomainUserEntity | null> {
    const user = await this.userRepository.findOne({ where: { username } });
    return user ? this.toDomainEntity(user) : null;
  }

  async findByEmail(email: string): Promise<DomainUserEntity | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user ? this.toDomainEntity(user) : null;
  }

  async findAll(): Promise<{ users: DomainUserEntity[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      order: { created_at: 'DESC' },
    });

    return {
      users: users.map(user => this.toDomainEntity(user)),
      total,
    };
  }

  async create(user: Omit<DomainUserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DomainUserEntity> {
    const userEntity = this.userRepository.create({
      username: user.username,
      email: user.email,
      password_hash: user.passwordHash,
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phone,
      avatar_url: user.avatarUrl,
      is_active: user.isActive,
      is_verified: user.isVerified,
    });

    const savedUser = await this.userRepository.save(userEntity);
    return this.toDomainEntity(savedUser);
  }

  async update(id: number, user: Partial<DomainUserEntity>): Promise<DomainUserEntity | null> {
    const updateData: any = {};
    
    if (user.username) updateData.username = user.username;
    if (user.email) updateData.email = user.email;
    if (user.firstName) updateData.first_name = user.firstName;
    if (user.lastName) updateData.last_name = user.lastName;
    if (user.phone !== undefined) updateData.phone = user.phone;
    // Handle avatarUrl: update even if it's an empty string (to clear avatar)
    if (user.avatarUrl !== undefined) {
      updateData.avatar_url = user.avatarUrl || null; // Convert empty string to null
    }
    if (user.isActive !== undefined) updateData.is_active = user.isActive;
    if (user.isVerified !== undefined) updateData.is_verified = user.isVerified;

    await this.userRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { username } });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { email } });
    return count > 0;
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.userRepository.update(id, { last_login_at: new Date() });
  }

  private toDomainEntity(user: UserEntity): DomainUserEntity {
    return new DomainUserEntity(
      user.id,
      user.username,
      user.email,
      user.password_hash,
      user.first_name,
      user.last_name,
      user.phone,
      user.avatar_url,
      user.is_active,
      user.is_verified,
      user.last_login_at,
      user.created_at,
      user.updated_at,
    );
  }
}
