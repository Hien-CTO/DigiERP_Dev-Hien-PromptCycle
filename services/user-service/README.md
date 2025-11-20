# User Service - DigiERP

User Management and Authentication Service for DigiERP system built with NestJS, TypeScript, and Clean Architecture.

## 🏗️ Architecture

This service follows Clean Architecture principles with the following layers:

- **Domain Layer**: Business entities, repositories interfaces, and domain services
- **Application Layer**: Use cases, DTOs, and application services
- **Infrastructure Layer**: Database repositories, external services, and configurations
- **Presentation Layer**: Controllers, guards, middleware, and filters

### 🎯 Architecture Logic Flow

The service implements a sophisticated authorization system using Role-Based Access Control (RBAC) with the following logical flow:

#### 1. **Request Flow Architecture**
```
HTTP Request → Controller → Guard → Use Case → Domain Service → Repository → Database
     ↓              ↓         ↓         ↓           ↓            ↓
  Validation   Authorization  Business  Domain    Data Access  Persistence
              & Security     Logic     Rules
```

#### 2. **Authorization Logic Flow**
```
1. JWT Token Validation (JwtAuthGuard)
   ↓
2. Extract User Information
   ↓
3. Role & Permission Check (RbacGuard)
   ↓
4. Domain Service Validation
   ↓
5. Use Case Execution
   ↓
6. Repository Data Access
```

#### 3. **Permission System Logic**
The system uses a hierarchical permission model:
- **Resources**: System entities (user, role, permission, etc.)
- **Actions**: Operations (create, read, update, delete)
- **Permissions**: Resource:Action combinations (user:create, role:read)
- **Roles**: Collections of permissions
- **Users**: Assigned to roles

### 🔐 Authorization Example

Here's a detailed example of how authorization works in the system:

#### **Scenario**: User trying to create a new user account

```typescript
// 1. Controller Layer - Entry Point
@Controller('users')
@UseGuards(JwtAuthGuard, RbacGuard) // Global guards applied
export class UserController {
  
  @Post()
  @Permissions('user:create') // Specific permission required
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: any) {
    return this.createUserUseCase.execute(createUserDto, user.id);
  }
}
```

#### **Authorization Flow Execution**:

```typescript
// 2. JWT Authentication Guard
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload; // Attach user to request
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

// 3. RBAC Authorization Guard
@Injectable()
export class RbacGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY, [context.getHandler(), context.getClass()]
    );
    
    if (!requiredPermissions) return true;
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Check if user has required permissions
    const hasPermission = await this.checkUserPermissions(
      user.id, 
      requiredPermissions
    );
    
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }
    
    return true;
  }
  
  private async checkUserPermissions(userId: number, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      const [resource, action] = permission.split(':');
      const hasPermission = await this.permissionRepository.checkUserPermission(
        userId, 
        resource, 
        action
      );
      if (!hasPermission) return false;
    }
    return true;
  }
}
```

#### **Domain Logic Execution**:

```typescript
// 4. Use Case Layer - Business Logic
@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}
  
  async execute(createUserDto: CreateUserDto, createdBy: number): Promise<UserResponseDto> {
    // Business validation
    const existingUser = await this.userRepository.existsByUsername(createUserDto.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
    
    // Domain entity creation
    const userEntity = new UserEntity(
      0, // id will be set by database
      createUserDto.username,
      createUserDto.email,
      await bcrypt.hash(createUserDto.password, 12),
      createUserDto.firstName,
      createUserDto.lastName,
      createUserDto.phone,
      createUserDto.avatarUrl,
      true, // isActive
      false, // isVerified
      undefined, // lastLoginAt
      new Date(), // createdAt
      new Date(), // updatedAt
      createdBy, // createdBy
      createdBy  // updatedBy
    );
    
    // Persist through repository
    const createdUser = await this.userRepository.create(userEntity);
    
    return this.mapToResponseDto(createdUser);
  }
}
```

#### **Repository Layer - Data Access**:

