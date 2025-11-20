import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AttendanceRecord } from '../entities/attendance-record.entity';

@Injectable()
export class AttendanceRepository {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepository: Repository<AttendanceRecord>,
  ) {}

  async findById(id: number): Promise<AttendanceRecord | null> {
    return await this.attendanceRepository.findOne({
      where: { id },
      relations: ['employee', 'attendanceType'],
    });
  }

  async findByEmployeeAndDate(employeeId: number, date: Date): Promise<AttendanceRecord | null> {
    return await this.attendanceRepository.findOne({
      where: {
        employee_id: employeeId,
        attendance_date: date,
      },
      relations: ['employee', 'attendanceType'],
    });
  }

  async findByEmployeeId(
    employeeId: number,
    page: number = 1,
    limit: number = 10,
    dateFrom?: Date,
    dateTo?: Date,
    status?: string,
  ): Promise<{ records: AttendanceRecord[]; total: number }> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .leftJoinAndSelect('attendance.attendanceType', 'attendanceType')
      .where('attendance.employee_id = :employeeId', { employeeId });

    if (dateFrom) {
      queryBuilder.andWhere('attendance.attendance_date >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('attendance.attendance_date <= :dateTo', { dateTo });
    }

    if (status) {
      queryBuilder.andWhere('attendance.status = :status', { status });
    }

    const [records, total] = await queryBuilder
      .orderBy('attendance.attendance_date', 'DESC')
      .addOrderBy('attendance.check_in_time', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { records, total };
  }

  async findByDepartment(
    departmentId: number,
    page: number = 1,
    limit: number = 10,
    dateFrom?: Date,
    dateTo?: Date,
    status?: string,
  ): Promise<{ records: AttendanceRecord[]; total: number }> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .leftJoinAndSelect('attendance.attendanceType', 'attendanceType')
      .leftJoin('employee.department', 'department')
      .where('department.id = :departmentId', { departmentId });

    if (dateFrom) {
      queryBuilder.andWhere('attendance.attendance_date >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('attendance.attendance_date <= :dateTo', { dateTo });
    }

    if (status) {
      queryBuilder.andWhere('attendance.status = :status', { status });
    }

    const [records, total] = await queryBuilder
      .orderBy('attendance.attendance_date', 'DESC')
      .addOrderBy('attendance.check_in_time', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { records, total };
  }

  async findPendingApprovals(
    departmentId?: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ records: AttendanceRecord[]; total: number }> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .leftJoinAndSelect('attendance.attendanceType', 'attendanceType')
      .where('attendance.approval_status = :status', { status: 'PENDING' })
      .andWhere('attendance.status IN (:...statuses)', { statuses: ['PENDING_APPROVAL', 'COMPLETED'] });

    if (departmentId) {
      queryBuilder
        .leftJoin('employee.department', 'department')
        .andWhere('department.id = :departmentId', { departmentId });
    }

    const [records, total] = await queryBuilder
      .orderBy('attendance.attendance_date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { records, total };
  }

  async create(attendanceData: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const attendance = this.attendanceRepository.create(attendanceData);
    return await this.attendanceRepository.save(attendance);
  }

  async update(id: number, attendanceData: Partial<AttendanceRecord>): Promise<AttendanceRecord | null> {
    await this.attendanceRepository.update(id, attendanceData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.attendanceRepository.delete(id);
    return result.affected > 0;
  }

  async countByEmployeeAndDateRange(
    employeeId: number,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<number> {
    return await this.attendanceRepository.count({
      where: {
        employee_id: employeeId,
        attendance_date: Between(dateFrom, dateTo),
      },
    });
  }

  async findTodayByEmployee(employeeId: number): Promise<AttendanceRecord | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await this.attendanceRepository.findOne({
      where: {
        employee_id: employeeId,
        attendance_date: today,
      },
      relations: ['employee', 'attendanceType'],
    });
  }
}

