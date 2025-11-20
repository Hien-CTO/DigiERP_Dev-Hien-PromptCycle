# DigiERP - Microservices Architecture - v4

DigiERP là một hệ thống quản lý doanh nghiệp (ERP) được thiết kế đặc biệt cho các doanh nghiệp kinh doanh phụ liệu và men vi sinh trong ngành thủy sản. Hệ thống áp dụng kiến trúc microservices hiện đại, triển khai trên Docker với các công nghệ tiên tiến.

## 🏗️ Kiến trúc hệ thống

### Backend Services

1. **User Service** (Port: 3001)
   - Quản lý người dùng, vai trò và quyền
   - Xác thực và phân quyền (JWT, RBAC)
   - API endpoints: `/auth/*`, `/users/*`, `/roles/*`, `/permissions/*`

2. **Product Service** (Port: 3002)
   - Quản lý sản phẩm và danh mục
   - Tính toán giá bán (Standard, Customer, Volume pricing)
   - API endpoints: `/products/*`, `/categories/*`

3. **Sales Service** (Port: 3003)
   - Quản lý đơn hàng bán
   - Luồng tạo đơn hàng với validation và tính giá
   - API endpoints: `/orders/*`

4. **Inventory Service** (Port: 3004)
   - Quản lý tồn kho
   - Xử lý sự kiện đơn hàng để cập nhật tồn kho
   - API endpoints: `/inventory/*`

5. **Purchase Service** (Port: 3005)
   - Quản lý đơn mua hàng
   - Xử lý quy trình mua hàng và nhập kho
   - API endpoints: `/purchases/*`

6. **Customer Service** (Port: 3006)
   - Quản lý khách hàng
   - Thông tin khách hàng và lịch sử giao dịch
   - API endpoints: `/customers/*`

7. **Financial Service** (Port: 3007)
   - Quản lý tài chính và hóa đơn
   - Xử lý thanh toán và báo cáo tài chính
   - API endpoints: `/invoices/*`, `/payments/*`

8. **API Gateway** (Port: 4000)
   - Điểm truy cập chính cho tất cả API
   - Load balancing và routing
   - Authentication và rate limiting

### Frontend

- **Admin Panel** (Port: 3000)
  - Giao diện quản trị Next.js 14
  - Quản lý người dùng, vai trò, sản phẩm, đơn hàng
  - Xác thực JWT với httpOnly cookies

### Infrastructure

- **MySQL** (Port: 3306) - Database chính
- **RabbitMQ** (Port: 5672, 15672) - Message broker
- **Redis** (Port: 6379) - Cache

## 🌐 Port Mapping

| Service | Port | Description |
|---------|------|-------------|
| 🌐 Admin Panel | 3000 | Frontend Next.js |
| 🔗 API Gateway | 4000 | Main API endpoint |
| 👤 User Service | 3001 | User management |
| 📦 Product Service | 3002 | Product management |
| 💰 Sales Service | 3003 | Sales orders |
| 📋 Inventory Service | 3004 | Inventory management |
| 🛒 Purchase Service | 3005 | Purchase orders |
| 👥 Customer Service | 3006 | Customer management |
| 💳 Financial Service | 3007 | Financial management |
| 🐰 RabbitMQ | 5672, 15672 | Message broker |
| 🔴 Redis | 6379 | Cache |

## 🌐 Truy cập hệ thống

Sau khi chạy `docker-compose up -d`, bạn có thể truy cập:

- **🌐 Admin Panel**: http://localhost:3000
- **🔗 API Gateway**: http://localhost:4000
- **🐰 RabbitMQ Management**: http://localhost:15672 (admin/admin123)
- **📊 API Documentation**: http://localhost:4000/docs

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống

- Docker & Docker Compose
- Node.js 18+ (cho development)
- MySQL 8.0+
- RabbitMQ 3.8+

### Chạy với Docker Compose

```bash
# Clone repository
git clone <repository-url>
cd DigiERP_LeHuy-Dev2

# Bước 1: Tạo file .env.local từ env.example (nếu chưa có)
copy env.example .env.local  # Windows
# hoặc
cp env.example .env.local     # Linux/Mac

# Bước 2: Chỉnh sửa .env.local với các giá trị thực tế (nếu cần)

# Bước 3: Chạy tất cả services
# Cách 1: Sử dụng wrapper script (khuyến nghị - tự động tạo .env từ .env.local)
.\docker-compose.bat up -d --build  # Windows
# hoặc
./docker-compose.sh up -d --build    # Linux/Mac

# Cách 2: Tạo .env thủ công rồi chạy trực tiếp
copy .env.local .env  # Windows (chỉ cần chạy 1 lần)
docker compose up -d --build

# Cách 3: Chạy trực tiếp với flag --env-file (không khuyến nghị vì Docker Compose vẫn cần .env để resolve variables)
docker compose --env-file .env.local up -d --build

# Xem logs
docker compose logs -f

# Dừng services
docker compose down
```

