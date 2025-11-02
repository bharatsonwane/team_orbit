import { createAsyncThunk } from "@reduxjs/toolkit";
import getAxios, { getAppErrorMessage } from "../../utils/axiosApi";
import type { LookupItem, LookupListResponse } from "@/schemas/lookup";

/** Get tenant lookup list action - API call only */
export const getTenantLookupListAction = createAsyncThunk(
  "tenantLookup/getTenantLookupListAction",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAxios().get<LookupListResponse>(
        "/api/tenant-lookup/list"
      );
      console.log(response, "response");
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Get tenant lookup list by id action - API call only */
export const getTenantLookupListByTypeIdAction = createAsyncThunk(
  "tenantLookup/getTenantLookupListByTypeIdAction",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getAxios().get<LookupListResponse>(
        `/api/tenant-lookup/type/${id}`
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Update tenant lookups by id action - API Call only */

export const updateTenantLookupsByTypeIdAction = createAsyncThunk(
  "tenantLookup/updateTenantLookupsByTypeIdAction",
  async (
    { id, data }: { id: number | null; data: Partial<LookupItem> },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAxios().put<LookupItem>(
        `/api/tenant-lookup/type/${id}`,
        data
      );
      console.log(response);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

/** Create tenant lookups by type id action - API Call only */
export const createTenantLookupsByTypeIdAction = createAsyncThunk(
  "tenantLookup/createTenantLookupsByTypeIdAction",
  async (
    { id, data }: { id: number | null; data: Partial<LookupItem> },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAxios().post<LookupItem>(
        `/api/tenant-lookup/type/${id}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);
