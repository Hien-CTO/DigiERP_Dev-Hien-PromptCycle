# Requirements Detail: Multi-tier Pricing System

## Feature Overview

**Feature**: Multi-tier Pricing System  
**Feature ID**: FEAT-001-006  
**Epic**: EPIC-001 - Product Management

**Related Services**: product-service, customer-service  
**Related Database Tables**: product_prices, customer_prices, volume_prices, contract_prices, products, customers  
**Epic Document**: [Epic: Product Management](../product-owner/epic-product-management.md)  
**Use Cases**: [Use Cases: Multi-tier Pricing](./use-cases-multi-tier-pricing.md)  
**Business Rules**: [Business Rules: Product Management](./business-rules-product-management.md)  
**Traceability**: [Traceability Matrix](../traceability-matrix.md#epic-001-product-management)  
**Service Mapping**: [Service Mapping](../service-mapping.md#epic-001-product-management)  
**Database Mapping**: [Database Mapping](../database-mapping.md#epic-001-product-management)  
**Priority**: Critical  
**Status**: In Progress

## Business Context

The Multi-tier Pricing System enables the business to maximize revenue by applying different prices to the same product based on customer relationships, contracts, customer groups, and order volumes. This system is critical for competitive pricing strategies and customer relationship management.

## User Stories with Given-When-Then Format

---

### User Story 1: Create Customer-Specific Price

**As a** Sales Manager  
**I want to** set a specific price for a product for a particular customer  
**So that** I can offer personalized pricing based on customer relationships and maximize revenue

#### Acceptance Criteria

**AC-001: Create Customer Price - Happy Path**

**Given** I am logged in as a Sales Manager  
**And** a product exists in the system with SKU "PROD-001"  
**And** the product has a standard price of 100,000 VND  
**And** a customer "Customer ABC" exists in the system  
**When** I navigate to Product Pricing Management  
**And** I select product "PROD-001"  
**And** I click "Add Customer Price"  
**And** I search and select customer "Customer ABC"  
**And** I enter unit price 90,000 VND  
**And** I set valid from date to today  
**And** I click "Save"  
**Then** the system creates a customer-specific price record  
**And** the system displays success message "Customer price created successfully"  
**And** the customer price appears in the pricing structure for product "PROD-001"  
**And** the price is immediately available for use in sales orders for "Customer ABC"

**AC-002: Create Customer Price - With Discount Percentage**

**Given** I am logged in as a Sales Manager  
**And** a product exists with standard price 100,000 VND  
**And** a customer exists in the system  
**When** I create a customer price  
**And** I select discount type "Percentage"  
**And** I enter discount 10%  
**And** I save the price  
**Then** the system calculates unit price as 90,000 VND (100,000 - 10%)  
**And** the system stores the calculated price  
**And** the system displays the calculated price in the price list

**AC-003: Create Customer Price - With Validity Period**

**Given** I am logged in as a Sales Manager  
**And** a product and customer exist in the system  
**When** I create a customer price  
**And** I set valid from date to "2025-12-01"  
**And** I set valid to date to "2025-12-31"  
**And** I save the price  
**Then** the system creates the price with validity period  
**And** the price is only used in orders between "2025-12-01" and "2025-12-31"  
**And** after "2025-12-31", the system falls back to next priority price

**AC-004: Create Customer Price - Price Already Exists**

**Given** I am logged in as a Sales Manager  
**And** a customer price already exists for product "PROD-001" and customer "Customer ABC"  
**When** I attempt to create another customer price for the same product and customer  
**Then** the system displays warning "Customer price already exists for this product and customer"  
**And** the system offers options: "Update existing price" or "Cancel"  
**When** I select "Update existing price"  
**Then** the system pre-fills the form with existing price data  
**And** I can modify and save the updated price

**AC-005: Create Customer Price - Invalid Price**

**Given** I am logged in as a Sales Manager  
**And** a product and customer exist in the system  
**When** I create a customer price  
**And** I enter unit price 0 or negative value  
**And** I attempt to save  
**Then** the system displays error "Price must be greater than 0"  
**And** the system prevents saving  
**And** the form remains open for correction

**AC-006: Create Customer Price - Invalid Date Range**

**Given** I am logged in as a Sales Manager  
**And** a product and customer exist in the system  
**When** I create a customer price  
**And** I set valid from date to a past date  
**And** I attempt to save  
**Then** the system displays error "Valid from date must be today or future"  
**And** the system prevents saving

**When** I set valid to date before valid from date  
**And** I attempt to save  
**Then** the system displays error "Valid to date must be after valid from date"  
**And** the system prevents saving

---

### User Story 2: Calculate Price for Customer

**As a** Sales Representative  
**I want to** see the correct price for a product for a specific customer  
**So that** I can quote accurately and process orders with the right pricing

#### Acceptance Criteria

**AC-007: Calculate Price - Contract Price Priority**

**Given** I am logged in as a Sales Representative  
**And** I am creating a sales order  
**And** I have selected customer "Customer ABC"  
**And** product "PROD-001" has the following prices:
- Standard price: 100,000 VND
- Customer price: 90,000 VND
- Contract price: 85,000 VND (active contract)
**When** I add product "PROD-001" to the order  
**Then** the system calculates price using contract price (85,000 VND)  
**And** the system displays price 85,000 VND in the order line  
**And** the system shows price breakdown indicating "Contract Price" was used

**AC-008: Calculate Price - Customer Price Priority**

**Given** I am logged in as a Sales Representative  
**And** I am creating a sales order for customer "Customer ABC"  
**And** product "PROD-001" has:
- Standard price: 100,000 VND
- Customer price: 90,000 VND (valid)
- No active contract price
**When** I add product "PROD-001" to the order  
**Then** the system calculates price using customer price (90,000 VND)  
**And** the system displays price 90,000 VND  
**And** the system shows price breakdown indicating "Customer Price" was used

**AC-009: Calculate Price - Customer Group Price Priority**

**Given** I am logged in as a Sales Representative  
**And** I am creating a sales order for customer "Customer ABC"  
**And** customer "Customer ABC" belongs to customer group "VIP Group"  
**And** product "PROD-001" has:
- Standard price: 100,000 VND
- Customer group price for "VIP Group": 92,000 VND
- No customer-specific price
- No contract price
**When** I add product "PROD-001" to the order  
**Then** the system calculates price using customer group price (92,000 VND)  
**And** the system displays price 92,000 VND  
**And** the system shows price breakdown indicating "Customer Group Price" was used

**AC-010: Calculate Price - Volume Price Priority**

**Given** I am logged in as a Sales Representative  
**And** I am creating a sales order for customer "Customer ABC"  
**And** product "PROD-001" has:
- Standard price: 100,000 VND
- Volume price: 95,000 VND for quantity 100-499 units
- No customer, group, or contract prices
**When** I add product "PROD-001" with quantity 150 units  
**Then** the system calculates price using volume price (95,000 VND)  
**And** the system displays price 95,000 VND  
**And** the system shows price breakdown indicating "Volume Price" was used

**AC-011: Calculate Price - Standard Price Fallback**

**Given** I am logged in as a Sales Representative  
**And** I am creating a sales order for customer "Customer ABC"  
**And** product "PROD-001" has:
- Standard price: 100,000 VND
- No customer, group, contract, or volume prices
**When** I add product "PROD-001" to the order  
**Then** the system calculates price using standard price (100,000 VND)  
**And** the system displays price 100,000 VND  
**And** the system shows price breakdown indicating "Standard Price" was used

**AC-012: Calculate Price - Expired Price Fallback**

**Given** I am logged in as a Sales Representative  
**And** I am creating a sales order for customer "Customer ABC"  
**And** product "PROD-001" has:
- Standard price: 100,000 VND
- Customer price: 90,000 VND (expired on 2025-11-01, today is 2025-11-15)
**When** I add product "PROD-001" to the order  
**Then** the system detects customer price is expired  
**And** the system falls back to standard price (100,000 VND)  
**And** the system displays warning "Previous customer price expired, using standard price"  
**And** the system displays price 100,000 VND

**AC-013: Calculate Price - No Price Defined**

**Given** I am logged in as a Sales Representative  
**And** I am creating a sales order  
**And** product "PROD-001" exists but has no prices defined (no standard price)  
**When** I attempt to add product "PROD-001" to the order  
**Then** the system displays error "No price defined for this product"  
**And** the system prevents adding the product to the order  
**And** the system suggests contacting Sales Manager to set up pricing

**AC-014: Calculate Price - All Prices Expired**

**Given** I am logged in as a Sales Representative  
**And** I am creating a sales order for customer "Customer ABC"  
**And** product "PROD-001" has:
- Standard price: 100,000 VND (expired)
- Customer price: 90,000 VND (expired)
- All other prices expired
**When** I attempt to add product "PROD-001" to the order  
**Then** the system displays error "No valid price available. Please contact Sales Manager."  
**And** the system prevents completing the order  
**And** the system suggests creating a new price

---

### User Story 3: Create Volume-Based Price

**As a** Sales Manager  
**I want to** set volume-based pricing tiers for a product  
**So that** I can incentivize larger orders and maximize revenue through quantity discounts

#### Acceptance Criteria

**AC-015: Create Volume Price - Single Tier**

**Given** I am logged in as a Sales Manager  
**And** a product "PROD-001" exists with standard price 100,000 VND  
**When** I navigate to Product Pricing Management  
**And** I select product "PROD-001"  
**And** I click "Add Volume Price"  
**And** I enter:
- Minimum quantity: 100
- Maximum quantity: 499
- Unit price: 95,000 VND
- Valid from: today
**And** I click "Save"  
**Then** the system creates volume price tier  
**And** the system displays success message  
**And** the volume price is available for orders with quantity 100-499 units

**AC-016: Create Volume Price - Multiple Tiers**

**Given** I am logged in as a Sales Manager  
**And** a product exists with standard price 100,000 VND  
**When** I create multiple volume price tiers:
- Tier 1: 1-99 units → 100,000 VND (standard)
- Tier 2: 100-499 units → 95,000 VND
- Tier 3: 500+ units → 90,000 VND  
**Then** the system creates all three tiers  
**And** the system validates quantity ranges don't overlap  
**And** each tier is available for its quantity range

**AC-017: Create Volume Price - Overlapping Range**

**Given** I am logged in as a Sales Manager  
**And** a volume price already exists for quantity 100-499  
**When** I attempt to create another volume price for quantity 200-600  
**Then** the system detects overlap  
**And** the system displays warning "Quantity range overlaps with existing volume price (100-499)"  
**And** the system offers options: "Replace overlapping price", "Adjust range", or "Cancel"  
**When** I select "Replace overlapping price"  
**Then** the system deactivates the old price  
**And** the system creates the new price

**AC-018: Create Volume Price - Invalid Quantity Range**

**Given** I am logged in as a Sales Manager  
**And** a product exists in the system  
**When** I create a volume price  
**And** I enter minimum quantity 0 or negative  
**And** I attempt to save  
**Then** the system displays error "Minimum quantity must be at least 1"  
**And** the system prevents saving

**When** I enter maximum quantity less than or equal to minimum quantity  
**And** I attempt to save  
**Then** the system displays error "Maximum quantity must be greater than minimum quantity"  
**And** the system prevents saving

---

### User Story 4: View Price History

**As a** Sales Manager or Accountant  
**I want to** view historical price changes for a product  
**So that** I can audit price changes and analyze pricing trends

#### Acceptance Criteria

**AC-019: View Price History - Display All History**

**Given** I am logged in as a Sales Manager  
**And** product "PROD-001" has price history with multiple changes  
**When** I navigate to Product Pricing Management  
**And** I select product "PROD-001"  
**And** I click "View Price History"  
**Then** the system displays price history table with columns:
- Price type (Standard, Customer, Group, Contract, Volume)
- Price value
- Valid from date
- Valid to date
- Created by (user)
- Created date/time
- Status (Active, Expired, Cancelled)  
**And** all price history records are displayed in chronological order

**AC-020: View Price History - Filter by Price Type**

**Given** I am viewing price history for a product  
**When** I apply filter "Price Type = Customer"  
**Then** the system displays only customer price history records  
**And** other price types are hidden

**AC-021: View Price History - Filter by Date Range**

**Given** I am viewing price history for a product  
**When** I apply date range filter from "2025-01-01" to "2025-06-30"  
**Then** the system displays only price changes within that date range  
**And** price changes outside the range are hidden

**AC-022: View Price History - No History**

**Given** I am logged in as a Sales Manager  
**And** product "PROD-002" exists but has no price history  
**When** I select product "PROD-002"  
**And** I click "View Price History"  
**Then** the system displays message "No price history available for this product"  
**And** the system shows only current prices

**AC-023: View Price History - Export**

**Given** I am viewing price history for a product  
**When** I click "Export to Excel"  
**Then** the system generates Excel file with all price history data  
**And** the file includes all columns from the table  
**And** the file is downloadable

---

## Data Requirements

### Data Entities

1. **ProductPrice**
   - product_id (FK to Product)
   - price_type (STANDARD, CUSTOMER, CUSTOMER_GROUP, CONTRACT, VOLUME)
   - customer_id (nullable, FK to Customer)
   - customer_group_id (nullable, FK to CustomerGroup)
   - contract_id (nullable, FK to Contract)
   - unit_price (decimal, required)
   - discount_percentage (decimal, nullable)
   - discount_amount (decimal, nullable)
   - valid_from (date, required)
   - valid_to (date, nullable)
   - min_quantity (nullable, for volume pricing)
   - max_quantity (nullable, for volume pricing)
   - is_active (boolean)
   - created_by (FK to User)
   - created_date (datetime)
   - updated_by (FK to User)
   - updated_date (datetime)

2. **PriceHistory**
   - price_id (FK to ProductPrice)
   - old_value (json, stores old price data)
   - new_value (json, stores new price data)
   - changed_by (FK to User)
   - changed_date (datetime)
   - change_reason (text, nullable)

### Data Relationships

- ProductPrice → Product (Many-to-One)
- ProductPrice → Customer (Many-to-One, optional)
- ProductPrice → CustomerGroup (Many-to-One, optional)
- ProductPrice → Contract (Many-to-One, optional)
- PriceHistory → ProductPrice (Many-to-One)

---

## Integration Requirements

### Internal Services

1. **Customer Service**
   - Get customer information
   - Get customer group information
   - Validate customer status

2. **Contract Service**
   - Get active contracts for customer
   - Validate contract validity

3. **Product Service**
   - Get product information
   - Validate product exists and is active

4. **Sales Service**
   - Calculate price for order line
   - Apply pricing in order creation

### External Services

- None

---

## Non-Functional Requirements

### Performance
- Price calculation must complete in < 100ms
- Price history query must complete in < 500ms
- Support up to 10,000 price records per product

### Security
- Only Sales Manager can create/update/delete prices
- Sales Representative can only view prices
- All price changes must be audited

### Usability
- Price breakdown must be clearly displayed
- Price history must be easily searchable and filterable
- Error messages must be clear and actionable

### Reliability
- Price calculation must be 100% accurate
- System must handle concurrent price updates
- Price history must never be lost

---

## Edge Cases and Business Exceptions

1. **Multiple Valid Contract Prices**: Use most recent contract price
2. **Price Expires During Order Processing**: Fall back to next priority price
3. **Customer Changes Group**: Recalculate prices for existing orders (if applicable)
4. **Volume Price with Partial Quantity**: Apply volume price if quantity qualifies
5. **Price Update While Order in Progress**: Lock price at order confirmation

---

**Last Updated**: November 2025  
**Version**: 1.0

