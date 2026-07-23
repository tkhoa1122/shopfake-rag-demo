"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Package
} from "lucide-react";
import { localCartAPI, type LocalCartItem } from "@/infrastructure/api/storefrontAPI";
import { authAPI } from "@/infrastructure/api/authAPI";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function CartPage() {
  const params = useParams();
  const tenantId = params.tenant_id as string;
  const [cartItems, setCartItems] = useState<LocalCartItem[]>([]);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);

  // ── Load giỏ hàng từ localStorage ────────────────────────────────────────
  useEffect(() => {
    if (!authAPI.isLoggedIn()) {
      window.location.href = `/${tenantId}/login`;
      return;
    }
    setCartItems(localCartAPI.getAll());
  }, [tenantId]);

  // ── Cập nhật số lượng ─────────────────────────────────────────────────────
  const handleUpdateQty = (variantId: number, newQty: number) => {
    if (newQty < 1) return;
    localCartAPI.updateQuantity(variantId, newQty);
    setCartItems(localCartAPI.getAll());
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // ── Xóa sản phẩm ─────────────────────────────────────────────────────────
  const handleDelete = (variantId: number) => {
    localCartAPI.remove(variantId);
    setCartItems(localCartAPI.getAll());
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API Call for Checkout
    setTimeout(() => {
      localCartAPI.clear();
      setCartItems([]);
      window.dispatchEvent(new Event("cartUpdated"));
      setIsOrderSuccess(true);
    }, 1000);
  };

  // ── Tổng tiền ─────────────────────────────────────────────────────────────
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isOrderSuccess) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-sm shadow-sm max-w-md w-full text-center">
          <CheckCircle2 className="h-16 w-16 text-[#2c5243] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wider">Đặt hàng thành công!</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Cảm ơn bạn đã mua sắm tại hệ thống của chúng tôi. Đơn hàng của bạn đang được xử lý và sẽ được giao trong thời gian sớm nhất.
          </p>
          <Link
            href={`/${tenantId}`}
            className="inline-block rounded-sm bg-[#2c5243] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#1c362b] uppercase"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-sm shadow-sm">
            <Package className="h-16 w-16 text-gray-300" />
            <h2 className="mt-6 text-xl font-bold text-gray-900 uppercase">Giỏ hàng trống</h2>
            <p className="mt-2 text-sm text-gray-500 mb-8">Hãy thêm sản phẩm vào giỏ để tiếp tục.</p>
            <Link
              href={`/${tenantId}`}
              className="rounded-sm bg-[#2c5243] px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#1c362b] uppercase tracking-wider shadow-sm"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* ── Left Column: Shipping Info (6 cols) ────────────────────── */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 uppercase">Thông tin vận chuyển</h2>
              
              <form id="checkout-form" onSubmit={handleCheckout} className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="fullname" className="text-xs font-bold text-gray-700 uppercase">Họ và tên</label>
                    <input type="text" id="fullname" required className="w-full rounded-sm border border-gray-300 px-4 py-2.5 text-sm focus:border-[#2c5243] focus:outline-none focus:ring-1 focus:ring-[#2c5243] transition-colors" placeholder="Nhập họ và tên của bạn" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-bold text-gray-700 uppercase">Số điện thoại</label>
                    <input type="tel" id="phone" required className="w-full rounded-sm border border-gray-300 px-4 py-2.5 text-sm focus:border-[#2c5243] focus:outline-none focus:ring-1 focus:ring-[#2c5243] transition-colors" placeholder="Nhập số điện thoại" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase">Email</label>
                  <input type="email" id="email" required className="w-full rounded-sm border border-gray-300 px-4 py-2.5 text-sm focus:border-[#2c5243] focus:outline-none focus:ring-1 focus:ring-[#2c5243] transition-colors" placeholder="Nhập email của bạn" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="address" className="text-xs font-bold text-gray-700 uppercase">Địa chỉ cụ thể</label>
                  <input type="text" id="address" required className="w-full rounded-sm border border-gray-300 px-4 py-2.5 text-sm focus:border-[#2c5243] focus:outline-none focus:ring-1 focus:ring-[#2c5243] transition-colors" placeholder="Nhập địa chỉ nhà, tên đường..." />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="note" className="text-xs font-bold text-gray-700 uppercase">Ghi chú đơn hàng (Tùy chọn)</label>
                  <textarea id="note" rows={3} className="w-full rounded-sm border border-gray-300 px-4 py-2.5 text-sm focus:border-[#2c5243] focus:outline-none focus:ring-1 focus:ring-[#2c5243] transition-colors resize-none" placeholder="Ghi chú thêm..."></textarea>
                </div>
              </form>
            </div>

            {/* ── Right Column: Cart Items & Summary (6 cols) ────────────── */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 uppercase">Giỏ hàng</h2>

              <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex flex-col h-full">
                {/* Free ship banner */}
                <div className="bg-[#A8E6CF]/20 rounded-sm p-3 mb-6 border border-[#A8E6CF]/50 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#2c5243] shrink-0" />
                  <p className="text-xs text-[#2c5243] font-medium leading-tight mt-0.5">
                    Yên tâm đổi trả 60 ngày - Freeship cho đơn hàng này.
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-5 flex-1 max-h-100 overflow-y-auto scrollbar-hide pr-2">
                  {cartItems.map((item) => (
                    <div key={item.variantId} className="flex gap-4 items-start border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-gray-100 relative border border-gray-200">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ShoppingCart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-gray-300" />
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between h-24">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
                              {item.productName}
                            </h3>
                            <button
                              onClick={() => handleDelete(item.variantId)}
                              className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 uppercase">{item.variantName}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex h-8 w-24 items-center rounded-sm border border-gray-300 bg-white">
                            <button
                              className="flex h-full w-8 items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                              onClick={() => handleUpdateQty(item.variantId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="flex-1 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              className="flex h-full w-8 items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                              onClick={() => handleUpdateQty(item.variantId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-full h-px bg-gray-200 my-6" />

                {/* Summary */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Phí giao hàng</span>
                    <span className="font-medium text-[#2c5243]">Miễn phí</span>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                    <span className="text-sm font-bold text-gray-900 uppercase">Tổng cộng</span>
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    form="checkout-form"
                    className="mt-6 w-full rounded-sm bg-[#2c5243] py-4 text-sm font-bold text-white hover:bg-[#1c362b] transition-all uppercase tracking-widest shadow-md hover:shadow-lg"
                  >
                    ĐẶT HÀNG
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
