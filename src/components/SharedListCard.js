"use client";

export default function SharedListCard({ list, currentUserId, onOpen, onDelete }) {
  const isOwner = list?.ownerId === currentUserId;
  const membersCount = Array.isArray(list?.members) ? list.members.length : 0;
  const taskCount = Number.isFinite(list?.taskCount) ? list.taskCount : 0;
  const completedTaskCount = Number.isFinite(list?.completedTaskCount) ? list.completedTaskCount : 0;

  return (
    <article className="rounded-3xl bg-white/4 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-white/[0.07] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-2xl font-bold tracking-tight text-white">{list?.name || "Liste sans nom"}</h2>
            {isOwner ? (
              <span className="rounded-full bg-lime-300 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-zinc-950">
                Propriétaire
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-white/65">
            {membersCount} membre{membersCount > 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-2xl bg-black/20 px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
          <p>{taskCount} tâche{taskCount > 1 ? "s" : ""}</p>
          <p className="mt-1 text-white/90">
            {completedTaskCount} complétée{completedTaskCount > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-11 items-center rounded-xl bg-lime-300 px-4 text-sm font-extrabold uppercase tracking-[0.06em] text-zinc-950 transition hover:brightness-95"
        >
          Ouvrir
        </button>

        {isOwner ? (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-11 items-center rounded-xl bg-white/10 px-4 text-sm font-bold uppercase tracking-[0.06em] text-white transition hover:bg-red-500/25 hover:text-red-100"
          >
            Supprimer
          </button>
        ) : null}
      </div>
    </article>
  );
}
