import { createAsyncThunk } from '@reduxjs/toolkit';
import getAxios, { getAppErrorMessage } from '../../utils/axiosApi';
import type { LoginCredentials, LoginResponse, User } from '@/schemas/user';



/** Login action - API call only */
export const loginAction = createAsyncThunk(
  'user/loginAction',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // Make login API call only
      const response = await getAxios().post<LoginResponse>(
        'api/user/login',
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
  'user/getUserProfileAction',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAxios().get<User>('/api/user/profile');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);
