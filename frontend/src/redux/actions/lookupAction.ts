import { createAsyncThunk } from "@reduxjs/toolkit";
import getAxios, { getAppErrorMessage } from "../../utils/axiosApi";
import type { LookupListResponse } from "@/schemaTypes/lookupSchemaTypes";

/** Get lookup list action - API call only */
export const getLookupListAction = createAsyncThunk(
  "lookup/getLookupListAction",
  async (_, { rejectWithValue }) => {
    try {
      const response =
        await getAxios().get<LookupListResponse>("/api/lookup/list");
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);
