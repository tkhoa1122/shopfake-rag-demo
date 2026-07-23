import React from "react";
import Link from "next/link";
import { ShoppingBag, Globe, Camera, Video, Phone, Mail, MapPin } from "lucide-react";

export function Footer({ tenantId }: { tenantId: string }) {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand & Contact */}
          <div className="md:col-span-2 lg:col-span-2">
            <Link href={`/${tenantId}`} className="flex items-center gap-2 group mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2c5243] text-[#A8E6CF]">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#2c5243] capitalize">
                {tenantId.replace(/-/g, " ")}
              </span>
            </Link>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-sm">
              Tự hào mang đến những sản phẩm chất lượng, phong cách tối giản và hiện đại cho người Việt. Trải nghiệm mua sắm thông minh cùng chúng tôi.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>Lô D1, Khu Công Nghệ Cao, P. Tăng Nhơn Phú, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>0379 920 700</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                {/* <span>support@{tenantId.replace(/-/g, "")}.vn</span> */}
                <span>tkhoa1122@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Links: CSKH */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Chăm sóc khách hàng</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-gray-500 hover:text-[#2c5243]">Chính sách đổi trả 60 ngày</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-[#2c5243]">Chính sách khuyến mãi</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-[#2c5243]">Chính sách bảo mật</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-[#2c5243]">Chính sách giao hàng</Link></li>
            </ul>
          </div>

          {/* Links: Về chúng tôi */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Về chúng tôi</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-gray-500 hover:text-[#2c5243]">Câu chuyện thương hiệu</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-[#2c5243]">Tin tức</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-[#2c5243]">Cơ hội việc làm</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-[#2c5243]">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Kết nối</h3>
            <div className="flex gap-4">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-gray-400 hover:bg-[#1877F2] hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-gray-400 hover:bg-[#E4405F] hover:text-white transition-colors">
                <Camera className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-gray-400 hover:bg-[#FF0000] hover:text-white transition-colors">
                <Video className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-100 pt-8 text-center sm:flex sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {tenantId.replace(/-/g, " ").toUpperCase()}. Đã đăng ký bản quyền.
          </p>
          <div className="mt-4 flex justify-center gap-4 sm:mt-0">
            <span className="text-sm text-gray-400">Thiết kế với ♥ từ Eco Fashion Framework</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
