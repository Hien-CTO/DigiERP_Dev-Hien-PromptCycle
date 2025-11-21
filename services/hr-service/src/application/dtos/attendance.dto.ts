import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckInDto {
  @ApiPropertyOptional({
    description: 'Location (GPS or address)',
    maxLength: 255,
    example: '123 Main St, Hanoi',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    description: 'GPS Latitude',
    example: 21.0285,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'GPS Longitude',
    example: 105.8542,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Reason for late check-in',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  lateReason?: string;
}

export class CheckOutDto {
  @ApiPropertyOptional({
    description: 'Location (GPS or address)',
    maxLength: 255,
    example: '123 Main St, Hanoi',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    description: 'GPS Latitude',
    example: 21.0285,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'GPS Longitude',
    example: 105.8542,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Reason for early leave',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  earlyLeaveReason?: string;
}

export class EditAttendanceDto {
  @ApiProperty({
    description: 'Check-in time',
    example: '2025-11-19T08:30:00Z',
  })
  @IsDateString()
  checkInTime: string;

  @ApiProperty({
    description: 'Check-out time',
    example: '2025-11-19T17:30:00Z',
  })
  @IsDateString()
  checkOutTime: string;

  @ApiProperty({
    description: 'Reason for editing',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  editReason: string;
}

export class ApproveAttendanceDto {
  @ApiPropertyOptional({ description: 'Approval notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class RejectAttendanceDto {
  @ApiProperty({
    description: 'Rejection reason',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  rejectionReason: string;
}

export class GetAttendanceQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Status filter',
    enum: ['CHECKED_IN', 'COMPLETED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
  })
  @IsOptional()
  @IsEnum(['CHECKED_IN', 'COMPLETED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'])
  status?: string;
}

export class AttendanceResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  employee_id: number;

  @ApiProperty()
  attendance_date: Date;

  @ApiPropertyOptional()
  attendance_type_id?: number;

  @ApiProperty()
  check_in_time: Date;

  @ApiPropertyOptional()
  check_out_time?: Date;

  @ApiPropertyOptional()
  break_time?: number;

  @ApiPropertyOptional()
  working_hours?: number;

  @ApiProperty()
  overtime_hours: number;

  @ApiProperty()
  late: boolean;

  @ApiProperty()
  late_minutes: number;

  @ApiPropertyOptional()
  late_reason?: string;

  @ApiProperty()
  early_leave: boolean;

  @ApiProperty()
  early_leave_minutes: number;

  @ApiPropertyOptional()
  early_leave_reason?: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  approval_status: string;

  @ApiPropertyOptional()
  approved_by?: number;

  @ApiPropertyOptional()
  approved_at?: Date;

  @ApiPropertyOptional()
  rejected_by?: number;

  @ApiPropertyOptional()
  rejected_at?: Date;

  @ApiPropertyOptional()
  rejection_reason?: string;

  @ApiPropertyOptional()
  edit_reason?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional()
  check_in_location?: string;

  @ApiPropertyOptional()
  check_in_latitude?: number;

  @ApiPropertyOptional()
  check_in_longitude?: number;

  @ApiPropertyOptional()
  check_out_location?: string;

  @ApiPropertyOptional()
  check_out_latitude?: number;

  @ApiPropertyOptional()
  check_out_longitude?: number;

  @ApiPropertyOptional()
  special_case_type?: string;

  @ApiPropertyOptional()
  is_edited?: boolean;

  @ApiPropertyOptional()
  edited_at?: Date;

  @ApiPropertyOptional()
  edited_by?: number;

  @ApiPropertyOptional()
  approval_notes?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

