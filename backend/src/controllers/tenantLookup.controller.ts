import type { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@src/middleware/authRoleMiddleware";
import { TenantLookupService } from "@src/services/tenantLookup.service";
import { HttpError } from "@src/utils/httpError";

export class TenantLookupController {
  /**
   * Get all tenant lookup types
   * GET /api/tenant/:tenantId/lookup-types
   */
  static async getTenantLookupTypes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const lookupTypes = await TenantLookupService.getTenantLookupTypes(
        req.db
      );

      res.json({
        success: true,
        data: lookupTypes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tenant lookups by type
   * GET /api/tenant/:tenantId/lookups/:lookupType
   */
  static async getTenantLookupsByType(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const lookupType = req.params.lookupType;

      const lookups = await TenantLookupService.getTenantLookupsByType(
        req.db,
        lookupType
      );

      res.json({
        success: true,
        data: lookups,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all tenant lookups
   * GET /api/tenant/:tenantId/lookups
   */
  static async getAllTenantLookups(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const tenantId = parseInt(req.params.tenantId);

      const lookups = await TenantLookupService.getAllTenantLookups(req.db);

      res.json({
        success: true,
        data: lookups,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new tenant lookup
   * POST /api/tenant/:tenantId/lookups
   */
  static async createTenantLookup(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const { lookupTypeId, name, label, description, isSystem } = req.body;

      // Get the user ID from the request (from auth middleware)
      const createdBy = req.user?.userId;

      const newLookup = await TenantLookupService.createTenantLookup(req.db, {
        lookupTypeId,
        name,
        label,
        description,
        isSystem,
        createdBy,
      });

      res.status(201).json({
        success: true,
        data: newLookup,
        message: "Tenant lookup created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a tenant lookup
   * PUT /api/tenant/:tenantId/lookups/:id
   */
  static async updateTenantLookup(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const lookupId = parseInt(req.params.id);
      const { label, description, sortOrder } = req.body;

      // Get the user ID from the request (from auth middleware)
      const updatedBy = req.user?.userId;

      const updatedLookup = await TenantLookupService.updateTenantLookup(
        req.db,
        lookupId,
        {
          label,
          description,
          sortOrder,
          updatedBy,
        }
      );

      res.json({
        success: true,
        data: updatedLookup,
        message: "Tenant lookup updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a tenant lookup (soft delete)
   * DELETE /api/tenant/:tenantId/lookups/:id
   */
  static async deleteTenantLookup(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const lookupId = parseInt(req.params.id);

      // Get the user ID from the request (from auth middleware)
      const archivedBy = req.user?.userId;

      await TenantLookupService.deleteTenantLookup(
        req.db,
        lookupId,
        archivedBy
      );

      res.json({
        success: true,
        message: "Tenant lookup deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
