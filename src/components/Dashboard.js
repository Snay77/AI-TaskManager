import { useId } from "react";
import TaskStats from "./TaskStats";

export default function Dashboard({ tasks = [] }) {
  const titleId = useId();
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const isEmpty = safeTasks.length === 0;

  return (
    <section
      className="rounded-3xl bg-linear-to-br from-slate-900/95 via-slate-900/75 to-violet-950/40 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-6"
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
        Tableau de bord
      </h2>

      {isEmpty ? (
        <p className="mt-3 rounded-2xl bg-white/5 p-4 text-sm text-white/70">
          Aucune tache pour le moment. Ajoute ta premiere tache pour voir tes statistiques.
        </p>
      ) : (
        <div className="mt-4">
          <TaskStats tasks={safeTasks} />
        </div>
      )}
    </section>
  );
}
