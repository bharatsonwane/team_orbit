import { HttpError } from "@src/utils/httpError";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to validate the tenant header
 *
 * @returns Express middleware function
 */
export const ensureTenantMiddleware = () => {
  return function validateTenantHeader(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const xTenant = req.headers["x-tenant"] as string | undefined;

    const xTenantId = xTenant ? parseInt(xTenant) : undefined;

    if (!xTenantId || isNaN(xTenantId)) {
      throw {
        statusCode: 400,
        message: "Invalid tenant ID",
      };
    }

    if (!req.db?.tenantPool) {
      throw new HttpError("Tenant database connection not available", 400);
    }
    next();
  };
};
