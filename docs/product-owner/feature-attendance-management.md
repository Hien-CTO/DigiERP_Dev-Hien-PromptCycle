# Feature: Attendance Management (Chấm Công)

## 📋 Thông Tin Feature

**Epic ID**: EPIC-008 - HR Management  
**Feature ID**: FEAT-008-005  
**Feature Name**: Attendance Management (Chấm Công)  
**Priority**: High  
**Business Value**: High  
**Status**: In Progress  
**Owner**: Product Owner  
**Created**: November 2025  
**Last Updated**: November 2025

**Related Services**: hr-service, user-service, financial-service (for payroll - planned)  
**Related Database Tables**: attendance_records, cat_attendance_types, attendance_configurations (planned)  
**Traceability**: [Requirements Document](../business-analyst/requirements-attendance-management.md)  
**Related Epic**: [Epic: HR Management](./epic-hr-management.md)

---

## 🎯 Mô Tả Feature

Tính năng Chấm Công (Attendance Management) cho phép nhân viên check-in/check-out hàng ngày, tự động tính toán giờ làm việc và overtime, hỗ trợ workflow phê duyệt, và tích hợp với payroll system. Hệ thống hỗ trợ tracking địa điểm (GPS), cảnh báo đi muộn/về sớm, và quản lý các trường hợp đặc biệt (holiday work, remote work, business trip).

---

## 💼 Mục Tiêu Kinh Doanh

1. **Tự động hóa quy trình chấm công**: Giảm thời gian xử lý thủ công, tăng hiệu quả quản lý nhân sự
2. **Tăng độ chính xác**: Tự động tính toán giờ làm việc và overtime, giảm sai sót
3. **Tuân thủ quy định**: Đảm bảo tuân thủ các quy định lao động về giờ làm việc
4. **Cung cấp dữ liệu chính xác**: Tích hợp với payroll system để tính lương chính xác
5. **Cải thiện trải nghiệm nhân viên**: Self-service, mobile support, real-time tracking

**Business Value**:
- Giảm 70% thời gian xử lý chấm công thủ công
- Tăng 95% độ chính xác trong tính toán giờ làm việc
- Giảm 80% lỗi trong payroll calculation
- Tăng 60% sự hài lòng của nhân viên với quy trình chấm công

---

## 🚀 User Stories

### US-008-005-001: Daily Check-In/Check-Out
**As an** Employee, **I want to** check in and check out daily **so that** my working hours are automatically recorded and I don't need to manually track my attendance.

**Priority**: Critical  
**Story Points**: 5

**Acceptance Criteria**:
- ✅ Employee can check in via web app or mobile app
- ✅ System records check-in time with timestamp automatically
- ✅ System records check-in location (GPS coordinates or address)
- ✅ System validates check-in time is not earlier than 6:00 AM (configurable, shows warning if earlier)
- ✅ System validates employee status is Active before allowing check-in/check-out
- ✅ System validates employee has RECORD_ATTENDANCE permission
- ✅ Employee can check out at the end of working day
- ✅ System records check-out time with timestamp automatically
- ✅ System records check-out location (GPS coordinates or address)
- ✅ System prevents duplicate check-in for the same day (shows existing check-in information)
- ✅ System allows only one check-in and one check-out per day per employee
- ✅ System validates check-out time is after check-in time
- ✅ System validates check-out time is not later than 11:59 PM
- ✅ System displays current attendance status (checked in/checked out) clearly
- ✅ System validates location is within allowed radius (if location validation is enabled)
- ✅ System automatically marks late check-in if check-in time > late threshold (default: 9:00 AM)
- ✅ System calculates late minutes when late check-in is detected
- ✅ System allows employee to enter late reason (optional but recommended)
- ✅ System automatically sets status to PENDING_APPROVAL if late check-in or early check-out

---

### US-008-005-002: View Attendance History
**As an** Employee, **I want to** view my attendance history **so that** I can track my attendance records and verify my working hours.

**Priority**: High  
**Story Points**: 3

