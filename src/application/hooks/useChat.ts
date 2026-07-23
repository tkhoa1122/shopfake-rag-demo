"use client";

import { useState, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { addMessage } from "../slices/chatSlice";
import { initChatSession, sendChatMessage } from "../services/chatService";
import type { ChatMessage } from "@/domain/entities/Chat";

export function useChat(tenantId: string) {
  const dispatch = useAppDispatch();
  const { session, messages, isLoading, error } = useAppSelector((state) => state.chat);
  
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const initSession = useCallback(() => {
    dispatch(initChatSession(tenantId));
  }, [tenantId, dispatch]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !session) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    
    // Add user message optimistically
    dispatch(addMessage(userMessage as any));
    setInput("");

    // Dispatch the thunk to send message
    await dispatch(sendChatMessage({
      sessionId: session.id,
      tenantId,
      message: input,
    }));
    
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [input, session, tenantId, dispatch]);

  return { messages, isLoading, error, input, setInput, sendMessage, initSession, bottomRef };
}
