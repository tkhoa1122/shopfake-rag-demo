"use client";

import React, { useLayoutEffect, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/application/store";
import { setUser } from "@/application/slices/userSlice";
import { jwtDecode } from "jwt-decode";
import { UserRole } from "@/domain/entities/User";
import type { User } from "@/domain/entities/User";
import { API_BASE_URL } from "@/infrastructure/api/axiosClient";

/**
 * Hydrate Redux store from JWT token SYNCHRONOUSLY before any child renders.
 * Uses useLayoutEffect to guarantee it runs before children's useEffect.
 */
function AuthHydrator() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    // ── Kiểm tra JWT hết hạn trước khi dùng ────────────────────────────────
    try {
      const decoded = jwtDecode<any>(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        // Token đã hết hạn — xóa ngay để tránh gọi API bị 401
        console.warn("[AuthHydrator] Token hết hạn, đã tự động xóa.");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        document.cookie = "auth_token=; path=/; max-age=0";
        return;
      }
    } catch {
      // Không parse được token — xóa luôn
      localStorage.removeItem("auth_token");
      return;
    }

    let email = "Tài khoản";
    let role: string = UserRole.CUSTOMER;

    try {
      const decoded = jwtDecode<any>(token);

      // Try multiple common claim keys for role
      let rawRole: string | string[] =
        decoded.role ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded.Role ||
        "";
      
      if (Array.isArray(rawRole)) rawRole = rawRole[0] || "";

      // Map backend role values to frontend UserRole constants
      const roleMap: Record<string, string> = {
        "Admin": UserRole.SYSTEM_ADMIN,
        "admin": UserRole.SYSTEM_ADMIN,
        "ADMIN": UserRole.SYSTEM_ADMIN,
        "SYSTEM_ADMIN": UserRole.SYSTEM_ADMIN,
        "SystemAdmin": UserRole.SYSTEM_ADMIN,
        "Administrator": UserRole.SYSTEM_ADMIN,
        "BUSINESS_OWNER": UserRole.BUSINESS_OWNER,
        "BusinessOwner": UserRole.BUSINESS_OWNER,
        "CATALOG_MARKETING": UserRole.CATALOG_MARKETING,
        "CatalogMarketing": UserRole.CATALOG_MARKETING,
        "CUSTOMER": UserRole.CUSTOMER,
        "Customer": UserRole.CUSTOMER,
      };
      role = roleMap[rawRole as string] || UserRole.CUSTOMER;

      email =
        decoded.email ||
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
        decoded.Email ||
        decoded.sub ||
        "Tài khoản";

      console.log("[AuthHydrator] Raw role:", rawRole, "→ Mapped role:", role);
    } catch (e) {
      console.error("[AuthHydrator] Failed to decode token:", e);
    }

    const userToDispatch: User = {
      id: "",
      email: email,
      name: email,
      role: role as UserRole,
      createdAt: new Date().toISOString(),
    };

    store.dispatch(setUser({ user: userToDispatch, token }));
  }, []);

  return null;
}

/**
 * Warm up Cloud Run khi app khởi động.
 * Google Cloud Run tắt container sau ~15 phút idle — ping nhẹ để "đánh thức" trước.
 * Dùng endpoint public (GET /api/v1/products) với pageSize=1 (nhanh nhất).
 */
function CloudRunWarmup() {
  useEffect(() => {
    const ping = async () => {
      try {
        await fetch(`${API_BASE_URL}/products?pageIndex=1&pageSize=1`, {
          method: "GET",
          signal: AbortSignal.timeout(25000),
        });
        console.log("[Warmup] Backend đã sẵn sàng.");
      } catch {
        // Im lặng nếu lỗi — Interceptor sẽ retry
      }
    };
    ping();
  }, []);
  return null;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator />
      <CloudRunWarmup />
      {children}
    </Provider>
  );
}
