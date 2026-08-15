/**
 * 🛍️ Storefront API — Dành cho Buyer
 *
 * Chỉ bao gồm các API đã xác nhận tồn tại trên BE:
 * Base URL: https://shoppefake-yuky.onrender.com/api/v1
 *
 * ✅ Các endpoint có sẵn:
 *   - GET  /products         — Danh sách sản phẩm
 *   - GET  /products/{id}    — Chi tiết sản phẩm
 *   - GET  /categories       — Danh sách danh mục
 *   - GET  /categories/{id}  — Chi tiết danh mục
 *   - GET  /variants         — Danh sách biến thể
 *   - GET  /variants/{id}    — Chi tiết biến thể
 *   - GET  /images           — Danh sách ảnh sản phẩm
 *   - GET  /attributes       — Danh sách thuộc tính
 *
 * ❌ Chưa có trên BE (sẽ bổ sung sau):
 *   - /cart-items
 *   - /feedbacks
 */

import axiosClient from "@/infrastructure/api/axiosClient";
import type {
  ApiResponse,
  BasePaginatedList,
  PaginationParams,
  ProductResponse,
  CategoryResponse,
  VariantResponse,
  ImageResponse,
  AttributeResponse,
  CartItemRequest,
  CartItemResponse,
  FeedbackRequest,
  FeedbackResponse,
} from "@/types/api";

// ============================================================================
// 📦 PRODUCTS — GET /products, GET /products/{id}
// ============================================================================

export const productAPI = {
  /**
   * Lấy danh sách tất cả sản phẩm (phân trang)
   */
  getAll: async (
    params?: PaginationParams
  ): Promise<ApiResponse<BasePaginatedList<ProductResponse>>> => {
    const { data } = await axiosClient.get<
      ApiResponse<BasePaginatedList<ProductResponse>>
    >("/products", { params });
    return data;
  },

  /**
   * Lấy chi tiết một sản phẩm theo ID
   */
  getById: async (id: number): Promise<ApiResponse<ProductResponse>> => {
    const { data } = await axiosClient.get<ApiResponse<ProductResponse>>(
      `/products/${id}`
    );
    return data;
  },
};

// ============================================================================
// 🏷️ CATEGORIES — GET /categories, GET /categories/{id}
// ============================================================================

export const categoryAPI = {
  /**
   * Lấy danh sách tất cả danh mục (phân trang)
   */
  getAll: async (
    params?: PaginationParams
  ): Promise<ApiResponse<BasePaginatedList<CategoryResponse>>> => {
    const { data } = await axiosClient.get<
      ApiResponse<BasePaginatedList<CategoryResponse>>
    >("/categories", { params });
    return data;
  },

  getById: async (id: number): Promise<ApiResponse<CategoryResponse>> => {
    const { data } = await axiosClient.get<ApiResponse<CategoryResponse>>(
      `/categories/${id}`
    );
    return data;
  },
};

// ============================================================================
// 👔 VARIANTS — GET /variants, GET /variants/{id}
// ============================================================================

export const variantAPI = {
  /**
   * Lấy danh sách tất cả biến thể (phân trang)
   * Dùng để lấy giá và ảnh của sản phẩm
   */
  getAll: async (
    params?: PaginationParams
  ): Promise<ApiResponse<BasePaginatedList<VariantResponse>>> => {
    const { data } = await axiosClient.get<
      ApiResponse<BasePaginatedList<VariantResponse>>
    >("/variants", { params });
    return data;
  },

  getById: async (id: number): Promise<ApiResponse<VariantResponse>> => {
    const { data } = await axiosClient.get<ApiResponse<VariantResponse>>(
      `/variants/${id}`
    );
    return data;
  },

  /**
   * Resolve the SKU included in an AI "add to cart" link to the variant
   * identifier required by the cart API. The public API currently has no
   * single-variant-by-SKU endpoint, so page through the catalogue instead of
   * assuming that the desired variant is on the first page.
   */
  findBySku: async (sku: string): Promise<VariantResponse | null> => {
    const normalizedSku = sku.trim().toLowerCase();
    if (!normalizedSku) return null;

    const pageSize = 100;
    let pageIndex = 1;

    while (true) {
      const response = await variantAPI.getAll({ pageIndex, pageSize });
      const page = response.data;
      const match = page?.items.find(
        (variant) => variant.sku?.trim().toLowerCase() === normalizedSku
      );

      if (match) return match;
      if (!page || pageIndex >= page.totalPages || page.items.length === 0) {
        return null;
      }

      pageIndex += 1;
    }
  },
};

// ============================================================================
// 🖼️ IMAGES — GET /images
// ============================================================================

export const imageAPI = {
  /**
   * Lấy danh sách ảnh sản phẩm
   */
  getAll: async (
    params?: PaginationParams
  ): Promise<ApiResponse<BasePaginatedList<ImageResponse>>> => {
    const { data } = await axiosClient.get<
      ApiResponse<BasePaginatedList<ImageResponse>>
    >("/images", { params });
    return data;
  },
};

