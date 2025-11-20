# Security Audit Report: Attendance Management (Chấm Công)

## 📋 Executive Summary

**Feature**: FEAT-008-005 - Attendance Management (Chấm Công)  
**Audit Date**: November 2025  
**Auditor**: Security Tester Agent  
**Severity Levels**: Critical, High, Medium, Low  
**OWASP Top 10 2021**: Reviewed

---

## 🎯 Audit Scope

### Components Reviewed
- ✅ Database Schema (`attendance_records`, `cat_attendance_types`)
- ✅ Entity Models (`AttendanceRecord`, `CatAttendanceTypes`)
- ✅ API Endpoints (Expected endpoints for attendance)
- ✅ Frontend Permissions (`hr.attendance.read`)
- ✅ Security Middleware (Helmet, CORS, Rate Limiting)
- ✅ Input Validation Patterns
- ✅ Authentication & Authorization

### Components Not Yet Implemented
- ⚠️ Attendance Controller (Not found - needs implementation)
- ⚠️ Attendance Service Layer
- ⚠️ Attendance DTOs with validation
- ⚠️ Frontend Attendance Pages

---

## 🔒 OWASP Top 10 2021 Security Review

### A01:2021 – Broken Access Control

#### Findings

**🔴 CRITICAL: Missing Authorization Checks**
- **Location**: Expected attendance endpoints (not yet implemented)
- **Issue**: No controller found, but when implemented, must ensure:
  - Employees can only view/edit their own attendance records
  - Managers can only approve attendance of their department
  - HR Managers have full access
- **Risk**: Unauthorized access to attendance data, privilege escalation
- **Impact**: High - Sensitive employee data exposure

**🟡 MEDIUM: Insecure Direct Object References (IDOR)**
- **Location**: Entity design (`attendance-record.entity.ts`)
- **Issue**: No explicit checks to prevent users from accessing other employees' records via ID manipulation
- **Example**: `GET /api/attendance/:id` - User could access other employees' records
- **Risk**: Data breach, privacy violation
- **Impact**: Medium - Employee privacy compromised

**Recommendations**:
```typescript
// ✅ GOOD: Check ownership before access
@Get(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
async getAttendanceRecord(@Param('id') id: number, @CurrentUser() user: User) {
  const record = await this.attendanceService.findOne(id);
  
  // Check if user owns the record or has manager/HR role
  if (record.employee_id !== user.employeeId && 
      !this.hasManagerRole(user) && 
      !this.hasHRRole(user)) {
    throw new ForbiddenException('Access denied');
  }
  
  return record;
}
```

---

### A02:2021 – Cryptographic Failures

#### Findings

**🟡 MEDIUM: Sensitive Data in Transit**
- **Location**: API endpoints (when implemented)
- **Issue**: Ensure HTTPS is enforced in production
- **Current Status**: ✅ Helmet configured, but need to verify HTTPS enforcement
- **Risk**: Man-in-the-middle attacks, data interception
- **Impact**: Medium - Location data, attendance times could be intercepted

**🟢 LOW: Sensitive Data at Rest**
- **Location**: Database schema
- **Issue**: Location data (GPS coordinates) stored as plain text
- **Current Status**: ✅ Location is optional, but should be encrypted if sensitive
- **Risk**: Database breach could expose employee location history
- **Impact**: Low - Location data may not be highly sensitive

**Recommendations**:
```typescript
// ✅ GOOD: Encrypt sensitive location data
@Column({ 
  type: 'varchar', 
  length: 255, 
  nullable: true,
  transformer: {
    to: (value: string) => encryptLocation(value),
    from: (value: string) => decryptLocation(value)
  }
})
location: string;
```

---

### A03:2021 – Injection

#### Findings

**🟢 LOW: SQL Injection Protection**
- **Location**: Entity and Repository patterns
- **Issue**: Using TypeORM with parameterized queries (✅ Good)
- **Current Status**: ✅ TypeORM provides protection against SQL injection
- **Risk**: Low - TypeORM handles parameterization
- **Impact**: Low - Well protected

**🟡 MEDIUM: NoSQL Injection (N/A)**
- **Location**: Not applicable (using SQL database)
- **Status**: ✅ N/A

