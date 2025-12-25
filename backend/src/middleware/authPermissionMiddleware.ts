import { Request, Response, NextFunction } from "express";
import { validateJwtToken } from "@src/utils/authHelper";
import RoleAndPermission from "@src/services/roleAndPermission.service";
import type { dbClientPool } from "./dbClientMiddleware";

export interface JwtTokenPayload {
  userId: number;
  email: string;
  tenantId: number;
  userRoles: Array<{
    id: number;
    name: string;
    label: string;
    lookupTypeId?: number;
  }>;
  platformPermissions: string[];
  tenantPermissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user: JwtTokenPayload;
  db: dbClientPool;
  headers: Request["headers"] & {
    "x-tenant"?: string;
    authorization?: string;
  };
}

export const authPermissionMiddleware = ({
  allowedPlatformPermissions = [],
  allowedTenantPermissions = [],
}: {
  allowedPlatformPermissions?: string[];
  allowedTenantPermissions?: string[];
} = {}) => {
  return async function validateAuthPermissions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const bearerToken = req.headers["authorization"];
    const tenantIdFromHeader = req.headers["x-tenant"] as string | undefined;

    if (!bearerToken) {
      res.status(401).json({ message: "Access denied. No token provided." });
      return;
    }

    try {
      // if the token is in the format "Bearer <token>", extract the token if not user the token as is
      const token = bearerToken.split(" ")?.[1] || bearerToken;

      // Validate the token
      const decodedJwt = (await validateJwtToken(token)) as JwtTokenPayload;

      if (!decodedJwt) {
        res.status(401).json({ message: "Invalid token." });
        return;
      } else if (!decodedJwt.userId) {
        res.status(401).json({ message: "User not authenticated." });
        return;
      }

      // Ensure db is available (should be set by dbClientMiddleware)
      if (!req.db || !req.db.mainPool) {
        res.status(500).json({
          message: "Database connection not available",
        });
        return;
      }

      // Fetch user's roles from database
      const { platformRoles, tenantRoles } =
        await RoleAndPermission.getUserRoles(req.db, decodedJwt.userId);

      // Use permissions from JWT token (for performance and frontend access)
      // Fallback to database if not present in token (for backward compatibility)
      let platformPermissions: string[] = decodedJwt.platformPermissions || [];
      let tenantPermissions: string[] = decodedJwt.tenantPermissions || [];

      // If permissions are not in JWT, fetch from database (fallback)
      if (!decodedJwt.platformPermissions || !decodedJwt.tenantPermissions) {
        const dbPermissions = await RoleAndPermission.getUserPermissions(
          req.db,
          decodedJwt.userId
        );
        platformPermissions = dbPermissions.platformPermissions;
        tenantPermissions = dbPermissions.tenantPermissions;
      }

      const checkUserHasValidTenantAndRole = (): boolean => {
        // Extract tenantId from the decodedJwt token
        const tenantIdFromToken =
          typeof decodedJwt === "object" ? decodedJwt?.tenantId : null;

        // Check if user has platform roles (roles from main schema)
        const isPlatformUser = platformRoles.length > 0;

        // If tenantId from header is the same as tenantId from token or the user is a platform user, return true
        if (
          tenantIdFromHeader === tenantIdFromToken?.toString() ||
          isPlatformUser
        ) {
          return true;
        }
        return false; // If tenantId from header is not the same as tenantId from token and the user is not a platform user, return false
      };

      const checkUserHasRequiredPermissions = (): boolean => {
        // If no specific permissions are required, proceed to the next middleware
        if (!allowedPlatformPermissions && !allowedTenantPermissions) {
          return true;
        }

        // Check main permissions if required
        if (
          allowedPlatformPermissions &&
          allowedPlatformPermissions.length > 0
        ) {
          const hasAllMainPermissions = allowedPlatformPermissions.every(
            permission => platformPermissions.includes(permission)
          );
          if (!hasAllMainPermissions) {
            return false;
          }
        }

        // Check tenant permissions if required
        if (allowedTenantPermissions && allowedTenantPermissions.length > 0) {
          const hasAllTenantPermissions = allowedTenantPermissions.every(
            permission => tenantPermissions.includes(permission)
          );
          if (!hasAllTenantPermissions) {
            return false;
          }
        }

        return true;
      };

      // Check if the user has a valid tenant and required permissions
      const isValidTenantAndRole = checkUserHasValidTenantAndRole();
      const hasRequiredPermissions = checkUserHasRequiredPermissions();

      if (!hasRequiredPermissions || !isValidTenantAndRole) {
        res
          .status(403)
          .json({ message: "Access forbidden: Insufficient permissions." });
        return;
      }

      req.user = decodedJwt;

      // Proceed to the next middleware
      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token." });
      return;
    }
  };
};
