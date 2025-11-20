# Epic: Quản Lý Sản Phẩm & Danh Mục

## 📋 Thông Tin Epic

**Epic ID**: EPIC-001  
**Epic Name**: Quản Lý Sản Phẩm & Danh Mục (Product Management)  
**Priority**: Critical  
**Business Value**: High  
**Status**: In Progress  
**Owner**: Product Owner  
**Created**: November 2025

**Related Services**: product-service, inventory-service, customer-service, sales-service  
**Related Database Tables**: products, cat_product_categories, product_prices, customer_prices, volume_prices, contract_prices, brands, models, units, packaging, batches  
**Traceability**: [Traceability Matrix](../traceability-matrix.md#epic-001-product-management)  
**Service Mapping**: [Service Mapping](../service-mapping.md#epic-001-product-management)  
**Database Mapping**: [Database Mapping](../database-mapping.md#epic-001-product-management)  
**Dependencies**: [Dependencies](../dependencies.md#epic-001-product-management)  
**Business Analyst Docs**: [Use Cases](../business-analyst/use-cases-multi-tier-pricing.md), [Business Rules](../business-analyst/business-rules-product-management.md), [Requirements](../business-analyst/requirements-multi-tier-pricing.md)

---

## 🎯 Mô Tả Epic

Epic này tập trung vào quản lý toàn bộ thông tin sản phẩm, danh mục, thương hiệu, và hệ thống giá đa tầng cho ngành thủy sản. Hệ thống cần hỗ trợ quản lý các loại sản phẩm đặc thù của ngành thủy sản như phụ liệu thức ăn, men vi sinh, enzyme, và các sản phẩm liên quan.

---

## 💼 Mục Tiêu Kinh Doanh

1. **Quản lý tập trung**: Tập trung hóa thông tin sản phẩm, giảm dữ liệu trùng lặp
2. **Tối ưu giá bán**: Hỗ trợ hệ thống giá đa tầng để tối đa hóa lợi nhuận
3. **Phân loại rõ ràng**: Phân loại sản phẩm theo danh mục phù hợp với ngành thủy sản
4. **Truy xuất nguồn gốc**: Quản lý thông tin chi tiết để truy xuất nguồn gốc sản phẩm

---

## 🚀 Features

### Feature 1: Product Information Management
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Quản lý thông tin cơ bản của sản phẩm bao gồm SKU, tên, mô tả, hình ảnh, và các thuộc tính kỹ thuật.

**User Stories**:
- As a **Product Manager**, I want to **create and manage product information** so that **I can maintain accurate product data in the system**
- As a **Sales Representative**, I want to **view detailed product information** so that **I can provide accurate information to customers**
- As a **Warehouse Manager**, I want to **see product specifications** so that **I can handle products correctly in the warehouse**

**Acceptance Criteria**:
- ✅ System allows creating products with SKU, name, description, images
- ✅ System supports product status management (Active, Inactive, Discontinued)
- ✅ System tracks product creation and update history
- ✅ System validates SKU uniqueness
- ✅ System supports product search and filtering

---

### Feature 2: Product Categories Management
**Priority**: Critical  
**Status**: Completed

**Mô tả**: Quản lý danh mục sản phẩm theo cấu trúc phân cấp, phù hợp với ngành thủy sản.

**User Stories**:
- As a **Product Manager**, I want to **organize products into hierarchical categories** so that **products are easy to find and manage**
- As a **Customer**, I want to **browse products by category** so that **I can quickly find products I need**

**Acceptance Criteria**:
- ✅ System supports hierarchical category structure (parent-child relationships)
- ✅ System allows creating, updating, and deleting categories
- ✅ System supports category sorting and ordering
- ✅ System validates category relationships (no circular references)
- ✅ System displays category tree in UI

---

### Feature 3: Product Catalog for Aquaculture Industry
**Priority**: High  
**Status**: Completed

**Mô tả**: Quản lý danh mục sản phẩm đặc thù cho ngành thủy sản bao gồm phụ liệu thức ăn, men vi sinh, enzyme, và các sản phẩm liên quan.

**User Stories**:
- As a **Product Manager**, I want to **categorize products by aquaculture industry standards** so that **products are organized according to industry practices**
- As a **Sales Representative**, I want to **filter products by aquaculture categories** so that **I can quickly find relevant products for customers**

**Acceptance Criteria**:
- ✅ System supports product categories: Phụ liệu thức ăn, Men vi sinh & Enzyme
- ✅ System allows tagging products with specific aquaculture attributes
- ✅ System supports product filtering by industry-specific categories
- ✅ System displays products grouped by aquaculture categories

---

### Feature 4: Brand & Model Management
**Priority**: High  
**Status**: Completed

**Mô tả**: Quản lý thương hiệu và model của sản phẩm.

**User Stories**:
- As a **Product Manager**, I want to **manage product brands and models** so that **I can organize products by manufacturer**
- As a **Customer**, I want to **filter products by brand** so that **I can find products from preferred manufacturers**

**Acceptance Criteria**:
- ✅ System allows creating and managing brands
- ✅ System allows creating and managing product models
- ✅ System links products to brands and models
- ✅ System supports brand logo upload
- ✅ System displays brand information in product listings

---

### Feature 5: Unit & Packaging Management
**Priority**: High  
**Status**: Completed

**Mô tả**: Quản lý đơn vị tính và loại đóng gói của sản phẩm.

**User Stories**:
- As a **Product Manager**, I want to **define product units and packaging types** so that **products are measured and packaged correctly**
- As a **Warehouse Manager**, I want to **see product packaging information** so that **I can handle products appropriately**

**Acceptance Criteria**:
- ✅ System supports multiple unit types (Weight, Length, Volume, Piece, Other)
- ✅ System allows creating and managing packaging types
- ✅ System links products to units and packaging types
- ✅ System supports unit conversion (if applicable)
- ✅ System displays unit and packaging information in product details

---

### Feature 6: Multi-tier Pricing System
**Priority**: Critical  
**Status**: In Progress

**Mô tả**: Hệ thống giá đa tầng hỗ trợ nhiều mức giá cho cùng một sản phẩm dựa trên khách hàng, nhóm khách hàng, hợp đồng, và số lượng.

**User Stories**:
- As a **Sales Manager**, I want to **set different prices for different customers** so that **I can maximize revenue based on customer relationships**
- As a **Sales Representative**, I want to **see the correct price for a customer** so that **I can quote accurately**
- As a **Customer**, I want to **see my contract price** so that **I know the price I should pay**

**Acceptance Criteria**:
- ✅ System supports price types: STANDARD, CUSTOMER, CUSTOMER_GROUP, CONTRACT, VOLUME
- ✅ System applies prices in priority order: Contract > Customer > Customer Group > Volume > Standard
- ✅ System allows setting price validity periods (valid_from, valid_to)
- ✅ System supports discount by percentage or amount
- ✅ System calculates final price correctly based on priority rules
- ✅ System stores price history for audit purposes

**Priority Order**:
1. Contract pricing (highest priority)
2. Customer pricing
3. Customer group pricing
4. Volume pricing
5. Standard pricing (lowest priority)

---

### Feature 7: Product Status & Stock Status Management
**Priority**: High  
**Status**: Completed

**Mô tả**: Quản lý trạng thái sản phẩm và trạng thái tồn kho.

**User Stories**:
- As a **Product Manager**, I want to **manage product status** so that **I can control product availability**
- As a **Sales Representative**, I want to **see product stock status** so that **I can inform customers about availability**

**Acceptance Criteria**:
- ✅ System supports product status management (Active, Inactive, Discontinued)
- ✅ System supports stock status (In Stock, Out of Stock, Low Stock)
- ✅ System automatically updates stock status based on inventory levels
- ✅ System displays status indicators in product listings

---

### Feature 8: Batch & Expiry Date Management
**Priority**: Medium  
**Status**: In Progress

**Mô tả**: Quản lý batch number và expiry date cho sản phẩm có hạn sử dụng.

**User Stories**:
- As a **Warehouse Manager**, I want to **track product batches and expiry dates** so that **I can manage inventory with expiry dates correctly**
- As a **Quality Control Manager**, I want to **see product expiry warnings** so that **I can take action before products expire**

**Acceptance Criteria**:
- ✅ System supports batch management for products (is_batch_managed flag)
- ✅ System supports expiry date tracking (has_expiry_date flag)
- ✅ System allows setting expiry warning days
- ✅ System requires batch number when receiving batch-managed products
- ✅ System displays expiry warnings for products nearing expiry
- ✅ System prevents using expired products in orders

---

### Feature 9: Material & Packaging Type Management
**Priority**: Medium  
**Status**: Completed

**Mô tả**: Quản lý vật liệu và loại đóng gói của sản phẩm.

**User Stories**:
- As a **Product Manager**, I want to **categorize products by material type** so that **I can organize products by composition**
- As a **Warehouse Manager**, I want to **see product material information** so that **I can handle products with appropriate care**

**Acceptance Criteria**:
- ✅ System allows creating and managing material types
- ✅ System links products to material types
- ✅ System supports packaging type management
- ✅ System displays material and packaging information in product details

---

## 📊 Metrics & KPIs

### Business Metrics
- **Product Data Accuracy**: > 95%
- **Time to Create Product**: < 5 minutes
- **Price Calculation Accuracy**: 100%
- **Product Search Success Rate**: > 90%

### Technical Metrics
- **API Response Time**: < 500ms
- **Database Query Performance**: < 100ms
- **System Uptime**: > 99.9%

---

## 🔗 Dependencies

### Internal Dependencies
- **Customer Service**: For customer-based pricing
- **Inventory Service**: For stock status updates
- **Sales Service**: For price calculation in orders

### External Dependencies
- None

---

## 📝 Notes

- Product pricing system is critical for revenue optimization
- Batch and expiry management is important for quality control in aquaculture industry
- Multi-tier pricing requires careful testing to ensure correct priority application

---

**Last Updated**: November 2025  
**Next Review**: December 2025

