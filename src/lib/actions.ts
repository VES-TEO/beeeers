import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "./firebase";
import { uploadGalleryMedia, uploadPhoto } from "./uploadPhoto";
import { streakBeforeToday } from "./utils";
import type { Entry } from "./types";

async function deletePhotoQuiet(url: string | null | undefined) {
  if (!url) return;
  try {
    await deleteObject(ref(storage, url));
  } catch {
    // best-effort: an already-missing object or a permissions edge case
    // shouldn't block the user from deleting their own record
  }
}

export async function logBeer({
  profileId,
  ml,
  photoFile,
  warm,
  currentEntries,
}: {
  profileId: string;
  ml: number;
  photoFile: File;
  warm: boolean;
  currentEntries: Entry[];
}) {
  const photoURL = await uploadPhoto(photoFile, "entries", profileId, 640, 0.6);
  const streak = streakBeforeToday(profileId, currentEntries);
  const doubled = streak >= 2;
  let multiplier = 1;
  if (doubled) multiplier *= 2;
  if (warm) multiplier *= 2;
  const points = ml * multiplier;
  await addDoc(collection(db, "entries"), {
    profileId,
    ml,
    points,
    doubled,
    warm: !!warm,
    photoURL,
    createdAt: serverTimestamp(),
  });
  return { points, doubled };
}

export async function deleteEntry(entry: Entry) {
  await deleteDoc(doc(db, "entries", entry.id));
  await deletePhotoQuiet(entry.photoURL);
}

export async function addGalleryEntry({
  profileId,
  caption,
  mediaFile,
}: {
  profileId: string;
  caption: string;
  mediaFile: File;
}) {
  const { url, mediaType } = await uploadGalleryMedia(mediaFile, profileId);
  await addDoc(collection(db, "gallery"), {
    profileId,
    caption: caption || "",
    mediaURL: url,
    mediaType,
    createdAt: serverTimestamp(),
  });
}

export async function deleteGalleryEntry(id: string, mediaURL: string | null | undefined) {
  await deleteDoc(doc(db, "gallery", id));
  await deletePhotoQuiet(mediaURL);
}

export async function updateMyPhoto(profileId: string, photoFile: File) {
  const photoURL = await uploadPhoto(photoFile, "profiles", profileId, 240, 0.7);
  await updateDoc(doc(db, "users", profileId), { photoURL });
}
