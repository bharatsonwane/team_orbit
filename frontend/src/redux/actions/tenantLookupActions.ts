import { createAsyncThunk } from "@reduxjs/toolkit";
import getAxios, { getAppErrorMessage } from "../../utils/axiosApi";
import type {
  LookupItem,
  LookupListResponse,
  LookupType,
} from "@/schemaTypes/lookupSchemaTypes";
import type {
  CreateTenantLookupFormData,
  TenantLookupItem,
  UpdateTenantLookupFormData,
} from "@/schemaTypes/tenantLookupSchemaTypes";

/** Get tenant lookup list action - API call only */
export const getTenantLookupListAction = createAsyncThunk(
  "tenantLookup/getTenantLookupListAction",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAxios().get<LookupListResponse>(
        "/api/tenant-lookup/list"
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Get tenant lookup list by type ID - API call only */
export const getTenantLookupListByTypeIdAction = createAsyncThunk(
  "tenantLookup/getTenantLookupListByTypeIdAction",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getAxios().get<TenantLookupItem>(
        `/api/tenant-lookup/type/${id}`
      );
      return response.data;
    } catch (error: unknown) {
      // Proper error handling for rejected promises
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Update tenant lookup by id action - API Call only */

export const updateTenantLookupByIdAction = createAsyncThunk(
  "tenantLookup/updateTenantLookupByIdAction",
  async (
    { id, data }: { id: number | null; data: Partial<LookupItem> },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAxios().put<UpdateTenantLookupFormData>(
        `/api/tenant-lookup/${id}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Create tenant lookup by  id action - API Call only */
export const createTenantLookupByIdAction = createAsyncThunk(
  "tenantLookup/createTenantLookupByIdAction",
  async (data: CreateTenantLookupFormData, { rejectWithValue }) => {
    try {
      const response = await getAxios().post<CreateTenantLookupFormData>(
        `/api/tenant-lookup`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);
