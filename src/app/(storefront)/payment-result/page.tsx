"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Package,
  RefreshCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { orderAPI } from "@/infrastructure/api/storefrontAPI";
import { authAPI } from "@/infrastructure/api/authAPI";

/**
 * PayOS redirect về đây với các query params:
 * ?code=00&id=...&cancel=true/false&status=PAID|CANCELLED&orderCode=...
 *
 * SECURITY: Không tin query string từ trình duyệt để xác nhận thanh toán.
 * Thay vào đó, nếu user đã đăng nhập, gọi GET /orders để lấy trạng thái
 * thật từ database (được backend cập nhật qua PayOS webhook).
 */

type VerifiedStatus = "PAID" | "CANCELLED" | "PENDING" | "LOADING" | "UNAUTHENTICATED";

function PaymentResultContent() {
  const searchParams = useSearchParams();

  // Params từ PayOS (chỉ dùng để fallback UI, không dùng làm bằng chứng thanh toán)
  const urlStatus  = searchParams.get("status");
  const urlCancel  = searchParams.get("cancel");
  const urlOrderCode = searchParams.get("orderCode");

  const [verifiedStatus, setVerifiedStatus] = useState<VerifiedStatus>("LOADING");
  const [verifiedOrderId, setVerifiedOrderId] = useState<number | null>(null);

  useEffect(() => {
    const verify = async () => {
      // Nếu chưa đăng nhập, không thể gọi API — fallback về URL params
      if (!authAPI.isLoggedIn()) {
        setVerifiedStatus("UNAUTHENTICATED");
        return;
      }

      try {
        // Gọi GET /orders để lấy trạng thái thật từ backend
        const res = await orderAPI.getAll({ pageNumber: 1, pageSize: 20 });
        const items: any[] = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);

        // Tìm đơn hàng mới nhất (backend sort mới nhất trước)
        // Nếu có orderCode, cố gắng match — nếu không match được thì dùng đơn đầu tiên
        let matched = items[0] || null;
        if (urlOrderCode && items.length > 0) {
          const byCode = items.find(
            (o) => String(o.orderCode) === urlOrderCode || String(o.id) === urlOrderCode
          );
          if (byCode) matched = byCode;
        }

        if (!matched) {
          // Không có đơn nào → fallback
          setVerifiedStatus("UNAUTHENTICATED");
          return;
        }

        setVerifiedOrderId(matched.id);

        // Map trạng thái từ backend sang UI state
        const dbStatus: string = matched.status || "Pending";
        if (dbStatus === "Paid" || dbStatus === "PAID") {
          setVerifiedStatus("PAID");
        } else if (dbStatus === "Cancelled" || dbStatus === "CANCELLED") {
          setVerifiedStatus("CANCELLED");
        } else {
          // Pending, Processing, ... — hiện "đang xử lý"
          setVerifiedStatus("PENDING");
        }
      } catch {
        // API lỗi — fallback về URL params
        const isCancelledByUrl = urlCancel === "true" || urlStatus === "CANCELLED";
        const isSuccessByUrl   = urlStatus === "PAID" && !isCancelledByUrl;
        setVerifiedStatus(isSuccessByUrl ? "PAID" : isCancelledByUrl ? "CANCELLED" : "PENDING");
      }
    };

    verify();
  }, [urlOrderCode, urlStatus, urlCancel]);

  if (verifiedStatus === "LOADING") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#2c5243] mx-auto" />
          <p className="text-sm text-gray-500">Đang xác nhận trạng thái thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 max-w-md w-full p-8 text-center">

        {verifiedStatus === "PAID" ? (
          <>
            <div className="flex items-center justify-center mb-5">
              <div className="rounded-full bg-emerald-50 p-4">
                <CheckCircle2 className="h-14 w-14 text-emerald-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-500 text-sm mb-1">
              Đơn hàng của bạn đã được xác nhận và đang chờ xử lý.
            </p>
            {verifiedOrderId && (
              <p className="text-xs text-gray-400 mt-1 mb-6">
                Mã đơn: <span className="font-mono font-bold text-gray-600">#{verifiedOrderId}</span>
              </p>
            )}
            {!verifiedOrderId && <div className="mb-6" />}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/orders"
                className="flex items-center justify-center gap-2 rounded-sm bg-[#2c5243] px-6 py-3 text-sm font-bold text-white hover:bg-[#1c362b] transition-colors uppercase tracking-wider"
              >
                <Package className="h-4 w-4" />
                Xem đơn hàng
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-sm border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 hover:border-[#2c5243] hover:text-[#2c5243] transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                Tiếp tục mua sắm
              </Link>
            </div>
          </>

        ) : verifiedStatus === "CANCELLED" ? (
          <>
            <div className="flex items-center justify-center mb-5">
              <div className="rounded-full bg-orange-50 p-4">
                <XCircle className="h-14 w-14 text-orange-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-2">
              Thanh toán bị hủy
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Bạn đã hủy thanh toán. Đơn hàng chưa được xác nhận.
              <br />
              Sản phẩm vẫn còn trong giỏ hàng — bạn có thể thử lại bất cứ lúc nào.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/cart"
                className="flex items-center justify-center gap-2 rounded-sm bg-[#2c5243] px-6 py-3 text-sm font-bold text-white hover:bg-[#1c362b] transition-colors uppercase tracking-wider"
              >
                <RefreshCcw className="h-4 w-4" />
                Thử lại thanh toán
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-sm border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 hover:border-[#2c5243] hover:text-[#2c5243] transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                Tiếp tục mua sắm
              </Link>
            </div>
          </>

        ) : verifiedStatus === "UNAUTHENTICATED" ? (
          <>
            <div className="flex items-center justify-center mb-5">
              <div className="rounded-full bg-gray-100 p-4">
                <AlertCircle className="h-14 w-14 text-gray-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-2">
              Không thể xác nhận
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Vui lòng đăng nhập để xem trạng thái đơn hàng của bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-sm bg-[#2c5243] px-6 py-3 text-sm font-bold text-white hover:bg-[#1c362b] transition-colors uppercase tracking-wider"
              >
                Đăng nhập
              </Link>
            </div>
          </>

        ) : (
          /* PENDING / unknown */
          <>
            <div className="flex items-center justify-center mb-5">
              <div className="rounded-full bg-blue-50 p-4">
                <Package className="h-14 w-14 text-blue-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-2">
              Đang xử lý
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Giao dịch của bạn đang được xử lý. Vui lòng kiểm tra trang đơn hàng để theo dõi trạng thái mới nhất.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/orders"
                className="flex items-center justify-center gap-2 rounded-sm bg-[#2c5243] px-6 py-3 text-sm font-bold text-white hover:bg-[#1c362b] transition-colors uppercase tracking-wider"
              >
                <Package className="h-4 w-4" />
                Xem đơn hàng
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-sm border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 hover:border-[#2c5243] hover:text-[#2c5243] transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                Về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2c5243]" />
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
