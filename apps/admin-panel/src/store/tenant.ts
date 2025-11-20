import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TenantWithPrimary } from '@/types/auth';

interface TenantState {
  currentTenant: TenantWithPrimary | null;
}

interface TenantActions {
  setCurrentTenant: (tenant: TenantWithPrimary | null) => void;
  getCurrentTenantId: () => number | null;
}

type TenantStore = TenantState & TenantActions;

export const useTenantStore = create<TenantStore>()(
  persist(
    (set, get) => ({
      currentTenant: null,

      setCurrentTenant: (tenant) => {
        set({ currentTenant: tenant });
      },

      getCurrentTenantId: () => {
        return get().currentTenant?.tenantId || null;
      },
    }),
    {
      name: 'tenant-storage',
      partialize: (state) => ({
        currentTenant: state.currentTenant,
      }),
    }
  )
);

