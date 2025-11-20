import { Customer } from '../entities/customer.entity';

export interface CustomerRepository {
  findAll(): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
  findByName(name: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findByPhone(phone: string): Promise<Customer | null>;
  findByTaxCode(taxCode: string): Promise<Customer | null>;
  findByCustomerGroup(customerGroupId: string): Promise<Customer[]>;
  findActiveCustomers(): Promise<Customer[]>;
  findCompanyCustomers(): Promise<Customer[]>;
  findRetailCustomers(): Promise<Customer[]>;
  searchCustomers(query: string): Promise<Customer[]>;
  save(customer: Customer): Promise<Customer>;
  update(id: string, customer: Customer): Promise<Customer>;
  delete(id: string): Promise<void>;
}
