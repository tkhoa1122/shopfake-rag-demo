/**
 * 🔑 API Key DTO — Quản lý Secret Key
 *
 * Dùng cho: apiKeyAPI.ts (UC-010)
 * Không chứa logic, chỉ chứa cấu trúc dữ liệu.
 *
 * Response từ BE (Internal Swagger):
 *   {
 *     "id": "6a4709d3...",
 *     "name": "Smart Shop",
 *     "keyId": "ssc_live_e80fb670a70e",         ← masked key prefix
 *     "fullKey": "ssc_live_e80fb670a70e.cyN...", ← chỉ trả về khi vừa tạo / GET detail
 *     "status": "Active",                         ← "Active" | "Revoked"
 *     "createdAt": "2026-07-03T08:01:07+07:00"
 *   }
 */

export interface ApiKeyDto {
  id: string;
  name: string;
  keyId?: string;     // Prefix hiển thị (VD: ssc_live_e80fb670a70e) — từ BE
  keyMasked?: string; // Alias cũ — giữ cho tương thích
  keyPrefix?: string; // Alias cũ — giữ cho tương thích
  status?: string;    // "Active" | "Revoked" — từ BE (ưu tiên)
  isActive?: boolean; // Alias cũ — giữ cho tương thích (DEPRECATED)
  createdAt: string;
  expiresAt?: string | null;
  lastUsedAt?: string | null;
}

export interface ApiKeyDetailDto extends ApiKeyDto {
  fullKey?: string;   // Mã key gốc đầy đủ — trả về khi vừa tạo hoặc GET detail
  keyValue?: string;  // Alias cũ — giữ cho tương thích
}

export interface CreateApiKeyRequest {
  name: string;
}

// ── Helper ─────────────────────────────────────────────────────────────────────
/** Kiểm tra trạng thái Active từ cả 2 kiểu trả về của BE */
export function isKeyActive(key: ApiKeyDto): boolean {
  if (key.status !== undefined) {
    return key.status === "Active";
  }
  return key.isActive === true;
}

/** Lấy giá trị masked key từ cả 2 kiểu trả về */
export function getMaskedKey(key: ApiKeyDto): string {
  return key.keyId || key.keyMasked || `${key.keyPrefix || "ssc_live_"}••••••••`;
}

/** Lấy full key từ cả 2 kiểu trả về */
export function getFullKey(key: ApiKeyDetailDto): string | null {
  return key.fullKey || key.keyValue || null;
}
