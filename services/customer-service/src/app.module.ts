import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { getTypeOrmConfig } from './infrastructure/database/config/typeorm.config';
import {
  CustomerGroup,
  Customer,
  Contract,
  CustomerContact,
  PricingPolicy,
  PricingPolicyDetail,
} from './infrastructure/database/entities';

import {
  TypeOrmCustomerGroupRepository,
  TypeOrmCustomerRepository,
  TypeOrmContractRepository,
  TypeOrmCustomerContactRepository,
  TypeOrmPricingPolicyRepository,
  TypeOrmPricingPolicyDetailRepository,
} from './infrastructure/database/repositories';

import { JwtStrategy } from './infrastructure/external/jwt.strategy';

import { CustomerGroupController } from './presentation/controllers/customer-group.controller';
import { CustomerController } from './presentation/controllers/customer.controller';
import { CustomerContactController } from './presentation/controllers/customer-contact.controller';
import { PricingPolicyController } from './presentation/controllers/pricing-policy.controller';

import { CreateCustomerGroupUseCase } from './application/use-cases/customer-group/create-customer-group.use-case';
import { GetCustomerGroupUseCase } from './application/use-cases/customer-group/get-customer-group.use-case';
import { GetAllCustomerGroupsUseCase } from './application/use-cases/customer-group/get-all-customer-groups.use-case';
import { UpdateCustomerGroupUseCase } from './application/use-cases/customer-group/update-customer-group.use-case';
import { DeleteCustomerGroupUseCase } from './application/use-cases/customer-group/delete-customer-group.use-case';

import { CreateCustomerContactUseCase } from './application/use-cases/customer-contact/create-customer-contact.use-case';
import { UpdateCustomerContactUseCase } from './application/use-cases/customer-contact/update-customer-contact.use-case';
import { GetCustomerContactUseCase } from './application/use-cases/customer-contact/get-customer-contact.use-case';
import { GetCustomerContactsUseCase } from './application/use-cases/customer-contact/get-customer-contacts.use-case';
import { DeleteCustomerContactUseCase } from './application/use-cases/customer-contact/delete-customer-contact.use-case';

import { CreateCustomerUseCase } from './application/use-cases/customer/create-customer.use-case';
import { GetCustomerUseCase } from './application/use-cases/customer/get-customer.use-case';
import { GetAllCustomersUseCase } from './application/use-cases/customer/get-all-customers.use-case';
import { SearchCustomersUseCase } from './application/use-cases/customer/search-customers.use-case';
import { UpdateCustomerUseCase } from './application/use-cases/customer/update-customer.use-case';
import { DeleteCustomerUseCase } from './application/use-cases/customer/delete-customer.use-case';
import { GetCustomerStatisticsUseCase } from './application/use-cases/customer/get-customer-statistics.use-case';

import { CreatePricingPolicyUseCase } from './application/use-cases/pricing-policy/create-pricing-policy.use-case';
import { GetPricingPolicyUseCase } from './application/use-cases/pricing-policy/get-pricing-policy.use-case';
import { GetPricingPoliciesUseCase } from './application/use-cases/pricing-policy/get-pricing-policies.use-case';
import { UpdatePricingPolicyUseCase } from './application/use-cases/pricing-policy/update-pricing-policy.use-case';
import { DeletePricingPolicyUseCase } from './application/use-cases/pricing-policy/delete-pricing-policy.use-case';
import { ProductPriceService } from './application/services/product-price.service';

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
      CustomerGroup,
      Customer,
      Contract,
      CustomerContact,
      PricingPolicy,
      PricingPolicyDetail,
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
    CustomerGroupController,
    CustomerController,
    CustomerContactController,
    PricingPolicyController,
  ],
  providers: [
    // Repositories - Register classes directly
    // Use cases will inject these classes directly instead of using tokens
    TypeOrmCustomerGroupRepository,
    TypeOrmCustomerRepository,
    TypeOrmContractRepository,
    TypeOrmCustomerContactRepository,
    TypeOrmPricingPolicyRepository,
    TypeOrmPricingPolicyDetailRepository,

    // Use Cases - Customer Contact
    CreateCustomerContactUseCase,
    UpdateCustomerContactUseCase,
    GetCustomerContactUseCase,
    GetCustomerContactsUseCase,
    DeleteCustomerContactUseCase,

    // Use Cases - Customer Group
    CreateCustomerGroupUseCase,
    GetCustomerGroupUseCase,
    GetAllCustomerGroupsUseCase,
    UpdateCustomerGroupUseCase,
    DeleteCustomerGroupUseCase,

    // Use Cases - Customer
    CreateCustomerUseCase,
    GetCustomerUseCase,
    GetAllCustomersUseCase,
    SearchCustomersUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    GetCustomerStatisticsUseCase,

    // Services
    ProductPriceService,

    // Use Cases - Pricing Policy
    CreatePricingPolicyUseCase,
    GetPricingPolicyUseCase,
    GetPricingPoliciesUseCase,
    UpdatePricingPolicyUseCase,
    DeletePricingPolicyUseCase,

    // Auth
    JwtStrategy,
  ],
})
export class AppModule {}
