"use client";

// See src/app/page.tsx for why this route opts out of static prerendering.
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { CircularLogo } from "@/components/CircularLogo";
import { useAuth } from "@/hooks/AuthProvider";
import { signInWithEmail, signUpWithEmail, sendPhoneCode, resetRecaptcha } from "@/lib/auth";
import type { ConfirmationResult } from "firebase/auth";

const RECAPTCHA_ID = "recaptcha-container";

function authErrorMessage(e: unknown) {
  if (e instanceof FirebaseError) {
    switch (e.code) {
      case "auth/invalid-email":
        return "Email non valida.";
      case "auth/email-already-in-use":
        return "Esiste già un account con questa email. Prova ad accedere.";
      case "auth/weak-password":
        return "La password deve avere almeno 6 caratteri.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Email o password errati.";
      case "auth/user-not-found":
        return "Nessun account con questa email. Prova a registrarti.";
      case "auth/invalid-phone-number":
        return "Numero di telefono non valido. Usa il formato internazionale, es. +39 333 1234567.";
      case "auth/invalid-verification-code":
        return "Codice non corretto.";
      case "auth/too-many-requests":
        return "Troppi tentativi, riprova tra qualche minuto.";
      default:
        return "Qualcosa è andato storto, riprova.";
    }
  }
  return "Qualcosa è andato storto, riprova.";
}

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [method, setMethod] = useState<"email" | "phone">("email");

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  return (
    <div className="min-h-screen max-w-[480px] mx-auto flex flex-col items-center justify-center px-6 py-10 bg-bg">
      <div className="mb-6 flex justify-center">
        <CircularLogo size={110} />
      </div>
      <p className="text-text-dim text-[13.5px] font-sans mb-6 text-center">
        La classifica delle birre del gruppo
      </p>

      <div className="w-full flex bg-bg-elev border border-border rounded-xl p-[3px] mb-5">
        <button
          onClick={() => setMethod("email")}
          className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold font-sans transition-colors ${
            method === "email" ? "bg-amber text-[#12100B]" : "text-text-dim"
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setMethod("phone")}
          className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold font-sans transition-colors ${
            method === "phone" ? "bg-amber text-[#12100B]" : "text-text-dim"
          }`}
        >
          Telefono
        </button>
      </div>

      <div className="w-full bg-bg-elev border border-border rounded-2xl p-5">
        {method === "email" ? <EmailForm /> : <PhoneForm />}
      </div>

      <div id={RECAPTCHA_ID} />
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11.5px] text-text-dim uppercase tracking-wider mb-1.5 mt-3.5 font-bold font-sans">
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full box-border bg-bg-elev-2 border border-border rounded-[10px] text-text font-sans text-[14.5px] px-3.5 py-2.5 outline-none focus:border-amber"
    />
  );
}

function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full mt-4 rounded-xl py-3 font-fredoka text-[15.5px] font-bold text-[#12100B] disabled:opacity-50"
      style={{ background: "linear-gradient(135deg, var(--amber) 0%, var(--amber-deep) 100%)" }}
    >
      {children}
    </button>
  );
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mt-3 text-[12.5px] font-sans text-coral bg-[rgba(255,93,115,0.1)] border border-[rgba(255,93,115,0.3)] rounded-lg px-3 py-2">
      {message}
    </div>
  );
}

function EmailForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (mode === "signin") await signInWithEmail(email.trim(), password);
      else await signUpWithEmail(email.trim(), password);
      // AuthProvider + the effect above take care of redirecting once
      // Firebase reports the new signed-in user.
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = email.trim().length > 3 && password.length >= 6 && !busy;

  return (
    <div>
      <div className="flex gap-4 mb-1 text-[13px] font-sans font-semibold">
        <button
          onClick={() => setMode("signin")}
          className={mode === "signin" ? "text-amber" : "text-text-dim"}
        >
          Accedi
        </button>
        <button
          onClick={() => setMode("signup")}
          className={mode === "signup" ? "text-amber" : "text-text-dim"}
        >
          Registrati
        </button>
      </div>

      <FieldLabel>Email</FieldLabel>
      <TextInput type="email" placeholder="tu@esempio.it" value={email} onChange={(e) => setEmail(e.target.value)} />

      <FieldLabel>Password</FieldLabel>
      <TextInput
        type="password"
        placeholder={mode === "signup" ? "Almeno 6 caratteri" : "La tua password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
      />

      <ErrorBanner message={error} />

      <PrimaryButton disabled={!canSubmit} onClick={submit}>
        {busy ? "Un attimo…" : mode === "signin" ? "Accedi 🍺" : "Crea account 🍺"}
      </PrimaryButton>
    </div>
  );
}

function PhoneForm() {
  const [phone, setPhone] = useState("+39");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await sendPhoneCode(phone.trim(), RECAPTCHA_ID);
      setConfirmation(result);
    } catch (e) {
      resetRecaptcha();
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async () => {
    if (!confirmation) return;
    setBusy(true);
    setError(null);
    try {
      await confirmation.confirm(code.trim());
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!confirmation) {
    return (
      <div>
        <FieldLabel>Numero di telefono</FieldLabel>
        <TextInput
          type="tel"
          placeholder="+39 333 1234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <ErrorBanner message={error} />
        <PrimaryButton disabled={phone.trim().length < 6 || busy} onClick={sendCode}>
          {busy ? "Invio…" : "Invia codice"}
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div>
      <FieldLabel>Codice ricevuto via SMS</FieldLabel>
      <TextInput
        type="text"
        inputMode="numeric"
        placeholder="123456"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && code.length >= 6 && confirmCode()}
      />
      <ErrorBanner message={error} />
      <PrimaryButton disabled={code.trim().length < 4 || busy} onClick={confirmCode}>
        {busy ? "Verifico…" : "Conferma"}
      </PrimaryButton>
    </div>
  );
}
