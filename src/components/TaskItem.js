"use client";

const priorityStyles = {
  haute: "bg-red-500/20 text-red-200",
  moyenne: "bg-amber-400/20 text-amber-100",
  basse: "bg-emerald-500/20 text-emerald-100",
};

export default function TaskItem({
  title,
  description,
  date,
  priority,
  completed,
  onToggle,
  onDelete,
}) {
  const badgeStyle = priorityStyles[priority] || priorityStyles.moyenne;

  return (
    <article className="group rounded-3xl bg-white/4 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] transition hover:bg-white/[0.07] sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onToggle}
          aria-label={`Marquer ${title} comme ${completed ? "non terminee" : "terminee"}`}
          className={`mt-1 h-6 w-6 shrink-0 rounded-full border transition ${
            completed
              ? "border-lime-300 bg-lime-300 shadow-[0_0_16px_rgba(223,255,0,0.35)]"
              : "border-white/35 bg-transparent hover:border-lime-300"
          }`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3
              className={`text-xl font-bold tracking-tight text-white sm:text-2xl ${
                completed ? "text-white/45 line-through" : ""
              }`}
            >
              {title}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${badgeStyle}`}
            >
              {priority}
            </span>
          </div>

          {description ? (
            <p className={`mt-2 text-sm text-white/70 sm:text-base ${completed ? "line-through opacity-60" : ""}`}>
              {description}
            </p>
          ) : null}

          {date ? (
            <p
              className={`mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-violet-200/90 ${
                completed ? "line-through opacity-60" : ""
              }`}
            >
              Echeance: {date}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Supprimer la tache ${title}`}
          className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-red-500/25 hover:text-red-100"
        >
          Supprimer
        </button>
      </div>
    </article>
  );
}
