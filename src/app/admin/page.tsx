"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Package, ShoppingCart, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardOverview() {
  const stats = [
    { label: "Tổng người dùng", value: "1,234", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Sản phẩm", value: "856", icon: Package, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Đơn hàng mới", value: "42", icon: ShoppingCart, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Doanh thu (Tháng)", value: "₫145.5M", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng quan</h1>
        <p className="text-slate-500 mt-1">Chào mừng bạn trở lại, đây là thống kê tổng quát của hệ thống.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-start justify-between group hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{s.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
              <s.icon className="h-6 w-6" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Truy cập nhanh</h3>
          </div>
          <div className="space-y-3">
            <Link href="/admin/products" className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600"><Package className="h-5 w-5" /></div>
                <span className="font-medium text-slate-700">Quản lý Sản phẩm</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link href="/admin/accounts" className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600"><Users className="h-5 w-5" /></div>
                <span className="font-medium text-slate-700">Quản lý Tài khoản</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
