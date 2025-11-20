import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { typeOrmConfig } from './infrastructure/database/config/typeorm.config';
import { 
  Inventory, 
  InventoryMovement, 
  Warehouse, 
  Area,
  GoodsReceipt,
  GoodsReceiptItem,
  GoodsIssue,
  GoodsIssueItem,
  InventoryTransferRequest,
  TransferRequestItem,
  InventoryTransfer,
  TransferItem,
  InventoryCounting,
  CountingItem,
  InventoryPosting,
  PostingItem,
  InventoryRevaluation,
  RevaluationItem,
  InventoryBatch
} from './infrastructure/database/entities';
import { InventoryRepository, WarehouseRepository, AreaRepository, GoodsReceiptRepository, GoodsIssueRepository, InventoryTransferRequestRepository, InventoryTransferRepository, InventoryCountingRepository, InventoryPostingRepository, InventoryRevaluationRepository } from './infrastructure/database/repositories';
import { JwtStrategy } from './infrastructure/external/jwt.strategy';
import { OrderCreatedConsumer } from './infrastructure/messaging/order-created.consumer';
import { GoodsReceivedConsumer } from './infrastructure/messaging/goods-received.consumer';
import { StockLevelChangedPublisher } from './infrastructure/messaging/stock-level-changed.publisher';

import { InventoryController } from './presentation/controllers/inventory.controller';
import { InventorySummaryController } from './presentation/controllers/inventory-summary.controller';
import { InventoryDetailController } from './presentation/controllers/inventory-detail.controller';
import { WarehouseController } from './presentation/controllers/warehouse.controller';
import { AreaController } from './presentation/controllers/area.controller';
import { GoodsReceiptController } from './presentation/controllers/goods-receipt.controller';
import { GoodsIssueController } from './presentation/controllers/goods-issue.controller';
import { InventoryTransferRequestController } from './presentation/controllers/inventory-transfer-request.controller';
import { InventoryTransferController } from './presentation/controllers/inventory-transfer.controller';
import { InventoryCountingController } from './presentation/controllers/inventory-counting.controller';
import { InventoryPostingController } from './presentation/controllers/inventory-posting.controller';
import { InventoryRevaluationController } from './presentation/controllers/inventory-revaluation.controller';

import { GetInventoryUseCase } from './application/use-cases/inventory/get-inventory.use-case';
import { GetInventorySummaryUseCase } from './application/use-cases/inventory-summary/get-inventory-summary.use-case';
import { GetInventoryDetailUseCase } from './application/use-cases/inventory-detail/get-inventory-detail.use-case';
import { CreateWarehouseUseCase } from './application/use-cases/warehouse/create-warehouse.use-case';
import { GetWarehouseUseCase } from './application/use-cases/warehouse/get-warehouse.use-case';
import { GetWarehousesUseCase } from './application/use-cases/warehouse/get-warehouses.use-case';
import { UpdateWarehouseUseCase } from './application/use-cases/warehouse/update-warehouse.use-case';
import { DeleteWarehouseUseCase } from './application/use-cases/warehouse/delete-warehouse.use-case';
import { CreateAreaUseCase } from './application/use-cases/area/create-area.use-case';
import { GetAreaUseCase } from './application/use-cases/area/get-area.use-case';
import { GetAreasUseCase } from './application/use-cases/area/get-areas.use-case';
import { UpdateAreaUseCase } from './application/use-cases/area/update-area.use-case';
import { DeleteAreaUseCase } from './application/use-cases/area/delete-area.use-case';

import { CreateGoodsReceiptUseCase } from './application/use-cases/goods-receipt/create-goods-receipt.use-case';
import { GetGoodsReceiptUseCase } from './application/use-cases/goods-receipt/get-goods-receipt.use-case';
import { GetAllGoodsReceiptsUseCase } from './application/use-cases/goods-receipt/get-all-goods-receipts.use-case';
import { UpdateGoodsReceiptUseCase } from './application/use-cases/goods-receipt/update-goods-receipt.use-case';
import { DeleteGoodsReceiptUseCase } from './application/use-cases/goods-receipt/delete-goods-receipt.use-case';
import { VerifyGoodsReceiptUseCase } from './application/use-cases/goods-receipt/verify-goods-receipt.use-case';

