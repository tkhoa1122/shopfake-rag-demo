import axios from "axios";
import type { ApiResponse, BasePaginatedList } from "@/types/api";

import { axiosClient } from "@/infrastructure/api/axiosClient";

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
    const { data } = await axiosClient.post<ApiResponse<Conversation>>("/chat/messages", command);
    return data;
  },

  /**
   * 2. Continue an Existing Conversation
   * POST /api/chat/conversations/{id}/messages
   */
  sendMessage: async (conversationId: string, command: SendMessageCommand): Promise<ApiResponse<Conversation>> => {
    const { data } = await axiosClient.post<ApiResponse<Conversation>>(`/chat/${conversationId}/messages`, command);
    return data;
  },

  /**
   * 3. Get Chat History (Infinite Scroll with Cursor)
   * GET /api/chat/conversations/{id}/messages
   */
  getMessages: async (
    conversationId: string,
    lastCursor?: string,
    limit = 20
  ): Promise<ApiResponse<MessageListResponse>> => {
    const { data } = await axiosClient.get<ApiResponse<MessageListResponse>>(`/chat/${conversationId}/messages`, {
      params: { limit, ...(lastCursor ? { lastCursor } : {}) },
    });
    return data;
  },

  /**
   * 4. List All Conversations for a Customer
   * GET /api/chat/conversations
   */
  getConversations: async (
    pageIndex = 1,
    pageSize = 10
  ): Promise<ApiResponse<ConversationListResponse>> => {
    const { data } = await axiosClient.get<ApiResponse<ConversationListResponse>>("/chat", {
      params: { pageIndex, pageSize },
    });
    return data;
  },
};
