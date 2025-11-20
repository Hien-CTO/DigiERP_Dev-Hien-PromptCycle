-- Seed HR Catalog Data

-- Seed cat_employee_status
INSERT INTO cat_employee_status (code, name, description, is_active, sort_order) VALUES
('ACTIVE', 'Đang làm việc', 'Nhân viên đang làm việc bình thường', 1, 1),
('ON_LEAVE', 'Đang nghỉ phép', 'Nhân viên đang trong thời gian nghỉ phép', 1, 2),
('PROBATION', 'Thử việc', 'Nhân viên đang trong thời gian thử việc', 1, 3),
('RESIGNED', 'Đã nghỉ việc', 'Nhân viên đã tự nghỉ việc', 1, 4),
('TERMINATED', 'Bị chấm dứt hợp đồng', 'Nhân viên bị chấm dứt hợp đồng', 1, 5)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed cat_contract_types
INSERT INTO cat_contract_types (code, name, description, is_active, sort_order) VALUES
('FULL_TIME', 'Toàn thời gian', 'Hợp đồng lao động toàn thời gian', 1, 1),
('PART_TIME', 'Bán thời gian', 'Hợp đồng lao động bán thời gian', 1, 2),
('CONTRACT', 'Hợp đồng', 'Hợp đồng theo dự án/công việc cụ thể', 1, 3),
('INTERN', 'Thực tập sinh', 'Hợp đồng thực tập', 1, 4),
('PROBATION', 'Thử việc', 'Hợp đồng thử việc', 1, 5)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed cat_leave_types
INSERT INTO cat_leave_types (code, name, description, is_paid, max_days_per_year, requires_approval, is_active, sort_order) VALUES
('ANNUAL', 'Nghỉ phép năm', 'Nghỉ phép năm có lương', 1, 12, 1, 1, 1),
('SICK', 'Nghỉ ốm', 'Nghỉ ốm có lương', 1, NULL, 1, 1, 2),
('UNPAID', 'Nghỉ không lương', 'Nghỉ không lương', 0, NULL, 1, 1, 3),
('MATERNITY', 'Nghỉ thai sản', 'Nghỉ thai sản có lương', 1, NULL, 1, 1, 4),
('PATERNITY', 'Nghỉ khi vợ sinh', 'Nghỉ khi vợ sinh có lương', 1, 5, 1, 1, 5),
('BEREAVEMENT', 'Nghỉ tang', 'Nghỉ tang có lương', 1, 3, 1, 1, 6),
('STUDY', 'Nghỉ học tập', 'Nghỉ để học tập có lương', 1, NULL, 1, 1, 7)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed cat_attendance_types
INSERT INTO cat_attendance_types (code, name, description, is_active, sort_order) VALUES
('NORMAL', 'Bình thường', 'Chấm công bình thường', 1, 1),
('OVERTIME', 'Làm thêm giờ', 'Chấm công làm thêm giờ', 1, 2),
('HOLIDAY', 'Ngày lễ', 'Chấm công ngày lễ', 1, 3),
('WEEKEND', 'Cuối tuần', 'Chấm công cuối tuần', 1, 4)
ON DUPLICATE KEY UPDATE name=VALUES(name);

