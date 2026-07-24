"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Edit2, Trash2, Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { adminAPI } from "@/infrastructure/api/adminAPI";
import { useNotification } from "@/lib/contexts/NotificationContext";

export default function ProductsManagementPage() {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    brand: "",
    description: "",
    slug: "",
    imageUrl: ""
  });

  const fetchProducts = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        adminAPI.getProducts({ pageIndex: 1, pageSize: 200 }),
        adminAPI.getCategories(200),
      ]);
      const items = prodRes.data?.items || prodRes.items || prodRes || [];
      setProducts(Array.isArray(items) ? items : []);
      const cats = catRes.data?.items || catRes.items || catRes || [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err: any) {
      showNotification("error", "Lỗi tải dữ liệu", err.response?.data?.message || "Không thể tải dữ liệu sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // ── Filter & Paginate (client-side) ─────────────────────────────────────────────
  const filtered = useMemo(() =>
    products.filter(p =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [products, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    // Create a local preview URL
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, imageUrl: previewUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.name) return;
    try {
      setIsSubmitting(true);
      const payload = {
        categoryId: parseInt(formData.categoryId),
        name: formData.name,
        brand: formData.brand,
        description: formData.description,
        slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-'),
      };

      let productId = editingId;
      if (editingId) {
        await adminAPI.updateProduct(editingId, payload);
        showNotification("success", "Thành công", "Đã cập nhật sản phẩm.");
      } else {
        const res = await adminAPI.createProduct(payload);
        productId = res.data?.id || res.id || res;
        showNotification("success", "Thành công", "Đã tạo sản phẩm mới.");
      }
      
      // Upload image if a new file was selected
      if (selectedFile && productId) {
        try {
          setIsUploading(true);
          await adminAPI.uploadImage(selectedFile, Number(productId));
          showNotification("success", "Thành công", "Đã lưu hình ảnh sản phẩm.");
        } catch (imgErr) {
          showNotification("error", "Lỗi upload ảnh", "Sản phẩm đã tạo nhưng không thể lưu ảnh.");
        } finally {
          setIsUploading(false);
        }
      }
      
      handleCloseModal();
      fetchProducts();
    } catch (err: any) {
      showNotification("error", "Lỗi", err.response?.data?.message || "Không thể lưu sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = async (product: any) => {
    try {
      setIsLoading(true);
      // Fetch full details before editing
      const res = await adminAPI.getProductById(product.id);
      const p = res.data || res;
      setFormData({
        categoryId: p.categoryId?.toString() || p.category?.id?.toString() || "",
        name: p.name || "",
        brand: p.brand || "",
        description: p.description || "",
        slug: p.slug || "",
        imageUrl: p.imageUrl || ""
      });
      setEditingId(p.id);
      setIsModalOpen(true);
    } catch (err) {
      showNotification("error", "Lỗi", "Không thể lấy thông tin sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setSelectedFile(null);
    setFormData({ categoryId: "", name: "", brand: "", description: "", slug: "", imageUrl: "" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await adminAPI.deleteProduct(id);
      showNotification("success", "Thành công", "Đã xóa sản phẩm.");
      fetchProducts();
    } catch (err: any) {
      showNotification("error", "Lỗi", err.response?.data?.message || "Không thể xóa sản phẩm");
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const blob = await adminAPI.exportProductsExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `products_export_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      showNotification("success", "Thành công", "Đã tải xuống file Excel.");
    } catch (err: any) {
      showNotification("error", "Lỗi xuất file", "Không thể xuất danh sách sản phẩm ra Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Sản phẩm</h1>
          <p className="text-slate-500 mt-1">
            {isLoading ? "Đang tải..." : `Tổng cộng ${filtered.length} / ${products.length} sản phẩm`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Xuất Excel
          </button>
          <button
            onClick={() => { setEditingId(null); setFormData({ categoryId: "", name: "", brand: "", description: "", slug: "", imageUrl: "" }); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo tên, thương hiệu, danh mục..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent transition-all text-sm bg-white"
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl my-8"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">{editingId ? "Cập nhật Sản Phẩm" : "Thêm Sản Phẩm Mới"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hình ảnh sản phẩm</label>
                  <div className="flex items-center gap-4">
                    {formData.imageUrl ? (
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => { setFormData({...formData, imageUrl: ""}); setSelectedFile(null); }} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 shadow-sm hover:bg-white text-rose-500">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 text-slate-400">
                        <Loader2 className={`h-6 w-6 ${isUploading ? 'animate-spin' : 'hidden'}`} />
                        <span className={`text-xs ${isUploading ? 'hidden' : 'block'}`}>No Image</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors"
                      />
                      <p className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG, WEBP. Tối đa 5MB.</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] bg-white"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thương hiệu</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slug (Tùy chọn)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF]"
                    placeholder="Vi-du-slug-san-pham"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] resize-none h-24"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-4 py-2 rounded-xl bg-[#2c5243] text-white font-medium hover:bg-[#2c5243]/90 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {(isSubmitting || isUploading) && <Loader2 className="h-4 w-4 animate-spin" />}
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
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200/80">
                    <th className="px-6 py-4 font-semibold text-sm text-slate-600">Sản phẩm</th>
                    <th className="px-6 py-4 font-semibold text-sm text-slate-600">Thương hiệu</th>
                    <th className="px-6 py-4 font-semibold text-sm text-slate-600">Danh mục</th>
                    <th className="px-6 py-4 font-semibold text-sm text-slate-600">Trạng thái</th>
                    <th className="px-6 py-4 font-semibold text-sm text-slate-600 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.length > 0 ? (
                    paginated.map((prod, idx) => (
                      <tr key={prod.id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                              {prod.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={prod.imageUrl} alt={prod.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-300 text-xs">Img</div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 line-clamp-1">{prod.name}</p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">#{prod.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{prod.brand || "—"}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{prod.categoryName || prod.category?.name || "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            prod.status === "Active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                          }`}>
                            {prod.status === "Active" ? "Hoạt động" : prod.status || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEditClick(prod)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => prod.id && handleDelete(prod.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        {searchQuery ? `Không tìm thấy sản phẩm nào với từ khóa "${searchQuery}"` : "Không có sản phẩm nào"}
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
                  Trang {currentPage} / {totalPages} &bull; {filtered.length} kết quả
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
                            currentPage === p ? "bg-[#2c5243] text-white" : "text-slate-600 hover:bg-slate-100"
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
