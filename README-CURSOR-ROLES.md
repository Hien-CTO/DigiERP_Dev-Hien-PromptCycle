# Cursor AI Agent Roles - Hướng Dẫn Sử Dụng

Tài liệu này hướng dẫn cách sử dụng các vai trò AI Agent khác nhau trong quy trình phát triển phần mềm với Cursor AI.

## 📋 Các Vai Trò Có Sẵn

1. **Orchestrator** - Điều phối toàn bộ quy trình phát triển tính năng end-to-end (⭐ MỚI)
2. **Product Owner** - Quản lý epic, features, user stories
3. **Business Analyst** - Phân tích requirements chi tiết
4. **Database Engineer** - Thiết kế và quản lý database
5. **Fullstack Developer** - Phát triển backend và frontend
6. **Automation Tester** - Viết và chạy automated tests
7. **Security Tester** - Kiểm tra bảo mật hệ thống
8. **DevOps** - Triển khai và vận hành hệ thống

## 🚀 Cách Sử Dụng

### ⭐ Phương Pháp 0: End-to-End Workflow với Orchestrator (Khuyến nghị cho tính năng mới)

Sử dụng Orchestrator để tự động hóa toàn bộ quy trình phát triển một tính năng từ đầu đến cuối:

#### Sử dụng Script tự động:
```powershell
# Chạy workflow cho một tính năng mới
.\orchestrate-feature.ps1 -FeatureName "cham-cong" -Description "Tính năng chấm công cho nhân viên"

# Script sẽ tự động chuyển đổi qua tất cả các role theo thứ tự:
# 1. Product Owner → 2. Business Analyst → 3. Database Engineer 
# → 4. Fullstack Developer → 5. Automation Tester 
# → 6. Security Tester → 7. DevOps
```

#### Sử dụng Orchestrator Agent trực tiếp:
```powershell
# Chuyển sang Orchestrator role
.\switch-role.ps1 orchestrator
```

Sau đó trong Cursor AI, gõ:
```
Hãy hoàn thiện tính năng "chấm công" cho nhân viên theo quy trình end-to-end
```

**Xem thêm**: [docs/workflows/README.md](docs/workflows/README.md) để biết chi tiết về workflow.

### Phương Pháp 1: Sử dụng Script PowerShell (Cho từng role riêng lẻ)

#### Liệt kê tất cả các vai trò:
```powershell
.\switch-role.ps1 list
```

#### Chuyển đổi vai trò:
```powershell
# Chuyển sang Product Owner
.\switch-role.ps1 product-owner

# Chuyển sang Business Analyst
.\switch-role.ps1 business-analyst

# Chuyển sang Database Engineer
.\switch-role.ps1 database-engineer

# Chuyển sang Fullstack Developer
.\switch-role.ps1 fullstack-developer

# Chuyển sang Automation Tester
.\switch-role.ps1 automation-tester

# Chuyển sang Security Tester
.\switch-role.ps1 security-tester

# Chuyển sang DevOps
.\switch-role.ps1 devops

# Chuyển sang Orchestrator (để điều phối end-to-end workflow)
.\switch-role.ps1 orchestrator
```

### Phương Pháp 2: Chuyển đổi thủ công

1. Backup file `.cursorrules` hiện tại (nếu có):
   ```powershell
   Copy-Item .cursorrules .cursorrules.backup
   ```

2. Copy file vai trò cần dùng thành `.cursorrules`:
   ```powershell
   Copy-Item docs\.cursorrules.product-owner .cursorrules
   ```

## 🔄 Quy Trình Phát Triển Phần Mềm

### ⭐ Phương Pháp End-to-End với Orchestrator (Khuyến nghị)

Sử dụng Orchestrator để tự động hóa toàn bộ quy trình:

```powershell
# Chạy script tự động
.\orchestrate-feature.ps1 -FeatureName "tên-tính-năng" -Description "Mô tả tính năng"
```

Script sẽ tự động:
1. Chuyển đổi qua tất cả các role theo thứ tự
2. Tạo workflow summary document
3. Track progress và deliverables
4. Tạo traceability links

**Xem chi tiết**: [docs/workflows/README.md](docs/workflows/README.md)

### Phương Pháp Thủ Công (Từng bước riêng lẻ)

### Bước 1: Product Owner
```powershell
.\switch-role.ps1 product-owner
```
**Nhiệm vụ:**
- Liệt kê các epic và tính năng chính
- Định nghĩa user stories
- Ưu tiên hóa features

**Prompt ví dụ:**
```
Với vai trò Product Owner, hãy liệt kê các epic và tính năng chính 
của hệ thống DigiERP dựa trên file BRD-Overall_v4.md
```

### Bước 2: Business Analyst
```powershell
.\switch-role.ps1 business-analyst
```
**Nhiệm vụ:**
- Phân tích chi tiết requirements
- Tạo use cases
- Xác định business rules

**Prompt ví dụ:**
```
Với vai trò Business Analyst, hãy phân tích chi tiết epic "Quản lý Kho Hàng" 
và tạo các user stories với acceptance criteria đầy đủ
```