**🟡 MEDIUM: Command Injection**
- **Location**: Location field processing
- **Issue**: If location data is processed or executed, could be vulnerable
- **Current Status**: ⚠️ Need to verify location data handling
- **Risk**: Medium - If location is used in system commands
- **Impact**: Medium - System compromise

**Recommendations**:
```typescript
// ✅ GOOD: Sanitize location input
@IsString()
@IsOptional()
@MaxLength(255)
@Matches(/^[a-zA-Z0-9\s,.-]+$/, { message: 'Invalid location format' })
location?: string;
```

---

### A04:2021 – Insecure Design

#### Findings

**🔴 CRITICAL: Missing Business Logic Validation**
- **Location**: Expected attendance service
- **Issue**: Need to validate:
  - Check-out time must be after check-in time
  - Cannot check-in twice on same day
  - Cannot check-out without check-in
  - Edit restrictions (24-hour rule)
- **Risk**: High - Business logic bypass, data integrity issues
- **Impact**: High - Payroll calculation errors, attendance fraud

**🟡 MEDIUM: Missing Rate Limiting on Check-In/Check-Out**
- **Location**: Expected attendance endpoints
- **Issue**: No specific rate limiting for attendance actions
- **Current Status**: ✅ General rate limiting exists, but may need specific limits
- **Risk**: Medium - Abuse, automated check-in/check-out
- **Impact**: Medium - Attendance manipulation

**Recommendations**:
```typescript
// ✅ GOOD: Add business logic validation
async checkIn(employeeId: number, location?: string) {
  // Check if already checked in today
  const today = new Date();
  const existing = await this.attendanceRepo.findOne({
    where: {
      employee_id: employeeId,
      attendance_date: today
    }
  });
  
  if (existing) {
    throw new BadRequestException('Already checked in today');
  }
  
  // Validate check-in time (not too early)
  const currentHour = today.getHours();
  if (currentHour < 6) {
    throw new BadRequestException('Check-in too early');
  }
  
  // Create record
  return await this.attendanceRepo.save({...});
}
```

---

### A05:2021 – Security Misconfiguration

#### Findings

**🟢 LOW: Security Headers**
- **Location**: `services/hr-service/src/main.ts`
- **Issue**: ✅ Helmet configured with CSP
- **Current Status**: ✅ Good security headers
- **Risk**: Low
- **Impact**: Low

**🟡 MEDIUM: CORS Configuration**
- **Location**: `services/hr-service/src/main.ts`
- **Issue**: CORS allows credentials, need to verify origin restrictions
- **Current Status**: ⚠️ Using environment variable, need to verify production config
- **Risk**: Medium - If CORS_ORIGIN is too permissive
- **Impact**: Medium - CSRF attacks

**🟡 MEDIUM: Error Messages**
- **Location**: Expected error handling
- **Issue**: Error messages should not leak sensitive information
- **Current Status**: ⚠️ Need to verify error handling
- **Risk**: Medium - Information disclosure
- **Impact**: Medium - System information leakage

**Recommendations**:
```typescript
// ✅ GOOD: Generic error messages
catch (error) {
  // Log detailed error for debugging
  this.logger.error('Check-in failed', error);
  
  // Return generic message to client
  throw new InternalServerErrorException('Check-in failed. Please try again.');
}
```

---

### A06:2021 – Vulnerable and Outdated Components

#### Findings

**🟢 LOW: Dependency Security**
- **Location**: `services/hr-service/package.json`
- **Issue**: ✅ Using recent versions of NestJS, TypeORM, Helmet
- **Current Status**: ✅ Dependencies appear up-to-date
- **Risk**: Low
- **Impact**: Low

**Recommendations**:
- Run `npm audit` regularly
- Use `npm audit fix` for known vulnerabilities
- Consider using Snyk or Dependabot for automated scanning

---

### A07:2021 – Identification and Authentication Failures

#### Findings

**🔴 CRITICAL: Missing Authentication Guards**
- **Location**: Expected attendance controller
- **Issue**: No controller found, but when implemented must use:
  - `@UseGuards(JwtAuthGuard)` for all endpoints
  - `@UseGuards(RolesGuard)` for role-based access
