"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authAPI } from "@/infrastructure/api/authAPI";
import { useAppDispatch } from "@/application/hooks/reduxHooks";
import { setUser } from "@/application/slices/userSlice";
import type { User } from "@/domain/entities/User";
import { UserRole } from "@/domain/entities/User";

// ─── Minimal UI Components (Simulating shadcn/ui) ──────────────────────────

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl border bg-white px-4 py-2 text-sm text-slate-900 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-red-500 focus-visible:ring-red-500/20" : "border-slate-200 focus-visible:ring-[#A8E6CF] focus-visible:border-[#A8E6CF]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-sm font-medium leading-none text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
  )
);
Label.displayName = "Label";

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative flex h-5 w-5 items-center justify-center">
      <input
        type="checkbox"
        ref={ref}
        className={cn("peer h-5 w-5 appearance-none rounded border border-slate-300 bg-white checked:border-[#2c5243] checked:bg-[#2c5243] focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] focus:ring-offset-2 transition-all", className)}
        {...props}
      />
      <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
    </div>
  )
);
Checkbox.displayName = "Checkbox";

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function BuyerAuthPage() {
  const params = useParams();
  const tenantId = params.tenant_id as string;
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const dispatch = useAppDispatch();

  // Form States
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  // Login Handlers
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await authAPI.login({ email, password });
      if (res.code === 200 && res.data?.token) {
        // Dispatch vào Redux Store → Header cập nhật ngay, không cần F5
        const buyerUser: User = {
          id: "",          // Shopfake API chỉ trả token, không trả profile trong login
          email,
          name: email,   // Hiển thị tạm email, có thể gọi /auth/me sau để lấy đầy đủ
          role: UserRole.CUSTOMER,
          createdAt: new Date().toISOString(),
        };
        dispatch(setUser({ user: buyerUser, token: res.data.token }));
        router.push(`/${tenantId}`);
      } else {
        setErrorMsg(res.message || "Đăng nhập thất bại");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Có lỗi xảy ra khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  // Register Handlers
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirm = formData.get("confirmPassword") as string;

    if (password !== confirm) {
      setErrorMsg("Mật khẩu xác nhận không khớp");
      setIsLoading(false);
      return;
    }

    try {
      const res = await authAPI.register({ email, password, fullName });
      if (res.code === 200) {
        setActiveTab("login");
        setSuccessMsg("Đăng ký thành công! Vui lòng đăng nhập.");
      } else {
        setErrorMsg(res.message || "Đăng ký thất bại");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Có lỗi xảy ra khi đăng ký");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* ── Left Panel: Lookbook Image (Hidden on Mobile) ── */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-[#A8E6CF]/20 mix-blend-multiply z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2c5243]/80 via-transparent to-transparent z-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200"
          alt="Fashion Lookbook"
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-12 left-12 z-20 max-w-md">
          <h2 className="text-4xl font-bold text-white mb-4">Mùa Hè Rực Rỡ</h2>
          <p className="text-lg text-white/90">
            Khám phá bộ sưu tập mới nhất với những thiết kế bền vững, tôn vinh vẻ đẹp tự nhiên của bạn.
          </p>
        </div>
        
        {/* Back Button Overlay */}
        <Link 
          href={`/${tenantId}`}
          className="absolute top-8 left-8 z-20 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/30"
        >
          <ArrowLeft className="h-4 w-4" />
          Tiếp tục mua sắm
        </Link>
      </div>

      {/* ── Right Panel: Auth Forms ── */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-32">
        
        {/* Mobile Back Button */}
        <div className="mb-8 lg:hidden">
          <Link 
            href={`/${tenantId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại trang chủ
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Eco Fashion</h1>
            <p className="mt-2 text-sm text-slate-500">Chào mừng bạn đến với cửa hàng của chúng tôi</p>
          </div>

          {/* Custom Tabs */}
          <div className="mb-8 rounded-xl bg-slate-100 p-1 flex">
            <button
              onClick={() => { setActiveTab("login"); setErrorMsg(""); setSuccessMsg(""); }}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200",
                activeTab === "login" ? "bg-white text-[#2c5243] shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => { setActiveTab("register"); setErrorMsg(""); setSuccessMsg(""); }}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200",
                activeTab === "register" ? "bg-white text-[#2c5243] shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Đăng ký
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600 border border-green-100">
              {successMsg}
            </div>
          )}

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            
            {/* ══ LOGIN TAB ══ */}
            {activeTab === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" name="email" type="email" placeholder="Nhập địa chỉ email của bạn" required />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Mật khẩu</Label>
                      <Link href="#" className="text-sm font-medium text-[#5a9c82] hover:text-[#2c5243]">
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        name="password"
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="font-normal cursor-pointer text-slate-600">
                      Ghi nhớ đăng nhập
                    </Label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-[#A8E6CF] py-3.5 text-sm font-bold text-[#1c362b] transition-all hover:bg-[#97d0ba] hover:shadow-md active:scale-98 disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Đăng nhập"}
                  </button>
                </form>

                {/* Social Login */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-slate-50 px-2 text-slate-500">Hoặc đăng nhập bằng</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Google
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                      <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ REGISTER TAB ══ */}
            {activeTab === "register" && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-name">Họ và tên</Label>
                    <Input id="reg-name" name="fullName" type="text" placeholder="Nguyễn Văn A" required />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" name="email" type="email" placeholder="Nhập địa chỉ email của bạn" required />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password">Mật khẩu</Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        name="password"
                        type={showPass ? "text" : "password"}
                        placeholder="Tối thiểu 8 ký tự"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-confirm">Xác nhận mật khẩu</Label>
                    <div className="relative">
                      <Input
                        id="reg-confirm"
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox id="terms" required className="mt-0.5" />
                    <Label htmlFor="terms" className="font-normal cursor-pointer text-slate-600 leading-snug">
                      Tôi đồng ý với{" "}
                      <Link href="#" className="font-medium text-[#5a9c82] hover:underline">Điều khoản dịch vụ</Link>{" "}
                      và{" "}
                      <Link href="#" className="font-medium text-[#5a9c82] hover:underline">Chính sách bảo mật</Link>
                    </Label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-[#A8E6CF] py-3.5 text-sm font-bold text-[#1c362b] transition-all hover:bg-[#97d0ba] hover:shadow-md active:scale-98 disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Tạo tài khoản"}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
