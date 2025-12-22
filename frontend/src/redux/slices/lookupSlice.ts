import { createSlice } from "@reduxjs/toolkit";
import type { LookupType } from "../../schemaTypes/lookupSchemaTypes";
import { getLookupListAction } from "../actions/lookupAction";

// Lookup state interface
interface LookupState {
  lookupList: LookupType[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: LookupState = {
  lookupList: [],
  isLoading: false,
  error: null,
};

// Create lookup slice
export const lookupSlice = createSlice({
  name: "lookup",
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearLookupList: state => {
      state.lookupList = [];
    },
  },
  extraReducers: builder => {
    builder
      // Get lookup list actions
      .addCase(getLookupListAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLookupListAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lookupList = action.payload;
        state.error = null;
      })
      .addCase(getLookupListAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError, clearLookupList } = lookupSlice.actions;

// Export slice
export default lookupSlice;

// Selectors
export const selectLookupList = (state: { lookup: LookupState }) =>
  state.lookup.lookupList;
export const selectLookupLoading = (state: { lookup: LookupState }) =>
  state.lookup.isLoading;
export const selectLookupError = (state: { lookup: LookupState }) =>
  state.lookup.error;

// Helper selectors for specific lookup types
export const selectLookupTypeByName = (
  state: { lookup: LookupState },
  name: string
) => state.lookup.lookupList.find(lookupType => lookupType.name === name);
