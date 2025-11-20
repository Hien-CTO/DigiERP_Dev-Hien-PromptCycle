export enum WarehouseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export class Warehouse {
  id: number;
  name: string;
  code: string;
  description?: string;
  address: string;
  ward: string;
  state: string;
  country: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  managerId?: number;
  tenantId?: number;
  status: WarehouseStatus;
  capacity?: number;
  currentUtilization?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy: number;
}
