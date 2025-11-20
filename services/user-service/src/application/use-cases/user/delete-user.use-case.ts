import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';

@Injectable()
export class DeleteUserUseCase {
  constructor(@Inject('IUserRepository') private readonly userRepository: IUserRepository) {}

  async execute(userId: number, currentUserId?: number): Promise<void> {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent self-deletion
    if (currentUserId && userId === currentUserId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    // Delete user
    const deleted = await this.userRepository.delete(userId);
    if (!deleted) {
      throw new NotFoundException('User not found');
    }
  }
}
