/**
 * 📦 Product DTO — External API Schema
 *
 * Khớp với ProductCreateCommand từ External Swagger:
 *   POST /api/v1/product
 *
 * Ghi chú:
 *   - Đây là schema của External API (localhost:5000/swagger/external)
 *   - BO dùng Dashboard để quản lý sản phẩm thông qua endpoint này
 *   - Web bên ngoài cũng gọi endpoint này với API Key (không cần JWT)
 */

// ── Command gửi lên server (Create / Update) ───────────────────────────────────
export interface ProductCreateCommand {
  externalId?: string | null;        // ID sản phẩm từ hệ thống bên ngoài (nếu có)
  name?: string | null;              // Tên sản phẩm
  description?: string | null;       // Mô tả
  price: number;                     // Giá bán
  currency?: string | null;          // Đơn vị tiền tệ (VD: "VND", "USD")
  brand?: string | null;             // Thương hiệu
  stockQuantity: number;             // Số lượng tồn kho
  category?: string | null;         // Danh mục
  images?: string[] | null;          // Danh sách URL ảnh
  metadata?: Record<string, string> | null; // Dữ liệu mở rộng (key-value)
}

// ── Response từ server sau khi tạo/cập nhật ───────────────────────────────────
// BE chưa document response schema → dùng any tạm thời, cập nhật khi có thêm info
export interface ProductDTO {
  id?: string;
  externalId?: string | null;
  name?: string | null;
  description?: string | null;
  price: number;
  currency?: string | null;
  brand?: string | null;
  stockQuantity?: number;
  category?: string | null;
  images?: string[] | null;
  metadata?: Record<string, string> | null;
  createdAt?: string;
  updatedAt?: string | null;
  // Legacy fields (từ Storefront cũ — giữ lại để tương thích với ProductDataTable hiện có)
  product_id?: string;
  tenant_id?: string;
  p_name?: string;
  p_description?: string;
  p_price?: number;
  p_currency?: string;
  p_image_url?: string;
  p_category?: string;
  p_tags?: string[];
  in_stock?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Search Result (dành cho Storefront cũ nếu vẫn còn dùng) ───────────────────
export interface ProductSearchResultDTO {
  products: ProductDTO[];
  total: number;
  page: number;
  page_size: number;
}
