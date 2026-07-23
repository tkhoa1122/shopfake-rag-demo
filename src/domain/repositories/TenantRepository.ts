// Domain Repository Interface: Tenant
// Gateway between Domain and Infrastructure — pure interface, no implementation

import type { Tenant, TenantConfig } from "@/domain/entities/User";
import type { ApiResponse, PaginatedResponse } from "@/domain/dto/api/ApiResponse";

export interface TenantRepository {
  getTenantBySlug(slug: string): Promise<ApiResponse<TenantConfig>>;
  getAllTenants(page?: number, pageSize?: number): Promise<PaginatedResponse<Tenant>>;
  createTenant(tenant: Omit<Tenant, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Tenant>>;
  updateTenant(id: string, tenant: Partial<Tenant>): Promise<ApiResponse<Tenant>>;
  deleteTenant(id: string): Promise<ApiResponse<null>>;
}
