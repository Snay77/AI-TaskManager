"use client";

import { useMemo, useState } from "react";
import AddTaskForm from "./AddTaskForm";
import TaskList from "./TaskList";

export default function SharedListView({
  list,
  tasks,
  currentUserId,
  members,
  onAddMember,
  onRemoveMember,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onBack,
}) {
  const [memberEmail, setMemberEmail] = useState("");
  const [memberError, setMemberError] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);

  const isOwner = list?.ownerId === currentUserId;

  const memberLabels = useMemo(
    () =>
      Object.fromEntries(
        (members || []).map((member) => [
          member.id,
          member.id === currentUserId ? "Vous" : member.email || member.id,
        ])
      ),
    [currentUserId, members]
  );

  const handleAddMember = async (event) => {
    event.preventDefault();
    const cleanEmail = memberEmail.trim();

    if (!cleanEmail) {
      setMemberError("L'adresse e-mail est obligatoire.");
      return;
    }

    setMemberError(null);
    setMemberLoading(true);

    try {
      await onAddMember(cleanEmail);
      setMemberEmail("");
    } catch (addError) {
      setMemberError(addError instanceof Error ? addError.message : "Impossible d'ajouter ce membre.");
    } finally {
      setMemberLoading(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white/4 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">Liste partagée</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {list?.name || "Liste sans nom"}
          </h2>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.06em] text-white transition hover:bg-white/15"
        >
          Retour
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <article className="rounded-3xl bg-black/20 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-white">Membres</h3>
            <span className="text-sm font-semibold text-white/65">{members?.length || 0} personne(s)</span>
          </div>

          <form onSubmit={handleAddMember} className="mt-4 space-y-3" noValidate>
            <label htmlFor="shared-member-email" className="sr-only">
              Ajouter un membre par email
            </label>
            <input
              id="shared-member-email"
              type="email"
              value={memberEmail}
              onChange={(event) => setMemberEmail(event.target.value)}
              placeholder="Email du membre"
              disabled={memberLoading}
              className="h-11 w-full rounded-xl bg-white/8 px-4 text-sm font-medium text-white outline-none ring-1 ring-white/10 placeholder:text-white/45 focus:ring-lime-300/60"
            />
            <button
              type="submit"
              disabled={memberLoading}
              className="h-11 w-full rounded-xl bg-lime-300 px-5 text-sm font-extrabold uppercase tracking-[0.06em] text-zinc-950 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {memberLoading ? "Ajout..." : "Ajouter un membre"}
            </button>
          </form>

          {memberError ? (
            <p className="mt-3 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200" role="alert">
              {memberError}
            </p>
          ) : null}

          <div className="mt-5 space-y-2">
            {(members || []).map((member) => {
              const isCurrentUser = member.id === currentUserId;
              const isListOwner = list?.ownerId === member.id;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{isCurrentUser ? "Vous" : member.email || member.id}</p>
                    <p className="text-xs uppercase tracking-[0.08em] text-white/55">
                      {isListOwner ? "Propriétaire" : "Membre"}
                    </p>
                  </div>

                  {isOwner && !isListOwner ? (
                    <button
                      type="button"
                      onClick={() => onRemoveMember(member.id)}
                      className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] text-white transition hover:bg-red-500/25 hover:text-red-100"
                    >
                      Retirer
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-3xl bg-black/20 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-white">Tâches partagées</h3>
            <span className="text-sm font-semibold text-white/65">{tasks?.length || 0} tâche(s)</span>
          </div>

          <AddTaskForm onAddTask={onAddTask} />

          <div className="mt-5">
            <TaskList
              tasks={tasks}
              onToggle={(taskId) => {
                const task = tasks.find((item) => item.id === taskId);
                if (!task) {
                  return;
                }

                onUpdateTask(taskId, { completed: !task.completed });
              }}
              onDelete={onDeleteTask}
              memberLabels={memberLabels}
            />
          </div>
        </article>
      </div>
    </section>
  );
}
