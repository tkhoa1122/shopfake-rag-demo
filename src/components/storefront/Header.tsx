"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingBag, Menu, User, LogOut, UserCircle, ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/application/hooks/reduxHooks";
import { logout } from "@/application/slices/userSlice";
import { authAPI } from "@/infrastructure/api/authAPI";
import { localCartAPI } from "@/infrastructure/api/storefrontAPI";

export function Header() {
  const params = useParams();
  const tenantId = params.tenant_id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // ── Đọc trạng thái đăng nhập từ Redux Store (reactive, không cần F5) ──
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const user = useAppSelector((state) => state.user.user);

  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setCartCount(localCartAPI.getTotalCount());
    const handleCartUpdate = () => setCartCount(localCartAPI.getTotalCount());
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${tenantId}?q=${encodeURIComponent(searchQuery.trim())}#products`);
    } else {
      router.push(`/${tenantId}#products`);
    }
  };

  const handleLogout = () => {
    // Xóa token khỏi localStorage/cookie
    authAPI.logout();
    // Xóa state trong Redux (reactive toàn bộ app)
    dispatch(logout());
    router.push(`/${tenantId}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-gray-500 hover:text-gray-900 transition-colors">
            <Menu className="h-6 w-6" />
          </button>
          <Link href={`/${tenantId}`} className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2c5243] text-[#A8E6CF] transition-transform group-hover:scale-105">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#2c5243] capitalize hidden sm:block">
              {tenantId.replace(/-/g, " ")}
            </span>
          </Link>

          <nav className="hidden lg:ml-10 lg:flex lg:gap-8">
            <Link href={`/${tenantId}#products`} className="text-sm font-semibold text-gray-900 hover:text-[#2c5243] transition-colors">
              MỚI NHẤT
            </Link>
            <Link href={`/${tenantId}#products`} className="text-sm font-semibold text-gray-500 hover:text-[#2c5243] transition-colors">
              SẢN PHẨM
            </Link>
            <Link href={`/${tenantId}#products`} className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">
              SALE
            </Link>
          </nav>
        </div>

        {/* Right: Search, User, Cart */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 rounded-full border border-gray-200 bg-gray-50 py-2 pl-4 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2c5243] focus:outline-none focus:ring-1 focus:ring-[#2c5243] transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2c5243]">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* User & Auth */}
          {isAuthenticated ? (
            <UserDropdown
              tenantId={tenantId}
              displayName={user?.name || user?.email || "Tài khoản"}
              onLogout={handleLogout}
            />
          ) : (
            <Link
              href={`/${tenantId}/login`}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-[#2c5243] hover:text-[#2c5243] transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
          )}

          {/* Cart Icon */}
          <Link
            href={`/${tenantId}/cart`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Giỏ hàng"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── User Dropdown ────────────────────────────────────────────────────────────

interface UserDropdownProps {
  tenantId: string;
  displayName: string;
  onLogout: () => void;
}

function UserDropdown({ tenantId, displayName, onLogout }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      {/* Trigger button */}
      <button
        id="user-menu-button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-full bg-[#2c5243]/10 py-1.5 pl-2 pr-3 text-sm font-medium text-[#2c5243] transition-all hover:bg-[#2c5243]/20 focus:outline-none focus:ring-2 focus:ring-[#2c5243]/30"
      >
        {/* Avatar vòng tròn chữ cái đầu */}
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2c5243] text-[10px] font-bold text-white uppercase shrink-0">
          {displayName.charAt(0)}
        </span>
        <span className="max-w-18 truncate hidden sm:inline">{displayName}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="menu"
          aria-labelledby="user-menu-button"
          className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 overflow-hidden"
        >
          {/* User info header */}
          <div className="bg-[#2c5243]/5 px-4 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-500">Đã đăng nhập</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-[#2c5243]">{displayName}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href={`/${tenantId}/login`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#2c5243]/5 hover:text-[#2c5243] transition-colors"
            >
              <UserCircle className="h-4 w-4 shrink-0" />
              Hồ sơ của tôi
            </Link>

            <div className="mx-3 my-1 border-t border-gray-100" />

            <button
              role="menuitem"
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