**Acceptance Criteria**:
- ✅ Employee can view list of attendance records (only their own records)
- ✅ System displays attendance records with: date, check-in time, check-out time, working hours, overtime hours
- ✅ System supports filtering by date range, status, approval status
- ✅ System supports sorting by date, working hours, overtime hours
- ✅ System shows attendance status (Normal, Late, Early Leave, Overtime) with visual indicators
- ✅ System displays approval status (Pending, Approved, Rejected) with color coding
- ✅ System allows employee to view attendance summary (total working hours, total overtime hours, late count, early leave count) for selected period
- ✅ System displays location information (check-in/check-out locations) with map view option
- ✅ System shows late minutes and early leave minutes for each record
- ✅ System displays notes/reasons (late reason, early leave reason, edit reason, rejection reason)
- ✅ System shows approval history (who approved/rejected, when, reason if rejected)
- ✅ System supports pagination for large datasets
- ✅ System allows export to Excel/CSV for personal records

---

### US-008-005-003: Edit Attendance Record
**As an** Employee, **I want to** edit my attendance record within 24 hours **so that** I can correct mistakes in check-in/check-out times.

**Priority**: High  
**Story Points**: 5

**Acceptance Criteria**:
- ✅ Employee can edit attendance record within 24 hours of check-in
- ✅ System requires employee to enter edit reason (mandatory) when editing
- ✅ System requires approval for edited attendance records
- ✅ System logs all changes to attendance records with audit trail (old values, new values, edit reason, timestamp, editor)
- ✅ System prevents editing attendance records older than 24 hours without manager approval
- ✅ System prevents editing attendance records that have already been approved
- ✅ System shows edit history for each attendance record
- ✅ System automatically sets status to PENDING_APPROVAL after edit
- ✅ System sends notification to manager when attendance is edited
- ✅ System validates edited times (check-out > check-in, reasonable working hours)
- ✅ System recalculates working hours and overtime after edit

---

### US-008-005-004: Approve/Reject Attendance Records
**As a** Manager, **I want to** approve or reject attendance records **so that** I can ensure attendance accuracy before payroll calculation.

**Priority**: Critical  
**Story Points**: 5

**Acceptance Criteria**:
- ✅ Manager can view attendance records of employees in their department
- ✅ Manager can view pending approval records with clear indication
- ✅ Manager can approve attendance records (single or bulk)
- ✅ Manager can reject attendance records with reason (mandatory for rejection)
- ✅ System sends notification to employee when attendance is approved/rejected
- ✅ System only allows approved attendance records to be used for payroll
- ✅ System supports bulk approval for multiple attendance records
- ✅ System shows pending approval count for manager dashboard
- ✅ System displays attendance details (times, hours, late/early status) for review
- ✅ System shows edit history if record was edited
- ✅ System allows manager to add notes when approving/rejecting
- ✅ System tracks approval history (who, when, reason)
- ✅ System prevents manager from approving their own attendance records
- ✅ System supports filtering by employee, date range, status

---

### US-008-005-005: Monitor Attendance Patterns
**As an** HR Manager, **I want to** monitor attendance patterns and late/early statistics **so that** I can identify attendance issues and take corrective actions.

**Priority**: High  
**Story Points**: 8

**Acceptance Criteria**:
- ✅ System tracks late check-ins (after 9:00 AM by default, configurable)
- ✅ System tracks early check-outs (before 5:00 PM by default, configurable)
- ✅ System calculates late minutes and early leave minutes
- ✅ System provides attendance dashboard with statistics
- ✅ System shows attendance trends (monthly, weekly) with charts
- ✅ System generates attendance reports by department, employee, date range
- ✅ System alerts HR Manager for unusual attendance patterns (e.g., frequent late, excessive overtime)
- ✅ System shows attendance summary: total employees, checked in, pending, absent
- ✅ System displays top late employees, top overtime employees
- ✅ System supports export of reports to Excel, PDF, CSV
- ✅ System shows comparison between departments
- ✅ System provides attendance heatmap (calendar view)

