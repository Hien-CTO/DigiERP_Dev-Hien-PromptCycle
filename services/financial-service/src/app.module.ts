import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { getTypeOrmConfig } from './infrastructure/database/config/typeorm.config';
import { Invoice, InvoiceItem, InvoiceType, InvoiceStatus } from './infrastructure/database/entities';

import { TypeOrmInvoiceRepository } from './infrastructure/database/repositories';

import { InvoiceRepository } from './domain/repositories/invoice.repository.interface';

import { CreateInvoiceUseCase } from './application/use-cases/invoice/create-invoice.use-case';
import { GetInvoiceUseCase } from './application/use-cases/invoice/get-invoice.use-case';
import { UpdateInvoiceUseCase } from './application/use-cases/invoice/update-invoice.use-case';
import { DeleteInvoiceUseCase } from './application/use-cases/invoice/delete-invoice.use-case';
import { GetAllInvoicesUseCase } from './application/use-cases/invoice/get-all-invoices.use-case';
import { GetPendingInvoicesUseCase } from './application/use-cases/invoice/get-pending-invoices.use-case';
import { GetOverdueInvoicesUseCase } from './application/use-cases/invoice/get-overdue-invoices.use-case';
import { SendInvoiceUseCase } from './application/use-cases/invoice/send-invoice.use-case';
import { RecordPaymentUseCase } from './application/use-cases/invoice/record-payment.use-case';

import { GetSalesOverviewUseCase } from './application/use-cases/report/get-sales-overview.use-case';
import { GetInvoiceSummaryUseCase } from './application/use-cases/report/get-invoice-summary.use-case';

import { OrderShippedConsumer } from './infrastructure/messaging/order-shipped.consumer';

import { JwtStrategy } from './infrastructure/external/jwt.strategy';

import { InvoiceController } from './presentation/controllers/invoice.controller';
import { ReportController } from './presentation/controllers/report.controller';
import { InvoiceService } from './presentation/controllers/invoice.service';
import { ReportService } from './presentation/controllers/report.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env.local',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Invoice, InvoiceItem, InvoiceType, InvoiceStatus]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') },
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [
    InvoiceController,
    ReportController,
  ],
  providers: [
    // Repositories
    TypeOrmInvoiceRepository,

    // Use Cases - Invoice
    CreateInvoiceUseCase,
    GetInvoiceUseCase,
    UpdateInvoiceUseCase,
    DeleteInvoiceUseCase,
    GetAllInvoicesUseCase,
    GetPendingInvoicesUseCase,
    GetOverdueInvoicesUseCase,
    SendInvoiceUseCase,
    RecordPaymentUseCase,

    // Use Cases - Report
    GetSalesOverviewUseCase,
    GetInvoiceSummaryUseCase,

    // Infrastructure
    OrderShippedConsumer,

    // Auth
    JwtStrategy,

    // Services
    InvoiceService,
    ReportService,
  ],
})
export class AppModule {}
