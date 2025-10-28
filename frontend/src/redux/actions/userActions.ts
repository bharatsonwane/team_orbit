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
        },
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Create user with personal information - API call only */
export const createUserPersonalAction = createAsyncThunk(
  "user/createUserPersonalAction",
  async (userData: CreateUserRequest, { rejectWithValue }) => {
    try {
      const response = await getAxios().post<{ id: number }>(
        "/api/user/personal",
        userData
      );
      return response.data; // Returns userId
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Create user action (backward compatibility) */
export const createUserAction = createUserPersonalAction;

/** Get user by ID action - API call only */
export const getUserPersonalDataByIdAction = createAsyncThunk(
  "user/getUserPersonalDataByIdAction",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await getAxios().get<DetailedUser>(
        `/api/user/${userId}/personal`
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Get user contacts by ID action - API call only */
export const getUserContactsByIdAction = createAsyncThunk(
  "user/getUserContactsByIdAction",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await getAxios().get(`/api/user/${userId}/contacts`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Update user personal information - API call only */
export const updateUserPersonalAction = createAsyncThunk(
  "user/updateUserPersonalAction",
  async (
    { userId, userData }: { userId: number; userData: UpdateUserRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAxios().put<DetailedUser>(
        `/api/user/${userId}/personal`,
        userData
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Update user action (backward compatibility) */
export const updateUserAction = updateUserPersonalAction;

/** Update user password action - API call only */
export const updateUserPasswordAction = createAsyncThunk(
  "user/updateUserPasswordAction",
  async (
    { userId, password }: { userId: number; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAxios().put<DetailedUser>(
        `/api/user/${userId}/password`,
        { password }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Get user authentication email action */
export const getUserAuthEmailAction = createAsyncThunk(
  "user/getUserAuthEmailAction",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await getAxios().get(`/api/user/${userId}/auth-email/`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Update user authentication email action */
export const updateUserAuthEmailAction = createAsyncThunk(
  "user/updateUserAuthEmailAction",
  async (
    { userId, authEmail }: { userId: number; authEmail: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAxios().put(`/api/user/${userId}/auth-email/`, {
        authEmail,
      });
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
        `/api/user/${userId}/status-roles`,
        { statusId, roleIds }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Save user contacts action - API call only */
export const saveUserContactsAction = createAsyncThunk(
  "user/saveUserContactsAction",
  async (
    {
      userId,
      contactData,
    }: {
      userId: number;
      contactData: {
        officeEmail?: string;
        personalEmail?: string;
        officialPhone?: string;
        personalPhone?: string;
        emergencyContactName1?: string;
        emergencyPhone1?: string;
        emergencyContactName2?: string;
        emergencyPhone2?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAxios().put(
        `/api/user/${userId}/contacts`,
        contactData
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Save user job details action - API call only */
export const saveUserJobDetailsAction = createAsyncThunk(
  "user/saveUserJobDetailsAction",
  async (
    {
      userId,
      jobData,
    }: {
      userId: number;
      jobData: {
        hiringDate?: string;
        joiningDate?: string;
        probationPeriodMonths?: number;
        designation?: string;
        department?: string;
        userId?: string;
        ctc?: number;
        reportingManagerId?: number;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAxios().post(
        `/api/user/${userId}/job-details`,
        jobData
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Get user job details action - API call only */
export const getUserJobDetailsAction = createAsyncThunk(
  "user/getUserJobDetailsAction",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await getAxios().get(`/api/user/${userId}/job-details`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);
