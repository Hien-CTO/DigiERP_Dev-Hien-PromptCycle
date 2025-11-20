import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';

import { getTypeOrmConfig } from './infrastructure/database/config/typeorm.config';
import { SalesOrder, SalesOrderItem } from './infrastructure/database/entities';
import { SalesOrderRepository, SalesOrderItemRepository } from './infrastructure/database/repositories';
import { JwtStrategy } from './infrastructure/external/jwt.strategy';
import { OrderCreatedPublisher } from './infrastructure/messaging/order-created.publisher';

import { OrderController } from './presentation/controllers/order.controller';

import { CreateOrderUseCase } from './application/use-cases/order/create-order.use-case';
import { GetOrderUseCase } from './application/use-cases/order/get-order.use-case';
import { GetOrdersUseCase } from './application/use-cases/order/get-orders.use-case';
import { UpdateOrderUseCase } from './application/use-cases/order/update-order.use-case';
import { DeleteOrderUseCase } from './application/use-cases/order/delete-order.use-case';

import { OrderCreationDomainService } from './domain/services/order-creation.domain.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env.local',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService) => getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([SalesOrder, SalesOrderItem]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    HttpModule,
  ],
  controllers: [OrderController],
  providers: [
    // Repositories
    SalesOrderRepository,
    SalesOrderItemRepository,
    // Domain Services
    OrderCreationDomainService,
    // Use Cases
    CreateOrderUseCase,
    GetOrderUseCase,
    GetOrdersUseCase,
    UpdateOrderUseCase,
    DeleteOrderUseCase,
    // External Services
    JwtStrategy,
    OrderCreatedPublisher,
  ],
})
export class AppModule {}
