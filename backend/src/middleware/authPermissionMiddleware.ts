import { Request, Response, NextFunction } from "express";
import { JwtTokenPayload, validateJwtToken } from "@src/utils/authHelper";
import User from "@src/services/user.service";
import RoleAndPermission from "@src/services/roleAndPermission.service";
import type { dbClientPool } from "./dbClientMiddleware";
import {
  PermissionWithIdSchema,
  RolesAndPermissionsSchema,
} from "@src/schemaTypes/roleAndPermission.schemaTypes";
import logger from "@src/utils/logger";

export interface AuthenticatedRequest extends Request {
  user: JwtTokenPayload & { tenantId: number | 0 };
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

      /** Ensure db is available (should be set by dbClientMiddleware)*/
      if (!req.db || !req.db.mainPool) {
        res.status(500).json({
          message: "Database connection not available",
        });
        return;
      }

      const userAuth = await User.getUserAuthById(req.db, decodedJwt.userId);

      if (!userAuth || !userAuth.authEmail) {
        res.status(401).json({ message: "User not authenticated." });
        return;
      }

      const checkUserHasValidTenant = (): boolean => {
        if (userAuth.isPlatformUser) {
          return true;
        } else if (tenantIdFromHeader) {
          return (
            userAuth.userTenants?.some(
              tenant => tenant.id === parseInt(tenantIdFromHeader)
            ) || false
          );
        } else {
          return false;
        }
      };

      const checkUserHasRequiredPermissions = async (): Promise<boolean> => {
        try {
          // If no specific permissions are required, proceed to the next middleware
          if (!allowedPlatformPermissions && !allowedTenantPermissions) {
            return true;
          }

          /* Check main i.e platform permissions if required */
          if (
            allowedPlatformPermissions &&
            allowedPlatformPermissions.length > 0
          ) {
            let platformPermissions: PermissionWithIdSchema[] = [];
            if (userAuth.isPlatformUser) {
              const platformData =
                await RoleAndPermission.getPlatformUserRolesAndPermissions(
                  req.db,
                  decodedJwt.userId
                );
              platformPermissions = platformData.permissions;
            }
            const platformPermissionNames = platformPermissions.map(
              p => p.name
            );
            const hasAllMainPermissions = allowedPlatformPermissions.every(
              permission => platformPermissionNames.includes(permission)
            );
            if (!hasAllMainPermissions) {
              return false;
            }
          }

          /* Check tenant permissions if required */
          if (allowedTenantPermissions && allowedTenantPermissions.length > 0) {
            let tenantPermissions: PermissionWithIdSchema[] = [];
            if (tenantIdFromHeader) {
              const tenantData =
                await RoleAndPermission.getTenantUserRolesAndPermissions(
                  req.db,
                  decodedJwt.userId
                );

              tenantPermissions = tenantData.permissions;
            }
            const tenantPermissionNames = tenantPermissions.map(p => p.name);
            const hasAllTenantPermissions = allowedTenantPermissions.every(
              permission => tenantPermissionNames.includes(permission)
            );
            if (!hasAllTenantPermissions) {
              return false;
            }
          }

          return true;
        } catch (error) {
          logger.error("Error checking user permissions", {
            userId: decodedJwt.userId,
            error: error instanceof Error ? error.message : String(error),
          });
          return false;
        }
      };

      // Check if the user has a valid tenant and required permissions
      const isValidTenant = checkUserHasValidTenant();
      const hasRequiredPermissions = await checkUserHasRequiredPermissions();

      if (!isValidTenant || !hasRequiredPermissions) {
        res
          .status(403)
          .json({ message: "Access forbidden: Insufficient permissions." });
        return;
      }

      req.user = {
        ...decodedJwt,
        tenantId: tenantIdFromHeader ? parseInt(tenantIdFromHeader) : 0,
      };
      // Proceed to the next middleware
      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token." });
      return;
    }
  };
};
