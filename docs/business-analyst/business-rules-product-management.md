# Business Rules: Product Management Module

## Module Overview

**Module**: Product Management  
**Epic**: EPIC-001 - Product Management

**Related Services**: product-service, inventory-service, customer-service, sales-service  
**Related Database Tables**: products, cat_product_categories, product_prices, customer_prices, volume_prices, contract_prices  
**Epic Document**: [Epic: Product Management](../product-owner/epic-product-management.md)  
**Use Cases**: [Use Cases: Multi-tier Pricing](./use-cases-multi-tier-pricing.md)  
**Requirements**: [Requirements: Multi-tier Pricing](./requirements-multi-tier-pricing.md)  
**Traceability**: [Traceability Matrix](../traceability-matrix.md#epic-001-product-management)  
**Service Mapping**: [Service Mapping](../service-mapping.md#epic-001-product-management)  
**Database Mapping**: [Database Mapping](../database-mapping.md#epic-001-product-management)  
**Last Updated**: November 2025  
**Version**: 1.0

---

## 1. Product Information Rules

### BR-PM-001: SKU Uniqueness Rule

**Rule Name**: SKU Must Be Unique  
**Description**: Each product must have a unique SKU (Stock Keeping Unit) code across the entire system.  
**Scope**: Product creation and update  
**Priority**: Critical  
**Validation**: 
- System checks SKU uniqueness before saving product
- Case-insensitive comparison
- SKU cannot be null or empty
- SKU format: Alphanumeric, max 50 characters

**Exception**: 
- None. SKU must be unique.

**Business Impact**: 
- Prevents duplicate products
- Ensures accurate inventory tracking
- Critical for order processing

---

### BR-PM-002: Product Status Rule

**Rule Name**: Product Status Management  
**Description**: Products can have one of three statuses: Active, Inactive, or Discontinued.  
**Scope**: All product operations  
**Priority**: High  

**Status Definitions**:
- **Active**: Product is available for sale and can be used in orders
- **Inactive**: Product is temporarily unavailable but can be reactivated
- **Discontinued**: Product is permanently removed from catalog

**Validation**:
- Only Active products can be added to new orders
- Inactive products cannot be added to new orders but existing orders can be fulfilled
- Discontinued products cannot be used in any new transactions

**Exception**:
- System Administrator can override for special cases (with audit trail)

**Business Impact**:
- Controls product availability
- Prevents selling unavailable products
- Maintains data integrity

---

### BR-PM-003: Product Required Fields Rule

**Rule Name**: Mandatory Product Information  
**Description**: Certain fields are required when creating a product.  
**Scope**: Product creation  
**Priority**: Critical  

**Required Fields**:
- SKU
- Product Name
- Category (at least one)
- Unit Type
- Standard Price
- Product Status

**Optional Fields**:
- Description
- Images
- Brand
- Model
- Material Type
- Packaging Type

**Validation**:
- System validates all required fields before allowing save
- Missing required fields trigger validation errors

**Exception**: None

**Business Impact**:
- Ensures data completeness
- Prevents incomplete product records
- Required for order processing

---

## 2. Category Management Rules

### BR-PM-004: Hierarchical Category Structure Rule

**Rule Name**: Category Parent-Child Relationship  
**Description**: Categories can be organized in a hierarchical structure with parent-child relationships.  
**Scope**: Category management  
**Priority**: High  

**Rules**:
- A category can have one parent category (or none for root categories)
- A category cannot be its own parent
- Circular references are not allowed (Category A → Category B → Category A)
- Maximum depth: 5 levels
- Root categories have parent_id = null

**Validation**:
- System checks for circular references before saving
- System validates maximum depth
- System prevents deleting categories with child categories (unless moving children first)

**Exception**: None

**Business Impact**:
- Maintains logical category structure
- Prevents data corruption
- Enables efficient product organization

---

### BR-PM-005: Category Deletion Rule

**Rule Name**: Category Deletion Constraints  
**Description**: Categories with associated products or child categories cannot be deleted directly.  
**Scope**: Category deletion  
**Priority**: High  

**Rules**:
- Category with products: Must reassign products to another category first
- Category with child categories: Must move or delete child categories first
- Empty category without children: Can be deleted

**Validation**:
- System checks for associated products before deletion
- System checks for child categories before deletion
- System displays warning with count of affected products/categories

**Exception**: 
- System Administrator can force delete with audit trail (not recommended)

**Business Impact**:
- Prevents orphaned products
- Maintains data integrity
- Protects against accidental deletion

---

## 3. Pricing Rules

### BR-PM-006: Multi-tier Price Priority Rule

**Rule Name**: Price Application Priority  
**Description**: When multiple prices exist for a product, system applies prices in a specific priority order.  
**Scope**: Price calculation in sales orders  
**Priority**: Critical  

**Priority Order** (highest to lowest):
1. **Contract Price**: Price defined in active contract with customer
2. **Customer Price**: Price specific to individual customer
3. **Customer Group Price**: Price for customer group
4. **Volume Price**: Price based on order quantity
5. **Standard Price**: Default product price

**Validation**:
- System checks prices in priority order
- First valid price found is used
- Price must be active (valid_from <= today <= valid_to)

**Calculation Logic**:
```
IF contract_price exists AND contract_price is valid THEN
    USE contract_price
ELSE IF customer_price exists AND customer_price is valid THEN
    USE customer_price
ELSE IF customer_group_price exists AND customer_group_price is valid THEN
    USE customer_group_price
ELSE IF volume_price exists AND quantity qualifies AND volume_price is valid THEN
    USE volume_price
ELSE
    USE standard_price
END IF
```

**Exception**: None

**Business Impact**:
- Ensures correct pricing for each customer
- Maximizes revenue through tiered pricing
- Critical for order processing accuracy

---

### BR-PM-007: Price Validity Period Rule

**Rule Name**: Price Validity Period  
**Description**: Prices must have valid from and to dates. Only valid prices are used in calculations.  
**Scope**: All price types  
**Priority**: Critical  

**Rules**:
- valid_from: Required, must be today or future date
- valid_to: Optional, if provided must be after valid_from
- If valid_to is null, price is valid indefinitely until explicitly expired
- Price is considered valid if: valid_from <= current_date <= valid_to (or valid_to is null)

**Validation**:
- System validates date ranges when creating/updating prices
- System checks validity when calculating prices
- Expired prices are not used in calculations

**Exception**: 
- Historical prices are kept for audit but not used in calculations

**Business Impact**:
- Enables time-based pricing strategies
- Supports promotional pricing
- Maintains price history for analysis

---

### BR-PM-008: Price Overlap Prevention Rule

**Rule Name**: No Overlapping Prices of Same Type  
**Description**: Prices of the same type (Customer, Group, Contract, Volume) cannot have overlapping validity periods for the same product and customer/group.  
**Scope**: Price creation and update  
**Priority**: High  

**Rules**:
- For Customer Price: One active price per product per customer
- For Customer Group Price: One active price per product per group
- For Contract Price: One active price per product per contract
- For Volume Price: Quantity ranges cannot overlap for same product

**Validation**:
- System checks for overlapping periods before saving
- System displays warning if overlap detected
- User must resolve overlap before saving

**Exception**:
- System can automatically deactivate old price when new one is created (configurable)

**Business Impact**:
- Prevents pricing conflicts
- Ensures clear price application
- Maintains pricing integrity

---

### BR-PM-009: Minimum Price Rule

**Rule Name**: Price Must Be Positive  
**Description**: All prices must be greater than zero.  
**Scope**: All price types  
**Priority**: Critical  

**Validation**:
- Price > 0
- Discount percentage: 0% to 100%
- Discount amount: Must not exceed base price

**Exception**: 
- FOC (Free of Charge) orders can have price = 0 (handled at order level, not product price level)

**Business Impact**:
- Prevents pricing errors
- Ensures revenue protection
- Critical for financial accuracy

---

### BR-PM-010: Price History Rule

**Rule Name**: Price Change Audit Trail  
**Description**: All price changes must be recorded in price history for audit and analysis.  
**Scope**: All price modifications  
**Priority**: High  

**Rules**:
- Every price creation, update, or deletion is logged
- History record includes:
  - Old value and new value
  - Changed by (user)
  - Changed date/time
  - Reason for change (optional)
- History records cannot be deleted

**Validation**:
- System automatically creates history record on price change
- History is read-only

**Exception**: None

**Business Impact**:
- Enables audit compliance
- Supports price analysis
- Provides change tracking

---

## 4. Unit and Packaging Rules

### BR-PM-011: Unit Type Rule

**Rule Name**: Supported Unit Types  
**Description**: Products must use one of the supported unit types.  
**Scope**: Product creation and update  
**Priority**: High  

**Supported Unit Types**:
- **Weight**: kg, g, ton
- **Length**: m, cm, mm
- **Volume**: L, mL, m³
- **Piece**: pcs, units
- **Other**: Custom units

**Validation**:
- Unit type must be selected from predefined list
- Unit conversion factors can be defined for related units (e.g., kg to g)

**Exception**: Custom units can be added by System Administrator

**Business Impact**:
- Standardizes unit measurement
- Enables accurate inventory tracking
- Supports unit conversion

---

### BR-PM-012: Packaging Type Rule

**Rule Name**: Packaging Type Association  
**Description**: Products can be associated with packaging types, but it's optional.  
**Scope**: Product management  
**Priority**: Medium  

**Rules**:
- Packaging type is optional
- One product can have multiple packaging types (e.g., 1kg bag, 5kg bag, 25kg bag)
- Packaging type affects inventory tracking if configured

**Validation**:
- Packaging type must exist in system before association
- System validates packaging type is active

**Exception**: None

**Business Impact**:
- Supports flexible packaging options
- Enables accurate inventory management
- Useful for warehouse operations

---

## 5. Batch and Expiry Rules

### BR-PM-013: Batch Management Rule

**Rule Name**: Batch-Enabled Products  
**Description**: Products can be configured for batch tracking.  
**Scope**: Product configuration and inventory operations  
**Priority**: High  

**Rules**:
- Product has is_batch_managed flag (true/false)
- If is_batch_managed = true:
  - Batch number is required when receiving goods
  - Batch number must be unique per product per warehouse
  - System tracks inventory by batch
- If is_batch_managed = false:
  - Batch number is not required
  - System tracks inventory without batch

**Validation**:
- Batch number format: Alphanumeric, max 50 characters
- Batch number is required for batch-managed products in goods receipt
- System validates batch number uniqueness

**Exception**: None

**Business Impact**:
- Enables lot tracking
- Critical for quality control
- Required for recall management

---

### BR-PM-014: Expiry Date Rule

**Rule Name**: Expiry Date Management  
**Description**: Products can be configured to track expiry dates.  
**Scope**: Product configuration and inventory operations  
**Priority**: High  

**Rules**:
- Product has has_expiry_date flag (true/false)
- If has_expiry_date = true:
  - Expiry date is required when receiving goods
  - System tracks expiry date per batch (if batch-managed) or per inventory item
  - System can set expiry_warning_days (default: 30 days)
- System prevents using expired products in new orders
- System displays warnings for products nearing expiry

**Validation**:
- Expiry date must be in the future when receiving goods
- System checks expiry date before allowing order fulfillment
- Expired products are marked and cannot be used

**Exception**: 
- System Administrator can override for special cases (with audit trail)

**Business Impact**:
- Ensures product quality
- Prevents selling expired products
- Critical for food safety compliance

---

### BR-PM-015: Expiry Warning Rule

**Rule Name**: Expiry Date Warning  
**Description**: System generates warnings for products approaching expiry date.  
**Scope**: Inventory management and reporting  
**Priority**: Medium  

**Rules**:
- Warning threshold: Configurable per product (default: 30 days before expiry)
- System generates warnings when: current_date >= (expiry_date - warning_days)
- Warnings are displayed in:
  - Inventory dashboard
  - Product detail page
  - Warehouse reports
- System can send email/SMS notifications (configurable)

**Validation**:
- System calculates days until expiry
- System compares with warning threshold
- System generates warning if threshold reached

**Exception**: None

**Business Impact**:
- Enables proactive inventory management
- Reduces waste from expired products
- Supports quality control

---

## 6. Product Status and Stock Status Rules

### BR-PM-016: Stock Status Calculation Rule

**Rule Name**: Automatic Stock Status Update  
**Description**: System automatically calculates and updates stock status based on inventory levels.  
**Scope**: Inventory integration  
**Priority**: High  

**Stock Status Values**:
- **In Stock**: quantity_available > 0
- **Out of Stock**: quantity_available = 0
- **Low Stock**: quantity_available <= reorder_point (if configured)

**Calculation**:
```
quantity_available = quantity_on_hand - quantity_reserved

IF quantity_available > 0 THEN
    stock_status = "In Stock"
ELSE
    stock_status = "Out of Stock"
END IF

IF reorder_point is defined AND quantity_available <= reorder_point THEN
    stock_status = "Low Stock" (or add low_stock flag)
END IF
```

**Validation**:
- System updates stock status automatically when inventory changes
- Stock status is read-only (cannot be manually set)

**Exception**: None

**Business Impact**:
- Provides real-time stock visibility
- Enables accurate order processing
- Supports inventory planning

---

## 7. Data Integrity Rules

### BR-PM-017: Product Deletion Rule

**Rule Name**: Product Deletion Constraints  
**Description**: Products with associated records cannot be deleted.  
**Scope**: Product deletion  
**Priority**: Critical  

**Constraints**:
- Product with sales orders: Cannot delete
- Product with purchase orders: Cannot delete
- Product with inventory: Cannot delete (must be zero inventory first)
- Product with price history: Cannot delete (soft delete only)

**Validation**:
- System checks for associated records before deletion
- System displays list of constraints if deletion is attempted
- System offers soft delete option (set status to Discontinued)

**Exception**: 
- System Administrator can force delete with full audit trail (not recommended)

**Business Impact**:
- Maintains referential integrity
- Preserves historical data
- Prevents data loss

---

### BR-PM-018: Product Update History Rule

**Rule Name**: Product Change Tracking  
**Description**: All product changes must be tracked for audit purposes.  
**Scope**: All product modifications  
**Priority**: Medium  

**Rules**:
- System tracks: created_by, created_date, updated_by, updated_date
- Critical field changes are logged (SKU, name, price, status)
- History records are read-only

**Validation**:
- System automatically updates audit fields on changes
- History cannot be modified or deleted

**Exception**: None

**Business Impact**:
- Enables audit compliance
- Supports change tracking
- Provides accountability

---

## 8. Search and Filter Rules

### BR-PM-019: Product Search Rule

**Rule Name**: Product Search Functionality  
**Description**: System supports searching products by multiple criteria.  
**Scope**: Product search and filtering  
**Priority**: High  

**Search Criteria**:
- SKU (exact match or partial)
- Product Name (partial match, case-insensitive)
- Category
- Brand
- Status
- Stock Status

**Validation**:
- Search returns results matching any criteria (OR logic)
- Search is case-insensitive
- Search supports pagination for large result sets

**Exception**: None

**Business Impact**:
- Enables efficient product discovery
- Improves user experience
- Supports quick order entry

---

## Summary

### Critical Rules (Must Implement)
- BR-PM-001: SKU Uniqueness
- BR-PM-003: Required Fields
- BR-PM-006: Price Priority
- BR-PM-007: Price Validity
- BR-PM-009: Minimum Price
- BR-PM-013: Batch Management
- BR-PM-014: Expiry Date
- BR-PM-017: Product Deletion

### High Priority Rules
- BR-PM-002: Product Status
- BR-PM-004: Category Hierarchy
- BR-PM-005: Category Deletion
- BR-PM-008: Price Overlap Prevention
- BR-PM-010: Price History
- BR-PM-011: Unit Type
- BR-PM-016: Stock Status

### Medium Priority Rules
- BR-PM-012: Packaging Type
- BR-PM-015: Expiry Warning
- BR-PM-018: Update History
- BR-PM-019: Product Search

---

**Last Updated**: November 2025  
**Version**: 1.0

