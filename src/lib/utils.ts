import type { Timestamp } from "firebase/firestore";
import { AVATAR_COLORS } from "./types";

export function fmtInt(n: number) {
  return Math.round(n).toLocaleString("it-IT");
}

export function tsToDate(ts: Timestamp | null | undefined): Date {
  return ts ? ts.toDate() : new Date();
}

export function fmtDate(ts: Timestamp | null | undefined) {
  const d = tsToDate(ts);
  return (
    d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" }) +
    " · " +
    d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
  );
}

export function currentYear() {
  return new Date().getFullYear();
}

export function dayStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Consecutive days (not counting today) that this profile logged a beer, ending yesterday. */
export function streakBeforeToday(
  profileId: string,
  entries: { profileId: string; createdAt: Timestamp | null }[]
): number {
  const days = new Set(
    entries
      .filter((e) => e.profileId === profileId && e.createdAt)
      .map((e) => dayStr(tsToDate(e.createdAt)))
  );
  let count = 0;
  const d = new Date();
  d.setDate(d.getDate() - 1);
  while (days.has(dayStr(d))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

/** Length of the currently "alive" streak (ending today or yesterday) — drives the fire badge. */
export function activeStreakLength(
  profileId: string,
  entries: { profileId: string; createdAt: Timestamp | null }[]
): number {
  const days = new Set(
    entries
      .filter((e) => e.profileId === profileId && e.createdAt)
      .map((e) => dayStr(tsToDate(e.createdAt)))
  );
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  let anchor: Date | null = null;
  if (days.has(dayStr(today))) anchor = today;
  else if (days.has(dayStr(yesterday))) anchor = yesterday;
  if (!anchor) return 0;
  let count = 0;
  const d = new Date(anchor);
  while (days.has(dayStr(d))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

export function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function isHeicFile(file: File) {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  return type.includes("heic") || type.includes("heif") || name.endsWith(".heic") || name.endsWith(".heif");
}

/** Downscale + re-encode an image client-side before upload, to keep Storage usage and bandwidth low. */
export function compressImage(file: File, maxDim: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (isHeicFile(file)) {
      reject(new Error("HEIC_UNSUPPORTED"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("DECODE_FAILED"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("DECODE_FAILED"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("DECODE_FAILED"))),
          "image/jpeg",
          quality
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function photoErrorMessage(e: unknown) {
  if (e instanceof Error && e.message === "HEIC_UNSUPPORTED") {
    return 'Questa foto è in formato HEIC (tipico di iPhone) e il browser non riesce a leggerlo qui. Scegli "Usa foto originale" in JPEG dalla galleria, oppure fai uno screenshot della foto e carica quello.';
  }
  return "Non sono riuscito a caricare questa foto, riprova con un'altra.";
}
