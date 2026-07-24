"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { adminAPI } from "@/infrastructure/api/adminAPI";
import { useNotification } from "@/lib/contexts/NotificationContext";

export default function CategoriesManagementPage() {
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: ""
  });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await adminAPI.getCategories();
      const items = res.data?.items || res.items || res || [];
      setCategories(Array.isArray(items) ? items : []);
    } catch (err: any) {
      showNotification("error", "Lỗi tải dữ liệu", err.response?.data?.message || "Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
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
        slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-')
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
      setFormData({
        name: data.name || "",
        description: data.description || "",
        slug: data.slug || ""
      });
      setEditingId(data.id);
      setIsModalOpen(true);
    } catch (err) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Danh mục</h1>
          <p className="text-slate-500 mt-1">Sắp xếp và phân loại sản phẩm</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", description: "", slug: "" });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </button>
      </div>

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
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent transition-all"
                  placeholder="Nhập tên danh mục..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent transition-all resize-none h-24"
                  placeholder="Mô tả danh mục (tùy chọn)..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#2c5243] text-white font-medium hover:bg-[#2c5243]/90 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200/80">
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600">ID</th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600">Tên danh mục</th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.length > 0 ? (
                  categories.map((cat, idx) => (
                    <tr key={cat.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                        {cat.id ? String(cat.id).substring(0, 8) : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {cat.name || "Chưa cập nhật"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleEditClick(cat)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => cat.id && handleDelete(cat.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
