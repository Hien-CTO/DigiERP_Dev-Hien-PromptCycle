# Security Recommendations: Attendance Management

## 🎯 Quick Reference

**Feature**: FEAT-008-005 - Attendance Management (Chấm Công)  
**Priority**: Fix Critical issues before production deployment  
**Estimated Effort**: 2-3 weeks for full implementation

---

## 🔴 Critical Recommendations (Must Fix)

### 1. Implement Secure Attendance Controller

**Priority**: Critical  
**Effort**: 2-3 days  
**Impact**: High

```typescript
// File: services/hr-service/src/presentation/controllers/attendance.controller.ts

import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @UseGuards(RolesGuard)
  @Roles('employee', 'manager', 'hr_manager')
  @ApiOperation({ summary: 'Employee check-in' })
  async checkIn(
    @CurrentUser() user: User,
    @Body() dto: CheckInDto
  ) {
    return await this.attendanceService.checkIn(user.employeeId, dto);
  }

  @Post('check-out')
  @UseGuards(RolesGuard)
  @Roles('employee', 'manager', 'hr_manager')
  @ApiOperation({ summary: 'Employee check-out' })
  async checkOut(
    @CurrentUser() user: User,
    @Body() dto: CheckOutDto
  ) {
    return await this.attendanceService.checkOut(user.employeeId, dto);
  }

  @Get('my-attendance')
  @ApiOperation({ summary: 'Get my attendance records' })
  async getMyAttendance(
    @CurrentUser() user: User,
    @Query() query: GetAttendanceQueryDto
  ) {
    // Only return current user's attendance
    return await this.attendanceService.findByEmployeeId(user.employeeId, query);
  }

  @Get('department')
  @UseGuards(RolesGuard)
  @Roles('manager', 'hr_manager')
  @ApiOperation({ summary: 'Get department attendance (Manager only)' })
  async getDepartmentAttendance(
    @CurrentUser() user: User,
    @Query() query: GetAttendanceQueryDto
  ) {
    // Verify user is manager of department
    return await this.attendanceService.findByDepartment(user.departmentId, query);
  }

  @Put(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('manager', 'hr_manager')
  @ApiOperation({ summary: 'Approve attendance record' })
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: ApproveAttendanceDto
  ) {
    // Authorization check
    const record = await this.attendanceService.findOne(id);
    if (!this.canApprove(user, record.employee_id)) {
      throw new ForbiddenException('Cannot approve this record');
    }
    return await this.attendanceService.approve(id, user.id, dto);
  }

  @Put(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('manager', 'hr_manager')
  @ApiOperation({ summary: 'Reject attendance record' })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: RejectAttendanceDto
  ) {
    // Authorization check
    const record = await this.attendanceService.findOne(id);
    if (!this.canApprove(user, record.employee_id)) {
      throw new ForbiddenException('Cannot reject this record');
    }
    return await this.attendanceService.reject(id, user.id, dto);
  }

  private canApprove(user: User, employeeId: number): boolean {
    // HR Manager can approve all
    if (user.roles.includes('hr_manager')) return true;
    
    // Manager can only approve their department
    // Need to check if employee belongs to manager's department
    return this.attendanceService.isEmployeeInManagerDepartment(employeeId, user.id);
  }
}
```

---

### 2. Add Authorization Checks

**Priority**: Critical  
**Effort**: 1-2 days  
**Impact**: High

```typescript
// File: services/hr-service/src/application/services/attendance.service.ts

async findOne(id: number, userId: number, userRoles: string[]): Promise<AttendanceRecord> {
  const record = await this.attendanceRepo.findOne({ where: { id } });
  
  if (!record) {
    throw new NotFoundException('Attendance record not found');
  }
  
  // Authorization check
  const user = await this.userService.findOne(userId);
  const employee = await this.employeeRepo.findOne({ 
    where: { user_id: userId } 
  });
  
  // HR Manager can access all
  if (userRoles.includes('hr_manager')) {
    return record;
  }
  
  // Manager can access department employees
  if (userRoles.includes('manager')) {
    const canAccess = await this.isEmployeeInManagerDepartment(
      record.employee_id, 
      employee.id
    );
    if (canAccess) {
      return record;
    }
  }
  
  // Employee can only access own records
  if (record.employee_id === employee.id) {
    return record;
  }
  
  throw new ForbiddenException('Access denied');
}
```

---

### 3. Implement Business Logic Validation

**Priority**: Critical  
**Effort**: 2-3 days  
**Impact**: High

