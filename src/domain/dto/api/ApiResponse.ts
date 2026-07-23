// DTO: API Response wrapper
// Mirrors the exact shape returned by the backend API (check F12 > Network)

export interface ApiResponse<T = unknown> {
  status: "success" | "fail";
  message: string;
  data?: T | null;
  length?: number;
  error: unknown | null;
  success: boolean;
  refreshToken?: string | null;
  accessToken?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
