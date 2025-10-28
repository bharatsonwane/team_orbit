import { Request, Response, NextFunction } from "express";
import User from "@src/services/user.service";
import {
  getHashPassword,
  validatePassword,
  createJwtToken,
} from "@src/utils/authHelper";
import Lookup from "@src/services/lookup.service";
import { UserLoginSchema, CreateUserSchema } from "@src/schemas/user.schema";
import { AuthenticatedRequest } from "@src/middleware/authRoleMiddleware";
import {
  lookupTypeKeys,
  userRoleKeys,
  userStatusKeys,
} from "@src/utils/constants";

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

    delete (userData as Partial<typeof userData>).hashPassword;

    const token = createJwtToken({
      userId: userData.id,
      email: userData.authEmail, // Using authEmail (which is email)
      tenantId: userData.tenantId,
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
): Promise<{ id: number } | void> => {
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

    // Get the logged-in user's roles
    if (!loggedInUser?.userId) {
      throw {
        statusCode: 401,
        message: "User not authenticated",
      };
    }

    const currentUser = await User.getUserByIdOrAuthEmail(req.db, {
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

    if (!userId) {
      throw { statusCode: 401, message: "User not authenticated" };
    }

    const userData = await User.getUserByIdOrAuthEmail(req.db, { userId });

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
