"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [isAuthenticated, loading, router]);

  // Don't render until auth is loaded and checked
  if (loading || !checked) {
    return null;
  }

  return <>{children}</>;
}
