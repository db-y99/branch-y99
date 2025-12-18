"use client";

import type { ThemeProviderProps } from "next-themes";

import React, { useState, useEffect } from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/react";
import { AuthProvider } from "@/contexts/auth-context";
import { getProfileById } from "@/actions/profiles";
import { Profile } from "@/types";
import { ClientSync } from "@/components/client-sync";
import { SWRProvider } from "@/contexts/swr-context";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") as string);

        if (user) {
          const userProfile = await getProfileById(user.id);

          setProfile(userProfile);
        }
      } catch (error) {
        console.error("Error fetching auth:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuth();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <AuthProvider>
          <ClientSync profile={profile}></ClientSync>
          <ToastProvider />
          <SWRProvider>{children}</SWRProvider>
        </AuthProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