---

### US-008-005-006: Automatic Calculation of Working Hours and Overtime
**As a** System, **I want to** automatically calculate working hours and overtime **so that** payroll calculation is accurate and automated.

**Priority**: Critical  
**Story Points**: 8

**Acceptance Criteria**:
- ✅ System calculates working hours = check-out time - check-in time - break time
- ✅ System calculates overtime hours = working hours - standard working hours (if working hours > standard working hours)
- ✅ System validates working hours are between 0 and 16 hours (safety limit)
- ✅ System shows warning and requires confirmation if working hours exceed 16 hours
- ✅ System rejects attendance record if working hours < 0
- ✅ System supports configurable working hours per day (default: 8 hours)
- ✅ System supports configurable break time (default: 1 hour for lunch)
- ✅ System handles weekend and holiday attendance differently (different overtime rates)
- ✅ System calculates overtime rates based on company policy (can vary by department/position)
- ✅ System stores calculated hours in attendance record
- ✅ System supports department-specific and position-specific overtime calculation rules
- ✅ System handles partial day attendance (check-in only or check-out only)
- ✅ System recalculates when attendance record is edited

---

### US-008-005-007: Export Attendance Data for Payroll
**As a** Payroll Specialist, **I want to** export attendance data for payroll calculation **so that** I can process payroll accurately and efficiently.

**Priority**: High  
**Story Points**: 5

**Acceptance Criteria**:
- ✅ System allows exporting attendance data by date range (required field)
- ✅ System exports only approved attendance records by default (can include pending if needed)
- ✅ System exports data in formats: Excel, CSV, JSON
- ✅ System includes all required fields: employee ID, employee name, date, check-in time, check-out time, working hours, overtime hours, late minutes, early leave minutes, approval status
- ✅ System provides API endpoint for payroll service integration
- ✅ System supports filtering by department, employee, approval status
- ✅ System logs export action in audit trail with user, timestamp, and export parameters
- ✅ System shows warning if date range exceeds 3 months
- ✅ System allows scheduling automatic exports
- ✅ System validates data before export (completeness, accuracy)
- ✅ System supports bulk export for multiple periods

---

### US-008-005-008: Configure Attendance Rules and Policies
**As an** HR Manager, **I want to** configure attendance rules and policies **so that** the system enforces company attendance policies automatically.

**Priority**: Medium  
**Story Points**: 8

**Acceptance Criteria**:
- ✅ System allows configuring standard working hours (default: 8 hours/day)
- ✅ System allows configuring break time (default: 1 hour)
- ✅ System allows configuring late threshold (default: 9:00 AM)
- ✅ System allows configuring early leave threshold (default: 5:00 PM)
- ✅ System allows configuring overtime calculation rules
- ✅ System allows configuring weekend and holiday attendance rules
- ✅ System supports different rules for different departments or positions
- ✅ System supports global rules (apply to all) and specific rules (override global)
- ✅ System validates rule configuration (e.g., working hours > 0, break time < working hours)
- ✅ System shows rule hierarchy (global → department → position)
- ✅ System maintains rule history (audit trail)
- ✅ System allows testing rules before applying

---

### US-008-005-009: Check-In/Check-Out Reminders
**As an** Employee, **I want to** receive notifications about check-in/check-out reminders **so that** I don't forget to check in or check out.

**Priority**: Medium  
**Story Points**: 3

**Acceptance Criteria**:
- ✅ System sends reminder notification before check-in time (e.g., 8:45 AM, configurable)
- ✅ System sends reminder notification before check-out time (e.g., 4:45 PM, configurable)
- ✅ System sends notification if employee hasn't checked in by late threshold
- ✅ System sends notification if employee hasn't checked out by end of day
- ✅ System supports email and in-app notifications
- ✅ System allows employees to configure notification preferences
- ✅ System sends notification when attendance is approved/rejected
- ✅ System sends notification when attendance requires attention (e.g., pending approval)
- ✅ System supports SMS notifications (optional, configurable)
- ✅ System allows disabling notifications for specific days (e.g., holidays)

