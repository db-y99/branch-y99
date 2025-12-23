"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [isAuthenticated, router]);

  if (!checked) {
    return null; // tránh flash content
  }

  return <>{children}</>;
}
