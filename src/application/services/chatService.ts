import { createAsyncThunk } from "@reduxjs/toolkit";
import { chatRepositoryImpl } from "@/infrastructure/repositories/ChatRepositoryImpl";
import { CreateChatSessionUseCase } from "@/application/usecases/chat/CreateChatSessionUseCase";
import { SendMessageUseCase } from "@/application/usecases/chat/SendMessageUseCase";

export const initChatSession = createAsyncThunk(
  "chat/initSession",
  async (tenantId: string, { rejectWithValue }) => {
    try {
      const useCase = new CreateChatSessionUseCase(chatRepositoryImpl);
      const response = await useCase.execute(tenantId);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to start chat session");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to start chat session");
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { sessionId, tenantId, message }: { sessionId: string; tenantId: string; message: string },
    { rejectWithValue }
  ) => {
    try {
      const useCase = new SendMessageUseCase(chatRepositoryImpl);
      const response = await useCase.execute({
        sessionId,
        tenantId,
        message,
      });
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to send message");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to send message");
    }
  }
);
