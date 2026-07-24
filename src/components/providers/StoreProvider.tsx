"use client";

import React, { useLayoutEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/application/store";
import { setUser } from "@/application/slices/userSlice";
import { jwtDecode } from "jwt-decode";
import { UserRole } from "@/domain/entities/User";
import type { User } from "@/domain/entities/User";

/**
 * Hydrate Redux store from JWT token SYNCHRONOUSLY before any child renders.
 * Uses useLayoutEffect to guarantee it runs before children's useEffect.
 */
function AuthHydrator() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

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
  }, []);

  return null;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator />
      {children}
    </Provider>
  );
}
