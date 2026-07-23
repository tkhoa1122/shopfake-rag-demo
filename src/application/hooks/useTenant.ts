"use client";

import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { setTenantConfig, clearTenant } from "../slices/tenantSlice";

export function useTenant() {
  const dispatch = useAppDispatch();
  const { tenantConfig, isLoading } = useAppSelector((state) => state.tenant);

  return {
    tenantConfig: {
      tenantId: tenantConfig?.tenantId ?? null,
      brandName: tenantConfig?.brandName ?? "Smart Store",
      primaryColor: tenantConfig?.primaryColor ?? "#2c5243",
      logoUrl: tenantConfig?.logoUrl ?? "",
    },
    isLoading,
    tenantId: tenantConfig?.tenantId ?? null,
    brandName: tenantConfig?.brandName ?? "Smart Store",
    primaryColor: tenantConfig?.primaryColor ?? "#2c5243",
    setTenantConfig: (config: any) => dispatch(setTenantConfig({
      tenantId: config.tenantId,
      brandName: config.brandName,
      primaryColor: config.primaryColor,
      logoUrl: config.logoUrl
    } as any)),
    clearTenant: () => dispatch(clearTenant()),
  };
}
