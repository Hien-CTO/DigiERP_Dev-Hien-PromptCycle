# Workflows Documentation

Thư mục này chứa các workflow summaries cho các tính năng được phát triển theo quy trình end-to-end.

## 📋 Mục đích

Workflow summaries document toàn bộ quy trình phát triển một tính năng từ đầu đến cuối, đi qua tất cả các role agents:
1. Product Owner
2. Business Analyst
3. Database Engineer
4. Fullstack Developer
5. Automation Tester
6. Security Tester
7. DevOps

## 🚀 Cách sử dụng

### Sử dụng Orchestrator Script

```powershell
# Chạy workflow cho một tính năng mới
.\orchestrate-feature.ps1 -FeatureName "cham-cong" -Description "Tính năng chấm công cho nhân viên"

# Skip một số bước nếu cần
.\orchestrate-feature.ps1 -FeatureName "cham-cong" -Description "Tính năng chấm công" -SkipStepNumbers @("6", "7")

# Sử dụng Orchestrator Agent trực tiếp
.\switch-role.ps1 orchestrator
```

### Sử dụng Orchestrator Agent trong Cursor AI

Sau khi chuyển sang orchestrator role:

```
Với vai trò Orchestrator, hãy hoàn thiện tính năng "chấm công" cho nhân viên theo quy trình end-to-end:
1. Product Owner: Xác định epic/feature
2. Business Analyst: Phân tích requirements và use cases  
3. Database Engineer: Thiết kế schema
4. Fullstack Developer: Implement code
5. Automation Tester: Viết tests
6. Security Tester: Security audit
7. DevOps: Deploy config

Hãy thực hiện tuần tự từng bước và đảm bảo mỗi bước hoàn thành trước khi chuyển sang bước tiếp theo.
```

## 📁 Cấu trúc File

```
docs/workflows/
├── README.md                          # File này
├── workflow-template.md               # Template cho workflow summary
└── [feature-name]-workflow-summary.md # Workflow summary cho từng feature
```

## 📝 Workflow Summary Format

Mỗi workflow summary bao gồm:

1. **Overview**: Tổng quan về feature
2. **Workflow Steps**: Chi tiết từng bước với:
   - Role và nhiệm vụ
   - Status (In Progress / Completed / Skipped)
   - Output files
   - Notes và decisions
3. **Deliverables Summary**: Tổng hợp tất cả deliverables
4. **Dependencies**: Các dependencies
5. **Issues & Resolutions**: Các vấn đề và cách giải quyết
6. **Traceability**: Liên kết với epic, feature, use cases, etc.

## 🔄 Quy trình Workflow

### Bước 1: Product Owner
- Xác định epic/feature
- Tạo user stories
- Định nghĩa acceptance criteria
- Output: Epic documents

### Bước 2: Business Analyst
- Phân tích requirements
- Tạo use cases
- Xác định business rules
- Output: Use cases và business rules

### Bước 3: Database Engineer
- Thiết kế database schema
- Tạo migration scripts
- Output: Migration files và schema docs

### Bước 4: Fullstack Developer
- Implement backend (NestJS)
- Implement frontend (Next.js)
- Tích hợp API
- Output: Code files

### Bước 5: Automation Tester
- Viết E2E tests
- Chạy tests
- Output: Test files và reports

### Bước 6: Security Tester
- Security audit
- Kiểm tra OWASP Top 10
- Output: Security reports

### Bước 7: DevOps
- Update Docker configs
- Deploy to UAT
- Output: Deployment docs

## 📊 Tracking Progress

Mỗi workflow summary có status tracking:
- ⏳ **In Progress**: Đang thực hiện
- ✅ **Completed**: Đã hoàn thành
- ⏭️ **Skipped**: Đã bỏ qua
- ❌ **Error**: Có lỗi

## 🔗 Liên kết

- [README-CURSOR-ROLES.md](../../README-CURSOR-ROLES.md) - Hướng dẫn sử dụng các role agents
- [Technical Architecture](../architecture/Technical-Architecture.md) - Kiến trúc kỹ thuật
- [Database Architecture](../database-engineer/Database-Architecture.md) - Kiến trúc database
- [Traceability Matrix](../traceability-matrix.md) - Traceability matrix

## 💡 Tips

1. **Luôn bắt đầu với Product Owner**: Đảm bảo feature được định nghĩa rõ ràng trước khi bắt đầu
2. **Đọc output của phase trước**: Mỗi phase phải đọc và hiểu output của phase trước
3. **Document đầy đủ**: Ghi chép tất cả decisions và notes
4. **Update traceability**: Luôn update traceability matrix sau mỗi phase
5. **Quality gates**: Không bỏ qua bước, đảm bảo mỗi phase hoàn thành đầy đủ

## 📚 Ví dụ

Xem file `workflow-template.md` để biết format đầy đủ của một workflow summary.

---

**Version**: 1.0  
**Last Updated**: November 2025

