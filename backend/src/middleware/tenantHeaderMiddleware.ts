import { HttpError } from "@src/utils/httpError";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to validate the tenant header
 *
 * @returns Express middleware function
 */
export const tenantHeaderMiddleware = () => {
  return function validateTenantHeader(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const headerValue = req.headers["x-tenant"] as string | undefined;

    if (!headerValue) {
      throw new HttpError("Tenant ID is required", 400);
    }
    next();
  };
};