```typescript
// 5. Repository Layer - Data Persistence
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  
  async create(user: DomainUserEntity): Promise<DomainUserEntity> {
    const userEntity = this.userRepository.create({
      username: user.username,
      email: user.email,
      password_hash: user.passwordHash,
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phone,
      avatar_url: user.avatarUrl,
      is_active: user.isActive,
      is_verified: user.isVerified,
      created_by: user.createdBy,
      updated_by: user.updatedBy,
    });
    
    const savedUser = await this.userRepository.save(userEntity);
    return this.toDomainEntity(savedUser);
  }
}
```

### 🎭 Permission Matrix Example

| Role | user:create | user:read | user:update | user:delete | role:create | role:read |
|------|-------------|-----------|-------------|-------------|-------------|-----------|
| super_admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| manager | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| user | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |

### 🔄 Complete Authorization Flow Example

```typescript
// Example: Manager trying to create a user
const request = {
  method: 'POST',
  url: '/api/v1/users',
  headers: { 'Authorization': 'Bearer <jwt_token>' },
  body: {
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  }
};

// Flow:
// 1. JwtAuthGuard validates token → extracts user info
// 2. RbacGuard checks if user has 'user:create' permission
// 3. Permission check: manager role → has user:create permission ✅
// 4. CreateUserUseCase executes business logic
// 5. UserRepository persists to database
// 6. Response returned to client
```

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-Based Access Control (RBAC)
- Permission-based authorization
- Password hashing with bcrypt
- User session management

### User Management
- User CRUD operations
- User profile management
- User activation/deactivation
- User verification system

### Role & Permission Management
- Role CRUD operations
- Permission assignment to roles
- User role assignment
- System role protection

### Security Features
- OWASP Top 10 compliance
- Input validation with class-validator
- CORS configuration
- Helmet security headers
- Rate limiting support

### API Documentation
- Swagger/OpenAPI documentation
- Comprehensive API endpoints
- Request/response examples

## 📋 Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8.0+
- Redis 6+ (optional, for session management)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd services/user-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=103.245.255.55
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=password
   DB_DATABASE=DigiERP_Dev2

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-make-it-long-and-complex
   JWT_REFRESH_EXPIRES_IN=7d

   # Application Configuration
   PORT=3001
   NODE_ENV=development
   API_PREFIX=api/v1
   ```

   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Docker
```bash
docker-compose up -d
```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user profile

### User Management
- `GET /api/v1/users` - Get all users (paginated)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Role Management
- `GET /api/v1/roles` - Get all roles (paginated)
- `GET /api/v1/roles/:id` - Get role by ID
- `POST /api/v1/roles` - Create new role
- `PUT /api/v1/roles/:id` - Update role
- `DELETE /api/v1/roles/:id` - Delete role

### Permission Management
- `GET /api/v1/permissions` - Get all permissions (paginated)
- `POST /api/v1/permissions/roles/:id/assign` - Assign permissions to role
- `POST /api/v1/permissions/users/:id/assign-roles` - Assign roles to user

## 🔐 Default Credentials

After running the initialization script, you can login with:

- **Username**: `admin`
- **Email**: `admin@digierp.com`
- **Password**: `admin123`
- **Role**: `super_admin` (full system access)

## 🧪 Testing

### Run Unit Tests
```bash
npm run test
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Run E2E Tests
```bash
npm run test:e2e
```

## 📊 Database Schema

The service uses the following main tables:

- `users` - User information
- `cat_roles` - Role definitions
- `cat_resources` - System resources
- `cat_actions` - Available actions
- `cat_permissions` - Permission definitions
- `user_roles` - User-role assignments
- `role_permissions` - Role-permission assignments

## 🔒 Security Considerations

### OWASP Top 10 Compliance

1. **A01: Broken Access Control**
   - Implemented RBAC with permission-based authorization
   - JWT token validation
   - Role and permission guards

2. **A02: Cryptographic Failures**
   - Password hashing with bcrypt (12 rounds)
   - Strong JWT secrets
   - Environment variable protection

3. **A05: Security Misconfiguration**
   - CORS configuration
   - Helmet security headers
   - Input validation

### Best Practices
- Never expose sensitive information in error messages
- Use strong, unique JWT secrets
- Implement rate limiting for authentication endpoints
- Regular security audits and dependency updates

