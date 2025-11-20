import { CustomerContact } from '../../domain/entities/customer-contact.entity';

export interface CustomerContactRepository {
  findAll(): Promise<CustomerContact[]>;
  findById(id: number): Promise<CustomerContact | null>;
  findByCustomerId(customerId: string): Promise<CustomerContact[]>; // customerId là UUID string
  findPrimaryByCustomerId(customerId: string): Promise<CustomerContact | null>;
  save(contact: CustomerContact): Promise<CustomerContact>;
  update(id: number, contact: CustomerContact): Promise<CustomerContact>;
  delete(id: number): Promise<void>;
  deleteByCustomerId(customerId: string): Promise<void>;
}

