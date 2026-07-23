/**
 * 🔄 API Wrapper DTO — Cấu trúc response wrapper chung cho Main API
 *
 * Main API (localhost:5000) sử dụng wrapper khác với Storefront API.
 * File này cung cấp kiểu dùng chung, tránh khai báo lặp trong từng API file.
 */

export interface MainApiWrapper<T = unknown> {
  isSuccess?: boolean;
  success?: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
  statusCode?: number;
}

export interface MainPaginatedList<T> {
  items: T[];
  totalCount?: number;
  totalItems?: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
