"use client";

import type { Profile } from "@/types";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
} from "react";

import { USER_ROLE } from "@/utils/constants";
import { getProfileById } from "@/actions/profiles";

interface AuthContextType {
  profile: Profile | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAuth = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const userProfile = await getProfileById(user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching auth:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuth();
  }, []);

  const refresh = async () => {
    await fetchAuth();
  };

  const isAuthenticated = useMemo(() => !!profile, [profile]);

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

  // Don't render children until auth is loaded to prevent flash
  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{ profile, isAdmin, isAuthenticated, loading, logout, refresh }}
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
