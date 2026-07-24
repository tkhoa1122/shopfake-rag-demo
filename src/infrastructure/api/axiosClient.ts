import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Base URL của Backend API (production: Render.com)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://shoppefake-yuky.onrender.com/api/v1";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s timeout — đủ cho Cloud Run cold start (~5-15s)
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
  async (error) => {
    const status = error.response?.status;
    const config = error.config;

    // ── 401: Token hết hạn → xóa và redirect về /login ───────────────────
    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      document.cookie = "auth_token=; path=/; max-age=0";
      // Redirect về login nếu đang ở trang cần auth (không phải trang public)
      const publicPaths = ["/", "/login", "/admin/login"];
      const isPublic = publicPaths.some((p) => window.location.pathname === p || window.location.pathname.startsWith("/products"));
      if (!isPublic && !config?._isRetry) {
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        } else {
          window.location.href = "/login";
        }
      }
    }

    // ── 502/503/504: Cloud Run cold start — retry 1 lần sau 3s ───────────
    // Google Cloud Run sẽ tắt container sau ~15 phút không hoạt động.
    // Request đầu tiên sau đó cần thời gian "warm up", gây ra 502/504.
    if ((status === 502 || status === 503 || status === 504 || !status) && !config?._isRetry) {
      config._isRetry = true;
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Đợi 3s
      console.warn(`[axiosClient] Retry sau lỗi ${status ?? "network"} (Cloud Run cold start)...`);
      return axiosClient(config);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
