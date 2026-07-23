"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, X, Send, Bot, User, Menu, Plus, 
  Loader2, ArrowDownCircle, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { conversationAPI, type ChatMessage, type Conversation } from "@/infrastructure/api/conversationAPI";

const EXTERNAL_CUSTOMER_ID = "demo-customer-123"; // ID giả định cho Storefront

// --- Markdown Text Renderer ---
function MarkdownText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}

// --- Streaming Markdown Component ---
function StreamingMarkdown({ text, isStreaming = false, onComplete }: { text: string, isStreaming?: boolean, onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState(isStreaming ? "" : text);
  
  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      return;
    }
    
    let i = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      // Nhảy 2 ký tự mỗi lần để gõ nhanh hơn
      i += 2;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, 15); // tốc độ đánh chữ (ms)
    
    return () => clearInterval(timer);
  }, [text, isStreaming, onComplete]);

  return <MarkdownText text={displayedText} />;
}

// Helper kiểm tra người gửi
const isUserMessage = (senderType?: string) => senderType?.toLowerCase() === "user" || senderType?.toLowerCase() === "customer";

// Đã loại bỏ helper xử lý date do không cần dùng nữa

// --- Main Chatbot Component ---
export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  
  // States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<(ChatMessage & { isNewStreaming?: boolean })[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Pagination & Loading
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastCursor, setLastCursor] = useState<string | undefined>(undefined);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // --- Fetch Data ---
  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const res = await conversationAPI.getConversations(EXTERNAL_CUSTOMER_ID, 1, 50);
      const items = res.data?.items || [];
      // Sắp xếp mới nhất lên đầu
      items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setConversations(items);
      
      if (items.length > 0 && !activeConversationId) {
        setActiveConversationId(items[0].id);
      }
    } catch (error) {
      console.error("Failed to load conversations", error);
    } finally {
      setLoadingConversations(false);
    }
  }, [activeConversationId]);

  const loadMessages = useCallback(async (conversationId: string, cursor?: string) => {
    setLoadingMessages(true);
    try {
      const res = await conversationAPI.getMessages(conversationId, EXTERNAL_CUSTOMER_ID, cursor, 20);
      const newMessages = res.data?.items || [];
      
      // Backend trả về theo thứ tự mới nhất -> cũ nhất (hoặc ngược lại). 
      // Cần reverse lại để hiển thị đúng trong khung chat (cũ trên, mới dưới).
      const sortedMessages = [...newMessages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      if (cursor) {
        setMessages((prev) => [...sortedMessages, ...prev]);
      } else {
        setMessages(sortedMessages);
        // Scroll to bottom only on first load
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 100);
      }

      setLastCursor(res.data?.nextCursor);
      setHasMoreMessages(!!res.data?.nextCursor);
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // --- Effects ---
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, fetchConversations]);

  useEffect(() => {
    if (activeConversationId) {
      if (activeConversationId !== "new") {
        setLastCursor(undefined);
        setMessages([]);
        loadMessages(activeConversationId);
        // Nếu chuyển sang hội thoại khác, xóa fake "new" đi
        setConversations(prev => prev.filter(c => c.id !== "new"));
      }
      // Trên mobile, chọn conversation xong thì đóng sidebar
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  }, [activeConversationId, loadMessages]);

  // --- Handlers ---
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    // Nếu cuộn lên gần đầu mút trên cùng (top) thì tải thêm tin nhắn
    if (container.scrollTop <= 50 && !loadingMessages && hasMoreMessages && activeConversationId) {
      // Lưu lại vị trí cuộn hiện tại để sau khi tải không bị giật
      const oldScrollHeight = container.scrollHeight;
      
      loadMessages(activeConversationId, lastCursor).then(() => {
        // Khôi phục vị trí cuộn
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - oldScrollHeight;
        }, 10);
      });
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue("");
    
    // Optimistic UI
    const tempId = Date.now().toString();
    const tempMsg: ChatMessage & { isNewStreaming?: boolean } = {
      id: tempId,
      conversationId: activeConversationId || "new",
      senderType: "Customer",
      content: text,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, tempMsg]);
    setIsTyping(true);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      let res;
      let targetConvId = activeConversationId;
      if (activeConversationId && activeConversationId !== "new") {
        res = await conversationAPI.sendMessage(activeConversationId, {
          message: text,
          externalCustomerId: EXTERNAL_CUSTOMER_ID,
        });
      } else {
        res = await conversationAPI.startConversation({
          message: text,
          externalCustomerId: EXTERNAL_CUSTOMER_ID,
        });
        targetConvId = res.data?.id || null;
        setActiveConversationId(targetConvId);
      }

      // Chỉ thay thế hội thoại "new" bằng hội thoại thật từ server, giữ nguyên thứ tự
      if (res.data && activeConversationId === "new") {
        const updatedConv = res.data;
        setConversations(prev => {
          const index = prev.findIndex(c => c.id === "new");
          if (index !== -1) {
            const newList = [...prev];
            newList[index] = updatedConv;
            return newList;
          }
          return prev;
        });
      }

      // Thay thế temp message và hiển thị AI message
      if (res.data?.messages && res.data.messages.length > 0) {
        const sorted = [...res.data.messages].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages((prev) => {
          // Xóa tin tạm
          const filtered = prev.filter(m => m.id !== tempId);
          // Tìm tin nhắn mới nhất chưa có trong list
          const newMsgs = sorted.filter(s => !filtered.find(f => f.id === s.id)).map(m => ({
             ...m,
             // Đánh dấu để stream nếu là tin AI
             isNewStreaming: !isUserMessage(m.senderType) 
          }));
          return [...filtered, ...newMsgs];
        });
      } else if (targetConvId) {
        // Fallback: nếu Backend không trả kèm messages trong response, ta tự fetch lại
        const reloadRes = await conversationAPI.getMessages(targetConvId, EXTERNAL_CUSTOMER_ID, undefined, 20);
        if (reloadRes.data?.items) {
           const sorted = [...reloadRes.data.items].sort(
             (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
           );
           setMessages((prev) => {
             const filtered = prev.filter(m => m.id !== tempId);
             const newMsgs = sorted.filter(s => !filtered.find(f => f.id === s.id)).map(m => ({
               ...m,
               isNewStreaming: !isUserMessage(m.senderType) 
             }));
             return [...filtered, ...newMsgs];
           });
        }
      }
    } catch (error) {
      console.error("Failed to send message", error);
      // Revert optimistic UI on error (hoặc hiển thị lỗi)
    } finally {
      setIsTyping(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const createNewChat = () => {
    setActiveConversationId("new");
    setMessages([]);
    setLastCursor(undefined);
    setHasMoreMessages(false);
    
    setConversations(prev => {
      if (prev.find(c => c.id === "new")) return prev;
      return [{
        id: "new",
        title: "Hội thoại mới",
        externalCustomerId: EXTERNAL_CUSTOMER_ID,
        tenantId: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      }, ...prev];
    });

    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#A8E6CF] to-[#8fd4ba] text-[#2c5243] shadow-xl ring-4 ring-[#A8E6CF]/30 transition-shadow hover:shadow-2xl hover:ring-[#A8E6CF]/50"
          >
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#A8E6CF]/40" />
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 z-50 flex h-[600px] max-h-[calc(100vh-32px)] w-[800px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
            {/* --- SIDEBAR --- */}
            <div className={cn(
              "flex flex-col border-r border-border bg-muted/20 transition-all duration-300",
              isSidebarOpen ? "w-64" : "w-0 overflow-hidden border-r-0"
            )}>
              <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
                <h3 className="font-semibold text-foreground whitespace-nowrap">Hội thoại</h3>
                <button onClick={createNewChat} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted p-2">
                {loadingConversations ? (
                  <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Chưa có hội thoại nào</div>
                ) : (
                  conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={cn(
                        "w-full flex flex-col items-start rounded-xl p-3 mb-1 text-left transition-colors",
                        activeConversationId === conv.id ? "bg-[#A8E6CF]/20 text-[#2c5243]" : "hover:bg-muted/50"
                      )}
                    >
                      <span className="font-medium text-sm line-clamp-2 w-full leading-tight">{conv.title || "Hội thoại mới"}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* --- CHAT AREA --- */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-[#A8E6CF] to-[#C1E1C1] px-4 py-3">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-[#1c362b] hover:bg-white/40"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                    <Bot className="h-5 w-5 text-[#4a8a70]" />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1c362b]">Eco Fashion AI</h3>
                    <p className="text-[11px] font-medium text-[#2c5243]/80">Online • Phản hồi ngay</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-[#1c362b] transition-colors hover:bg-black/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Messages Area */}
              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto bg-slate-50/50 p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted"
              >
                {loadingMessages && (
                  <div className="flex justify-center p-2 mb-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                
                {(!messages || messages.length === 0) && !loadingMessages && (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground opacity-50">
                    <MessageCircle className="h-12 w-12 mb-3" />
                    <p>Hãy gửi tin nhắn để bắt đầu!</p>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {messages.map((msg) => {
                    const isUser = isUserMessage(msg.senderType);
                    return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex max-w-[85%] flex-col gap-1",
                        isUser ? "self-end" : "self-start"
                      )}
                    >
                      <div className={cn("flex items-end gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
                        {/* Avatar */}
                        <div className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
                          isUser ? "bg-slate-300" : "bg-[#A8E6CF]"
                        )}>
                          {isUser ? <User className="h-4 w-4 text-slate-600" /> : <Bot className="h-4 w-4 text-[#2c5243]" />}
                        </div>

                        {/* Bubble */}
                        <div className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm",
                          isUser
                            ? "rounded-br-sm bg-slate-900 text-white"
                            : "rounded-bl-sm border border-border bg-white text-slate-700 shadow-sm"
                        )}>
                          <StreamingMarkdown 
                            text={msg.content} 
                            isStreaming={msg.isNewStreaming} 
                            onComplete={() => {
                              setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isNewStreaming: false } : m))
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  )})}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex max-w-[85%] flex-col gap-1 self-start">
                      <div className="flex items-end gap-2 flex-row">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#A8E6CF] text-white shadow-sm">
                          <Bot className="h-4 w-4 text-[#2c5243]" />
                        </div>
                        <div className="rounded-2xl rounded-bl-sm border border-border bg-white px-4 py-2.5 shadow-sm">
                          <div className="flex items-center gap-1 h-5">
                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="shrink-0 border-t border-border bg-background p-3">
                <div className="flex items-end gap-2 rounded-xl border border-border bg-muted/30 p-1 focus-within:border-[#A8E6CF] focus-within:ring-1 focus-within:ring-[#A8E6CF]">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Hỏi AI về sản phẩm, size..."
                    className="max-h-30 min-h-9 w-full resize-none bg-transparent py-2 pl-3 text-sm outline-none placeholder:text-muted-foreground"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all",
                      inputValue.trim() && !isTyping
                        ? "bg-[#A8E6CF] text-[#2c5243] hover:bg-[#97d0ba]"
                        : "bg-muted text-muted-foreground/50 cursor-not-allowed"
                    )}
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </button>
                </div>
                <div className="mt-2 text-center text-[10px] text-muted-foreground">
                  Powered by Smart Shopping AI ✨
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
