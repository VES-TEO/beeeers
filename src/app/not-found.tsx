"use client";

// See src/app/page.tsx for why this route opts out of static prerendering
// (the layout it renders inside pulls in client Firebase init).
export const dynamic = "force-dynamic";

import Link from "next/link";
import { CircularLogo } from "@/components/CircularLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <CircularLogo size={90} animate={false} />
      <p className="font-sans text-[13.5px] text-text-dim">Questa pagina non esiste.</p>
      <Link
        href="/"
        className="rounded-xl px-5 py-2.5 font-fredoka text-[14px] font-bold text-[#12100B]"
        style={{ background: "linear-gradient(135deg, var(--amber) 0%, var(--amber-deep) 100%)" }}
      >
        Torna a BEEEEERS
      </Link>
    </div>
  );
}
