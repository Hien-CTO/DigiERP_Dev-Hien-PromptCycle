export interface MaterialResponse {
  id: number;
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialListResponse {
  materials: MaterialResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
