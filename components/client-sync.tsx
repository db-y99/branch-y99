"use client";

import type { Profile } from "@/types";

import { useEffect } from "react";

import { useAuth } from "@/contexts/auth-context";

export function ClientSync({ profile }: { profile: Profile | null }) {
  const { setAuthData } = useAuth();

  useEffect(() => {
    setAuthData(profile);
  }, [profile, setAuthData]);

  return null;
}
