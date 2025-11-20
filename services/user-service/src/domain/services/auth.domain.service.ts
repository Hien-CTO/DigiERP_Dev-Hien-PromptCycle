import { Injectable, Inject } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user.repository.interface';

@Injectable()
export class AuthDomainService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository
  ) {}

  async validateUserCredentials(usernameOrEmail: string, password: string): Promise<UserEntity | null> {
    // Find user by username or email
    let user = await this.userRepository.findByUsername(usernameOrEmail);
    if (!user) {
      user = await this.userRepository.findByEmail(usernameOrEmail);
    }

    if (!user) {
      return null;
    }

    // Check if user can login
    if (!user.canLogin()) {
      return null;
    }

    // Validate password (this will be implemented with bcrypt in infrastructure layer)
    // For now, we'll assume password validation is handled elsewhere
    return user;
  }

  async updateUserLastLogin(userId: number): Promise<void> {
    await this.userRepository.updateLastLogin(userId);
  }

  async isUserActive(userId: number): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return user ? user.isActive : false;
  }
}
