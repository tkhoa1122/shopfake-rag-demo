/**
 * 🏢 Business DTO — Request/Response cho tầng Business Management
 *
 * Dùng cho: businessAPI.ts (UC-005, UC-009)
 * Không chứa logic, chỉ chứa cấu trúc dữ liệu.
 */

// ── Business ───────────────────────────────────────────────────────────────────

export type BusinessStatus = "REJECTED" | "ACTIVE" | "DELETED" | "PENDING_APPROVAL";

export interface Business {
  id: string;
  businessName?: string;
  businessOwnerEmail?: string;
  businessOwnerName?: string;
  hotLine?: string;
  websiteUrl?: string;
  addressLine?: string;
  businessStatus?: BusinessStatus;
  createdAt?: string;
}

export interface BusinessRegistrationCommand {
  businessName: string;
  businessOwnerEmail: string;
  businessOwnerName: string;
  hotLine?: string;
  websiteUrl?: string;
  addressLine?: string;
}

export interface UpdateBusinessCommand {
  businessName?: string;
  hotLine?: string;
  websiteUrl?: string;
  addressLine?: string;
}

export interface BusinessFilter {
  Search?: string;
  Status?: BusinessStatus;
  CreatedFrom?: string;
  PageIndex?: number;
  PageSize?: number;
}

// ── Catalog Team ───────────────────────────────────────────────────────────────

export type UserStatus = "ACTIVE" | "DELETED" | "PENDING_PROFILE_COMPLETION" | "PENDING_APPROVAL" | "REJECTED";

export interface CatalogMember {
  id: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: number;
  status?: UserStatus;
  isEmailVerified?: boolean;
}

export interface MemberRegistrationCommand {
  email: string;
  fullName: string;
}

export interface UpdateMemberCommand {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: number;
}

export interface MemberFilter {
  FullName?: string;
  Email?: string;
  IsEmailVerified?: boolean;
  Gender?: number;
  UserStatus?: UserStatus;
  OrderBy?: string;
  PageIndex?: number;
  PageSize?: number;
}
