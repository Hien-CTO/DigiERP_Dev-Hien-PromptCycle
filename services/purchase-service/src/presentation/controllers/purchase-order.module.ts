import { Module } from '@nestjs/common';
import { SimplePurchaseOrderController } from './simple-purchase-order.controller';

@Module({
  controllers: [SimplePurchaseOrderController],
})
export class PurchaseOrderModule {}
