"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setChecked(true);
      router.replace("/");
      return;
    }

    setShouldRender(true);
    setChecked(true);
  }, [router]);

  if (!checked) {
    return null; // Prevent flash of content before redirect
  }

  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}
