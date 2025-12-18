"use client";

import { useEffect } from "react";

import { useAuth } from "@/contexts/auth-context";
import type { Profile } from "@/types";

export function ClientSync({ profile }: { profile: Profile | null }) {
  const { setAuthData } = useAuth();

  useEffect(() => {
    setAuthData(profile);
  }, [profile, setAuthData]);

  return null;
}
