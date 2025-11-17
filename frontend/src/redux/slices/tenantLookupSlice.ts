import { createSlice } from "@reduxjs/toolkit";
import type { LookupType } from "../../schemas/lookupSchema";
import {
  getTenantLookupListAction,
  getTenantLookupListByTypeIdAction,
  createTenantLookupByIdAction,
} from "../actions/tenantLookupActions";

// Lookup state interface
interface TenantLookupState {
  tenantLookupList: LookupType[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: TenantLookupState = {
  tenantLookupList: [],
  isLoading: false,
  error: null,
};

// Create lookup slice
export const tenantLookupSlice = createSlice({
  name: "tenantLookup",
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearLookupList: state => {
      state.tenantLookupList = [];
    },
  },
  extraReducers: builder => {
    builder
      // Get lookup list actions
      .addCase(getTenantLookupListAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTenantLookupListAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tenantLookupList = action.payload;
        state.error = null;
      })
      .addCase(getTenantLookupListAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError, clearLookupList } = tenantLookupSlice.actions;

// Export slice
export default tenantLookupSlice;

// Selectors
export const selectTenantLookupList = (state: {
  tenantLookup: TenantLookupState;
}) => state.tenantLookup.tenantLookupList;
export const selectTenantLookupLoading = (state: {
  tenantLookup: TenantLookupState;
}) => state.tenantLookup.isLoading;
export const selectTenantLookupError = (state: {
  tenantLookup: TenantLookupState;
}) => state.tenantLookup.error;

// Helper selectors for specific lookup types
export const selectTenantLookupTypeByName = (
  state: { tenantLookup: TenantLookupState },
  name: string
) =>
  state.tenantLookup.tenantLookupList.find(
    lookupType => lookupType.name === name
  );
