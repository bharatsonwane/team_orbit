import { createSlice } from "@reduxjs/toolkit";
import type { User } from "../../schemas/user";
import { loginAction, getUserProfileAction } from "../actions/userActions";

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
  name: "user",
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Login action
    builder
      .addCase(loginAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Get user profile action
    builder
      .addCase(getUserProfileAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProfileAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getUserProfileAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

// Export actions
export const { clearError } = userSlice.actions;

// Export slice
export default userSlice;

// Selectors
export const selectUser = (state: { user: UserState }) => state.user.user;
export const selectUserLoading = (state: { user: UserState }) =>
  state.user.isLoading;
export const selectUserError = (state: { user: UserState }) => state.user.error;
