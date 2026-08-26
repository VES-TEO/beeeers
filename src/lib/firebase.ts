"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

// All values come from NEXT_PUBLIC_* env vars — see .env.local.example and
// FIREBASE_SETUP.md for where to find each one in the Firebase console.
//
// The "beeeeers-dev-placeholder" fallbacks below only matter when those vars
// are missing entirely (e.g. `next build` with no .env.local, or a CI lint
// step run without secrets): they let the SDK initialize instead of
// crashing the build with `auth/invalid-api-key`, since Firebase validates
// the config shape as soon as getAuth()/getFirestore() run. A real deploy
// always has the real values set, which simply take over instead.
const missingEnv = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
if (missingEnv && typeof window !== "undefined") {
  console.warn(
    "[BEEEEERS] Variabili Firebase mancanti: sto usando una configurazione fittizia. Configura .env.local — vedi FIREBASE_SETUP.md."
  );
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBEEEEERSDEVPLACEHOLDERKEY000",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "beeeeers-dev-placeholder.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "beeeeers-dev-placeholder",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "beeeeers-dev-placeholder.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
};

export const firebaseApp: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);

// Messaging only works in the browser, over HTTPS (or localhost), and not in
// every browser (no Safari support for a long time, no support in some
// embedded webviews) — so it must be created lazily and defensively.
let messagingPromise: Promise<Messaging | null> | null = null;
export function getMessagingIfSupported(): Promise<Messaging | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((ok) => (ok ? getMessaging(firebaseApp) : null))
      .catch(() => null);
  }
  return messagingPromise;
}

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
