import { Injectable } from '@nestjs/common';
import { LeaveService } from '@/application/services/leave.service';
import { GetLeaveRequestsQueryDto, LeaveRequestStatus } from '@/application/dtos/leave.dto';

@Injectable()
export class GetLeaveRequestsUseCase {
  constructor(private readonly leaveService: LeaveService) {}

  async execute(query: GetLeaveRequestsQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const dateFrom = query.date_from ? new Date(query.date_from) : undefined;
    const dateTo = query.date_to ? new Date(query.date_to) : undefined;

    return await this.leaveService.getLeaveRequests(page, limit, {
      employee_id: query.employee_id,
      leave_type_id: query.leave_type_id,
      status: query.status,
      date_from: dateFrom,
      date_to: dateTo,
      search: query.search,
    });
  }
}

