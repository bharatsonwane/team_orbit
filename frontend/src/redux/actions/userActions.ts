import { createAsyncThunk } from "@reduxjs/toolkit";
import getAxios, { getAppErrorMessage } from "../../utils/axiosApi";
import type {
  LoginCredentials,
  LoginResponse,
  User,
  CreateUserRequest,
  DetailedUser,
  UpdateUserRequest,
} from "@/schemas/user";

/** Login action - API call only */
export const loginAction = createAsyncThunk(
  "user/loginAction",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // Make login API call only
      const response = await getAxios().post<LoginResponse>(
        "api/user/login",
        credentials
      );

      return response.data as LoginResponse;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Get user profile action - API call only */
export const getUserProfileAction = createAsyncThunk(
  "user/getUserProfileAction",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAxios().get<User>("/api/user/profile");
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Get platform users action - API call with query params */
export const getPlatformUsersAction = createAsyncThunk(
  "user/getPlatformUsersAction",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAxios().get<DetailedUser[]>("/api/user/list", {
        params: {
          roleCategory: "PLATFORM",
        },
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Get tenant users action - API call with query params */
export const getTenantUsersAction = createAsyncThunk(
  "user/getTenantUsersAction",
  async (tenantId: number, { rejectWithValue }) => {
    try {
      const response = await getAxios().get<DetailedUser[]>("/api/user/list", {
        params: {
          tenantId,
          roleCategory: "TENANT",
        },
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Create user action - API call only */
export const createUserAction = createAsyncThunk(
  "user/createUserAction",
  async (userData: CreateUserRequest, { rejectWithValue }) => {
    try {
      const response = await getAxios().post<User>(
        "/api/user/create",
        userData
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Get user by ID action - API call only */
export const getUserByIdAction = createAsyncThunk(
  "user/getUserByIdAction",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await getAxios().get<DetailedUser>(
        `/api/user/${userId}`
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Update user action - API call only */
export const updateUserAction = createAsyncThunk(
  "user/updateUserAction",
  async (
    { userId, userData }: { userId: number; userData: UpdateUserRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAxios().put<DetailedUser>(
        `/api/user/${userId}`,
        userData
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Update user password action - API call only */
export const updateUserPasswordAction = createAsyncThunk(
  "user/updateUserPasswordAction",
  async (
    { userId, password }: { userId: number; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAxios().put<DetailedUser>(
        `/api/user/${userId}/update-password`,
        { password }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Update user status and roles action - API call only */
export const updateUserStatusAndRolesAction = createAsyncThunk(
  "user/updateUserStatusAndRolesAction",
  async (
    {
      userId,
      statusId,
      roleIds,
    }: { userId: number; statusId: number; roleIds: number[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAxios().put<DetailedUser>(
        `/api/user/${userId}/update-status-roles`,
        { statusId, roleIds }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);
