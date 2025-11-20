# DigiERP - Technical Architecture

## 1. Project Description

DigiERP là một hệ thống quản lý doanh nghiệp (ERP) được thiết kế đặc biệt cho các doanh nghiệp kinh doanh phụ liệu và men vi sinh trong ngành thủy sản. Hệ thống áp dụng kiến trúc microservices hiện đại, triển khai trên Docker với các công nghệ tiên tiến.

### Đối tượng khách hàng:
- Doanh nghiệp sản xuất phụ liệu thủy sản: Thức ăn, thuốc, hóa chất xử lý nước
- Nhà phân phối men vi sinh: Probiotics, enzyme, vi khuẩn có lợi
- Trang trại nuôi trồng thủy sản: Tôm, cá, cua, ốc
- Phòng thí nghiệm kiểm định: Chất lượng nước, bệnh tật thủy sản

### Tính năng chính:
- Quản lý sản phẩm & danh mục
- Quản lý kho hàng & tồn trữ
- Quản lý khách hàng & quan hệ (CRM)
- Quản lý đơn hàng & bán hàng
- Quản lý mua hàng & nhà cung cấp
- Quản lý tài chính
- Analytics & Business Intelligence

## 2. Technical Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **UI Components**: Radix UI
- **Form Handling**: React Hook Form + Zod
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: NestJS (Microservices)
- **Language**: TypeScript
- **Database**: MySQL 8.0
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Message Queue**: RabbitMQ
- **Cache**: Redis
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Class Validator + Class Transformer

### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **API Gateway**: Express.js
- **Monitoring**: Winston (Logging)
- **Code Quality**: ESLint + Prettier
- **Build System**: TypeScript Compiler

## 3. Kiến trúc Tổng Thể

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │   API Gateway   │    │  Microservices  │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (NestJS)      │
│   Port: 3000    │    │   Port: 4000    │    │   Ports: 3001-7 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Message Queue │
                       │   (RabbitMQ)    │
                       │   Port: 5672    │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (MySQL)       │
                       │   Port: 3306    │
                       └─────────────────┘
```

## 4. Kiến trúc MVVP cho Frontend

### Model-View-ViewModel-Presenter (MVVP) Pattern

```
apps/admin-panel/src/
├── app/                    # View Layer (Next.js App Router)
│   ├── admin/             # Admin pages
│   ├── dashboard/         # Dashboard pages
│   └── login/             # Authentication pages
├── components/            # View Components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── charts/           # Chart components
├── hooks/                # ViewModel Layer (Custom Hooks)
│   ├── use-products.ts   # Product data management
│   ├── use-inventory.ts  # Inventory data management
│   └── use-orders.ts     # Order data management
├── store/                # Model Layer (State Management)
│   └── auth.ts          # Authentication state (Zustand)
├── lib/                  # Presenter Layer (Business Logic)
│   ├── api.ts           # API client with interceptors
│   ├── react-query.tsx  # Query client configuration
│   └── utils.ts         # Utility functions
└── types/               # Type Definitions
    ├── auth.ts          # Authentication types
    ├── product.ts       # Product types
    └── order.ts         # Order types
