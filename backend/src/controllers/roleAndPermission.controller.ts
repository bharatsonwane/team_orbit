import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@src/middleware/authPermissionMiddleware";
import RoleAndPermission from "@src/services/roleAndPermission.service";
import type {
  CreateRoleSchema,
  UpdateRoleSchema,
  CreatePermissionSchema,
  UpdatePermissionSchema,
} from "@src/schemaTypes/roleAndPermission.schemaTypes";

// ==================== ROLE CONTROLLERS ====================

/**
 * Get all roles
 */
export const getRoles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const includePermissions =
      req.query.includePermissions === "true" || false;

    const roles = await RoleAndPermission.getRoles(req.db, {
      includePermissions,
    });

    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};

/**
 * Get role by ID
 */
export const getRoleById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleId = Number(req.params.id);
    const role = await RoleAndPermission.getRoleById(req.db, roleId);

    if (!role) {
      throw { statusCode: 404, message: "Role not found" };
    }

    res.status(200).json(role);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new role
 */
export const createRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleData = req.body as CreateRoleSchema;
    const userId = req.user?.userId;

    const roleId = await RoleAndPermission.createRole(req.db, {
      roleData,
      userId,
    });

    res.status(201).json({ id: roleId });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a role
 */
export const updateRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleId = Number(req.params.id);
    const roleData = req.body as UpdateRoleSchema;
    const userId = req.user?.userId;

    await RoleAndPermission.updateRole(req.db, {
      roleId,
      roleData,
      userId,
    });

    res.status(200).json({ id: roleId });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a role
 */
export const deleteRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleId = Number(req.params.id);
    const userId = req.user?.userId;

    await RoleAndPermission.deleteRole(req.db, { roleId, userId });

    res.status(200).json({ message: "Role deleted successfully", id: roleId });
  } catch (error) {
    next(error);
  }
};

// ==================== PERMISSION CONTROLLERS ====================

/**
 * Get all permissions
 */
export const getPermissions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissions = await RoleAndPermission.getPermissions(req.db);

    res.status(200).json(permissions);
  } catch (error) {
    next(error);
  }
};

/**
 * Get permission by ID
 */
export const getPermissionById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissionId = Number(req.params.id);
    const permission = await RoleAndPermission.getPermissionById(
      req.db,
      permissionId
    );

    if (!permission) {
      throw { statusCode: 404, message: "Permission not found" };
    }

    res.status(200).json(permission);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new permission
 */
export const createPermission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissionData = req.body as CreatePermissionSchema;
    const userId = req.user?.userId;

    const permissionId = await RoleAndPermission.createPermission(req.db, {
      permissionData,
      userId,
    });

    res.status(201).json({ id: permissionId });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a permission
 */
export const updatePermission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissionId = Number(req.params.id);
    const permissionData = req.body as UpdatePermissionSchema;
    const userId = req.user?.userId;

    await RoleAndPermission.updatePermission(req.db, {
      permissionId,
      permissionData,
      userId,
    });

    res.status(200).json({ id: permissionId });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a permission
 */
export const deletePermission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissionId = Number(req.params.id);
    const userId = req.user?.userId;

    await RoleAndPermission.deletePermission(req.db, {
      permissionId,
      userId,
    });

    res.status(200).json({
      message: "Permission deleted successfully",
      id: permissionId,
    });
  } catch (error) {
    next(error);
  }
};