## 📝 API Documentation

Once the service is running, you can access the Swagger documentation at:
```
http://user-service:3001/api/v1/docs
```

## 🐳 Docker Support

The service includes Docker configuration for easy deployment:

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f user-service

# Stop services
docker-compose down
```

## 🔧 Development

### 🏛️ Layer-by-Layer Architecture Logic

#### **1. Domain Layer** - Business Core
```typescript
// Domain Entity - Pure business logic
export class UserEntity {
  constructor(
    public readonly id: number,
    public readonly username: string,
    public readonly email: string,
    public readonly passwordHash: string,
    // ... other properties
  ) {}

  // Business rules encapsulated in entity
  canLogin(): boolean {
    return this.isActive && this.isVerified;
  }

  updateLastLogin(): UserEntity {
    return new UserEntity(
      this.id,
      this.username,
      this.email,
      this.passwordHash,
      // ... other properties
      new Date(), // lastLoginAt
      this.createdAt,
      new Date(), // updatedAt
      this.createdBy,
      this.id // updatedBy
    );
  }
}

// Repository Interface - Contract definition
export interface IUserRepository {
  findById(id: number): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<UserEntity>;
  update(id: number, user: Partial<UserEntity>): Promise<UserEntity | null>;
  delete(id: number): Promise<boolean>;
}

// Domain Service - Complex business logic
export class RbacDomainService {
  async checkUserPermission(userId: number, resourceId: number, actionId: number): Promise<boolean> {
    return await this.permissionRepository.checkUserPermission(userId, resourceId, actionId);
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const permissions = await this.permissionRepository.findUserPermissions(userId);
    return permissions.map(p => p.getPermissionString());
  }
}
```

#### **2. Application Layer** - Use Cases & DTOs
```typescript
// Use Case - Application business logic
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly rbacDomainService: RbacDomainService
  ) {}

  async execute(createUserDto: CreateUserDto, createdBy: number): Promise<UserResponseDto> {
    // 1. Input validation (handled by DTOs)
    // 2. Business rule validation
    const existingUser = await this.userRepository.existsByUsername(createUserDto.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // 3. Domain entity creation
    const userEntity = new UserEntity(
      0, // id will be set by database
      createUserDto.username,
      createUserDto.email,
      await bcrypt.hash(createUserDto.password, 12),
      createUserDto.firstName,
      createUserDto.lastName,
      // ... other properties
    );

    // 4. Persist through repository
    const createdUser = await this.userRepository.create(userEntity);

    // 5. Return response DTO
    return this.mapToResponseDto(createdUser);
  }
}

// DTO - Data Transfer Object
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 100)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
```

#### **3. Infrastructure Layer** - External Concerns
```typescript
// Repository Implementation - Data access
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: number): Promise<DomainUserEntity | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ? this.toDomainEntity(user) : null;
  }

  async create(user: DomainUserEntity): Promise<DomainUserEntity> {
    const userEntity = this.userRepository.create({
      username: user.username,
      email: user.email,
      password_hash: user.passwordHash,
      first_name: user.firstName,
      last_name: user.lastName,
      // ... map domain entity to database entity
    });

    const savedUser = await this.userRepository.save(userEntity);
    return this.toDomainEntity(savedUser);
  }

  private toDomainEntity(user: UserEntity): DomainUserEntity {
    return new DomainUserEntity(
      user.id,
      user.username,
      user.email,
      user.password_hash,
      user.first_name,
      user.last_name,
      // ... map database entity to domain entity
    );
  }
}

// External Service - JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: IUserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

#### **4. Presentation Layer** - API & Security
```typescript
// Controller - API endpoints
@Controller('users')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    // ... other use cases
  ) {}

  @Post()
  @Permissions('user:create')
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: any) {
    return this.createUserUseCase.execute(createUserDto, user.id);
  }
}

// Guard - Authorization logic
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionRepository: IPermissionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY, [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const hasPermission = await this.checkUserPermissions(user.id, requiredPermissions);
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

// Decorator - Metadata for authorization
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
```

### 🔄 Dependency Injection Flow

