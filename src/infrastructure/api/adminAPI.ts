import { axiosClient } from "@/infrastructure/api/axiosClient";
import type { ApiResponse } from "@/types/api";
import type { User } from "@/domain/entities/User";

export const adminAPI = {
  // === ACCOUNTS ===
  getAccounts: async (pageIndex = 1, pageSize = 50) => {
    const { data } = await axiosClient.get("/accounts", { params: { pageIndex, pageSize } });
    return data;
  },
  createAccount: async (payload: any) => {
    const { data } = await axiosClient.post("/accounts", payload);
    return data;
  },
  getAccountById: async (id: string | number) => {
    const { data } = await axiosClient.get(`/accounts/${id}`);
    return data;
  },
  updateAccount: async (id: string | number, payload: any) => {
    // API backend không hỗ trợ truyền ID rõ ràng, có khả năng đây là cập nhật profile
    const { data } = await axiosClient.put(`/accounts`, payload);
    return data;
  },
  deleteAccount: async (id: string | number) => {
    const { data } = await axiosClient.delete(`/accounts`, { params: { id } });
    return data;
  },

  // === CATEGORIES ===
  getCategories: async () => {
    const { data } = await axiosClient.get("/categories");
    return data;
  },
  getCategoryById: async (id: string | number) => {
    const { data } = await axiosClient.get(`/categories/${id}`);
    return data;
  },
  createCategory: async (payload: any) => {
    const { data } = await axiosClient.post("/categories", payload);
    return data;
  },
  updateCategory: async (id: string | number, payload: any) => {
    const { data } = await axiosClient.put(`/categories/${id}`, payload);
    return data;
  },

  deleteCategory: async (id: string | number) => {
    const { data } = await axiosClient.delete(`/categories/${id}`);
    return data;
  },

  // === PRODUCTS ===
  getProducts: async (params: any = {}) => {
    const { data } = await axiosClient.get("/products", { params });
    return data;
  },
  getProductById: async (id: string | number) => {
    const { data } = await axiosClient.get(`/products/${id}`);
    return data;
  },
  createProduct: async (payload: any) => {
    const { data } = await axiosClient.post("/products", payload);
    return data;
  },
  updateProduct: async (id: string | number, payload: any) => {
    const { data } = await axiosClient.put(`/products/${id}`, payload);
    return data;
  },

  deleteProduct: async (id: string | number) => {
    const { data } = await axiosClient.delete(`/products/${id}`);
    return data;
  },
  exportProductsExcel: async () => {
    const response = await axiosClient.get("/excel/export", { responseType: 'blob' });
    return response.data;
  },
  uploadImage: async (file: File, productId?: number, variantId?: number) => {
    const formData = new FormData();
    formData.append("Image", file);
    if (productId) formData.append("ProductId", productId.toString());
    if (variantId) formData.append("VariantId", variantId.toString());
    
    const { data } = await axiosClient.post("/images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },

  // === VARIANTS & ATTRIBUTES ===
  getAttributes: async () => {
    const { data } = await axiosClient.get("/attributes");
    return data;
  },
  getAttributeValues: async () => {
    const { data } = await axiosClient.get("/attribute-values");
    return data;
  },
  getVariants: async (params: any = {}) => {
    const { data } = await axiosClient.get("/variants", { params });
    return data;
  },
  createAttribute: async (payload: any) => {
    const { data } = await axiosClient.post("/attributes", payload);
    return data;
  },
  createAttributeValue: async (payload: any) => {
    const { data } = await axiosClient.post("/attribute-values", payload);
    return data;
  },
  createVariant: async (payload: any) => {
    const { data } = await axiosClient.post("/variants", payload);
    return data;
  },
  updateVariant: async (id: string | number, payload: any) => {
    const { data } = await axiosClient.put(`/variants/${id}`, payload);
    return data;
  },
  deleteVariant: async (id: string | number) => {
    const { data } = await axiosClient.delete(`/variants/${id}`);
    return data;
  },
  exportVariants: async () => {
    const response = await axiosClient.get("/variants/export", { responseType: 'blob' });
    return response.data;
  }
};
