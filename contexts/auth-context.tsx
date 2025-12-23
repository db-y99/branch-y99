"use client";

import type { Profile } from "@/types";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";

import { USER_ROLE } from "@/utils/constants";

interface AuthContextType {
  profile: Profile | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  setAuthData: (profile: Profile | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated] = useState(() => {
    return typeof window !== "undefined" && !!localStorage.getItem("user");
  });
  const [profile, setProfile] = useState<Profile | null>(null);

  const setAuthData = (profile: Profile | null) => {
    setProfile(profile);
  };

  // Check if current user is admin
  const isAdmin = useMemo(() => {
    if (!profile) return false;

    // Check both legacy role field and new roles.code
    return profile.roles?.code === USER_ROLE.ADMIN;
  }, [profile]);

  const logout = () => {
    localStorage.removeItem("user");
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ profile, isAdmin, isAuthenticated, setAuthData, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");

  return ctx;
}