- **Risk**: High - Unauthenticated access
- **Impact**: High - Unauthorized attendance manipulation

**🟡 MEDIUM: Session Management**
- **Location**: JWT token handling
- **Issue**: Need to verify:
  - Token expiration
  - Token refresh mechanism
  - Token revocation on logout
- **Current Status**: ⚠️ Need to verify implementation
- **Risk**: Medium - Session hijacking
- **Impact**: Medium - Unauthorized access

**Recommendations**:
```typescript
// ✅ GOOD: Protect all endpoints
@Controller('attendance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttendanceController {
  
  @Post('check-in')
  @UseGuards(RolesGuard)
  @Roles('employee', 'manager', 'hr_manager')
  async checkIn(@CurrentUser() user: User, @Body() dto: CheckInDto) {
    // Implementation
  }
  
  @Post('check-out')
  @UseGuards(RolesGuard)
  @Roles('employee', 'manager', 'hr_manager')
  async checkOut(@CurrentUser() user: User, @Body() dto: CheckOutDto) {
    // Implementation
  }
  
  @Get('my-attendance')
  async getMyAttendance(@CurrentUser() user: User) {
    // Only return current user's attendance
    return this.attendanceService.findByEmployeeId(user.employeeId);
  }
  
  @Put(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('manager', 'hr_manager')
  async approve(@Param('id') id: number, @CurrentUser() user: User) {
    // Check if user is manager of the employee
    const record = await this.attendanceService.findOne(id);
    if (!this.canApprove(user, record.employee_id)) {
      throw new ForbiddenException('Cannot approve this record');
    }
    // Approve logic
  }
}
```

---

### A08:2021 – Software and Data Integrity Failures

#### Findings

**🟡 MEDIUM: Missing Input Validation**
- **Location**: Expected DTOs
- **Issue**: Need comprehensive validation for:
  - Check-in/check-out times
  - Location data
  - Edit reasons
  - Rejection reasons
- **Risk**: Medium - Invalid data, data integrity issues
- **Impact**: Medium - Data corruption

**🟡 MEDIUM: Missing Audit Trail**
- **Location**: Entity has audit fields but need to verify usage
- **Issue**: ✅ Entity has `created_by`, `updated_by`, `created_at`, `updated_at`
- **Current Status**: ✅ Good audit fields, need to verify they're populated
- **Risk**: Medium - Cannot track who made changes
- **Impact**: Medium - Compliance issues

**Recommendations**:
```typescript
// ✅ GOOD: Comprehensive DTO validation
export class CheckInDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9\s,.-]+$/)
  location?: string;
  
  @IsOptional()
  @IsString()
  @MaxLength(500)
  lateReason?: string;
}

export class EditAttendanceDto {
  @IsDateString()
  checkInTime: string;
  
  @IsDateString()
  @Validate(IsAfterDate, ['checkInTime'])
  checkOutTime: string;
  
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  editReason: string;
}
```

---

### A09:2021 – Security Logging and Monitoring Failures

#### Findings

**🟡 MEDIUM: Missing Security Logging**
- **Location**: Expected attendance service
- **Issue**: Need to log:
  - Failed authentication attempts
  - Unauthorized access attempts
  - Suspicious activities (multiple check-ins, unusual times)
  - Approval/rejection actions
- **Risk**: Medium - Cannot detect attacks
- **Impact**: Medium - Security incidents go unnoticed

**Recommendations**:
```typescript
// ✅ GOOD: Security logging
async checkIn(employeeId: number, location?: string) {
  try {
    // Check-in logic
    this.logger.log(`Check-in successful: Employee ${employeeId}`);
    return result;
  } catch (error) {
    this.logger.warn(`Check-in failed: Employee ${employeeId} - ${error.message}`);
    throw error;
  }
}

async approve(id: number, approverId: number) {
  this.logger.log(`Attendance approved: Record ${id} by User ${approverId}`);
  // Approval logic
}
```

---

### A10:2021 – Server-Side Request Forgery (SSRF)

#### Findings

**🟢 LOW: SSRF Risk**
- **Location**: Location/GPS data handling
- **Issue**: If location data is used to make external requests, could be vulnerable
- **Current Status**: ⚠️ Need to verify location data usage
- **Risk**: Low - Location is likely just stored, not used for requests
- **Impact**: Low

