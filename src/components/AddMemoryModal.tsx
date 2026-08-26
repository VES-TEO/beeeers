"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";

export function AddMemoryModal({
  onClose,
  onSave,
  busy,
}: {
  onClose: () => void;
  onSave: (payload: { caption: string; photoFile: File }) => void;
  busy: boolean;
}) {
  const [caption, setCaption] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const canSave = !!photoFile && !busy;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-elev rounded-t-[20px] px-5 pt-[18px] pb-[26px] w-full max-w-[480px] shadow-[0_-8px_30px_rgba(0,0,0,0.4)] max-h-[88vh] overflow-y-auto box-border border border-border border-b-0"
      >
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-baloo font-bold text-[17px] text-text">Nuovo ricordo 💀</span>
          <button onClick={onClose} className="bg-transparent border-none text-text-dim p-1.5 rounded-md">
            <X size={16} />
          </button>
        </div>

        <label className="block text-[11.5px] text-text-dim uppercase tracking-wider mb-1.5 mt-3.5 font-bold font-sans">La foto della vergogna</label>
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

        <label className="block text-[11.5px] text-text-dim uppercase tracking-wider mb-1.5 mt-3.5 font-bold font-sans">
          Racconta cos&apos;è successo (opzionale)
        </label>
        <input
          type="text"
          placeholder="es. Non ricordo più questa serata"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full box-border bg-bg-elev-2 border border-border rounded-[10px] text-text font-sans text-[14.5px] px-3.5 py-2.5 outline-none"
        />

        <button
          disabled={!canSave}
          onClick={() => photoFile && onSave({ caption, photoFile })}
          className="w-full mt-5 rounded-xl py-[13px] font-baloo text-[15.5px] font-bold text-[#12100B] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--amber) 0%, var(--amber-deep) 100%)" }}
        >
          {busy ? "Carico…" : "Aggiungi alla Hall of Fame"}
        </button>
      </div>
    </div>
  );
}
