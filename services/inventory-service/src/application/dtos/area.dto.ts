import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { AreaType, AreaStatus } from '../../domain/entities/area.entity';

export class CreateAreaDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  warehouseId: number;

  @IsEnum(AreaType)
  type: AreaType;

  @IsOptional()
  @IsEnum(AreaStatus)
  status?: AreaStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(50)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAreaDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  warehouseId?: number;

  @IsOptional()
  @IsEnum(AreaType)
  type?: AreaType;

  @IsOptional()
  @IsEnum(AreaStatus)
  status?: AreaStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(50)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
