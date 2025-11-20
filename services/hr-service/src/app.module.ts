import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

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
  LeaveRequest,
} from './infrastructure/database/entities';

// Configuration
import { getTypeOrmConfig } from './infrastructure/database/config/typeorm.config';

// Controllers
import { HealthController } from './presentation/controllers/health.controller';
import { EmployeeController } from './presentation/controllers/employee.controller';
import { DepartmentController } from './presentation/controllers/department.controller';
import { EmployeeStatusController } from './presentation/controllers/employee-status.controller';
import { AttendanceController } from './presentation/controllers/attendance.controller';

// Repositories
import { EmployeeRepository } from './infrastructure/database/repositories/employee.repository';
import { AttendanceRepository } from './infrastructure/database/repositories/attendance.repository';

// Services
import { AttendanceService } from './application/services/attendance.service';

// Use cases
import { CreateEmployeeUseCase } from './application/use-cases/employee/create-employee.use-case';
import { GetEmployeeUseCase } from './application/use-cases/employee/get-employee.use-case';
import { GetEmployeesUseCase } from './application/use-cases/employee/get-employees.use-case';

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
      LeaveRequest,
    ]),
    HttpModule,
  ],
  controllers: [
    HealthController,
    EmployeeController,
    DepartmentController,
    EmployeeStatusController,
    AttendanceController,
  ],
  providers: [
    EmployeeRepository,
    AttendanceRepository,
    AttendanceService,
    CreateEmployeeUseCase,
    GetEmployeeUseCase,
    GetEmployeesUseCase,
  ],
})
export class AppModule {}

