"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Package,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  Calendar,
  Hash,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { orderAPI, type OrderResponse } from "@/infrastructure/api/storefrontAPI";
import { authAPI } from "@/infrastructure/api/authAPI";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

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
  Pending:    { label: "Chờ thanh toán", className: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  Paid:       { label: "Đã thanh toán",  className: "bg-green-50 text-green-700 border border-green-200" },
  Processing: { label: "Đang xử lý",     className: "bg-blue-50 text-blue-700 border border-blue-200" },
  Shipped:    { label: "Đang giao",       className: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  Delivered:  { label: "Đã giao",        className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  Cancelled:  { label: "Đã hủy",         className: "bg-red-50 text-red-700 border border-red-200" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, className: "bg-gray-100 text-gray-600 border border-gray-200" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ── Order Detail Modal ────────────────────────────────────────────────────────

function OrderDetailModal({ orderId, onClose }: { orderId: number; onClose: () => void }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getById(orderId);
        const data = res?.data?.data || res?.data || res;
        setOrder(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Không thể tải chi tiết đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [orderId]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const items = order ? (order.orderItems || order.items || []) : [];
  const status = order ? (order.paymentStatus || order.status || "Pending") : "Pending";
  const orderCode = order ? (order.paymentCode || order.orderCode || `#${orderId}`) : `#${orderId}`;
  const totalAmount = order
    ? (order.totalAmount ?? items.reduce((sum: number, it: any) => sum + ((it.unitPrice ?? it.price ?? 0) * (it.quantity ?? 1)), 0))
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Chi tiết đơn hàng</h2>
            <p className="text-xs text-gray-400 mt-0.5">Mã đơn: {orderCode}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 space-y-5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#2c5243]" />
              <p className="text-sm text-gray-500">Đang tải chi tiết đơn hàng...</p>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 rounded-sm p-4 border border-red-100">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {!loading && !error && order && (
            <>
              {/* Status */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div>
                  <span className="text-xs text-gray-500 block font-medium">Trạng thái đơn</span>
                  <span className="text-sm font-bold text-gray-800">{order.paymentMethod ? `Phương thức: ${order.paymentMethod}` : "Trực tuyến"}</span>
                </div>
                <StatusBadge status={status} />
              </div>

              {/* Info Grid */}
              <div className="rounded-lg border border-gray-100 bg-gray-50 divide-y divide-gray-100">
                <InfoRow icon={<Hash className="h-4 w-4" />} label="Mã giao dịch" value={orderCode} />
                <InfoRow icon={<User className="h-4 w-4" />} label="Người nhận" value={order.receiverName} />
                <InfoRow icon={<Phone className="h-4 w-4" />} label="Số điện thoại" value={order.receiverPhone} />
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="Địa chỉ giao hàng" value={order.shippingAddress} />
                {order.createdAt && (
                  <InfoRow icon={<Calendar className="h-4 w-4" />} label="Thời gian đặt hàng" value={formatDate(order.createdAt)} />
                )}
              </div>

              {/* Items list */}
              {items.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Sản phẩm đã mua ({items.length})</h3>
                  <div className="space-y-3">
                    {items.map((item: any, idx: number) => {
                      const itemName = item.productVariantName || item.variantName || item.productName || "Sản phẩm";
                      const itemPrice = item.unitPrice ?? item.price ?? 0;
                      const itemQty = item.quantity ?? 1;

                      return (
                        <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt={itemName} className="h-14 w-14 object-cover rounded-md shrink-0" />
                          ) : (
                            <div className="h-14 w-14 bg-gray-200 rounded-md shrink-0 flex items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2">{itemName}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatPrice(itemPrice)} × {itemQty}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 shrink-0">{formatPrice(itemPrice * itemQty)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <div className="rounded-lg bg-gray-50 p-4 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-gray-700">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-emerald-600">Miễn phí</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm font-bold text-gray-900 uppercase">Tổng thanh toán</span>
                  <span className="text-xl font-bold text-[#2c5243]">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Payment Action if Pending */}
              {status.toLowerCase() === "pending" && order.paymentUrl && (
                <a
                  href={order.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center rounded-lg bg-[#2c5243] py-3 text-sm font-bold text-white shadow-md hover:bg-[#1f3c31] transition-all uppercase tracking-wider"
                >
                  Tiến hành thanh toán đơn hàng
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-900 font-semibold mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const PAGE_SIZE = 10;

  const fetchOrders = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const res = await orderAPI.getAll({ pageNumber: page, pageSize: PAGE_SIZE });
      const raw = res?.data || res;
      const items = raw?.items || raw?.data?.items || (Array.isArray(raw) ? raw : []);
      const total = raw?.totalPages || raw?.data?.totalPages || 1;
      setOrders(items);
      setTotalPages(total);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authAPI.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    fetchOrders(pageNumber);
  }, [pageNumber, fetchOrders, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Success Banner */}
        {isSuccess && (
          <div className="mb-6 flex items-center gap-4 rounded-sm bg-emerald-50 border border-emerald-200 px-5 py-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-800">Đặt hàng thành công!</p>
              <p className="text-xs text-emerald-600 mt-0.5">Đơn hàng của bạn đã được tạo và đang chờ xử lý.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Đơn hàng của tôi</h1>
            <p className="text-gray-500 text-sm mt-1">Lịch sử và trạng thái các đơn hàng</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#2c5243] hover:underline"
          >
            <ShoppingBag className="h-4 w-4" />
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#2c5243]" />
            <p className="text-gray-500 text-sm">Đang tải đơn hàng...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-300" />
            <p className="text-gray-600 text-sm">{error}</p>
            <button
              onClick={() => fetchOrders(pageNumber)}
              className="rounded-sm bg-[#2c5243] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1c362b] transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-sm shadow-sm">
            <Package className="h-16 w-16 text-gray-200 mb-4" />
            <h2 className="text-lg font-bold text-gray-900 uppercase">Chưa có đơn hàng nào</h2>
            <p className="text-sm text-gray-500 mt-2 mb-8">Hãy mua sắm và quay lại đây để theo dõi đơn hàng của bạn.</p>
            <Link
              href="/"
              className="rounded-sm bg-[#2c5243] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#1c362b] uppercase tracking-wider transition-colors"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã đơn</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Người nhận</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Địa chỉ</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Ngày đặt</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-5 py-4 font-mono text-xs font-bold text-gray-900">#{order.id}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900 text-sm">{order.receiverName || "—"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{order.receiverPhone}</p>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500 hidden md:table-cell max-w-[200px] truncate">
                          {order.shippingAddress || "—"}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500 hidden sm:table-cell whitespace-nowrap">
                          {order.createdAt ? formatDate(order.createdAt) : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={order.status || "Pending"} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="text-xs font-bold text-[#2c5243] hover:underline whitespace-nowrap"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-500">
                    Trang <span className="font-bold text-gray-800">{pageNumber}</span> / {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                      disabled={pageNumber <= 1}
                      className="flex items-center gap-1 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Trước
                    </button>
                    <button
                      onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                      disabled={pageNumber >= totalPages}
                      className="flex items-center gap-1 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Sau
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrderId !== null && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2c5243]" />
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
