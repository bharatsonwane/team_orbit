import { Request, Response, NextFunction } from "express";
import { validateJwtToken } from "@src/utils/authHelper";

export interface JwtTokenPayload {
  userId: number;
  email: string;
  tenantId: number;
  userRoles: Array<{
    id: number;
    name: string;
    label: string;
    lookupTypeId: number;
  }>;
}

export interface AuthenticatedRequest extends Request {
  user: JwtTokenPayload;
  headers: Request["headers"] & {
    "x-tenant"?: string;
    authorization?: string;
  };
}

export const authRoleMiddleware = (...allowedRoles: string[]) => {
  return async function validateAuthRoles(
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

      const checkUserHasValidTenantAndRole = (): boolean => {
        // Extract tenantId from the decodedJwt token
        const tenantIdFromToken =
          typeof decodedJwt === "object" ? decodedJwt?.tenantId : null;

        const userRolesFromToken =
          decodedJwt?.userRoles?.map(role => role.name) || [];
        const isPlatformUser = userRolesFromToken.some(role =>
          role.startsWith("PLATFORM_")
        );

        // If tenantId from header is the same as tenantId from token or the user is a platform user, return true
        if (
          tenantIdFromHeader === tenantIdFromToken?.toString() ||
          isPlatformUser
        ) {
          return true;
        }
        return false; // If tenantId from header is not the same as tenantId from token and the user is not a platform user, return false
      };

      const checkUserHasValidRoleForRoute = (): boolean => {
        // Extract user roles from the decodedJwt token
        const userRoles =
          typeof decodedJwt === "object" ? decodedJwt?.userRoles : null;

        // If no specific roles are required, proceed to the next middleware
        if (allowedRoles.length === 0) {
          return true;
        }

        if (
          !userRoles ||
          !userRoles.some((role: { name: string }) =>
            allowedRoles.includes(role.name)
          )
        ) {
          return false;
        }
        return true;
      };

      // Check if the user has a valid tenant and role
      const isValidTenantAndRole = checkUserHasValidTenantAndRole();
      const isValidRoleForRoute = checkUserHasValidRoleForRoute();

      if (!isValidRoleForRoute || !isValidTenantAndRole) {
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
