/**
 * 📋 System Content DTO — Chính sách và nội dung hệ thống
 *
 * Dùng cho: systemContentAPI.ts (UC-002)
 * Không chứa logic, chỉ chứa cấu trúc dữ liệu.
 */

export type ContentType = "Markdown" | "Html";
export type SystemContentStatus = "Draft" | "Published" | "Deleted";

export interface SystemContent {
  id: string;
  title?: string;
  key?: string;
  content?: string;
  contentType?: ContentType;
  status?: SystemContentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSystemContentCommand {
  title: string;
  key: string;
  content: string;
  contentType: ContentType;
  status: SystemContentStatus;
}

export interface UpdateSystemContentCommand {
  title?: string;
  key?: string;
  content?: string;
  contentType?: ContentType;
  status?: SystemContentStatus;
}

export interface SystemContentFilter {
  Title?: string;
  Key?: string;
  ContentType?: ContentType;
  Status?: SystemContentStatus;
  OrderBy?: string;
  PageIndex?: number;
  PageSize?: number;
}
