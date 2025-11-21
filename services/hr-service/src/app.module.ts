import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { UserExtractorMiddleware } from './presentation/middleware/user-extractor.middleware';

// Database entities
import {
  CatEmployeeStatus,
  CatContractTypes,
  CatLeaveTypes,
  CatAttendanceTypes,
  Department,
  Position,
  Employee,
  ContractLegal,
  AttendanceRecord,
  AttendanceEditHistory,
  AttendanceConfiguration,
  AttendanceLocation,
  LeaveRequest,
  LeaveBalance,
  LeaveEntitlement,
  LeaveRequestApproval,
  LeaveRequestEditHistory,
} from './infrastructure/database/entities';

// Configuration
import { getTypeOrmConfig } from './infrastructure/database/config/typeorm.config';

// Controllers
import { HealthController } from './presentation/controllers/health.controller';
import { EmployeeController } from './presentation/controllers/employee.controller';
import { DepartmentController } from './presentation/controllers/department.controller';
import { EmployeeStatusController } from './presentation/controllers/employee-status.controller';
import { AttendanceController } from './presentation/controllers/attendance.controller';
import { LeaveController } from './presentation/controllers/leave.controller';

// Repositories
import { EmployeeRepository } from './infrastructure/database/repositories/employee.repository';
import { AttendanceRepository } from './infrastructure/database/repositories/attendance.repository';
import { AttendanceEditHistoryRepository } from './infrastructure/database/repositories/attendance-edit-history.repository';
import { AttendanceConfigurationRepository } from './infrastructure/database/repositories/attendance-configuration.repository';
import { AttendanceLocationRepository } from './infrastructure/database/repositories/attendance-location.repository';
import { LeaveRequestRepository } from './infrastructure/database/repositories/leave-request.repository';
import { LeaveBalanceRepository } from './infrastructure/database/repositories/leave-balance.repository';
import { LeaveEntitlementRepository } from './infrastructure/database/repositories/leave-entitlement.repository';
import { LeaveRequestApprovalRepository } from './infrastructure/database/repositories/leave-request-approval.repository';
import { LeaveRequestEditHistoryRepository } from './infrastructure/database/repositories/leave-request-edit-history.repository';

// Services
import { AttendanceService } from './application/services/attendance.service';
import { LeaveService } from './application/services/leave.service';

// Use cases
import { CreateEmployeeUseCase } from './application/use-cases/employee/create-employee.use-case';
import { GetEmployeeUseCase } from './application/use-cases/employee/get-employee.use-case';
import { GetEmployeesUseCase } from './application/use-cases/employee/get-employees.use-case';
import { GetAttendanceStatsUseCase } from './application/use-cases/attendance/get-attendance-stats.use-case';
import { ExportAttendanceUseCase } from './application/use-cases/attendance/export-attendance.use-case';
import { CreateLeaveRequestUseCase } from './application/use-cases/leave/create-leave-request.use-case';
import { GetLeaveRequestsUseCase } from './application/use-cases/leave/get-leave-requests.use-case';
import { GetLeaveBalanceUseCase } from './application/use-cases/leave/get-leave-balance.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '../../.env',
        '.env.local',
        '.env',
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      CatEmployeeStatus,
      CatContractTypes,
      CatLeaveTypes,
      CatAttendanceTypes,
      Department,
      Position,
      Employee,
      ContractLegal,
      AttendanceRecord,
      AttendanceEditHistory,
      AttendanceConfiguration,
      AttendanceLocation,
      LeaveRequest,
      LeaveBalance,
      LeaveEntitlement,
      LeaveRequestApproval,
      LeaveRequestEditHistory,
    ]),
    HttpModule,
  ],
  controllers: [
    HealthController,
    EmployeeController,
    DepartmentController,
    EmployeeStatusController,
    AttendanceController,
    LeaveController,
  ],
  providers: [
    UserExtractorMiddleware,
    EmployeeRepository,
    AttendanceRepository,
    AttendanceEditHistoryRepository,
    AttendanceConfigurationRepository,
    AttendanceLocationRepository,
    LeaveRequestRepository,
    LeaveBalanceRepository,
    LeaveEntitlementRepository,
    LeaveRequestApprovalRepository,
    LeaveRequestEditHistoryRepository,
    AttendanceService,
    LeaveService,
    CreateEmployeeUseCase,
    GetEmployeeUseCase,
    GetEmployeesUseCase,
    GetAttendanceStatsUseCase,
    ExportAttendanceUseCase,
    CreateLeaveRequestUseCase,
    GetLeaveRequestsUseCase,
    GetLeaveBalanceUseCase,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply UserExtractorMiddleware to all routes
    consumer.apply(UserExtractorMiddleware).forRoutes('*');
  }
}

