"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Loader2,
  Package,
  ShieldCheck,
  RefreshCcw,
  Truck,
  Phone,
  Check
} from "lucide-react";
import {
  productAPI,
  variantAPI,
  localCartAPI,
} from "@/infrastructure/api/storefrontAPI";
import { authAPI } from "@/infrastructure/api/authAPI";
import type { ProductResponse, VariantResponse } from "@/types/api";
import { StatusEnum } from "@/types/api";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function ProductDetailPage() {
  const params = useParams();
  const tenantId = params.tenant_id as string;
  const productId = params.productId as string;
  const productIdNum = parseInt(productId, 10);

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [variants, setVariants] = useState<VariantResponse[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<VariantResponse | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setIsLoggedIn(authAPI.isLoggedIn());
  }, []);

  useEffect(() => {
    if (!productIdNum) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [productRes, variantsRes] = await Promise.all([
          productAPI.getById(productIdNum),
          variantAPI.getAll({ pageIndex: 1, pageSize: 100 }),
        ]);

        setProduct(productRes.data ?? null);

        const productVariants = (variantsRes.data?.items ?? []).filter(
          (v) => v.productId === productIdNum && v.status === StatusEnum.Active
        );
        setVariants(productVariants);

        if (productVariants.length > 0) {
          setSelectedVariant(productVariants[0]);
          setSelectedImage(productVariants[0].imageUrl?.[0] ?? "");
        }
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [productIdNum]);

  // ── Thêm vào giỏ hàng (localStorage) ─────────────────────────────────────
  const handleAddToCart = () => {
    if (!isLoggedIn) {
      window.location.href = `/${tenantId}/login`;
      return;
    }
    if (!selectedVariant) return;

    localCartAPI.add({
      variantId: selectedVariant.id,
      productName: product?.name ?? "",
      variantName: selectedVariant.variantName,
      price: selectedVariant.price,
      imageUrl: selectedVariant.imageUrl?.[0] ?? "",
      quantity,
    });

    // Notify Header to update cart count
    window.dispatchEvent(new Event("cartUpdated"));

    setCartMessage("Đã thêm vào giỏ hàng!");
    setTimeout(() => setCartMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#2c5243]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-white">
        <Package className="h-16 w-16 text-gray-300" />
        <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm.</p>
        <Link
          href={`/${tenantId}`}
          className="rounded-sm bg-[#2c5243] px-6 py-2.5 text-sm font-bold text-white uppercase"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const allImages = selectedVariant?.imageUrl ?? [];

  return (
    <div className="min-h-screen bg-white">
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-[#f8f9fa]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <Link href={`/${tenantId}`} className="hover:text-[#2c5243] transition-colors flex items-center gap-1">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-[#2c5243]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* ── Image Gallery (Left Column) ─────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 h-fit">
            {/* Thumbnails (Vertical on desktop, horizontal on mobile) */}
            {allImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-175 scrollbar-hide md:w-20 shrink-0">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-20 shrink-0 overflow-hidden rounded-sm transition-all ${
                      selectedImage === img
                        ? "ring-2 ring-[#2c5243] opacity-100"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 aspect-3/4 overflow-hidden rounded-sm bg-gray-100">
              {selectedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80";
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-gray-300" />
                </div>
              )}
            </div>
          </div>

          {/* ── Product Info (Right Column) ────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4">
                <p className="text-2xl font-bold text-[#2c5243]">
                  {selectedVariant ? formatPrice(selectedVariant.price) : "Liên hệ"}
                </p>
                <span className="inline-flex items-center rounded-sm bg-[#A8E6CF]/30 px-2.5 py-0.5 text-xs font-bold text-[#2c5243] uppercase tracking-wider">
                  Freeship
                </span>
              </div>
            </div>

            <div className="w-full h-px bg-gray-200" />

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900 uppercase">
                    Loại: <span className="text-[#2c5243] ml-1">{selectedVariant?.variantName}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariant(v);
                          if (v.imageUrl && v.imageUrl.length > 0) {
                            setSelectedImage(v.imageUrl[0]);
                          }
                        }}
                        className={`relative min-w-20 rounded-sm border px-4 py-2.5 text-sm font-bold uppercase transition-all ${
                          isSelected
                            ? "border-[#2c5243] bg-white text-[#2c5243] shadow-sm"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {v.variantName}
                        {isSelected && (
                          <Check className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-[#2c5243] p-0.5 text-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-900 uppercase">Số lượng</p>
              <div className="flex h-11 w-32 items-center rounded-sm border border-gray-300 bg-white">
                <button
                  type="button"
                  className="flex h-full w-10 items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <div className="flex h-full flex-1 items-center justify-center border-x border-gray-300 font-bold text-gray-900">
                  {quantity}
                </div>
                <button
                  type="button"
                  className="flex h-full w-10 items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={selectedVariant?.stockQuantity === 0}
                className={`flex-1 rounded-sm py-4 text-sm font-bold uppercase tracking-widest transition-all ${
                  selectedVariant?.stockQuantity === 0
                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                    : "bg-[#2c5243] text-white hover:bg-[#1c362b] shadow-md hover:shadow-lg"
                }`}
              >
                {selectedVariant?.stockQuantity === 0
                  ? "Tạm hết hàng"
                  : cartMessage
                  ? cartMessage
                  : "Thêm vào giỏ hàng"}
              </button>
            </div>

            <div className="w-full h-px bg-gray-200" />

            {/* Policies (Coolmate Style) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-sm bg-gray-50">
                <RefreshCcw className="h-5 w-5 text-[#2c5243] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">Đổi trả cực dễ chỉ cần số điện thoại</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-sm bg-gray-50">
                <ShieldCheck className="h-5 w-5 text-[#2c5243] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">60 ngày đổi trả (sản phẩm nguyên nhãn mác)</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-sm bg-gray-50">
                <Phone className="h-5 w-5 text-[#2c5243] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">Hotline 1900.27.27.37 hỗ trợ (8:30 - 22:00)</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-sm bg-gray-50">
                <Truck className="h-5 w-5 text-[#2c5243] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">Giao hàng tận nơi, nhận hàng kiểm tra</p>
              </div>
            </div>

            {/* Description */}
            <div className="pt-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Đặc điểm nổi bật</h3>
              <div className="prose prose-sm max-w-none text-gray-600">
                {product.description ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
                ) : (
                  <p>Thông tin sản phẩm đang được cập nhật.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
