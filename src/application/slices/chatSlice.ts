import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ChatMessage, ChatSession } from "@/domain/entities/Chat";
import { initChatSession, sendChatMessage } from "../services/chatService";

interface ChatState {
  session: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  session: null,
  messages: [],
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<ChatSession>) {
      state.session = action.payload;
      state.messages = action.payload.messages || [];
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearChat(state) {
      state.session = null;
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // We will import the thunks at the top
    builder
      .addCase(initChatSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initChatSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload as any;
        state.messages = (action.payload as any).messages || [];
      })
      .addCase(initChatSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to start chat session";
      })
      .addCase(sendChatMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push(action.payload as any);
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to send message";
      });
  },
});

export const { setSession, addMessage, setLoading, setError, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
