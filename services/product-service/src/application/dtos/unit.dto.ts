import { IsString, IsOptional, IsBoolean, MaxLength, IsEnum } from 'class-validator';

export enum UnitType {
  WEIGHT = 'WEIGHT',
  LENGTH = 'LENGTH',
  VOLUME = 'VOLUME',
  PIECE = 'PIECE',
  OTHER = 'OTHER',
}

export class CreateUnitDto {
  @IsString()
  @MaxLength(10)
  code: string;

  @IsString()
  @MaxLength(50)
  name: string;

  @IsString()
  @MaxLength(10)
  symbol: string;

  @IsEnum(UnitType)
  type: UnitType;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateUnitDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  symbol?: string;

  @IsOptional()
  @IsEnum(UnitType)
  type?: UnitType;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UnitResponseDto {
  id: number;
  code: string;
  name: string;
  symbol: string;
  type: UnitType;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;
}
