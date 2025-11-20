# Use Cases: Goods Receipt Management

## Use Case Overview

**Feature**: Goods Receipt Management  
**Feature ID**: FEAT-002-004  
**Epic**: EPIC-002 - Inventory Management  
**Priority**: Critical  
**Status**: Completed

**Related Services**: inventory-service, purchase-service  
**Related Database Tables**: goods_receipts, goods_receipt_items, inventory_movements, purchase_orders, inventory  
**Epic Document**: [Epic: Inventory Management](../product-owner/epic-inventory-management.md)  
**Business Rules**: [Business Rules: Inventory Management](./business-rules-inventory-management.md)  
**Traceability**: [Traceability Matrix](../traceability-matrix.md#epic-002-inventory-management)  
**Service Mapping**: [Service Mapping](../service-mapping.md#epic-002-inventory-management)  
**Database Mapping**: [Database Mapping](../database-mapping.md#epic-002-inventory-management)

## Actors

- **Primary Actor**: Warehouse Staff, Warehouse Manager
- **Secondary Actors**: Purchase Manager, System
- **Supporting Actors**: Purchase Service, Inventory Service, Product Service

---

## Use Case 1: Receive Goods from Purchase Order

### UC-GR-001: Receive Goods from Purchase Order

**Actor**: Warehouse Staff  
**Goal**: Receive goods into warehouse from a purchase order and update inventory  
**Preconditions**: 
- User has Warehouse Staff role
- Purchase order exists and is approved
- Purchase order has items pending receipt
- Warehouse exists and is active

**Main Flow**:
1. Warehouse Staff navigates to Goods Receipt Management
2. System displays list of purchase orders with pending receipts
3. Warehouse Staff selects a purchase order
4. System displays purchase order details with items and ordered quantities
5. Warehouse Staff clicks "Create Goods Receipt"
6. System creates goods receipt document linked to purchase order
7. System displays goods receipt form with items from purchase order
8. For each item, Warehouse Staff enters:
   - Received quantity (defaults to ordered quantity)
   - Batch number (if product is batch-managed)
   - Expiry date (if product has expiry date)
   - Location/Area (optional)
   - Notes (optional)
9. Warehouse Staff clicks "Save as Draft"
10. System validates:
    - Received quantity > 0
    - Received quantity <= ordered quantity (unless over-receiving allowed)
    - Batch number is provided if product.is_batch_managed = true
    - Expiry date is provided if product.has_expiry_date = true
    - Expiry date is in the future
11. System saves goods receipt with status "Draft"
12. Warehouse Staff marks receipt as "Received" (physical goods received)
13. Warehouse Manager reviews and verifies receipt
14. Warehouse Manager marks receipt as "Verified"
15. System updates inventory:
    - Increases quantity_on_hand for each item
    - Creates IN movement records
    - Updates purchase order received quantities
16. System displays success message
17. System updates inventory levels in real-time

**Alternative Flows**:

**A1: Partial Receiving**
- At step 8, Warehouse Staff enters received quantity less than ordered quantity
- System allows partial receiving
- System tracks remaining quantity to be received
- Purchase order status remains "Partially Received"
- System allows creating additional receipts for remaining quantity

**A2: Over-Receiving (if allowed)**
- At step 10, if received quantity > ordered quantity and over-receiving is allowed:
  - System displays warning "Received quantity exceeds ordered quantity"
  - System requires approval from Warehouse Manager
  - If approved, system allows over-receiving
  - System creates adjustment record for over-received quantity

**A3: Multiple Receipts for Same Purchase Order**
- At step 3, if purchase order already has partial receipt:
  - System displays existing receipt information
  - System shows remaining quantities to be received
  - Warehouse Staff can create additional receipt for remaining items

**Exception Flows**:

**E1: Invalid Received Quantity**
- At step 10, if received quantity <= 0:
  - System displays error "Received quantity must be greater than 0"
  - Flow returns to step 8

**E2: Received Quantity Exceeds Ordered (if over-receiving not allowed)**
- At step 10, if received quantity > ordered quantity and over-receiving not allowed:
  - System displays error "Received quantity cannot exceed ordered quantity"
  - Flow returns to step 8

**E3: Missing Batch Number**
- At step 10, if product.is_batch_managed = true and batch number is missing:
  - System displays error "Batch number is required for this product"
  - Flow returns to step 8

**E4: Invalid Expiry Date**
- At step 10, if product.has_expiry_date = true and expiry date is missing:
  - System displays error "Expiry date is required for this product"
  - Flow returns to step 8
- At step 10, if expiry date is in the past:
  - System displays error "Expiry date must be in the future"
  - Flow returns to step 8

**E5: Duplicate Batch Number**
- At step 10, if batch number already exists for same product in same warehouse:
  - System displays error "Batch number already exists. Please use existing batch or enter different batch number"
  - System offers option to use existing batch or enter new batch
  - Flow returns to step 8

**E6: Purchase Order Not Found**
- At step 3, if purchase order doesn't exist:
  - System displays error "Purchase order not found"
  - Flow returns to step 2

**E7: Inventory Update Failure**
- At step 15, if inventory update fails:
  - System displays error "Failed to update inventory. Please contact administrator"
  - System rolls back transaction
  - Receipt status remains "Received" (not "Verified")
  - Flow returns to step 13

**Postconditions**:
- Goods receipt is created and verified
- Inventory is updated with received quantities
- Purchase order received quantities are updated
- Movement records are created
- Inventory levels are updated in real-time

---

## Use Case 2: Receive Goods with Batch and Expiry

### UC-GR-002: Receive Batch-Managed Products with Expiry

**Actor**: Warehouse Staff  
**Goal**: Receive products that require batch number and expiry date tracking  
**Preconditions**:
- User has Warehouse Staff role
- Purchase order exists with batch-managed products
- Products have expiry date tracking enabled

**Main Flow**:
1. Warehouse Staff creates goods receipt from purchase order
2. System displays items requiring batch and expiry information
3. For each batch-managed product, Warehouse Staff enters:
   - Batch number (e.g., "BATCH-2025-001")
   - Expiry date (e.g., "2026-12-31")
   - Received quantity
4. Warehouse Staff clicks "Save"
5. System validates:
    - Batch number format and uniqueness
    - Expiry date is in the future
    - Received quantity > 0
6. System creates inventory records with batch and expiry information
7. System links inventory to batch number
8. System tracks expiry date for the batch
9. System displays success message

**Alternative Flows**:

**A1: Multiple Batches for Same Product**
- At step 3, if receiving multiple batches of same product:
  - Warehouse Staff can add multiple batch entries
  - Each batch has its own quantity and expiry date
  - System creates separate inventory records for each batch

**A2: Use Existing Batch**
- At step 3, if batch number already exists:
  - System detects existing batch
  - System offers option to add quantity to existing batch
  - If selected, system increases quantity of existing batch
  - System validates expiry date matches existing batch expiry date

**Exception Flows**:

**E1: Batch Number Already Exists with Different Expiry**
- At step 5, if batch number exists but expiry date is different:
  - System displays error "Batch number exists with different expiry date. Please use different batch number"
  - Flow returns to step 3

**E2: Expiry Date Too Soon**
- At step 5, if expiry date is within warning period (e.g., < 30 days):
  - System displays warning "Expiry date is very soon. Please verify"
  - Warehouse Staff can proceed or correct expiry date

**Postconditions**:
- Inventory is created with batch and expiry information
- Batch tracking is enabled
- Expiry warnings can be generated when approaching expiry

---

## Use Case 3: Verify Goods Receipt

### UC-GR-003: Verify Goods Receipt

**Actor**: Warehouse Manager  
**Goal**: Verify that received goods match the goods receipt and approve inventory update  
**Preconditions**:
- User has Warehouse Manager role
- Goods receipt exists with status "Received"
- Physical goods have been received

**Main Flow**:
1. Warehouse Manager navigates to Goods Receipt Management
2. System displays list of receipts with status "Received"
3. Warehouse Manager selects a goods receipt
4. System displays receipt details:
   - Items and quantities
   - Batch numbers (if applicable)
   - Expiry dates (if applicable)
   - Purchase order reference
5. Warehouse Manager physically verifies goods match receipt
6. Warehouse Manager clicks "Verify"
7. System prompts for confirmation
8. Warehouse Manager confirms verification
9. System updates inventory:
    - Increases quantity_on_hand for each item
    - Creates IN movement records
    - Updates batch inventory (if batch-managed)
    - Updates expiry tracking (if applicable)
10. System updates purchase order received quantities
11. System changes receipt status to "Verified"
12. System displays success message
13. System sends notification to Purchase Manager (if configured)

**Alternative Flows**:

**A1: Partial Verification**
- At step 5, if some items don't match:
  - Warehouse Manager can adjust quantities
  - System creates adjustment record
  - System verifies only matching items
  - Remaining items remain in "Received" status

**A2: Reject Receipt**
- At step 5, if goods don't match or are damaged:
  - Warehouse Manager clicks "Reject"
  - System changes receipt status to "Rejected"
  - System creates rejection record with reason
  - System notifies Purchase Manager
  - System does not update inventory

**Exception Flows**:

**E1: Inventory Update Failure**
- At step 9, if inventory update fails:
  - System displays error "Failed to update inventory"
  - System rolls back transaction
  - Receipt status remains "Received"
  - Flow returns to step 3

**E2: Insufficient Permissions**
- At step 6, if user doesn't have verify permission:
  - System displays error "You don't have permission to verify receipts"
  - Flow returns to step 2

**Postconditions**:
- Goods receipt is verified
- Inventory is updated
- Purchase order is updated
- Movement records are created
- Notifications are sent (if configured)

---

## Use Case 4: Cancel Goods Receipt

### UC-GR-004: Cancel Goods Receipt

**Actor**: Warehouse Manager  
**Goal**: Cancel a goods receipt that was created in error  
**Preconditions**:
- User has Warehouse Manager role
- Goods receipt exists with status "Draft" or "Received"
- Receipt has not been verified

**Main Flow**:
1. Warehouse Manager navigates to Goods Receipt Management
2. System displays list of receipts
3. Warehouse Manager selects a receipt with status "Draft" or "Received"
4. Warehouse Manager clicks "Cancel"
5. System prompts for cancellation reason
6. Warehouse Manager enters cancellation reason
7. Warehouse Manager confirms cancellation
8. System changes receipt status to "Cancelled"
9. System does not update inventory (since not verified)
10. System displays success message

**Alternative Flows**:

**A1: Cancel Verified Receipt (Reversal)**
- At step 3, if receipt is already verified:
  - System displays warning "Receipt is already verified. Cancellation will reverse inventory"
  - System requires additional approval
  - If approved, system creates reversal:
    - Decreases inventory quantities
    - Creates OUT movement records (reversal)
    - Updates purchase order received quantities
  - System changes receipt status to "Cancelled"

**Exception Flows**:

**E1: Receipt Already Cancelled**
- At step 3, if receipt is already cancelled:
  - System displays message "Receipt is already cancelled"
  - Flow returns to step 2

**E2: Missing Cancellation Reason**
- At step 6, if cancellation reason is not provided:
  - System displays error "Cancellation reason is required"
  - Flow returns to step 5

**Postconditions**:
- Goods receipt is cancelled
- Inventory is not affected (unless verified receipt is reversed)
- Cancellation is recorded with reason

---

## Business Rules Summary

1. **Receipt Quantity Rule**: Received quantity <= Ordered quantity (unless over-receiving allowed)
2. **Batch Requirement Rule**: Batch number required if product.is_batch_managed = true
3. **Expiry Requirement Rule**: Expiry date required if product.has_expiry_date = true
4. **Expiry Date Rule**: Expiry date must be in the future
5. **Inventory Update Rule**: Inventory updated only when receipt status = "Verified"
6. **Partial Receiving Rule**: Multiple receipts allowed for same purchase order
7. **Movement Record Rule**: IN movement created when receipt is verified

---

**Last Updated**: November 2025  
**Version**: 1.0

