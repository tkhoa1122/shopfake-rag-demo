// Domain Entity: User & Tenant
// Pure business objects — no framework dependency

// ─── Roles ───────────────────────────────────────────────────────────────────
export const UserRole = {
  SYSTEM_ADMIN: "SYSTEM_ADMIN",         // Admin toàn nền tảng SaaS
  BUSINESS_OWNER: "BUSINESS_OWNER",     // Chủ doanh nghiệp — full quyền trên tenant
  CATALOG_MARKETING: "CATALOG_MARKETING", // Nhân viên quản lý danh mục
  CUSTOMER: "CUSTOMER",                 // Khách hàng của tenant (chat)
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string | null; // null cho SYSTEM_ADMIN; bắt buộc cho BUSINESS_OWNER, CATALOG_MARKETING
  avatarUrl?: string;
  createdAt: string;
}

// ─── Permission ───────────────────────────────────────────────────────────────
export type Permission =
  | "chat:read"
  | "chat:write"
  | "products:read"
  | "products:write"
  | "catalog:write"
  | "analytics:read"
  | "billing:read"       // chỉ BUSINESS_OWNER
  | "billing:write"      // chỉ BUSINESS_OWNER
  | "tenants:manage"     // chỉ SYSTEM_ADMIN
  | "users:manage"       // chỉ SYSTEM_ADMIN
  | "*";                 // full access — SYSTEM_ADMIN

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CUSTOMER]: ["chat:read", "chat:write"],
  [UserRole.CATALOG_MARKETING]: ["products:read", "products:write", "catalog:write", "analytics:read"],
  [UserRole.BUSINESS_OWNER]: [
    "products:read", "products:write", "catalog:write",
    "analytics:read", "billing:read", "billing:write",
  ],
  [UserRole.SYSTEM_ADMIN]: ["*"],
};

// ─── Tenant ───────────────────────────────────────────────────────────────────
export interface Tenant {
  id: string;
  name: string;
  slug: string;          // dùng làm tenant_id trong URL: /acme-corp
  logoUrl?: string;
  primaryColor?: string;
  plan: "free" | "pro" | "enterprise";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantConfig {
  tenantId: string;
  brandName: string;
  logoUrl?: string;
  primaryColor: string;
  welcomeMessage: string;
  ragIndexId: string;    // ID của vector store RAG cho tenant này
}
