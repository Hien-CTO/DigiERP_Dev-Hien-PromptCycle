import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    permissions: string[];
    roles: string[];
  };
}

// Helper function to convert permission format
const convertPermissions = async (permissions: string[]): Promise<string[]> => {
  // Permission mapping from resourceId:actionId to resource:action
  const permissionMap: Record<string, string> = {
    '1:1': 'user:create',
    '1:2': 'user:read',
    '1:3': 'user:update',
    '1:4': 'user:delete',
    '2:1': 'role:create',
    '2:2': 'role:read',
    '2:3': 'role:update',
    '2:4': 'role:delete',
    '3:2': 'permission:read',
    '4:1': 'product:create',
    '4:2': 'product:read',
    '4:3': 'product:update',
    '4:4': 'product:delete',
    '5:1': 'inventory:create',
    '5:2': 'inventory:read',
    '5:3': 'inventory:update',
    '5:4': 'inventory:delete',
    '6:1': 'order:create',
    '6:2': 'order:read',
    '6:3': 'order:update',
    '6:4': 'order:delete',
    '7:1': 'supplier:create',
    '7:2': 'supplier:read',
    '7:3': 'supplier:update',
    '7:4': 'supplier:delete',
    '8:1': 'customer:create',
    '8:2': 'customer:read',
    '8:3': 'customer:update',
    '8:4': 'customer:delete',
    '9:1': 'invoice:create',
    '9:2': 'invoice:read',
    '9:3': 'invoice:update',
    '9:4': 'invoice:delete',
  };

  return permissions.map(permission => permissionMap[permission] || permission);
};

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided',
        message: 'Authorization header is required',
        timestamp: new Date(),
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const issuer = process.env.JWT_ISSUER || 'https://auth.example.com';
    const audience = process.env.JWT_AUDIENCE || 'api.example.com';

    // Debug logging to help diagnose JWT_SECRET mismatch
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ JWT_SECRET not set in environment variables, using default');
      console.warn('⚠️ This will cause "invalid signature" errors if User Service uses a different secret!');
      console.warn('⚠️ Please ensure JWT_SECRET in API Gateway matches User Service JWT_SECRET');
    } else {
      console.log(`🔐 Using JWT_SECRET from env (length: ${secret.length}, starts with: ${secret.substring(0, 10)}...)`);
    }
    console.log(`🔐 JWT_ISSUER: ${issuer}, JWT_AUDIENCE: ${audience}`);

    try {
      // Verify token with issuer and audience validation (same as user-service)
      const decoded = jwt.verify(token, secret, {
        issuer: issuer,
        audience: audience,
      }) as any;
      
      if (!decoded.sub) {
        res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'Token payload is invalid - missing sub claim',
          timestamp: new Date(),
        });
        return;
      }

      // Get user details from user-service
      try {
        const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3001';
        const userResponse = await axios.get(`${userServiceUrl}/api/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          timeout: 5000,
        });

        const userData = userResponse.data;
        
        // Convert permission format from "resourceId:actionId" to "resource:action"
        const convertedPermissions = await convertPermissions(userData.permissions || []);
        
        req.user = {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          permissions: convertedPermissions,
          roles: userData.roles || [],
        };
      } catch (userServiceError: any) {
        console.error('Failed to get user details from user-service:', {
          message: userServiceError.message,
          status: userServiceError.response?.status,
          data: userServiceError.response?.data,
        });
        
        // If user-service is unavailable, reject the request instead of falling back
        // This ensures we always have accurate user data
        res.status(503).json({
          success: false,
          error: 'Service unavailable',
          message: 'Unable to verify user details. Please try again later.',
          timestamp: new Date(),
        });
        return;
      }

      next();
    } catch (jwtError: any) {
      console.error('JWT verification error:', {
        name: jwtError.name,
        message: jwtError.message,
      });
      
      let errorMessage = 'Token verification failed';
      if (jwtError.name === 'TokenExpiredError') {
        errorMessage = 'Token has expired';
      } else if (jwtError.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid token format';
      } else if (jwtError.name === 'NotBeforeError') {
        errorMessage = 'Token not active yet';
      }
      
      res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: errorMessage,
        timestamp: new Date(),
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Authentication failed',
      timestamp: new Date(),
    });
  }
};

export const optionalAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    try {
      const decoded = jwt.verify(token, secret) as any;
      
      if (decoded.sub && decoded.email) {
        req.user = {
          id: decoded.sub,
          email: decoded.email,
          username: decoded.username,
          permissions: decoded.permissions || [],
          roles: decoded.roles || [],
        };
      }

      next();
    } catch (jwtError) {
      // Invalid token, continue without authentication
      next();
    }
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};
