import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceEditHistory } from '../entities/attendance-edit-history.entity';

@Injectable()
export class AttendanceEditHistoryRepository {
  constructor(
    @InjectRepository(AttendanceEditHistory)
    private readonly repository: Repository<AttendanceEditHistory>,
  ) {}

  async create(historyData: Partial<AttendanceEditHistory>): Promise<AttendanceEditHistory> {
    const history = this.repository.create(historyData);
    return await this.repository.save(history);
  }

  async createMultiple(historyDataArray: Partial<AttendanceEditHistory>[]): Promise<AttendanceEditHistory[]> {
    const histories = this.repository.create(historyDataArray);
    return await this.repository.save(histories);
  }

  async findByAttendanceRecordId(attendanceRecordId: number): Promise<AttendanceEditHistory[]> {
    return await this.repository.find({
      where: { attendance_record_id: attendanceRecordId },
      order: { edited_at: 'DESC' },
    });
  }
}

