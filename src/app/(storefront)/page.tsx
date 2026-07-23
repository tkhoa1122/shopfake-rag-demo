"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { ShoppingBag, SlidersHorizontal, ArrowRight, Loader2 } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { productAPI, variantAPI, categoryAPI, localCartAPI } from "@/infrastructure/api/storefrontAPI";
import type { ProductResponse, VariantResponse, CategoryResponse } from "@/types/api";
import type { ProductCard } from "@/types/storefront";



function ProductSkeleton() {
  return (
    <div className="animate-pulse group relative">
      <div className="aspect-4/5 w-full rounded-sm bg-gray-200" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-2/3 rounded-md bg-gray-200" />
        <div className="h-4 w-1/3 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

function StorefrontContent() {
  const params = useParams();
  const tenantId = params.tenant_id as string;
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState<ProductCard[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsLoggedIn(!!token);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [productsRes, categoriesRes, variantsRes] = await Promise.all([
        productAPI.getAll({ pageIndex: 1, pageSize: 50 }),
        categoryAPI.getAll({ pageIndex: 1, pageSize: 100 }),
        variantAPI.getAll({ pageIndex: 1, pageSize: 100 }),
      ]);

      const rawProducts: ProductResponse[] = productsRes.data?.items ?? [];
      const rawCategories: CategoryResponse[] = categoriesRes.data?.items ?? [];
      const rawVariants: VariantResponse[] = variantsRes.data?.items ?? [];

      setCategories(rawCategories);

      const productCards: ProductCard[] = rawProducts.map((product) => {
        const productVariants = rawVariants.filter((v) => v.productId === product.id);
        const firstVariant = productVariants[0];

        return {
          productId: product.id,
          name: product.name,
          brand: product.brand,
          categoryName: product.categoryName,
          description: product.description,
          price: firstVariant?.price ?? 0,
          imageUrl: firstVariant?.imageUrl?.[0] ?? "",
          variantId: firstVariant?.id ?? 0,
          stockQuantity: firstVariant?.stockQuantity ?? 0,
        };
      });

      setProducts(productCards);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      setError("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối Backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === null ||
      categories.find((c) => c.id === selectedCategory)?.name === p.categoryName;
    const matchSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <>
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      {!searchQuery && (
        <section className="relative w-full bg-[#f4f7f6]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#eef2f0] to-[#f4f7f6] z-0" />
          <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="max-w-xl text-left">
              <span className="inline-flex items-center rounded-full bg-[#2c5243]/10 px-3 py-1 text-sm font-semibold text-[#2c5243] mb-6">
                Bộ sưu tập mới 2026
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl uppercase">
                Tự tin <br />
                <span className="text-[#2c5243]">Mỗi Ngày</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Khám phá những thiết kế tối giản, tinh tế và thoải mái nhất. Mua sắm thông minh cùng Eco Fashion.
              </p>
              <div className="mt-8 flex gap-4">
                <a
                  href="#products"
                  className="rounded-sm bg-[#2c5243] px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#1c362b] hover:shadow-lg uppercase tracking-wider"
                >
                  Mua ngay
                </a>
              </div>
            </div>
            <div className="hidden md:block w-100 h-125 bg-gray-200 rounded-sm overflow-hidden shadow-2xl relative mt-8 md:mt-0">
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800" alt="Model" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>
      )}

      {/* ── Category Filter ───────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="sticky top-16 z-30 border-b border-gray-100 bg-white/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 overflow-x-auto py-3 scrollbar-hide">
              <span className="text-sm font-bold text-gray-900 uppercase shrink-0">Danh mục:</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`shrink-0 px-4 py-1.5 text-sm font-bold uppercase transition-all ${
                  selectedCategory === null
                    ? "border-b-2 border-[#2c5243] text-[#2c5243]"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat.id ? null : cat.id
                    )
                  }
                  className={`shrink-0 px-4 py-1.5 text-sm font-bold uppercase transition-all ${
                    selectedCategory === cat.id
                      ? "border-b-2 border-[#2c5243] text-[#2c5243]"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Product Grid ──────────────────────────────────────────────────── */}
      <section
        id="products"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">
            {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : "Sản phẩm nổi bật"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? "Đang tải..." : `${filteredProducts.length} sản phẩm`}
          </p>
        </div>

        {error && (
          <div className="rounded-sm border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button
              onClick={fetchData}
              className="mt-3 rounded-sm bg-red-100 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-200 uppercase"
            >
              Thử lại
            </button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="mt-16 text-center py-20 bg-gray-50 rounded-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-sm text-gray-500">
              Không tìm thấy sản phẩm nào phù hợp.
            </p>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
            {filteredProducts.map((product) => (
              <div key={product.productId} className="group relative">
                <Link
                  href={`/${tenantId}/products/${product.productId}`}
                  className="block"
                >
                  <div className="relative aspect-4/5 w-full overflow-hidden rounded-sm bg-gray-100 group-hover:opacity-90 transition-opacity">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-200">
                        <ShoppingBag className="h-12 w-12 text-gray-400" />
                      </div>
                    )}

                    {product.stockQuantity === 0 && (
                      <span className="absolute left-2 top-2 rounded-sm bg-gray-900 px-2 py-1 text-xs font-bold text-white uppercase tracking-wider">
                        Hết hàng
                      </span>
                    )}

                    {/* Quick Add Button */}
                    {product.stockQuantity > 0 && (
                      <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:p-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (!isLoggedIn) {
                              window.location.href = `/${tenantId}/login`;
                              return;
                            }
                            localCartAPI.add({
                              variantId: product.variantId,
                              productName: product.name,
                              variantName: product.name,
                              price: product.price,
                              imageUrl: product.imageUrl,
                            });
                            window.dispatchEvent(new Event("cartUpdated"));
                          }}
                          className="w-full rounded-sm bg-black/80 py-2.5 text-sm font-bold text-white shadow-sm backdrop-blur-md hover:bg-black uppercase tracking-wider"
                        >
                          {isLoggedIn ? "Thêm vào giỏ" : "Đăng nhập"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#2c5243] transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-red-600">
                      {product.price > 0
                        ? formatPrice(product.price)
                        : "Liên hệ"}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function StorefrontPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#2c5243]" /></div>}>
      <StorefrontContent />
    </Suspense>
  );
}
