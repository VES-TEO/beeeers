"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Skull, Trash2 } from "lucide-react";
import { Avatar } from "./Avatar";
import { AddMemoryModal } from "./AddMemoryModal";
import { fmtDate } from "@/lib/utils";
import type { GalleryItem, Profile } from "@/lib/types";

export function HallOfFame({
  gallery,
  profiles,
  myProfileId,
  onAdd,
  onDelete,
  busy,
}: {
  gallery: GalleryItem[];
  profiles: Profile[];
  myProfileId: string;
  onAdd: (payload: { caption: string; photoFile: File }) => Promise<void>;
  onDelete: (item: GalleryItem) => void;
  busy: boolean;
}) {
  const [spotIndex, setSpotIndex] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const items = gallery.slice(0, 15);

  useEffect(() => {
    setSpotIndex(0);
  }, [items.length]);

  useEffect(() => {
    if (items.length < 2) return;
    timerRef.current = setInterval(() => {
      setSpotIndex((prev) => (prev + 1) % items.length);
    }, 4200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length]);

  const manualNav = (dir: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSpotIndex((prev) => (prev + dir + items.length) % items.length);
  };

  const spotProfile = (item: GalleryItem) => profiles.find((p) => p.id === item.profileId);

  return (
    <div>
      <div className="flex justify-between items-start mb-3.5">
        <div>
          <div className="font-baloo font-extrabold text-[19px] text-text">💀 Hall of Fame</div>
          <div className="text-[11.5px] text-text-dim mt-0.5 font-sans">I momenti più leggendari (nel senso peggiore)</div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 bg-bg-elev-2 border border-border text-amber rounded-lg px-3 py-2 text-xs font-bold font-sans whitespace-nowrap"
        >
          <Plus size={14} /> Ricordo
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-bg-elev border border-dashed border-border rounded-2xl px-4 py-[30px] flex flex-col items-center">
          <Skull size={30} color="var(--amber)" />
          <div className="mt-2 font-sans text-[13.5px] text-text-dim text-center">
            Ancora nessun ricordo imbarazzante.
            <br />
            Aggiungine uno tu per primo 💀
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-full h-[320px] rounded-[18px] overflow-hidden border border-border bg-bg-elev">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={items[spotIndex].photoURL} alt={spotProfile(items[spotIndex])?.name || "?"} className="w-full h-full object-cover" />
            <div
              className="absolute bottom-0 left-0 right-0 px-3.5 pb-3.5 pt-10"
              style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0) 100%)" }}
            >
              <div className="flex items-center gap-2">
                <Avatar profile={spotProfile(items[spotIndex])} size={26} />
                <div>
                  <div className="text-[13.5px] font-bold text-white font-sans">{spotProfile(items[spotIndex])?.name || "?"}</div>
                  <div className="text-[11px] text-white/70">{fmtDate(items[spotIndex].createdAt)}</div>
                </div>
              </div>
              {items[spotIndex].caption && (
                <div className="mt-2 text-[13px] italic text-white font-sans">&quot;{items[spotIndex].caption}&quot;</div>
              )}
            </div>
            {items.length > 1 && (
              <>
                <button
                  onClick={() => manualNav(-1)}
                  className="absolute top-1/2 -translate-y-1/2 left-2 bg-black/45 border-none rounded-full w-[30px] h-[30px] flex items-center justify-center text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => manualNav(1)}
                  className="absolute top-1/2 -translate-y-1/2 right-2 bg-black/45 border-none rounded-full w-[30px] h-[30px] flex items-center justify-center text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
          {items.length > 1 && (
            <div className="flex justify-center gap-[5px] mt-2.5 mb-[18px]">
              {items.map((_, i) => (
                <div
                  key={i}
                  className="h-[5px] rounded-full"
                  style={{ width: i === spotIndex ? 14 : 5, background: i === spotIndex ? "var(--amber)" : "var(--border)" }}
                />
              ))}
            </div>
          )}

          <div className="text-xs font-bold text-text-dim uppercase tracking-wider mb-2">Tutti i ricordi</div>
          <div className="grid grid-cols-3 gap-2">
            {items.map((it) => (
              <div key={it.id} className="relative aspect-square rounded-[10px] overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.photoURL} alt={spotProfile(it)?.name || "?"} className="w-full h-full object-cover" />
                <div
                  className="absolute bottom-0 left-0 right-0 px-1.5 pb-1 pt-3 flex justify-between items-center"
                  style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)" }}
                >
                  <span className="text-[9.5px] font-bold text-white font-sans">{spotProfile(it)?.name || "?"}</span>
                  {it.profileId === myProfileId && (
                    <button
                      onClick={() => onDelete(it)}
                      className="bg-black/50 border-none rounded-[5px] w-[18px] h-[18px] flex items-center justify-center text-white"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showAdd && (
        <AddMemoryModal
          onClose={() => setShowAdd(false)}
          onSave={async (payload) => {
            await onAdd(payload);
            setShowAdd(false);
          }}
          busy={busy}
        />
      )}
    </div>
  );
}
