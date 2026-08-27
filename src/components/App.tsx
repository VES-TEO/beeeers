"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";
import { useEntries, useGallery, useProfiles, useReactions } from "@/hooks/useFirestoreData";
import { useNotifications } from "@/hooks/useNotifications";
import { addGalleryEntry, deleteEntry, deleteGalleryEntry, logBeer, removeReaction, setReaction, updateMyPhoto } from "@/lib/actions";
import { signOutUser } from "@/lib/auth";
import { playGlug } from "@/lib/sound";
import { activeStreakLength, currentYear, dayStr, streakBeforeToday } from "@/lib/utils";
import type { Entry, GalleryItem } from "@/lib/types";

import { TopHeader } from "./TopHeader";
import { BottomNav } from "./BottomNav";
import { BeerGlassIcon } from "./BeerGlassIcon";
import { Classifica, type LeaderboardRow } from "./Classifica";
import { Feed } from "./Feed";
import { HallOfFame } from "./HallOfFame";
import { Profilo } from "./Profilo";
import { LogBeerModal } from "./LogBeerModal";
import { VolcanoPopup } from "./VolcanoPopup";
import { LeaderChangePopup } from "./LeaderChangePopup";
import { Toast } from "./Toast";

export type Tab = "classifica" | "feed" | "hof" | "profilo";

