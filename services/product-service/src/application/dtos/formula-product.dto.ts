import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CreateFormulaProductDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  brand_id?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateFormulaProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
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
  brand_id?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class FormulaProductResponseDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  brand_id?: number;
  brand?: {
    id: number;
    name: string;
    code: string;
  };
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;
}

