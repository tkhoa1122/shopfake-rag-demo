"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/application/store";
import { setUser } from "@/application/slices/userSlice";
import { UserRole } from "@/domain/entities/User";
import type { User } from "@/domain/entities/User";

/**
 * BuyerAuthHydrator — Khôi phục trạng thái đăng nhập của Buyer từ localStorage
 * vào Redux Store mỗi khi app khởi động (F5, mở tab mới).
 * Chạy 1 lần duy nhất khi Provider mount.
 */
function BuyerAuthHydrator() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    // Đọc thông tin user đã cache (nếu có)
    let cachedUser: User | null = null;
    try {
      const raw = localStorage.getItem("auth_user");
      if (raw) cachedUser = JSON.parse(raw);
    } catch {
      // bỏ qua nếu JSON lỗi
    }

    const userToDispatch: User = cachedUser ?? {
      id: "",
      email: "",
      name: "Tài khoản",
      role: UserRole.CUSTOMER,
      createdAt: new Date().toISOString(),
    };

    // Đẩy vào Redux — Header và các component sẽ reactive ngay lập tức
    store.dispatch(setUser({ user: userToDispatch, token }));
  }, []);

  return null;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <BuyerAuthHydrator />
      {children}
    </Provider>
  );
}
