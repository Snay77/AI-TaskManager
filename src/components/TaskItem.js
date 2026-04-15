"use client";
import { memo, useEffect, useMemo, useRef, useState } from "react";

const priorityStyles = {
  high: "bg-red-500/20 text-red-200",
  medium: "bg-amber-400/20 text-amber-100",
  low: "bg-emerald-500/20 text-emerald-100",
};

const priorityLabels = {
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
};

function TaskItem({
  taskId,
  title,
  description,
  dueDate,
  priority,
  completed,
  addedBy,
  addedByLabel,
  canManageTasks = true,
  onToggle,
  onDelete,
  onUpdate,
}) {
  const badgeStyle = priorityStyles[priority] || priorityStyles.medium;
  const badgeLabel = priorityLabels[priority] || "Moyenne";
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title || "");
  const [editDescription, setEditDescription] = useState(description || "");
  const [editDueDate, setEditDueDate] = useState(dueDate || "");
  const [editPriority, setEditPriority] = useState(priority || "medium");
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const editTitleInputRef = useRef(null);

  const normalizedDueDate = useMemo(() => {
    if (!dueDate) {
      return "";
    }

    if (typeof dueDate === "string") {
      return dueDate.slice(0, 10);
    }

    return "";
  }, [dueDate]);

  const startEditing = () => {
    setEditTitle(title || "");
    setEditDescription(description || "");
    setEditDueDate(normalizedDueDate);
    setEditPriority(priority || "medium");
    setEditError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditError(null);
  };

  useEffect(() => {
    if (isEditing) {
      editTitleInputRef.current?.focus();
    }
  }, [isEditing]);

  const saveEditing = async () => {
    if (!canManageTasks) {
      return;
    }

    const cleanTitle = editTitle.trim();

    if (!cleanTitle) {
      setEditError("Le titre de la tache est obligatoire.");
      return;
    }

    setEditError(null);
    setEditLoading(true);

    try {
      await onUpdate({
        title: cleanTitle,
        description: editDescription.trim(),
        dueDate: editDueDate || null,
        priority: editPriority,
      });
      setIsEditing(false);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Impossible de modifier la tache.");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <article className="group rounded-3xl bg-white/4 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] transition hover:bg-white/[0.07] sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        {canManageTasks ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label={`Marquer ${title} comme ${completed ? "non terminee" : "terminee"}`}
            className={`mt-1 h-6 w-6 shrink-0 rounded-full border transition ${
              completed
                ? "border-lime-300 bg-lime-300 shadow-[0_0_16px_rgba(223,255,0,0.35)]"
                : "border-white/35 bg-transparent hover:border-lime-300"
            }`}
            disabled={isEditing || editLoading}
          />
        ) : (
          <span
            aria-hidden="true"
            className={`mt-1 h-6 w-6 shrink-0 rounded-full border ${
              completed ? "border-lime-300 bg-lime-300" : "border-white/35 bg-transparent"
            }`}
          />
        )}

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="space-y-3">
              {editError ? (
                <p className="rounded-xl bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200" role="alert">
                  {editError}
                </p>
              ) : null}

              <label className="sr-only" htmlFor={`task-edit-title-${taskId}`}>
                Modifier le titre de la tache
              </label>
              <input
                id={`task-edit-title-${taskId}`}
                ref={editTitleInputRef}
                type="text"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                disabled={editLoading}
                required
                aria-invalid={Boolean(editError)}
                aria-describedby={editError ? `task-edit-title-error-${taskId}` : undefined}
                className="h-11 w-full rounded-xl bg-white/8 px-4 text-sm font-medium text-white outline-none ring-1 ring-white/10 placeholder:text-white/45 focus:ring-lime-300/60"
              />
              {editError ? (
                <p id={`task-edit-title-error-${taskId}`} className="text-xs font-semibold text-red-200">
                  {editError}
                </p>
              ) : null}

              <label className="sr-only" htmlFor={`task-edit-description-${taskId}`}>
                Modifier la description de la tache
              </label>
              <textarea
                id={`task-edit-description-${taskId}`}
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                disabled={editLoading}
                className="w-full min-h-24 rounded-xl bg-white/8 px-4 py-3 text-sm font-medium text-white outline-none ring-1 ring-white/10 placeholder:text-white/45 focus:ring-lime-300/60 resize-none"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="sr-only" htmlFor={`task-edit-date-${taskId}`}>
                  Modifier la date d'echeance
                </label>
                <input
                  id={`task-edit-date-${taskId}`}
                  type="date"
                  value={editDueDate}
                  onChange={(event) => setEditDueDate(event.target.value)}
                  disabled={editLoading}
                  className="h-11 rounded-xl bg-white/8 px-4 text-sm font-medium text-white outline-none ring-1 ring-white/10 focus:ring-lime-300/60"
                />

                <label className="sr-only" htmlFor={`task-edit-priority-${taskId}`}>
                  Modifier la priorite de la tache
                </label>
                <select
                  id={`task-edit-priority-${taskId}`}
                  value={editPriority}
                  onChange={(event) => setEditPriority(event.target.value)}
                  disabled={editLoading}
                  className="h-11 rounded-xl bg-violet-600/30 px-3 text-sm font-semibold text-white outline-none ring-1 ring-violet-400/40 focus:ring-lime-300/60"
                >
                  <option value="high" className="bg-slate-950 text-white">
                    Haute
                  </option>
                  <option value="medium" className="bg-slate-950 text-white">
                    Moyenne
                  </option>
                  <option value="low" className="bg-slate-950 text-white">
                    Basse
                  </option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveEditing}
                  disabled={editLoading}
                  className="rounded-xl bg-lime-300 px-3 py-2 text-sm font-bold uppercase tracking-[0.06em] text-zinc-950 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {editLoading ? "Sauvegarde..." : "Enregistrer"}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={editLoading}
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold uppercase tracking-[0.06em] text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-65"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
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
                  {badgeLabel}
                </span>
              </div>

              {description ? (
                <p className={`mt-2 text-sm text-white/70 sm:text-base ${completed ? "line-through opacity-60" : ""}`}>
                  {description}
                </p>
              ) : null}

              {dueDate ? (
                <p
                  className={`mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-violet-200/90 ${
                    completed ? "line-through opacity-60" : ""
                  }`}
                >
                  Echeance: {new Date(dueDate).toLocaleDateString("fr-FR")}
                </p>
              ) : null}
            </>
          )}

          {addedBy ? (
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-white/55">
              Ajoutée par: {addedByLabel || addedBy}
            </p>
          ) : null}

        </div>

        {canManageTasks ? (
          <>
            <button
              type="button"
              onClick={isEditing ? cancelEditing : startEditing}
              aria-label={isEditing ? `Annuler la modification de la tache ${title}` : `Modifier la tache ${title}`}
              className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-red-500/25 hover:text-red-100"
              disabled={editLoading}
            >
              {isEditing ? "Annuler" : "Modifier"}
            </button>

            <button
              type="button"
              onClick={onDelete}
              aria-label={`Supprimer la tache ${title}`}
              className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-red-500/25 hover:text-red-100"
              disabled={isEditing || editLoading}
            >
              Supprimer
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
}

export default memo(TaskItem);
