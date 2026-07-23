import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TenantConfig } from "@/domain/entities/User";

interface TenantState {
  tenantConfig: TenantConfig | null;
  isLoading: boolean;
}

const initialState: TenantState = {
  tenantConfig: null,
  isLoading: false,
};

const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    setTenantConfig(state, action: PayloadAction<TenantConfig>) {
      state.tenantConfig = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    clearTenant(state) {
      state.tenantConfig = null;
    },
  },
});

export const { setTenantConfig, setLoading, clearTenant } = tenantSlice.actions;
export default tenantSlice.reducer;
