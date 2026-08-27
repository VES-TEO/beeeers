import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import { compressImage, uid } from "./utils";

/**
 * Compresses an image client-side and uploads it to Firebase Storage under
 * `folder/{ownerUid}/random.jpg`, returning its public download URL. The
 * ownerUid segment lets storage.rules verify a user can only write into
 * their own folder.
 */
export async function uploadPhoto(
  file: File,
  folder: "profiles" | "entries" | "gallery",
  ownerUid: string,
  maxDim: number,
  quality: number
): Promise<string> {
  const blob = await compressImage(file, maxDim, quality);
  const path = `${folder}/${ownerUid}/${uid()}.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });
  return getDownloadURL(storageRef);
}

const MAX_VIDEO_BYTES = 45 * 1024 * 1024;

function extensionFromFile(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  const fromType = file.type.split("/")[1];
  return fromType || "mp4";
}

/**
 * Hall of Fame media can be a photo or a short video. Photos go through the
 * same client-side compression as everywhere else; videos can't be
 * re-encoded in the browser, so they're uploaded as-is (capped at
 * MAX_VIDEO_BYTES — storage.rules enforces the same limit server-side).
 */
export async function uploadGalleryMedia(
  file: File,
  ownerUid: string
): Promise<{ url: string; mediaType: "image" | "video" }> {
  if (file.type.startsWith("video/")) {
    if (file.size > MAX_VIDEO_BYTES) throw new Error("VIDEO_TOO_LARGE");
    const path = `gallery/${ownerUid}/${uid()}.${extensionFromFile(file)}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, { contentType: file.type || "video/mp4" });
    const url = await getDownloadURL(storageRef);
    return { url, mediaType: "video" };
  }
  const url = await uploadPhoto(file, "gallery", ownerUid, 640, 0.6);
  return { url, mediaType: "image" };
}