```

### Kiến trúc MVVP Flow:
1. **View**: React components render UI
2. **ViewModel**: Custom hooks manage component state and data fetching
3. **Model**: Zustand store manages global state
4. **Presenter**: API client handles business logic and data transformation

### Key Features:
- **Server-Side Rendering**: Next.js App Router
- **Client-Side State**: Zustand for global state
- **Server State**: TanStack React Query for API data
- **Type Safety**: Full TypeScript coverage
- **Responsive Design**: Tailwind CSS with mobile-first approach

### Frontend Modules

#### 1. Quản Lý Sản Phẩm (`/admin/products`)
- **Quản lý sản phẩm**: CRUD sản phẩm, SKU, mô tả
- **Quản lý danh mục**: Hierarchical categories
- **Cài đặt sản phẩm**: Brands, Models, Units, Packaging Types
- **Giá sản phẩm**: Multi-tier pricing management

#### 2. Bán Hàng (`/admin/sales`)
- **Đơn hàng**: Tạo, xem, cập nhật đơn hàng
- **Báo giá**: Quote generation và management
- **Giao hàng**: Delivery và logistics management
- **Khách hàng**: Quản lý khách hàng, contacts, contracts

#### 3. Mua Hàng (`/admin/purchase`)
- **Đơn hàng mua**: Quản lý purchase orders
- **Yêu cầu mua hàng**: Purchase requisition workflow
- **RFQ/RFP**: Request for quotation management
- **Nhà cung cấp**: Supplier management và performance tracking

#### 4. Kho Hàng (`/admin/inventory`)
- **Tồn kho**: Stock levels, batch tracking
- **Nhập kho**: Goods receipt processing
- **Xuất kho**: Goods issue processing
- **Chuyển kho**: Inventory transfer management
- **Kiểm kê**: Inventory counting và adjustment
- **Quản lý kho**: Warehouse, area, location management

#### 5. Tài Chính (`/admin/financial`)
- **Hóa đơn**: Invoice management và tracking
- **Thanh toán**: Payment processing
- **Công nợ**: Accounts receivable và payable
- **Dòng tiền**: Cash flow management
- **Báo cáo**: Financial reporting

#### 6. Quản Lý Người Dùng (`/admin/users`)
- **Users**: User management
- **Roles**: Role management
- **Permissions**: Permission management

### Components & Hooks

**Custom Hooks** (ViewModel Layer):
- `use-products.ts` - Product data management
- `use-categories.ts` - Category management
- `use-orders.ts` - Order management
- `use-inventory.ts` - Inventory management
- `use-customers.ts` - Customer management
- `use-invoices.ts` - Invoice management
- `use-purchase-orders.ts` - Purchase order management
- `use-suppliers.ts` - Supplier management

**UI Components**:
- Reusable components từ Radix UI
- Custom components: GreenCard, GreenButton, GreenBadge
- Form components: UserForm, BrandForm, UnitForm
- Table components: BrandTable, ProductTable
- Chart components: BarChart, LineChart, PieChart

**State Management**:
- Zustand store cho authentication state
- React Query cho server state management

## 5. Kiến trúc Microservices

### Tổng quan kiến trúc:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │   API Gateway   │    │  Microservices  │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (NestJS)      │
│   Port: 3000    │    │   Port: 4000    │    │   Ports: 3001-7 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Message Queue │
                       │   (RabbitMQ)    │
                       │   Port: 5672    │
                       └─────────────────┘
```

### Các Microservices:

#### 1. User Service (Port: 3001)
- **Chức năng**: Quản lý người dùng và xác thực
- **Database Tables**: users, cat_roles, cat_resources, cat_actions, cat_permissions, user_roles, role_permissions
- **API Endpoints**: `/api/v1/auth/*`, `/api/v1/users/*`, `/api/v1/roles/*`, `/api/v1/permissions/*`
- **Features**: 
  - ✅ JWT authentication (Access token + Refresh token)
  - ✅ RBAC (Role-Based Access Control)
  - ✅ User management với audit trail
  - ✅ Password hashing với bcrypt
  - ✅ Permission-based access control
  - ✅ Resource-action permission model

#### 2. Product Service (Port: 3002)
- **Chức năng**: Quản lý sản phẩm và danh mục
- **Database Tables**: cat_product_categories, cat_unit_types, cat_units, cat_brands, cat_colors, cat_product_models, cat_product_dimensions, products, product_prices
- **API Endpoints**: `/api/v1/products/*`, `/api/v1/categories/*`, `/api/v1/products/{id}/price`, `/api/v1/brands/*`, `/api/v1/units/*`
- **Features**: 
  - ✅ Product CRUD operations
  - ✅ Category management (hierarchical)
  - ✅ Brand & Model management
  - ✅ Unit & Packaging management
  - ✅ Multi-tier pricing system:
    - Standard pricing
    - Customer-based pricing
    - Customer group pricing
    - Contract-based pricing
    - Volume-based pricing
  - ✅ Price calculation với stored procedure
  - ✅ Batch & Expiry date management
  - ✅ Product status & stock status management