export function App() {
  const { user, profile, loading } = useAuth();
  const profiles = useProfiles();
  const { entries, loading: entriesLoading } = useEntries();
  const gallery = useGallery();
  const reactionsByEntry = useReactions();
  const { status: notifStatus, enableNotifications } = useNotifications(profile?.id ?? null);

  const [tab, setTab] = useState<Tab>("classifica");
  const [showLog, setShowLog] = useState(false);
  const [year, setYear] = useState(currentYear());
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [volcanoEntry, setVolcanoEntry] = useState<Entry | null>(null);
  const [newLeaderName, setNewLeaderName] = useState<string | null>(null);

  // Tracks warm-beer entries we've already surfaced a volcano popup for, so a
  // realtime update doesn't repeat one. Seeded on first load (no popups for
  // history already in Firestore), then grows as new warm entries stream in.
  const seenWarmIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (entriesLoading || !profile) return;
    const warmEntries = entries.filter((e) => e.warm);
    if (seenWarmIdsRef.current === null) {
      seenWarmIdsRef.current = new Set(warmEntries.map((e) => e.id));
      return;
    }
    const seen = seenWarmIdsRef.current;
    const unseen = warmEntries.filter((e) => !seen.has(e.id));
    if (unseen.length > 0) {
      const newest = unseen.sort(
        (a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
      )[0];
      setVolcanoEntry(newest);
    }
    warmEntries.forEach((e) => seen.add(e.id));
  }, [entries, entriesLoading, profile]);

  // #1 of the *current* year's leaderboard, independent of whichever year the
  // viewer currently has selected in the year filter.
  const currentYearTopId = useMemo(() => {
    const cy = currentYear();
    const points: Record<string, number> = {};
    entries.forEach((e) => {
      if (e.createdAt && e.createdAt.toDate().getFullYear() === cy) {
        points[e.profileId] = (points[e.profileId] || 0) + e.points;
      }
    });
    let topId: string | null = null;
    let topPoints = 0;
    Object.entries(points).forEach(([id, pts]) => {
      if (pts > topPoints) {
        topPoints = pts;
        topId = id;
      }
    });
    return topId;
  }, [entries]);

  // Fires the confetti + F1 car celebration for everyone watching whenever the
  // #1 spot changes hands — seeded (no popup) on first load so existing
  // standings don't "announce" themselves the moment the app opens.
  const prevLeaderIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (entriesLoading || !profile) return;
    if (prevLeaderIdRef.current === undefined) {
      prevLeaderIdRef.current = currentYearTopId;
      return;
    }
    if (currentYearTopId && currentYearTopId !== prevLeaderIdRef.current) {
      const leader = profiles.find((p) => p.id === currentYearTopId);
      if (leader) setNewLeaderName(leader.name);
    }
    prevLeaderIdRef.current = currentYearTopId;
  }, [currentYearTopId, entriesLoading, profile, profiles]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), msg.length > 60 ? 5000 : 2200);
  };

  const years = useMemo(() => {
    const s = new Set(entries.map((e) => (e.createdAt ? e.createdAt.toDate().getFullYear() : currentYear())));
    s.add(currentYear());
    return Array.from(s).sort((a, b) => b - a);
  }, [entries]);

  const yearEntries = useMemo(
    () => entries.filter((e) => e.createdAt && e.createdAt.toDate().getFullYear() === year),
    [entries, year]
  );

  const streakMap = useMemo(() => {
    const m: Record<string, number> = {};
    profiles.forEach((p) => {
      m[p.id] = activeStreakLength(p.id, entries);
    });
    return m;
  }, [profiles, entries]);

  const warmTodayMap = useMemo(() => {
    const m: Record<string, boolean> = {};
    const today = dayStr(new Date());
    entries.forEach((e) => {
      if (e.warm && e.createdAt && dayStr(e.createdAt.toDate()) === today) m[e.profileId] = true;
    });
    return m;
  }, [entries]);

  const myStreakActive = profile ? streakBeforeToday(profile.id, entries) >= 2 : false;

  const glassFillPct = useMemo(() => {
    if (profiles.length === 0) return 0;
    const today = dayStr(new Date());
    const activeToday = new Set(
      entries.filter((e) => e.createdAt && dayStr(e.createdAt.toDate()) === today).map((e) => e.profileId)
    );
    const pct = (activeToday.size / profiles.length) * 100;
    return activeToday.size > 0 ? Math.max(pct, 10) : 0;
  }, [profiles, entries]);

  const leaderboard: LeaderboardRow[] = useMemo(() => {
    const byProfile: Record<string, { points: number; count: number }> = {};
    yearEntries.forEach((e) => {
      if (!byProfile[e.profileId]) byProfile[e.profileId] = { points: 0, count: 0 };
      byProfile[e.profileId].points += e.points;
      byProfile[e.profileId].count += 1;
    });
    return profiles
      .map((p) => ({ profile: p, points: byProfile[p.id]?.points || 0, count: byProfile[p.id]?.count || 0 }))
      .sort((a, b) => b.points - a.points);
  }, [profiles, yearEntries]);

  if (loading || entriesLoading || !profile || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 size={26} color="var(--amber)" className="spin" />
      </div>
    );
  }

  const handleLogBeer = async ({ ml, photoFile, warm }: { ml: number; photoFile: File; warm: boolean }) => {
    setBusy(true);
    try {
      const { points, doubled } = await logBeer({ profileId: profile.id, ml, photoFile, warm, currentEntries: entries });
      setShowLog(false);
      playGlug();
      const bonusMsg =
        doubled && warm
          ? "🔥♨️ Streak + birra calda: x4!"
          : doubled
          ? "🔥 Streak! Punti doppi"
          : warm
          ? "♨️ Birra calda: punti doppi"
          : "Birra registrata";
      showToast(`${bonusMsg} — +${Math.round(points).toLocaleString("it-IT")} pt 🍺`);
    } catch {
      showToast("Errore nel registrare la birra, riprova");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteEntry = async (entry: Entry) => {
    try {
      await deleteEntry(entry);
    } catch {
      showToast("Errore durante l'eliminazione");
    }
  };

  const handleSetReaction = async (entryId: string, emoji: string) => {
    try {
      await setReaction(entryId, profile.id, emoji);
    } catch {
      showToast("Errore nel salvare la reazione");
    }
  };

  const handleRemoveReaction = async (entryId: string) => {
    try {
      await removeReaction(entryId, profile.id);
    } catch {
      showToast("Errore nel rimuovere la reazione");
    }
  };

  const handleAddGallery = async ({ caption, mediaFile }: { caption: string; mediaFile: File }) => {
    setBusy(true);
    try {
      await addGalleryEntry({ profileId: profile.id, caption, mediaFile });
      showToast("Aggiunto alla Hall of Fame 💀");
    } catch (e) {
      const msg =
        e instanceof Error && e.message === "VIDEO_TOO_LARGE"
          ? "Il video è troppo grande (max 45 MB circa), prova ad accorciarlo."
          : "Non sono riuscito a caricare questo file, riprova con un altro.";
      showToast(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteGallery = async (item: GalleryItem) => {
    try {
      await deleteGalleryEntry(item.id, item.mediaURL);
    } catch {
      showToast("Errore durante l'eliminazione");
    }
  };

  const handleUpdatePhoto = async (file: File) => {
    setBusy(true);
    try {
      await updateMyPhoto(profile.id, file);
      showToast("Foto profilo aggiornata");
    } catch {
      showToast("Non sono riuscito a caricare questa foto, riprova con un'altra.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <TopHeader myProfile={profile} notifStatus={notifStatus} onEnableNotifications={enableNotifications} />

      <div className="px-4 pt-4">
        {tab === "classifica" && (
          <Classifica
            leaderboard={leaderboard}
            years={years}
            year={year}
            setYear={setYear}
            myProfileId={profile.id}
            streakMap={streakMap}
            warmMap={warmTodayMap}
          />
        )}
        {tab === "feed" && (
          <Feed
            entries={entries}
            profiles={profiles}
            myProfileId={profile.id}
            reactionsByEntry={reactionsByEntry}
            onDelete={handleDeleteEntry}
            onSetReaction={handleSetReaction}
            onRemoveReaction={handleRemoveReaction}
          />
        )}
        {tab === "hof" && (
          <HallOfFame
            gallery={gallery}
            profiles={profiles}
            myProfileId={profile.id}
            onAdd={handleAddGallery}
            onDelete={handleDeleteGallery}
            busy={busy}
          />
        )}
        {tab === "profilo" && (
          <Profilo
            myProfile={profile}
            entries={entries.filter((e) => e.profileId === profile.id)}
            onUpdatePhoto={handleUpdatePhoto}
            onLogout={() => signOutUser()}
            busy={busy}
          />
        )}
      </div>

      <button
        onClick={() => setShowLog(true)}
        aria-label="Registra una birra"
        className="fixed bottom-[74px] left-1/2 -translate-x-1/2 w-14 h-[62px] rounded-[8px_8px_20px_20px] bg-white/[0.06] border-2 border-white/30 flex items-center justify-center overflow-hidden z-30 p-0"
        style={{ animation: "fabPulse 2.6s ease-in-out infinite" }}
      >
        <BeerGlassIcon fillPct={glassFillPct} />
      </button>

      <BottomNav tab={tab} setTab={setTab} />

      {showLog && (
        <LogBeerModal onClose={() => setShowLog(false)} onSave={handleLogBeer} busy={busy} streakActive={myStreakActive} />
      )}
      {toast && <Toast message={toast} />}
      {volcanoEntry && (
        <VolcanoPopup
          profile={profiles.find((p) => p.id === volcanoEntry.profileId)}
          onClose={() => setVolcanoEntry(null)}
        />
      )}
      {newLeaderName && <LeaderChangePopup leaderName={newLeaderName} onClose={() => setNewLeaderName(null)} />}
    </div>
  );
}
