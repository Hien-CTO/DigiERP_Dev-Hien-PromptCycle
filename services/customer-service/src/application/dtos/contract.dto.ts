import { IsString, IsOptional, IsNumber, IsUUID, IsDateString, Min } from 'class-validator';

export class CreateContractDto {
  @IsString()
  contractNumber: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  contractValue?: number;

  @IsOptional()
  @IsString()
  termsConditions?: string;

  @IsOptional()
  @IsString()
  signedBy?: string;

  @IsOptional()
  @IsDateString()
  signedDate?: string;

  @IsUUID()
  customerId: string;
}

export class UpdateContractDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  contractValue?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  termsConditions?: string;

  @IsOptional()
  @IsString()
  signedBy?: string;

  @IsOptional()
  @IsDateString()
  signedDate?: string;
}

export class ContractResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  contractNumber: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  contractValue?: number;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  termsConditions?: string;

  @IsOptional()
  @IsString()
  signedBy?: string;

  @IsOptional()
  @IsString()
  signedDate?: string;

  @IsUUID()
  customerId: string;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;
}