#### 3. Sales Service (Port: 3003)
- **Chức năng**: Quản lý bán hàng và đơn hàng
- **Database Tables**: sales_orders, sales_order_items, quotes, quote_items, deliveries, delivery_items
- **API Endpoints**: `/api/v1/orders/*`, `/api/v1/sales/*`, `/api/v1/quotes/*`, `/api/v1/deliveries/*`
- **Features**: 
  - ✅ Order management với validation
  - ✅ Order types: RETAIL, WHOLESALE, FOC, GIFT, DEMO, CONSIGNMENT, SAMPLE, RETURN
  - ✅ Quote generation & management
  - ✅ Price calculation integration với Product Service
  - ✅ Order status tracking: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  - ✅ Credit management (credit limit checking)
  - ✅ Delivery & Logistics management
  - ✅ Event-driven integration với Inventory Service

**Luồng Tạo Đơn Hàng**:
1. Sales Service nhận request tạo đơn hàng
2. Validation: Kiểm tra khách hàng và sản phẩm
3. Credit Check: Kiểm tra hạn mức tín dụng
4. Price Calculation: Gọi Product Service để tính giá
5. Inventory Check: Kiểm tra tồn kho (tùy chọn)
6. Save Order: Lưu đơn hàng vào database
7. Publish Event: Gửi OrderCreated event qua RabbitMQ
8. Inventory Service nhận event và cập nhật tồn kho

#### 4. Inventory Service (Port: 3004)
- **Chức năng**: Quản lý kho hàng và tồn trữ
- **Database Tables**: cat_warehouses, cat_warehouse_zones, cat_aisles, cat_racks, cat_shelves, cat_positions, cat_warehouse_locations, inventory, inventory_batches, inventory_movements, goods_receipts, goods_receipt_items, goods_issues, goods_issue_items, inventory_adjustments, inventory_transfers, safety_stock_settings, reorder_points, abc_analysis, demand_forecasts
- **API Endpoints**: `/api/v1/inventory/*`, `/api/v1/warehouses/*`, `/api/v1/areas/*`, `/api/v1/goods-receipts/*`, `/api/v1/goods-issues/*`, `/api/v1/transfers/*`, `/api/v1/adjustments/*`
- **Features**: 
  - ✅ Stock management với batch tracking
  - ✅ Warehouse operations (multi-location)
  - ✅ Area & Location management (zones, aisles, racks, shelves, positions)
  - ✅ Inventory tracking với movements
  - ✅ Quantity tracking: on_hand, reserved, available
  - ✅ Goods Receipt processing từ Purchase Orders
  - ✅ Goods Issue processing cho Sales Orders
  - ✅ Inventory Transfer management (inter-warehouse)
  - ✅ Inventory Counting & Adjustment
  - ✅ Inventory Revaluation
  - ✅ Event-driven updates từ Sales Service và Purchase Service
  - ✅ Safety Stock management (planned)
  - ✅ Reorder Point automation (planned)
  - ✅ ABC Analysis (planned)
  - ✅ Demand Forecasting (planned)

#### 5. Purchase Service (Port: 3005)
- **Chức năng**: Quản lý mua hàng và nhà cung cấp
- **Database Tables**: cat_suppliers, purchase_requisitions, purchase_requisition_items, purchase_orders, purchase_order_items, goods_receipts, goods_receipt_items, rfqs, rfq_items, quality_inspections, supplier_contracts
- **API Endpoints**: `/api/v1/suppliers/*`, `/api/v1/purchase-orders/*`, `/api/v1/purchase-requisitions/*`, `/api/v1/rfqs/*`, `/api/v1/goods-receipts/*`, `/api/v1/quality-inspections/*`
- **Features**: 
  - ✅ Supplier management
  - ✅ Supplier qualification & performance tracking (planned)
  - ✅ Purchase requisition workflow với approval
  - ✅ RFQ/RFP management (planned)
  - ✅ Purchase order management với approval workflow
  - ✅ Goods receipt processing
  - ✅ Quality inspection integration (planned)
  - ✅ Invoice matching (3-way matching) (planned)
  - ✅ Supplier contract management (planned)
  - ✅ Integration với Inventory Service

