import { createSlice } from "@reduxjs/toolkit";

// User state interface
interface UserState {
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: UserState = {
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
  extraReducers: builder => {},
});

// Export actions
export const { clearError } = userSlice.actions;

// Export slice
export default userSlice;

// Selectors
