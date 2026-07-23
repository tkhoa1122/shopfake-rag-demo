// UseCase: SendMessage
// Orchestrates: validate → call repository → return result

import type { ChatRepository } from "@/domain/repositories/ChatRepository";
import type { SendMessagePayload, ChatMessage } from "@/domain/entities/Chat";
import type { ApiResponse } from "@/domain/dto/api/ApiResponse";

export class SendMessageUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(payload: SendMessagePayload): Promise<ApiResponse<ChatMessage>> {
    if (!payload.message.trim()) {
      return { status: "fail", message: "Message cannot be empty", error: null, success: false };
    }
    return this.chatRepository.sendMessage(payload);
  }
}
