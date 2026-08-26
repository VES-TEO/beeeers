"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar } from "./Avatar";
import { fmtInt } from "@/lib/utils";
import type { Entry, Profile } from "@/lib/types";

export function PhotoCarousel({ entries, profiles }: { entries: Entry[]; profiles: Profile[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = entries.slice(0, 10);

  const scrollBy = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });

  if (items.length === 0) return null;

  return (
    <div className="relative mb-[18px]">
      <div className="flex justify-between items-center mb-2">
        <span className="font-baloo font-bold text-[15px] text-text">📸 Ultimi scatti</span>
        <div className="flex gap-1.5">
          <button onClick={() => scrollBy(-1)} className="bg-bg-elev border border-border rounded-full w-[26px] h-[26px] flex items-center justify-center text-text-dim">
            <ChevronLeft size={15} />
          </button>
          <button onClick={() => scrollBy(1)} className="bg-bg-elev border border-border rounded-full w-[26px] h-[26px] flex items-center justify-center text-text-dim">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollSnapType: "x mandatory" }}>
        {items.map((it) => {
          const p = profiles.find((pr) => pr.id === it.profileId);
          return (
            <div
              key={it.id}
              className="relative flex-none w-[130px] h-[172px] rounded-2xl overflow-hidden border border-border"
              style={{ scrollSnapAlign: "start" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.photoURL} alt={p?.name || "?"} className="w-full h-full object-cover" />
              <div
                className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-[18px] flex justify-between items-end"
                style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)" }}
              >
                <div className="flex items-center gap-1.5">
                  <Avatar profile={p} size={20} />
                  <span className="text-[11px] font-bold text-white font-sans">{p?.name || "?"}</span>
                </div>
                <span className="text-[10.5px] font-bold text-amber font-sans">+{fmtInt(it.points)} pt</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
