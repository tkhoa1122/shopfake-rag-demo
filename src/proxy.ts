import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware — Server-side route protection
 *
 * Chạy trước khi trang render, đọc cookie auth_token (set bởi saveToken()
 * trong authAPI.ts). Không thể kiểm tra JWT signature ở đây (cần jose),
 * nhưng việc kiểm tra sự tồn tại của token đã là lớp bảo vệ đáng tin cậy
 * hơn client-side redirect vì nó chạy trên Edge, trước khi HTML được gửi.
 *
 * Để verify JWT signature đầy đủ, thêm thư viện `jose`:
 *   npm install jose
 *   rồi dùng jose.jwtVerify(token, secret) tại đây.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // ── Bảo vệ /admin/* (trừ /admin/login) ────────────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Chỉ chạy middleware trên routes admin cần bảo vệ nghiêm ngặt
export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
