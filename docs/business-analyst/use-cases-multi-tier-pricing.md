# Use Cases: Multi-tier Pricing System

## Use Case Overview

**Feature**: Multi-tier Pricing System  
**Feature ID**: FEAT-001-006  
**Epic**: EPIC-001 - Product Management  
**Priority**: Critical  
**Status**: In Progress

**Related Services**: product-service, customer-service  
**Related Database Tables**: product_prices, customer_prices, volume_prices, contract_prices, products, customers  
**Epic Document**: [Epic: Product Management](../product-owner/epic-product-management.md)  
**Business Rules**: [Business Rules: Product Management](./business-rules-product-management.md)  
**Requirements**: [Requirements: Multi-tier Pricing](./requirements-multi-tier-pricing.md)  
**Traceability**: [Traceability Matrix](../traceability-matrix.md#epic-001-product-management)  
**Service Mapping**: [Service Mapping](../service-mapping.md#epic-001-product-management)  
**Database Mapping**: [Database Mapping](../database-mapping.md#epic-001-product-management)

## Actors

- **Primary Actor**: Sales Manager, Sales Representative
- **Secondary Actors**: Customer, System Administrator
- **Supporting Actors**: Product Service, Customer Service, Contract Service

---

## Use Case 1: Create Customer-Specific Price

### UC-001: Create Customer-Specific Price

**Actor**: Sales Manager  
**Goal**: Set a specific price for a product for a particular customer  
**Preconditions**: 
- User has Sales Manager role
- Customer exists in the system
- Product exists in the system
- Product has standard price defined

**Main Flow**:
1. Sales Manager navigates to Product Pricing Management
2. System displays list of products
3. Sales Manager selects a product
4. System displays current pricing structure for the product
5. Sales Manager clicks "Add Customer Price"
6. System displays customer search dialog
7. Sales Manager searches and selects a customer
8. System displays price entry form
9. Sales Manager enters:
   - Unit price or discount percentage
   - Valid from date
   - Valid to date (optional)
   - Notes (optional)
10. Sales Manager clicks "Save"
11. System validates:
    - Price must be greater than 0
    - Valid from date must be today or future
    - Valid to date must be after valid from date (if provided)
    - Customer must be active
12. System creates customer-specific price record
13. System displays success message
14. System updates price priority list

**Alternative Flows**:

**A1: Price Already Exists**
- At step 9, if customer price already exists for the product:
  - System displays warning message
  - System offers options: Update existing or Cancel
  - If Update: System pre-fills form with existing price
  - Sales Manager modifies and saves
  - System updates existing price record

**A2: Overlapping Validity Period**
- At step 11, if new price validity period overlaps with existing price:
  - System displays warning with overlapping period details
  - System offers options: Replace overlapping price, Adjust dates, or Cancel
  - If Replace: System deactivates overlapping price and creates new one
  - If Adjust: Sales Manager modifies dates and saves

**Exception Flows**:

**E1: Invalid Price**
- At step 11, if price is <= 0:
  - System displays error: "Price must be greater than 0"
  - Flow returns to step 9

**E2: Invalid Date Range**
- At step 11, if valid_from is in the past:
  - System displays error: "Valid from date must be today or future"
  - Flow returns to step 9
- At step 11, if valid_to is before valid_from:
  - System displays error: "Valid to date must be after valid from date"
  - Flow returns to step 9

**E3: Customer Not Found**
- At step 7, if customer doesn't exist:
  - System displays error: "Customer not found"
  - Flow returns to step 6

**E4: System Error**
- At step 12, if system error occurs:
  - System displays error: "Failed to save price. Please try again."
  - Flow returns to step 9

**Postconditions**:
- Customer-specific price is created and active
- Price is available for use in sales orders
- Price history is recorded

---

## Use Case 2: Calculate Price for Customer

### UC-002: Calculate Price for Customer

**Actor**: Sales Representative  
**Goal**: Get the correct price for a product for a specific customer  
**Preconditions**:
- User has Sales Representative role
- Customer exists in the system
- Product exists in the system

**Main Flow**:
1. Sales Representative is creating/editing a sales order
2. Sales Representative selects a customer
3. Sales Representative adds a product to the order
4. System triggers price calculation
5. System retrieves all applicable prices for the product:
   - Contract prices (if customer has active contract)
   - Customer-specific prices
   - Customer group prices (if customer belongs to a group)
   - Volume prices (if quantity qualifies)
   - Standard price
6. System applies price priority:
   - Contract price (if exists and valid) → Use contract price
   - Else Customer price (if exists and valid) → Use customer price
   - Else Customer group price (if exists and valid) → Use group price
   - Else Volume price (if quantity qualifies and valid) → Use volume price
   - Else Standard price → Use standard price
7. System validates selected price is still valid (valid_from <= today <= valid_to)
8. System applies any discounts (percentage or amount)
9. System calculates final price
10. System displays calculated price in order line
11. System displays price breakdown (showing which price type was used)

**Alternative Flows**:

**A1: Multiple Valid Contract Prices**
- At step 6, if multiple contract prices exist:
  - System selects the most recent contract price (by valid_from date)
  - If same date, system selects by creation date (newest first)

**A2: Volume Discount Applies**
- At step 6, if quantity qualifies for volume pricing:
  - System checks if volume price exists for the quantity range
  - If yes, system uses volume price (if no higher priority price exists)
  - System displays volume discount information

**A3: Price Expired**
- At step 7, if selected price has expired:
  - System falls back to next priority price
  - System displays warning: "Previous price expired, using [price type]"
  - Flow continues from step 6 with next priority

**Exception Flows**:

**E1: No Price Found**
- At step 5, if no prices exist for the product:
  - System displays error: "No price defined for this product"
  - System prevents adding product to order
  - Flow returns to step 3

**E2: All Prices Expired**
- At step 7, if all prices have expired:
  - System displays error: "No valid price available. Please contact Sales Manager."
  - System prevents completing order
  - Flow returns to step 3

**E3: Customer Not Selected**
- At step 2, if customer is not selected:
  - System displays error: "Please select a customer first"
  - Flow returns to step 1

**Postconditions**:
- Correct price is calculated and displayed
- Price breakdown is shown to user
- Price is locked for the order (if order is confirmed)

---

## Use Case 3: Create Volume-Based Price

### UC-003: Create Volume-Based Price

**Actor**: Sales Manager  
**Goal**: Set volume-based pricing tiers for a product  
**Preconditions**:
- User has Sales Manager role
- Product exists in the system
- Product has standard price defined

**Main Flow**:
1. Sales Manager navigates to Product Pricing Management
2. System displays list of products
3. Sales Manager selects a product
4. System displays current pricing structure
5. Sales Manager clicks "Add Volume Price"
6. System displays volume price entry form
7. Sales Manager enters:
   - Minimum quantity
   - Maximum quantity (optional, for range)
   - Unit price or discount percentage
   - Valid from date
   - Valid to date (optional)
8. Sales Manager clicks "Save"
9. System validates:
   - Minimum quantity must be >= 1
   - Maximum quantity must be > minimum quantity (if provided)
   - Price must be greater than 0
   - Quantity ranges must not overlap with existing volume prices
   - Valid from date must be today or future
10. System creates volume price record
11. System displays success message

**Alternative Flows**:

**A1: Create Multiple Tiers**
- At step 11, Sales Manager can add another volume tier
- System ensures quantity ranges don't overlap
- Example tiers:
  - Tier 1: 1-99 units → Standard price
  - Tier 2: 100-499 units → 5% discount
  - Tier 3: 500+ units → 10% discount

**A2: Overlapping Quantity Range**
- At step 9, if quantity range overlaps with existing volume price:
  - System displays warning with overlapping range details
  - System offers options: Replace, Adjust range, or Cancel
  - If Replace: System deactivates overlapping price and creates new one
  - If Adjust: Sales Manager modifies range and saves

**Exception Flows**:

**E1: Invalid Quantity Range**
- At step 9, if minimum quantity < 1:
  - System displays error: "Minimum quantity must be at least 1"
  - Flow returns to step 7
- At step 9, if maximum <= minimum:
  - System displays error: "Maximum quantity must be greater than minimum quantity"
  - Flow returns to step 7

**E2: Gap in Quantity Ranges**
- At step 9, if there's a gap in quantity ranges (not critical, but system warns):
  - System displays warning: "Gap detected in quantity ranges. Some quantities may not have volume pricing."
  - Sales Manager can choose to continue or adjust

**Postconditions**:
- Volume price tier is created
- Price is available for use when order quantity qualifies
- Price history is recorded

---

## Use Case 4: View Price History

### UC-004: View Price History

**Actor**: Sales Manager, Accountant  
**Goal**: View historical price changes for audit and analysis  
**Preconditions**:
- User has appropriate role (Sales Manager or Accountant)
- Product exists in the system

**Main Flow**:
1. User navigates to Product Pricing Management
2. System displays list of products
3. User selects a product
4. System displays current pricing structure
5. User clicks "View Price History"
6. System retrieves all price history records for the product
7. System displays price history table with:
   - Price type (Standard, Customer, Group, Contract, Volume)
   - Price value
   - Valid from date
   - Valid to date
   - Created by
   - Created date
   - Status (Active, Expired, Cancelled)
8. User can filter by:
   - Price type
   - Date range
   - Status
   - Created by
9. User can export price history to Excel/PDF

**Alternative Flows**:

**A1: Filter Price History**
- At step 8, user applies filters
- System refreshes table with filtered results
- User can clear filters to see all history

**A2: Compare Prices**
- At step 7, user selects multiple price records
- User clicks "Compare"
- System displays side-by-side comparison of selected prices

**Exception Flows**:

**E1: No Price History**
- At step 6, if no price history exists:
  - System displays message: "No price history available for this product"
  - System shows only current prices

**Postconditions**:
- Price history is displayed
- User can analyze price changes over time

---

## Use Case 5: Update Price Validity Period

### UC-005: Update Price Validity Period

**Actor**: Sales Manager  
**Goal**: Extend or modify price validity period  
**Preconditions**:
- User has Sales Manager role
- Price record exists in the system
- Price is currently active or scheduled

**Main Flow**:
1. Sales Manager navigates to Product Pricing Management
2. System displays list of products
3. Sales Manager selects a product
4. System displays current pricing structure
5. Sales Manager selects a price record
6. Sales Manager clicks "Edit"
7. System displays price edit form with current values
8. Sales Manager modifies:
   - Valid from date
   - Valid to date
9. Sales Manager clicks "Save"
10. System validates:
    - Valid from date must be today or future
    - Valid to date must be after valid from date (if provided)
    - No overlapping periods with other prices of same type
11. System updates price record
12. System displays success message

**Alternative Flows**:

**A1: Extend Expired Price**
- At step 5, if price has expired:
  - Sales Manager can reactivate by updating valid_to date
  - System creates new price record or updates existing based on business rule

**A2: Shorten Validity Period**
- At step 8, if Sales Manager shortens validity period:
  - System checks for active orders using this price
  - If orders exist, system displays warning
  - Sales Manager can choose to proceed or cancel

**Exception Flows**:

**E1: Invalid Date Range**
- At step 10, if dates are invalid:
  - System displays appropriate error message
  - Flow returns to step 7

**E2: Overlapping Period**
- At step 10, if period overlaps with another price:
  - System displays error with overlapping price details
  - Flow returns to step 7

**Postconditions**:
- Price validity period is updated
- Price history reflects the change
- System applies updated validity in price calculations

---

## Business Rules Summary

1. **Price Priority Rule**: Contract > Customer > Customer Group > Volume > Standard
2. **Price Validity Rule**: Price must have valid_from <= today <= valid_to to be used
3. **Uniqueness Rule**: Only one active price per type per product per customer/group at a time
4. **Overlap Prevention Rule**: Prices of the same type cannot have overlapping validity periods
5. **Price History Rule**: All price changes must be recorded for audit
6. **Minimum Price Rule**: All prices must be greater than 0

---

**Last Updated**: November 2025  
**Version**: 1.0

