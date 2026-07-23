/**
 * 📦 Product API — External API (Smart Shopping ChatBot Main Server)
 *
 * Base: NEXT_PUBLIC_EXTERNAL_API_URL (mặc định: http://localhost:5000/api/v1)
 * Swagger: http://localhost:5000/swagger/external/index.html
 *
 * Endpoints (External API):
 *   POST   /api/v1/product          — BO tạo sản phẩm mới
 *
 * Auth:
 *   - Dashboard (BO/CT): JWT Bearer token (từ main_auth_token trong localStorage)
 *   - Web bên ngoài: API Key qua header X-Api-Key
 *
 * Lưu ý: GET/PUT/DELETE sản phẩm chưa có trong External swagger.
 * Tạm thời giữ lại axiosClient (Storefront) cho các thao tác đọc.
 */


import { axiosClient } from "@/infrastructure/api/axiosClient";
import type { ProductCreateCommand, ProductDTO, ProductSearchResultDTO } from "@/infrastructure/dto/ProductDTO";
import type { ApiResponse, PaginatedResponse } from "@/domain/dto/api/ApiResponse";

export const productAPI = {

  // ── Storefront API (Render) — Đọc dữ liệu (tạm thời) ─────────────────────────
  // TODO: Cập nhật khi External API có thêm GET/PUT/DELETE cho sản phẩm

  /**
   * Lấy danh sách sản phẩm (phân trang)
   * GET /products (Storefront - tạm thời)
   */
  getProducts: async (tenantId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<ProductDTO>> => {
    const { data } = await axiosClient.get<PaginatedResponse<ProductDTO>>("/products", {
      params: { tenantId, page, pageSize },
    });
    return data;
  },

  /**
   * Lấy sản phẩm theo ID
   * GET /products/:id (Storefront - tạm thời)
   */
  getProductById: async (id: string): Promise<ApiResponse<ProductDTO>> => {
    const { data } = await axiosClient.get<ApiResponse<ProductDTO>>(`/products/${id}`);
    return data;
  },

  /**
   * Cập nhật sản phẩm (dùng External API khi có endpoint)
   * Tạm thời placeholder — chưa có endpoint PUT trong External swagger
   */
  updateProduct: async (id: string, product: Partial<ProductCreateCommand>): Promise<ApiResponse<ProductDTO>> => {
    // TODO: Cập nhật sang externalAxiosClient khi BE thêm PUT /api/v1/product/{id}
    const { data } = await axiosClient.patch<ApiResponse<ProductDTO>>(`/products/${id}`, product);
    return data;
  },

  /**
   * Xóa sản phẩm
   * Tạm thời placeholder — chưa có endpoint DELETE trong External swagger
   */
  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    // TODO: Cập nhật sang externalAxiosClient khi BE thêm DELETE /api/v1/product/{id}
    const { data } = await axiosClient.delete<ApiResponse<null>>(`/products/${id}`);
    return data;
  },

  /**
   * Tìm kiếm sản phẩm
   * GET /products/search (Storefront - tạm thời)
   */
  searchProducts: async (query: string, tenantId: string): Promise<ApiResponse<ProductSearchResultDTO>> => {
    const { data } = await axiosClient.get<ApiResponse<ProductSearchResultDTO>>("/products/search", {
      params: { q: query, tenantId },
    });
    return data;
  },
};
