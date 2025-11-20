import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Constants for localStorage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false, // Không cần cookies nữa vì dùng localStorage
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - thêm accessToken vào header Authorization
    this.client.interceptors.request.use(
      (config) => {
        const accessToken = this.getAccessToken();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        // Thêm tenantId vào header từ localStorage (được lưu bởi tenant store)
        if (typeof window !== 'undefined') {
          try {
            const tenantStorage = localStorage.getItem('tenant-storage');
            if (tenantStorage) {
              const parsed = JSON.parse(tenantStorage);
              // Zustand persist lưu state trực tiếp trong root object
              const tenantId = parsed?.currentTenant?.tenantId || parsed?.state?.currentTenant?.tenantId;
              if (tenantId) {
                config.headers['X-Tenant-ID'] = String(tenantId);
              }
            }
          } catch (error) {
            // Ignore errors when parsing tenant storage
            console.warn('Failed to parse tenant storage:', error);
          }
        }
        
        // If data is FormData, remove Content-Type header to let browser set it with boundary
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          console.log('🔐 Received 401, attempting to refresh token...');
          
          try {
            await this.refreshAccessToken();
            // Retry lại request với token mới
            console.log('✅ Token refreshed, retrying original request...');
            return this.client(originalRequest);
          } catch (refreshError: any) {
            console.error('❌ Failed to refresh token after 401:', refreshError);
            
            // Chỉ redirect nếu refresh token thực sự không hợp lệ (401, 403)
            // Không redirect nếu chỉ là network error hoặc lỗi khác
            if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
              console.warn('⚠️ Refresh token is invalid, redirecting to login');
              this.handleAuthError();
            }
            
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Attempting to refresh token...');
      
      // Gọi API refresh với refreshToken trong body
      // Backend có thể đọc từ body hoặc cookie
      const response = await axios.post<{ accessToken: string; refreshToken: string; expiresIn: number }>(
        `${API_BASE_URL}/api/auth/refresh`, 
        { refreshToken },
        { 
          withCredentials: false,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // Kiểm tra response có tokens không
      if (response.data && (response.data.accessToken || response.data.refreshToken)) {
        // Cập nhật tokens mới
        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken || refreshToken; // Fallback về token cũ nếu không có mới
        
        if (newAccessToken) {
          this.setAuthTokens(newAccessToken, newRefreshToken);
          console.log('✅ Token refreshed successfully');
        } else {
          throw new Error('No access token in refresh response');
        }
      } else {
        throw new Error('Invalid refresh response format');
      }
    } catch (error: any) {
      console.error('❌ Token refresh failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        hasRefreshToken: !!this.getRefreshToken(),
      });
      
      // Chỉ clear tokens nếu thực sự không thể refresh được (401, 403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('⚠️ Refresh token is invalid or expired, clearing tokens');
        this.clearAuthTokens();
      }
      
      throw error;
    }
  }

  private handleAuthError() {
    // Clear tokens từ localStorage nếu có lỗi auth
    this.clearAuthTokens();
    
    if (typeof window !== 'undefined') {
      // Thông báo cho user trước khi redirect
      console.warn('⚠️ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      
      // Lưu current path để redirect sau khi login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
      
      window.location.href = '/login';
    }
  }

  // Public methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  // Auth methods - localStorage
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setAuthTokens(accessToken: string, refreshToken: string) {
    // Lưu tokens vào localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  clearAuthTokens() {
    // Xóa tokens từ localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  isAuthenticated(): boolean {
    // Kiểm tra xem có accessToken trong localStorage không
    return !!this.getAccessToken();
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export const api = apiClient;
export default apiClient;
