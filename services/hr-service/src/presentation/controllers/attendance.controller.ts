import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AttendanceService } from '@/application/services/attendance.service';
import { GetAttendanceStatsUseCase } from '@/application/use-cases/attendance/get-attendance-stats.use-case';
import { ExportAttendanceUseCase } from '@/application/use-cases/attendance/export-attendance.use-case';
import {
  CheckInDto,
  CheckOutDto,
  EditAttendanceDto,
  ApproveAttendanceDto,
  RejectAttendanceDto,
  GetAttendanceQueryDto,
  AttendanceResponseDto,
} from '@/application/dtos/attendance.dto';
import { AttendanceRecord } from '@/infrastructure/database/entities/attendance-record.entity';

// TODO: Import guards when authentication is implemented
// import { JwtAuthGuard } from '@/presentation/guards/jwt-auth.guard';
// import { RolesGuard } from '@/presentation/guards/roles.guard';
// import { Roles } from '@/presentation/decorators/roles.decorator';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { EmployeeRepository } from '@/infrastructure/database/repositories/employee.repository';
import { NotFoundException } from '@nestjs/common';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
// @UseGuards(JwtAuthGuard) // TODO: Enable when auth is implemented
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly getAttendanceStatsUseCase: GetAttendanceStatsUseCase,
    private readonly exportAttendanceUseCase: ExportAttendanceUseCase,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  /**
   * Map AttendanceRecord entity to AttendanceResponseDto
   */
  private mapToDto(record: AttendanceRecord): AttendanceResponseDto {
    return {
      id: record.id,
      employee_id: record.employee_id,
      attendance_date: record.attendance_date,
      attendance_type_id: record.attendance_type_id,
      check_in_time: record.check_in_time,
      check_out_time: record.check_out_time,
      break_time: record.break_duration_minutes || 0,
      working_hours: record.working_hours,
      overtime_hours: record.overtime_hours || 0,
      late: record.late,
      late_minutes: record.late_minutes || 0,
      early_leave: record.early_leave,
      early_leave_minutes: record.early_leave_minutes || 0,
      type: record.type,
      special_case_type: record.special_case_type,
      status: record.status,
      approval_status: record.approval_status,
      approved_by: record.approved_by,
      approved_at: record.approved_at,
      rejected_by: record.rejected_by,
      rejected_at: record.rejected_at,
      rejection_reason: record.rejection_reason,
      approval_notes: record.approval_notes,
      notes: record.notes,
      location: record.location,
      check_in_location: record.check_in_location,
      check_in_latitude: record.check_in_latitude,
      check_in_longitude: record.check_in_longitude,
      check_out_location: record.check_out_location,
      check_out_latitude: record.check_out_latitude,
      check_out_longitude: record.check_out_longitude,
      late_reason: record.late_reason,
      early_leave_reason: record.early_leave_reason,
      edit_reason: record.edit_reason,
      is_edited: record.is_edited || false,
      edited_at: record.edited_at,
      edited_by: record.edited_by,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }

  @Post('check-in')
  @ApiOperation({ summary: 'Employee check-in' })
  // @UseGuards(RolesGuard)
  // @Roles('employee', 'manager', 'hr_manager')
  async checkIn(
    @Body() dto: CheckInDto,
    @CurrentUser() user: any,
  ): Promise<AttendanceResponseDto> {
    try {
      if (!user || !user.id) {
        throw new NotFoundException('User not found in request');
      }

      // Get employee by user_id
      const employee = await this.employeeRepository.findByUserId(Number(user.id));
      if (!employee) {
        throw new NotFoundException('Employee not found for this user');
      }

      const employeeId = employee.id;
      const userId = Number(user.id);
      
      const record = await this.attendanceService.checkIn(employeeId, dto, userId);
      return this.mapToDto(record);
    } catch (error: any) {
      // Log error for debugging
      console.error('Error in checkIn controller:', error);
      throw error;
    }
  }

  @Post('check-out')
  @ApiOperation({ summary: 'Employee check-out' })
  // @UseGuards(RolesGuard)
  // @Roles('employee', 'manager', 'hr_manager')
  async checkOut(
    @Body() dto: CheckOutDto,
    @CurrentUser() user: any,
  ): Promise<AttendanceResponseDto> {
    if (!user || !user.id) {
      throw new NotFoundException('User not found in request');
    }

    // Get employee by user_id
    const employee = await this.employeeRepository.findByUserId(Number(user.id));
    if (!employee) {
      throw new NotFoundException('Employee not found for this user');
    }

    const employeeId = employee.id;
    const userId = Number(user.id);
    
    const record = await this.attendanceService.checkOut(employeeId, dto, userId);
    return this.mapToDto(record);
  }

  @Get('my-attendance')
  @ApiOperation({ summary: 'Get my attendance records' })
  async getMyAttendance(
    @Query() query: GetAttendanceQueryDto,
    @CurrentUser() user: any,
  ) {
    if (!user || !user.id) {
      throw new NotFoundException('User not found in request');
    }

    // Get employee by user_id
    const employee = await this.employeeRepository.findByUserId(Number(user.id));
    if (!employee) {
      throw new NotFoundException('Employee not found for this user');
    }

    const employeeId = employee.id;
    const page = query.page || 1;
    const limit = query.limit || 10;
    
    return await this.attendanceService.getMyAttendance(
      employeeId,
      page,
      limit,
      query.dateFrom,
      query.dateTo,
      query.status,
    );
  }

  @Get('department')
  @ApiOperation({ summary: 'Get department attendance (Manager only)' })
  // @UseGuards(RolesGuard)
  // @Roles('manager', 'hr_manager')
  async getDepartmentAttendance(
    @Query() query: GetAttendanceQueryDto,
    @CurrentUser() user: any,
  ) {
    if (!user || !user.id) {
      throw new NotFoundException('User not found in request');
    }

    // Get employee by user_id to get department_id
    const employee = await this.employeeRepository.findByUserId(Number(user.id));
    if (!employee || !employee.department_id) {
      throw new NotFoundException('Employee or department not found for this user');
    }

    const departmentId = employee.department_id;
    const page = query.page || 1;
    const limit = query.limit || 10;
    
    return await this.attendanceService.getDepartmentAttendance(
      departmentId,
      page,
      limit,
      query.dateFrom,
      query.dateTo,
      query.status,
    );
  }

  @Get('pending-approvals')
  @ApiOperation({ summary: 'Get pending approvals (Manager/HR Manager)' })
  // @UseGuards(RolesGuard)
  // @Roles('manager', 'hr_manager')
  async getPendingApprovals(
    @Query() query: GetAttendanceQueryDto,
    @CurrentUser() user: any,
  ) {
    let departmentId: number | undefined;

    if (user && user.id) {
      // Get employee by user_id to get department_id
      // HR Manager can see all (departmentId = undefined), Manager sees only their department
      const employee = await this.employeeRepository.findByUserId(Number(user.id));
      if (employee && employee.department_id) {
        // TODO: Check if user is HR Manager or Manager
        // For now, Manager sees only their department
        departmentId = employee.department_id;
      }
    }
    
    const page = query.page || 1;
    const limit = query.limit || 10;
    
    return await this.attendanceService.getPendingApprovals(departmentId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    // @CurrentUser() user: any,
  ): Promise<AttendanceResponseDto> {
    const record = await this.attendanceService.findOne(id);
    
    // TODO: Authorization check
    // const employeeId = user.employeeId;
    // if (record.employee_id !== employeeId && !user.roles.includes('manager') && !user.roles.includes('hr_manager')) {
    //   throw new ForbiddenException('Access denied');
    // }
    
    return this.mapToDto(record);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit attendance record (within 24 hours)' })
  @ApiParam({ name: 'id', type: Number })
  async editAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditAttendanceDto,
    @CurrentUser() user: any,
  ): Promise<AttendanceResponseDto> {
    if (!user || !user.id) {
      throw new NotFoundException('User not found in request');
    }

    // Get employee by user_id
    const employee = await this.employeeRepository.findByUserId(Number(user.id));
    if (!employee) {
      throw new NotFoundException('Employee not found for this user');
    }

    const employeeId = employee.id;
    const userId = Number(user.id);
    
    const record = await this.attendanceService.editAttendance(id, employeeId, dto, userId);
    return this.mapToDto(record);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve attendance record' })
  @ApiParam({ name: 'id', type: Number })
  // @UseGuards(RolesGuard)
  // @Roles('manager', 'hr_manager')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveAttendanceDto,
    @CurrentUser() user: any,
  ): Promise<AttendanceResponseDto> {
    if (!user || !user.id) {
      throw new NotFoundException('User not found in request');
    }

    const approverId = Number(user.id);
    
    // Authorization check
    const existingRecord = await this.attendanceService.findOne(id);
    const canApprove = await this.attendanceService.canApprove(approverId, existingRecord.employee_id);
    
    if (!canApprove) {
      throw new ForbiddenException('Cannot approve this record');
    }
    
    const record = await this.attendanceService.approveAttendance(id, approverId, dto);
    return this.mapToDto(record);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject attendance record' })
  @ApiParam({ name: 'id', type: Number })
  // @UseGuards(RolesGuard)
  // @Roles('manager', 'hr_manager')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectAttendanceDto,
    @CurrentUser() user: any,
  ): Promise<AttendanceResponseDto> {
    if (!user || !user.id) {
      throw new NotFoundException('User not found in request');
    }

    const rejectorId = Number(user.id);
    
    // Authorization check
    const existingRecord = await this.attendanceService.findOne(id);
    const canApprove = await this.attendanceService.canApprove(rejectorId, existingRecord.employee_id);
    
    if (!canApprove) {
      throw new ForbiddenException('Cannot reject this record');
    }
    
    const record = await this.attendanceService.rejectAttendance(id, rejectorId, dto);
    return this.mapToDto(record);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get attendance statistics' })
  async getStats(
    @Query() query: GetAttendanceQueryDto,
    @CurrentUser() user: any,
  ) {
    let employeeId: number | undefined;
    let departmentId: number | undefined;

    if (user && user.id) {
      // Get employee by user_id
      const employee = await this.employeeRepository.findByUserId(Number(user.id));
      if (employee) {
        employeeId = employee.id;
        departmentId = employee.department_id || undefined;
      }
    }

    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

    return await this.getAttendanceStatsUseCase.execute(employeeId, departmentId, dateFrom, dateTo);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export attendance data' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv', 'excel'], required: false })
  async exportAttendance(
    @Query() query: GetAttendanceQueryDto & { format?: 'json' | 'csv' | 'excel' },
    @CurrentUser() user: any,
  ) {
    if (!query.dateFrom || !query.dateTo) {
      throw new BadRequestException('dateFrom and dateTo are required for export');
    }

    let employeeId: number | undefined;
    let departmentId: number | undefined;

    if (user && user.id) {
      // Get employee by user_id
      const employee = await this.employeeRepository.findByUserId(Number(user.id));
      if (employee) {
        employeeId = employee.id;
        departmentId = employee.department_id || undefined;
      }
    }

    const dateFrom = new Date(query.dateFrom);
    const dateTo = new Date(query.dateTo);
    const format = query.format || 'json';

    const result = await this.exportAttendanceUseCase.execute({
      dateFrom,
      dateTo,
      employeeId,
      departmentId,
      status: query.status,
      format,
    });

    return { data: result, format };
  }
}

