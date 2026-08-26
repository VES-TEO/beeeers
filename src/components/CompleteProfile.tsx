"use client";

import { useRef, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Camera } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { photoErrorMessage } from "@/lib/utils";
import { CircularLogo } from "./CircularLogo";

/** Shown right after sign-up / first sign-in: Firebase Auth has a user but no
 * Firestore `users/{uid}` doc yet, so we collect the display name + avatar
 * the rest of the app needs. */
export function CompleteProfile() {
  const [name, setName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    const user = auth.currentUser;
    if (!user || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const photoURL = photoFile ? await uploadPhoto(photoFile, "profiles", user.uid, 240, 0.7) : null;
      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        photoURL,
        email: user.email,
        phoneNumber: user.phoneNumber,
        createdAt: serverTimestamp(),
      });
      // AuthProvider's onSnapshot picks up the new doc and swaps this screen
      // out automatically.
    } catch (e) {
      setError(photoErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen max-w-[400px] mx-auto flex flex-col items-center justify-center px-6 py-10 bg-bg">
      <div className="mb-3 flex justify-center">
        <CircularLogo size={90} />
      </div>
      <p className="text-text-dim text-[13.5px] font-sans mb-6 text-center">Un ultimo passo prima di entrare</p>

      <div className="w-full bg-bg-elev border border-border rounded-2xl p-5">
        <div className="flex justify-center mb-3.5">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-[76px] h-[76px] rounded-full bg-bg-elev-2 border-2 border-dashed border-amber flex items-center justify-center overflow-hidden"
          >
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="anteprima" className="w-full h-full object-cover rounded-full" />
            ) : (
              <Camera size={22} color="var(--amber)" />
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhoto} />
        </div>

        <label className="block text-[11.5px] text-text-dim uppercase tracking-wider mb-1.5 mt-3.5 font-bold font-sans">
          Il tuo nome
        </label>
        <input
          type="text"
          placeholder="es. Marco"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full box-border bg-bg-elev-2 border border-border rounded-[10px] text-text font-sans text-[14.5px] px-3.5 py-2.5 outline-none focus:border-amber"
        />

        {error && (
          <div className="mt-3 text-[12.5px] font-sans text-coral bg-[rgba(255,93,115,0.1)] border border-[rgba(255,93,115,0.3)] rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          disabled={!name.trim() || busy}
          onClick={submit}
          className="w-full mt-4 rounded-xl py-3 font-fredoka text-[15.5px] font-bold text-[#12100B] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--amber) 0%, var(--amber-deep) 100%)" }}
        >
          {busy ? "Un attimo…" : "Entra nel gruppo 🍺"}
        </button>
      </div>
    </div>
  );
}