// ============================================================================
// 🎨 ATTRIBUTES — GET /attributes
// ============================================================================

export const attributeAPI = {
  getAll: async (
    params?: PaginationParams
  ): Promise<ApiResponse<BasePaginatedList<AttributeResponse>>> => {
    const { data } = await axiosClient.get<
      ApiResponse<BasePaginatedList<AttributeResponse>>
    >("/attributes", { params });
    return data;
  },
};

// ============================================================================
// 🛒 CART — Chưa có API, dùng localStorage tạm thời
// ============================================================================

export interface LocalCartItem {
  variantId: number;
  productName: string;
  variantName: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export const localCartAPI = {
  getAll: (): LocalCartItem[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("cart_items") || "[]");
    } catch {
      return [];
    }
  },

  add: (item: Omit<LocalCartItem, "quantity"> & { quantity?: number }): void => {
    const cart = localCartAPI.getAll();
    const existing = cart.find((c) => c.variantId === item.variantId);
    if (existing) {
      existing.quantity += item.quantity ?? 1;
    } else {
      cart.push({ ...item, quantity: item.quantity ?? 1 });
    }
    localStorage.setItem("cart_items", JSON.stringify(cart));
  },

  updateQuantity: (variantId: number, quantity: number): void => {
    const cart = localCartAPI.getAll();
    const item = cart.find((c) => c.variantId === variantId);
    if (item) item.quantity = quantity;
    localStorage.setItem("cart_items", JSON.stringify(cart));
  },

  remove: (variantId: number): void => {
    const cart = localCartAPI.getAll().filter((c) => c.variantId !== variantId);
    localStorage.setItem("cart_items", JSON.stringify(cart));
  },

  clear: (): void => {
    localStorage.removeItem("cart_items");
  },

  getTotalCount: (): number => {
    return localCartAPI.getAll().reduce((sum, item) => sum + item.quantity, 0);
  },
};

// ============================================================================
// 🛒 REAL CART API — GET, POST, PUT, DELETE /cart-items
// ============================================================================

export const cartAPI = {
  getCartItems: async (params?: PaginationParams): Promise<ApiResponse<BasePaginatedList<CartItemResponse>>> => {
    const { data } = await axiosClient.get<ApiResponse<BasePaginatedList<CartItemResponse>>>("/cart-items", { params });
    return data;
  },

  addToCart: async (request: CartItemRequest): Promise<ApiResponse<null>> => {
    const { data } = await axiosClient.post<ApiResponse<null>>("/cart-items", request);
    return data;
  },

  updateQuantity: async (id: number, quantity: number): Promise<ApiResponse<null>> => {
    const { data } = await axiosClient.put<ApiResponse<null>>(`/cart-items/${id}/${quantity}`);
    return data;
  },

  removeFromCart: async (id: number): Promise<ApiResponse<null>> => {
    const { data } = await axiosClient.delete<ApiResponse<null>>(`/cart-items/${id}`);
    return data;
  }
};

// ============================================================================
// ⭐ FEEDBACK API — GET, POST /feedbacks
// ============================================================================

export const feedbackAPI = {
  getProductFeedbacks: async (productId: number, params?: PaginationParams): Promise<ApiResponse<BasePaginatedList<FeedbackResponse>>> => {
    const { data } = await axiosClient.get<ApiResponse<BasePaginatedList<FeedbackResponse>>>(`/feedbacks/product/${productId}`, { params });
    return data;
  },

  createFeedback: async (request: FeedbackRequest): Promise<ApiResponse<null>> => {
    const { data } = await axiosClient.post<ApiResponse<null>>("/feedbacks", request);
    return data;
  }
};

// ============================================================================
// 📦 ORDER API — GET /orders, GET /orders/{orderId}
// ============================================================================

export interface OrderResponse {
  id: number;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items?: OrderItemResponse[];
}

export interface OrderItemResponse {
  id: number;
  variantId: number;
  variantName: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export const orderAPI = {
  /**
   * Lấy danh sách đơn hàng của user hiện tại (phân trang)
   */
  getAll: async (params?: { pageNumber?: number; pageSize?: number }): Promise<any> => {
    const { data } = await axiosClient.get("/orders", { params });
    return data;
  },

  /**
   * Lấy chi tiết 1 đơn hàng theo ID
   */
  getById: async (orderId: number): Promise<any> => {
    const { data } = await axiosClient.get(`/orders/${orderId}`);
    return data;
  },
};

// ============================================================================
// 💳 PAYMENT API — POST /payments
// ============================================================================

export interface CheckoutPaymentRequest {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  returnUrl: string;
  cancelUrl: string;
}

export const paymentAPI = {
  /**
   * Tạo đơn hàng và lấy payment URL từ PayOS
   * Response chứa paymentUrl để redirect user
   */
  checkout: async (payload: CheckoutPaymentRequest): Promise<any> => {
    const { data } = await axiosClient.post("/payments", payload);
    return data;
  },
};
