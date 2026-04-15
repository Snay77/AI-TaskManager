"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToTasks } from "../services/taskService";

export default function ProfilePageClient() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToTasks(user.uid, (freshTasks) => {
      setTasks(freshTasks);
      setLoading(false);
    });

    return unsubscribe;
  }, [user?.uid]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const finished = tasks.filter((task) => task.completed).length;
    const notFinished = tasks.filter((task) => !task.completed).length;
    const inProgress = tasks.filter((task) => task.completed !== true).length;
    const latestTask = tasks[0] || null;

    return {
      total,
      finished,
      notFinished,
      inProgress,
      latestTask,
    };
  }, [tasks]);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Utilisateur";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <header className="rounded-3xl bg-linear-to-br from-violet-700/25 via-slate-950 to-black p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">TaskForce / Profil</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Mon profil</h1>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          Vue globale de ton compte et de ta progression depuis le debut.
        </p>
      </header>

      <article className="mt-5 rounded-3xl bg-white/4 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-300 text-xl font-extrabold text-zinc-950">
            {initials}
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{displayName}</h2>
            <p className="mt-1 text-sm text-white/70">Compte connecté</p>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/6 p-4">
            <dt className="text-xs font-semibold uppercase tracking-widest text-white/60">Nom d&apos;affichage</dt>
            <dd className="mt-2 text-lg font-bold text-white">{user?.displayName || "Non renseigné"}</dd>
          </div>
          <div className="rounded-2xl bg-white/6 p-4">
            <dt className="text-xs font-semibold uppercase tracking-widest text-white/60">Email</dt>
            <dd className="mt-2 text-lg font-bold text-white">{user?.email || "Non renseigné"}</dd>
          </div>
          <div className="rounded-2xl bg-white/6 p-4 sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-widest text-white/60">Identifiant utilisateur</dt>
            <dd className="mt-2 text-lg font-bold text-white break-all">{user?.uid || "-"}</dd>
          </div>
        </dl>
      </article>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl bg-white/4 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Total des taches</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-white">{loading ? "..." : stats.total}</p>
        </article>
        <article className="rounded-2xl bg-emerald-500/20 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100/80">Taches finies</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-emerald-50">{loading ? "..." : stats.finished}</p>
        </article>
        <article className="rounded-2xl bg-amber-400/20 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-100/80">Taches en cours</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-amber-50">{loading ? "..." : stats.notFinished}</p>
        </article>
        <article className="rounded-2xl bg-violet-600/25 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-100/85">Tache la plus recente</p>
          <p className="mt-2 text-lg font-bold tracking-tight text-violet-50">
            {loading ? "Chargement..." : stats.latestTask ? stats.latestTask.title : "Aucune"}
          </p>
        </article>
      </div>

      <article className="mt-5 rounded-3xl bg-white/4 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Résumé d&apos;activité</h2>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          {loading
            ? "Chargement des tâches en temps réel..."
            : `Tu as ${stats.finished} tâche(s) terminée(s) sur ${stats.total}. Il te reste ${stats.notFinished} tâche(s) à traiter.`}
        </p>
      </article>
    </div>
  );
}
