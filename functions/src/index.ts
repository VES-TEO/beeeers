import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();
setGlobalOptions({ region: "europe-west1", maxInstances: 5 });

interface EntryDoc {
  profileId: string;
  warm?: boolean;
  ml?: number;
  points?: number;
}

/**
 * Fires whenever a new beer is logged. If it was marked "calda" (warm), it
 * fans out a push notification — "🌋 [Nome] vive in un vulcano!" — to every
 * other member of the group, complete with the drinker's profile photo.
 * This is the piece the original localStorage-based prototype could never
 * do for real: a notification that reaches people even with the app closed.
 */
export const onWarmBeer = onDocumentCreated("entries/{entryId}", async (event) => {
  const snap = event.data;
  const entry = snap?.data() as EntryDoc | undefined;
  if (!entry || !entry.warm) return;

  const db = admin.firestore();

  const drinkerSnap = await db.collection("users").doc(entry.profileId).get();
  const drinker = drinkerSnap.data() as { name?: string; photoURL?: string } | undefined;
  const drinkerName = drinker?.name || "Qualcuno";

  const usersSnap = await db.collection("users").get();
  const otherUserDocs = usersSnap.docs.filter((d) => d.id !== entry.profileId);

  const tokens: string[] = [];
  await Promise.all(
    otherUserDocs.map(async (d) => {
      const tokensSnap = await d.ref.collection("fcmTokens").get();
      tokensSnap.forEach((t) => tokens.push(t.id));
    })
  );

  if (tokens.length === 0) {
    logger.info(`No devices to notify for warm beer by ${drinkerName}.`);
    return;
  }

  const message: admin.messaging.MulticastMessage = {
    notification: {
      title: `🌋 ${drinkerName} vive in un vulcano!`,
      body: "Ha appena bevuto una birra bollente — punti doppi ♨️",
      imageUrl: drinker?.photoURL || undefined,
    },
    data: {
      type: "warm_beer",
      profileId: entry.profileId,
      entryId: event.params.entryId,
    },
    webpush: {
      fcmOptions: { link: "/" },
      notification: { icon: drinker?.photoURL || "/icon-192.png" },
    },
    tokens,
  };

  const response = await admin.messaging().sendEachForMulticast(message);
  logger.info(`Warm beer push: ${response.successCount}/${tokens.length} delivered.`);

  // Prune tokens Firebase reports as dead so future sends don't keep retrying them.
  const staleTokens: string[] = [];
  response.responses.forEach((r, i) => {
    const code = r.error?.code;
    if (!r.success && (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token")) {
      staleTokens.push(tokens[i]);
    }
  });
  if (staleTokens.length > 0) {
    await Promise.all(
      otherUserDocs.flatMap((d) =>
        staleTokens.map((t) =>
          d.ref
            .collection("fcmTokens")
            .doc(t)
            .delete()
            .catch(() => {})
        )
      )
    );
  }
});
