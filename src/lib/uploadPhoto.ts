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
