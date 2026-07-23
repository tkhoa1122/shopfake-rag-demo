// Infrastructure: ChatRepositoryImpl
// Implements the domain ChatRepository interface using chatAPI

import type { ChatRepository } from "@/domain/repositories/ChatRepository";
import type { ChatSession, SendMessagePayload, ChatMessage } from "@/domain/entities/Chat";
import type { ApiResponse } from "@/domain/dto/api/ApiResponse";
import { chatAPI } from "@/infrastructure/api/chatAPI";

class ChatRepositoryImpl implements ChatRepository {
  createSession(tenantId: string): Promise<ApiResponse<ChatSession>> {
    return chatAPI.createSession(tenantId);
  }

  sendMessage(payload: SendMessagePayload): Promise<ApiResponse<ChatMessage>> {
    return chatAPI.sendMessage(payload);
  }

  getSession(sessionId: string): Promise<ApiResponse<ChatSession>> {
    return chatAPI.getSession(sessionId);
  }
}

// Singleton instance — inject into use cases
export const chatRepositoryImpl = new ChatRepositoryImpl();