**Recommendations**:
- If location data is used for external API calls, validate and sanitize URLs
- Use allowlist for allowed domains/IPs
- Never make requests to user-provided URLs

---

## 🔐 Authentication & Authorization Review

### Current Status

**❌ MISSING**: Attendance Controller Implementation
- No controller found for attendance endpoints
- Need to implement with proper guards

### Required Permissions

Based on `apps/admin-panel/src/lib/permissions.ts`:
- `hr.attendance.read` - View attendance records
- `hr.attendance.create` - Check-in/check-out (should be added)
- `hr.attendance.update` - Edit attendance (should be added)
- `hr.attendance.approve` - Approve/reject (should be added)

### Authorization Rules

1. **Employee**:
   - ✅ Can view own attendance records
   - ✅ Can check-in/check-out
   - ✅ Can edit own records (within 24 hours)
   - ❌ Cannot view other employees' records
   - ❌ Cannot approve/reject

2. **Manager**:
   - ✅ Can view department employees' attendance
   - ✅ Can approve/reject department attendance
   - ❌ Cannot view other departments' attendance
   - ❌ Cannot edit attendance directly

3. **HR Manager**:
   - ✅ Can view all attendance records
   - ✅ Can approve/reject all attendance
   - ✅ Can edit any attendance (with reason)
   - ✅ Can export attendance data

---

## 🛡️ Input Validation Review

### Current Status

**⚠️ NEEDS IMPLEMENTATION**: DTOs with validation decorators

### Required Validations

1. **Check-In/Check-Out**:
   - Location: Max 255 chars, alphanumeric + special chars
   - Time: Valid datetime, not in future
   - Late reason: Max 500 chars (if late)

2. **Edit Attendance**:
   - Check-in time: Valid datetime
   - Check-out time: After check-in time
   - Edit reason: Required, 10-1000 chars

3. **Approve/Reject**:
   - Rejection reason: Required if rejecting, 10-1000 chars

4. **Location Data**:
   - Sanitize GPS coordinates
   - Validate format
   - Prevent injection

---

## 🔒 Security Headers Review

### Current Configuration

