"use client";

import { useRef, useState } from "react";
import { Camera, Video, X } from "lucide-react";

export function AddMemoryModal({
  onClose,
  onSave,
  busy,
}: {
  onClose: () => void;
  onSave: (payload: { caption: string; mediaFile: File }) => void;
  busy: boolean;
}) {
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isVideo = mediaFile?.type.startsWith("video/") ?? false;

  const handleMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMediaFile(f);
    setMediaPreview(URL.createObjectURL(f));
  };

  const canSave = !!mediaFile && !busy;

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

        <label className="block text-[11.5px] text-text-dim uppercase tracking-wider mb-1.5 mt-3.5 font-bold font-sans">
          La foto (o il video) della vergogna
        </label>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full h-[140px] rounded-xl border-2 border-dashed border-border bg-bg-elev-2 flex items-center justify-center overflow-hidden box-border"
        >
          {mediaPreview ? (
            isVideo ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={mediaPreview} className="w-full h-full object-cover rounded-xl" muted playsInline controls />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaPreview} alt="anteprima" className="w-full h-full object-cover rounded-xl" />
            )
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-amber">
              <div className="flex gap-2">
                <Camera size={22} />
                <Video size={22} />
              </div>
              <span className="text-[12.5px] font-sans">Scatta/carica una foto o un video</span>
            </div>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleMedia} />
        <p className="text-[11px] text-text-dim mt-1.5 font-sans">I video sono limitati a 45 MB circa.</p>

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
          onClick={() => mediaFile && onSave({ caption, mediaFile })}
          className="w-full mt-5 rounded-xl py-[13px] font-baloo text-[15.5px] font-bold text-[#12100B] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--amber) 0%, var(--amber-deep) 100%)" }}
        >
          {busy ? "Carico…" : "Aggiungi alla Hall of Fame"}
        </button>
      </div>
    </div>
  );
}
