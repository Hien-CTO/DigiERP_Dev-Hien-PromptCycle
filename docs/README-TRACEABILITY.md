# Traceability & Mapping Documentation - DigiERP System

## 📋 Tổng Quan

Thư mục này chứa các tài liệu về traceability và mapping giữa các artifacts trong hệ thống DigiERP.

## 📁 Các File Traceability

### 1. [Traceability Matrix](./traceability-matrix.md)

Mapping đầy đủ từ Epic → Features → User Stories → Use Cases → Business Rules → Services → Database Tables.

**Mục đích:**
- Impact Analysis: Xác định ảnh hưởng khi thay đổi requirements
- Coverage Tracking: Đảm bảo mọi requirement được implement
- Dependency Management: Hiểu dependencies giữa components
- Testing Traceability: Map test cases với requirements

### 2. [Service Mapping](./service-mapping.md)

Mapping chi tiết giữa Epic/Features và các Microservices.

**Mục đích:**
- Xác định service nào implement feature nào
- Hiểu service responsibilities
- Quản lý service dependencies
- Impact analysis khi thay đổi service

### 3. [Database Mapping](./database-mapping.md)

Mapping chi tiết giữa Epic/Features và Database Tables.

**Mục đích:**
- Xác định tables nào phục vụ feature nào
- Hiểu data model cho mỗi epic
- Impact analysis khi thay đổi schema
- Migration planning

### 4. [Dependencies](./dependencies.md)

Mô tả các dependencies giữa Epic, Features, Services, và Database Tables.

**Mục đích:**
- Hiểu feature dependencies (Feature A phụ thuộc Feature B)
- Hiểu service dependencies
- Hiểu data flow giữa services
- Impact analysis khi thay đổi

## 🔗 Cách Sử Dụng

### 1. Impact Analysis

Khi có thay đổi requirement:
1. Tìm Epic/Feature trong [Traceability Matrix](./traceability-matrix.md)
2. Xem các Services, Database Tables, Use Cases liên quan
3. Xác định tất cả components cần update
4. Check dependencies trong [Dependencies](./dependencies.md)

### 2. Coverage Tracking

Đảm bảo mọi requirement được implement:
1. Check Epic → Features → User Stories trong [Traceability Matrix](./traceability-matrix.md)
2. Verify Use Cases đã được tạo
3. Verify Business Rules đã được document
4. Verify Services đã implement trong [Service Mapping](./service-mapping.md)
5. Verify Database Tables đã được tạo trong [Database Mapping](./database-mapping.md)

### 3. Service Development

Khi implement service:
1. Xem [Service Mapping](./service-mapping.md) để biết service responsibilities
2. Check dependencies trong [Dependencies](./dependencies.md)
3. Xem [Database Mapping](./database-mapping.md) để biết tables cần thiết
4. Reference [Traceability Matrix](./traceability-matrix.md) để đảm bảo coverage

### 4. Database Design

Khi thiết kế database:
1. Xem [Database Mapping](./database-mapping.md) để biết tables cho epic/feature
2. Check relationships trong [Database Mapping](./database-mapping.md)
3. Verify với [Traceability Matrix](./traceability-matrix.md) để đảm bảo đầy đủ

## 📊 Cấu Trúc Traceability

```
Epic (EPIC-XXX)
  └── Feature (FEAT-XXX-YYY)
      └── User Story (US-XXX-YYY-ZZZ)
          └── Use Case (UC-XXX-YYY-ZZZ)
              └── Business Rule (BR-XXX-YYY-ZZZ)
                  └── Service (service-name)
                      └── Database Tables
                          └── API Endpoints
```

## 🔍 Quick Links

- **All Epics**: [Product Owner Documents](./product-owner/)
- **Use Cases**: [Business Analyst Documents](./business-analyst/)
- **Traceability Matrix**: [Traceability Matrix](./traceability-matrix.md)
- **Service Mapping**: [Service Mapping](./service-mapping.md)
- **Database Mapping**: [Database Mapping](./database-mapping.md)
- **Dependencies**: [Dependencies](./dependencies.md)

## 📝 Ghi Chú

- Tất cả các file epic trong `product-owner/` đã có links đến traceability documents
- Tất cả các file business-analyst đã có links đến traceability documents
- Các links được cập nhật tự động khi có thay đổi

---

**Last Updated**: November 2025  
**Version**: 1.0

