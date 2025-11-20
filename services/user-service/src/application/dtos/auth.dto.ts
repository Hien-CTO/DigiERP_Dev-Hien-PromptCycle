import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Username or email address' })
  @IsNotEmpty()
  @IsString()
  usernameOrEmail: string;

  @ApiProperty({ description: 'User password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Token expiration time in seconds' })
  expiresIn: number;

  @ApiProperty({ description: 'User information' })
  user: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    isActive: boolean;
    isVerified: boolean;
  };
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'JWT refresh token' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({ description: 'New JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'New JWT refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Token expiration time in seconds' })
  expiresIn: number;
}

export class LogoutDto {
  @ApiProperty({ description: 'JWT refresh token to invalidate' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class UserProfileDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  avatarUrl?: string;

  @ApiProperty({ description: 'Is user active' })
  isActive: boolean;

  @ApiProperty({ description: 'Is user verified' })
  isVerified: boolean;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Account created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Account last updated timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'User roles' })
  roles: string[];

  @ApiProperty({ description: 'User permissions' })
  permissions: string[];

  @ApiProperty({ description: 'Primary tenant information', required: false })
  tenant?: {
    tenantId: number;
    tenantCode: string;
    tenantName: string;
    roleId: number;
    roleName: string;
  };

  @ApiProperty({ description: 'All tenants user belongs to' })
  tenants: Array<{
    tenantId: number;
    tenantCode: string;
    tenantName: string;
    roleId: number;
    roleName: string;
    isPrimary: boolean;
  }>;
}
