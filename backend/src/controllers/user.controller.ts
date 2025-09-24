import { Request, Response, NextFunction } from 'express';
import User from '../services/user.service';
import {
  getHashPassword,
  validatePassword,
  createJwtToken,
} from '../utils/authHelper';
import Lookup from '../services/lookup.service';
import { UserLoginSchema, UserSignupSchema } from '../schemas/user.schema';
import { AuthenticatedRequest } from '../middleware/authRoleMiddleware';
import { userRoleKeys, userStatusKeys } from '../utils/constants';

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
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    const isValidPassword = await validatePassword(
      password,
      userData.hashPassword || ''
    );
    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }
    delete userData.hashPassword;

    const token = createJwtToken({
      userId: userData.id,
      email: userData.email,
      userRoles: userData.userRoles,
    });

    res.status(200).json({
      user: userData,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const userSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      email,
      password,
      phone,
      firstName,
      lastName,
      title,
      middleName,
      maidenName,
      gender,
      dob,
      bloodGroup,
      marriedStatus,
      bio,
    }: UserSignupSchema = req.body;

    // Check if user already exists
    const userExists = await User.getUserByIdOrEmailOrPhone(req.db, {
      email,
      phone,
    });

    if (userExists) {
      throw {
        statusCode: 400,
        message: 'User already exists with this email or phone',
      };
    }

    // Get default user status and role IDs
    const userStatusId = await Lookup.getLookupIdByName(
      req.db,
      userStatusKeys.USER_STATUS_PENDING
    );
    // const userRoleId = await Lookup.getLookupIdByName(req.db, userRoleKeys.USER_ROLE_TENANT_USER);

    // Hash password
    const hashPassword = await getHashPassword(password);

    // Create user
    const createdUser = await User.signupUser(req.db, {
      email,
      hashPassword,
      phone,
      firstName,
      lastName,
      statusId: userStatusId,
      tenantId: undefined, // tenantId should be null for signup
      // Optional fields
      title,
      middleName,
      maidenName,
      gender,
      dob,
      bloodGroup,
      marriedStatus,
      bio,
    });

    res.status(201).json(createdUser);
  } catch (error) {
    next(error);
  }
};

export const createUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData = req.body;
    const userStatusId = await Lookup.getLookupIdByName(
      req.db,
      userStatusKeys.USER_STATUS_PENDING
    );

    const createdUser = await User.createUserInfo(req.db, {
      ...userData,
      statusId: userStatusId,
    });

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
    const users = await User.getUsers(req.db);
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
      throw { statusCode: 404, message: 'User not found' };
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
      throw { statusCode: 401, message: 'User not authenticated' };
    }

    const userData = await User.getUserByIdOrEmailOrPhone(req.db, { userId });

    if (!userData) {
      throw { statusCode: 404, message: 'User profile not found' };
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
    const updatedUser = await User.updateUserInfo(req.db, {
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

export const signoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // In a real application, you might want to invalidate the token
    // For now, just return a success message
    res.status(200).json({
      message: 'User signed out successfully',
    });
  } catch (error) {
    next(error);
  }
};
