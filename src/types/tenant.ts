export interface Tenant {
  id: string;
  name: string;
  slug: string; // used as tenant_id in URL
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
  ragIndexId: string; // ID of the vector store for this tenant
}
