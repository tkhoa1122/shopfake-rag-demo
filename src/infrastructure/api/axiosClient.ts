import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Base URL của Backend API (production: Render.com)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://shoppefake-yuky.onrender.com/api/v1";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor: tự động gắn JWT token nếu có ─────────────────────
axiosClient.interceptors.request.use(
  (config) => {
    // Chỉ chạy ở phía client (browser)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
        try {
          const decoded = jwtDecode<any>(token);
          const rawRole = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
          if (rawRole) {
            // Map backend role to the value the API expects in X-User-Role header
            const roleMap: Record<string, string> = {
              "Admin": "SYSTEM_ADMIN",
              "admin": "SYSTEM_ADMIN",
              "Administrator": "SYSTEM_ADMIN",
            };
            config.headers["X-User-Role"] = roleMap[rawRole] || rawRole;
          }
        } catch (e) {
          console.error("Error decoding JWT:", e);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: xử lý lỗi toàn cục ─────────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Token hết hạn hoặc không hợp lệ → xóa và redirect về login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      document.cookie = "auth_token=; path=/; max-age=0";
      // Không redirect cứng để tránh loop, để middleware xử lý
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
