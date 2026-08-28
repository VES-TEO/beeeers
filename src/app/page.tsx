"use client";

// The whole app is auth-gated and realtime (Firestore listeners, Firebase
// Auth state) — nothing here is meaningfully static, and prerendering it
// would run client Firebase init at build time with no env vars available.
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/AuthProvider";
import { CompleteProfile } from "@/components/CompleteProfile";
import { App } from "@/components/App";
import { AppLoader } from "@/components/AppLoader";

export default function HomePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return <AppLoader />;
  }

  if (!profile) return <CompleteProfile />;

  return <App />;
}
