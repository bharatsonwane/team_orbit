import { createAsyncThunk } from "@reduxjs/toolkit";
import getAxios, { getAppErrorMessage } from "../../utils/axiosApi";
import type {
  Tenant,
  TenantListResponse,
  TenantUsersResponse,
  CreateTenantRequest,
} from "@/schemas/tenant";

/** Get tenant list action - API call only */
export const getTenantsAction = createAsyncThunk(
  "tenant/getTenantsAction",
  async (_, { rejectWithValue }) => {
    try {
      const response =
        await getAxios().get<TenantListResponse>("/api/tenant/list");
      return response.data; // Direct array response
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Get single tenant action - API call only */
export const getTenantAction = createAsyncThunk(
  "tenant/getTenantAction",
  async (tenantId: number, { rejectWithValue }) => {
    try {
      const response = await getAxios().get<Tenant>(`/api/tenant/${tenantId}`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Create tenant action - API call only */
export const createTenantAction = createAsyncThunk(
  "tenant/createTenantAction",
  async (tenantData: CreateTenantRequest, { rejectWithValue }) => {
    try {
      const response = await getAxios().post<Tenant>(
        "/api/tenant/create",
        tenantData
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Update tenant action - API call only */
export const updateTenantAction = createAsyncThunk(
  "tenant/updateTenantAction",
  async (
    { tenantId, updateData }: { tenantId: number; updateData: Partial<Tenant> },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAxios().put<Tenant>(
        `/api/tenant/${tenantId}`,
        updateData
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);
