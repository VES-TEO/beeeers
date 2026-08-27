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

const TOP_RANK_TITLES = [
  "Il Barone della Birra",
  "Sua Maestà del Boccale",
  "Il Doge del Luppolo",
  "Campione Indiscusso",
  "Il Patriarca della Schiuma",
  "Sua Eccellenza Alcolica",
];
const LAST_RANK_TITLES = [
  "Lo Scoiattolo Lento",
  "Il Sorseggiatore Timido",
  "L'Apprendista della Botte",
  "Il Cauto",
  "Ultimo per Scelta (forse)",
  "Il Filosofo del Bicchiere Mezzo Pieno",
];

/** Same nickname all day, rotates daily — cheap and deterministic without any storage. */
function dailyPick<T>(list: readonly T[]): T {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return list[dayOfYear % list.length];
}

export function topRankTitle(): string {
  return dailyPick(TOP_RANK_TITLES);
}

export function lastRankTitle(): string {
  return dailyPick(LAST_RANK_TITLES);
}

/** Group-wide stats for this exact calendar day one year ago, or null if nobody drank that day. */
export function onThisDayLastYear(
  entries: { ml: number; points: number; createdAt: Timestamp | null }[]
): { count: number; ml: number; points: number } | null {
  const now = new Date();
  const target = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const targetStr = dayStr(target);
  const matches = entries.filter((e) => e.createdAt && dayStr(tsToDate(e.createdAt)) === targetStr);
  if (matches.length === 0) return null;
  return {
    count: matches.length,
    ml: matches.reduce((s, e) => s + e.ml, 0),
    points: matches.reduce((s, e) => s + e.points, 0),
  };
}

export interface Badge {
  emoji: string;
  label: string;
  achieved: boolean;
}

/** Milestone badges computed purely client-side from this profile's own entries — no extra reads or writes. */
export function computeBadges(
  profileId: string,
  entries: { profileId: string; ml: number; warm: boolean; createdAt: Timestamp | null }[]
): Badge[] {
  const mine = entries.filter((e) => e.profileId === profileId);
  const count = mine.length;
  const totalMl = mine.reduce((s, e) => s + e.ml, 0);
  const warmCount = mine.filter((e) => e.warm).length;
  const streak = activeStreakLength(profileId, entries);
  const nightOwl = mine.some((e) => e.createdAt && tsToDate(e.createdAt).getHours() < 5);

  return [
    { emoji: "🍺", label: "Debuttante — 10 birre", achieved: count >= 10 },
    { emoji: "🍻", label: "Habitué — 50 birre", achieved: count >= 50 },
    { emoji: "🏆", label: "Leggenda — 100 birre", achieved: count >= 100 },
    { emoji: "💧", label: "Idratato — 10 L totali", achieved: totalMl >= 10_000 },
    { emoji: "🌊", label: "Cisterna — 50 L totali", achieved: totalMl >= 50_000 },
    { emoji: "🔥", label: "In fiamme — streak di 3+ giorni", achieved: streak >= 3 },
    { emoji: "🔥🔥", label: "Piromane — streak di 7+ giorni", achieved: streak >= 7 },
    { emoji: "🌋", label: "Vulcanico — 5 birre calde", achieved: warmCount >= 5 },
    { emoji: "🦉", label: "Nottambulo — birra dopo mezzanotte", achieved: nightOwl },
  ];
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
