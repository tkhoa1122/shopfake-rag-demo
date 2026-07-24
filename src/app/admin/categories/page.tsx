"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { adminAPI } from "@/infrastructure/api/adminAPI";
import { useNotification } from "@/lib/contexts/NotificationContext";

const PAGE_SIZE = 10;

export default function CategoriesManagementPage() {
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search, Sort & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState("id_asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", slug: "" });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await adminAPI.getCategories(200);
      const items = res.data?.items || res.items || res || [];
      setCategories(Array.isArray(items) ? items : []);
    } catch (err: any) {
      showNotification("error", "Lỗi tải dữ liệu", err.response?.data?.message || "Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // ── Filter, Sort & Paginate (client-side) ─────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    let result = categories.filter(c =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortConfig === "id_asc") return (a.id || 0) - (b.id || 0);
      if (sortConfig === "id_desc") return (b.id || 0) - (a.id || 0);
      if (sortConfig === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortConfig === "name_desc") return (b.name || "").localeCompare(a.name || "");
      return 0;
    });

    return result;
  }, [categories, searchQuery, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const paginated = filteredAndSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset về trang 1 khi search/sort thay đổi
  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortConfig]);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await adminAPI.deleteCategory(id);
      showNotification("success", "Thành công", "Đã xóa danh mục.");
      fetchCategories();
    } catch (err: any) {
      showNotification("error", "Lỗi", err.response?.data?.message || "Không thể xóa danh mục");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        slug: formData.slug || formData.name.toLowerCase().replace(/ /g, "-"),
      };
      if (editingId) {
        await adminAPI.updateCategory(editingId, payload);
        showNotification("success", "Thành công", "Đã cập nhật danh mục.");
      } else {
        await adminAPI.createCategory(payload);
        showNotification("success", "Thành công", "Đã tạo danh mục mới.");
      }
      handleCloseModal();
      fetchCategories();
    } catch (err: any) {
      showNotification("error", "Lỗi", err.response?.data?.message || "Không thể lưu danh mục");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = async (cat: any) => {
    try {
      setIsLoading(true);
      const res = await adminAPI.getCategoryById(cat.id);
      const data = res.data || res;
      setFormData({ name: data.name || "", description: data.description || "", slug: data.slug || "" });
      setEditingId(data.id);
      setIsModalOpen(true);
    } catch {
      showNotification("error", "Lỗi", "Không thể lấy thông tin danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: "", description: "", slug: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Danh mục</h1>
          <p className="text-slate-500 mt-1">
            {isLoading ? "Đang tải..." : `Tổng cộng ${filteredAndSorted.length} / ${categories.length} danh mục`}
          </p>
        </div>
        <button
          onClick={() => { setEditingId(null); setFormData({ name: "", description: "", slug: "" }); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </button>
      </div>

      {/* Toolbar: Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent transition-all text-sm bg-white"
          />
        </div>
        <div className="w-full sm:w-48 shrink-0">
          <select
            value={sortConfig}
            onChange={(e) => setSortConfig(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] transition-all text-sm bg-white"
          >
            <option value="id_asc">Cũ nhất (ID ↑)</option>
            <option value="id_desc">Mới nhất (ID ↓)</option>
            <option value="name_asc">Tên (A-Z)</option>
            <option value="name_desc">Tên (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">{editingId ? "Cập nhật Danh Mục" : "Thêm Danh Mục Mới"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên danh mục <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent transition-all"
                  placeholder="Nhập tên danh mục..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent transition-all resize-none h-24"
                  placeholder="Mô tả danh mục (tùy chọn)..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-[#2c5243] text-white font-medium hover:bg-[#2c5243]/90 transition-colors disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#A8E6CF] mb-4" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200/80">
                    <th className="px-6 py-4 font-semibold text-sm text-slate-600 w-16">ID</th>
                    <th className="px-6 py-4 font-semibold text-sm text-slate-600">Tên danh mục</th>
                    <th className="px-6 py-4 font-semibold text-sm text-slate-600">Mô tả</th>
                    <th className="px-6 py-4 font-semibold text-sm text-slate-600">Trạng thái</th>
                    <th className="px-6 py-4 font-semibold text-sm text-slate-600 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.length > 0 ? (
                    paginated.map((cat, idx) => (
                      <tr key={cat.id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">{cat.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{cat.name || "—"}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{cat.description || "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            cat.status === "Active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                          }`}>
                            {cat.status === "Active" ? "Hoạt động" : cat.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEditClick(cat)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => cat.id && handleDelete(cat.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        {searchQuery ? `Không tìm thấy danh mục nào với từ khóa "${searchQuery}"` : "Không có dữ liệu"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Trang {currentPage} / {totalPages} &bull; {filteredAndSorted.length} kết quả
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | "...")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span key={i} className="px-2 text-slate-400">…</span>
                      ) : (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(p as number)}
                          className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === p
                              ? "bg-[#2c5243] text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
