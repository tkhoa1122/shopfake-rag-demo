/**
 * 🔐 Auth DTO — Request/Response cho tầng Authentication (Main API)
 *
 * Dùng cho: mainAuthAPI.ts
 * Không chứa logic, chỉ chứa cấu trúc dữ liệu.
 */

// ── Request ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// ── Response ───────────────────────────────────────────────────────────────────

/** Response thực tế từ POST /api/v1/auth/login */
export interface LoginResponse {
  accessToken: string;
  isEmailVerified?: boolean;
  isProfileCompleted?: boolean;
  /** Các trường dưới đây được giải mã từ JWT, KHÔNG nằm trong response gốc */
  role?: string;
  tenantId?: string | null;
}

/** Response từ GET /api/v1/auth/me */
export interface MeResponse {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  tenantId?: string | null;
  status?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: number;
  avatarUrl?: string;
}
