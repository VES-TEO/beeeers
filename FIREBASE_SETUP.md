# Guida: creare e configurare il progetto Firebase per BEEEEERS

Questa guida presuppone che tu non abbia mai usato Firebase. Segui i passi
nell'ordine — ogni sezione dice esattamente dove cliccare.

## 1. Crea il progetto Firebase

1. Vai su **https://console.firebase.google.com** ed entra con il tuo account
   Google.
2. Clicca **"Aggiungi progetto"** (Add project).
3. Dai un nome al progetto, es. `beeeeers-app`. Firebase genererà un
   **Project ID** univoco (es. `beeeeers-app-a1b2c`) — annotalo, ti servirà.
4. Nella schermata successiva puoi disattivare Google Analytics (non serve
   per questa app). Clicca **"Crea progetto"** e aspetta che finisca.
5. Apri `.firebaserc` in questo repo e sostituisci `"beeeeers-app"` con il
   tuo vero Project ID.

## 2. Passa al piano Blaze (pay-as-you-go)

Le Cloud Functions (necessarie per le notifiche push) e l'autenticazione via
telefono richiedono il piano **Blaze**. Non preoccuparti: Firebase ha una
generosa quota gratuita mensile (2 milioni di invocazioni Cloud Functions,
10GB di storage, ecc.) — per un gruppo di amici non pagherai nulla, ma serve
comunque una carta di credito collegata.

1. In basso a sinistra nella console, clicca sul nome del piano attuale
   ("Spark") vicino al nome del progetto.
2. Scegli **"Blaze — Pay as you go"** e segui la procedura per collegare una
   carta.
3. (Consigliato) Imposta un **budget alert**: Console → ⚙️ Impostazioni
   progetto → Utilizzo e fatturazione → Dettagli e impostazioni → crea un
   budget da es. 5€/mese, così ricevi un'email se mai venisse superato.

## 3. Registra l'app web

1. Nella pagina principale del progetto, clicca l'icona **`</>`** ("Aggiungi
   app" → Web).
2. Dai un nickname all'app, es. `beeeeers-web`. **Non** serve spuntare
   "Configura anche Firebase Hosting" (usiamo Vercel).
3. Clicca **"Registra app"**. Ti mostrerà un blocco `firebaseConfig` con
   `apiKey`, `authDomain`, `projectId`, ecc. — copia questi valori, ti
   serviranno per il file `.env.local` (vedi sezione 8).

## 4. Attiva Firebase Authentication

1. Menu laterale → **Build → Authentication** → **"Get started"**.
2. Tab **"Sign-in method"** → clicca **"Email/Password"**, attiva il primo
   switch ("Email/Password"), salva.
3. Nella stessa pagina, clicca **"Phone"**, attivalo, salva. (Richiede il
   piano Blaze già attivato al passo 2.)
   - Firebase ti chiederà di configurare **domini autorizzati**: per
     sviluppo locale `localhost` è già incluso. Quando fai il deploy su
     Vercel, aggiungi qui il dominio Vercel (es.
     `tuo-progetto.vercel.app`) — Authentication → Settings →
     "Authorized domains" → "Add domain".

## 5. Crea il database Firestore

1. Menu laterale → **Build → Firestore Database** → **"Create database"**.
2. Scegli una location vicina a voi, es. `europe-west1` (Belgio) o
   `eur3` — **non è più modificabile dopo**, quindi scegline una definitiva.
3. Scegli **"Start in production mode"** (le regole di sicurezza sono già
   pronte nel file `firestore.rules` di questo repo e le pubblicherai al
   passo 9).

## 6. Attiva Firebase Storage (per le foto)

1. Menu laterale → **Build → Storage** → **"Get started"**.
2. Stessa location scelta per Firestore.
3. Anche qui scegli **"production mode"** — userai `storage.rules` da questo
   repo.

## 7. Configura Cloud Messaging (le notifiche push)

1. Menu laterale → ⚙️ **Project settings** → tab **"Cloud Messaging"**.
2. Scorri fino a **"Web configuration" → "Web Push certificates"**.
3. Clicca **"Generate key pair"**. Ottieni una stringa lunga: è la tua
   **VAPID key pubblica** — ti serve per `.env.local` (sezione 8).

## 8. Configura le variabili d'ambiente del progetto Next.js

1. Copia il file `.env.local.example` in `.env.local`:
   ```
   cp .env.local.example .env.local
   ```
2. Apri `.env.local` e incolla i valori:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`,
     `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID` → dal blocco
     `firebaseConfig` copiato al passo 3.
   - `NEXT_PUBLIC_FIREBASE_VAPID_KEY` → la chiave generata al passo 7.
3. Questo file **non va committato** (è già in `.gitignore`).

## 9. Installa la Firebase CLI e collega il progetto

```bash
npm install -g firebase-tools
firebase login
```

Si aprirà il browser per il login Google. Poi, dalla cartella del progetto:

```bash
firebase use --add
# scegli il progetto creato al passo 1, alias "default"
```

## 10. Pubblica le regole di sicurezza (Firestore + Storage)

```bash
firebase deploy --only firestore:rules,storage:rules
```

Questo pubblica i file `firestore.rules` e `storage.rules` già pronti nel
repo — impediscono a chiunque non sia autenticato di leggere/scrivere dati,
e permettono a ognuno di modificare solo i propri contenuti.

## 11. Installa e pubblica la Cloud Function per le notifiche

La funzione in `functions/src/index.ts` è quella che, quando qualcuno
registra una "birra calda", manda la notifica push 🌋 a tutti gli altri.

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Il primo deploy richiede qualche minuto. Se vuoi vedere i log in tempo
reale dopo: `firebase functions:log`.

## 12. Prova tutto in locale

Dalla cartella principale del progetto:

```bash
npm install
npm run dev
```

Apri `http://localhost:3000` — dovresti vedere la schermata di login.
Registrati con email/password (o telefono), completa il profilo, e prova a
registrare una birra "calda" da due account diversi (es. due browser o uno
in incognito) per vedere il popup vulcano e la notifica push in azione (per
le notifiche push serve HTTPS o `localhost`, e permesso "Consenti" quando il
browser lo chiede).

## 13. Deploy dell'app web (Vercel)

1. Vai su **https://vercel.com**, collega il tuo account GitHub e importa
   questo repository.
2. Nelle impostazioni del progetto Vercel → **Environment Variables**,
   aggiungi tutte le variabili di `.env.local` (stessi nomi e valori).
3. Deploy. Una volta live, copia il dominio Vercel (es.
   `beeeeers.vercel.app`) e aggiungilo agli **Authorized domains** in
   Firebase Authentication (vedi passo 4) — altrimenti il login non
   funzionerà in produzione.

## Riepilogo dei costi

Con il piano Blaze paghi solo oltre la quota gratuita mensile. Per un
gruppo di amici (poche decine di persone, qualche foto al giorno) resterete
comfortably dentro alla quota gratuita: Firestore (50k letture/giorno
gratis), Storage (5GB gratis), Cloud Functions (2M invocazioni/mese
gratis), Cloud Messaging (sempre gratuito, nessun limite di invii).
