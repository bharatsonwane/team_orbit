import { createAsyncThunk } from "@reduxjs/toolkit";
import getAxios, { getAppErrorMessage } from "@/utils/axiosApi";
import {
  type CreateChatChannelSchema,
  chatChannelListResponseSchema,
  type ChatChannelListResponse,
  chatMessageApiSchema,
  type ChatMessageApiResponse,
  type SendChannelMessagePayload,
  type FetchChannelMessagesPayload,
} from "@/schemas/chatSchema";

export const createChatChannelAction = createAsyncThunk(
  "chat/createChatChannelAction",
  async (payload: CreateChatChannelSchema, { rejectWithValue }) => {
    try {
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
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(getAppErrorMessage(error));
  }
});

export const fetchChannelMessagesAction = createAsyncThunk<
  ChatMessageApiResponse[],
  FetchChannelMessagesPayload,
  { rejectValue: string }
>("chat/fetchChannelMessagesAction", async (payload, { rejectWithValue }) => {
  try {
    const { channelId, before, limit } = payload;
    const params: Record<string, string | number> = {};
    if (before) params.before = before;
    if (limit) params.limit = limit;

    const response = await getAxios().get(
      `api/chat/channel/${channelId}/messages`,
      { params }
    );

    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(getAppErrorMessage(error));
  }
});

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
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(getAppErrorMessage(error));
  }
});
