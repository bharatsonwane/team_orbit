import { createSlice } from "@reduxjs/toolkit";

interface ChatState {
  error: string | null;
}

const initialState: ChatState = {
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {},
  extraReducers: builder => {},
});

export default chatSlice;
