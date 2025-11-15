import { createAsyncThunk } from "@reduxjs/toolkit";
import getAxios, { getAppErrorMessage } from "@/utils/axiosApi";
import {
  type CreateChatChannelSchema,
  chatChannelListResponseSchema,
  type ChatChannelListResponse,
  chatMessageApiSchema,
  type ChatMessageApiResponse,
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

export interface SendChannelMessagePayload {
  channelId: number;
  text?: string;
  mediaUrl?: string;
  replyToMessageId?: number;
}

export const sendChannelMessageAction = createAsyncThunk<
  ChatMessageApiResponse,
  SendChannelMessagePayload,
  { rejectValue: string }
>("chat/sendChannelMessageAction", async (payload, { rejectWithValue }) => {
  try {
    const { channelId, ...body } = payload;
    const response = await getAxios().post(
      `api/chat/channel/${channelId}/message`,
      body
    );
    return chatMessageApiSchema.parse(response.data);
  } catch (error: unknown) {
    return rejectWithValue(getAppErrorMessage(error));
  }
});
