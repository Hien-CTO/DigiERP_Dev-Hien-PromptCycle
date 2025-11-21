import { Injectable } from '@nestjs/common';
import { LeaveService } from '@/application/services/leave.service';
import { GetLeaveBalanceQueryDto } from '@/application/dtos/leave.dto';
import { LeaveBalance } from '@/infrastructure/database/entities/leave-balance.entity';

@Injectable()
export class GetLeaveBalanceUseCase {
  constructor(private readonly leaveService: LeaveService) {}

  async execute(query: GetLeaveBalanceQueryDto): Promise<LeaveBalance[]> {
    const year = query.year || new Date().getFullYear();
    return await this.leaveService.getLeaveBalance(
      query.employee_id,
      year,
      query.leave_type_id,
    );
  }
}