import { CreateGoodsIssueUseCase } from './application/use-cases/goods-issue/create-goods-issue.use-case';
import { GetGoodsIssueUseCase } from './application/use-cases/goods-issue/get-goods-issue.use-case';
import { GetAllGoodsIssuesUseCase } from './application/use-cases/goods-issue/get-all-goods-issues.use-case';
import { UpdateGoodsIssueUseCase } from './application/use-cases/goods-issue/update-goods-issue.use-case';
import { DeleteGoodsIssueUseCase } from './application/use-cases/goods-issue/delete-goods-issue.use-case';
import { VerifyGoodsIssueUseCase } from './application/use-cases/goods-issue/verify-goods-issue.use-case';

import { CreateTransferRequestUseCase } from './application/use-cases/inventory-transfer-request/create-transfer-request.use-case';
import { GetTransferRequestUseCase } from './application/use-cases/inventory-transfer-request/get-transfer-request.use-case';
import { GetAllTransferRequestsUseCase } from './application/use-cases/inventory-transfer-request/get-all-transfer-requests.use-case';
import { UpdateTransferRequestUseCase } from './application/use-cases/inventory-transfer-request/update-transfer-request.use-case';
import { DeleteTransferRequestUseCase } from './application/use-cases/inventory-transfer-request/delete-transfer-request.use-case';
import { ApproveTransferRequestUseCase } from './application/use-cases/inventory-transfer-request/approve-transfer-request.use-case';
import { RejectTransferRequestUseCase } from './application/use-cases/inventory-transfer-request/reject-transfer-request.use-case';

import { CreateInventoryTransferUseCase } from './application/use-cases/inventory-transfer/create-inventory-transfer.use-case';
import { GetInventoryTransferUseCase } from './application/use-cases/inventory-transfer/get-inventory-transfer.use-case';
import { GetAllInventoryTransfersUseCase } from './application/use-cases/inventory-transfer/get-all-inventory-transfers.use-case';
import { UpdateInventoryTransferUseCase } from './application/use-cases/inventory-transfer/update-inventory-transfer.use-case';
import { DeleteInventoryTransferUseCase } from './application/use-cases/inventory-transfer/delete-inventory-transfer.use-case';
import { CompleteInventoryTransferUseCase } from './application/use-cases/inventory-transfer/complete-inventory-transfer.use-case';

import { CreateInventoryCountingUseCase } from './application/use-cases/inventory-counting/create-inventory-counting.use-case';
import { GetInventoryCountingUseCase } from './application/use-cases/inventory-counting/get-inventory-counting.use-case';
import { GetAllInventoryCountingsUseCase } from './application/use-cases/inventory-counting/get-all-inventory-countings.use-case';
import { UpdateInventoryCountingUseCase } from './application/use-cases/inventory-counting/update-inventory-counting.use-case';
import { DeleteInventoryCountingUseCase } from './application/use-cases/inventory-counting/delete-inventory-counting.use-case';
import { CompleteInventoryCountingUseCase } from './application/use-cases/inventory-counting/complete-inventory-counting.use-case';

import { CreateInventoryPostingUseCase } from './application/use-cases/inventory-posting/create-inventory-posting.use-case';
import { GetInventoryPostingUseCase } from './application/use-cases/inventory-posting/get-inventory-posting.use-case';
import { GetAllInventoryPostingsUseCase } from './application/use-cases/inventory-posting/get-all-inventory-postings.use-case';
import { UpdateInventoryPostingUseCase } from './application/use-cases/inventory-posting/update-inventory-posting.use-case';
import { DeleteInventoryPostingUseCase } from './application/use-cases/inventory-posting/delete-inventory-posting.use-case';
import { PostInventoryPostingUseCase } from './application/use-cases/inventory-posting/post-inventory-posting.use-case';

