/**
 * 🔐 Auth API — Đăng nhập / Đăng ký cho Buyer
 *
 * Endpoints đã xác nhận trên BE (https://shoppefake-yuky.onrender.com):
 *   POST /api/v1/auth/login    — { email, password }
 *   POST /api/v1/auth/register — { email, password, fullName }
 *
 * Lưu ý: /auth/verify-otp KHÔNG có trong Swagger hiện tại.
 */

import axiosClient from "@/infrastructure/api/axiosClient";
import type { ApiResponse, AuthResponse, AccountResponse } from "@/types/api";

// ── Request types khớp đúng với BE ──────────────────────────────────────────

export interface BuyerLoginRequest {
  email: string;
  password: string;
}

export interface BuyerRegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  /**
   * Đăng nhập
   * POST /api/v1/auth/login
   * Body: { email, password }
   */
  login: async (
    request: BuyerLoginRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    const { data } = await axiosClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      request
    );

    // Lưu token vào localStorage và cookie khi đăng nhập thành công
    if (data.data?.token) {
      saveToken(data.data.token);
    }

    return data;
  },

  /**
   * Đăng ký tài khoản mới
   * POST /api/v1/auth/register
   * Body: { email, password, fullName }
   */
  register: async (
    request: BuyerRegisterRequest
  ): Promise<ApiResponse<AccountResponse>> => {
    const { data } = await axiosClient.post<ApiResponse<AccountResponse>>(
      "/auth/register",
      request
    );
    return data;
  },

  /**
   * Đăng xuất (client-side: xóa token)
   */
  logout: (): void => {
    clearToken();
  },

  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },

  isLoggedIn: (): boolean => {
    return !!authAPI.getToken();
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function saveToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
  // Cookie cho Next.js middleware
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  document.cookie = `auth_token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  document.cookie = "auth_token=; path=/; max-age=0";
  document.cookie = "user_role=; path=/; max-age=0";
}

export default authAPI;