#### 6. Customer Service (Port: 3006)
- **Chức năng**: Quản lý khách hàng
- **Database Tables**: cat_customer_groups, customers, customer_contacts, contracts, rfm_scores, customer_support_tickets
- **API Endpoints**: `/api/v1/customers/*`, `/api/v1/customer-groups/*`, `/api/v1/contracts/*`, `/api/v1/customer-contacts/*`
- **Features**: 
  - ✅ Customer management
  - ✅ Customer segmentation (groups)
  - ✅ Customer contacts management
  - ✅ Contract management với lifecycle
  - ✅ 360° Customer View
  - ✅ Customer status management
  - ✅ Customer audit trail
  - ✅ RFM Analysis (planned)
  - ✅ Customer Support Management (planned)
  - ✅ Integration với Sales Service và Financial Service

#### 7. Financial Service (Port: 3007)
- **Chức năng**: Quản lý tài chính và hóa đơn
- **Database Tables**: cat_chart_of_accounts, invoices, invoice_items, payments, payment_items, accounts_receivable, accounts_payable, cash_flow, credit_notes, debit_notes, taxes, tax_rates, currencies, exchange_rates
- **API Endpoints**: `/api/v1/invoices/*`, `/api/v1/payments/*`, `/api/v1/accounts-receivable/*`, `/api/v1/accounts-payable/*`, `/api/v1/cash-flow/*`, `/api/v1/financial/reports/*`
- **Features**: 
  - ✅ Invoice management (SALES, PURCHASE, CREDIT_NOTE, DEBIT_NOTE)
  - ✅ Invoice status workflow
  - ✅ Payment processing & tracking
  - ✅ Accounts Receivable management với aging analysis
  - ✅ Accounts Payable management với aging analysis
  - ✅ Cash Flow management (planned)
  - ✅ Financial Reporting (P&L, Balance Sheet, Cash Flow) (planned)
  - ✅ Credit Note & Debit Note management
  - ✅ Payment Method management
  - ✅ Tax Management (planned)
  - ✅ Multi-currency Support (planned)
  - ✅ Integration với Sales Service và Purchase Service

#### 8. HR Service (Port: 3008)
- **Chức năng**: Quản lý nhân sự, phòng ban, chức vụ, chấm công, nghỉ phép
- **Database Tables**: employees, departments, positions, employee_contracts, attendance_records, leave_types, leave_requests, leave_balances
- **API Endpoints**: `/api/v1/employees/*`, `/api/v1/departments/*`, `/api/v1/positions/*`, `/api/v1/contracts/*`, `/api/v1/attendance/*`, `/api/v1/leave-requests/*`, `/api/v1/leave-balances/*`
- **Features**: 
  - ✅ Employee management với profile đầy đủ
  - ✅ Employee-User integration (one-to-one relationship)
  - ✅ Department management với hierarchical structure
  - ✅ Position management với levels
  - ✅ Contract management với lifecycle (Draft → Active → Expired → Renewed)
  - ✅ Attendance management với check-in/check-out
  - ✅ Working hours và overtime calculation
  - ✅ Leave management với multiple leave types
  - ✅ Leave request workflow với approval
  - ✅ Leave balance tracking per employee per year
  - ✅ Employee status management (Active, Inactive, On Leave, Terminated)
  - ✅ Role and permission assignment through User Service
  - ✅ Employee self-service (planned)
  - ✅ HR Reporting (planned)
  - ✅ Integration với User Service cho authentication và authorization
  - ✅ Integration với Financial Service cho payroll (planned)

**Luồng Employee-User Integration**:
1. HR Service tạo employee record
2. HR Service hoặc User Service tạo user account
3. HR Service link employee với user account (one-to-one)
4. HR Service assign roles và permissions cho user account
5. Employee có thể login và access system với proper authorization
6. Employee status changes tự động sync với user account status

**Luồng Attendance Recording**:
1. Employee check-in qua mobile/web app
2. HR Service ghi nhận check-in time và location (GPS)
3. System tính toán late status nếu check-in > 9:00 AM
4. Employee check-out
5. System tính toán:
   - Working hours = Check-out - Check-in - Break time
   - Overtime hours = Working hours - 8 (nếu > 0)
   - Early leave status nếu check-out < 5:00 PM
6. Manager hoặc HR Manager approve attendance record
7. Attendance data được sử dụng cho payroll calculation

**Luồng Leave Request**:
1. Employee tạo leave request với start date, end date, leave type
2. System validate:
   - Leave balance đủ
   - Không trùng với requests khác
   - Start date >= current date
