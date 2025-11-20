import { IsString, IsOptional, IsEmail, IsDateString, IsEnum, IsNumber, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Mã nhân viên', example: 'EMP001' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  employee_code: string;

  @ApiPropertyOptional({ description: 'ID tài khoản user (nếu có)', example: 1 })
  @IsNumber()
  @IsOptional()
  user_id?: number;

  @ApiProperty({ description: 'Tên', example: 'Nguyễn' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  first_name: string;

  @ApiProperty({ description: 'Họ', example: 'Văn A' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  last_name: string;

  @ApiPropertyOptional({ description: 'Giới tính', enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Ngày sinh', example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @ApiPropertyOptional({ description: 'Nơi sinh', example: 'Hà Nội' })
  @IsString()
  @IsOptional()
  place_of_birth?: string;

  @ApiPropertyOptional({ description: 'Số CMND/CCCD', example: '001234567890' })
  @IsString()
  @IsOptional()
  id_card_number?: string;

  @ApiPropertyOptional({ description: 'Ngày cấp CMND/CCCD', example: '2010-01-01' })
  @IsDateString()
  @IsOptional()
  id_card_issued_date?: string;

  @ApiPropertyOptional({ description: 'Nơi cấp CMND/CCCD', example: 'CA Hà Nội' })
  @IsString()
  @IsOptional()
  id_card_issued_place?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ thường trú' })
  @IsString()
  @IsOptional()
  permanent_address?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ tạm trú' })
  @IsString()
  @IsOptional()
  temporary_address?: string;

  @ApiPropertyOptional({ description: 'Thành phố', example: 'Hà Nội' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Tỉnh/Thành phố', example: 'Hà Nội' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ description: 'Quốc gia', example: 'Vietnam', default: 'Vietnam' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Mã bưu điện', example: '100000' })
  @IsString()
  @IsOptional()
  postal_code?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0912345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'employee@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Tên người liên hệ khẩn cấp' })
  @IsString()
  @IsOptional()
  emergency_contact_name?: string;

  @ApiPropertyOptional({ description: 'SĐT người liên hệ khẩn cấp' })
  @IsString()
  @IsOptional()
  emergency_contact_phone?: string;

  @ApiPropertyOptional({ description: 'Mối quan hệ với người liên hệ khẩn cấp' })
  @IsString()
  @IsOptional()
  emergency_contact_relationship?: string;

  @ApiPropertyOptional({ description: 'ID phòng ban', example: 1 })
  @IsNumber()
  @IsOptional()
  department_id?: number;

  @ApiPropertyOptional({ description: 'ID chức vụ', example: 1 })
  @IsNumber()
  @IsOptional()
  position_id?: number;

  @ApiPropertyOptional({ description: 'ID quản lý trực tiếp', example: 1 })
  @IsNumber()
  @IsOptional()
  manager_id?: number;

  @ApiProperty({ description: 'Ngày vào làm', example: '2024-01-01' })
  @IsDateString()
  hire_date: string;

  @ApiPropertyOptional({ description: 'Ngày kết thúc thử việc', example: '2024-04-01' })
  @IsDateString()
  @IsOptional()
  probation_end_date?: string;

  @ApiPropertyOptional({ description: 'ID trạng thái nhân viên', example: 1 })
  @IsNumber()
  @IsOptional()
  status_id?: number;

  @ApiPropertyOptional({ description: 'ID loại hợp đồng', example: 1 })
  @IsNumber()
  @IsOptional()
  contract_type_id?: number;

  @ApiPropertyOptional({ description: 'Lương cơ bản', example: 10000000 })
  @IsNumber()
  @IsOptional()
  base_salary?: number;

  @ApiPropertyOptional({ description: 'Loại tiền tệ', example: 'VND', default: 'VND' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'URL ảnh đại diện' })
  @IsString()
  @IsOptional()
  avatar_url?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateEmployeeDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  department_id?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  position_id?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  manager_id?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  status_id?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  base_salary?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class EmployeeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  employee_code: string;

  @ApiPropertyOptional()
  user_id?: number;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  full_name: string;

  @ApiPropertyOptional()
  gender?: string;

  @ApiPropertyOptional()
  date_of_birth?: Date;

  @ApiPropertyOptional()
  department_id?: number;

  @ApiPropertyOptional()
  position_id?: number;

  @ApiPropertyOptional()
  manager_id?: number;

  @ApiProperty()
  hire_date: Date;

  @ApiPropertyOptional()
  status_id?: number;

  @ApiPropertyOptional()
  base_salary?: number;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

