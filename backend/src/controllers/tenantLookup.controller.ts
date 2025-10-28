import type { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@src/middleware/authRoleMiddleware";
import { TenantLookupService } from "@src/services/tenantLookup.service";

export const getTenantLookupTypeById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await TenantLookupService.getTenantLookupTypeById(
      req.db,
      parseInt(id)
    );
    res.status(200).send(data);
  } catch (error) {
    next(error);
  }
};

export const getTenantLookupList = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lookups = await TenantLookupService.retrieveTenantLookupList(req.db);

    res.json(lookups);
  } catch (error) {
    next(error);
  }
};
