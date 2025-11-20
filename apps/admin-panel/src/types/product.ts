export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  categoryId: number;
  materialId?: number;
  brandId?: number;
  modelId?: number;
  unitId?: number;
  packagingTypeId?: number;
  packaging?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  status?: string;
  isActive?: boolean;
  imageUrl?: string;
  images?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  sortOrder?: number;
  isBatchManaged?: boolean;
  hasExpiryDate?: boolean;
  expiryWarningDays?: number;
  batchRequired?: boolean;
  stockStatus?: string;
}

export interface UpdateProductRequest {
  sku?: string;
  name?: string;
  description?: string;
  categoryId?: number;
  materialId?: number;
  brand?: string;
  model?: string;
  unit?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  status?: string;
  isActive?: boolean;
  imageUrl?: string;
  images?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  sortOrder?: number;
  isBatchManaged?: boolean;
  hasExpiryDate?: boolean;
  expiryWarningDays?: number;
  batchRequired?: boolean;
  stockStatus?: string;
}

export interface ProductResponse {
  id: number;
  sku: string;
  name: string;
  description: string;
  categoryId: number;
  materialId?: number;
  brandId?:number;
  unitId?:number;
  modelId?:number;
  category?: {
    id: number;
    name: string;
    displayName: string;
  };
  material?: {
    id: number;
    name: string;
    displayName: string;
  };
  brand: string;
  model: string;
  unit: string;
  packagingTypeId?: number;
  packaging?: string;
  weight: number;
  status: string;
  isActive: boolean;
  imageUrl: string;
  images: string;
  sortOrder: number;
  isBatchManaged: boolean;
  hasExpiryDate: boolean;
  expiryWarningDays: number;
  batchRequired: boolean;
  stockStatus: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
}

export interface ProductListResponse {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PriceCalculationResponse {
  price: number;
  priceType: string;
  discountAmount: number;
  finalPrice: number;
  appliedPriceId: number;
}