```typescript
// File: services/hr-service/src/application/services/attendance.service.ts

async checkIn(employeeId: number, dto: CheckInDto): Promise<AttendanceRecord> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 1. Check if already checked in today
  const existing = await this.attendanceRepo.findOne({
    where: {
      employee_id: employeeId,
      attendance_date: today
    }
  });
  
  if (existing) {
    throw new BadRequestException('Already checked in today');
  }
  
  // 2. Validate check-in time (not too early)
  const currentHour = new Date().getHours();
  if (currentHour < 6) {
    throw new BadRequestException('Check-in too early (before 6 AM)');
  }
  
  // 3. Check if employee is active
  const employee = await this.employeeRepo.findOne({ 
    where: { id: employeeId } 
  });
  if (!employee || employee.status !== 'ACTIVE') {
    throw new BadRequestException('Employee is not active');
  }
  
  // 4. Calculate late status
  const checkInTime = new Date();
  const lateThreshold = new Date();
  lateThreshold.setHours(9, 0, 0, 0);
  
  const isLate = checkInTime > lateThreshold;
  const lateMinutes = isLate 
    ? Math.floor((checkInTime.getTime() - lateThreshold.getTime()) / 60000)
    : 0;
  
  // 5. Create record
  const record = this.attendanceRepo.create({
    employee_id: employeeId,
    attendance_date: today,
    check_in_time: checkInTime,
    location: dto.location,
    late: isLate,
    late_minutes: lateMinutes,
    late_reason: isLate ? dto.lateReason : null,
    status: 'CHECKED_IN',
    type: 'NORMAL',
    created_by: employeeId, // Should be user ID
  });
  
  // 6. Log security event
  this.logger.log(`Check-in: Employee ${employeeId} at ${checkInTime.toISOString()}`);
  
  return await this.attendanceRepo.save(record);
}

async checkOut(employeeId: number, dto: CheckOutDto): Promise<AttendanceRecord> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 1. Find today's check-in record
  const record = await this.attendanceRepo.findOne({
    where: {
      employee_id: employeeId,
      attendance_date: today,
      status: 'CHECKED_IN'
    }
  });
  
  if (!record) {
    throw new BadRequestException('No check-in record found for today');
  }
  
  // 2. Validate check-out time
  const checkOutTime = new Date();
  if (checkOutTime <= record.check_in_time) {
    throw new BadRequestException('Check-out time must be after check-in time');
  }
  
  // 3. Calculate working hours
  const diffMs = checkOutTime.getTime() - record.check_in_time.getTime();
  const totalHours = diffMs / (1000 * 60 * 60);
  const workingHours = Math.max(0, totalHours - record.break_time);
  
  // 4. Calculate overtime
  const standardHours = 8;
  const overtimeHours = Math.max(0, workingHours - standardHours);
  
  // 5. Check early leave
  const earlyLeaveThreshold = new Date();
  earlyLeaveThreshold.setHours(17, 0, 0, 0);
  const isEarlyLeave = checkOutTime < earlyLeaveThreshold;
  const earlyLeaveMinutes = isEarlyLeave
    ? Math.floor((earlyLeaveThreshold.getTime() - checkOutTime.getTime()) / 60000)
    : 0;
  
  // 6. Determine status
  const needsApproval = record.late || isEarlyLeave;
  const status = needsApproval ? 'PENDING_APPROVAL' : 'COMPLETED';
  
  // 7. Update record
  record.check_out_time = checkOutTime;
  record.working_hours = workingHours;
  record.overtime_hours = overtimeHours;
  record.early_leave = isEarlyLeave;
  record.early_leave_minutes = earlyLeaveMinutes;
  record.early_leave_reason = isEarlyLeave ? dto.earlyLeaveReason : null;
  record.status = status;
  record.updated_by = employeeId; // Should be user ID
  
  // 8. Log security event
  this.logger.log(`Check-out: Employee ${employeeId} at ${checkOutTime.toISOString()}`);
  
  return await this.attendanceRepo.save(record);
}
```

---

## 🟠 High Priority Recommendations

### 4. Create Validation DTOs

**Priority**: High  
**Effort**: 1 day  
**Impact**: High

