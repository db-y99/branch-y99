"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    if (isAuthenticated) {
      router.replace("/");
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
