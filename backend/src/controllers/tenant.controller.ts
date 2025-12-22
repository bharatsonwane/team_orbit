import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@src/middleware/authRoleMiddleware";
import Tenant from "@src/services/tenant.service";
import type {
  CreateTenantSchema,
  UpdateTenantSchema,
} from "@src/schemaTypes/tenant.schemaTypes";

export const createTenant = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantData = req.body as CreateTenantSchema;

    const result = await Tenant.createTenant(req.db, { tenantData });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getTenants = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const includeArchived = req.query.includeArchived === "true";

    const tenants = await Tenant.getTenants(req.db, { includeArchived });

    res.status(200).json(tenants);
  } catch (error) {
    next(error);
  }
};

export const getTenantById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const tenantId = parseInt(id);

    if (isNaN(tenantId)) {
      throw { statusCode: 400, message: "Invalid tenant ID" };
    }

    const tenant = await Tenant.getTenantById(req.db, { tenantId });

    if (!tenant) {
      throw { statusCode: 404, message: "Tenant not found" };
    }

    res.status(200).json(tenant);
  } catch (error) {
    next(error);
  }
};

export const updateTenant = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const tenantId = parseInt(id);
    const updateData = req.body as UpdateTenantSchema;

    if (isNaN(tenantId)) {
      throw { statusCode: 400, message: "Invalid tenant ID" };
    }

    const updatedTenant = await Tenant.updateTenant(req.db, {
      tenantId,
      updateData,
    });

    res.status(200).json(updatedTenant);
  } catch (error) {
    next(error);
  }
};