3. System tạo request với status = PENDING
4. Manager nhận notification và review
5. Manager approve hoặc reject
6. Nếu approved:
   - Leave balance tự động trừ đi
   - Request status = APPROVED
7. Employee nhận notification về kết quả

### Giao tiếp giữa các services:

#### Synchronous Communication (API Gateway)
- **Protocol**: HTTP/REST
- **Authentication**: JWT Bearer Token
- **Rate Limiting**: Express Rate Limit
- **Caching**: Redis (planned)

#### Asynchronous Communication (Message Queue)
- **Protocol**: AMQP (RabbitMQ)
- **Events**: 
  - OrderCreated (Sales → Inventory)
  - StockUpdated (Inventory → Sales)
  - InvoiceGenerated (Financial → Sales)
  - GoodsReceiptCreated (Purchase → Inventory)
  - PaymentReceived (Financial → Customer)
- **Pattern**: Event-driven architecture
- **Reliability**: Message persistence and acknowledgment

## 6. Kiến trúc CLEAN Architect cho Backend

### Cấu trúc Clean Architecture:

```
services/[service-name]/src/
├── domain/                    # Domain Layer (Business Logic)
│   ├── entities/             # Domain Entities
│   │   ├── user.entity.ts    # Pure business objects
│   │   └── product.entity.ts
│   ├── repositories/         # Repository Interfaces
│   │   ├── user.repository.interface.ts
│   │   └── product.repository.interface.ts
│   └── services/             # Domain Services
│       ├── auth.domain.service.ts
│       └── rbac.domain.service.ts
├── application/              # Application Layer (Use Cases)
│   ├── dtos/                # Data Transfer Objects
│   │   ├── auth.dto.ts
│   │   └── user.dto.ts
│   └── use-cases/           # Business Use Cases
│       ├── auth/
│       │   ├── login.use-case.ts
│       │   └── refresh-token.use-case.ts
│       └── user/
│           ├── create-user.use-case.ts
│           └── get-user.use-case.ts
├── infrastructure/          # Infrastructure Layer (External Concerns)
│   ├── database/           # Database Implementation
│   │   ├── config/
│   │   │   └── typeorm.config.ts
│   │   ├── entities/       # TypeORM Entities
│   │   │   ├── user.entity.ts
│   │   │   └── product.entity.ts
│   │   └── repositories/   # Repository Implementation
│   │       ├── user.repository.ts
│   │       └── product.repository.ts
│   └── external/           # External Services
│       └── jwt.strategy.ts
└── presentation/           # Presentation Layer (Controllers)
    ├── controllers/        # REST Controllers
    │   ├── auth.controller.ts
    │   └── user.controller.ts
    ├── decorators/         # Custom Decorators
    │   ├── current-user.decorator.ts
    │   └── roles.decorator.ts
    └── guards/            # Authentication Guards
        ├── jwt-auth.guard.ts
        └── rbac.guard.ts
```

### Dependency Flow:
```
Presentation → Application → Domain ← Infrastructure
     ↓              ↓           ↑           ↑
Controllers → Use Cases → Entities ← Repositories
     ↓              ↓           ↑           ↑
   HTTP → Business Logic → Domain Rules ← Database
```

### Key Principles:
1. **Dependency Inversion**: High-level modules don't depend on low-level modules
2. **Separation of Concerns**: Each layer has a single responsibility
3. **Testability**: Easy to unit test with dependency injection
4. **Maintainability**: Changes in one layer don't affect others
5. **Scalability**: Easy to add new features and modify existing ones

### Dependency Injection:
```typescript
@Module({
  providers: [
    // Repositories
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    // Use Cases
    LoginUseCase,
    CreateUserUseCase,
    // Domain Services
    AuthDomainService,
    RbacDomainService,
  ],
})
export class AppModule {}
```

## 7. API Gateway

### Architecture

**Port**: 4000

**Chức năng**:
- Điểm truy cập chính cho tất cả API
- Authentication & Authorization
- Rate limiting
- Request routing & proxying
- Service discovery

### Route Mapping

**Authentication Routes** (`/api/auth`):
- `POST /api/auth/login` → User Service
- `POST /api/auth/refresh` → User Service
- `GET /api/auth/me` → User Service
- `POST /api/auth/logout` → User Service