**Lưu ý quan trọng:**
- Docker Compose cần đọc các biến từ `.env` để resolve các `${VARIABLE}` trong `docker-compose.yml`
- **Sử dụng wrapper script** (`docker-compose.bat` hoặc `docker-compose.sh`) để tự động load `.env.local` và tạo `.env`
- Hoặc tạo `.env` thủ công từ `.env.local` trước khi chạy `docker compose`
- File `.env` sẽ được tự động tạo từ `.env.local` mỗi khi chạy wrapper script

### Chạy từng service riêng lẻ

```bash
# User Service
cd services/user-service
npm install
npm run start:dev

# Product Service
cd services/product-service
npm install
npm run start:dev

# Sales Service
cd services/sales-service
npm install
npm run start:dev

# Inventory Service
cd services/inventory-service
npm install
npm run start:dev

# Admin Panel
cd apps/admin-panel
npm install
npm run dev
```

## 📋 Luồng tạo đơn hàng

1. **Sales Service** nhận request tạo đơn hàng
2. **Validation**: Kiểm tra khách hàng và sản phẩm
3. **Price Calculation**: Gọi Product Service để tính giá (với multi-tier pricing: Contract → Customer → Group → Volume → Standard)
4. **Save Order**: Lưu đơn hàng vào database với transaction
5. **Publish Event**: Gửi OrderCreated event qua RabbitMQ
6. **Inventory Service** nhận event và:
   - Kiểm tra tồn kho
   - Cập nhật quantity_reserved
   - Tạo inventory_movement record
   - Publish StockLevelChanged event
7. **Product Service** nhận StockLevelChanged event và cập nhật stock_status

## 🔐 Bảo mật & Best Practices

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

## 📊 API Documentation

### API Gateway (Central Documentation)
- **URL**: http://localhost:4000/api/v1/docs
- **Description**: Tổng hợp tất cả API endpoints của hệ thống
- **Features**: Authentication, Rate limiting, Service discovery

### Individual Services Documentation:
- **User Service**: http://user-service:3001/api/v1/docs
- **Product Service**: http://localhost:3002/api/v1/docs
- **Sales Service**: http://localhost:3003/api/v1/docs
- **Inventory Service**: http://localhost:3004/api/v1/docs
- **Purchase Service**: http://localhost:3005/api/v1/docs
- **Customer Service**: http://localhost:3006/api/v1/docs
- **Financial Service**: http://localhost:3007/api/v1/docs

### API Gateway Proxy Routes:
- `/api/users/*` → User Service
- `/api/products/*` → Product Service
- `/api/sales/*` → Sales Service
- `/api/inventory/*` → Inventory Service
- `/api/purchase/*` → Purchase Service
- `/api/financial/*` → Financial Service
- `/api/customers/*` → Customer Service

## 🧪 Testing

### Testing Framework
**Playwright** - End-to-end testing framework

### Test Commands

```bash
# Run all tests
npm test

# Run specific test types
npm run test:auth          # Authentication tests
npm run test:dashboard     # Dashboard tests
npm run test:products      # Products tests
npm run test:inventory     # Inventory tests
npm run test:users         # Users tests
npm run test:purchase      # Purchase tests
npm run test:sales         # Sales tests
npm run test:financial     # Financial tests
npm run test:api           # API integration tests
npm run test:e2e           # End-to-end tests

# Run tests by browser
npm run test:chromium      # Chrome/Chromium
npm run test:firefox       # Firefox
npm run test:webkit        # Safari/WebKit
npm run test:all-browsers  # All browsers

# Test utilities
npm run test:ui            # Run with UI
npm run test:headed        # Run with browser visible
npm run test:debug         # Debug mode
npm run test:report        # Show test report
```

### Test Reports
- **HTML Report**: `tests/reports/html-report/`
- **JSON Results**: `tests/reports/test-results.json`
- **JUnit XML**: `tests/reports/junit-results.xml`
- **Screenshots**: `tests/reports/screenshots/`
- **Videos**: `tests/reports/videos/`

## 📁 Cấu trúc dự án

