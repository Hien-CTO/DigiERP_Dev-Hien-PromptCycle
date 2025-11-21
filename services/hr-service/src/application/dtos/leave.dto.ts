import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Enums
export enum LeaveRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum HalfDayType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
}

export enum ApprovalLevel {
  MANAGER = 'MANAGER',
  HR_MANAGER = 'HR_MANAGER',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Create Leave Request DTO
export class CreateLeaveRequestDto {
  @ApiProperty({ description: 'ID nhân viên', example: 1 })
  @IsInt()
  @Min(1)
  employee_id: number;

  @ApiProperty({ description: 'ID loại nghỉ phép', example: 1 })
  @IsInt()
  @Min(1)
  leave_type_id: number;

  @ApiProperty({ description: 'Ngày bắt đầu nghỉ', example: '2025-01-15' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ description: 'Ngày kết thúc nghỉ', example: '2025-01-17' })
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional({ description: 'Nghỉ nửa ngày', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  is_half_day?: boolean;

  @ApiPropertyOptional({
    description: 'Loại nửa ngày (MORNING/AFTERNOON)',
    enum: HalfDayType,
    example: HalfDayType.MORNING,
  })
  @IsEnum(HalfDayType)
  @IsOptional()
  @ValidateIf((o) => o.is_half_day === true)
  half_day_type?: HalfDayType;

  @ApiProperty({ description: 'Lý do nghỉ phép' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  reason: string;

  @ApiPropertyOptional({ description: 'Link file đính kèm' })
  @IsString()
  @IsOptional()
  attachment_url?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Yêu cầu phê duyệt từ HR Manager', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  requires_hr_approval?: boolean;
}

// Update Leave Request DTO
export class UpdateLeaveRequestDto {
  @ApiPropertyOptional({ description: 'ID loại nghỉ phép', example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  leave_type_id?: number;

  @ApiPropertyOptional({ description: 'Ngày bắt đầu nghỉ', example: '2025-01-15' })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ description: 'Ngày kết thúc nghỉ', example: '2025-01-17' })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({ description: 'Nghỉ nửa ngày', example: false })
  @IsBoolean()
  @IsOptional()
  is_half_day?: boolean;

  @ApiPropertyOptional({
    description: 'Loại nửa ngày (MORNING/AFTERNOON)',
    enum: HalfDayType,
  })
  @IsEnum(HalfDayType)
  @IsOptional()
  half_day_type?: HalfDayType;

  @ApiPropertyOptional({ description: 'Lý do nghỉ phép' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'Link file đính kèm' })
  @IsString()
  @IsOptional()
  attachment_url?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Lý do chỉnh sửa' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @IsOptional()
  edit_reason?: string;
}

// Query Leave Requests DTO
export class GetLeaveRequestsQueryDto {
  @ApiPropertyOptional({ description: 'Trang', example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Số lượng mỗi trang', example: 10, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'ID nhân viên', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  employee_id?: number;

  @ApiPropertyOptional({ description: 'ID loại nghỉ phép', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  leave_type_id?: number;

  @ApiPropertyOptional({ description: 'Trạng thái', enum: LeaveRequestStatus })
  @IsEnum(LeaveRequestStatus)
  @IsOptional()
  status?: LeaveRequestStatus;

  @ApiPropertyOptional({ description: 'Từ ngày', example: '2025-01-01' })
  @IsDateString()
  @IsOptional()
  date_from?: string;

  @ApiPropertyOptional({ description: 'Đến ngày', example: '2025-12-31' })
  @IsDateString()
  @IsOptional()
  date_to?: string;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo số đơn' })
  @IsString()
  @IsOptional()
  search?: string;
}

// Approve Leave Request DTO
export class ApproveLeaveRequestDto {
  @ApiPropertyOptional({ description: 'Ghi chú từ người phê duyệt' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// Reject Leave Request DTO
export class RejectLeaveRequestDto {
  @ApiProperty({ description: 'Lý do từ chối' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  rejection_reason: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// Cancel Leave Request DTO
export class CancelLeaveRequestDto {
  @ApiProperty({ description: 'Lý do hủy' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  cancellation_reason: string;
}

// Get Leave Balance Query DTO
export class GetLeaveBalanceQueryDto {
  @ApiProperty({ description: 'ID nhân viên', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employee_id: number;

  @ApiPropertyOptional({ description: 'Năm', example: 2025 })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(3000)
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ description: 'ID loại nghỉ phép', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  leave_type_id?: number;
}

// Create Leave Entitlement DTO
export class CreateLeaveEntitlementDto {
  @ApiProperty({ description: 'ID nhân viên', example: 1 })
  @IsInt()
  @Min(1)
  employee_id: number;

  @ApiProperty({ description: 'ID loại nghỉ phép', example: 1 })
  @IsInt()
  @Min(1)
  leave_type_id: number;

  @ApiProperty({ description: 'Năm', example: 2025 })
  @IsInt()
  @Min(2000)
  @Max(3000)
  year: number;

  @ApiProperty({ description: 'Số ngày được cấp phát', example: 12 })
  @IsNumber()
  @Min(0)
  @Max(365)
  entitlement_days: number;

  @ApiProperty({ description: 'Ngày được cấp phát', example: '2025-01-01' })
  @IsDateString()
  granted_date: string;

  @ApiPropertyOptional({ description: 'Ngày hết hạn', example: '2025-12-31' })
  @IsDateString()
  @IsOptional()
  expiration_date?: string;

  @ApiPropertyOptional({ description: 'Số ngày carry-over từ năm trước', example: 0, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  carry_over_days?: number;

  @ApiPropertyOptional({ description: 'Cơ sở tính toán', example: 'CONTRACT_TYPE' })
  @IsString()
  @IsOptional()
  calculation_basis?: string;

  @ApiPropertyOptional({ description: 'Chi tiết tính toán (JSON)' })
  @IsString()
  @IsOptional()
  calculation_details?: string;

  @ApiPropertyOptional({ description: 'Có phải prorated', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  is_prorated?: boolean;

  @ApiPropertyOptional({ description: 'Ngày bắt đầu tính prorated', example: '2025-06-01' })
  @IsDateString()
  @IsOptional()
  prorated_from_date?: string;

  @ApiPropertyOptional({ description: 'Ngày kết thúc tính prorated', example: '2025-12-31' })
  @IsDateString()
  @IsOptional()
  prorated_to_date?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// Response DTOs
export class LeaveRequestResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  request_number: string;

  @ApiProperty()
  employee_id: number;

  @ApiProperty()
  leave_type_id: number;

  @ApiProperty()
  start_date: Date;

  @ApiProperty()
  end_date: Date;

  @ApiProperty()
  total_days: number;

  @ApiProperty()
  is_half_day: boolean;

  @ApiPropertyOptional()
  half_day_type?: string;

  @ApiProperty()
  reason: string;

  @ApiPropertyOptional()
  approver_id?: number;

  @ApiPropertyOptional()
  hr_approver_id?: number;

  @ApiProperty()
  requires_hr_approval: boolean;

  @ApiProperty({ enum: LeaveRequestStatus })
  status: LeaveRequestStatus;

  @ApiPropertyOptional()
  manager_approved_at?: Date;

  @ApiPropertyOptional()
  hr_approved_at?: Date;

  @ApiPropertyOptional()
  manager_rejection_reason?: string;

  @ApiPropertyOptional()
  hr_rejection_reason?: string;

  @ApiPropertyOptional()
  manager_notes?: string;

  @ApiPropertyOptional()
  hr_notes?: string;

  @ApiPropertyOptional()
  attachment_url?: string;

  @ApiProperty()
  is_edited: boolean;

  @ApiPropertyOptional()
  edited_at?: Date;

  @ApiPropertyOptional()
  edited_by?: number;

  @ApiPropertyOptional()
  edit_reason?: string;

  @ApiPropertyOptional()
  cancellation_reason?: string;

  @ApiPropertyOptional()
  cancelled_at?: Date;

  @ApiPropertyOptional()
  cancelled_by?: number;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  // Relations
  @ApiPropertyOptional()
  employee?: any;

  @ApiPropertyOptional()
  leaveType?: any;

  @ApiPropertyOptional()
  approver?: any;

  @ApiPropertyOptional()
  hrApprover?: any;

  @ApiPropertyOptional()
  approvals?: any[];

  @ApiPropertyOptional()
  editHistory?: any[];
}

export class LeaveBalanceResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  employee_id: number;

  @ApiProperty()
  leave_type_id: number;

  @ApiProperty()
  year: number;

  @ApiProperty()
  entitlement_days: number;

  @ApiProperty()
  used_days: number;

  @ApiProperty()
  remaining_days: number;

  @ApiProperty()
  carry_over_days: number;

  @ApiProperty()
  expired_days: number;

  @ApiProperty()
  pending_days: number;

  @ApiPropertyOptional()
  last_calculated_at?: Date;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  // Relations
  @ApiPropertyOptional()
  employee?: any;

  @ApiPropertyOptional()
  leaveType?: any;
}

export class LeaveEntitlementResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  employee_id: number;

  @ApiProperty()
  leave_type_id: number;

  @ApiProperty()
  year: number;

  @ApiProperty()
  entitlement_days: number;

  @ApiProperty()
  granted_date: Date;

  @ApiPropertyOptional()
  expiration_date?: Date;

  @ApiProperty()
  carry_over_days: number;

  @ApiPropertyOptional()
  calculation_basis?: string;

  @ApiPropertyOptional()
  calculation_details?: string;

  @ApiProperty()
  is_prorated: boolean;

  @ApiPropertyOptional()
  prorated_from_date?: Date;

  @ApiPropertyOptional()
  prorated_to_date?: Date;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  // Relations
  @ApiPropertyOptional()
  employee?: any;

  @ApiPropertyOptional()
  leaveType?: any;
}

