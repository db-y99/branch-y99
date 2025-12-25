"use client";

import type { ThemeProviderProps } from "next-themes";

import React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/react";

import { AuthProvider } from "@/contexts/auth-context";
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

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <AuthProvider>
          <ToastProvider />
          <SWRProvider>{children}</SWRProvider>
        </AuthProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
