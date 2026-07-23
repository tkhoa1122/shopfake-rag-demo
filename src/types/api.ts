/**
 * 📦 ShoppeFake API — TypeScript Types (đồng bộ với Backend)
 * Source: D:\WorkSpace\FPTedu\SEP490_RAG_Chatbot_BE\ShoppeFake\API_TYPES.ts
 */

// ============================================================================
// 🔢 ENUMS
// ============================================================================

export enum StatusEnum {
  Inactive = "Inactive",
  Active = "Active",
  Pending = "Pending",
}

export enum RoleEnum {
  Customer = 0,
  Admin = 1,
}

// ============================================================================
// 📋 GENERIC RESPONSE WRAPPERS
// ============================================================================

export interface ApiResponse<T = unknown> {
  code: number;
  statusCode: string;
  message: string;
  data?: T | null;
}

export interface BasePaginatedList<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  pageIndex?: number;
  pageSize?: number;
}

// ============================================================================
// 🔐 AUTH TYPES
// ============================================================================

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
}

// ============================================================================
// 👤 ACCOUNT TYPES
// ============================================================================

export interface AccountResponse {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  lastUpdatedAt?: string | null;
  status: StatusEnum;
}

// ============================================================================
// 🏷️ CATEGORY TYPES
// ============================================================================

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string | null;
  status: StatusEnum;
  createdAt: string;
  updatedAt?: string | null;
}

// ============================================================================
// 📦 PRODUCT TYPES
// ============================================================================

export interface ProductResponse {
  id: number;
  name: string;
  brand: string;
  description: string;
  slug: string;
  status: StatusEnum;
  createdAt: string;
  updatedAt?: string | null;
  categoryName: string;
}

// ============================================================================
// 🎨 ATTRIBUTE TYPES
// ============================================================================

export interface ValueResponseV1 {
  valueText: string;
  slug: string;
}

export interface AttributeResponse {
  id: number;
  name: string;
  code: string;
  attributeValues: ValueResponseV1[];
}

// ============================================================================
// 👔 VARIANT TYPES
// ============================================================================

export interface VariantAttributeValueResponse {
  attributeId: number;
  attributeName: string;
  attributeCode: string;
  values: ValueResponseV1[];
}

export interface VariantResponse {
  id: number;
  productId: number;
  productName: string;
  productDescription: string;
  variantName: string;
  price: number;
  stockQuantity: number;
  sku: string;
  weightGrams: number;
  imageUrl: string[];
  status: StatusEnum;
  createdAt: string;
  updatedAt?: string | null;
  variantAttributes: VariantAttributeValueResponse[];
}

// ============================================================================
// 🛒 CART ITEM TYPES
// ============================================================================

export interface CartItemRequest {
  productVariantId: number;
  quantity: number;
}

export interface CartItemResponse {
  id: number;
  productVariantId: number;
  variantName: string;
  productName: string;
  price: number;
  quantity: number;
}

// ============================================================================
// ⭐ FEEDBACK TYPES
// ============================================================================

export interface FeedbackRequest {
  accountId: string;
  productId: number;
  rating: number;
  comment: string;
}

export interface FeedbackResponse {
  id: number;
  accountId: string;
  accountName: string;
  productId: number;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ============================================================================
// 🖼️ IMAGE TYPES
// ============================================================================

export interface ImageResponse {
  imageUrl: string;
  productId: number;
  variantId: number;
}

// ============================================================================
// 🎯 COMBINED RESPONSE TYPES (convenience)
// ============================================================================

export type ProductListResponse = ApiResponse<BasePaginatedList<ProductResponse>>;
export type CategoryListResponse = ApiResponse<BasePaginatedList<CategoryResponse>>;
export type VariantListResponse = ApiResponse<BasePaginatedList<VariantResponse>>;
export type CartItemListResponse = ApiResponse<BasePaginatedList<CartItemResponse>>;
export type FeedbackListResponse = ApiResponse<BasePaginatedList<FeedbackResponse>>;
