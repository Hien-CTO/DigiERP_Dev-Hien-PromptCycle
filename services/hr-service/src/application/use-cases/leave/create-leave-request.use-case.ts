import { Injectable } from '@nestjs/common';
import { LeaveService } from '@/application/services/leave.service';
import { CreateLeaveRequestDto } from '@/application/dtos/leave.dto';
import { LeaveRequest } from '@/infrastructure/database/entities/leave-request.entity';

@Injectable()
export class CreateLeaveRequestUseCase {
  constructor(private readonly leaveService: LeaveService) {}

  async execute(dto: CreateLeaveRequestDto, userId: number): Promise<LeaveRequest> {
    return await this.leaveService.createLeaveRequest(dto, userId);
  }
}

