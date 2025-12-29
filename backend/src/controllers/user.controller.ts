import { Request, Response, NextFunction } from "express";
import db, { schemaNames } from "@src/database/db";
import User from "@src/services/user.service";
import Tenant from "@src/services/tenant.service";
import {
  getHashPassword,
  validatePassword,
  createJwtToken,
} from "@src/utils/authHelper";
import RoleAndPermission from "@src/services/roleAndPermission.service";
import {
  UserLoginSchema,
  CreateUserSchema,
} from "@src/schemaTypes/user.schemaTypes";
import { AuthenticatedRequest } from "@src/middleware/authPermissionMiddleware";
import { userStatusKeys } from "@src/utils/constants";
import {
  PermissionWithIdSchema,
  RoleWithIdSchema,
} from "@src/schemaTypes/roleAndPermission.schemaTypes";

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as UserLoginSchema;
    const userData = await User.getUserByIdOrAuthEmail(req.db, {
      authEmail: email,
      includePassword: true,
    });

    if (
      !userData ||
      userData.isArchived === true ||
      userData.statusName !== userStatusKeys.ACTIVE
    ) {
      throw { statusCode: 401, message: "Invalid credentials" };
    }

    const isValidPassword = await validatePassword(
      password,
      userData.hashPassword || ""
    );
    if (!isValidPassword) {
      throw { statusCode: 401, message: "Invalid credentials" };
    }

    // Create minimal JWT token (no roles or permissions)
    const token = createJwtToken({
      userId: userData.id,
      email: userData.authEmail || "", // Using authEmail (which is email)
      isPlatformUser: userData.isPlatformUser || false,
    });

    // Return only token, userId, and email
    res.status(200).json({
      token,
      userId: userData.id,
      email: userData.authEmail,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const loggedInUser = req.user;
    const userData: CreateUserSchema = req.body;

    // Check if user already exists by authEmail (only if authEmail is provided)
    if (userData.authEmail) {
      const userExists = await User.getUserByIdOrAuthEmail(req.db, {
        authEmail: userData.authEmail,
      });

      if (userExists) {
        throw {
          statusCode: 400,
          message: "User already exists with this email",
        };
      }
    }

    const currentUser = await User.getUserByIdOrAuthEmail(req.db, {
      userId: loggedInUser.userId,
    });

    if (!currentUser) {
      throw {
        statusCode: 401,
        message: "User not found",
      };
    }

    // Fetch user roles to check permissions
    const platformRolesData =
      await RoleAndPermission.getPlatformUserRolesAndPermissions(
        req.db,
        loggedInUser.userId
      );

    if (!platformRolesData.roles || platformRolesData.roles.length === 0) {
      throw {
        statusCode: 401,
        message: "User has no roles assigned",
      };
    }

    // Get role names for validation
    const currentUserRoleNames = platformRolesData.roles.map(
      (role: { name: string }) => role.name
    );

    // Get lookup data for the roles being assigned
    // const userRoleLookupType = await Lookup.getLookupTypeByName(
    //   req.db,
    //   lookupTypeKeys.USER_ROLE
    // );
    // const roleLookups = userData.roleIds.map(roleId => {
    //   const roleLookup = userRoleLookupType.lookups.find(
    //     (lookup: any) => lookup.id === roleId
    //   );
    //   return roleLookup?.name;
    // });

    // Role-based permission validation
    // const hasPermission = hasRolePermission({
    //   currentUserRoleNames: currentUserRoleNames,
    //   targetRoleNames: roleLookups,
    // });

    // if (!hasPermission) {
    //   throw {
    //     statusCode: 403,
    //     message:
    //       "Insufficient permissions to create users with the specified roles",
    //   };
    // }

    // Create user with roles
    const createdUserId = await User.createUser(req.db, userData);

    res.status(201).json({ id: createdUserId });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.xTenantId;
    const { page, limit, searchText } = req.query;

    // Only apply pagination if page and limit are explicitly provided as valid numbers
    const pageNumber =
      page !== undefined && page !== null && !isNaN(parseInt(page as string))
        ? parseInt(page as string)
        : undefined;
    const pageSize =
      limit !== undefined && limit !== null && !isNaN(parseInt(limit as string))
        ? parseInt(limit as string)
        : undefined;

    const result = await User.getUsers(req.db, {
      tenantId,
      searchText: searchText as string | undefined,
      page: pageNumber,
      limit: pageSize,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getUsersCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.xTenantId;
    const { searchText } = req.query;

    const count = await User.getUsersCount(req.db, {
      tenantId,
      searchText: searchText as string | undefined,
    });

    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userData = await User.getUserByIdOrAuthEmail(req.db, {
      userId: parseInt(id),
    });

    if (!userData) {
      throw { statusCode: 404, message: "User not found" };
    }

    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};

export const getUserContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const contacts = await User.getUserContacts(req.db, parseInt(id));

    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    /* Get tenantId from query param if provided */
    const tenantIdFromQuery = (req.query.tenantId as string | undefined)
      ? parseInt(req.query.tenantId as string)
      : null;

    /* Get tenantId from header if provided */
    const tenantIdFromHeader = req.xTenantId;

    if (!userId) {
      throw { statusCode: 401, message: "User not authenticated" };
    }
    // Fetch user data
    const userData = await User.getUserByIdOrAuthEmail(req.db, { userId });

    if (!userData) {
      throw { statusCode: 404, message: "User profile not found" };
    }

    delete (userData as Partial<typeof userData>).hashPassword;

    const userTenants = await Tenant.getTenantsByUserId(req.db, { userId });
    const userFirstTenantId = userTenants.length > 0 ? userTenants[0].id : null;

    // Determine target tenant for fetching tenant roles/permissions
    // If tenantId query param is provided and user is platform user, use that
    // Otherwise use tenantId from header, or user's first tenant
    let targetTenantId: number | null =
      tenantIdFromQuery || tenantIdFromHeader || userFirstTenantId;
    if (req.user.isPlatformUser) {
      targetTenantId = tenantIdFromQuery;
    } else {
      const currentTenant = userTenants.find(
        tenant => tenant.id === targetTenantId
      );
      if (!currentTenant) {
        throw { statusCode: 404, message: "Tenant not found" };
      }
    }

    const tempDbClient = {
      mainPool: req.db.mainPool,
      tenantPool: req.db.tenantPool,
    };

    if (targetTenantId && targetTenantId !== tenantIdFromHeader) {
      const tenantSchemaName = schemaNames.tenantSchemaName(
        targetTenantId!.toString()
      );
      const tenantPool = await db.getSchemaPool(tenantSchemaName);
      tempDbClient.tenantPool = tenantPool;
    }

    /* Fetch tenant roles and permissions from current tenant pool (if available) */
    let tenantRoles: RoleWithIdSchema[] = [];
    let tenantPermissions: PermissionWithIdSchema[] = [];
    if (tempDbClient.tenantPool) {
      const tenantDataFromCurrentPool =
        await RoleAndPermission.getTenantUserRolesAndPermissions(
          tempDbClient,
          userId
        );
      tenantRoles = tenantDataFromCurrentPool.roles;
      tenantPermissions = tenantDataFromCurrentPool.permissions;
    }

    /* Fetch platform roles and permissions (always from main schema) */
    let platformRoles: RoleWithIdSchema[] = [];
    let platformPermissions: PermissionWithIdSchema[] = [];
    if (req.user.isPlatformUser) {
      const platformData =
        await RoleAndPermission.getPlatformUserRolesAndPermissions(
          tempDbClient,
          userId
        );
      platformRoles = platformData.roles;
      platformPermissions = platformData.permissions;
    }

    // Combine user data with roles and permissions
    const response = {
      ...userData,
      tenantRoles,
      tenantPermissions,
      platformRoles,
      platformPermissions,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedUser = await User.updateUser(req.db, {
      userId: parseInt(id),
      updateData,
    });

    res.status(200).json({ id: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const updateUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const hashPassword = await getHashPassword(password);
    await User.updateUserPassword(req.db, {
      userId: parseInt(id),
      hashPassword,
    });

    res.status(200).json({
      message: "User password updated successfully",
      userId: parseInt(id),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserAuthEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await User.getUserAuthEmail(req.db, parseInt(id));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateUserAuthEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { authEmail } = req.body;

    await User.updateUserAuthEmail(req.db, {
      userId: parseInt(id),
      newAuthEmail: authEmail,
    });

    res.status(200).json({
      message: "User authentication email updated successfully",
      userId: parseInt(id),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatusAndRoles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { statusId, roleIds } = req.body;

    await User.updateUserStatusAndRoles(req.db, {
      userId: parseInt(id),
      statusId,
      roleIds,
    });

    res.status(200).json({
      message: "User status and roles updated successfully",
      userId: parseInt(id),
    });
  } catch (error) {
    next(error);
  }
};

export const saveUserContacts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const contactData = req.body;

    await User.saveUserContacts(req.db, {
      userId: parseInt(id),
      contactData,
    });

    res.status(200).json({
      message: "Contacts saved successfully",
      userId: parseInt(id),
    });
  } catch (error) {
    next(error);
  }
};

export const saveUserJobDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const jobData = req.body;

    await User.saveUserJobDetails(req.db, {
      userId: parseInt(id),
      jobData,
    });

    res.status(200).json({
      message: "Job details saved successfully",
      userId: parseInt(id),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserJobDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const jobDetails = await User.getUserJobDetails(req.db, parseInt(id));

    res.status(200).json(jobDetails);
  } catch (error) {
    next(error);
  }
};
