"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Users, Settings, Package, LayoutDashboard, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/application/hooks/reduxHooks";
import { clearUser } from "@/application/slices/userSlice";
import { UserRole } from "@/domain/entities/User";
import { axiosClient } from "@/infrastructure/api/axiosClient";
import { useNotification } from "@/lib/contexts/NotificationContext";

export default function AdminDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const { showNotification } = useNotification();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN) {
      router.replace("/");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoading(true);
        const res = await axiosClient.get("/accounts", { params: { pageSize: 50 } });
        // The API returns a paginated list: { data: { items: [...] } } or { items: [...] }
        const items = res.data?.data?.items || res.data?.items || res.data || [];
        setAccounts(Array.isArray(items) ? items : []);
      } catch (err: any) {
        showNotification("error", "Lỗi tải dữ liệu", err.response?.data?.message || "Không thể tải danh sách tài khoản");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === UserRole.ADMIN) {
      fetchAccounts();
    }
  }, [user, showNotification]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    document.cookie = "auth_token=; path=/; max-age=0";
    dispatch(clearUser());
    router.push("/login");
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-slate-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-slate-900 text-slate-300 p-6 flex flex-col hidden lg:flex"
      >
        <div className="flex items-center gap-3 text-white mb-10">
          <div className="bg-[#A8E6CF] p-2 rounded-xl text-slate-900">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Shopfake<span className="text-[#A8E6CF]">Admin</span></h1>
        </div>

        <nav className="flex-1 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-medium transition-colors">
            <Users className="h-5 w-5" />
            Tài khoản
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl font-medium transition-colors">
            <Package className="h-5 w-5" />
            Sản phẩm
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl font-medium transition-colors">
            <Settings className="h-5 w-5" />
            Cài đặt
          </a>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-400/10 rounded-xl font-medium transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Quản lý Tài khoản</h2>
            <p className="text-slate-500 mt-1">Danh sách người dùng hệ thống</p>
          </div>
          
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-lg border shadow-sm transition-all hover:shadow"
          >
            <ArrowLeft className="h-4 w-4" />
            Về trang mua sắm
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
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
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 font-semibold text-sm text-slate-600">ID</th>
                    <th className="px-6 py-4 font-semibold text-sm text-slate-600">Tên</th>
                    <th className="px-6 py-4 font-semibold text-sm text-slate-600">Email</th>
                    <th className="px-6 py-4 font-semibold text-sm text-slate-600">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.length > 0 ? (
                    accounts.map((acc, idx) => (
                      <tr key={acc.id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                          {acc.id?.substring(0, 8) || "N/A"}...
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {acc.fullName || acc.name || "Chưa cập nhật"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {acc.email || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            Hoạt động
                          </span>
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
      </main>
    </div>
  );
}
