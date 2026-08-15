"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Download, Tags, Trash2, Edit2, Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { adminAPI } from "@/infrastructure/api/adminAPI";
import { useNotification } from "@/lib/contexts/NotificationContext";

export default function VariantsManagementPage() {
  const { showNotification } = useNotification();
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data state
  const [attributes, setAttributes] = useState<any[]>([]);
  const [attributeValues, setAttributeValues] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Search & Paginate states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modal states
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form states
  const [attrForm, setAttrForm] = useState({ name: "", code: "" });
  const [valueForm, setValueForm] = useState({ attributeId: "", valueName: "", valueCode: "" });
  const [variantForm, setVariantForm] = useState<{ productId: string, variantName: string, price: string, stockQuantity: string, sku: string, weightGrams: string, imageUrl: string, valueIds: number[] }>({ productId: "", variantName: "", price: "", stockQuantity: "", sku: "", weightGrams: "", imageUrl: "", valueIds: [] });
  
  // Product Search state for Custom Dropdown
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  
  const filteredProductsForSelect = React.useMemo(() => {
    if (!productSearchQuery) return products;
    return products.filter(p => p.name?.toLowerCase().includes(productSearchQuery.toLowerCase()));
  }, [products, productSearchQuery]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [attrRes, valRes, varRes, prodRes] = await Promise.all([
        adminAPI.getAttributes({ pageSize: 500 }),
        adminAPI.getAttributeValues({ pageSize: 500 }),
        adminAPI.getVariants({ pageSize: 500 }), // Get up to 500 for client-side pagination
        adminAPI.getProducts({ pageSize: 500 })
      ]);
      const attrs = attrRes.data?.items || attrRes.items || attrRes || [];
      setAttributes(Array.isArray(attrs) ? attrs : []);
      
      const vals = valRes.data?.items || valRes.items || valRes || [];
      setAttributeValues(Array.isArray(vals) ? vals : []);
      
      setVariants(varRes.data?.items || varRes.items || varRes || []);
      setProducts(prodRes.data?.items || prodRes.items || prodRes || []);
    } catch (err: any) {
      showNotification("error", "Lỗi", "Không thể tải dữ liệu thuộc tính/biến thể");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Filter & Paginate ─────────────────────────────────────────────
  const filteredVariants = React.useMemo(() => {
    return variants.filter(v => {
      const q = searchQuery.toLowerCase();
      return (
        v.variantName?.toLowerCase().includes(q) ||
        v.name?.toLowerCase().includes(q) ||
        v.sku?.toLowerCase().includes(q) ||
        v.product?.name?.toLowerCase().includes(q)
      );
    });
  }, [variants, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredVariants.length / PAGE_SIZE));
  const paginatedVariants = filteredVariants.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const handleCreateAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrForm.name || !attrForm.code) return;
    try {
      setIsSubmitting(true);
      await adminAPI.createAttribute(attrForm);
      showNotification("success", "Thành công", "Đã tạo Thuộc tính mới.");
      setIsAttrModalOpen(false);
      setAttrForm({ name: "", code: "" });
      fetchData();
    } catch (err: any) {
      showNotification("error", "Lỗi", err.response?.data?.message || "Không thể tạo thuộc tính");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valueForm.attributeId || !valueForm.valueName) return;
    try {
      setIsSubmitting(true);
      await adminAPI.createAttributeValue({
        attributeId: parseInt(valueForm.attributeId),
        valueText: valueForm.valueName,
        slug: valueForm.valueName.toLowerCase().replace(/ /g, '-'),
      });
      showNotification("success", "Thành công", "Đã thêm Giá trị.");
      setIsValueModalOpen(false);
      setValueForm({ attributeId: "", valueName: "", valueCode: "" });
      fetchData();
    } catch (err: any) {
      showNotification("error", "Lỗi", err.response?.data?.message || "Không thể tạo giá trị");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setVariantForm(prev => ({ ...prev, imageUrl: previewUrl }));
  };

  const toggleValueId = (id: number) => {
    setVariantForm(prev => ({
      ...prev,
      valueIds: prev.valueIds.includes(id)
        ? prev.valueIds.filter(v => v !== id)
        : [...prev.valueIds, id]
    }));
  };

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantForm.productId || !variantForm.variantName) return;
    try {
      setIsSubmitting(true);
      const createPayload = {
        productId: parseInt(variantForm.productId),
        variantName: variantForm.variantName,
        price: parseFloat(variantForm.price) || 0,
        stockQuantity: parseInt(variantForm.stockQuantity) || 0,
        sku: variantForm.sku,
        weightGrams: parseInt(variantForm.weightGrams) || 0
      };

      const updatePayload = {
        variantName: variantForm.variantName,
        price: parseFloat(variantForm.price) || 0,
        stockQuantity: parseInt(variantForm.stockQuantity) || 0,
        sku: variantForm.sku,
        weightGrams: parseInt(variantForm.weightGrams) || 0
      };

      let variantId = editingVariantId;
      let hasUpdateError = false;
      let updateErrMsg = "";

      if (editingVariantId) {
        try {
          await adminAPI.updateVariant(editingVariantId, updatePayload);
          showNotification("success", "Thành công", "Đã cập nhật thông tin biến thể.");
        } catch (err: any) {
          hasUpdateError = true;
          updateErrMsg = err.response?.data?.message || err.message || "Lỗi Server 500";
          console.warn("Lỗi khi updateVariant (Backend Bug):", err.message);
        }
      } else {
        const res = await adminAPI.createVariant(createPayload, variantForm.valueIds);
        variantId = res.data?.id || res.id || res;
        showNotification("success", "Thành công", "Đã tạo biến thể mới.");
      }

      // Upload image if selected
      if (selectedFile && variantId) {
        try {
          setIsUploading(true);
          await adminAPI.uploadImage(selectedFile, parseInt(variantForm.productId), Number(variantId));
          showNotification("success", "Thành công", "Đã lưu hình ảnh biến thể.");
        } catch (imgErr) {
          showNotification("error", "Lỗi upload ảnh", "Không thể lưu hình ảnh.");
        } finally {
          setIsUploading(false);
        }
      }

      if (hasUpdateError && !selectedFile) {
        // Chỉ hiện lỗi update nếu không có upload ảnh (hoặc hiện cả hai)
        showNotification("error", "Lỗi Cập nhật (Backend)", "Server từ chối cập nhật thông tin chữ: " + updateErrMsg);
      } else if (hasUpdateError && selectedFile) {
        showNotification("warning", "Thành công một phần", "Đã lưu ảnh, nhưng Server bị lỗi khi cập nhật thông tin chữ (Backend Error 500).");
      }

      handleCloseVariantModal();
      fetchData();
    } catch (err: any) {
      console.error("Variant submit error:", err);
      showNotification("error", "Lỗi", err.response?.data?.message || "Không thể lưu biến thể");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditVariantClick = async (variant: any) => {
    try {
      setIsLoading(true);
      const v = variant;
      setVariantForm({
        productId: v.productId?.toString() || v.product?.id?.toString() || "",
        variantName: v.variantName || v.name || "",
        price: v.price?.toString() || "0",
        stockQuantity: v.stockQuantity?.toString() || "0",
        sku: v.sku || "",
        weightGrams: v.weightGrams?.toString() || "0",
        imageUrl: v.imageUrl || "",
        valueIds: v.variantAttributeValues?.map((x: any) => x.attributeValueId) || []
      });
      setEditingVariantId(v.id);
      setIsVariantModalOpen(true);
    } catch (err) {
      showNotification("error", "Lỗi", "Không thể lấy thông tin biến thể");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseVariantModal = () => {
    setIsVariantModalOpen(false);
    setEditingVariantId(null);
    setSelectedFile(null);
    setIsProductDropdownOpen(false);
    setProductSearchQuery("");
    setVariantForm({ productId: "", variantName: "", price: "", stockQuantity: "", sku: "", weightGrams: "", imageUrl: "", valueIds: [] });
  };

  const handleDeleteVariant = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa biến thể này?")) return;
    try {
      await adminAPI.deleteVariant(id);
      showNotification("success", "Thành công", "Đã xóa biến thể.");
      fetchData();
    } catch (err: any) {
      showNotification("error", "Lỗi", "Không thể xóa biến thể");
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const blob = await adminAPI.exportVariants();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `variants_export_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      showNotification("success", "Thành công", "Đã tải xuống file Excel Biến thể.");
    } catch (err: any) {
      showNotification("error", "Lỗi xuất file", "Không thể xuất danh sách biến thể ra Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#A8E6CF] mb-4" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thuộc tính & Biến thể</h1>
          <p className="text-slate-500 mt-1">Quản lý kích cỡ, màu sắc, phân loại sản phẩm</p>
          <div className="flex items-center justify-between mb-4 mt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Danh sách Biến thể Sản phẩm
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setEditingVariantId(null);
                  setSelectedFile(null);
                  setVariantForm({ productId: "", variantName: "", price: "", stockQuantity: "", sku: "", weightGrams: "", imageUrl: "", valueIds: [] });
                  setIsVariantModalOpen(true);
                }}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Thêm Biến thể
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Tags className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Thuộc tính & Giá trị</h2>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAttrModalOpen(true)}
                className="text-sm bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 font-medium"
              >
                + Thuộc tính
              </button>
              <button 
                onClick={() => setIsValueModalOpen(true)}
                className="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 font-medium"
              >
                + Giá trị
              </button>
            </div>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
            {attributes.length > 0 ? attributes.map(attr => (
              <div key={attr.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-slate-900">{attr.name} <span className="text-xs text-slate-400 font-normal">({attr.code})</span></h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {attributeValues.filter(v => v.attributeId === attr.id || v.attribute?.id === attr.id).length > 0 ? (
                    attributeValues.filter(v => v.attributeId === attr.id || v.attribute?.id === attr.id).map(val => (
                      <span key={val.id} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-sm">
                        {val.valueText || val.value || "N/A"}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Chưa có giá trị</span>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                Chưa có thuộc tính nào
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex flex-col h-full"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Tags className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Danh sách Biến thể</h2>
            </div>
            
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm tên, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            {paginatedVariants.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="pb-3 font-medium">Tên biến thể</th>
                    <th className="pb-3 font-medium">Sản phẩm</th>
                    <th className="pb-3 font-medium">Giá / Kho</th>
                    <th className="pb-3 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedVariants.map(vari => (
                    <tr key={vari.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-medium text-slate-900">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium text-slate-900 line-clamp-1">{vari.variantName || vari.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{vari.id ? String(vari.id).substring(0, 8) : "N/A"}</p>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600">{vari.product?.name || vari.productId}</td>
                      <td className="py-3 text-slate-600">
                        <div>{vari.price?.toLocaleString()} ₫</div>
                        <div className="text-xs text-slate-400">Kho: {vari.stockQuantity}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditVariantClick(vari)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => vari.id && handleDeleteVariant(vari.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                Chưa có biến thể nào
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Hiển thị trang {currentPage} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* --- MODALS --- */}
      {isAttrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Thêm Thuộc tính</h2>
            <form onSubmit={handleCreateAttribute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên thuộc tính (VD: Kích cỡ)</label>
                <input required type="text" value={attrForm.name} onChange={e => setAttrForm({...attrForm, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#A8E6CF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã Code (VD: SIZE)</label>
                <input required type="text" value={attrForm.code} onChange={e => setAttrForm({...attrForm, code: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#A8E6CF]" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAttrModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800">Tạo mới</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isValueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Thêm Giá trị thuộc tính</h2>
            <form onSubmit={handleCreateValue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Thuộc tính</label>
                <select required value={valueForm.attributeId} onChange={e => setValueForm({...valueForm, attributeId: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-200">
                  <option value="">Chọn thuộc tính</option>
                  {attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giá trị (VD: XL, Đỏ)</label>
                <input required type="text" value={valueForm.valueName} onChange={e => setValueForm({...valueForm, valueName: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-200" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsValueModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700">Tạo mới</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isVariantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">{editingVariantId ? "Cập nhật Biến Thể" : "Thêm Biến Thể Mới"}</h2>
            <form onSubmit={handleVariantSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hình ảnh biến thể</label>
                  <div className="flex items-center gap-4">
                    {variantForm.imageUrl ? (
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={variantForm.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => { setVariantForm({...variantForm, imageUrl: ""}); setSelectedFile(null); }} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 shadow-sm hover:bg-white text-rose-500">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 text-slate-400">
                        <span className={`text-xs ${isUploading ? 'hidden' : 'block'}`}>No Image</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
                      />
                      <p className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG, WEBP. Tối đa 5MB.</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sản phẩm gốc</label>
                  <div 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white cursor-pointer flex justify-between items-center hover:border-slate-300 transition-colors"
                    onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                  >
                    <span className={`truncate ${variantForm.productId ? 'text-slate-900' : 'text-slate-400'}`}>
                      {products.find(p => p.id?.toString() === variantForm.productId)?.name || "Chọn sản phẩm..."}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isProductDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {isProductDropdownOpen && (
                    <div className="absolute z-[60] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-2 top-2 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Tìm tên sản phẩm..." 
                            value={productSearchQuery}
                            onChange={e => setProductSearchQuery(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto p-1">
                        {filteredProductsForSelect.length > 0 ? filteredProductsForSelect.map(p => (
                          <div 
                            key={p.id} 
                            className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${variantForm.productId === p.id?.toString() ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'}`}
                            onClick={() => {
                              setVariantForm({...variantForm, productId: p.id?.toString()});
                              setIsProductDropdownOpen(false);
                              setProductSearchQuery("");
                            }}
                          >
                            {p.name}
                          </div>
                        )) : (
                          <div className="px-3 py-4 text-sm text-slate-400 text-center">Không tìm thấy sản phẩm</div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Ẩn select gốc đi, nhưng vẫn dùng để validate form require */}
                  <select required value={variantForm.productId} onChange={() => {}} className="sr-only">
                    <option value="">Chọn sản phẩm</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Đặc tính (Màu sắc, Kích cỡ...)</label>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                    {attributes.length > 0 ? attributes.map(attr => (
                      <div key={attr.id}>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{attr.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {attributeValues.filter(v => v.attributeId === attr.id || v.attribute?.id === attr.id).length > 0 ? (
                            attributeValues.filter(v => v.attributeId === attr.id || v.attribute?.id === attr.id).map(val => {
                              const isSelected = variantForm.valueIds.includes(val.id);
                              return (
                                <button
                                  type="button"
                                  key={val.id}
                                  onClick={() => toggleValueId(val.id)}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${isSelected ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'}`}
                                >
                                  {val.valueText}
                                </button>
                              );
                            })
                          ) : (
                            <span className="text-xs text-slate-400">Không có giá trị nào</span>
                          )}
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500">Chưa có thuộc tính nào trong hệ thống.</p>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên biến thể (VD: Giày Đỏ - Size 40)</label>
                  <input required type="text" value={variantForm.variantName} onChange={e => setVariantForm({...variantForm, variantName: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá bán</label>
                  <input required type="number" value={variantForm.price} onChange={e => setVariantForm({...variantForm, price: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng kho</label>
                  <input required type="number" value={variantForm.stockQuantity} onChange={e => setVariantForm({...variantForm, stockQuantity: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã SKU</label>
                  <input type="text" value={variantForm.sku} onChange={e => setVariantForm({...variantForm, sku: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Trọng lượng (gram)</label>
                  <input type="number" value={variantForm.weightGrams} onChange={e => setVariantForm({...variantForm, weightGrams: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseVariantModal}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-4 py-2 rounded-xl bg-[#2c5243] text-white font-medium hover:bg-[#2c5243]/90 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {(isSubmitting || isUploading) ? "Đang xử lý..." : editingVariantId ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
