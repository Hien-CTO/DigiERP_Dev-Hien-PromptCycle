import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IRoleRepository } from '@/domain/repositories/role.repository.interface';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';
import { ITenantRepository } from '@/domain/repositories/tenant.repository.interface';
import { Resource } from '@/infrastructure/database/entities/resource.entity';
import { Action } from '@/infrastructure/database/entities/action.entity';
import { RolePermission } from '@/infrastructure/database/entities/role-permission.entity';
import { PermissionEntity } from '@/domain/entities/permission.entity';
import { RoleEntity } from '@/domain/entities/role.entity';

// Define permissions structure from rbac.middleware.ts
const PERMISSIONS_DEFINITION = {
  USER_CREATE: { resource: 'user', action: 'create' },
  USER_READ: { resource: 'user', action: 'read' },
  USER_UPDATE: { resource: 'user', action: 'update' },
  USER_DELETE: { resource: 'user', action: 'delete' },
  ROLE_CREATE: { resource: 'role', action: 'create' },
  ROLE_READ: { resource: 'role', action: 'read' },
  ROLE_UPDATE: { resource: 'role', action: 'update' },
  ROLE_DELETE: { resource: 'role', action: 'delete' },
  PERMISSION_CREATE: { resource: 'permission', action: 'create' },
  PERMISSION_READ: { resource: 'permission', action: 'read' },
  PERMISSION_UPDATE: { resource: 'permission', action: 'update' },
  PERMISSION_DELETE: { resource: 'permission', action: 'delete' },
  PRODUCT_CREATE: { resource: 'product', action: 'create' },
  PRODUCT_READ: { resource: 'product', action: 'read' },
  PRODUCT_UPDATE: { resource: 'product', action: 'update' },
  PRODUCT_DELETE: { resource: 'product', action: 'delete' },
  ORDER_CREATE: { resource: 'order', action: 'create' },
  ORDER_READ: { resource: 'order', action: 'read' },
  ORDER_UPDATE: { resource: 'order', action: 'update' },
  ORDER_DELETE: { resource: 'order', action: 'delete' },
  INVENTORY_READ: { resource: 'inventory', action: 'read' },
  INVENTORY_UPDATE: { resource: 'inventory', action: 'update' },
  WAREHOUSE_CREATE: { resource: 'warehouse', action: 'create' },
  WAREHOUSE_READ: { resource: 'warehouse', action: 'read' },
  WAREHOUSE_UPDATE: { resource: 'warehouse', action: 'update' },
  WAREHOUSE_DELETE: { resource: 'warehouse', action: 'delete' },
  GOODS_RECEIPT_CREATE: { resource: 'goods_receipt', action: 'create' },
  GOODS_RECEIPT_READ: { resource: 'goods_receipt', action: 'read' },
  GOODS_RECEIPT_UPDATE: { resource: 'goods_receipt', action: 'update' },
  GOODS_RECEIPT_DELETE: { resource: 'goods_receipt', action: 'delete' },
  GOODS_ISSUE_CREATE: { resource: 'goods_issue', action: 'create' },
  GOODS_ISSUE_READ: { resource: 'goods_issue', action: 'read' },
  GOODS_ISSUE_UPDATE: { resource: 'goods_issue', action: 'update' },
  GOODS_ISSUE_DELETE: { resource: 'goods_issue', action: 'delete' },
  SUPPLIER_CREATE: { resource: 'supplier', action: 'create' },
  SUPPLIER_READ: { resource: 'supplier', action: 'read' },
  SUPPLIER_UPDATE: { resource: 'supplier', action: 'update' },
  SUPPLIER_DELETE: { resource: 'supplier', action: 'delete' },
  PURCHASE_ORDER_CREATE: { resource: 'purchase_order', action: 'create' },
  PURCHASE_ORDER_READ: { resource: 'purchase_order', action: 'read' },
  PURCHASE_ORDER_UPDATE: { resource: 'purchase_order', action: 'update' },
  PURCHASE_ORDER_DELETE: { resource: 'purchase_order', action: 'delete' },
  INVOICE_CREATE: { resource: 'invoice', action: 'create' },
  INVOICE_READ: { resource: 'invoice', action: 'read' },
  INVOICE_UPDATE: { resource: 'invoice', action: 'update' },
  INVOICE_DELETE: { resource: 'invoice', action: 'delete' },
  PAYMENT_RECORD: { resource: 'payment', action: 'record' },
  CUSTOMER_CREATE: { resource: 'customer', action: 'create' },
  CUSTOMER_READ: { resource: 'customer', action: 'read' },
  CUSTOMER_UPDATE: { resource: 'customer', action: 'update' },
  CUSTOMER_DELETE: { resource: 'customer', action: 'delete' },
  REPORT_SALES: { resource: 'report', action: 'sales' },
  REPORT_INVENTORY: { resource: 'report', action: 'inventory' },
  REPORT_FINANCIAL: { resource: 'report', action: 'financial' },
  TENANT_CREATE: { resource: 'tenant', action: 'create' },
  TENANT_READ: { resource: 'tenant', action: 'read' },
  TENANT_UPDATE: { resource: 'tenant', action: 'update' },
  TENANT_DELETE: { resource: 'tenant', action: 'delete' },
  TENANT_ADMIN: { resource: 'tenant', action: 'admin' },
  SYSTEM_ADMIN: { resource: 'system', action: 'admin' },
};