---

### US-008-005-010: Mobile App with Location Validation
**As an** Employee, **I want to** check in/out using mobile app with location validation **so that** I can record attendance even when working remotely or at different locations.

**Priority**: High  
**Story Points**: 8

**Acceptance Criteria**:
- ✅ Mobile app supports check-in/check-out functionality
- ✅ Mobile app captures GPS location automatically
- ✅ System validates location is within allowed radius (configurable)
- ✅ System allows manual location entry if GPS unavailable
- ✅ System supports offline mode for check-in/check-out (syncs when online)
- ✅ System displays location on map for verification
- ✅ System allows employee to add location notes
- ✅ System shows location accuracy indicator
- ✅ System supports multiple allowed locations (office, warehouse, remote)
- ✅ System allows HR Manager to configure allowed locations
- ✅ System shows warning if location is outside allowed radius
- ✅ System requires confirmation for check-in/out outside allowed location

---

### US-008-005-011: Real-Time Attendance Status Dashboard
**As a** Manager, **I want to** view real-time attendance status of my team **so that** I can monitor who is currently at work and manage team availability.

**Priority**: High  
**Story Points**: 5

**Acceptance Criteria**:
- ✅ Manager can view real-time list of employees who are checked in
- ✅ Manager can see employees who haven't checked in yet
- ✅ System displays current working hours for each checked-in employee
- ✅ System shows late employees with late minutes
- ✅ System supports filtering by department, position, or team
- ✅ System updates in real-time without page refresh
- ✅ System shows attendance summary for the day (total checked in, pending, absent)
- ✅ System displays check-in/check-out times for each employee
- ✅ System shows location information for each employee (if available)
- ✅ System supports search by employee name
- ✅ System provides visual indicators (green for on-time, yellow for late, red for absent)
- ✅ System shows expected check-out time based on check-in time

---

### US-008-005-012: Handle Special Attendance Cases
**As an** HR Manager, **I want to** handle special attendance cases (holiday work, remote work, business trip) **so that** attendance records accurately reflect all working scenarios.

**Priority**: Medium  
**Story Points**: 5

**Acceptance Criteria**:
- ✅ System supports marking attendance as holiday work
- ✅ System supports marking attendance as remote work
- ✅ System supports marking attendance as business trip
- ✅ System allows HR Manager to manually create attendance records for special cases
- ✅ System requires approval for special attendance types
- ✅ System calculates overtime correctly for holiday and weekend work
- ✅ System maintains audit trail for all special attendance records
- ✅ System allows employee to request special attendance type
- ✅ System supports different overtime rates for special cases
- ✅ System shows special attendance type in attendance history
- ✅ System allows attaching supporting documents (e.g., business trip approval)

---

## 📊 Acceptance Criteria (Tổng Hợp)

### Core Functionality
- ✅ System allows daily attendance recording with check-in/check-out
- ✅ System records attendance location (GPS coordinates or address)
- ✅ System validates location within allowed radius (configurable)
- ✅ System calculates working hours automatically
- ✅ System calculates overtime hours automatically
- ✅ System tracks late check-ins and early check-outs
- ✅ System supports attendance approval workflow (Manager/HR Manager)
- ✅ System maintains complete attendance history with audit trail

### User Experience
- ✅ System allows employees to view their attendance records
- ✅ System allows employees to edit attendance within 24 hours (requires approval)
- ✅ System provides attendance reports and analytics
- ✅ System supports mobile app with offline mode
- ✅ System provides real-time attendance status dashboard for managers
- ✅ System sends notifications for check-in/check-out reminders

### Integration & Data
- ✅ System exports attendance data for payroll integration
- ✅ System supports configurable attendance rules and policies
- ✅ System supports special attendance cases (holiday work, remote work, business trip)
- ✅ System integrates with User Service for employee authentication
- ✅ System integrates with Financial Service for payroll (planned)
- ✅ System integrates with Notification Service for alerts and reminders

