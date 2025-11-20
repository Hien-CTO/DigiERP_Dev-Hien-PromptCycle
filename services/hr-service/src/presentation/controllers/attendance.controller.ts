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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AttendanceService } from '@/application/services/attendance.service';
import {
  CheckInDto,
  CheckOutDto,
  EditAttendanceDto,
  ApproveAttendanceDto,
  RejectAttendanceDto,
  GetAttendanceQueryDto,
  AttendanceResponseDto,
} from '@/application/dtos/attendance.dto';

// TODO: Import guards when authentication is implemented
// import { JwtAuthGuard } from '@/presentation/guards/jwt-auth.guard';
// import { RolesGuard } from '@/presentation/guards/roles.guard';
// import { Roles } from '@/presentation/decorators/roles.decorator';
// import { CurrentUser } from '@/presentation/decorators/current-user.decorator';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
// @UseGuards(JwtAuthGuard) // TODO: Enable when auth is implemented
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @ApiOperation({ summary: 'Employee check-in' })
  // @UseGuards(RolesGuard)
  // @Roles('employee', 'manager', 'hr_manager')
  async checkIn(
    @Body() dto: CheckInDto,
    // @CurrentUser() user: any, // TODO: Get from JWT token
  ): Promise<AttendanceResponseDto> {
    // TODO: Get employeeId from user.employeeId
    const employeeId = 1; // Temporary - should come from JWT token
    const userId = 1; // Temporary - should come from JWT token
    
    return await this.attendanceService.checkIn(employeeId, dto, userId);
  }

  @Post('check-out')
  @ApiOperation({ summary: 'Employee check-out' })
  // @UseGuards(RolesGuard)
  // @Roles('employee', 'manager', 'hr_manager')
  async checkOut(
    @Body() dto: CheckOutDto,
    // @CurrentUser() user: any,
  ): Promise<AttendanceResponseDto> {
    const employeeId = 1; // Temporary
    const userId = 1; // Temporary
    
    return await this.attendanceService.checkOut(employeeId, dto, userId);
  }

  @Get('my-attendance')
  @ApiOperation({ summary: 'Get my attendance records' })
  async getMyAttendance(
    @Query() query: GetAttendanceQueryDto,
    // @CurrentUser() user: any,
  ) {
    const employeeId = 1; // Temporary - should come from user.employeeId
    
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
    // @CurrentUser() user: any,
  ) {
    // TODO: Get departmentId from user.departmentId
    const departmentId = 1; // Temporary
    
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
    // @CurrentUser() user: any,
  ) {
    // TODO: Get departmentId from user.departmentId (for manager)
    const departmentId = undefined; // HR Manager can see all, Manager sees only their department
    
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
    
    return record;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit attendance record (within 24 hours)' })
  @ApiParam({ name: 'id', type: Number })
  async editAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditAttendanceDto,
    // @CurrentUser() user: any,
  ): Promise<AttendanceResponseDto> {
    const employeeId = 1; // Temporary
    const userId = 1; // Temporary
    
    return await this.attendanceService.editAttendance(id, employeeId, dto, userId);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve attendance record' })
  @ApiParam({ name: 'id', type: Number })
  // @UseGuards(RolesGuard)
  // @Roles('manager', 'hr_manager')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveAttendanceDto,
    // @CurrentUser() user: any,
  ): Promise<AttendanceResponseDto> {
    const approverId = 1; // Temporary
    
    // Authorization check
    const record = await this.attendanceService.findOne(id);
    const canApprove = await this.attendanceService.canApprove(approverId, record.employee_id);
    
    if (!canApprove) {
      throw new ForbiddenException('Cannot approve this record');
    }
    
    return await this.attendanceService.approveAttendance(id, approverId, dto);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject attendance record' })
  @ApiParam({ name: 'id', type: Number })
  // @UseGuards(RolesGuard)
  // @Roles('manager', 'hr_manager')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectAttendanceDto,
    // @CurrentUser() user: any,
  ): Promise<AttendanceResponseDto> {
    const rejectorId = 1; // Temporary
    
    // Authorization check
    const record = await this.attendanceService.findOne(id);
    const canApprove = await this.attendanceService.canApprove(rejectorId, record.employee_id);
    
    if (!canApprove) {
      throw new ForbiddenException('Cannot reject this record');
    }
    
    return await this.attendanceService.rejectAttendance(id, rejectorId, dto);
  }
}

