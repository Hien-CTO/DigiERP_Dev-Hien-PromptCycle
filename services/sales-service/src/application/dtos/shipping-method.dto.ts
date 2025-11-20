import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength, Min } from 'class-validator';

export class CreateShippingMethodDto {
  @IsString()
  @MaxLength(20)
  code: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsNumber()
  estimated_days?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateShippingMethodDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsNumber()
  estimated_days?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class ShippingMethodResponseDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  cost: number;
  estimated_days?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;
}
