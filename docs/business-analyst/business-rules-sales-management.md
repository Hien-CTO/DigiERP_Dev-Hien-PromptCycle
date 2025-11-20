# Business Rules: Sales Management Module

## Module Overview

**Module**: Sales Management  
**Epic**: EPIC-004 - Sales & Order Management

**Related Services**: sales-service, product-service, customer-service, inventory-service, financial-service  
**Related Database Tables**: sales_orders, sales_order_items, quotes, quote_items, deliveries, delivery_items  
**Epic Document**: [Epic: Sales Management](../product-owner/epic-sales-management.md)  
**Traceability**: [Traceability Matrix](../traceability-matrix.md#epic-004-sales-management)  
**Service Mapping**: [Service Mapping](../service-mapping.md#epic-004-sales-management)  
**Database Mapping**: [Database Mapping](../database-mapping.md#epic-004-sales-management)  
**Last Updated**: November 2025  
**Version**: 1.0

---

## 1. Order Management Rules

### BR-SALES-001: Order Creation Rule

**Rule Name**: Order Creation Requirements  
**Description**: Orders must have required information when created.  
**Scope**: Order creation  
**Priority**: Critical  

**Required Fields**:
- Customer (must exist and be active)
- Order date
- Order type
- At least one order line item

**Validation**:
- Customer must be active
- Order date cannot be in the past (unless override allowed)
- Order type must be valid
- Each order line must have product and quantity > 0

**Exception**: 
- System Administrator can allow past order dates (with audit trail)

**Business Impact**:
- Ensures order data completeness
- Prevents invalid orders
- Critical for order processing

---

### BR-SALES-002: Order Type Rule

**Rule Name**: Supported Order Types  
**Description**: System supports multiple order types with different business rules.  
**Scope**: Order management  
**Priority**: High  

**Order Types**:
- **RETAIL**: Retail sales, standard pricing
- **WHOLESALE**: Wholesale sales, volume pricing
- **FOC**: Free of Charge, price = 0
- **GIFT**: Gift orders, may have special pricing
- **DEMO**: Demo products, may have special pricing
- **CONSIGNMENT**: Consignment sales, different accounting treatment
- **SAMPLE**: Sample products, typically free
- **RETURN**: Return orders, negative quantities

**Validation**:
- Order type must be selected from predefined list
- Different order types may have different approval workflows
- FOC, GIFT, DEMO, SAMPLE orders may require approval

**Exception**: None

**Business Impact**:
- Enables different business scenarios
- Supports various sales models
- Critical for accurate accounting

---

### BR-SALES-003: Order Status Workflow Rule

**Rule Name**: Order Status Progression  
**Description**: Orders must follow specific status workflow.  
**Scope**: Order processing  
**Priority**: Critical  

**Status Flow**:
1. **DRAFT**: Order created but not submitted
2. **PENDING**: Order submitted, pending confirmation
3. **CONFIRMED**: Order confirmed, ready for processing
4. **PROCESSING**: Order being fulfilled
5. **SHIPPED**: Order shipped to customer
6. **DELIVERED**: Order delivered to customer
7. **CANCELLED**: Order cancelled

**Rules**:
- Orders can only move forward in status (except cancellation)
- Once CONFIRMED, order cannot be modified (except by authorized users)
- Once SHIPPED, order cannot be cancelled (except return process)

**Validation**:
- System validates status transitions
- System prevents invalid status changes
- System requires reason for cancellation

**Exception**: 
- System Administrator can override status (with audit trail)

**Business Impact**:
- Maintains order integrity
- Prevents order manipulation
- Critical for order tracking

---

## 2. Credit Management Rules

### BR-SALES-004: Credit Limit Check Rule

**Rule Name**: Credit Limit Validation  
**Description**: System checks customer credit limit before allowing order creation.  
**Scope**: Order creation  
**Priority**: Critical  

**Rules**:
- System calculates customer outstanding balance (accounts receivable)
- System calculates: outstanding_balance + order_amount
- If (outstanding_balance + order_amount) > credit_limit:
  - System prevents order creation
  - System displays error "Credit limit exceeded"
  - System shows current balance and credit limit
- Exception: System can allow with approval (configurable)

**Validation**:
- Credit limit must be > 0 for credit customers
- System checks credit limit before order confirmation
- System recalculates on order amount changes

**Exception**: 
- Credit Manager can approve orders exceeding credit limit
- System records approval with reason

**Business Impact**:
- Prevents credit risk
- Protects cash flow
- Critical for financial control

---

### BR-SALES-005: Payment Terms Rule

**Rule Name**: Payment Terms Management  
**Description**: Orders use customer payment terms for due date calculation.  
**Scope**: Order processing  
**Priority**: High  

**Payment Terms Examples**:
- **NET_30**: Payment due 30 days from invoice date
- **NET_60**: Payment due 60 days from invoice date
- **DUE_ON_RECEIPT**: Payment due immediately
- **CASH_ON_DELIVERY**: Payment on delivery

**Rules**:
- Payment terms are set per customer
- System calculates due date = invoice_date + payment_terms_days
- System tracks payment status per order

**Validation**:
- Payment terms must be valid
- Due date is calculated automatically

**Exception**: None

**Business Impact**:
- Enables accurate accounts receivable management
- Supports cash flow planning
- Critical for financial operations

---

### BR-SALES-006: Credit Hold Rule

**Rule Name**: Credit Hold Functionality  
**Description**: Customers can be placed on credit hold to prevent new orders.  
**Scope**: Order creation  
**Priority**: High  

**Rules**:
- Customer can have credit_hold flag (true/false)
- If credit_hold = true:
  - System prevents creating new orders
  - System displays message "Customer is on credit hold"
  - System requires credit hold reason
- Credit hold can be released by Credit Manager

**Validation**:
- System checks credit_hold flag before order creation
- System requires reason for credit hold

**Exception**: 
- System Administrator can override credit hold (with audit trail)

**Business Impact**:
- Protects against bad debt
- Enables credit risk management
- Critical for financial control

---

## 3. Pricing Rules

### BR-SALES-007: Price Calculation Rule

**Rule Name**: Price Calculation in Orders  
**Description**: System calculates prices using multi-tier pricing engine.  
**Scope**: Order line creation  
**Priority**: Critical  

**Price Priority** (from Product Management):
1. Contract price (highest)
2. Customer price
3. Customer group price
4. Volume price
5. Standard price (lowest)

**Rules**:
- System calls Product Service pricing engine
- System applies price based on customer and quantity
- System displays price breakdown showing which price type was used
- Price is locked when order is confirmed

**Validation**:
- Price must be > 0 (except FOC, GIFT, SAMPLE orders)
- System validates price is still valid (not expired)

**Exception**: 
- Sales Manager can override price with approval

**Business Impact**:
- Ensures accurate pricing
- Maximizes revenue
- Critical for order processing

---

### BR-SALES-008: Discount Application Rule

**Rule Name**: Discount Rules  
**Description**: System supports discounts at order and line level.  
**Scope**: Order processing  
**Priority**: High  

**Discount Types**:
- **Percentage**: Discount as percentage of price
- **Amount**: Fixed discount amount
- **Line Discount**: Applied to specific line item
- **Order Discount**: Applied to entire order

**Rules**:
- Discounts can be applied at line or order level
- System calculates: final_price = price - discount
- Discounts may require approval based on amount
- System tracks discount reason

**Validation**:
- Discount percentage: 0% to 100%
- Discount amount: 0 to price (cannot exceed price)
- System validates discount doesn't result in negative price

**Exception**: 
- System Administrator can allow discounts exceeding limits (with approval)

**Business Impact**:
- Enables flexible pricing
- Supports sales promotions
- Critical for competitive pricing

---

## 4. Inventory Availability Rules

### BR-SALES-009: Inventory Check Rule

**Rule Name**: Inventory Availability Validation  
**Description**: System checks inventory availability before allowing order creation.  
**Scope**: Order creation  
**Priority**: Critical  

**Rules**:
- System checks quantity_available for each order line
- If quantity_available < order_quantity:
  - System displays warning "Insufficient inventory"
  - System shows available quantity
  - System can allow backorder (if configured)
- System reserves inventory when order is confirmed

**Validation**:
- System checks inventory before order confirmation
- System validates inventory is available

**Exception**: 
- System can allow backorders (orders for unavailable items)
- Backorders are fulfilled when inventory becomes available

**Business Impact**:
- Prevents overselling
- Ensures order fulfillment
- Critical for customer satisfaction

---

### BR-SALES-010: Inventory Reservation Rule

**Rule Name**: Inventory Reservation on Order Confirmation  
**Description**: System reserves inventory when order is confirmed.  
**Scope**: Order confirmation  
**Priority**: Critical  

**Rules**:
- When order status changes to CONFIRMED:
  - System reserves inventory for each order line
  - System increases quantity_reserved
  - System decreases quantity_available
- When order is cancelled or completed:
  - System releases reserved inventory
  - System decreases quantity_reserved
  - System increases quantity_available

**Validation**:
- System validates inventory is available before reservation
- System prevents reservation if insufficient inventory

**Exception**: None

**Business Impact**:
- Ensures inventory is available for order
- Prevents double-booking
- Critical for order fulfillment

---

## 5. Order Fulfillment Rules

### BR-SALES-011: Goods Issue Requirement Rule

**Rule Name**: Goods Issue for Order Fulfillment  
**Description**: Orders must have goods issue before shipping.  
**Scope**: Order fulfillment  
**Priority**: Critical  

**Rules**:
- Order cannot be shipped without goods issue
- Goods issue can be created from confirmed order
- System tracks goods issue status per order line
- Partial goods issue is allowed

**Validation**:
- System checks goods issue exists before allowing shipment
- System validates issued quantity <= ordered quantity

**Exception**: 
- Virtual products or services may not require goods issue

**Business Impact**:
- Ensures physical fulfillment
- Maintains inventory accuracy
- Critical for order processing

---

### BR-SALES-012: Partial Fulfillment Rule

**Rule Name**: Partial Order Fulfillment  
**Description**: Orders can be partially fulfilled.  
**Scope**: Order fulfillment  
**Priority**: High  

**Rules**:
- System allows partial goods issue
- System tracks fulfilled quantity vs ordered quantity
- Order status remains PROCESSING until fully fulfilled
- System can ship partial orders (if configured)

**Validation**:
- Issued quantity <= ordered quantity
- System tracks fulfillment progress

**Exception**: None

**Business Impact**:
- Enables flexible fulfillment
- Improves customer service
- Supports business operations

---

## 6. Order Modification Rules

### BR-SALES-013: Order Modification Restriction Rule

**Rule Name**: Order Modification Constraints  
**Description**: Orders can only be modified in certain statuses.  
**Scope**: Order management  
**Priority**: High  

**Rules**:
- Orders can be modified only when status = DRAFT or PENDING
- Once CONFIRMED, orders cannot be modified (except by authorized users)
- Modifications require approval if order is CONFIRMED
- System maintains modification history

**Validation**:
- System checks order status before allowing modification
- System validates modified data

**Exception**: 
- Sales Manager can modify confirmed orders (with approval)
- System Administrator can modify any order (with audit trail)

**Business Impact**:
- Maintains order integrity
- Prevents unauthorized changes
- Critical for audit compliance

---

### BR-SALES-014: Order Cancellation Rule

**Rule Name**: Order Cancellation Process  
**Description**: Orders can be cancelled with specific rules.  
**Scope**: Order management  
**Priority**: High  

**Rules**:
- Orders can be cancelled when status = DRAFT, PENDING, or CONFIRMED
- Once PROCESSING or SHIPPED, orders cannot be cancelled (use return process)
- Cancellation requires reason
- System releases reserved inventory on cancellation
- System maintains cancellation history

**Validation**:
- System checks order status before allowing cancellation
- System requires cancellation reason
- System validates cancellation is allowed

**Exception**: 
- System Administrator can cancel any order (with audit trail)

**Business Impact**:
- Enables order management
- Maintains data integrity
- Supports business operations

---

## 7. Order Types Specific Rules

### BR-SALES-015: FOC Order Rule

**Rule Name**: Free of Charge Order Rules  
**Description**: FOC orders have special pricing and approval requirements.  
**Scope**: FOC order processing  
**Priority**: High  

**Rules**:
- FOC orders have price = 0 for all items
- FOC orders require approval from Sales Manager or higher
- FOC orders may have quantity limits
- System tracks FOC order reasons

**Validation**:
- System validates price = 0 for FOC orders
- System requires approval before confirmation
- System may require reason for FOC

**Exception**: None

**Business Impact**:
- Controls free product distribution
- Maintains cost control
- Supports marketing activities

---

### BR-SALES-016: Return Order Rule

**Rule Name**: Return Order Processing  
**Description**: Return orders have special handling.  
**Scope**: Return order processing  
**Priority**: High  

**Rules**:
- Return orders have negative quantities
- Return orders must reference original sales order
- Return orders require approval
- System validates returned items match original order
- System processes inventory return (increases inventory)

**Validation**:
- Return order must reference valid sales order
- Returned items must exist in original order
- Return quantity <= original order quantity

**Exception**: 
- System can allow returns without original order (with approval)

**Business Impact**:
- Enables customer returns
- Maintains inventory accuracy
- Supports customer service

---

## Summary

### Critical Rules (Must Implement)
- BR-SALES-001: Order Creation
- BR-SALES-003: Order Status Workflow
- BR-SALES-004: Credit Limit Check
- BR-SALES-007: Price Calculation
- BR-SALES-009: Inventory Check
- BR-SALES-010: Inventory Reservation
- BR-SALES-011: Goods Issue Requirement

### High Priority Rules
- BR-SALES-002: Order Type
- BR-SALES-005: Payment Terms
- BR-SALES-006: Credit Hold
- BR-SALES-008: Discount Application
- BR-SALES-012: Partial Fulfillment
- BR-SALES-013: Order Modification
- BR-SALES-014: Order Cancellation
- BR-SALES-015: FOC Order
- BR-SALES-016: Return Order

---

**Last Updated**: November 2025  
**Version**: 1.0

