import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IPermissionRepository } from '@/domain/repositories/permission.repository.interface';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('IPermissionRepository')
    private permissionRepository: IPermissionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get tenant context from request (header, JWT payload, body, or query)
    const tenantIdValue = request.headers['x-tenant-id'] 
      || request.user?.tenantId 
      || request.body?.tenantId 
      || request.query?.tenantId;
    const tenantId = tenantIdValue ? Number(tenantIdValue) : undefined;

    // Check roles if required
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.some(role => user.roles?.includes(role));
      if (!hasRole) {
        throw new ForbiddenException('Insufficient role permissions');
      }
    }

    // Check permissions if required
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = await this.checkUserPermissions(user.id, requiredPermissions, tenantId);
      if (!hasPermission) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return true;
  }

  private async checkUserPermissions(userId: number, requiredPermissions: string[], tenantId?: number): Promise<boolean> {
    // Get user permissions with tenant context
    const userPermissions = await this.permissionRepository.findUserPermissions(userId, tenantId);
    
    // Check if user has all required permissions
    for (const requiredPermission of requiredPermissions) {
      const hasPermission = userPermissions.some(permission => 
        permission.name === requiredPermission
      );
      
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }
}
