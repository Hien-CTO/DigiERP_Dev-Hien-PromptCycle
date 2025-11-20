import { Contract } from '../entities/contract.entity';

export interface ContractRepository {
  findAll(): Promise<Contract[]>;
  findById(id: string): Promise<Contract | null>;
  findByContractNumber(contractNumber: string): Promise<Contract | null>;
  findByCustomer(customerId: string): Promise<Contract[]>;
  findActiveContracts(): Promise<Contract[]>;
  findExpiredContracts(): Promise<Contract[]>;
  findContractsByStatus(status: string): Promise<Contract[]>;
  findContractsExpiringInDays(days: number): Promise<Contract[]>;
  save(contract: Contract): Promise<Contract>;
  update(id: string, contract: Contract): Promise<Contract>;
  delete(id: string): Promise<void>;
}
