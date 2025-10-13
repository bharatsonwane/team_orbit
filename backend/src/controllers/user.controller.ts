import { Request, Response, NextFunction } from "express";
import User from "../services/user.service";
import {
  getHashPassword,
  validatePassword,
  createJwtToken,
} from "../utils/authHelper";
import Lookup from "../services/lookup.service";
import { UserLoginSchema, CreateUserSchema } from "../schemas/user.schema";
import { AuthenticatedRequest } from "../middleware/authRoleMiddleware";
import {
  lookupTypeKeys,
  userRoleKeys,
  userStatusKeys,
} from "../utils/constants";
import { validateUserCreationPermission } from "../utils/userHelper";

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as UserLoginSchema;

    const userData = await User.getUserByIdOrEmailOrPhone(req.db, {
      email,
      includePassword: true,
    });

    if (!userData) {
      throw { statusCode: 401, message: "Invalid email or password" };
    }

    const isValidPassword = await validatePassword(
      password,
      userData.hashPassword || ""
    );
    if (!isValidPassword) {
      throw { statusCode: 401, message: "Invalid email or password" };
    }

    delete (userData as Partial<typeof userData>).hashPassword;

    const token = createJwtToken({
      userId: userData.id,
      email: userData.email,
      userRoles: userData.roles,
    });

    res.status(200).json({
      user: userData,
      token,
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

    // Check if user already exists
    const userExists = await User.getUserByIdOrEmailOrPhone(req.db, {
      email: userData.email,
      phone: userData.phone,
    });

    if (userExists) {
      throw {
        statusCode: 400,
        message: "User already exists with this email or phone",
      };
    }

    // Get the logged-in user's roles
    if (!loggedInUser?.userId) {
      throw {
        statusCode: 401,
        message: "User not authenticated",
      };
    }

    const currentUser = await User.getUserByIdOrEmailOrPhone(req.db, {
      userId: loggedInUser.userId,
    });

    if (!currentUser || !currentUser.roles) {
      throw {
        statusCode: 401,
        message: "User not found or no roles assigned",
      };
    }

    // Get role names for validation
    const currentUserRoleNames = currentUser.roles.map(
      (role: any) => role.name
    );

    // Get lookup data for the roles being assigned
    const userRoleLookupType = await Lookup.getLookupTypeByName(
      req.db,
      lookupTypeKeys.USER_ROLE
    );
    const roleLookups = userData.roleIds.map(roleId => {
      const roleLookup = userRoleLookupType.lookups.find(
        (lookup: any) => lookup.id === roleId
      );
      return roleLookup?.name;
    });

    // Role-based permission validation
    const hasPermission = validateUserCreationPermission({
      currentUserRoleNames: currentUserRoleNames,
      targetRoleNames: roleLookups,
    });

    if (!hasPermission) {
      throw {
        statusCode: 403,
        message:
          "Insufficient permissions to create users with the specified roles",
      };
    }

    // Create user with roles
    const createdUser = await User.createUser(req.db, userData);

    res.status(201).json(createdUser);
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
    const { userType, roleCategory, tenantId, statusId } = req.query;

    const users = await User.getUsers(req.db, {
      userType: userType as string | undefined,
      roleCategory: roleCategory as string | undefined,
      tenantId: tenantId ? parseInt(tenantId as string) : undefined,
      statusId: statusId ? parseInt(statusId as string) : undefined,
    });

    res.status(200).json(users);
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
    const userData = await User.getUserByIdOrEmailOrPhone(req.db, {
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

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw { statusCode: 401, message: "User not authenticated" };
    }

    const userData = await User.getUserByIdOrEmailOrPhone(req.db, { userId });

    if (!userData) {
      throw { statusCode: 404, message: "User profile not found" };
    }

    res.status(200).json(userData);
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

    res.status(200).json(updatedUser);
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
    const updatedUser = await User.updateUserPassword(req.db, {
      userId: parseInt(id),
      hashPassword,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
