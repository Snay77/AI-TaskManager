"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function UserMenu() {
  const { user, signOut, error } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSignOut = async () => {
    setLocalError(null);
    setIsSigningOut(true);

    try {
      await signOut();
    } catch {
      setLocalError("Impossible de vous deconnecter pour le moment.");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="nav-link">
          Connexion
        </Link>
        <Link href="/signup" className="nav-link">
          Inscription
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/55">Connecte</p>
        <p className="max-w-55 truncate text-sm font-semibold text-white/85" title={user.email || "Utilisateur"}>
          {user.email || "Utilisateur"}
        </p>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-65"
      >
        {isSigningOut ? "Deconnexion..." : "Se deconnecter"}
      </button>

      {localError || error ? (
        <p className="hidden text-xs font-semibold text-red-300 lg:block" role="alert">
          {localError || error}
        </p>
      ) : null}
    </div>
  );
}
