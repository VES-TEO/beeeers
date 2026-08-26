"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Entry, GalleryItem, Profile } from "@/lib/types";

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