**✅ GOOD**: Helmet configured in `services/hr-service/src/main.ts`

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // ... other directives
    },
  },
}));
```

### Recommendations

1. ✅ Helmet is configured
2. ⚠️ Verify CSP in production
3. ⚠️ Add HSTS header for HTTPS enforcement
4. ⚠️ Verify X-Frame-Options, X-Content-Type-Options

---

## 📊 Security Checklist

### ✅ Implemented
- [x] Helmet security headers
- [x] CORS configuration
- [x] Rate limiting (general)
- [x] Database parameterized queries (TypeORM)
- [x] Audit fields in entity
- [x] Permission-based access control (frontend)

### ⚠️ Needs Implementation
- [ ] Attendance controller with guards
- [ ] Authorization checks (ownership, role-based)
- [ ] Input validation DTOs
- [ ] Business logic validation
- [ ] Security logging
- [ ] Rate limiting for attendance endpoints
- [ ] Location data encryption (if sensitive)
- [ ] Error message sanitization

### 🔴 Critical Issues
1. **Missing Controller**: No attendance controller found
2. **Missing Authorization**: No authorization checks implemented
3. **Missing Validation**: No DTOs with validation found

---

## 🎯 Recommendations Summary

### Priority 1: Critical (Fix Immediately)

1. **Implement Attendance Controller**:
   - Create `attendance.controller.ts`
   - Add `@UseGuards(JwtAuthGuard, RolesGuard)` to all endpoints
   - Implement authorization checks

2. **Add Authorization Checks**:
   - Verify employee ownership before access
   - Check manager department before approval
   - Enforce role-based permissions

3. **Implement Business Logic Validation**:
   - Prevent duplicate check-in
   - Validate check-out after check-in
   - Enforce 24-hour edit rule

### Priority 2: High (Fix Soon)

4. **Create Validation DTOs**:
   - `CheckInDto` with validation
   - `CheckOutDto` with validation
   - `EditAttendanceDto` with validation
   - `ApproveAttendanceDto` with validation

5. **Add Security Logging**:
   - Log authentication failures
   - Log unauthorized access attempts
   - Log approval/rejection actions

6. **Implement Rate Limiting**:
   - Specific rate limits for check-in/check-out
   - Stricter limits for approval actions

### Priority 3: Medium (Fix When Possible)

7. **Encrypt Sensitive Data**:
   - Consider encrypting location data if sensitive
   - Use field-level encryption for GPS coordinates

8. **Enhance Error Handling**:
   - Generic error messages
   - Detailed logging for debugging
   - No sensitive information in responses

9. **Add Monitoring**:
   - Alert on suspicious activities
   - Monitor failed authentication
   - Track approval patterns

---

## 📝 Code Examples

### Secure Attendance Controller

```typescript
import { Controller, Get, Post, Put, Body, Param, UseGuards, CurrentUser } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttendanceController {
  
  @Post('check-in')
  @UseGuards(RolesGuard)
  @Roles('employee', 'manager', 'hr_manager')
  async checkIn(
    @CurrentUser() user: User,
    @Body() dto: CheckInDto
  ) {
    // Business logic validation
    await this.attendanceService.validateCheckIn(user.employeeId);
    
    // Create record
    return await this.attendanceService.checkIn(user.employeeId, dto);
  }
  
  @Get('my-attendance')
  async getMyAttendance(
    @CurrentUser() user: User,
    @Query() query: GetAttendanceQueryDto
  ) {
    // Only return current user's attendance
    return await this.attendanceService.findByEmployeeId(
      user.employeeId,
      query
    );
  }
  
  @Put(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('manager', 'hr_manager')
  async approve(
    @Param('id') id: number,
    @CurrentUser() user: User,
    @Body() dto: ApproveAttendanceDto
  ) {
    // Authorization check
    const record = await this.attendanceService.findOne(id);
    if (!this.canApprove(user, record.employee_id)) {
      throw new ForbiddenException('Cannot approve this record');
    }
    
    // Approve
    return await this.attendanceService.approve(id, user.id, dto);
  }
}
```

### Secure DTO with Validation

```typescript
import { IsString, IsOptional, MaxLength, Matches, IsDateString, Validate } from 'class-validator';

export class CheckInDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9\s,.-]+$/, { 
    message: 'Location contains invalid characters' 
  })
  location?: string;
  
  @IsOptional()
  @IsString()
  @MaxLength(500)
  lateReason?: string;
}

export class EditAttendanceDto {
  @IsDateString()
  checkInTime: string;
  
  @IsDateString()
  @Validate(IsAfterDate, ['checkInTime'])
  checkOutTime: string;
  
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  editReason: string;
}
```

---

## 📈 Security Score

| Category | Score | Status |
|----------|-------|--------|
| Authentication | ⚠️ 3/10 | Missing implementation |
| Authorization | ⚠️ 2/10 | No checks found |
| Input Validation | ⚠️ 3/10 | DTOs not found |
| Security Headers | ✅ 8/10 | Helmet configured |
| Encryption | ⚠️ 5/10 | Basic, needs enhancement |
| Logging | ⚠️ 2/10 | Minimal logging |
| Rate Limiting | ⚠️ 5/10 | General only |
| Error Handling | ⚠️ 4/10 | Needs improvement |
| **Overall** | **⚠️ 4.0/10** | **Needs Significant Work** |

---

## 🚨 Conclusion

The Attendance Management feature has a **solid foundation** with good database design and security middleware, but **critical security components are missing**:

1. ❌ **No controller implementation** - Cannot test actual endpoints
2. ❌ **No authorization checks** - High risk of unauthorized access
3. ❌ **No input validation** - Risk of injection and data corruption
4. ⚠️ **Missing business logic validation** - Risk of fraud and errors

### Immediate Actions Required:
1. Implement attendance controller with proper guards
2. Add comprehensive authorization checks
3. Create validation DTOs
4. Implement business logic validation
5. Add security logging

### Security Maturity: **Level 2/5** (Basic)
- Foundation exists but critical components missing
- Need significant work before production deployment

---

**Report Generated**: November 2025  
**Next Review**: After implementation of recommendations  
**Contact**: Security Team

