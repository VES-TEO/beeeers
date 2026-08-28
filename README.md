# BEEEEERS 🍺

App web di gruppo per tracciare chi beve cosa: classifica, streak, birre
"calde" a punti doppi, diario fotografico, Hall of Fame e notifiche push
vere quando qualcuno "vive in un vulcano".

Ricostruzione come app reale (Next.js + Firebase) del prototipo Claude
Artifact allegato come specifica funzionale/visiva (`BEEEEERS-reference.jsx`).

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **Firebase Auth** — login con email/password o numero di telefono
- **Firestore** — profili, birre registrate, galleria; letto in realtime con
  `onSnapshot` (niente pulsante "sincronizza": la classifica si aggiorna da
  sola, come WhatsApp)
- **Firebase Storage** — foto profilo, foto prova birra, foto Hall of Fame
- **Firebase Cloud Messaging + Cloud Functions** — quando una birra è
  segnata come "calda", una Cloud Function (`functions/src/index.ts`) invia
  una notifica push a tutti gli altri membri, anche ad app chiusa
- **Deploy**: frontend su Vercel, regole/funzioni su Firebase

## Come iniziare

Se non hai mai configurato Firebase, segui **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**
passo passo — copre la creazione del progetto, l'attivazione di
Authentication/Firestore/Storage/Cloud Messaging, il deploy delle regole di
sicurezza e della Cloud Function, e il deploy su Vercel.

Riassunto rapido una volta che `.env.local` è configurato:

```bash
npm install
npm run dev
```

## Struttura del progetto

```
src/
  app/                    # route Next.js (App Router)
    page.tsx              # entry point: login / completa profilo / app
    login/page.tsx         # form email+password e telefono+OTP
    firebase-messaging-sw.js/route.ts  # service worker FCM generato a runtime
  components/             # UI (Classifica, Feed, HallOfFame, modali, ecc.)
  hooks/                  # AuthProvider, listener Firestore, notifiche push
  lib/                    # client Firebase, tipi, azioni di scrittura, utils
functions/                # Cloud Function: push "birra calda" -> tutti gli altri
firestore.rules           # solo il proprietario scrive i propri dati
storage.rules              # foto isolate per uid del proprietario
```

## Modello dati (Firestore)

- `users/{uid}` — `{ name, photoURL, email, phoneNumber, createdAt }`
  - `users/{uid}/fcmTokens/{token}` — token dei dispositivi per le push
- `entries/{id}` — `{ profileId, ml, points, doubled, warm, photoURL, createdAt }`
  - `entries/{id}/reactions/{uid}` — una reazione emoji per persona
- `gallery/{id}` — `{ profileId, caption, mediaURL, mediaType: "image"|"video", createdAt }`

Punti = ml bevuti, raddoppiati se in streak di 2+ giorni consecutivi,
raddoppiati di nuovo se la birra era "calda" (quindi x4 se entrambe).

## Note

- L'autenticazione via telefono richiede il piano Blaze (comunque nella
  quota gratuita per un uso di gruppo) — vedi FIREBASE_SETUP.md.
