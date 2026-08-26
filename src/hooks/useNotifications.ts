"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { db } from "@/lib/firebase";
import { getMessagingIfSupported, VAPID_KEY } from "@/lib/firebase";

export type NotifStatus = "unsupported" | "denied" | "default" | "granted";

/**
 * Manages the "push notifications" permission lifecycle: registers the
 * messaging service worker, requests permission, and stores the resulting
 * FCM token under users/{uid}/fcmTokens/{token} so the Cloud Function that
 * fans out "birra calda" alerts can find every device to notify.
 */
export function useNotifications(profileId: string | null) {
  const [status, setStatus] = useState<NotifStatus>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    setStatus(Notification.permission as NotifStatus);
  }, []);

  const registerToken = useCallback(async () => {
    if (!profileId) return;
    try {
      const messaging = await getMessagingIfSupported();
      if (!messaging || !VAPID_KEY) return;
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
      if (!token) return;
      await setDoc(doc(db, "users", profileId, "fcmTokens", token), {
        createdAt: serverTimestamp(),
        userAgent: navigator.userAgent,
      });
    } catch {
      // Permission race, unsupported browser, or a transient network error —
      // the button stays available so the user can retry.
    }
  }, [profileId]);

  const enableNotifications = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setStatus(permission as NotifStatus);
    if (permission === "granted") await registerToken();
  }, [registerToken]);

  // If permission was already granted in a previous visit, keep the token
  // fresh (tokens can rotate) without asking again.
  useEffect(() => {
    if (status === "granted") registerToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, profileId]);

  return { status, enableNotifications };
}