```typescript
// Module Configuration - Dependency wiring
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, UserRole, RolePermission]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController, AuthController, RoleController],
  providers: [
    // Repository implementations
    { provide: 'IUserRepository', useClass: UserRepository },
    { provide: 'IRoleRepository', useClass: RoleRepository },
    { provide: 'IPermissionRepository', useClass: PermissionRepository },
    
    // Domain services
    RbacDomainService,
    AuthDomainService,
    
    // Use cases
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    
    // Guards and strategies
    JwtAuthGuard,
    RbacGuard,
    JwtStrategy,
  ],
})
export class AppModule {}
```

### Project Structure
```
src/
├── domain/                 # Domain layer
│   ├── entities/          # Business entities
│   ├── repositories/      # Repository interfaces
│   └── services/          # Domain services
├── application/           # Application layer
│   ├── use-cases/        # Business use cases
│   ├── dtos/             # Data transfer objects
│   └── services/         # Application services
├── infrastructure/        # Infrastructure layer
│   ├── database/         # Database entities and repositories
│   └── external/         # External services
├── presentation/          # Presentation layer
│   ├── controllers/      # API controllers
│   ├── guards/           # Authentication/authorization guards
│   ├── decorators/       # Custom decorators
│   └── filters/          # Exception filters
└── shared/               # Shared utilities
```

### 🎯 Architecture Benefits

#### **1. Separation of Concerns**
- **Domain Layer**: Pure business logic, no external dependencies
- **Application Layer**: Use cases orchestrate business workflows
- **Infrastructure Layer**: Handles external concerns (database, APIs)
- **Presentation Layer**: Manages HTTP requests and responses

#### **2. Testability**
```typescript
// Easy to unit test use cases with mocked dependencies
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      existsByUsername: jest.fn(),
      create: jest.fn(),
    } as any;
    
    useCase = new CreateUserUseCase(mockUserRepository);
  });

  it('should create user successfully', async () => {
    mockUserRepository.existsByUsername.mockResolvedValue(false);
    mockUserRepository.create.mockResolvedValue(mockUser);
    
    const result = await useCase.execute(createUserDto, 1);
    
    expect(result).toBeDefined();
    expect(mockUserRepository.create).toHaveBeenCalled();
  });
});
```

#### **3. Maintainability**
- **Single Responsibility**: Each class has one reason to change
- **Open/Closed Principle**: Open for extension, closed for modification
- **Dependency Inversion**: High-level modules don't depend on low-level modules

#### **4. Security by Design**
- **Authentication**: JWT token validation at guard level
- **Authorization**: RBAC with permission-based access control
- **Input Validation**: DTOs with class-validator decorators
- **Data Protection**: Password hashing, sensitive data exclusion

#### **5. Scalability**
- **Microservice Ready**: Clear boundaries between layers
- **Database Agnostic**: Repository pattern allows database switching
- **Caching Ready**: Domain services can be easily cached
- **Event Driven**: Easy to add domain events for loose coupling

### 🔒 Security Implementation Details

#### **Authentication Flow**
```typescript
// 1. Login endpoint
POST /api/v1/auth/login
{
  "username": "admin",
  "password": "admin123"
}

// 2. JWT token generation
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900
}

// 3. Token usage in subsequent requests
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Authorization Matrix**
```typescript
// Permission checking logic
const permissionMatrix = {
  'super_admin': ['*:*'], // All permissions
  'admin': ['user:*', 'role:read', 'role:create'],
  'manager': ['user:read', 'user:create', 'user:update'],
  'user': ['user:read', 'user:update'] // Own profile only
};

// Resource-based permissions
const resourcePermissions = {
  'user': ['create', 'read', 'update', 'delete'],
  'role': ['create', 'read', 'update', 'delete'],
  'permission': ['read', 'assign']
};
```

### Code Style
- Follow TypeScript best practices
- Use dependency injection
- Implement proper error handling
- Write comprehensive tests
- Document public APIs

## 📈 Monitoring & Logging

The service includes:
- Structured logging with Winston
- Health check endpoints
- Performance monitoring
- Error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the test cases for usage examples
