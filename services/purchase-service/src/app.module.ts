import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { getTypeOrmConfig } from './infrastructure/database/config/typeorm.config';
import {
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderImporter,
  PurchaseRequest,
  PurchaseRequestItem,
} from './infrastructure/database/entities';

import {
  TypeOrmSupplierRepository,
  TypeOrmPurchaseOrderRepository,
  TypeOrmPurchaseRequestRepository,
} from './infrastructure/database/repositories';

import { CreateSupplierUseCase } from './application/use-cases/supplier/create-supplier.use-case';
import { GetSupplierUseCase } from './application/use-cases/supplier/get-supplier.use-case';
import { UpdateSupplierUseCase } from './application/use-cases/supplier/update-supplier.use-case';
import { DeleteSupplierUseCase } from './application/use-cases/supplier/delete-supplier.use-case';
import { GetAllSuppliersUseCase } from './application/use-cases/supplier/get-all-suppliers.use-case';
import { GetActiveSuppliersUseCase } from './application/use-cases/supplier/get-active-suppliers.use-case';

import { CreatePurchaseOrderUseCase } from './application/use-cases/purchase-order/create-purchase-order.use-case';
import { GetPurchaseOrderUseCase } from './application/use-cases/purchase-order/get-purchase-order.use-case';
import { UpdatePurchaseOrderUseCase } from './application/use-cases/purchase-order/update-purchase-order.use-case';
import { DeletePurchaseOrderUseCase } from './application/use-cases/purchase-order/delete-purchase-order.use-case';
import { GetAllPurchaseOrdersUseCase } from './application/use-cases/purchase-order/get-all-purchase-orders.use-case';

import { CreatePurchaseRequestUseCase } from './application/use-cases/purchase-request/create-purchase-request.use-case';
import { GetPurchaseRequestUseCase } from './application/use-cases/purchase-request/get-purchase-request.use-case';
import { GetAllPurchaseRequestsUseCase } from './application/use-cases/purchase-request/get-all-purchase-requests.use-case';
import { UpdatePurchaseRequestUseCase } from './application/use-cases/purchase-request/update-purchase-request.use-case';
import { DeletePurchaseRequestUseCase } from './application/use-cases/purchase-request/delete-purchase-request.use-case';
import { SubmitPurchaseRequestUseCase } from './application/use-cases/purchase-request/submit-purchase-request.use-case';
import { ApprovePurchaseRequestUseCase } from './application/use-cases/purchase-request/approve-purchase-request.use-case';
import { RejectPurchaseRequestUseCase } from './application/use-cases/purchase-request/reject-purchase-request.use-case';
import { ConvertToPurchaseOrderUseCase } from './application/use-cases/purchase-request/convert-to-purchase-order.use-case';


import { GoodsReceivedPublisher } from './infrastructure/messaging/goods-received.publisher';

import { JwtStrategy } from './infrastructure/external/jwt.strategy';
import { RedisService } from './infrastructure/external/redis.service';

import { SupplierController } from './presentation/controllers/supplier.controller';
import { SupplierService } from './presentation/controllers/supplier.service';
import { PurchaseOrderController } from './presentation/controllers/purchase-order.controller';
import { PurchaseOrderService } from './presentation/controllers/purchase-order.service';
import { PurchaseRequestController } from './presentation/controllers/purchase-request.controller';
import { PurchaseRequestService } from './presentation/controllers/purchase-request.service';

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
    TypeOrmModule.forFeature([
      Supplier,
      PurchaseOrder,
      PurchaseOrderItem,
      PurchaseOrderImporter,
      PurchaseRequest,
      PurchaseRequestItem,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    SupplierController,
    PurchaseOrderController,
    PurchaseRequestController,
  ],
  providers: [
    // Repositories
    TypeOrmSupplierRepository,
    TypeOrmPurchaseOrderRepository,
    TypeOrmPurchaseRequestRepository,

    // Use Cases - Supplier
    CreateSupplierUseCase,
    GetSupplierUseCase,
    UpdateSupplierUseCase,
    DeleteSupplierUseCase,
    GetAllSuppliersUseCase,
    GetActiveSuppliersUseCase,

    // Use Cases - Purchase Order
    CreatePurchaseOrderUseCase,
    GetPurchaseOrderUseCase,
    UpdatePurchaseOrderUseCase,
    DeletePurchaseOrderUseCase,
    GetAllPurchaseOrdersUseCase,

    // Use Cases - Purchase Request
    CreatePurchaseRequestUseCase,
    GetPurchaseRequestUseCase,
    GetAllPurchaseRequestsUseCase,
    UpdatePurchaseRequestUseCase,
    DeletePurchaseRequestUseCase,
    SubmitPurchaseRequestUseCase,
    ApprovePurchaseRequestUseCase,
    RejectPurchaseRequestUseCase,
    ConvertToPurchaseOrderUseCase,

    // Infrastructure
    GoodsReceivedPublisher,

    // Auth
    JwtStrategy,
    RedisService,

    // Services
    SupplierService,
    PurchaseOrderService,
    PurchaseRequestService,
  ],
})
export class AppModule {}
