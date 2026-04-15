"use client";

import { useMemo, useRef, useState } from "react";
import AddTaskForm from "./AddTaskForm";
import TaskList from "./TaskList";
import { SHARED_LIST_ROLES } from "../services/sharedListService";

export default function SharedListView({
  list,
  tasks,
  currentUserId,
  currentUserRole,
  members,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onBack,
}) {
  const [memberEmail, setMemberEmail] = useState("");
  const [memberError, setMemberError] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberFieldError, setMemberFieldError] = useState(false);
  const [roleLoadingId, setRoleLoadingId] = useState(null);
  const memberEmailRef = useRef(null);

  const isOwner = list?.ownerId === currentUserId;
  const isAdmin = currentUserRole === SHARED_LIST_ROLES.ADMIN;
  const canManageMembers = isOwner || isAdmin;
  const canManageTasks =
    currentUserRole === SHARED_LIST_ROLES.OWNER ||
    currentUserRole === SHARED_LIST_ROLES.ADMIN ||
    currentUserRole === SHARED_LIST_ROLES.EDITOR;

  const roleLabels = {
    [SHARED_LIST_ROLES.OWNER]: "Propriétaire",
    [SHARED_LIST_ROLES.ADMIN]: "Admin",
    [SHARED_LIST_ROLES.EDITOR]: "Éditeur",
    [SHARED_LIST_ROLES.READER]: "Lecteur",
  };

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
      setMemberFieldError(true);
      setMemberError("L'adresse e-mail est obligatoire.");
      memberEmailRef.current?.focus();
      return;
    }

    setMemberFieldError(false);
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

  const handleRoleChange = async (memberId, nextRole) => {
    setMemberError(null);
    setRoleLoadingId(memberId);

    try {
      await onUpdateMemberRole(memberId, nextRole);
    } catch (roleError) {
      setMemberError(roleError instanceof Error ? roleError.message : "Impossible de modifier ce role.");
    } finally {
      setRoleLoadingId(null);
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

          {canManageMembers ? (
            <form onSubmit={handleAddMember} className="mt-4 space-y-3" noValidate>
              <label htmlFor="shared-member-email" className="sr-only">
                Ajouter un membre par email
              </label>
              <input
                id="shared-member-email"
                ref={memberEmailRef}
                type="email"
                value={memberEmail}
                onChange={(event) => setMemberEmail(event.target.value)}
                placeholder="Email du membre"
                required
                aria-invalid={memberFieldError}
                aria-describedby={memberFieldError ? "shared-member-email-error" : undefined}
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

              {memberFieldError ? (
                <p id="shared-member-email-error" className="text-xs font-semibold text-red-200">
                  L'adresse e-mail est obligatoire.
                </p>
              ) : null}
            </form>
          ) : (
            <p className="mt-4 rounded-xl bg-white/8 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
              Mode lecture: vous pouvez consulter les membres sans les modifier.
            </p>
          )}

          {memberError ? (
            <p className="mt-3 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200" role="alert">
              {memberError}
            </p>
          ) : null}

          <div className="mt-5 space-y-2">
            {(members || []).map((member) => {
              const isCurrentUser = member.id === currentUserId;
              const isListOwner = list?.ownerId === member.id;
              const memberRole = member.role || (isListOwner ? SHARED_LIST_ROLES.OWNER : SHARED_LIST_ROLES.READER);
              const canOwnerChangeRole = isOwner && !isListOwner;
              const canAdminChangeRole = isAdmin && (memberRole === SHARED_LIST_ROLES.EDITOR || memberRole === SHARED_LIST_ROLES.READER);
              const canChangeRole = canOwnerChangeRole || canAdminChangeRole;
              const canRemoveMember =
                canManageMembers &&
                !isListOwner &&
                (!isAdmin || memberRole !== SHARED_LIST_ROLES.ADMIN);
              const roleOptions = isOwner
                ? [SHARED_LIST_ROLES.ADMIN, SHARED_LIST_ROLES.EDITOR, SHARED_LIST_ROLES.READER]
                : [SHARED_LIST_ROLES.EDITOR, SHARED_LIST_ROLES.READER];

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{isCurrentUser ? "Vous" : member.email || member.id}</p>
                    <p className="text-xs uppercase tracking-[0.08em] text-white/55">{roleLabels[memberRole] || "Membre"}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canChangeRole ? (
                      <label className="sr-only" htmlFor={`member-role-${member.id}`}>
                        Modifier le role de {member.email || member.id}
                      </label>
                    ) : null}

                    {canChangeRole ? (
                      <select
                        id={`member-role-${member.id}`}
                        value={memberRole}
                        disabled={roleLoadingId === member.id}
                        onChange={(event) => handleRoleChange(member.id, event.target.value)}
                        className="h-9 rounded-xl bg-white/10 px-3 text-xs font-bold uppercase tracking-[0.06em] text-white outline-none ring-1 ring-white/15 focus:ring-lime-300/60"
                      >
                        {roleOptions.map((roleValue) => (
                          <option key={roleValue} value={roleValue} className="bg-slate-950 text-white">
                            {roleLabels[roleValue] || roleValue}
                          </option>
                        ))}
                      </select>
                    ) : null}

                    {canRemoveMember ? (
                      <button
                        type="button"
                        onClick={() => onRemoveMember(member.id)}
                        className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] text-white transition hover:bg-red-500/25 hover:text-red-100"
                      >
                        Retirer
                      </button>
                    ) : null}
                  </div>
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

          {canManageTasks ? (
            <AddTaskForm onAddTask={onAddTask} />
          ) : (
            <p className="mt-4 rounded-xl bg-white/8 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
              Mode lecture: seul un editeur, un admin ou le proprietaire peut modifier les taches.
            </p>
          )}

          <div className="mt-5">
            <TaskList
              tasks={tasks}
              canManageTasks={canManageTasks}
              onToggle={(taskId) => {
                if (!canManageTasks) {
                  return;
                }

                const task = tasks.find((item) => item.id === taskId);
                if (!task) {
                  return;
                }

                onUpdateTask(taskId, { completed: !task.completed });
              }}
              onDelete={onDeleteTask}
              onUpdate={onUpdateTask}
              memberLabels={memberLabels}
            />
          </div>
        </article>
      </div>
    </section>
  );
}
