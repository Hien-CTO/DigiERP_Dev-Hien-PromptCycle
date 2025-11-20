export enum AreaType {
  STORAGE = 'STORAGE',
  PICKING = 'PICKING',
  RECEIVING = 'RECEIVING',
  SHIPPING = 'SHIPPING',
  QUALITY_CONTROL = 'QUALITY_CONTROL',
  MAINTENANCE = 'MAINTENANCE',
}

export enum AreaStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export class Area {
  id: number;
  name: string;
  code: string;
  description?: string;
  warehouseId: number;
  type: AreaType;
  status: AreaStatus;
  capacity?: number;
  currentUtilization?: number;
  temperature?: number;
  humidity?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