### Bước 3: Database Engineer
```powershell
.\switch-role.ps1 database-engineer
```
**Nhiệm vụ:**
- Thiết kế database schema
- Tạo migration scripts
- Đảm bảo ACID properties

**Prompt ví dụ:**
```
Với vai trò Database Engineer, hãy thiết kế database schema cho module 
"Quản lý Kho Hàng" đảm bảo ACID properties và best practices
```

### Bước 4: Fullstack Developer
```powershell
.\switch-role.ps1 fullstack-developer
```
**Nhiệm vụ:**
- Implement backend (NestJS)
- Implement frontend (Next.js)
- Tích hợp API

**Prompt ví dụ:**
```
Với vai trò Fullstack Developer, hãy implement tính năng "Quản lý Kho Hàng" 
theo architecture đã định, sử dụng NestJS cho backend và Next.js cho frontend
```

### Bước 5: Automation Tester
```powershell
.\switch-role.ps1 automation-tester
```
**Nhiệm vụ:**
- Viết Playwright tests
- Chạy và phân tích test results
- Báo cáo bugs

**Prompt ví dụ:**
```
Với vai trò Automation Tester, hãy viết Playwright tests cho tính năng 
"Quản lý Kho Hàng" bao gồm happy path và edge cases
```

### Bước 6: Security Tester
```powershell
.\switch-role.ps1 security-tester
```
**Nhiệm vụ:**
- Kiểm tra lỗ hổng bảo mật
- Test authentication/authorization
- Tạo security report

**Prompt ví dụ:**
```
Với vai trò Security Tester, hãy kiểm tra tính năng "Quản lý Kho Hàng" 
về các lỗ hổng: SQL injection, XSS, authentication, authorization
```

### Bước 7: DevOps
```powershell
.\switch-role.ps1 devops
```
**Nhiệm vụ:**
- Tạo Dockerfile và docker-compose
- Deploy lên môi trường UAT
- Monitor deployment

**Prompt ví dụ:**
```
Với vai trò DevOps, hãy tạo Dockerfile và docker-compose config để 
deploy tính năng này lên môi trường UAT
```

## 📁 Cấu Trúc File

```
.
├── .cursorrules                    # File active (được tạo tự động ở thư mục gốc)
├── .cursorrules.backup             # Backup file (tự động tạo ở thư mục gốc)
├── docs\
│   ├── .cursorrules.product-owner      # Rules cho Product Owner
│   ├── .cursorrules.business-analyst   # Rules cho Business Analyst
│   ├── .cursorrules.database-engineer  # Rules cho Database Engineer
│   ├── .cursorrules.fullstack-developer # Rules cho Fullstack Developer
│   ├── .cursorrules.automation-tester  # Rules cho Automation Tester
│   ├── .cursorrules.security-tester    # Rules cho Security Tester
│   ├── .cursorrules.devops             # Rules cho DevOps
│   ├── .cursorrules.orchestrator       # Rules cho Orchestrator (⭐ MỚI)
│   └── workflows\                     # Workflow summaries (⭐ MỚI)
│       ├── README.md
│       ├── workflow-template.md
│       └── [feature-name]-workflow-summary.md
├── switch-role.ps1                 # Script chuyển đổi vai trò
├── orchestrate-feature.ps1          # Script orchestrate end-to-end workflow (⭐ MỚI)
└── README-CURSOR-ROLES.md          # File này
```

## 💡 Tips

1. **Sử dụng Orchestrator cho tính năng mới**: Dùng `.\orchestrate-feature.ps1` để tự động hóa toàn bộ quy trình
2. **Luôn backup**: Script tự động backup `.cursorrules` hiện tại trước khi chuyển đổi
3. **Kiểm tra vai trò hiện tại**: Dùng `.\switch-role.ps1 list` để xem vai trò đang active
4. **Context switching**: Mỗi vai trò có context và nhiệm vụ riêng, chuyển đổi khi cần
5. **Documentation**: Mỗi vai trò tạo output trong thư mục `/docs/[role-name]/`
6. **Workflow tracking**: Xem workflow summaries trong `/docs/workflows/` để track progress

## 🔍 Kiểm Tra Vai Trò Hiện Tại

```powershell
# Xem tất cả vai trò và vai trò đang active
.\switch-role.ps1 list
```

## ⚠️ Lưu Ý

- File `.cursorrules` là file active mà Cursor AI đọc
- Mỗi lần chuyển đổi, file cũ được backup vào `.cursorrules.backup`
- Có thể có nhiều chat sessions trong Cursor, mỗi session có thể dùng vai trò khác nhau (bằng cách chuyển đổi file)

## 📚 Tài Liệu Tham Khảo

- **Workflows**: [docs/workflows/README.md](docs/workflows/README.md) - Hướng dẫn sử dụng Orchestrator và workflows
- **BRD**: `BRD-Overall_v4.md`
- **Technical Architecture**: `Technical-Architecture_v4.md` hoặc `docs/architecture/Technical-Architecture.md`
- **Database Architecture**: `Database-Architect_v4.md` hoặc `docs/database-engineer/Database-Architecture.md`

