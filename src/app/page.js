"use client";

import { useEffect, useState } from "react";
import AuthGuard from "../components/AuthGuard";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToTasks } from "../services/taskService";

function HomeContent() {
  const { user } = useAuth();
  const [previewTasks, setPreviewTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = subscribeToTasks(user.uid, (tasks) => {
        setPreviewTasks(tasks);
        setLoading(false);
      }, null, 3);

      return unsubscribe;
    } catch {
      setLoading(false);
    }
  }, [user?.uid]);

  const priorityDisplay = {
    high: { label: "Haute", style: "bg-red-500/20 text-red-100" },
    medium: { label: "Moyenne", style: "bg-amber-400/20 text-amber-100" },
    low: { label: "Basse", style: "bg-emerald-500/20 text-emerald-100" },
  };

  return (
    <AuthGuard>
      <section className="mx-auto w-full max-w-285 px-3 pb-28 pt-6 sm:px-4">
      <div className="rounded-3xl bg-linear-to-br from-violet-700/25 via-slate-950 to-black p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-10">
        <span className="inline-flex rounded-full bg-violet-500/25 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-violet-100">
          TaskForce
        </span>
        <h1 className="mt-4 text-4xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl">
          Organise ta todo liste
          <br />
          avec clarte et focus.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-white/75 sm:text-base">
          TaskForce te permet de centraliser les taches que tu ajoutes toi-meme, suivre leur avancement,
          et garder une vision claire de ce qui est en cours et termine.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl bg-lime-300 px-5 py-3 text-sm font-extrabold uppercase tracking-[0.06em] text-zinc-950 sm:text-base"
          >
            Creer ma liste de tache
          </button>
          <a
            href="/tasks"
            className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white sm:text-base"
          >
            Voir mes tasks
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <article className="rounded-3xl bg-white/4 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Apercu de mes taches</h2>
            <a
              href="/tasks"
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-white/85"
            >
              Voir toutes
            </a>
          </div>
          <div className="min-h-[180px] space-y-3">
            {loading ? (
              <p className="text-sm text-white/70">Chargement...</p>
            ) : previewTasks.length > 0 ? (
              previewTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white/6 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-white">{task.title}</p>
                    {task.description ? (
                      <p className="mt-1 line-clamp-1 text-xs text-white/60">{task.description}</p>
                    ) : null}
                    <p className="text-sm text-white/65">{task.completed ? "Completee" : "En cours"}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${priorityDisplay[task.priority]?.style || priorityDisplay.medium.style}`}>
                    {priorityDisplay[task.priority]?.label || "Moyenne"}
                  </span>
                </div>
              ))
            ) : (
              <div
                className="rounded-2xl bg-white/5 p-4 text-center text-sm text-white/70"
              >
                Aucune tache pour le moment. Commence par en creer une !
              </div>
            )}
          </div>
        </article>

        <article className="rounded-3xl bg-linear-to-br from-orange-500 to-orange-400 p-6 text-zinc-950 shadow-[0_20px_45px_rgba(255,95,31,0.28)]">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-900/75">Bientot disponible</p>
          <h2 className="mt-2 text-3xl font-extrabold leading-[0.95] tracking-tight">
            Rappels intelligents
          </h2>
          <p className="mt-3 text-sm font-medium text-zinc-900/80">
            Notifications automatiques, tri par urgence et suggestions de priorite arrivent dans une prochaine
            version.
          </p>
          <ul className="mt-4 space-y-2 text-sm font-semibold text-zinc-900/85">
            <li>- Rappels date limite</li>
            <li>- Filtre IA prioritaire</li>
            <li>- Routine quotidienne guidee</li>
          </ul>
        </article>
      </div>

      <div className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">A propos</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Pourquoi TaskForce ?</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-3xl bg-white/4 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] lg:col-span-2">
            <h3 className="text-xl font-bold text-white">Tout centraliser</h3>
            <p className="mt-2 text-sm text-white/70">
              Une seule vue pour noter, suivre et finaliser tes taches personnelles ou pro.
            </p>
          </article>
          <article className="rounded-3xl bg-violet-600/25 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            <h3 className="text-xl font-bold text-white">Simple</h3>
            <p className="mt-2 text-sm text-white/75">Interface rapide, lisible et mobile-first.</p>
          </article>
          <article className="rounded-3xl bg-white/4 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            <h3 className="text-xl font-bold text-white">Focus</h3>
            <p className="mt-2 text-sm text-white/70">Tu sais toujours quoi faire ensuite.</p>
          </article>
          <article className="rounded-3xl bg-white/4 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] lg:col-span-3">
            <h3 className="text-xl font-bold text-white">Vision long terme</h3>
            <p className="mt-2 text-sm text-white/70">
              Stats, historique et outils de priorisation pour faire avancer tes objectifs semaine apres semaine.
            </p>
          </article>
          <article className="rounded-3xl bg-lime-300 p-5 text-zinc-950 shadow-[0_16px_40px_rgba(223,255,0,0.2)]">
            <h3 className="text-xl font-extrabold">Pret a passer a l&apos;action ?</h3>
            <p className="mt-2 text-sm font-semibold text-zinc-900/80">Teste TaskForce et structure ta prochaine semaine.</p>
          </article>
        </div>
      </div>

      <article className="mt-8 rounded-3xl bg-white/4 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">Contact</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Besoin d&apos;aide ou d&apos;une demo ?</h2>
        <p className="mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
          Consulte la page contact pour voir les profils et informations d&apos;equipe.
        </p>
        <a
          href="/contact"
          className="mt-5 inline-flex rounded-xl bg-white/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white sm:text-base"
        >
          Aller a Contact
        </a>
      </article>
      </section>
    </AuthGuard>
  );
}

export default function Home() {
  return <HomeContent />;
}
