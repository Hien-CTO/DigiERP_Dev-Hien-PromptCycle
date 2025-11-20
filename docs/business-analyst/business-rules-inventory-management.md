# Business Rules: Inventory Management Module

## Module Overview

**Module**: Inventory Management  
**Epic**: EPIC-002 - Inventory Management

**Related Services**: inventory-service, product-service, sales-service, purchase-service, financial-service  
**Related Database Tables**: inventory, inventory_movements, warehouses, areas, locations, goods_receipts, goods_issues, inventory_adjustments  
**Epic Document**: [Epic: Inventory Management](../product-owner/epic-inventory-management.md)  
**Use Cases**: [Use Cases: Goods Receipt](./use-cases-goods-receipt.md)  
**Traceability**: [Traceability Matrix](../traceability-matrix.md#epic-002-inventory-management)  
**Service Mapping**: [Service Mapping](../service-mapping.md#epic-002-inventory-management)  
**Database Mapping**: [Database Mapping](../database-mapping.md#epic-002-inventory-management)  
**Last Updated**: November 2025  
**Version**: 1.0

---

## 1. Warehouse Management Rules

### BR-INV-001: Warehouse Creation Rule

**Rule Name**: Warehouse Information Requirements  
**Description**: Warehouses must have required information when created.  
**Scope**: Warehouse creation  
**Priority**: Critical  

**Required Fields**:
- Warehouse code (unique)
- Warehouse name
- Warehouse type (Main, Virtual, Transit)
- Address
- Status (Active, Inactive, Maintenance)

**Validation**:
- Warehouse code must be unique across system
- Warehouse code: Alphanumeric, max 20 characters
- Warehouse name: Required, max 100 characters

**Exception**: None

**Business Impact**:
- Ensures proper warehouse identification
- Prevents duplicate warehouses
- Required for inventory tracking

---

### BR-INV-002: Warehouse Type Rule

**Rule Name**: Warehouse Type Definitions  
**Description**: System supports three warehouse types with specific purposes.  
**Scope**: Warehouse management  
**Priority**: High  

**Warehouse Types**:
- **Main Warehouse**: Primary storage location for inventory
- **Virtual Warehouse**: Logical warehouse for grouping products (no physical location)
- **Transit Warehouse**: Temporary storage for goods in transit

**Validation**:
- Warehouse type must be selected from predefined list
- Main warehouses require physical address
- Virtual warehouses may not require physical address

**Exception**: None

**Business Impact**:
- Enables flexible warehouse management
- Supports different business scenarios
- Critical for inventory organization

---

### BR-INV-003: Warehouse Deletion Rule

**Rule Name**: Warehouse Deletion Constraints  
**Description**: Warehouses with inventory or movement history cannot be deleted.  
**Scope**: Warehouse deletion  
**Priority**: Critical  

**Constraints**:
- Warehouse with inventory (quantity_on_hand > 0): Cannot delete
- Warehouse with movement history: Cannot delete (soft delete only)
- Warehouse with active areas: Cannot delete (must deactivate areas first)

**Validation**:
- System checks for inventory before deletion
- System checks for movement history
- System displays constraints if deletion attempted

**Exception**: 
- System Administrator can force delete with full audit trail (not recommended)

**Business Impact**:
- Maintains data integrity
- Preserves historical records
- Prevents inventory loss

---

## 2. Area and Location Rules

### BR-INV-004: Area Type Rule

**Rule Name**: Supported Area Types  
**Description**: Areas within warehouses must have defined types.  
**Scope**: Area management  
**Priority**: High  

**Area Types**:
- **Storage**: Primary storage area
- **Picking**: Area for order picking
- **Receiving**: Area for receiving goods
- **Shipping**: Area for shipping preparation
- **Quality Control**: Area for quality inspection
- **Maintenance**: Area for maintenance activities

**Validation**:
- Area type must be selected from predefined list
- Each warehouse can have multiple areas of same type

**Exception**: None

**Business Impact**:
- Enables organized warehouse operations
- Supports workflow optimization
- Critical for warehouse efficiency

---

### BR-INV-005: Area Capacity Rule

**Rule Name**: Area Capacity Management  
**Description**: Areas can have capacity limits for inventory management.  
**Scope**: Area management  
**Priority**: Medium  

**Rules**:
- Area capacity is optional
- If capacity is defined, system tracks utilization
- Utilization = (current_inventory / capacity) * 100%
- System can generate alerts when utilization exceeds threshold (e.g., 85%)

**Validation**:
- Capacity must be > 0 if defined
- Utilization cannot exceed 100%

**Exception**: 
- System can allow over-capacity with warning (configurable)

**Business Impact**:
- Prevents overstocking
- Optimizes space utilization
- Supports warehouse planning

---

## 3. Inventory Tracking Rules

### BR-INV-006: Inventory Quantity Calculation Rule

**Rule Name**: Inventory Quantity Formulas  
**Description**: System calculates inventory quantities using specific formulas.  
**Scope**: All inventory operations  
**Priority**: Critical  

**Quantity Types**:
- **quantity_on_hand**: Physical quantity in warehouse
- **quantity_reserved**: Quantity reserved for orders
- **quantity_available**: Available for new orders

**Formulas**:
```
quantity_available = quantity_on_hand - quantity_reserved

IF quantity_available < 0 THEN
    quantity_available = 0 (cannot be negative)
END IF
```

**Validation**:
- quantity_on_hand >= 0 (cannot be negative)
- quantity_reserved >= 0 (cannot be negative)
- quantity_available is calculated automatically
- System prevents reserving more than available

**Exception**: None

**Business Impact**:
- Ensures accurate inventory tracking
- Prevents overselling
- Critical for order fulfillment

---

### BR-INV-007: Inventory Movement Rule

**Rule Name**: Inventory Movement Types  
**Description**: All inventory changes must be recorded as movements.  
**Scope**: All inventory operations  
**Priority**: Critical  

**Movement Types**:
- **IN**: Goods receipt (increases inventory)
- **OUT**: Goods issue (decreases inventory)
- **TRANSFER**: Transfer between warehouses (decreases source, increases destination)
- **ADJUSTMENT**: Manual adjustment (can increase or decrease)

**Validation**:
- Every inventory change must have a movement record
- Movement must link to reference document (PO, SO, Transfer, Adjustment)
- Movement must have timestamp and user information
- Movement quantity cannot be zero

**Exception**: None

**Business Impact**:
- Provides complete audit trail
- Enables inventory reconciliation
- Critical for financial accuracy

---

### BR-INV-008: Negative Inventory Prevention Rule

**Rule Name**: Prevent Negative Inventory  
**Description**: System prevents inventory from going negative.  
**Scope**: Goods issue and transfers  
**Priority**: Critical  

**Rules**:
- System checks available quantity before allowing goods issue
- If available quantity < requested quantity, system prevents issue
- System displays error: "Insufficient inventory. Available: X, Requested: Y"
- Exception: System Administrator can override with audit trail (for corrections)

**Validation**:
- Before goods issue: quantity_available >= issue_quantity
- Before transfer: quantity_available >= transfer_quantity
- System validates before creating movement

**Exception**: 
- System Administrator can allow negative inventory for corrections (with audit trail)

**Business Impact**:
- Prevents overselling
- Maintains inventory accuracy
- Critical for business operations

---

## 4. Goods Receipt Rules

### BR-INV-009: Goods Receipt from Purchase Order Rule

**Rule Name**: Goods Receipt Workflow  
**Description**: Goods receipt must follow specific workflow.  
**Scope**: Goods receipt processing  
**Priority**: Critical  

**Workflow States**:
1. **Draft**: Receipt created but not processed
2. **Received**: Goods physically received
3. **Verified**: Receipt verified and inventory updated
4. **Cancelled**: Receipt cancelled

**Rules**:
- Goods receipt can be created from purchase order
- Partial receiving is allowed
- System tracks received quantity vs ordered quantity
- Inventory is updated only when status = "Verified"
- Movement record is created when verified

**Validation**:
- Received quantity <= ordered quantity (cannot receive more than ordered)
- Received quantity > 0
- Purchase order must exist and be approved

**Exception**: 
- System can allow over-receiving with approval (configurable)

**Business Impact**:
- Ensures accurate receiving process
- Maintains purchase order tracking
- Critical for inventory accuracy

---

### BR-INV-010: Batch Number Requirement Rule

**Rule Name**: Batch Number for Batch-Managed Products  
**Description**: Batch number is required when receiving batch-managed products.  
**Scope**: Goods receipt  
**Priority**: High  

**Rules**:
- If product.is_batch_managed = true, batch number is required
- Batch number must be unique per product per warehouse
- Batch number format: Alphanumeric, max 50 characters
- System validates batch number uniqueness

**Validation**:
- System checks product.is_batch_managed flag
- If true, batch number field is required
- System validates batch number format and uniqueness

**Exception**: None

**Business Impact**:
- Enables lot tracking
- Critical for quality control
- Required for recall management

---

### BR-INV-011: Expiry Date Requirement Rule

**Rule Name**: Expiry Date for Products with Expiry  
**Description**: Expiry date is required when receiving products with expiry tracking.  
**Scope**: Goods receipt  
**Priority**: High  

**Rules**:
- If product.has_expiry_date = true, expiry date is required
- Expiry date must be in the future when receiving
- System validates expiry date is not in the past
- System tracks expiry date per batch (if batch-managed) or per inventory item

**Validation**:
- System checks product.has_expiry_date flag
- If true, expiry date field is required
- System validates expiry date > current date

**Exception**: 
- System Administrator can allow past expiry date for corrections (with audit trail)

**Business Impact**:
- Ensures product quality
- Prevents receiving expired products
- Critical for food safety compliance

---

## 5. Goods Issue Rules

### BR-INV-012: Goods Issue from Sales Order Rule

**Rule Name**: Goods Issue Workflow  
**Description**: Goods issue must follow specific workflow.  
**Scope**: Goods issue processing  
**Priority**: Critical  

**Workflow States**:
1. **Draft**: Issue created but not processed
2. **Pending**: Issue pending approval/processing
3. **Issued**: Goods physically issued
4. **Verified**: Issue verified and inventory updated
5. **Cancelled**: Issue cancelled

**Rules**:
- Goods issue can be created from sales order
- System checks inventory availability before allowing issue
- Partial issuing is allowed
- System tracks issued quantity vs ordered quantity
- Inventory is updated only when status = "Verified"
- Movement record is created when verified

**Validation**:
- Available quantity >= issue quantity
- Issue quantity > 0
- Sales order must exist and be confirmed

**Exception**: None

**Business Impact**:
- Ensures accurate fulfillment process
- Maintains sales order tracking
- Critical for customer satisfaction

---

### BR-INV-013: Batch Selection Rule (FIFO/LIFO)

**Rule Name**: Batch Selection for Issue  
**Description**: System selects batches based on configured method (FIFO/LIFO).  
**Scope**: Goods issue for batch-managed products  
**Priority**: High  

**Selection Methods**:
- **FIFO** (First In First Out): Select oldest batch first
- **LIFO** (Last In First Out): Select newest batch first
- **FEFO** (First Expiry First Out): Select batch with earliest expiry date first

**Rules**:
- System applies selection method per product or warehouse (configurable)
- System selects batches with sufficient quantity
- System prevents selecting expired batches (if product.has_expiry_date = true)
- System displays selected batch information

**Validation**:
- Selected batch must have sufficient quantity
- Selected batch must not be expired (if expiry tracking enabled)
- System validates batch exists and is active

**Exception**: 
- User can manually override batch selection (with approval)

**Business Impact**:
- Optimizes inventory rotation
- Reduces waste from expired products
- Critical for quality management

---

## 6. Inventory Counting and Adjustment Rules

### BR-INV-014: Inventory Counting Workflow Rule

**Rule Name**: Inventory Counting Process  
**Description**: Inventory counting must follow specific workflow.  
**Scope**: Inventory counting  
**Priority**: High  

**Workflow States**:
1. **Draft**: Counting document created
2. **In Progress**: Counting in progress
3. **Completed**: Counting completed, variance calculated
4. **Posted**: Adjustment posted to inventory
5. **Cancelled**: Counting cancelled

**Rules**:
- Counting document can be created for specific warehouse/area
- System tracks expected quantity (from system) vs counted quantity (physical)
- Variance = counted_quantity - expected_quantity
- System calculates variance automatically
- Adjustment is posted only when status = "Posted"

**Validation**:
- Counted quantity >= 0
- Counting document must have at least one item
- System validates counting is completed before posting

**Exception**: None

**Business Impact**:
- Ensures inventory accuracy
- Enables periodic reconciliation
- Critical for financial accuracy

---

### BR-INV-015: Inventory Adjustment Rule

**Rule Name**: Inventory Adjustment Posting  
**Description**: Inventory adjustments must be posted to update inventory.  
**Scope**: Inventory adjustment  
**Priority**: High  

**Rules**:
- Adjustment is created from counting variance or manually
- Adjustment can be positive (increase) or negative (decrease)
- Adjustment is posted only when approved
- System creates movement record when posted
- System updates inventory quantities when posted

**Validation**:
- Adjustment must have reason/justification
- Adjustment must be approved before posting
- System validates adjustment doesn't cause negative inventory (unless override)

**Exception**: 
- System Administrator can allow negative adjustment with override (for corrections)

**Business Impact**:
- Maintains inventory accuracy
- Provides audit trail for adjustments
- Critical for reconciliation

---

## 7. Inventory Transfer Rules

### BR-INV-016: Transfer Request Workflow Rule

**Rule Name**: Transfer Request Process  
**Description**: Inventory transfers must go through request and approval workflow.  
**Scope**: Inventory transfer  
**Priority**: High  

**Request States**:
1. **Draft**: Request created
2. **Pending**: Request pending approval
3. **Approved**: Request approved
4. **Rejected**: Request rejected
5. **Cancelled**: Request cancelled

**Rules**:
- Transfer request can be created between warehouses
- Request must specify source warehouse, destination warehouse, products, and quantities
- Request requires approval before transfer can be executed
- System checks inventory availability in source warehouse

**Validation**:
- Source warehouse must be different from destination
- Available quantity in source >= transfer quantity
- Request must have at least one item

**Exception**: None

**Business Impact**:
- Controls inventory movements
- Prevents unauthorized transfers
- Maintains inventory accuracy

---

### BR-INV-017: Transfer Execution Rule

**Rule Name**: Transfer Execution  
**Description**: Transfers must be executed from approved requests.  
**Scope**: Inventory transfer  
**Priority**: High  

**Transfer States**:
1. **Draft**: Transfer created
2. **In Transit**: Goods in transit
3. **Completed**: Transfer completed, inventory updated
4. **Cancelled**: Transfer cancelled

**Rules**:
- Transfer can be created from approved transfer request
- Transfer can be created directly (if approval not required, configurable)
- System creates movement records:
  - OUT movement in source warehouse
  - IN movement in destination warehouse
- Inventory is updated only when status = "Completed"

**Validation**:
- Transfer must have source and destination warehouses
- Source warehouse must have sufficient inventory
- Transfer quantity > 0

**Exception**: None

**Business Impact**:
- Enables efficient stock distribution
- Maintains accurate inventory across warehouses
- Critical for multi-location operations

---

## 8. Safety Stock and Reorder Rules

### BR-INV-018: Safety Stock Calculation Rule

**Rule Name**: Safety Stock Level Calculation  
**Description**: Safety stock can be calculated based on lead time and demand variability.  
**Scope**: Safety stock management  
**Priority**: High  

**Calculation Methods**:
- **Manual**: User sets safety stock level manually
- **Automatic**: System calculates based on:
  - Average lead time
  - Demand variability (standard deviation)
  - Service level target

**Formula** (if automatic):
```
safety_stock = (lead_time * average_daily_demand) + (safety_factor * std_deviation)
```

**Rules**:
- Safety stock level can be set per product per warehouse
- System generates alerts when inventory <= safety_stock
- System can send notifications (email/SMS) for safety stock alerts

**Validation**:
- Safety stock >= 0
- System validates safety stock calculation parameters

**Exception**: None

**Business Impact**:
- Prevents stockouts
- Optimizes inventory levels
- Critical for customer service

---

### BR-INV-019: Reorder Point Calculation Rule

**Rule Name**: Reorder Point Automation  
**Description**: Reorder point can be calculated automatically or set manually.  
**Scope**: Reorder point management  
**Priority**: High  

**Calculation**:
```
reorder_point = (lead_time * average_daily_demand) + safety_stock
```

**Rules**:
- Reorder point can be set per product per warehouse
- System generates reorder notifications when inventory <= reorder_point
- System can automatically create purchase requisitions (configurable)
- System tracks reorder quantity (EOQ or manual)

**Validation**:
- Reorder point >= 0
- Reorder quantity > 0
- System validates calculation parameters

**Exception**: None

**Business Impact**:
- Automates replenishment
- Reduces manual effort
- Prevents stockouts

---

## 9. Inventory Valuation Rules

### BR-INV-020: Inventory Valuation Method Rule

**Rule Name**: Inventory Valuation Methods  
**Description**: System supports different inventory valuation methods.  
**Scope**: Inventory valuation  
**Priority**: High  

**Valuation Methods**:
- **FIFO** (First In First Out): Value based on oldest cost
- **LIFO** (Last In First Out): Value based on newest cost
- **Average Cost**: Value based on weighted average cost
- **Standard Cost**: Value based on predefined standard cost

**Rules**:
- Valuation method is set per product or globally (configurable)
- System calculates inventory value based on selected method
- System maintains cost history for valuation

**Validation**:
- Valuation method must be selected
- System validates cost data is available

**Exception**: None

**Business Impact**:
- Enables accurate financial reporting
- Supports different accounting methods
- Critical for financial accuracy

---

### BR-INV-021: Inventory Revaluation Rule

**Rule Name**: Inventory Revaluation Process  
**Description**: Inventory can be revalued to adjust unit costs.  
**Scope**: Inventory revaluation  
**Priority**: Medium  

**Rules**:
- Revaluation document can be created to update unit costs
- Revaluation affects inventory value
- Revaluation amount = (new_cost - old_cost) * quantity
- Revaluation must be posted to update inventory
- System maintains revaluation history

**Validation**:
- New cost must be > 0
- Revaluation must be approved before posting
- System validates revaluation doesn't cause negative value

**Exception**: None

**Business Impact**:
- Enables cost adjustments
- Maintains accurate inventory values
- Supports accounting requirements

---

## Summary

### Critical Rules (Must Implement)
- BR-INV-001: Warehouse Creation
- BR-INV-003: Warehouse Deletion
- BR-INV-006: Inventory Quantity Calculation
- BR-INV-007: Inventory Movement
- BR-INV-008: Negative Inventory Prevention
- BR-INV-009: Goods Receipt Workflow
- BR-INV-012: Goods Issue Workflow

### High Priority Rules
- BR-INV-002: Warehouse Type
- BR-INV-004: Area Type
- BR-INV-010: Batch Number Requirement
- BR-INV-011: Expiry Date Requirement
- BR-INV-013: Batch Selection
- BR-INV-014: Inventory Counting
- BR-INV-015: Inventory Adjustment
- BR-INV-016: Transfer Request
- BR-INV-017: Transfer Execution
- BR-INV-018: Safety Stock
- BR-INV-019: Reorder Point
- BR-INV-020: Inventory Valuation

### Medium Priority Rules
- BR-INV-005: Area Capacity
- BR-INV-021: Inventory Revaluation

---

**Last Updated**: November 2025  
**Version**: 1.0

