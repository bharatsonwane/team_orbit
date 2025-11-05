import { createSlice } from "@reduxjs/toolkit";
import type { Tenant } from "../../schemas/tenant";
import { getTenantsAction, getTenantAction } from "../actions/tenantActions";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Tenant state interface
interface TenantState {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  pagination: PaginationInfo | null; // 👈 Added pagination
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: TenantState = {
  tenants: [],
  currentTenant: null,
  pagination: null, // 👈 Added
  isLoading: false,
  error: null,
};

// Tenant slice
const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearCurrentTenant: state => {
      state.currentTenant = null;
      state.pagination = null;
    },
    addTenant: (state, action) => {
      state.tenants.unshift(action.payload);
    },
    updateTenant: (state, action) => {
      const index = state.tenants.findIndex(
        tenant => tenant.id === action.payload.id
      );
      if (index !== -1) {
        state.tenants[index] = action.payload;
      }
    },
  },
  extraReducers: builder => {
    builder
      // Get tenants actions
      .addCase(getTenantsAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTenantsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tenants = action.payload || [];
        state.error = null;
      })
      .addCase(getTenantsAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get single tenant actions
      .addCase(getTenantAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTenantAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTenant = action.payload;
        state.error = null;
      })
      .addCase(getTenantAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError, clearCurrentTenant, addTenant, updateTenant } =
  tenantSlice.actions;

// Export slice
export default tenantSlice;

// Selectors
export const selectTenants = (state: { tenant: TenantState }) =>
  state.tenant.tenants;
export const selectCurrentTenant = (state: { tenant: TenantState }) =>
  state.tenant.currentTenant;

export const selectTenantLoading = (state: { tenant: TenantState }) =>
  state.tenant.isLoading;
export const selectTenantError = (state: { tenant: TenantState }) =>
  state.tenant.error;
