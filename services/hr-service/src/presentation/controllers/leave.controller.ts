import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { LeaveService } from '@/application/services/leave.service';
import { CreateLeaveRequestUseCase } from '@/application/use-cases/leave/create-leave-request.use-case';
import { GetLeaveRequestsUseCase } from '@/application/use-cases/leave/get-leave-requests.use-case';
import { GetLeaveBalanceUseCase } from '@/application/use-cases/leave/get-leave-balance.use-case';
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  GetLeaveRequestsQueryDto,
  GetLeaveBalanceQueryDto,
  ApproveLeaveRequestDto,
  RejectLeaveRequestDto,
  CancelLeaveRequestDto,
  LeaveRequestResponseDto,
  LeaveBalanceResponseDto,
} from '@/application/dtos/leave.dto';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { EmployeeRepository } from '@/infrastructure/database/repositories/employee.repository';
import { LeaveRequest } from '@/infrastructure/database/entities/leave-request.entity';

@ApiTags('Leave Management')
@ApiBearerAuth()
@Controller('leave')
// @UseGuards(JwtAuthGuard) // TODO: Enable when auth is implemented
export class LeaveController {
  constructor(
    private readonly leaveService: LeaveService,
    private readonly createLeaveRequestUseCase: CreateLeaveRequestUseCase,
    private readonly getLeaveRequestsUseCase: GetLeaveRequestsUseCase,
    private readonly getLeaveBalanceUseCase: GetLeaveBalanceUseCase,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  /**
   * Map LeaveRequest entity to LeaveRequestResponseDto
   */
  private mapToDto(leaveRequest: LeaveRequest): LeaveRequestResponseDto {
    return {
      id: leaveRequest.id,
      request_number: leaveRequest.request_number,
      employee_id: leaveRequest.employee_id,
      leave_type_id: leaveRequest.leave_type_id,
      start_date: leaveRequest.start_date,
      end_date: leaveRequest.end_date,
      total_days: leaveRequest.total_days,
      is_half_day: leaveRequest.is_half_day,
      half_day_type: leaveRequest.half_day_type,
      reason: leaveRequest.reason,
      approver_id: leaveRequest.approver_id,
      hr_approver_id: leaveRequest.hr_approver_id,
      requires_hr_approval: leaveRequest.requires_hr_approval,
      status: leaveRequest.status as any,
      manager_approved_at: leaveRequest.manager_approved_at,
      hr_approved_at: leaveRequest.hr_approved_at,
      manager_rejection_reason: leaveRequest.manager_rejection_reason,
      hr_rejection_reason: leaveRequest.hr_rejection_reason,
      manager_notes: leaveRequest.manager_notes,
      hr_notes: leaveRequest.hr_notes,
      attachment_url: leaveRequest.attachment_url,
      is_edited: leaveRequest.is_edited,
      edited_at: leaveRequest.edited_at,
      edited_by: leaveRequest.edited_by,
      edit_reason: leaveRequest.edit_reason,
      cancellation_reason: leaveRequest.cancellation_reason,
      cancelled_at: leaveRequest.cancelled_at,
      cancelled_by: leaveRequest.cancelled_by,
      notes: leaveRequest.notes,
      created_at: leaveRequest.created_at,
      updated_at: leaveRequest.updated_at,
      employee: leaveRequest.employee,
      leaveType: leaveRequest.leaveType,
      approver: leaveRequest.approver,
      hrApprover: leaveRequest.hrApprover,
    };
  }

  @Post('requests')
  @ApiOperation({ summary: 'Create a new leave request' })
  async create(
    @Body() dto: CreateLeaveRequestDto,
    @CurrentUser() user: any,
  ): Promise<LeaveRequestResponseDto> {
    if (!user || !user.id) {
      throw new NotFoundException('User not found in request');
    }

    const userId = Number(user.id);
    const leaveRequest = await this.createLeaveRequestUseCase.execute(dto, userId);
    return this.mapToDto(leaveRequest);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get leave requests with filters' })
  async findAll(@Query() query: GetLeaveRequestsQueryDto): Promise<{
    leaveRequests: LeaveRequestResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.getLeaveRequestsUseCase.execute(query);
    return {
      leaveRequests: result.leaveRequests.map((lr) => this.mapToDto(lr)),
      total: result.total,
      page: query.page || 1,
      limit: query.limit || 10,
    };
  }

  @Get('requests/my-requests')
  @ApiOperation({ summary: 'Get my leave requests' })
  async getMyRequests(
    @Query() query: GetLeaveRequestsQueryDto,
    @CurrentUser() user: any,
  ): Promise<{
    leaveRequests: LeaveRequestResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    if (!user || !user.id) {
      throw new NotFoundException('User not found in request');
    }

    const employee = await this.employeeRepository.findByUserId(Number(user.id));
    if (!employee) {
      throw new NotFoundException('Employee not found for this user');
    }

    const result = await this.getLeaveRequestsUseCase.execute({
      ...query,
      employee_id: employee.id,
    });

    return {
      leaveRequests: result.leaveRequests.map((lr) => this.mapToDto(lr)),
      total: result.total,
      page: query.page || 1,
      limit: query.limit || 10,
    };
  }

  @Get('requests/pending-approvals')
  @ApiOperation({ summary: 'Get pending approvals for manager/HR manager' })
  async getPendingApprovals(
    @Query() query: GetLeaveRequestsQueryDto,
    @CurrentUser() user: any,
  ): Promise<{
    leaveRequests: LeaveRequestResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    if (!user || !user.id) {
      throw new NotFoundException('User not found in request');
    }

    const employee = await this.employeeRepository.findByUserId(Number(user.id));
    if (!employee) {
      throw new NotFoundException('Employee not found for this user');
    }

    // Get leave requests where this employee is the approver or HR approver
    const result = await this.leaveService.getLeaveRequests(
      query.page || 1,
      query.limit || 10,
      {
        status: query.status as any,
        date_from: query.date_from ? new Date(query.date_from) : undefined,
        date_to: query.date_to ? new Date(query.date_to) : undefined,
      },
    );

    // Filter to only show requests where this employee is the approver
    const filteredRequests = result.leaveRequests.filter(
      (lr) => lr.approver_id === employee.id || lr.hr_approver_id === employee.id,
    );

    return {
      leaveRequests: filteredRequests.map((lr) => this.mapToDto(lr)),
      total: filteredRequests.length,
      page: query.page || 1,
      limit: query.limit || 10,
    };
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get leave request by ID' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<LeaveRequestResponseDto> {
    const leaveRequest = await this.leaveService.getLeaveRequestById(id);
    return this.mapToDto(leaveRequest);
  }

  @Put('requests/:id')
  @ApiOperation({ summary: 'Update leave request' })
  @ApiParam({ name: 'id', type: Number })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeaveRequestDto,
    @CurrentUser() user: any,
  ): Promise<LeaveRequestResponseDto> {
    if (!user || !user.id) {
      throw new NotFoundException('User not found in request');
    }

    const userId = Number(user.id);
    const leaveRequest = await this.leaveService.updateLeaveRequest(id, dto, userId);
    return this.mapToDto(leaveRequest);
  }

  @Put('requests/:id/approve')
  @ApiOperation({ summary: 'Approve leave request (Manager or HR Manager)' })
  @ApiParam({ name: 'id', type: Number })
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveLeaveRequestDto,
    @CurrentUser() user: any,
  ): Promise<LeaveRequestResponseDto> {
    if (!user || !user.id) {
      throw new NotFoundException('User not found in request');
    }

    const employee = await this.employeeRepository.findByUserId(Number(user.id));
    if (!employee) {
      throw new NotFoundException('Employee not found for this user');
    }

    const leaveRequest = await this.leaveService.getLeaveRequestById(id);
    
    // Determine if this is HR manager approval
    const isHrManager = leaveRequest.hr_approver_id === employee.id;
    const approverId = employee.id;

    const updatedRequest = await this.leaveService.approveLeaveRequest(
      id,
      dto,
      approverId,
      isHrManager,
    );
    return this.mapToDto(updatedRequest);
  }

