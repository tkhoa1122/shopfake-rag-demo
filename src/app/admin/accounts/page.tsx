"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { adminAPI } from "@/infrastructure/api/adminAPI";
import { useNotification } from "@/lib/contexts/NotificationContext";
import { UserRole } from "@/domain/entities/User";

export default function AccountsManagementPage() {
  const { showNotification } = useNotification();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const res = await adminAPI.getAccounts();
      setAccounts(res.data?.items || res.items || res || []);
    } catch (err: any) {
      showNotification("error", "Lỗi", "Không thể tải danh sách tài khoản");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ fullName: "", email: "", password: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;
    try {
      setIsSubmitting(true);
      await adminAPI.createAccount(formData);
      showNotification("success", "Thành công", "Đã tạo tài khoản mới.");
      handleCloseModal();
      fetchAccounts();
    } catch (err: any) {
      showNotification("error", "Lỗi", err.response?.data?.message || "Không thể lưu thông tin tài khoản");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) return;
    try {
      await adminAPI.deleteAccount(id);
      showNotification("success", "Đã xóa", "Tài khoản đã được xóa thành công.");
      fetchAccounts();
    } catch (err: any) {
      showNotification("error", "Lỗi", err.response?.data?.message || "Không thể xóa tài khoản");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Tài khoản</h1>
          <p className="text-slate-500 mt-1">Danh sách người dùng hệ thống</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ fullName: "", email: "", password: "" });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Thêm tài khoản
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Thêm Tài Khoản Mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                <input 
                  type="text" 
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#A8E6CF]" 
                  placeholder="Nhập họ và tên..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#A8E6CF]" 
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#A8E6CF]" 
                  placeholder="Nhập mật khẩu..."
                />
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
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#2c5243] text-white font-medium hover:bg-[#2c5243]/90 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? "Đang xử lý..." : "Tạo mới"}
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
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600">Họ tên</th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600">Email</th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600">Vai trò</th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.length > 0 ? (
                  accounts.map((acc, idx) => (
                    <tr key={acc.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {acc.fullName || acc.name || "Chưa cập nhật"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {acc.email || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {acc.role === UserRole.SYSTEM_ADMIN ? "Admin" : "Khách hàng"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleDelete(acc.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
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