import { CreateInventoryRevaluationUseCase } from './application/use-cases/inventory-revaluation/create-inventory-revaluation.use-case';
import { GetInventoryRevaluationUseCase } from './application/use-cases/inventory-revaluation/get-inventory-revaluation.use-case';
import { GetAllInventoryRevaluationsUseCase } from './application/use-cases/inventory-revaluation/get-all-inventory-revaluations.use-case';
import { UpdateInventoryRevaluationUseCase } from './application/use-cases/inventory-revaluation/update-inventory-revaluation.use-case';
import { DeleteInventoryRevaluationUseCase } from './application/use-cases/inventory-revaluation/delete-inventory-revaluation.use-case';
import { PostInventoryRevaluationUseCase } from './application/use-cases/inventory-revaluation/post-inventory-revaluation.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env.local',
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([
      Inventory, 
      InventoryMovement, 
      Warehouse, 
      Area,
      GoodsReceipt,
      GoodsReceiptItem,
      GoodsIssue,
      GoodsIssueItem,
      InventoryTransferRequest,
      TransferRequestItem,
      InventoryTransfer,
      TransferItem,
      InventoryCounting,
      CountingItem,
      InventoryPosting,
      PostingItem,
      InventoryRevaluation,
      RevaluationItem,
      InventoryBatch
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [InventoryController, InventorySummaryController, InventoryDetailController, WarehouseController, AreaController, GoodsReceiptController, GoodsIssueController, InventoryTransferRequestController, InventoryTransferController, InventoryCountingController, InventoryPostingController, InventoryRevaluationController],
  providers: [
    // Repositories
    InventoryRepository,
    WarehouseRepository,
    AreaRepository,
    GoodsReceiptRepository,
    GoodsIssueRepository,
    InventoryTransferRequestRepository,
    InventoryTransferRepository,
    InventoryCountingRepository,
    InventoryPostingRepository,
    InventoryRevaluationRepository,
    // Use Cases
    GetInventoryUseCase,
    GetInventorySummaryUseCase,
    GetInventoryDetailUseCase,
    CreateWarehouseUseCase,
    GetWarehouseUseCase,
    GetWarehousesUseCase,
    UpdateWarehouseUseCase,
    DeleteWarehouseUseCase,
    CreateAreaUseCase,
    GetAreaUseCase,
    GetAreasUseCase,
    UpdateAreaUseCase,
    DeleteAreaUseCase,

    CreateGoodsReceiptUseCase,
    GetGoodsReceiptUseCase,
    GetAllGoodsReceiptsUseCase,
    UpdateGoodsReceiptUseCase,
    DeleteGoodsReceiptUseCase,
    VerifyGoodsReceiptUseCase,

    CreateGoodsIssueUseCase,
    GetGoodsIssueUseCase,
    GetAllGoodsIssuesUseCase,
    UpdateGoodsIssueUseCase,
    DeleteGoodsIssueUseCase,
    VerifyGoodsIssueUseCase,

    CreateTransferRequestUseCase,
    GetTransferRequestUseCase,
    GetAllTransferRequestsUseCase,
    UpdateTransferRequestUseCase,
    DeleteTransferRequestUseCase,
    ApproveTransferRequestUseCase,
    RejectTransferRequestUseCase,

    CreateInventoryTransferUseCase,
    GetInventoryTransferUseCase,
    GetAllInventoryTransfersUseCase,
    UpdateInventoryTransferUseCase,
    DeleteInventoryTransferUseCase,
    CompleteInventoryTransferUseCase,

    CreateInventoryCountingUseCase,
    GetInventoryCountingUseCase,
    GetAllInventoryCountingsUseCase,
    UpdateInventoryCountingUseCase,
    DeleteInventoryCountingUseCase,
    CompleteInventoryCountingUseCase,

    CreateInventoryPostingUseCase,
    GetInventoryPostingUseCase,
    GetAllInventoryPostingsUseCase,
    UpdateInventoryPostingUseCase,
    DeleteInventoryPostingUseCase,
    PostInventoryPostingUseCase,

    CreateInventoryRevaluationUseCase,
    GetInventoryRevaluationUseCase,
    GetAllInventoryRevaluationsUseCase,
    UpdateInventoryRevaluationUseCase,
    DeleteInventoryRevaluationUseCase,
    PostInventoryRevaluationUseCase,
    // External Services
    JwtStrategy,
    OrderCreatedConsumer,
    GoodsReceivedConsumer,
    StockLevelChangedPublisher,
  ],
})
export class AppModule {}
