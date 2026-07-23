import { axiosClient } from "@/infrastructure/api/axiosClient";
import type { ApiResponse } from "@/domain/dto/api/ApiResponse";
import type { ChatSession, SendMessagePayload, ChatMessage } from "@/domain/entities/Chat";

export const chatAPI = {
  createSession: async (tenantId: string): Promise<ApiResponse<ChatSession>> => {
    const res = await axiosClient.post<ApiResponse<ChatSession>>("/chat/sessions", { tenantId });
    return res.data;
  },

  sendMessage: async (payload: SendMessagePayload): Promise<ApiResponse<ChatMessage>> => {
    const res = await axiosClient.post<ApiResponse<ChatMessage>>(
      `/chat/sessions/${payload.sessionId}/messages`,
      { message: payload.message, tenantId: payload.tenantId }
    );
    return res.data;
  },

  getSession: async (sessionId: string): Promise<ApiResponse<ChatSession>> => {
    const res = await axiosClient.get<ApiResponse<ChatSession>>(`/chat/sessions/${sessionId}`);
    return res.data;
  },
};
