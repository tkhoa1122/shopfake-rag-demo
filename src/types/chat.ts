export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  products?: import("./product").Product[]; // optional product suggestions
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

export interface ChatUIMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  isTyping?: boolean;
  productCarousel?: { id: string; name: string; price: string; image: string }[];
  markdownTable?: boolean;
}
