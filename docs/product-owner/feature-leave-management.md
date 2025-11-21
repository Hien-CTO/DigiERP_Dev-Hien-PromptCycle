# Feature: Leave Management (Nghỉ Phép)

## 📋 Thông Tin Feature

**Epic ID**: EPIC-008 - HR Management  
**Feature ID**: FEAT-008-006  
**Feature Name**: Leave Management (Nghỉ Phép)  
**Priority**: High  
**Business Value**: High  
**Status**: In Progress  
**Owner**: Product Owner  
**Created**: November 2025  
**Last Updated**: November 2025

**Related Services**: hr-service, user-service, financial-service (for payroll - planned)  
**Related Database Tables**: leave_requests, leave_balances, cat_leave_types, employees  
**Traceability**: [Business Rules Document](../business-analyst/business-rules-hr-management.md#br-hr-007-leave-management)  
**Related Epic**: [Epic: HR Management](./epic-hr-management.md)

---

## 🎯 Mô Tả Feature

Tính năng Nghỉ Phép (Leave Management) cho phép nhân viên tạo yêu cầu nghỉ phép, quản lý leave balance, và hỗ trợ workflow phê duyệt đa cấp. Hệ thống hỗ trợ nhiều loại nghỉ phép khác nhau (Annual, Sick, Unpaid, Maternity, Paternity, etc.), tự động tính toán leave entitlements, và tích hợp với attendance system để đảm bảo dữ liệu nhất quán.

---

## 💼 Mục Tiêu Kinh Doanh

1. **Tự động hóa quy trình nghỉ phép**: Giảm thời gian xử lý thủ công, tăng hiệu quả quản lý nhân sự
2. **Quản lý leave balance chính xác**: Tự động tính toán và cập nhật leave balance theo chính sách công ty
3. **Tuân thủ quy định**: Đảm bảo tuân thủ các quy định lao động về nghỉ phép
4. **Tích hợp với hệ thống**: Đồng bộ với attendance system và payroll system
5. **Cải thiện trải nghiệm nhân viên**: Self-service, mobile support, real-time tracking

**Business Value**:
- Giảm 60% thời gian xử lý yêu cầu nghỉ phép thủ công
- Tăng 95% độ chính xác trong tính toán leave balance
- Giảm 80% lỗi trong quản lý nghỉ phép
- Tăng 70% sự hài lòng của nhân viên với quy trình nghỉ phép

---

## 🚀 User Stories

### US-008-006-001: Create Leave Request
**As an** Employee, **I want to** create a leave request **so that** I can request time off and plan my leave in advance.

**Priority**: Critical  
**Story Points**: 5

**Acceptance Criteria**:
- ✅ Employee can create leave request via web app or mobile app
- ✅ System displays current leave balance for each leave type before creating request
- ✅ System requires employee to select leave type (Annual, Sick, Unpaid, Maternity, Paternity, etc.)
- ✅ System requires employee to enter start date and end date
- ✅ System automatically calculates number of leave days (including weekends and holidays based on company policy)
- ✅ System validates leave days do not exceed available leave balance (for paid leave types)
- ✅ System validates start date is not in the past (unless with special approval)
- ✅ System validates end date is after or equal to start date
- ✅ System allows employee to enter reason/notes for leave request (optional but recommended)
- ✅ System allows employee to attach supporting documents (e.g., medical certificate for sick leave > 3 days)
- ✅ System validates employee status is Active before allowing leave request creation
- ✅ System prevents creating leave request that overlaps with existing approved/pending leave requests
- ✅ System shows warning if leave request overlaps with pending leave requests
- ✅ System automatically sets status to PENDING after creation
- ✅ System sends notification to Manager when leave request is created

---

### US-008-006-002: View Leave Balance
**As an** Employee, **I want to** view my leave balance **so that** I can plan my leave and know how many days I have available.

**Priority**: High  
**Story Points**: 3

**Acceptance Criteria**:
- ✅ Employee can view leave balance for all leave types
- ✅ System displays current balance, used balance, and remaining balance for each leave type
- ✅ System shows leave balance breakdown by year (current year, next year, carry-over)
- ✅ System displays pending leave requests and their impact on leave balance
- ✅ System shows leave history with dates, types, and status
- ✅ System displays leave entitlements (total days granted per year by leave type)
- ✅ System shows leave balance expiration dates (if applicable)
- ✅ System calculates and displays projected leave balance after pending requests are approved
- ✅ System provides visual indicators (green for sufficient balance, yellow for low balance, red for insufficient)
- ✅ System shows leave accrual rate and next accrual date
- ✅ System displays leave balance summary on employee dashboard

---

### US-008-006-003: Approve/Reject Leave Request
**As a** Manager, **I want to** approve or reject leave requests **so that** I can manage team availability and ensure adequate coverage.

**Priority**: Critical  
**Story Points**: 5

**Acceptance Criteria**:
- ✅ Manager can view leave requests of employees in their department
- ✅ Manager can view pending leave requests with clear indication
- ✅ Manager can approve leave requests (single or bulk)
- ✅ Manager can reject leave requests with reason (mandatory for rejection)
- ✅ System sends notification to employee when leave request is approved/rejected
- ✅ System automatically updates leave balance when leave request is approved (deduct from balance)
- ✅ System automatically restores leave balance when leave request is rejected or cancelled
- ✅ System supports bulk approval for multiple leave requests
- ✅ System shows pending approval count for manager dashboard
- ✅ System displays leave request details: dates, leave type, number of days, reason, employee info
- ✅ System shows leave balance impact before approval
- ✅ System allows manager to add notes when approving/rejecting
- ✅ System tracks approval history (who, when, reason)
- ✅ System prevents manager from approving their own leave requests
- ✅ System supports filtering by employee, date range, leave type, status
- ✅ System shows calendar view of team leave for conflict detection
- ✅ System alerts manager if approving leave would cause insufficient team coverage (configurable threshold)

---

### US-008-006-004: Edit/Cancel Leave Request
**As an** Employee, **I want to** edit or cancel my leave request **so that** I can adjust my leave plans if needed.

**Priority**: High  
**Story Points**: 3

**Acceptance Criteria**:
- ✅ Employee can edit leave request only if status is PENDING
- ✅ Employee can cancel leave request only if status is PENDING or APPROVED
- ✅ System allows editing leave dates, leave type, reason, and attached documents
- ✅ System validates edited leave request (same validations as creating new request)
- ✅ System automatically restores original leave balance if dates/type changed
- ✅ System automatically deducts new leave balance after edit
- ✅ System requires employee to enter edit reason (mandatory when editing approved requests)
- ✅ System automatically sets status to PENDING after edit (if previously approved)
- ✅ System sends notification to Manager when leave request is edited or cancelled
- ✅ System allows cancelling leave requests with automatic balance restoration
- ✅ System logs all changes with audit trail (old values, new values, edit reason, timestamp)
- ✅ System shows edit history for each leave request
- ✅ System prevents editing/cancelling leave requests that have already been taken (start date passed)

---

### US-008-006-005: Calculate Leave Entitlements
**As a** System, **I want to** automatically calculate leave entitlements **so that** leave balance is accurate and reflects company policies.

**Priority**: Critical  
**Story Points**: 8

**Acceptance Criteria**:
- ✅ System calculates leave entitlements based on:
  - Employee contract type (Full-time, Part-time, Contract, Intern)
  - Employee tenure (years of service)
  - Company policy and regulations
  - Employee position level
- ✅ System automatically grants annual leave entitlements at the start of each year
- ✅ System calculates prorated leave entitlements for new employees joining mid-year
- ✅ System calculates prorated leave entitlements for employees who change contract type
- ✅ System supports leave accrual (monthly, quarterly, or yearly)
- ✅ System handles leave carry-over (maximum 5 days for annual leave, configurable)
- ✅ System automatically expires unused leave that cannot be carried over
- ✅ System calculates different entitlements for different leave types:
  - Annual Leave: Based on contract type and tenure
  - Sick Leave: Standard entitlement per year (configurable)
  - Maternity Leave: 6 months (for female employees)
  - Paternity Leave: 5-10 days (for male employees, configurable)
- ✅ System supports special entitlements for long-serving employees
- ✅ System updates leave balance automatically when entitlements are calculated
- ✅ System maintains leave entitlement history
- ✅ System sends notification to employee when new leave entitlements are granted
- ✅ System handles edge cases (leap year, contract changes, mid-year leave)

---

### US-008-006-006: Track Leave History
**As an** Employee, **I want to** view my leave history **so that** I can track my past leave records and verify leave balance.

**Priority**: Medium  
**Story Points**: 3

**Acceptance Criteria**:
- ✅ Employee can view list of all leave requests (only their own)
- ✅ System displays leave history with: dates, leave type, number of days, status, approval/rejection details
- ✅ System supports filtering by date range, leave type, status
- ✅ System supports sorting by date, leave type, status
- ✅ System shows approval/rejection history (who approved/rejected, when, reason)
- ✅ System displays leave balance changes over time
- ✅ System shows calendar view of leave history
- ✅ System supports pagination for large datasets
- ✅ System allows export to Excel/CSV for personal records
- ✅ System shows summary statistics (total days taken, total days approved, total days rejected by leave type)
- ✅ System displays leave utilization trends (charts/graphs)

---

### US-008-006-007: Manager Leave Dashboard
**As a** Manager, **I want to** view leave dashboard for my team **so that** I can monitor team leave and plan work coverage.

**Priority**: High  
**Story Points**: 5

**Acceptance Criteria**:
- ✅ Manager can view calendar view of all team leave (approved and pending)
- ✅ Manager can see pending leave requests requiring approval
- ✅ Manager can see upcoming leave for the next 30/60/90 days
- ✅ System displays leave summary: total employees, employees on leave, employees returning soon
- ✅ System shows leave statistics by leave type for the team
- ✅ System alerts manager if multiple employees request leave on the same dates (potential coverage issue)
- ✅ System displays employee leave balance overview
- ✅ System supports filtering by employee, date range, leave type
- ✅ System shows leave trends and patterns (e.g., high leave usage in certain months)
- ✅ System provides export functionality for leave calendar
- ✅ System displays real-time leave status (who is currently on leave)
- ✅ System shows leave requests by status (pending, approved, rejected, cancelled)

---

### US-008-006-008: HR Manager Leave Overview
**As an** HR Manager, **I want to** view leave overview and reports **so that** I can manage leave policies and track leave utilization across the organization.

**Priority**: High  
**Story Points**: 8

**Acceptance Criteria**:
- ✅ HR Manager can view leave overview for all employees across all departments
- ✅ System provides leave reports by department, position, employee, date range
- ✅ System shows leave utilization statistics (average days taken, leave types distribution)
- ✅ System displays leave balance analysis (employees with low balance, high balance, expired leave)
- ✅ System identifies unusual leave patterns (e.g., frequent sick leave, excessive annual leave usage)
- ✅ System generates leave forecast (projected leave usage for upcoming months)
- ✅ System provides comparative analysis (department vs department, year over year)
- ✅ System exports reports to Excel, PDF, CSV formats
- ✅ System shows leave policy compliance (employees taking leave according to policy)
- ✅ System tracks leave approval/rejection rates by manager
- ✅ System displays leave entitlement vs utilization analysis
- ✅ System provides leave cost analysis (for unpaid leave tracking)
- ✅ System shows leave trends and patterns with charts/graphs
- ✅ System alerts HR Manager for leave policy violations or anomalies

---

### US-008-006-009: Leave Types Configuration
**As an** HR Manager, **I want to** configure leave types and their rules **so that** the system enforces company leave policies automatically.

**Priority**: Medium  
**Story Points**: 5

**Acceptance Criteria**:
- ✅ System allows configuring leave types with: name, code, description, max days per year, carry-over rules
- ✅ System supports different leave types:
  - Annual Leave: Paid leave, based on tenure, can carry-over (max 5 days)
  - Sick Leave: Paid leave, requires medical certificate if > 3 days
  - Unpaid Leave: No balance, requires approval
  - Maternity Leave: 6 months, for female employees only
  - Paternity Leave: 5-10 days, for male employees only
  - Emergency Leave: Unpaid, for emergencies
  - Other: Custom leave types
- ✅ System allows configuring leave entitlements per leave type (can vary by contract type, position, tenure)
- ✅ System allows configuring leave approval workflow (single-level or multi-level)
- ✅ System allows configuring minimum notice period for leave requests
- ✅ System allows configuring maximum consecutive leave days
- ✅ System allows configuring blackout dates (dates when leave is not allowed, e.g., peak season)
- ✅ System allows configuring leave accrual rules (monthly, quarterly, yearly)
- ✅ System allows configuring leave expiration rules (carry-over limits, expiration dates)
- ✅ System validates configuration (e.g., max days >= 0, carry-over <= max days)
- ✅ System maintains configuration history (audit trail)
- ✅ System allows testing configuration before applying

---

### US-008-006-010: Integration with Attendance System
**As a** System, **I want to** integrate leave management with attendance system **so that** attendance records accurately reflect leave status.

**Priority**: High  
**Story Points**: 5

**Acceptance Criteria**:
- ✅ System automatically marks attendance records as LEAVE when leave request is approved and taken
- ✅ System prevents check-in/check-out on days when employee has approved leave
- ✅ System allows HR Manager to manually create attendance records for leave days (if needed)
- ✅ System syncs leave status with attendance records in real-time
- ✅ System shows leave information in attendance history (leave type, dates)
- ✅ System calculates attendance statistics excluding leave days
- ✅ System validates leave dates don't conflict with attendance records
- ✅ System sends notification if employee attempts to check-in on approved leave day
- ✅ System automatically closes attendance records when leave is approved retroactively
- ✅ System maintains data consistency between leave and attendance systems
- ✅ System provides leave calendar view in attendance dashboard

---

### US-008-006-011: Leave Request Notifications
**As an** Employee/Manager, **I want to** receive notifications about leave requests **so that** I stay informed about leave status and approvals.

**Priority**: Medium  
**Story Points**: 3

**Acceptance Criteria**:
- ✅ System sends notification to Manager when employee creates leave request
- ✅ System sends notification to Employee when leave request is approved/rejected
- ✅ System sends reminder notification before leave start date (e.g., 1 day before)
- ✅ System sends notification if leave request is pending approval for more than X days (configurable)
- ✅ System sends notification when leave balance is low (< 3 days remaining)
- ✅ System sends notification when new leave entitlements are granted
- ✅ System supports email and in-app notifications
- ✅ System allows employees and managers to configure notification preferences
- ✅ System sends notification if leave request conflicts with other requests or blackout dates
- ✅ System sends notification when leave is about to expire (if applicable)

---

### US-008-006-012: Mobile App Support
**As an** Employee, **I want to** create and manage leave requests via mobile app **so that** I can request leave anytime, anywhere.

**Priority**: Medium  
**Story Points**: 5

**Acceptance Criteria**:
- ✅ Mobile app supports creating leave requests
- ✅ Mobile app supports viewing leave balance
- ✅ Mobile app supports viewing leave history
- ✅ Mobile app supports viewing leave calendar
- ✅ Mobile app supports uploading documents (medical certificate, etc.)
- ✅ Mobile app supports receiving push notifications for leave status updates
- ✅ Mobile app supports offline mode (syncs when online)
- ✅ Mobile app provides intuitive user interface optimized for mobile devices
- ✅ Mobile app supports biometric authentication (fingerprint, face ID)
- ✅ Mobile app displays leave request status clearly with visual indicators

---

## 📊 Acceptance Criteria (Tổng Hợp)

### Core Functionality
- ✅ System allows creating leave requests with leave type, dates, reason
- ✅ System validates leave balance before allowing leave requests
- ✅ System supports leave approval workflow (Manager/HR Manager)
- ✅ System automatically calculates and updates leave balance
- ✅ System tracks leave history with complete audit trail
- ✅ System calculates leave entitlements automatically based on company policies
- ✅ System prevents overlapping leave requests
- ✅ System handles different leave types with different rules

### User Experience
- ✅ System allows employees to view leave balance and history
- ✅ System allows employees to edit/cancel pending leave requests
- ✅ System provides manager dashboard for team leave management
- ✅ System provides HR dashboard for organization-wide leave overview
- ✅ System supports mobile app for leave requests
- ✅ System sends notifications for leave status updates

### Integration & Data
- ✅ System integrates with attendance system to mark leave days
- ✅ System integrates with payroll system (planned) for leave salary calculation
- ✅ System exports leave data for reporting and analytics
- ✅ System maintains data consistency across systems
- ✅ System supports configurable leave policies and rules

### Security & Compliance
- ✅ System enforces role-based access control (Employee, Manager, HR Manager)
- ✅ System maintains audit trail for all leave operations
- ✅ System protects sensitive leave data
- ✅ System ensures data privacy (leave information only visible to authorized users)
- ✅ System ensures compliance with labor regulations

---

## 🔧 Technical Requirements

### Service Architecture
- **Service**: hr-service
- **Database Tables**: 
  - `leave_requests`: Core leave request data
  - `leave_balances`: Leave balance per employee per leave type
  - `cat_leave_types`: Leave type catalog
  - `leave_entitlements`: Leave entitlement history
  - `leave_configurations`: Leave policy configurations (planned)

### API Endpoints
- `POST /api/v1/leave/requests` - Create leave request
- `GET /api/v1/leave/requests` - Get leave requests (with filtering)
- `GET /api/v1/leave/requests/:id` - Get single leave request
- `PUT /api/v1/leave/requests/:id` - Update leave request
- `DELETE /api/v1/leave/requests/:id` - Cancel leave request
- `POST /api/v1/leave/requests/:id/approve` - Approve leave request
- `POST /api/v1/leave/requests/:id/reject` - Reject leave request
- `GET /api/v1/leave/balance` - Get leave balance (current user)
- `GET /api/v1/leave/balance/:employeeId` - Get leave balance (for Manager/HR Manager)
- `GET /api/v1/leave/history` - Get leave history (current user)
- `GET /api/v1/leave/history/:employeeId` - Get leave history (for Manager/HR Manager)
- `GET /api/v1/leave/dashboard` - Get leave dashboard (for Manager)
- `GET /api/v1/leave/reports` - Generate leave reports (for HR Manager)
- `GET /api/v1/leave/export` - Export leave data
- `GET /api/v1/leave/calendar` - Get leave calendar view
- `GET /api/v1/leave/types` - Get leave types
- `POST /api/v1/leave/types` - Create leave type (for HR Manager)
- `PUT /api/v1/leave/types/:id` - Update leave type (for HR Manager)
- `GET /api/v1/leave/configurations` - Get leave configurations
- `PUT /api/v1/leave/configurations/:id` - Update leave configuration (for HR Manager)
- `POST /api/v1/leave/calculate-entitlements` - Calculate leave entitlements (scheduled job)

### Mobile App Support
- Create/view/edit leave requests via mobile app
- View leave balance and history
- Upload supporting documents
- Push notifications for leave status updates
- Offline mode with sync

### Integration Points
- **User Service**: For employee authentication and authorization
- **Attendance Service**: For marking leave days in attendance records
- **Financial Service**: For leave salary calculation (planned)
- **Notification Service**: For notifications and reminders (planned)

---

## 📈 Metrics & KPIs

### Business Metrics
- **Leave Request Processing Time**: < 2 days
- **Leave Balance Accuracy**: > 98%
- **Leave Request Approval Rate**: > 85%
- **Employee Adoption Rate**: > 90%
- **Mobile App Usage**: > 60%

### Technical Metrics
- **API Response Time**: < 500ms (p95)
- **Leave History Loading**: < 2 seconds for 100 records
- **Leave Balance Calculation**: < 1 second
- **Report Generation**: < 5 seconds for monthly report
- **System Uptime**: > 99.9%

---

## 🔗 Dependencies

### Internal Dependencies
- **Employee Management** (FEAT-008-001): Must have employees before leave management
- **Employee-User Integration** (FEAT-008-007): For employee authentication
- **Department Management** (FEAT-008-002): For department-based leave policies and reporting
- **Contract Management** (FEAT-008-004): For contract-based leave entitlements
- **Attendance Management** (FEAT-008-005): For integration with attendance records

### External Dependencies
- **Financial Service**: For leave salary calculation (planned)
- **Notification Service**: For notifications and reminders (planned)
- **Mobile App**: For mobile leave requests (planned)

---

## 🎯 Priority & Roadmap

### Phase 1: Core Functionality (Current)
- ✅ Create leave requests
- ✅ View leave balance
- ✅ Basic approval workflow
- ✅ Leave balance calculation
- ✅ Leave history viewing

### Phase 2: Enhanced Features (Next)
- 🔄 Manager leave dashboard
- 🔄 Leave entitlements auto-calculation
- 🔄 Integration with attendance system
- 🔄 Leave reports and analytics
- 🔄 Mobile app support

### Phase 3: Advanced Features (Future)
- 📋 Leave types configuration
- 📋 Multi-level approval workflow
- 📋 Leave forecasting
- 📋 Advanced analytics
- 📋 Integration with payroll

---

## 📝 Notes

- Leave Management is a critical feature for HR operations
- Mobile support is essential for employee convenience
- Integration with attendance is crucial for data consistency
- Auto-calculation of leave entitlements reduces manual work
- Approval workflow ensures proper leave management

---

## 📚 Leave Types Reference

### Standard Leave Types
1. **Annual Leave** (Nghỉ phép năm)
   - Paid leave
   - Entitlement based on contract type and tenure
   - Can carry-over (max 5 days)
   - Requires approval

2. **Sick Leave** (Nghỉ ốm)
   - Paid leave
   - Standard entitlement per year
   - Requires medical certificate if > 3 days
   - Requires approval

3. **Unpaid Leave** (Nghỉ không lương)
   - No balance limit
   - No salary during leave
   - Requires approval

4. **Maternity Leave** (Nghỉ thai sản)
   - 6 months for female employees
   - Paid leave
   - Requires approval

5. **Paternity Leave** (Nghỉ khi vợ sinh)
   - 5-10 days for male employees
   - Paid leave
   - Requires approval

6. **Emergency Leave** (Nghỉ khẩn cấp)
   - Unpaid leave
   - For emergencies
   - Requires approval

7. **Other** (Loại nghỉ khác)
   - Custom leave types
   - Rules configurable

---

**Last Updated**: November 2025  
**Next Review**: December 2025  
**Version**: 1.0

