import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    roles: string[];
    permissions: string[];
  };
}

@Injectable()
export class UserExtractorMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Extract user info from headers (forwarded by API Gateway)
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;
    const userUsername = req.headers['x-user-username'] as string;
    const userRoles = req.headers['x-user-roles'] as string;
    const userPermissions = req.headers['x-user-permissions'] as string;

    // Also check Authorization header for direct API calls (for development/testing)
    // If no x-user-id header, try to extract from Authorization token
    if (!userId && req.headers['authorization']) {
      // For development: if calling directly without API Gateway, 
      // we can set a default user (admin with user_id = 7)
      // In production, this should always come from API Gateway
      const authHeader = req.headers['authorization'] as string;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // For now, if there's an auth token but no x-user-id, 
        // we'll let the request proceed but user will be undefined
        // The controller should handle this case
        console.warn('⚠️  No x-user-id header found, but Authorization header present. User will be undefined.');
      }
    }

    if (userId) {
      try {
        req.user = {
          id: userId,
          email: userEmail || '',
          username: userUsername || '',
          roles: userRoles ? (typeof userRoles === 'string' ? JSON.parse(userRoles) : userRoles) : [],
          permissions: userPermissions ? (typeof userPermissions === 'string' ? JSON.parse(userPermissions) : userPermissions) : [],
        };
      } catch (error) {
        console.error('Error parsing user headers:', error);
        // Continue without user if parsing fails
      }
    }

    next();
  }
}

