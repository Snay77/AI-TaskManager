import ProgressBar from "./ProgressBar";

export default function TaskStats({ tasks = [] }) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const total = safeTasks.length;
  const completed = safeTasks.filter((task) => task?.completed === true).length;
  const active = Math.max(0, total - completed);
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section
      className="rounded-3xl bg-white/4 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-6"
      aria-label="Statistiques des taches"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-900/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/60">Total</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{total}</p>
        </div>
        <div className="rounded-2xl bg-slate-900/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/60">Completees</p>
          <p className="mt-2 text-2xl font-extrabold text-lime-300">{completed}</p>
        </div>
        <div className="rounded-2xl bg-slate-900/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/60">Actives</p>
          <p className="mt-2 text-2xl font-extrabold text-amber-300">{active}</p>
        </div>
      </div>

      <div className="mt-5">
        <ProgressBar percentage={percentage} label="Progression globale" />
      </div>
    </section>
  );
}
