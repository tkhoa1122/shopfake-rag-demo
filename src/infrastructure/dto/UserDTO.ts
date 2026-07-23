/**
 * 👥 User DTO — Quản lý người dùng
 *
 * Dùng cho: userAPI.ts (UC-005, UC-003)
 * Không chứa logic, chỉ chứa cấu trúc dữ liệu.
 */

export type UserStatus = "ACTIVE" | "DELETED" | "PENDING_PROFILE_COMPLETION" | "PENDING_APPROVAL" | "REJECTED";

export interface UserRecord {
  id: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: number;
  status?: UserStatus;
  isEmailVerified?: boolean;
  role?: string;
  tenantId?: string | null;
  createdAt?: string;
}

export interface UpdateUserCommand {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: number;
}

export interface UserFilter {
  FullName?: string;
  Email?: string;
  IsEmailVerified?: boolean;
  Gender?: number;
  UserStatus?: UserStatus;
  OrderBy?: string;
  PageIndex?: number;
  PageSize?: number;
}
