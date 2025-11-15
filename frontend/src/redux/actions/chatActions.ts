import { createAsyncThunk } from "@reduxjs/toolkit";
import getAxios, { getAppErrorMessage } from "@/utils/axiosApi";
import {
  type CreateChatChannelSchema,
  chatChannelListResponseSchema,
  type ChatChannelListResponse,
} from "@/schemas/chat";

export const createChatChannelAction = createAsyncThunk(
  "chat/createChatChannelAction",
  async (payload: CreateChatChannelSchema, { rejectWithValue }) => {
    try {
      console.log("payload", payload);

      const response = await getAxios().post<CreateChatChannelSchema>(
        "api/chat/channel/create",
        payload
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);

export const fetchChatChannelsAction = createAsyncThunk<
  ChatChannelListResponse,
  void,
  { rejectValue: string }
>("chat/fetchChatChannelsAction", async (_, { rejectWithValue }) => {
  try {
    const response = await getAxios().get("api/chat/channel/list");
    return chatChannelListResponseSchema.parse(response.data);
  } catch (error: unknown) {
    return rejectWithValue(getAppErrorMessage(error));
  }
});
