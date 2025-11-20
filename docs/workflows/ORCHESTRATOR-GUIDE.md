# Orchestrator Agent - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan

Orchestrator Agent là một role đặc biệt được thiết kế để điều phối toàn bộ quy trình phát triển tính năng từ đầu đến cuối, tự động chuyển đổi qua tất cả các role agents theo thứ tự.

## 🎯 Mục Đích

Thay vì phải chuyển đổi role thủ công nhiều lần, Orchestrator Agent cho phép bạn chỉ cần một câu lệnh để hoàn thiện toàn bộ tính năng:

```
Hãy hoàn thiện tính năng "chấm công" cho nhân viên
```

Orchestrator sẽ tự động:
1. ✅ Xác định epic/feature (Product Owner)
2. ✅ Phân tích requirements (Business Analyst)
3. ✅ Thiết kế database schema (Database Engineer)
4. ✅ Implement code (Fullstack Developer)
5. ✅ Viết tests (Automation Tester)
6. ✅ Security audit (Security Tester)
7. ✅ Deploy config (DevOps)

## 🚀 Cách Sử Dụng

### Phương Pháp 1: Sử dụng Script Tự Động (Khuyến nghị)

```powershell
# Chạy workflow cho một tính năng mới
.\orchestrate-feature.ps1 -FeatureName "cham-cong" -Description "Tính năng chấm công cho nhân viên"
```

Script sẽ:
- Tự động chuyển đổi qua tất cả các role
- Tạo workflow summary document
- Track progress từng bước
- Hướng dẫn bạn prompt cho từng role

**Ví dụ sử dụng:**
```powershell
# Tính năng chấm công
.\orchestrate-feature.ps1 -FeatureName "cham-cong" -Description "Tính năng chấm công cho nhân viên"

# Tính năng quản lý đơn hàng
.\orchestrate-feature.ps1 -FeatureName "quan-ly-don-hang" -Description "Tính năng quản lý đơn hàng bán hàng"

# Skip một số bước nếu cần
.\orchestrate-feature.ps1 -FeatureName "cham-cong" -Description "Tính năng chấm công" -SkipStepNumbers @("6", "7")
```

### Phương Pháp 2: Sử dụng Orchestrator Agent Trực Tiếp

```powershell
# Chuyển sang Orchestrator role
.\switch-role.ps1 orchestrator
```

Sau đó trong Cursor AI, gõ:

```
Hãy hoàn thiện tính năng "chấm công" cho nhân viên theo quy trình end-to-end:
1. Product Owner: Xác định epic/feature
2. Business Analyst: Phân tích requirements và use cases  
3. Database Engineer: Thiết kế schema
4. Fullstack Developer: Implement code
5. Automation Tester: Viết tests
6. Security Tester: Security audit
7. DevOps: Deploy config

Hãy thực hiện tuần tự từng bước và đảm bảo mỗi bước hoàn thành trước khi chuyển sang bước tiếp theo.
```

## 📊 Workflow Steps

### Step 1: Product Owner
- **Nhiệm vụ**: Xác định epic/feature, tạo user stories
- **Output**: Epic documents trong `/docs/product-owner/`
- **Checklist**: Epic defined, User stories created, Acceptance criteria defined

### Step 2: Business Analyst
- **Nhiệm vụ**: Phân tích requirements, tạo use cases và business rules
- **Output**: Use cases và business rules trong `/docs/business-analyst/`
- **Checklist**: Use cases created, Business rules defined, Data entities identified

### Step 3: Database Engineer
- **Nhiệm vụ**: Thiết kế database schema và tạo migration scripts
- **Output**: Migration files và schema docs
- **Checklist**: Schema designed, Migrations created, Indexes designed

### Step 4: Fullstack Developer
- **Nhiệm vụ**: Implement backend (NestJS) và frontend (Next.js)
- **Output**: Code files trong `/services/` và `/apps/admin-panel/`
- **Checklist**: Backend implemented, Frontend implemented, API integrated

### Step 5: Automation Tester
- **Nhiệm vụ**: Viết Playwright E2E tests
- **Output**: Test files và reports trong `/tests/`
- **Checklist**: E2E tests written, Tests passed, Reports generated

### Step 6: Security Tester
- **Nhiệm vụ**: Security audit và kiểm tra OWASP Top 10
- **Output**: Security reports trong `/docs/security-tester/`
- **Checklist**: Security audit completed, Vulnerabilities checked, Report created

### Step 7: DevOps
- **Nhiệm vụ**: Update Docker configs và deploy lên UAT
- **Output**: Deployment docs và configs
- **Checklist**: Docker configs updated, Deployed to UAT, Documentation created

## 📁 Output Files

Mỗi workflow tạo ra:

1. **Workflow Summary**: `docs/workflows/[feature-name]-workflow-summary.md`
   - Track progress từng bước
   - List deliverables
   - Document issues và resolutions
   - Traceability links

2. **Role-specific outputs**: Theo từng role trong thư mục `/docs/[role-name]/`

3. **Code files**: Trong `/services/` và `/apps/admin-panel/`

4. **Test files**: Trong `/tests/`

## 🔄 Workflow Execution Flow

```
User Request
    ↓
Orchestrator parses request
    ↓
Step 1: Product Owner
    ↓ (reads output)
Step 2: Business Analyst
    ↓ (reads output)
Step 3: Database Engineer
    ↓ (reads output)
Step 4: Fullstack Developer
    ↓ (reads output)
Step 5: Automation Tester
    ↓ (reads output)
Step 6: Security Tester
    ↓ (reads output)
Step 7: DevOps
    ↓
Workflow Summary Created
    ↓
Feature Completed ✅
```

## 📝 Workflow Summary Format

Mỗi workflow summary bao gồm:

```markdown
# Workflow Summary: [Feature Name]

## Overview
- Feature name, description, status
- Start and completion dates

## Workflow Steps
- Chi tiết từng bước với status, output, notes

## Deliverables Summary
- Tổng hợp tất cả deliverables

## Dependencies
- Internal và external dependencies

## Issues & Resolutions
- Các vấn đề và cách giải quyết

## Traceability
- Links với epic, feature, use cases, etc.
```

## 💡 Best Practices

1. **Bắt đầu với mô tả rõ ràng**: Cung cấp mô tả đầy đủ về tính năng
2. **Review từng bước**: Đảm bảo mỗi bước hoàn thành đầy đủ trước khi tiếp tục
3. **Document decisions**: Ghi chép tất cả decisions và notes
4. **Update traceability**: Luôn update traceability matrix
5. **Quality gates**: Không bỏ qua bước, đảm bảo quality

## ⚠️ Lưu Ý

- **Sequential execution**: Các bước được thực hiện tuần tự, không parallel
- **Context preservation**: Context được giữ nguyên xuyên suốt workflow
- **Quality gates**: Mỗi phase phải hoàn thành đầy đủ trước khi chuyển sang phase tiếp theo
- **Manual intervention**: Có thể cần can thiệp thủ công ở một số bước

## 🔗 Liên Kết

- [README-CURSOR-ROLES.md](../../README-CURSOR-ROLES.md) - Hướng dẫn sử dụng các role agents
- [workflow-template.md](workflow-template.md) - Template cho workflow summary
- [Technical Architecture](../architecture/Technical-Architecture.md) - Kiến trúc kỹ thuật
- [Database Architecture](../database-engineer/Database-Architecture.md) - Kiến trúc database

## 📚 Ví Dụ

Xem các workflow summaries đã hoàn thành trong thư mục `docs/workflows/` để tham khảo format và cách thực hiện.

---

**Version**: 1.0  
**Last Updated**: November 2025

