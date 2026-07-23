"use client";

import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { setUser, logout } from "../slices/userSlice";
import type { UserRole } from "@/domain/entities/User";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector((state) => state.user);

  const hasRole = (role: UserRole) => user?.role === role;
  const hasAnyRole = (roles: UserRole[]) => roles.some((r) => user?.role === r);

  return {
    user,
    token,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    setUser: (userData: any, tokenVal: string) => dispatch(setUser({ user: userData, token: tokenVal })),
    logout: () => dispatch(logout()),
  };
}