### Security & Compliance
- ✅ System enforces role-based access control (Employee, Manager, HR Manager)
- ✅ System maintains audit trail for all attendance operations
- ✅ System protects sensitive attendance data
- ✅ System ensures data privacy (location data only visible to authorized users)

---

## 🔧 Technical Requirements

### Service Architecture
- **Service**: hr-service
- **Database Tables**: 
  - `attendance_records`: Core attendance data
  - `cat_attendance_types`: Attendance type catalog
  - `attendance_configurations`: Rules configuration (planned)

### API Endpoints
- `POST /api/v1/attendance/check-in` - Check-in endpoint
- `POST /api/v1/attendance/check-out` - Check-out endpoint
- `GET /api/v1/attendance/records` - Get attendance records (with filtering)
- `GET /api/v1/attendance/records/:id` - Get single attendance record
- `PUT /api/v1/attendance/records/:id` - Update attendance record
- `POST /api/v1/attendance/records/:id/approve` - Approve attendance record
- `POST /api/v1/attendance/records/:id/reject` - Reject attendance record
- `GET /api/v1/attendance/reports` - Generate attendance reports
- `GET /api/v1/attendance/export` - Export attendance data
- `GET /api/v1/attendance/realtime-status` - Get real-time attendance status (for managers)
- `GET /api/v1/attendance/configurations` - Get attendance configurations
- `PUT /api/v1/attendance/configurations/:id` - Update attendance configuration
- `POST /api/v1/attendance/special-cases` - Create special attendance case (for HR Manager)

### Mobile App Support
- Check-in/check-out via mobile app
- GPS location capture
- Offline mode with sync
- Push notifications for reminders

### Integration Points
- **User Service**: For employee authentication and authorization
- **Financial Service**: For payroll integration (planned)
- **Notification Service**: For reminders and alerts (planned)

---

## 📈 Metrics & KPIs

### Business Metrics
- **Attendance Recording Accuracy**: > 98%
- **Check-In/Check-Out Response Time**: < 1 second
- **Approval Processing Time**: < 24 hours
- **Employee Adoption Rate**: > 90%
- **Mobile App Usage**: > 60%

### Technical Metrics
- **API Response Time**: < 500ms (p95)
- **Attendance History Loading**: < 2 seconds for 100 records
- **Report Generation**: < 5 seconds for monthly report
- **Export Processing**: < 10 seconds for 1000 records
- **System Uptime**: > 99.9%

---

## 🔗 Dependencies

### Internal Dependencies
- **Employee Management** (FEAT-008-001): Must have employees before attendance tracking
- **Employee-User Integration** (FEAT-008-007): For employee authentication
- **Department Management** (FEAT-008-002): For department-based rules and filtering
- **Position Management** (FEAT-008-003): For position-based rules

### External Dependencies
- **Financial Service**: For payroll integration (planned)
- **Notification Service**: For reminders and alerts (planned)
- **Mobile App**: For mobile check-in/check-out (planned)

---

## 🎯 Priority & Roadmap

### Phase 1: Core Functionality (Current)
- ✅ Daily check-in/check-out
- ✅ Automatic calculation of working hours and overtime
- ✅ Attendance history viewing
- ✅ Basic approval workflow

### Phase 2: Enhanced Features (Next)
- 🔄 Mobile app with location validation
- 🔄 Real-time attendance dashboard
- 🔄 Attendance reports and analytics
- 🔄 Export for payroll

### Phase 3: Advanced Features (Future)
- 📋 Attendance rules configuration
- 📋 Special attendance cases
- 📋 Notification system
- 📋 Advanced analytics

---

## 📝 Notes

- Attendance Management is a critical feature for HR operations
- Mobile support is essential for remote workers and field staff
- Integration with payroll is crucial for accurate salary calculation
- Location validation helps ensure attendance accuracy
- Approval workflow ensures data quality before payroll processing

---

**Last Updated**: November 2025  
**Next Review**: December 2025  
**Version**: 1.0

