// Domain Repository Interface: Chat
// Gateway between Domain and Infrastructure — pure interface, no implementation

import type { ChatSession, SendMessagePayload, ChatMessage } from "@/domain/entities/Chat";
import type { ApiResponse } from "@/domain/dto/api/ApiResponse";

export interface ChatRepository {
  createSession(tenantId: string): Promise<ApiResponse<ChatSession>>;
  sendMessage(payload: SendMessagePayload): Promise<ApiResponse<ChatMessage>>;
  getSession(sessionId: string): Promise<ApiResponse<ChatSession>>;
}