// Define roles with their permissions
const ROLES_DEFINITION: Record<string, { name: string; displayName: string; description: string; permissions: string[] }> = {
  SUPER_ADMIN: {
    name: 'SUPER_ADMIN',
    displayName: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: Object.keys(PERMISSIONS_DEFINITION),
  },
  ADMIN: {
    name: 'ADMIN',
    displayName: 'Administrator',
    description: 'Administrative access with most permissions',
    permissions: [
      'USER_CREATE',
      'USER_READ',
      'USER_UPDATE',
      'PRODUCT_CREATE',
      'PRODUCT_READ',
      'PRODUCT_UPDATE',
      'PRODUCT_DELETE',
      'ORDER_CREATE',
      'ORDER_READ',
      'ORDER_UPDATE',
      'ORDER_DELETE',
      'INVENTORY_READ',
      'INVENTORY_UPDATE',
      'WAREHOUSE_CREATE',
      'WAREHOUSE_READ',
      'WAREHOUSE_UPDATE',
      'WAREHOUSE_DELETE',
      'GOODS_RECEIPT_CREATE',
      'GOODS_RECEIPT_READ',
      'GOODS_RECEIPT_UPDATE',
      'GOODS_RECEIPT_DELETE',
      'GOODS_ISSUE_CREATE',
      'GOODS_ISSUE_READ',
      'GOODS_ISSUE_UPDATE',
      'GOODS_ISSUE_DELETE',
      'SUPPLIER_CREATE',
      'SUPPLIER_READ',
      'SUPPLIER_UPDATE',
      'SUPPLIER_DELETE',
      'PURCHASE_ORDER_CREATE',
      'PURCHASE_ORDER_READ',
      'PURCHASE_ORDER_UPDATE',
      'PURCHASE_ORDER_DELETE',
      'INVOICE_CREATE',
      'INVOICE_READ',
      'INVOICE_UPDATE',
      'INVOICE_DELETE',
      'PAYMENT_RECORD',
      'CUSTOMER_CREATE',
      'CUSTOMER_READ',
      'CUSTOMER_UPDATE',
      'CUSTOMER_DELETE',
      'REPORT_SALES',
      'REPORT_INVENTORY',
      'REPORT_FINANCIAL',
      'TENANT_CREATE',
      'TENANT_READ',
      'ROLE_READ',
      'PERMISSION_READ',
    ],
  },
  MANAGER: {
    name: 'MANAGER',
    displayName: 'Manager',
    description: 'Manager role with operational permissions',
    permissions: [
      'USER_READ',
      'PRODUCT_READ',
      'ORDER_CREATE',
      'ORDER_READ',
      'ORDER_UPDATE',
      'INVENTORY_READ',
      'INVENTORY_UPDATE',
      'WAREHOUSE_READ',
      'GOODS_RECEIPT_READ',
      'GOODS_ISSUE_READ',
      'SUPPLIER_READ',
      'PURCHASE_ORDER_READ',
      'INVOICE_READ',
      'CUSTOMER_READ',
      'CUSTOMER_UPDATE',
      'REPORT_SALES',
      'REPORT_INVENTORY',
    ],
  },
  SALES_STAFF: {
    name: 'SALES_STAFF',
    displayName: 'Sales Staff',
    description: 'Sales staff role',
    permissions: [
      'USER_READ',
      'PRODUCT_READ',
      'ORDER_CREATE',
      'ORDER_READ',
      'ORDER_UPDATE',
      'INVENTORY_READ',
      'INVOICE_READ',
      'CUSTOMER_CREATE',
      'CUSTOMER_READ',
      'CUSTOMER_UPDATE',
      'REPORT_SALES',
    ],
  },
  WAREHOUSE_STAFF: {
    name: 'WAREHOUSE_STAFF',
    displayName: 'Warehouse Staff',
    description: 'Warehouse staff role',
    permissions: [
      'PRODUCT_READ',
      'INVENTORY_READ',
      'INVENTORY_UPDATE',
      'WAREHOUSE_READ',
      'GOODS_RECEIPT_CREATE',
      'GOODS_RECEIPT_READ',
      'GOODS_RECEIPT_UPDATE',
      'GOODS_ISSUE_CREATE',
      'GOODS_ISSUE_READ',
      'GOODS_ISSUE_UPDATE',
      'REPORT_INVENTORY',
    ],
  },
  PURCHASE_STAFF: {
    name: 'PURCHASE_STAFF',
    displayName: 'Purchase Staff',
    description: 'Purchase staff role',
    permissions: [
      'PRODUCT_READ',
      'SUPPLIER_CREATE',
      'SUPPLIER_READ',
      'SUPPLIER_UPDATE',
      'PURCHASE_ORDER_CREATE',
      'PURCHASE_ORDER_READ',
      'PURCHASE_ORDER_UPDATE',
      'INVENTORY_READ',
    ],
  },
  ACCOUNTANT: {
    name: 'ACCOUNTANT',
    displayName: 'Accountant',
    description: 'Accountant role',
    permissions: [
      'ORDER_READ',
      'INVOICE_CREATE',
      'INVOICE_READ',
      'INVOICE_UPDATE',
      'PAYMENT_RECORD',
      'REPORT_FINANCIAL',
    ],
  },
  VIEWER: {
    name: 'VIEWER',
    displayName: 'Viewer',
    description: 'Read-only access role',
    permissions: [
      'USER_READ',
      'PRODUCT_READ',
      'ORDER_READ',
      'INVENTORY_READ',
      'WAREHOUSE_READ',
      'SUPPLIER_READ',
      'PURCHASE_ORDER_READ',
      'INVOICE_READ',
      'REPORT_SALES',
      'REPORT_INVENTORY',
      'REPORT_FINANCIAL',
    ],
  },
};

