import { createAsyncThunk } from "@reduxjs/toolkit";
import getAxios, { getAppErrorMessage } from "../../utils/axiosApi";
import type { LookupListResponse } from "@/schemas/lookup";

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
