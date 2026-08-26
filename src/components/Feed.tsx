"use client";

import { useState } from "react";
import { Beer, Trash2 } from "lucide-react";
import { PhotoCarousel } from "./PhotoCarousel";
import { Avatar } from "./Avatar";
import { fmtDate, fmtInt } from "@/lib/utils";
import type { Entry, Profile } from "@/lib/types";

export function Feed({
  entries,
  profiles,
  myProfileId,
  onDelete,
}: {
  entries: Entry[];
  profiles: Profile[];
  myProfileId: string;
  onDelete: (entry: Entry) => void;
}) {
  const [openPhotoIds, setOpenPhotoIds] = useState<Record<string, boolean>>({});

  return (
    <div>
      <PhotoCarousel entries={entries} profiles={profiles} />

      {entries.length === 0 ? (
        <div className="bg-bg-elev border border-dashed border-border rounded-2xl px-4 py-[30px] flex flex-col items-center">
          <Beer size={30} color="var(--amber)" />
          <div className="mt-2 font-sans text-[13.5px] text-text-dim text-center">Ancora nessuna birra nel diario del gruppo.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {entries.map((e) => {
            const p = profiles.find((pr) => pr.id === e.profileId);
            const open = !!openPhotoIds[e.id];
            return (
              <div key={e.id} className="bg-bg-elev border border-border rounded-2xl p-3">
                <div className="flex items-center gap-2.5">
                  <Avatar profile={p} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-bold text-text font-sans flex items-center">
                      {p?.name || "Qualcuno"}
                      {e.doubled && <span className="ml-1.5 text-[10.5px] font-bold text-coral">🔥x2</span>}
                      {e.warm && (
                        <span
                          title="Birra calda — punti doppi"
                          className="inline-flex items-center justify-center ml-1.5 w-4 h-[13px] rounded-[3px] bg-[#3A3742] border border-[rgba(255,166,48,0.6)]"
                          style={{ animation: "microwaveGlow 1.4s ease-in-out infinite" }}
                        >
                          <span className="text-[8px] inline-block" style={{ animation: "beerSpin 1.8s linear infinite" }}>
                            🍺
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] text-text-dim mt-px">
                      {fmtDate(e.createdAt)} · {fmtInt(e.ml)} ml · +{fmtInt(e.points)} pt
                    </div>
                  </div>
                  {e.profileId === myProfileId && (
                    <button
                      onClick={() => onDelete(e)}
                      className="bg-transparent border-none text-text-dim p-1.5 rounded-md flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setOpenPhotoIds((prev) => ({ ...prev, [e.id]: !prev[e.id] }))}
                  className="mt-2 bg-bg-elev-2 border border-border rounded-lg px-2.5 py-[7px] text-xs font-semibold text-amber font-sans"
                >
                  {open ? "Nascondi foto" : "📷 Vedi la foto prova"}
                </button>
                {open && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.photoURL} alt="prova" className="w-full rounded-[10px] mt-2 max-h-[260px] object-cover" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
