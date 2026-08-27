"use client";

import { useRef, useState } from "react";
import { Camera, Check, X } from "lucide-react";
import { QUICK_SIZES } from "@/lib/types";
import { fmtInt } from "@/lib/utils";

export function LogBeerModal({
  onClose,
  onSave,
  busy,
  streakActive,
}: {
  onClose: () => void;
  onSave: (payload: { ml: number; photoFile: File; warm: boolean }) => void;
  busy: boolean;
  streakActive: boolean;
}) {
  const [ml, setMl] = useState(330);
  const [customMl, setCustomMl] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [warm, setWarm] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const finalMl = useCustom ? parseInt(customMl, 10) || 0 : ml;
  const multiplier = (streakActive ? 2 : 1) * (warm ? 2 : 1);
  const finalPoints = finalMl * multiplier;
  const canSave = finalMl > 0 && photoFile && !busy;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-elev rounded-t-[20px] px-5 pt-[18px] pb-[26px] w-full max-w-[480px] shadow-[0_-8px_30px_rgba(0,0,0,0.4)] max-h-[88vh] overflow-y-auto box-border border border-border border-b-0"
      >
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-baloo font-bold text-[17px] text-text">Registra una birra 🍺</span>
          <button onClick={onClose} className="bg-transparent border-none text-text-dim p-1.5 rounded-md">
            <X size={16} />
          </button>
        </div>

        {streakActive && (
          <div
            className="rounded-[10px] px-3 py-[9px] text-[12.5px] font-semibold text-amber font-sans mb-1"
            style={{ background: "linear-gradient(120deg, rgba(255,93,115,0.16) 0%, rgba(255,166,48,0.1) 100%)", border: "1px solid rgba(255,166,48,0.3)" }}
          >
            🔥 Sei in streak da 2+ giorni: questa birra vale il doppio!
          </div>
        )}

        <label className="block text-[11.5px] text-text-dim uppercase tracking-wider mb-1.5 mt-3.5 font-bold font-sans">Quanto hai bevuto?</label>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_SIZES.map((s) => (
            <button
              key={s.label}
              onClick={() => {
                setUseCustom(false);
                setMl(s.ml);
              }}
              className={`border rounded-[10px] px-1 py-2.5 text-center font-sans text-[12.5px] ${
                !useCustom && ml === s.ml ? "bg-amber border-amber text-[#12100B]" : "bg-bg-elev-2 border-border text-text-dim"
              }`}
            >
              <div className="font-bold">{s.ml} ml</div>
              <div className="text-[10.5px] opacity-75">{s.label}</div>
            </button>
          ))}
          <button
            onClick={() => setUseCustom(true)}
            className={`border rounded-[10px] px-1 py-2.5 text-center font-sans text-[12.5px] ${
              useCustom ? "bg-amber border-amber text-[#12100B]" : "bg-bg-elev-2 border-border text-text-dim"
            }`}
          >
            <div className="font-bold">Altro</div>
          </button>
        </div>
        {useCustom && (
          <input
            type="number"
            placeholder="ml bevuti"
            value={customMl}
            onChange={(e) => setCustomMl(e.target.value)}
            className="w-full box-border bg-bg-elev-2 border border-border rounded-[10px] text-text font-sans text-[14.5px] px-3.5 py-2.5 outline-none mt-2"
          />
        )}

        <button
          onClick={() => setWarm((w) => !w)}
          className={`w-full flex justify-between items-center mt-3.5 border rounded-[10px] px-3.5 py-[11px] font-sans text-[13.5px] font-semibold text-text box-border ${
            warm ? "border-amber-deep" : "border-border"
          }`}
          style={{ background: warm ? "rgba(255,166,48,0.14)" : "var(--bg-elev-2)" }}
        >
          <span>♨️ Era calda?</span>
          <span className="text-xs text-text-dim font-semibold">{warm ? "Sì — punti doppi" : "No"}</span>
        </button>

        <label className="block text-[11.5px] text-text-dim uppercase tracking-wider mb-1.5 mt-3.5 font-bold font-sans">Foto prova</label>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full h-[140px] rounded-xl border-2 border-dashed border-border bg-bg-elev-2 flex items-center justify-center overflow-hidden box-border"
        >
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="anteprima" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-amber">
              <Camera size={22} />
              <span className="text-[12.5px] font-sans">Scatta o carica una foto</span>
            </div>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

        <button
          disabled={!canSave}
          onClick={() => photoFile && onSave({ ml: finalMl, photoFile, warm })}
          className="w-full mt-5 rounded-xl py-[13px] font-baloo text-[15.5px] font-bold text-[#12100B] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--amber) 0%, var(--amber-deep) 100%)" }}
        >
          {busy ? (
            "Registro…"
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <Check size={16} /> Conferma (+{fmtInt(finalPoints)} pt{multiplier > 1 ? ` ×${multiplier}` : ""})
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
