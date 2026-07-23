// Infrastructure: TenantRepositoryImpl
import type { TenantRepository } from "@/domain/repositories/TenantRepository";
import type { Tenant, TenantConfig } from "@/domain/entities/User";
import type { ApiResponse, PaginatedResponse } from "@/domain/dto/api/ApiResponse";
import { axiosClient } from "@/infrastructure/api/axiosClient";

class TenantRepositoryImpl implements TenantRepository {
  async getTenantBySlug(slug: string): Promise<ApiResponse<TenantConfig>> {
    try {
      const res = await axiosClient.get<ApiResponse<TenantConfig>>(`/tenants/slug/${slug}`);
      return res.data;
    } catch {
      return { status: "fail", message: "Tenant not found", error: null, success: false };
    }
  }

  async getAllTenants(page = 1, pageSize = 20): Promise<PaginatedResponse<Tenant>> {
    const res = await axiosClient.get<PaginatedResponse<Tenant>>("/tenants", {
      params: { page, pageSize },
    });
    return res.data;
  }

  async createTenant(tenant: Omit<Tenant, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Tenant>> {
    const res = await axiosClient.post<ApiResponse<Tenant>>("/tenants", tenant);
    return res.data;
  }

  async updateTenant(id: string, tenant: Partial<Tenant>): Promise<ApiResponse<Tenant>> {
    const res = await axiosClient.patch<ApiResponse<Tenant>>(`/tenants/${id}`, tenant);
    return res.data;
  }

  async deleteTenant(id: string): Promise<ApiResponse<null>> {
    const res = await axiosClient.delete<ApiResponse<null>>(`/tenants/${id}`);
    return res.data;
  }
}

export const tenantRepositoryImpl = new TenantRepositoryImpl();
