import { Supplier } from '../entities/supplier.entity';

export interface SupplierRepository {
  findAll(): Promise<Supplier[]>;
  findById(id: string): Promise<Supplier | null>;
  findByName(name: string): Promise<Supplier | null>;
  findByTaxCode(taxCode: string): Promise<Supplier | null>;
  search(params: SupplierSearchParams): Promise<{ data: Supplier[]; total: number }>;
  save(supplier: Supplier): Promise<Supplier>;
  update(id: string, supplier: Supplier): Promise<Supplier>;
  delete(id: string): Promise<void>;
  findActiveSuppliers(): Promise<Supplier[]>;
}

export interface SupplierSearchParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}
