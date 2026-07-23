import axios from "axios";
import type { ApiResponse, BasePaginatedList } from "@/types/api";

// Chúng ta gọi Proxy API nội bộ của Next.js, không gọi trực tiếp lên backend
const conversationAxios = axios.create({
  baseURL: "/api/chat/conversations", // Đường dẫn Proxy
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderType: "Customer" | "ChatBot" | string;
  contentType?: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  externalCustomerId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface SendMessageCommand {
  message: string;
  externalCustomerId: string;
}

export interface ConversationListResponse {
  items: Conversation[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface MessageListResponse {
  items: ChatMessage[];
  nextCursor?: string;
}

export const conversationAPI = {
  /**
   * 1. Start a New Conversation
   * POST /api/chat/conversations/messages
   */
  startConversation: async (command: SendMessageCommand): Promise<ApiResponse<Conversation>> => {
    const { data } = await conversationAxios.post<ApiResponse<Conversation>>("/messages", command);
    return data;
  },

  /**
   * 2. Continue an Existing Conversation
   * POST /api/chat/conversations/{id}/messages
   */
  sendMessage: async (conversationId: string, command: SendMessageCommand): Promise<ApiResponse<Conversation>> => {
    const { data } = await conversationAxios.post<ApiResponse<Conversation>>(`/${conversationId}/messages`, command);
    return data;
  },

  /**
   * 3. Get Chat History (Infinite Scroll with Cursor)
   * GET /api/chat/conversations/{id}/messages
   */
  getMessages: async (
    conversationId: string,
    externalCustomerId: string,
    lastCursor?: string,
    limit = 20
  ): Promise<ApiResponse<MessageListResponse>> => {
    const { data } = await conversationAxios.get<ApiResponse<MessageListResponse>>(`/${conversationId}/messages`, {
      params: { externalCustomerId, lastCursor, limit },
    });
    return data;
  },

  /**
   * 4. List All Conversations for a Customer
   * GET /api/chat/conversations
   */
  getConversations: async (
    externalCustomerId: string,
    pageIndex = 1,
    pageSize = 10
  ): Promise<ApiResponse<ConversationListResponse>> => {
    const { data } = await conversationAxios.get<ApiResponse<ConversationListResponse>>("", {
      params: { externalCustomerId, pageIndex, pageSize },
    });
    return data;
  },
};
