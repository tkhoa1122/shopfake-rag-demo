"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authAPI } from "@/infrastructure/api/authAPI";
import { useAppDispatch } from "@/application/hooks/reduxHooks";
import { setUser } from "@/application/slices/userSlice";
import type { User } from "@/domain/entities/User";
import { UserRole } from "@/domain/entities/User";
import { jwtDecode } from "jwt-decode";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl border bg-slate-900/5 px-4 py-2 text-sm text-slate-100 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-rose-500 focus-visible:ring-rose-500/20" : "border-slate-800 focus-visible:ring-[#A8E6CF] focus-visible:border-[#A8E6CF]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-sm font-medium leading-none text-slate-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
  )
);
Label.displayName = "Label";

export default function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await authAPI.login({ email, password });
      if (res.code === 200 && res.data?.token) {
        let role: UserRole = UserRole.CUSTOMER;
        try {
          const decoded = jwtDecode<any>(res.data.token);
          const decodedRole = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
          if (decodedRole === "Admin" || decodedRole === "SYSTEM_ADMIN") {
            role = UserRole.SYSTEM_ADMIN;
          }
        } catch (e) {
          console.error("JWT Decode error:", e);
        }

        if (role !== UserRole.SYSTEM_ADMIN) {
          setErrorMsg("Tài khoản của bạn không có quyền truy cập hệ thống quản trị.");
          setIsLoading(false);
          // Don't log them in as admin
          return;
        }

        const adminUser: User = {
          id: "",
          email,
          name: email,
          role: role,
          createdAt: new Date().toISOString(),
        };
        dispatch(setUser({ user: adminUser, token: res.data.token }));
        router.push(`/admin`);
      } else {
        setErrorMsg(res.message || "Đăng nhập thất bại");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Có lỗi xảy ra khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      
      {/* ── Left Panel: Admin branding ── */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block border-r border-slate-900 bg-slate-900/50">
        <div className="absolute inset-0 bg-gradient-to-br from-[#A8E6CF]/10 via-transparent to-[#2c5243]/20 z-10" />
        <div className="h-full w-full flex flex-col justify-center items-center p-12 relative z-20">
          <div className="max-w-md space-y-6">
            <div className="inline-flex items-center gap-3 mb-6 bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800">
              <div className="h-3 w-3 rounded-full bg-[#A8E6CF] shadow-[0_0_10px_#A8E6CF]" />
              <span className="font-mono text-sm tracking-wider text-slate-300">SECURE PORTAL</span>
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
              Quản trị Hệ thống<br />
              <span className="text-[#A8E6CF]">Shopfake Admin</span>
            </h2>
            <p className="text-lg text-slate-400">
              Chỉ dành cho tài khoản nhân viên được cấp quyền truy cập. Vui lòng đăng nhập để quản lý sản phẩm, đơn hàng và khách hàng.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-32 relative">
        <Link 
          href={`/`}
          className="absolute top-8 right-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Về trang chủ shop
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-sm"
        >
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Đăng nhập</h1>
            <p className="text-slate-400 text-sm">Điền thông tin tài khoản quản trị để tiếp tục.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-400 border border-rose-500/20">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login-email">Tài khoản Email</Label>
              <Input id="login-email" name="email" type="email" placeholder="admin@shopfake.com" required />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Mật khẩu</Label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-[#A8E6CF] py-3.5 text-sm font-bold text-slate-900 transition-all hover:bg-[#bbf0df] hover:shadow-[0_0_20px_rgba(168,230,207,0.3)] active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 mt-2"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Đăng nhập Quản trị"}
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-slate-600">
            &copy; 2026 Shopfake Platform. Mọi quyền truy cập đều được ghi log bảo mật.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