```
DigiERP_Dev-1/
├── services/                  # Backend microservices
│   ├── user-service/          # User management service (Port: 3001)
│   ├── product-service/       # Product management service (Port: 3002)
│   ├── sales-service/         # Sales order service (Port: 3003)
│   ├── inventory-service/     # Inventory management service (Port: 3004)
│   ├── purchase-service/      # Purchase management service (Port: 3005)
│   ├── customer-service/      # Customer management service (Port: 3006)
│   ├── financial-service/     # Financial management service (Port: 3007)
│   └── api-gateway/           # API Gateway service (Port: 4000)
├── apps/                      # Frontend applications
│   └── admin-panel/           # Next.js admin frontend (Port: 3000)
├── scripts/                   # Database & deployment scripts
│   └── database/              # Database scripts
│       └── migrations/        # Database migrations
├── tests/                     # Testing framework
│   ├── config/                # Test configuration
│   ├── pages/                 # Page Object Models
│   ├── tests/                 # Test cases
│   ├── utils/                 # Test utilities
│   └── reports/               # Test reports
├── docker-compose.yml         # Docker orchestration
├── Technical-Architecture_v4.md  # Technical architecture documentation
├── BRD-Overall_v4.md         # Business requirements document
├── Database-Architect_v3.md  # Database architecture (detailed)
└── README.md                  # This file
```

## 🔧 Environment Variables

### Cấu hình tập trung từ `.env.local`

Hệ thống sử dụng **file `.env.local` duy nhất** ở thư mục root để quản lý tất cả các biến môi trường cho toàn bộ hệ thống.

#### Bước 1: Tạo file `.env.local`

**Trên Linux/Mac:**
```bash
# Sử dụng script helper
./setup-env.sh

# Hoặc copy thủ công
cp env.example .env.local
```

**Trên Windows:**
```powershell
# Sử dụng script helper
.\setup-env.bat

# Hoặc copy thủ công
copy env.example .env.local
```

#### Bước 2: Chỉnh sửa `.env.local` với các giá trị thực tế

File `.env.local` chứa tất cả các cấu hình:

```env
# Database Configuration
DB_HOST=103.245.255.55
DB_PORT=3306
DB_USERNAME=erp_user
DB_PASSWORD=Digi!passw0rd
DB_DATABASE=DigiERP_LeHuy_Dev2

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=1h

# RabbitMQ Configuration
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=admin123
RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Service Ports
USER_SERVICE_PORT=3001
PRODUCT_SERVICE_PORT=3002
SALES_SERVICE_PORT=3003
INVENTORY_SERVICE_PORT=3004
PURCHASE_SERVICE_PORT=3005
CUSTOMER_SERVICE_PORT=3006
FINANCIAL_SERVICE_PORT=3007
API_GATEWAY_PORT=4000
ADMIN_PANEL_PORT=3000

# Service URLs (Internal Docker network)
USER_SERVICE_URL=http://user-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
SALES_SERVICE_URL=http://sales-service:3003
INVENTORY_SERVICE_URL=http://inventory-service:3004
PURCHASE_SERVICE_URL=http://purchase-service:3005
CUSTOMER_SERVICE_URL=http://customer-service:3006
FINANCIAL_SERVICE_URL=http://financial-service:3007

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Environment
NODE_ENV=development
```

#### Lưu ý quan trọng:

- ⚠️ **File `.env.local` đã được ignore trong `.gitignore`** - không bao giờ commit file này lên Git
- ✅ **Tất cả services đọc từ cùng một file `.env.local`** thông qua `docker-compose.yml`
- 🔒 **Thay đổi mật khẩu và secrets** trong `.env.local` trước khi deploy production
- 📝 **File `env.example`** là template mẫu, có thể commit lên Git

### Database Configuration

Hệ thống sử dụng **chung một database** `DigiERP_LeHuy_Dev2` cho tất cả services:
- **Host**: 103.245.255.55:3306
- **User**: erp_user
- **Password**: Digi!passw0rd

Xem chi tiết tại [DATABASE_CONFIG.md](DATABASE_CONFIG.md)

## 📝 Ghi chú Quan Trọng

1. **Database**: Tất cả services sử dụng chung một database `DigiERP_LeHuy_Dev2`
2. **Environment**: Tất cả cấu hình từ file `.env.local` duy nhất ở root
3. **Architecture**: Clean Architecture cho backend, MVVP cho frontend
4. **Communication**: Synchronous (HTTP/REST) và Asynchronous (RabbitMQ)
5. **Testing**: Playwright cho E2E testing, Jest cho unit testing
6. **Security**: JWT + RBAC, password hashing, input validation
7. **Transactions**: Mọi thao tác phức tạp đều sử dụng database transactions

### Technical Details

- Tất cả services sử dụng Clean Architecture
- Database schema được tạo tự động từ TypeORM entities
- Message queuing sử dụng RabbitMQ với topic exchange
- Frontend sử dụng React Query cho data fetching
- State management sử dụng Zustand
- Multi-tier pricing system với priority: Contract → Customer → Group → Volume → Standard

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License
