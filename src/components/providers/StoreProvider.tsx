"use client";

import React, { useLayoutEffect, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/application/store";
import { setUser, logout } from "@/application/slices/userSlice";
import { jwtDecode } from "jwt-decode";
import { usePathname, useRouter } from "next/navigation";
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
      const rawRole: string =
        decoded.role ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded.Role ||
        "";

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
      role = roleMap[rawRole] || UserRole.CUSTOMER;

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

    // ── Token Expiration Checker ─────────────────────────────────────────────
    const checkInterval = setInterval(() => {
      const currentToken = localStorage.getItem("auth_token");
      if (currentToken) {
        try {
          const checkDecoded = jwtDecode<any>(currentToken);
          if (checkDecoded.exp && checkDecoded.exp * 1000 < Date.now()) {
            console.warn("[AuthHydrator] Token hết hạn trong lúc đang sử dụng, đăng xuất tự động.");
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            document.cookie = "auth_token=; path=/; max-age=0";
            store.dispatch(logout());
            if (window.location.pathname.startsWith("/admin")) {
              window.location.href = "/admin/login";
            } else {
              window.location.href = "/login";
            }
          }
        } catch {}
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, []);

  return null;
}

/**
 * Route protection logic for isolating Admin from Storefront.
 */
function RouteGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // Listen to store changes (or we can just check local storage)
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      const user = state.user.user;
      
      // If user is SYSTEM_ADMIN and is NOT on an /admin route, log them out
      if (user?.role === UserRole.SYSTEM_ADMIN && !pathname.startsWith("/admin")) {
        console.warn("[RouteGuard] Admin tried to access storefront. Logging out.");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        document.cookie = "auth_token=; path=/; max-age=0";
        store.dispatch(logout());
        router.push("/admin/login");
      }
    });

    // Check immediately on mount/path change
    const state = store.getState();
    const user = state.user.user;
    if (user?.role === UserRole.SYSTEM_ADMIN && !pathname.startsWith("/admin")) {
      console.warn("[RouteGuard] Admin tried to access storefront. Logging out.");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      document.cookie = "auth_token=; path=/; max-age=0";
      store.dispatch(logout());
      router.push("/admin/login");
    }

    return () => unsubscribe();
  }, [pathname, router, isMounted]);

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
      <RouteGuard />
      <CloudRunWarmup />
      {children}
    </Provider>
  );
}
