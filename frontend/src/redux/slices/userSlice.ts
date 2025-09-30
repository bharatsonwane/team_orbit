import { createSlice } from '@reduxjs/toolkit';
import type { User } from '../../schemas/user';

// User state interface
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
});

// Export actions
export const { clearError } = userSlice.actions;

// Export slice
export default userSlice;
// Selectors
export const selectUserLoading = (state: { user: UserState }) =>
  state.user.isLoading;
export const selectUserError = (state: { user: UserState }) => state.user.error;
