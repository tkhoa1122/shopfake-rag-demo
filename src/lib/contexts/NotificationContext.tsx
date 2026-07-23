"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((type: NotificationType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, title, message }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 4000);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 md:bottom-auto md:top-0 md:right-4 md:p-6 w-full md:w-auto max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <NotificationItem key={notif.id} notification={notif} onClose={() => removeNotification(notif.id)} />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context;
}

function NotificationItem({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-rose-500" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const bgs = {
    success: "bg-emerald-50/80 border-emerald-100",
    error: "bg-rose-50/80 border-rose-100",
    warning: "bg-amber-50/80 border-amber-100",
    info: "bg-blue-50/80 border-blue-100",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md",
        bgs[notification.type]
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[notification.type]}</div>
      <div className="flex-1 pr-6">
        <h3 className="text-sm font-semibold text-slate-800">{notification.title}</h3>
        {notification.message && <p className="mt-1 text-sm text-slate-600 leading-snug">{notification.message}</p>}
      </div>
      <button
        onClick={onClose}
        className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-black/5 hover:text-slate-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
