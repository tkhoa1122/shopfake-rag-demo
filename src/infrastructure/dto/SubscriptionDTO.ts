/**
 * 📦 Subscription & Payment DTO — Gói cước và thanh toán
 *
 * Dùng cho: subscriptionAPI.ts (UC-004, UC-008)
 * Không chứa logic, chỉ chứa cấu trúc dữ liệu.
 */

// ── Subscription ───────────────────────────────────────────────────────────────

export type StatusEnums = "Active" | "Inactive";

export interface Subscription {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration: number;          // số ngày
  tokenLimit: number;
  messageLimit: number;
  maxProductAllowed: number;
  status?: StatusEnums;
  createdAt?: string;
}

export interface SubscriptionAddCommand {
  name: string;
  description?: string;
  price: number;
  duration: number;
  tokenLimit: number;
  messageLimit: number;
  maxProductAllowed: number;
}

export interface SubscriptionUpdateCommand extends SubscriptionAddCommand {}

export interface SubscriptionFilter {
  "Filter.Search"?: string;
  "Filter.Status"?: StatusEnums;
  "Filter.PageIndex"?: number;
  "Filter.PageSize"?: number;
}

// ── Payment ────────────────────────────────────────────────────────────────────

export type PaymentStatus = "Pending" | "Completed" | "Failed" | "Cancelled";

export interface Payment {
  id?: string;
  orderCode?: number;
  amount?: number;
  description?: string;
  status?: PaymentStatus;
  createdAt?: string;
  subscriptionName?: string;
  businessId?: string;
}

export interface PaymentFilter {
  "Filter.Search"?: string;
  "Filter.PaymentEnums"?: PaymentStatus;
  "Filter.CreateAtOrderBy"?: string;
  "Filter.PageIndex"?: number;
  "Filter.PageSize"?: number;
}
