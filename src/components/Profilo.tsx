"use client";

import { useRef } from "react";
import { Camera, LogOut } from "lucide-react";
import { Avatar } from "./Avatar";
import { currentYear, fmtDate, fmtInt } from "@/lib/utils";
import type { Entry, Profile } from "@/lib/types";

export function Profilo({
  myProfile,
  entries,
  onUpdatePhoto,
  onLogout,
  busy,
}: {
  myProfile: Profile;
  entries: Entry[];
  onUpdatePhoto: (file: File) => void;
  onLogout: () => void;
  busy: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const totalPoints = entries.reduce((s, e) => s + e.points, 0);
  const totalBeers = entries.length;
  const thisYear = entries.filter((e) => e.createdAt && e.createdAt.toDate().getFullYear() === currentYear());
  const yearPoints = thisYear.reduce((s, e) => s + e.points, 0);

  return (
    <div>
      <div className="flex flex-col items-center pt-2.5 pb-[18px]">
        <button className="relative bg-transparent border-none cursor-pointer" onClick={() => fileRef.current?.click()}>
          <Avatar profile={myProfile} size={72} />
          <div className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] rounded-full bg-amber flex items-center justify-center border-2 border-bg">
            <Camera size={12} color="#12100B" />
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpdatePhoto(f);
          }}
        />
        <div className="font-baloo font-bold text-[19px] text-text mt-2.5">
          {myProfile.name}
          {busy ? " …" : ""}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-[18px]">
        <div className="bg-bg-elev border border-border rounded-xl px-1.5 py-3 text-center">
          <div className="font-baloo font-extrabold text-[19px] text-text">{fmtInt(yearPoints)}</div>
          <div className="text-[10.5px] text-text-dim mt-[3px] font-sans">Punti {currentYear()}</div>
        </div>
        <div className="bg-bg-elev border border-border rounded-xl px-1.5 py-3 text-center">
          <div className="font-baloo font-extrabold text-[19px] text-text">{totalBeers}</div>
          <div className="text-[10.5px] text-text-dim mt-[3px] font-sans">Birre totali</div>
        </div>
        <div className="bg-bg-elev border border-border rounded-xl px-1.5 py-3 text-center">
          <div className="font-baloo font-extrabold text-[19px] text-text">{fmtInt(totalPoints)}</div>
          <div className="text-[10.5px] text-text-dim mt-[3px] font-sans">Punti totali</div>
        </div>
      </div>

      <div className="text-xs font-bold text-text-dim uppercase tracking-wider mb-2">Le tue ultime birre</div>
      {entries.length === 0 ? (
        <div className="bg-bg-elev border border-dashed border-border rounded-2xl px-4 py-[30px] flex flex-col items-center">
          <div className="font-sans text-[13.5px] text-text-dim">Non hai ancora registrato nulla.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.slice(0, 10).map((e) => (
            <div key={e.id} className="flex justify-between items-center bg-bg-elev border border-border rounded-[10px] px-3 py-[9px]">
              <span className="font-sans text-[13px] text-text">{fmtDate(e.createdAt)}</span>
              <span className="font-mono text-[12.5px] text-text-dim">
                {fmtInt(e.ml)} ml · +{fmtInt(e.points)} pt
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-[7px] mt-5 bg-transparent border border-border rounded-[10px] py-[11px] text-coral font-sans text-[13px] font-semibold"
      >
        <LogOut size={14} /> Esci dal profilo
      </button>
    </div>
  );
}
