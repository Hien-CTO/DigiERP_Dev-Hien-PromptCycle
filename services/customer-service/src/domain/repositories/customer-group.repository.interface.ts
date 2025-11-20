import { CustomerGroup } from '../entities/customer-group.entity';

export interface CustomerGroupRepository {
  findAll(): Promise<CustomerGroup[]>;
  findById(id: string): Promise<CustomerGroup | null>;
  findByName(name: string): Promise<CustomerGroup | null>;
  findActiveGroups(): Promise<CustomerGroup[]>;
  findCompanyGroups(): Promise<CustomerGroup[]>;
  findRetailGroups(): Promise<CustomerGroup[]>;
  save(customerGroup: CustomerGroup): Promise<CustomerGroup>;
  update(id: string, customerGroup: CustomerGroup): Promise<CustomerGroup>;
  delete(id: string): Promise<void>;
}