**User Management** (`/api/users`):
- `GET /api/users` → User Service
- `POST /api/users` → User Service
- `GET /api/users/:id` → User Service
- `PUT /api/users/:id` → User Service
- `DELETE /api/users/:id` → User Service
- `GET /api/users/:id/roles` → User Service
- `GET /api/users/:id/roles-permissions` → User Service

**Role Management** (`/api/roles`):
- `GET /api/roles` → User Service
- `POST /api/roles` → User Service
- `GET /api/roles/:id` → User Service
- `PUT /api/roles/:id` → User Service
- `DELETE /api/roles/:id` → User Service
- `GET /api/roles/:id/permissions` → User Service

**Permission Management** (`/api/permissions`):
- `GET /api/permissions` → User Service
- `POST /api/permissions` → User Service
- `PUT /api/permissions/:id` → User Service
- `DELETE /api/permissions/:id` → User Service

**Other Services**:
- `/api/products/*` → Product Service
- `/api/sales/*` → Sales Service
- `/api/inventory/*` → Inventory Service
- `/api/purchase/*` → Purchase Service
- `/api/financial/*` → Financial Service
- `/api/customers/*` → Customer Service
- `/api/hr/*` → HR Service

### Security Features

- ✅ JWT authentication middleware
- ✅ RBAC (Role-Based Access Control)
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Error handling middleware
- ✅ Request logging

## 8. Danh sách các link API Swagger của từng services

### API Gateway (Central Documentation)
- **URL**: `http://localhost:4000/api/v1/docs`
- **Description**: Tổng hợp tất cả API endpoints của hệ thống
- **Features**: Authentication, Rate limiting, Service discovery

### Individual Services Documentation:

#### 1. User Service
- **URL**: `http://user-service:3001/api/v1/docs`
- **Endpoints**: 
  - Authentication: `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/me`
  - User Management: `/api/v1/users/*`
  - Role Management: `/api/v1/roles/*`
  - Permission Management: `/api/v1/permissions/*`

#### 2. Product Service
- **URL**: `http://localhost:3002/api/v1/docs`
- **Endpoints**:
  - Products: `/api/v1/products/*`
  - Categories: `/api/v1/categories/*`
  - Pricing: `/api/v1/products/{id}/price`
  - Brands: `/api/v1/brands/*`
  - Units: `/api/v1/units/*`

#### 3. Sales Service
- **URL**: `http://localhost:3003/api/v1/docs`
- **Endpoints**:
  - Orders: `/api/v1/orders/*`
  - Sales: `/api/v1/sales/*`
  - Quotes: `/api/v1/quotes/*`
  - Deliveries: `/api/v1/deliveries/*`

#### 4. Inventory Service
- **URL**: `http://localhost:3004/api/v1/docs`
- **Endpoints**:
  - Inventory: `/api/v1/inventory/*`
  - Warehouses: `/api/v1/warehouses/*`
  - Areas: `/api/v1/areas/*`
  - Goods Receipts: `/api/v1/goods-receipts/*`
  - Goods Issues: `/api/v1/goods-issues/*`
  - Transfers: `/api/v1/transfers/*`
  - Adjustments: `/api/v1/adjustments/*`

#### 5. Purchase Service
- **URL**: `http://localhost:3005/api/v1/docs`
- **Endpoints**:
  - Suppliers: `/api/v1/suppliers/*`
  - Purchase Orders: `/api/v1/purchase-orders/*`
  - Purchase Requisitions: `/api/v1/purchase-requisitions/*`
  - RFQs: `/api/v1/rfqs/*`
  - Goods Receipts: `/api/v1/goods-receipts/*`
  - Quality Inspections: `/api/v1/quality-inspections/*`

#### 6. Customer Service
- **URL**: `http://localhost:3006/api/v1/docs`
- **Endpoints**:
  - Customers: `/api/v1/customers/*`
  - Customer Groups: `/api/v1/customer-groups/*`
  - Contracts: `/api/v1/contracts/*`
  - Customer Contacts: `/api/v1/customer-contacts/*`

