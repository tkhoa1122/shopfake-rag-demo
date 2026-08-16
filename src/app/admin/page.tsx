"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  Loader2,
  Tags,
  AlignLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { adminAPI } from "@/infrastructure/api/adminAPI";
import { orderAPI } from "@/infrastructure/api/storefrontAPI";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const formatRevenueShort = (amount: number) => {
  if (amount >= 1_000_000_000) {
    return `₫${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `₫${(amount / 1_000_000).toFixed(1)}M`;
  }
  return formatPrice(amount);
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:    { label: "Chờ thanh toán", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  paid:       { label: "Đã thanh toán",  className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  processing: { label: "Đang xử lý",     className: "bg-blue-50 text-blue-700 border border-blue-200" },
  shipped:    { label: "Đang giao",       className: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  delivered:  { label: "Đã giao",        className: "bg-teal-50 text-teal-700 border border-teal-200" },
  cancelled:  { label: "Đã hủy",         className: "bg-rose-50 text-rose-700 border border-rose-200" },
};

function StatusBadge({ status }: { status: string }) {
  const norm = (status || "pending").toLowerCase();
  const cfg = STATUS_CONFIG[norm] || {
    label: status,
    className: "bg-slate-100 text-slate-700 border border-slate-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export default function AdminDashboardOverview() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalCategories, setTotalCategories] = useState<number | null>(null);
  const [totalVariants, setTotalVariants] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [pendingOrders, setPendingOrders] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const [accRes, prodRes, catRes, varRes, orderRes] = await Promise.allSettled([
        adminAPI.getAccounts(1, 200),
        adminAPI.getProducts({ pageIndex: 1, pageSize: 200 }),
        adminAPI.getCategories(200),
        adminAPI.getVariants({ pageIndex: 1, pageSize: 200 }),
        orderAPI.getAll({ pageNumber: 1, pageSize: 200 }),
      ]);

      // 1. Accounts count
      if (accRes.status === "fulfilled") {
        const res = accRes.value;
        const items = res.data?.items || res.items || (Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
        const count = res.data?.totalCount ?? res.totalCount ?? items.length;
        setTotalUsers(count);
      } else {
        setTotalUsers(0);
      }

      // 2. Products count
      if (prodRes.status === "fulfilled") {
        const res = prodRes.value;
        const items = res.data?.items || res.items || (Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
        const count = res.data?.totalCount ?? res.totalCount ?? items.length;
        setTotalProducts(count);
      } else {
        setTotalProducts(0);
      }

      // 3. Categories count
      if (catRes.status === "fulfilled") {
        const res = catRes.value;
        const items = res.data?.items || res.items || (Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
        const count = res.data?.totalCount ?? res.totalCount ?? items.length;
        setTotalCategories(count);
      } else {
        setTotalCategories(0);
      }

      // 4. Variants count
      if (varRes.status === "fulfilled") {
        const res = varRes.value;
        const items = res.data?.items || res.items || (Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
        const count = res.data?.totalCount ?? res.totalCount ?? items.length;
        setTotalVariants(count);
      } else {
        setTotalVariants(0);
      }

      // 5. Orders & Revenue
      if (orderRes.status === "fulfilled") {
        const res = orderRes.value;
        const raw = res?.data || res;
        const ordersList = raw?.items || raw?.data?.items || (Array.isArray(raw) ? raw : []);
        const orderCount = raw?.totalCount ?? raw?.data?.totalCount ?? ordersList.length;

        setTotalOrders(orderCount);
        setRecentOrders(ordersList.slice(0, 5));

        // Tính doanh thu các đơn đã thanh toán (Paid)
        let revenue = 0;
        let pendingCount = 0;

        ordersList.forEach((order: any) => {
          const status = (order.paymentStatus || order.status || "").toLowerCase();
          const items = order.orderItems || order.items || [];
          const orderTotal =
            order.totalAmount && order.totalAmount > 0
              ? order.totalAmount
              : items.reduce(
                  (sum: number, it: any) =>
                    sum + (it.unitPrice ?? it.price ?? 0) * (it.quantity ?? 1),
                  0
                );

          if (status === "paid" || status === "completed" || status === "delivered") {
            revenue += orderTotal;
          } else if (status === "pending") {
            pendingCount++;
          }
        });

        setTotalRevenue(revenue);
        setPendingOrders(pendingCount);
      } else {
        setTotalOrders(0);
        setTotalRevenue(0);
        setRecentOrders([]);
      }
    } catch (err) {
      console.error("Lỗi lấy thống kê admin:", err);
      setTotalUsers(0);
      setTotalProducts(0);
      setTotalOrders(0);
      setTotalRevenue(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const stats = [
    {
      label: "Tổng người dùng",
      value: totalUsers !== null ? totalUsers.toString() : "...",
      subText: "Tài khoản khách hàng & quản trị",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Sản phẩm",
      value: totalProducts !== null ? totalProducts.toString() : "...",
      subText: `${totalVariants ?? 0} biến thể • ${totalCategories ?? 0} danh mục`,
      icon: Package,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Tổng đơn hàng",
      value: totalOrders !== null ? totalOrders.toString() : "...",
      subText: pendingOrders > 0 ? `${pendingOrders} đơn chờ thanh toán` : "Đã cập nhật",
      icon: ShoppingCart,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Doanh thu thực tế",
      value: totalRevenue !== null ? formatRevenueShort(totalRevenue) : "...",
      subText: totalRevenue !== null ? formatPrice(totalRevenue) : "0 ₫",
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng quan</h1>
          <p className="text-slate-500 mt-1">Chào mừng bạn trở lại, đây là thống kê thực tế của hệ thống.</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-[#2c5243]" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col justify-between group hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">
                  {isLoading && s.value === "..." ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400 my-1" />
                  ) : (
                    s.value
                  )}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 truncate font-medium">{s.subText}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Recent Orders & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent Orders (2 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Đơn hàng gần đây</h3>
                <p className="text-xs text-slate-500 mt-0.5">Danh sách các đơn hàng mới nhất trên hệ thống</p>
              </div>
              <Link
                href="/orders"
                className="text-xs font-semibold text-[#2c5243] hover:underline flex items-center gap-1"
              >
                Xem tất cả đơn
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-[#2c5243]" />
                <p className="text-xs text-slate-400">Đang tải đơn hàng...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Chưa có đơn hàng nào được ghi nhận.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                      <th className="pb-3">Mã đơn</th>
                      <th className="pb-3">Khách hàng</th>
                      <th className="pb-3">Tổng tiền</th>
                      <th className="pb-3">Trạng thái</th>
                      <th className="pb-3">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentOrders.map((order: any) => {
                      const orderCode = order.paymentCode || order.orderCode || `#${order.id}`;
                      const items = order.orderItems || order.items || [];
                      const total =
                        order.totalAmount && order.totalAmount > 0
                          ? order.totalAmount
                          : items.reduce(
                              (sum: number, it: any) =>
                                sum + (it.unitPrice ?? it.price ?? 0) * (it.quantity ?? 1),
                              0
                            );
                      const status = order.paymentStatus || order.status || "Pending";

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 font-mono text-xs font-bold text-slate-800">{orderCode}</td>
                          <td className="py-3.5">
                            <p className="font-medium text-slate-900 text-sm">{order.receiverName || "Khách hàng"}</p>
                            <p className="text-xs text-slate-400">{order.receiverPhone || "—"}</p>
                          </td>
                          <td className="py-3.5 font-bold text-slate-900 text-sm">{formatPrice(total)}</td>
                          <td className="py-3.5">
                            <StatusBadge status={status} />
                          </td>
                          <td className="py-3.5 text-xs text-slate-400">
                            {order.createdAt ? formatDate(order.createdAt) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Access (1 col) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6"
        >
          <div className="mb-5">
            <h3 className="font-bold text-slate-900 text-base">Truy cập nhanh</h3>
            <p className="text-xs text-slate-500 mt-0.5">Điều hướng nhanh tới các phân hệ quản lý</p>
          </div>
          <div className="space-y-3">
            <Link
              href="/admin/products"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-medium text-slate-800 text-sm block">Quản lý Sản phẩm</span>
                  <span className="text-xs text-slate-400">{totalProducts ?? 0} sản phẩm</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/admin/variants"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600">
                  <Tags className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-medium text-slate-800 text-sm block">Biến thể & Thuộc tính</span>
                  <span className="text-xs text-slate-400">{totalVariants ?? 0} biến thể</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-amber-600">
                  <AlignLeft className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-medium text-slate-800 text-sm block">Quản lý Danh mục</span>
                  <span className="text-xs text-slate-400">{totalCategories ?? 0} danh mục</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/admin/accounts"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-medium text-slate-800 text-sm block">Quản lý Tài khoản</span>
                  <span className="text-xs text-slate-400">{totalUsers ?? 0} người dùng</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
