"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-285 px-3 pb-28 pt-6 sm:px-4">
        <div className="rounded-3xl bg-white/4 p-8 text-center text-white/75 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-violet-200">Authentification</p>
          <p className="mt-3 text-base font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
