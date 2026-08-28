"use client";

import { useState } from "react";
import { Beer, Trash2 } from "lucide-react";
import { PhotoCarousel } from "./PhotoCarousel";
import { Avatar } from "./Avatar";
import { fmtDate, fmtInt, onThisDayLastYear } from "@/lib/utils";
import { REACTION_EMOJIS } from "@/lib/types";
import type { Entry, Profile, Reaction } from "@/lib/types";

function ReactionBar({
  entryId,
  reactions,
  myProfileId,
  onSetReaction,
  onRemoveReaction,
}: {
  entryId: string;
  reactions: Reaction[];
  myProfileId: string;
  onSetReaction: (entryId: string, emoji: string) => void;
  onRemoveReaction: (entryId: string) => void;
}) {
  const mine = reactions.find((r) => r.profileId === myProfileId)?.emoji;
  const counts: Record<string, number> = {};
  reactions.forEach((r) => {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1;
  });

  return (
    <div className="flex gap-1.5 mt-2">
      {REACTION_EMOJIS.map((emoji) => {
        const active = mine === emoji;
        const count = counts[emoji] || 0;
        return (
          <button
            key={emoji}
            onClick={() => (active ? onRemoveReaction(entryId) : onSetReaction(entryId, emoji))}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-sans border tap-shrink"
            style={{
              background: active ? "rgba(255,201,60,0.16)" : "var(--bg-elev-2)",
              borderColor: active ? "var(--amber-deep)" : "var(--border)",
            }}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="text-[10.5px] text-text-dim font-semibold">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Feed({
  entries,
  profiles,
  myProfileId,
  reactionsByEntry,
  onDelete,
  onSetReaction,
  onRemoveReaction,
}: {
  entries: Entry[];
  profiles: Profile[];
  myProfileId: string;
  reactionsByEntry: Record<string, Reaction[]>;
  onDelete: (entry: Entry) => void;
  onSetReaction: (entryId: string, emoji: string) => void;
  onRemoveReaction: (entryId: string) => void;
}) {
  const [openPhotoIds, setOpenPhotoIds] = useState<Record<string, boolean>>({});
  const lastYear = onThisDayLastYear(entries);

  return (
    <div>
      {lastYear && (
        <div className="mb-3.5 rounded-2xl px-3.5 py-3 border border-border" style={{ background: "linear-gradient(120deg, rgba(255,201,60,0.12) 0%, rgba(255,166,48,0.04) 100%)" }}>
          <div className="text-[12.5px] font-sans text-text">
            📅 <strong>Un anno fa oggi</strong> il gruppo ha bevuto {lastYear.count} {lastYear.count === 1 ? "birra" : "birre"} ({fmtInt(lastYear.ml)} ml, +{fmtInt(lastYear.points)} pt) 👀
          </div>
        </div>
      )}
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
              <div key={e.id} className="bg-bg-elev border border-border rounded-2xl p-3 card-shadow">
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
                <ReactionBar
                  entryId={e.id}
                  reactions={reactionsByEntry[e.id] || []}
                  myProfileId={myProfileId}
                  onSetReaction={onSetReaction}
                  onRemoveReaction={onRemoveReaction}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