  @Put('requests/:id/reject')
  @ApiOperation({ summary: 'Reject leave request (Manager or HR Manager)' })
  @ApiParam({ name: 'id', type: Number })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectLeaveRequestDto,
    @CurrentUser() user: any,
  ): Promise<LeaveRequestResponseDto> {
    if (!user || !user.id) {
      throw new NotFoundException('User not found in request');
    }

    const employee = await this.employeeRepository.findByUserId(Number(user.id));
    if (!employee) {
      throw new NotFoundException('Employee not found for this user');
    }

    const leaveRequest = await this.leaveService.getLeaveRequestById(id);
    
    // Determine if this is HR manager rejection
    const isHrManager = leaveRequest.hr_approver_id === employee.id;
    const rejectorId = employee.id;

    const updatedRequest = await this.leaveService.rejectLeaveRequest(
      id,
      dto,
      rejectorId,
      isHrManager,
    );
    return this.mapToDto(updatedRequest);
  }

  @Put('requests/:id/cancel')
  @ApiOperation({ summary: 'Cancel leave request' })
  @ApiParam({ name: 'id', type: Number })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelLeaveRequestDto,
    @CurrentUser() user: any,
  ): Promise<LeaveRequestResponseDto> {
    if (!user || !user.id) {
      throw new NotFoundException('User not found in request');
    }

    const userId = Number(user.id);
    const leaveRequest = await this.leaveService.cancelLeaveRequest(id, dto, userId);
    return this.mapToDto(leaveRequest);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get leave balance for employee' })
  async getBalance(@Query() query: GetLeaveBalanceQueryDto): Promise<LeaveBalanceResponseDto[]> {
    const balances = await this.getLeaveBalanceUseCase.execute(query);
    return balances.map((balance) => ({
      id: balance.id,
      employee_id: balance.employee_id,
      leave_type_id: balance.leave_type_id,
      year: balance.year,
      entitlement_days: balance.entitlement_days,
      used_days: balance.used_days,
      remaining_days: balance.remaining_days,
      carry_over_days: balance.carry_over_days,
      expired_days: balance.expired_days,
      pending_days: balance.pending_days,
      last_calculated_at: balance.last_calculated_at,
      notes: balance.notes,
      created_at: balance.created_at,
      updated_at: balance.updated_at,
      employee: balance.employee,
      leaveType: balance.leaveType,
    }));
  }

  @Get('balance/my-balance')
  @ApiOperation({ summary: 'Get my leave balance' })
  async getMyBalance(
    @Query() query: Omit<GetLeaveBalanceQueryDto, 'employee_id'>,
    @CurrentUser() user: any,
  ): Promise<LeaveBalanceResponseDto[]> {
    if (!user || !user.id) {
      throw new NotFoundException('User not found in request');
    }

    const employee = await this.employeeRepository.findByUserId(Number(user.id));
    if (!employee) {
      throw new NotFoundException('Employee not found for this user');
    }

    const balances = await this.getLeaveBalanceUseCase.execute({
      ...query,
      employee_id: employee.id,
    });

    return balances.map((balance) => ({
      id: balance.id,
      employee_id: balance.employee_id,
      leave_type_id: balance.leave_type_id,
      year: balance.year,
      entitlement_days: balance.entitlement_days,
      used_days: balance.used_days,
      remaining_days: balance.remaining_days,
      carry_over_days: balance.carry_over_days,
      expired_days: balance.expired_days,
      pending_days: balance.pending_days,
      last_calculated_at: balance.last_calculated_at,
      notes: balance.notes,
      created_at: balance.created_at,
      updated_at: balance.updated_at,
      employee: balance.employee,
      leaveType: balance.leaveType,
    }));
  }
}