```typescript
// File: services/hr-service/src/application/dtos/attendance.dto.ts

import { 
  IsString, IsOptional, MaxLength, Matches, 
  IsDateString, IsNotEmpty, MinLength, IsEnum 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckInDto {
  @ApiPropertyOptional({ 
    description: 'Location (GPS or address)',
    maxLength: 255,
    example: '123 Main St, Hanoi'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9\s,.-]+$/, { 
    message: 'Location contains invalid characters' 
  })
  location?: string;
  
  @ApiPropertyOptional({ 
    description: 'Reason for late check-in',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  lateReason?: string;
}

export class CheckOutDto {
  @ApiPropertyOptional({ 
    description: 'Reason for early leave',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  earlyLeaveReason?: string;
}

export class EditAttendanceDto {
  @ApiProperty({ description: 'Check-in time', example: '2025-11-19T08:30:00Z' })
  @IsDateString()
  checkInTime: string;
  
  @ApiProperty({ description: 'Check-out time', example: '2025-11-19T17:30:00Z' })
  @IsDateString()
  checkOutTime: string;
  
  @ApiProperty({ 
    description: 'Reason for editing',
    minLength: 10,
    maxLength: 1000
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
    maxLength: 1000
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
  page?: number;
  
  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
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
    enum: ['CHECKED_IN', 'COMPLETED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED']
  })
  @IsOptional()
  @IsEnum(['CHECKED_IN', 'COMPLETED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'])
  status?: string;
}
```

---

### 5. Add Security Logging

**Priority**: High  
**Effort**: 1 day  
**Impact**: High

```typescript
// File: services/hr-service/src/application/services/attendance.service.ts

import { Logger } from '@nestjs/common';

export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);
  
  async checkIn(employeeId: number, dto: CheckInDto): Promise<AttendanceRecord> {
    try {
      // ... validation logic ...
      
      const record = await this.attendanceRepo.save({...});
      
      // Log successful check-in
      this.logger.log(`✅ Check-in successful: Employee ${employeeId} at ${new Date().toISOString()}`);
      
      return record;
    } catch (error) {
      // Log failed check-in
      this.logger.warn(`❌ Check-in failed: Employee ${employeeId} - ${error.message}`);
      throw error;
    }
  }
  
  async approve(id: number, approverId: number, dto: ApproveAttendanceDto): Promise<AttendanceRecord> {
    const record = await this.findOne(id);
    
    // Log approval action
    this.logger.log(`✅ Attendance approved: Record ${id} by User ${approverId} at ${new Date().toISOString()}`);
    
    // ... approval logic ...
    
    return record;
  }
  
  async reject(id: number, rejectorId: number, dto: RejectAttendanceDto): Promise<AttendanceRecord> {
    const record = await this.findOne(id);
    
    // Log rejection action
    this.logger.warn(`❌ Attendance rejected: Record ${id} by User ${rejectorId} - Reason: ${dto.rejectionReason}`);
    
    // ... rejection logic ...
    
    return record;
  }
}
```

---

### 6. Implement Rate Limiting

**Priority**: High  
**Effort**: 0.5 days  
**Impact**: Medium

```typescript
// File: services/hr-service/src/main.ts

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // 1 minute
      limit: 10, // 10 requests per minute
    }),
    // ... other imports
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

// For specific endpoints
@Controller('attendance')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@Throttle(5, 60) // 5 requests per minute for attendance endpoints
export class AttendanceController {
  // ...
}
```

---

## 🟡 Medium Priority Recommendations

### 7. Enhance Error Handling

**Priority**: Medium  
**Effort**: 0.5 days  
**Impact**: Medium

```typescript
// File: services/hr-service/src/filters/http-exception.filter.ts

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;
    
    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';
    
    // Log detailed error (server-side only)
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );
    
    // Return generic message to client
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message || 'An error occurred',
    });
  }
}
```

---

### 8. Verify CORS Configuration

**Priority**: Medium  
**Effort**: 0.5 days  
**Impact**: Medium

```typescript
// File: services/hr-service/src/main.ts

// ✅ GOOD: Specific origins
app.enableCors({
  origin: [
    'http://localhost:3000', // Development
    'https://digierp.example.com', // Production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// ❌ BAD: Wildcard or too permissive
app.enableCors({
  origin: '*', // Never use this
  credentials: true, // This won't work with wildcard anyway
});
```

---

## 📋 Implementation Checklist

### Phase 1: Critical (Week 1)
- [ ] Implement attendance controller with guards
- [ ] Add authorization checks
- [ ] Implement business logic validation
- [ ] Create validation DTOs

### Phase 2: High Priority (Week 2)
- [ ] Add security logging
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Enhance error handling

### Phase 3: Medium Priority (Week 3)
- [ ] Verify CORS configuration
- [ ] Consider location encryption
- [ ] Verify audit trail
- [ ] Add monitoring/alerts

---

## 🎯 Success Criteria

- ✅ All endpoints protected with authentication
- ✅ Authorization checks prevent unauthorized access
- ✅ Business logic validation prevents fraud
- ✅ Input validation prevents injection
- ✅ Security logging enables monitoring
- ✅ Rate limiting prevents abuse
- ✅ Error handling doesn't leak information

---

**Last Updated**: November 2025  
**Next Review**: After implementation

