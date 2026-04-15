"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const { user, signIn, signInWithGoogle, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ email: false, password: false });

  const displayError = useMemo(() => localError || authError, [authError, localError]);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [router, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextFieldErrors = {
      email: !email.trim(),
      password: !password,
    };

    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.email || nextFieldErrors.password) {
      setLocalError("Veuillez renseigner votre e-mail et votre mot de passe.");
      return;
    }

    setLocalError(null);
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      router.replace("/");
    } catch {
      // The AuthContext already maps Firebase errors to a readable message.
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setLoading(true);

    try {
      await signInWithGoogle();
      router.replace("/");
    } catch {
      // The AuthContext already maps Firebase errors to a readable message.
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white/4 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-6">
      {displayError ? (
        <p className="mb-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200" role="alert">
          {displayError}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-white/85">
            E-mail
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="vous@exemple.com"
            autoComplete="email"
            required
            aria-invalid={fieldErrors.email}
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
            className="h-11 w-full rounded-xl bg-white/8 px-4 text-sm font-medium text-white outline-none ring-1 ring-white/12 placeholder:text-white/45 focus:ring-lime-300/60"
          />
          {fieldErrors.email ? (
            <p id="login-email-error" className="mt-2 text-xs font-semibold text-red-200">
              L'e-mail est obligatoire.
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-white/85">
            Mot de passe
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Votre mot de passe"
            autoComplete="current-password"
            required
            aria-invalid={fieldErrors.password}
            aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
            className="h-11 w-full rounded-xl bg-white/8 px-4 text-sm font-medium text-white outline-none ring-1 ring-white/12 placeholder:text-white/45 focus:ring-lime-300/60"
          />
          {fieldErrors.password ? (
            <p id="login-password-error" className="mt-2 text-xs font-semibold text-red-200">
              Le mot de passe est obligatoire.
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-lime-300 px-5 text-sm font-extrabold uppercase tracking-[0.06em] text-zinc-950 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="h-11 w-full rounded-xl bg-white/10 px-5 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-65"
        >
          Se connecter avec Google
        </button>
      </form>

      <p className="mt-5 text-sm text-white/70">
        Pas encore de compte ?{" "}
        <Link className="font-semibold text-lime-300 hover:text-lime-200" href="/signup">
          S'inscrire
        </Link>
      </p>
    </section>
  );
}
