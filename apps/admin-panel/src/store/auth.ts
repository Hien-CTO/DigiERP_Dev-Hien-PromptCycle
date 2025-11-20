import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, LoginRequest, LoginResponse } from '@/types/auth';
import apiClient from '@/lib/api';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true });
        try {
          console.log('🔐 Attempting login with:', { 
            usernameOrEmail: credentials.usernameOrEmail,
            passwordLength: credentials.password.length 
          });
          
          // Gọi API login và nhận response với tokens
          const loginResponse = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
          console.log('✅ Login response:', loginResponse);
          
          // Lưu tokens vào apiClient để sử dụng trong các request tiếp theo
          apiClient.setAuthTokens(loginResponse.accessToken, loginResponse.refreshToken);
          
          // Gọi API /me để lấy đầy đủ thông tin user (bao gồm roles và permissions)
          try {
            const userProfile = await apiClient.get<UserProfile>('/api/auth/me');
            console.log('✅ User profile:', userProfile);
            set({
              user: userProfile,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (profileError) {
            // Nếu không lấy được profile, sử dụng thông tin từ login response
            console.warn('⚠️ Could not fetch user profile, using login response data');
            const userProfile: UserProfile = {
              ...loginResponse.user,
              roles: [],
              permissions: [],
            };
            set({
              user: userProfile,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error: any) {
          console.error('❌ Login failed:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Gọi API logout
          await apiClient.post('/api/auth/logout', {});
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear tokens từ localStorage
          apiClient.clearAuthTokens();
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateUser: (user: UserProfile) => {
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initializeAuth: async () => {
        const currentState = get();
        
        // Kiểm tra xem có token trong localStorage không
        const hasToken = apiClient.isAuthenticated();
        
        // Nếu có token, luôn refresh user profile từ API để đảm bảo dữ liệu mới nhất
        // (bao gồm tenants mới nhất mà user thuộc về)
        if (hasToken) {
          set({ isLoading: true });
          try {
            console.log('🔄 Initializing auth: fetching user profile from API...');
            const userProfile = await apiClient.get<UserProfile>('/api/auth/me');
            console.log('✅ User profile loaded:', userProfile);
            console.log('📋 User tenants:', userProfile.tenants);
            set({
              user: userProfile,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error: any) {
            console.error('❌ Failed to fetch user profile:', error);
            // Nếu token không hợp lệ, clear auth
            apiClient.clearAuthTokens();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          // Không có token, đảm bảo state là unauthenticated
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      refreshUserProfile: async () => {
        const currentState = get();
        const hasToken = apiClient.isAuthenticated();
        
        if (!hasToken) {
          console.warn('⚠️ Cannot refresh user profile: no token found');
          return;
        }
        
        set({ isLoading: true });
        try {
          console.log('🔄 Refreshing user profile from API...');
          const userProfile = await apiClient.get<UserProfile>('/api/auth/me');
          console.log('✅ User profile refreshed:', userProfile);
          console.log('📋 User tenants:', userProfile.tenants);
          set({
            user: userProfile,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('❌ Failed to refresh user profile:', error);
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Lưu user profile vào localStorage (tokens được lưu riêng trong apiClient)
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          // Sau khi hydrate xong, kiểm tra lại token và sync state
          if (state && typeof window !== 'undefined') {
            const hasToken = apiClient.isAuthenticated();
            // Nếu có token nhưng state chưa có user hoặc isAuthenticated = false, cần sync
            if (hasToken && (!state.user || !state.isAuthenticated)) {
              console.log('🔄 Rehydrated state but token exists, syncing auth state...');
              // Tự động gọi initializeAuth để sync state
              setTimeout(() => {
                useAuthStore.getState().initializeAuth();
              }, 0);
            } else if (!hasToken && (state.user || state.isAuthenticated)) {
              // Nếu không có token nhưng state vẫn có user, clear state
              console.log('⚠️ No token found but state has user, clearing auth state...');
              setTimeout(() => {
                useAuthStore.setState({
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                });
              }, 0);
            }
          }
        };
      },
    }
  )
);
