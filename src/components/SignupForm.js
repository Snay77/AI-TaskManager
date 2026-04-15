"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function SignupForm() {
  const router = useRouter();
  const { user, signUp, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });

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
      confirmPassword: !confirmPassword,
    };

    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.email || nextFieldErrors.password || nextFieldErrors.confirmPassword) {
      setLocalError("Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors((current) => ({ ...current, confirmPassword: true }));
      setLocalError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLocalError(null);
    setLoading(true);

    try {
      await signUp(email.trim(), password);
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
          <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold text-white/85">
            E-mail
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="vous@exemple.com"
            autoComplete="email"
            required
            aria-invalid={fieldErrors.email}
            aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
            className="h-11 w-full rounded-xl bg-white/8 px-4 text-sm font-medium text-white outline-none ring-1 ring-white/12 placeholder:text-white/45 focus:ring-lime-300/60"
          />
          {fieldErrors.email ? (
            <p id="signup-email-error" className="mt-2 text-xs font-semibold text-red-200">
              L'e-mail est obligatoire.
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="signup-password" className="mb-2 block text-sm font-semibold text-white/85">
            Mot de passe
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 6 caracteres"
            autoComplete="new-password"
            required
            aria-invalid={fieldErrors.password}
            aria-describedby={fieldErrors.password ? "signup-password-error" : undefined}
            className="h-11 w-full rounded-xl bg-white/8 px-4 text-sm font-medium text-white outline-none ring-1 ring-white/12 placeholder:text-white/45 focus:ring-lime-300/60"
          />
          {fieldErrors.password ? (
            <p id="signup-password-error" className="mt-2 text-xs font-semibold text-red-200">
              Le mot de passe est obligatoire.
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="signup-confirm-password" className="mb-2 block text-sm font-semibold text-white/85">
            Confirmation du mot de passe
          </label>
          <input
            id="signup-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirmez votre mot de passe"
            autoComplete="new-password"
            required
            aria-invalid={fieldErrors.confirmPassword}
            aria-describedby={fieldErrors.confirmPassword ? "signup-confirm-password-error" : undefined}
            className="h-11 w-full rounded-xl bg-white/8 px-4 text-sm font-medium text-white outline-none ring-1 ring-white/12 placeholder:text-white/45 focus:ring-lime-300/60"
          />
          {fieldErrors.confirmPassword ? (
            <p id="signup-confirm-password-error" className="mt-2 text-xs font-semibold text-red-200">
              La confirmation du mot de passe est obligatoire.
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-lime-300 px-5 text-sm font-extrabold uppercase tracking-[0.06em] text-zinc-950 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {loading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>

      <p className="mt-5 text-sm text-white/70">
        Deja un compte ?{" "}
        <Link className="font-semibold text-lime-300 hover:text-lime-200" href="/login">
          Se connecter
        </Link>
      </p>
    </section>
  );
}
