import { createSlice } from "@reduxjs/toolkit";
import type { ChatChannelListItem } from "@/schemas/chat";
import {
  fetchChatChannelsAction,
  createChatChannelAction,
} from "../actions/chatActions";

interface ChatState {
  channels: ChatChannelListItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  channels: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchChatChannelsAction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatChannelsAction.fulfilled, (state, action) => {
        state.loading = false;
        state.channels = action.payload;
      })
      .addCase(fetchChatChannelsAction.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Unable to load channels. Please try again.";
      })
      .addCase(createChatChannelAction.rejected, (state, action) => {
        state.error =
          (action.payload as string) ||
          "Failed to create channel. Please try again.";
      });
  },
});

export default chatSlice;