#### 7. Financial Service
- **URL**: `http://localhost:3007/api/v1/docs`
- **Endpoints**:
  - Invoices: `/api/v1/invoices/*`
  - Payments: `/api/v1/payments/*`
  - Accounts Receivable: `/api/v1/accounts-receivable/*`
  - Accounts Payable: `/api/v1/accounts-payable/*`
  - Cash Flow: `/api/v1/cash-flow/*`
  - Financial Reports: `/api/v1/financial/reports/*`

#### 8. HR Service
- **URL**: `http://localhost:3008/api/v1/docs`
- **Endpoints**:
  - Employees: `/api/v1/employees/*`
  - Departments: `/api/v1/departments/*`
  - Positions: `/api/v1/positions/*`
  - Contracts: `/api/v1/contracts/*`
  - Attendance: `/api/v1/attendance/*`
  - Leave Requests: `/api/v1/leave-requests/*`
  - Leave Balances: `/api/v1/leave-balances/*`
  - Leave Types: `/api/v1/leave-types/*`

### API Gateway Proxy Routes:
- **Users**: `/api/users/*` → User Service
- **Products**: `/api/products/*` → Product Service
- **Sales**: `/api/sales/*` → Sales Service
- **Inventory**: `/api/inventory/*` → Inventory Service
- **Purchase**: `/api/purchase/*` → Purchase Service
- **Financial**: `/api/financial/*` → Financial Service
- **Customers**: `/api/customers/*` → Customer Service
- **HR**: `/api/hr/*` → HR Service

## 9. Infrastructure & DevOps

### Docker Compose Services

**Services**:
1. **rabbitmq** - Message broker (Port: 5672, 15672)
2. **redis** - Cache (Port: 6379)
3. **user-service** - Port 3001
4. **product-service** - Port 3002
5. **sales-service** - Port 3003
6. **inventory-service** - Port 3004
7. **purchase-service** - Port 3005
8. **financial-service** - Port 3007
9. **customer-service** - Port 3006
10. **hr-service** - Port 3008
11. **api-gateway** - Port 4000
12. **admin-panel** - Port 3000

### Environment Configuration

**File**: `.env.local` (root directory)

**Key Variables**:
- Database connection: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- JWT: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`
- RabbitMQ: `RABBITMQ_URL`, `RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS`
- Redis: `REDIS_HOST`, `REDIS_PORT`
- Service URLs: `USER_SERVICE_URL`, `PRODUCT_SERVICE_URL`, `HR_SERVICE_URL`, etc.
- Frontend: `FRONTEND_URL`, `NEXT_PUBLIC_API_URL`

### Deployment

**Development**:
```bash
# Sử dụng wrapper script
.\docker-compose.bat up -d --build  # Windows
./docker-compose.sh up -d --build    # Linux/Mac
```

**Production**:
- Docker Compose với environment variables
- Health checks cho tất cả services
- Volume persistence cho RabbitMQ và Redis

## 10. Security & Best Practices

### Security Features

1. **Authentication**:
   - JWT tokens (Access + Refresh)
   - Password hashing với bcrypt
   - Token expiration và refresh mechanism

2. **Authorization**:
   - RBAC (Role-Based Access Control)
   - Permission-based access control
   - Resource-action permission model

3. **Data Protection**:
   - Input validation với class-validator
   - SQL injection prevention (TypeORM)
   - XSS protection
   - CORS configuration

4. **Audit Trail**:
   - Winston logging
   - User action tracking
   - Created/Updated by tracking

### Best Practices

1. **Code Organization**:
   - Clean Architecture cho backend
   - MVVP pattern cho frontend
   - Separation of concerns
   - Dependency injection

2. **Database**:
   - Transactions cho complex operations
   - Foreign key constraints
   - Indexes cho performance
   - Normalized schema (3NF)

3. **API Design**:
   - RESTful API conventions
   - Consistent error handling
   - API versioning
   - Swagger documentation

4. **Error Handling**:
   - Global error handler
   - Standardized error responses
   - Proper HTTP status codes
   - Error logging

5. **Performance**:
   - Database query optimization
   - Caching với Redis (planned)
   - Lazy loading
   - Pagination

---

**Tài liệu này được cập nhật thường xuyên để phản ánh kiến trúc hiện tại của hệ thống DigiERP.**

**Version**: 1.0  
**Last Updated**: November 2025