@Injectable()
export class InitializeTenantRolesAndPermissionsUseCase {
  constructor(
    @Inject('IRoleRepository') private readonly roleRepository: IRoleRepository,
    @Inject('IPermissionRepository') private readonly permissionRepository: IPermissionRepository,
    @Inject('ITenantRepository') private readonly tenantRepository: ITenantRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(tenantId: number): Promise<{ message: string; createdRoles: number; createdPermissions: number }> {
    // Check if tenant exists
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Create or get all resources and actions
      const resourceMap = new Map<string, number>();
      const actionMap = new Map<string, number>();

      // Get unique resources and actions from permissions
      const resources = new Set<string>();
      const actions = new Set<string>();
      Object.values(PERMISSIONS_DEFINITION).forEach((perm) => {
        resources.add(perm.resource);
        actions.add(perm.action);
      });

      const resourceRepo = queryRunner.manager.getRepository(Resource);
      const rolePermissionRepo = queryRunner.manager.getRepository(RolePermission);

      // Create or get resources
      for (const resourceCode of resources) {
        let resource = await resourceRepo.findOne({ where: { code: resourceCode } });
        if (!resource) {
          resource = resourceRepo.create({
            code: resourceCode,
            name: this.capitalizeFirst(resourceCode.replace(/_/g, ' ')),
            description: `${this.capitalizeFirst(resourceCode.replace(/_/g, ' '))} resource`,
            is_active: true,
          });
          resource = await resourceRepo.save(resource);
        }
        resourceMap.set(resourceCode, resource.id);
      }

      // Create or get actions
      const actionRepository = queryRunner.manager.getRepository(Action);
      for (const actionCode of actions) {
        let action = await actionRepository.findOne({ where: { code: actionCode } });
        if (!action) {
          action = actionRepository.create({
            code: actionCode,
            name: this.capitalizeFirst(actionCode.replace(/_/g, ' ')),
            description: `${this.capitalizeFirst(actionCode.replace(/_/g, ' '))} action`,
            is_active: true,
          });
          action = await actionRepository.save(action);
        }
        actionMap.set(actionCode, action.id);
      }

      // Step 2: Create all permissions for this tenant
      const permissionMap = new Map<string, PermissionEntity>();
      let createdPermissionsCount = 0;

      for (const [key, permDef] of Object.entries(PERMISSIONS_DEFINITION)) {
        const resourceId = resourceMap.get(permDef.resource);
        const actionId = actionMap.get(permDef.action);

        if (!resourceId || !actionId) {
          continue;
        }

        // Check if permission already exists for this tenant
        const existingPermission = await this.permissionRepository.findByResourceAndAction(
          resourceId,
          actionId,
          'TENANT',
          tenantId,
        );

        if (!existingPermission) {
          const permissionName = `${permDef.resource}:${permDef.action}`;
          const permissionEntity = new PermissionEntity(
            0,
            permissionName,
            `${this.capitalizeFirst(permDef.resource.replace(/_/g, ' '))} - ${this.capitalizeFirst(permDef.action.replace(/_/g, ' '))}`,
            resourceId,
            actionId,
            `Permission to ${permDef.action} ${permDef.resource}`,
            'TENANT',
            tenantId,
            true,
            new Date(),
            new Date(),
          );

          const createdPermission = await this.permissionRepository.create(permissionEntity);
          permissionMap.set(key, createdPermission);
          createdPermissionsCount++;
        } else {
          permissionMap.set(key, existingPermission);
        }
      }

      // Step 3: Create all roles for this tenant
      const roleMap = new Map<string, RoleEntity>();
      let createdRolesCount = 0;

      for (const [key, roleDef] of Object.entries(ROLES_DEFINITION)) {
        // Check if role already exists for this tenant
        const existingRole = await this.roleRepository.existsByNameAndScope(roleDef.name, 'TENANT', tenantId);

        if (!existingRole) {
          const roleEntity = new RoleEntity(
            0,
            roleDef.name,
            roleDef.displayName,
            roleDef.description,
            true, // isSystemRole
            'TENANT',
            tenantId,
            true,
            new Date(),
            new Date(),
          );

          const createdRole = await this.roleRepository.create(roleEntity);
          roleMap.set(key, createdRole);
          createdRolesCount++;
        } else {
          // Get existing role - find by name, scope and tenantId
          const allRoles = await this.roleRepository.findAll(1, 10000);
          const existingRoleEntity = allRoles.roles.find(
            (r) => r.name === roleDef.name && r.scope === 'TENANT' && r.tenantId === tenantId,
          );
          if (existingRoleEntity) {
            roleMap.set(key, existingRoleEntity);
          }
        }
      }

      // Step 4: Assign permissions to roles
      for (const [roleKey, roleDef] of Object.entries(ROLES_DEFINITION)) {
        const role = roleMap.get(roleKey);
        if (!role) continue;

        const permissionIds: number[] = [];
        for (const permKey of roleDef.permissions) {
          const permission = permissionMap.get(permKey);
          if (permission) {
            permissionIds.push(permission.id);
          }
        }

        // Remove existing role permissions
        await rolePermissionRepo.delete({ role_id: role.id });

        // Create role permissions
        if (permissionIds.length > 0) {
          await this.permissionRepository.assignPermissionsToRole(role.id, permissionIds);
        }
      }

      await queryRunner.commitTransaction();

      return {
        message: `Roles and permissions initialized successfully for tenant ${tenantId}`,
        createdRoles: createdRolesCount,
        createdPermissions: createdPermissionsCount,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}

