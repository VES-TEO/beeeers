"use client";

import { useEffect, useState } from "react";
import { collection, collectionGroup, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Entry, GalleryItem, Profile, Reaction } from "@/lib/types";

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => {
      setProfiles(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Profile));
    });
  }, []);
  return profiles;
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // The group's whole history, newest first — 2000 caps a runaway read on a
    // very old/active group while comfortably covering normal usage.
    const q = query(collection(db, "entries"), orderBy("createdAt", "desc"), limit(2000));
    return onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Entry));
      setLoading(false);
    });
  }, []);
  return { entries, loading };
}

export function useGallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"), limit(300));
    return onSnapshot(q, (snap) => {
      setGallery(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GalleryItem));
    });
  }, []);
  return gallery;
}

/** Every diary-entry reaction across the whole group, grouped by entryId — one
 * collectionGroup listener instead of one listener per rendered entry. */
export function useReactions() {
  const [byEntry, setByEntry] = useState<Record<string, Reaction[]>>({});
  useEffect(() => {
    const q = query(collectionGroup(db, "reactions"), limit(5000));
    return onSnapshot(q, (snap) => {
      const grouped: Record<string, Reaction[]> = {};
      snap.docs.forEach((d) => {
        const r = d.data() as Reaction;
        if (!grouped[r.entryId]) grouped[r.entryId] = [];
        grouped[r.entryId].push(r);
      });
      setByEntry(grouped);
    });
  }, []);
  return byEntry;
}
