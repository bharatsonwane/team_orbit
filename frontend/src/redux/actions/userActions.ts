import { createAsyncThunk } from '@reduxjs/toolkit';
import getAxios, { getAppErrorMessage } from '../../utils/axiosApi';

// User interface
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'USER' | 'ADMIN' | 'SUPER';
  created_at: string;
  updated_at: string;
}

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
}

// Login response interface
export interface LoginResponse {
  user: User;
  token: string;
}

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

      return response.data;
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
