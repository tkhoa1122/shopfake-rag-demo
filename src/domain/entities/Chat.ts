// Domain Entity: Chat
// Represents core business objects — no framework dependency

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  products?: Product[]; // optional RAG-suggested products
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  tenantId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessagePayload {
  sessionId: string;
  tenantId: string;
  message: string;
}

// Avoid circular import — use inline type for Product reference
import type { Product } from "./Product";
