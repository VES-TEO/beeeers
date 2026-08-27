import type { Timestamp } from "firebase/firestore";

export interface Profile {
  id: string; // == auth uid
  name: string;
  photoURL: string | null;
  email: string | null;
  phoneNumber: string | null;
  createdAt: Timestamp | null;
}

export interface Entry {
  id: string;
  profileId: string;
  ml: number;
  points: number;
  doubled: boolean; // streak bonus applied
  warm: boolean; // "birra calda" bonus applied
  photoURL: string;
  createdAt: Timestamp;
}

export interface GalleryItem {
  id: string;
  profileId: string;
  caption: string;
  mediaURL: string;
  mediaType: "image" | "video";
  createdAt: Timestamp;
}

export const QUICK_SIZES = [
  { label: "Lattina", ml: 330 },
  { label: "Bottiglia", ml: 330 },
  { label: "Pinta", ml: 400 },
  { label: "Mezzo litro", ml: 500 },
  { label: "Bottiglia 66cl", ml: 660 },
] as const;

export const AVATAR_COLORS = ["#FFC93C", "#FF5D73", "#6EE7B7", "#7DD3FC", "#C084FC", "#FDBA74"];
