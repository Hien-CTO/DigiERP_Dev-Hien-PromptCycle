import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequestEditHistory } from '../entities/leave-request-edit-history.entity';

@Injectable()
export class LeaveRequestEditHistoryRepository {
  constructor(
    @InjectRepository(LeaveRequestEditHistory)
    private readonly leaveRequestEditHistoryRepository: Repository<LeaveRequestEditHistory>,
  ) {}

  async findById(id: number): Promise<LeaveRequestEditHistory | null> {
    return await this.leaveRequestEditHistoryRepository.findOne({
      where: { id },
      relations: ['leaveRequest'],
    });
  }

  async findByLeaveRequestId(leaveRequestId: number): Promise<LeaveRequestEditHistory[]> {
    return await this.leaveRequestEditHistoryRepository.find({
      where: { leave_request_id: leaveRequestId },
      order: { edited_at: 'DESC' },
    });
  }

  async create(editHistoryData: Partial<LeaveRequestEditHistory>): Promise<LeaveRequestEditHistory> {
    const editHistory = this.leaveRequestEditHistoryRepository.create(editHistoryData);
    return await this.leaveRequestEditHistoryRepository.save(editHistory);
  }
}

