"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Users, Settings, Package, LayoutDashboard, Tags, AlignLeft, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/application/hooks/reduxHooks";
import { clearUser } from "@/application/slices/userSlice";
import { UserRole } from "@/domain/entities/User";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/accounts", label: "Tài khoản", icon: Users },
  { href: "/admin/categories", label: "Danh mục", icon: AlignLeft },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/variants", label: "Biến thể & Thuộc tính", icon: Tags },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Check auth client-side
    if (isMounted) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== UserRole.SYSTEM_ADMIN) {
        router.replace("/");
      }
    }
  }, [user, router, isMounted]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    document.cookie = "auth_token=; path=/; max-age=0";
    dispatch(clearUser());
    router.push("/login");
  };

  // Prevent flash of content before redirect
  if (!isMounted || !user || user.role !== UserRole.SYSTEM_ADMIN) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 text-white mb-10 px-2">
        <div className="bg-[#A8E6CF] p-2 rounded-xl text-slate-900 shadow-lg shadow-[#A8E6CF]/20">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <h1 className="font-bold text-xl tracking-tight">Shopfake<span className="text-[#A8E6CF]">Admin</span></h1>
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                isActive 
                  ? "bg-[#A8E6CF] text-slate-900 shadow-md shadow-[#A8E6CF]/10" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-slate-900" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800/50">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-400/10 rounded-xl font-medium transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans text-slate-900">
      
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        className="hidden lg:flex w-[260px] bg-slate-950 text-slate-300 p-6 flex-col fixed inset-y-0 left-0 z-50 border-r border-slate-900"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-[260px] bg-slate-950 text-slate-300 p-6 flex flex-col z-50 shadow-2xl lg:hidden"
            >
              <div className="absolute top-4 right-4 lg:hidden">
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-[260px] flex flex-col min-h-screen">
        
        {/* Topbar (Mobile) */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="bg-[#A8E6CF] p-1.5 rounded-lg text-slate-900">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg">Shopfake</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
