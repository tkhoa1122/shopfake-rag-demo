// Domain UseCase: CheckTenant
// Business rule: kiểm tra tenant_id (slug) có tồn tại và đang hoạt động không
// Dùng bởi (chat)/[tenant_id]/layout.tsx — public route guard

import type { TenantRepository } from "@/domain/repositories/TenantRepository";

export interface CheckTenantResult {
  valid: boolean;
  reason?: "NOT_FOUND" | "INACTIVE" | "ERROR";
}

export class CheckTenantUseCase {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async execute(slug: string): Promise<CheckTenantResult> {
    if (!slug || slug.trim() === "") {
      return { valid: false, reason: "NOT_FOUND" };
    }

    try {
      const result = await this.tenantRepository.getTenantBySlug(slug);
      if (!result.success || !result.data) {
        return { valid: false, reason: "NOT_FOUND" };
      }
      return { valid: true };
    } catch {
      return { valid: false, reason: "ERROR" };
    }
  }
}
