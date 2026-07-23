// UseCase: CreateChatSession

import type { ChatRepository } from "@/domain/repositories/ChatRepository";
import type { ChatSession } from "@/domain/entities/Chat";
import type { ApiResponse } from "@/domain/dto/api/ApiResponse";

export class CreateChatSessionUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(tenantId: string): Promise<ApiResponse<ChatSession>> {
    if (!tenantId) {
      return { status: "fail", message: "Tenant ID is required", error: null, success: false };
    }
    return this.chatRepository.createSession(tenantId);
  }
}
