import { createAsyncThunk } from "@reduxjs/toolkit";
import getAxios, { getAppErrorMessage } from "@/utils/axiosApi";
import {
  type CreateChatChannelSchema,
  chatChannelListResponseSchema,
  type ChatChannelListResponse,
  type SendChannelMessagePayload,
  type FetchChannelMessagesParam,
  type ChatMessage,
  type AddReactionData,
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
  ChatMessage[],
  FetchChannelMessagesParam,
  { rejectValue: string }
>("chat/fetchChannelMessagesAction", async (payload, { rejectWithValue }) => {
  try {
    const { chatChannelId, before, limit } = payload;
    const params: Record<string, string | number> = {};
    if (before) params.before = before;
    if (limit) params.limit = limit;

    const response = await getAxios().get(
      `api/chat/channel/${chatChannelId}/messages`,
      { params }
    );

    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(getAppErrorMessage(error));
  }
});

export const sendChannelMessageAction = createAsyncThunk<
  ChatMessage,
  SendChannelMessagePayload,
  { rejectValue: string }
>("chat/sendChannelMessageAction", async (payload, { rejectWithValue }) => {
  try {
    const { chatChannelId, ...body } = payload;
    const response = await getAxios().post(
      `api/chat/channel/${chatChannelId}/message`,
      body
    );
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(getAppErrorMessage(error));
  }
});

export const handleMessageReactionAction = createAsyncThunk<
  {
    id: number;
    messageId: number;
    userId: number;
    reaction: string;
    createdAt: string;
    isUpdated?: boolean;
    isRemoved?: boolean;
  },
  AddReactionData,
  { rejectValue: string }
>("chat/handleMessageReactionAction", async (payload, { rejectWithValue }) => {
  try {
    const { chatChannelId, messageId, reaction } = payload;
    const response = await getAxios().post(
      `api/chat/channel/${chatChannelId}/message/${messageId}/reaction`,
      { reaction }
    );
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(getAppErrorMessage(error));
  }
});
