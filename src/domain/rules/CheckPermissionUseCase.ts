// Domain UseCase: CheckPermission
// Business rule: kiểm tra user có quyền thực hiện action không
// Pure logic — không phụ thuộc framework, có thể test độc lập

import type { User, Permission } from "@/domain/entities/User";
import { ROLE_PERMISSIONS } from "@/domain/entities/User";

export interface CheckPermissionResult {
  allowed: boolean;
  reason?: string;
}

export class CheckPermissionUseCase {
  execute(user: User | null, permission: Permission): CheckPermissionResult {
    if (!user) {
      return { allowed: false, reason: "NOT_AUTHENTICATED" };
    }

    const permissions = ROLE_PERMISSIONS[user.role];

    // SYSTEM_ADMIN có wildcard
    if (permissions.includes("*")) {
      return { allowed: true };
    }

    if (permissions.includes(permission)) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `FORBIDDEN: role "${user.role}" does not have permission "${permission}"`,
    };
  }

  // Kiểm tra nhiều quyền — tất cả phải thỏa mãn
  executeAll(user: User | null, permissions: Permission[]): CheckPermissionResult {
    for (const perm of permissions) {
      const result = this.execute(user, perm);
      if (!result.allowed) return result;
    }
    return { allowed: true };
  }

  // Kiểm tra ít nhất 1 quyền thỏa mãn
  executeAny(user: User | null, permissions: Permission[]): CheckPermissionResult {
    for (const perm of permissions) {
      const result = this.execute(user, perm);
      if (result.allowed) return result;
    }
    return {
      allowed: false,
      reason: `FORBIDDEN: role "${user?.role}" does not have any of [${permissions.join(", ")}]`,
    };
  }
}

export const checkPermissionUseCase = new CheckPermissionUseCase();
