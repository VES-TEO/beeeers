"use client";

// The whole app is auth-gated and realtime (Firestore listeners, Firebase
// Auth state) — nothing here is meaningfully static, and prerendering it
// would run client Firebase init at build time with no env vars available.
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";
import { CompleteProfile } from "@/components/CompleteProfile";
import { App } from "@/components/App";

export default function HomePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 size={26} color="var(--amber)" className="spin" />
      </div>
    );
  }

  if (!profile) return <CompleteProfile />;

  return <App />;
}
