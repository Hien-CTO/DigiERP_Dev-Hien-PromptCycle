export interface CreateCategoryRequest {
  name: string;
  description?: string;
  code?: string;
  parentCategory?: string;
  parentId?: number;
  sortOrder?: number;
  isActive?: boolean;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  code?: string;
  parentCategory?: string;
  parentId?: number;
  sortOrder?: number;
  isActive?: boolean;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  code: string;
  parentCategory: string;
  parentId: number;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
}

export interface CategoryListResponse {
  categories: CategoryResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
