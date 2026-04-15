"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AuthGuard from "../../components/AuthGuard";
import CreateListForm from "../../components/CreateListForm";
import SharedListCard from "../../components/SharedListCard";
import SharedListView from "../../components/SharedListView";
import { useAuth } from "../../contexts/AuthContext";
import {
  SHARED_LIST_ROLES,
  addMemberToList,
  addSharedTask,
  createSharedList,
  deleteSharedList,
  deleteSharedTask,
  getSharedListTasks,
  removeMemberFromList,
  subscribeToSharedLists,
  subscribeToSharedTasks,
  updateMemberRole,
  updateSharedTask,
} from "../../services/sharedListService";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

function getFallbackRole(memberId, ownerId) {
  if (memberId === ownerId) {
    return SHARED_LIST_ROLES.OWNER;
  }

  return SHARED_LIST_ROLES.EDITOR;
}

async function buildMemberProfiles(memberIds, memberRoles, ownerId) {
  const results = await Promise.allSettled(
    memberIds.map(async (memberId) => {
      const snapshot = await getDoc(doc(db, "users", memberId));
      const data = snapshot.exists() ? snapshot.data() : null;

      return {
        id: memberId,
        email: data?.email || memberId,
        role: memberRoles?.[memberId] || getFallbackRole(memberId, ownerId),
      };
    })
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    const fallbackId = memberIds[index];
    return {
      id: fallbackId,
      email: fallbackId,
      role: memberRoles?.[fallbackId] || getFallbackRole(fallbackId, ownerId),
    };
  });
}

export default function SharedPage() {
  const { user } = useAuth();
  const [sharedLists, setSharedLists] = useState([]);
  const [listStats, setListStats] = useState({});
  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDeleteListId, setConfirmDeleteListId] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = subscribeToSharedLists(
        user.uid,
        (lists) => {
          setSharedLists(lists);
          setError(null);
          setLoading(false);
        },
        (message) => {
          setError(message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (listError) {
      setError(listError instanceof Error ? listError.message : "Erreur lors du chargement des listes partagees.");
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      if (!sharedLists.length) {
        setListStats({});
        return;
      }

      const statsResults = await Promise.allSettled(
        sharedLists.map(async (list) => {
          const tasks = await getSharedListTasks(list.id);
          return [
            list.id,
            {
              taskCount: tasks.length,
              completedTaskCount: tasks.filter((task) => task.completed).length,
            },
          ];
        })
      );

      if (active) {
        const safeStatsEntries = statsResults.map((result, index) => {
          if (result.status === "fulfilled") {
            return result.value;
          }

          return [
            sharedLists[index].id,
            {
              taskCount: 0,
              completedTaskCount: 0,
            },
          ];
        });

        setListStats(Object.fromEntries(safeStatsEntries));
      }
    };

    loadStats();

    return () => {
      active = false;
    };
  }, [sharedLists]);

  const displayLists = useMemo(
    () =>
      sharedLists.map((list) => ({
        ...list,
        ...(listStats[list.id] || { taskCount: 0, completedTaskCount: 0 }),
      })),
    [listStats, sharedLists]
  );

  const selectedBaseList = useMemo(
    () => sharedLists.find((list) => list.id === selectedListId) || null,
    [sharedLists, selectedListId]
  );

  const selectedList = useMemo(
    () => displayLists.find((list) => list.id === selectedListId) || null,
    [displayLists, selectedListId]
  );

  const currentUserRole = useMemo(() => {
    if (!selectedList || !user?.uid) {
      return null;
    }

    if (selectedList.ownerId === user.uid) {
      return SHARED_LIST_ROLES.OWNER;
    }

    return selectedList.memberRoles?.[user.uid] || SHARED_LIST_ROLES.EDITOR;
  }, [selectedList, user?.uid]);

  useEffect(() => {
    if (!selectedListId) {
      return;
    }

    const stillExists = sharedLists.some((list) => list.id === selectedListId);
    if (!stillExists) {
      setSelectedListId(null);
      setSelectedTasks([]);
      setSelectedMembers([]);
      setError("Cette liste n'existe plus.");
    }
  }, [selectedListId, sharedLists]);

  useEffect(() => {
    if (!selectedBaseList) {
      setSelectedTasks([]);
      setSelectedMembers([]);
      return;
    }

    let active = true;
    setDetailLoading(true);

    const loadMembers = async () => {
      try {
        const memberIds = Array.from(new Set([selectedBaseList.ownerId, ...(selectedBaseList.members || [])]));
        const profiles = await buildMemberProfiles(
          memberIds,
          selectedBaseList.memberRoles,
          selectedBaseList.ownerId
        );

        if (active) {
          setSelectedMembers(profiles);
        }
      } catch (memberError) {
        if (active) {
          setError(memberError instanceof Error ? memberError.message : "Impossible de charger les membres de cette liste.");
        }
      }
    };

    loadMembers();

    try {
      const unsubscribe = subscribeToSharedTasks(
        selectedBaseList.id,
        (tasks) => {
          if (!active) {
            return;
          }

          setSelectedTasks(tasks);
          setError(null);
          setListStats((current) => ({
            ...current,
            [selectedBaseList.id]: {
              taskCount: tasks.length,
              completedTaskCount: tasks.filter((task) => task.completed).length,
            },
          }));
          setDetailLoading(false);
        },
        (message) => {
          if (!active) {
            return;
          }

          setError(message);
          setDetailLoading(false);
        }
      );

      return () => {
        active = false;
        unsubscribe();
      };
    } catch (taskError) {
      if (active) {
        setError(taskError instanceof Error ? taskError.message : "Impossible de charger les taches de cette liste.");
        setDetailLoading(false);
      }
    }
  }, [selectedBaseList]);

  const currentTaskView = useMemo(() => selectedTasks, [selectedTasks]);

  const refreshSelectedTasks = useCallback(async (listId) => {
    const latestTasks = await getSharedListTasks(listId);

    setSelectedTasks(latestTasks);
    setListStats((current) => ({
      ...current,
      [listId]: {
        taskCount: latestTasks.length,
        completedTaskCount: latestTasks.filter((task) => task.completed).length,
      },
    }));

    return latestTasks;
  }, []);

  const handleCreateList = useCallback(
    async (name) => {
      if (!user?.uid) {
        throw new Error("Utilisateur non identifie.");
      }

      setError(null);
      await createSharedList(user.uid, name);
    },
    [user?.uid]
  );

  const handleOpenList = useCallback((listId) => {
    setSelectedListId(listId);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedListId(null);
    setSelectedTasks([]);
    setSelectedMembers([]);
  }, []);

  const handleAddMember = useCallback(
    async (email) => {
      if (!selectedList?.id || !user?.uid) {
        throw new Error("Aucune liste sélectionnée.");
      }

      await addMemberToList(selectedList.id, email, user.uid);
    },
    [selectedList?.id, user?.uid]
  );

  const handleRemoveMember = useCallback(
    async (memberId) => {
      if (!selectedList?.id || !user?.uid) {
        throw new Error("Aucune liste sélectionnée.");
      }

      await removeMemberFromList(selectedList.id, memberId, user.uid);
    },
    [selectedList?.id, user?.uid]
  );

  const handleAddTask = useCallback(
    async ({ title, priority, description, dueDate }) => {
      if (!selectedList?.id || !user?.uid) {
        throw new Error("Aucune liste sélectionnée.");
      }

      await addSharedTask(selectedList.id, user.uid, {
        title,
        priority,
        description,
        dueDate,
      });

      await refreshSelectedTasks(selectedList.id);
    },
    [refreshSelectedTasks, selectedList?.id, user?.uid]
  );

  const handleUpdateTask = useCallback(
    async (taskId, updates) => {
      if (!selectedList?.id || !user?.uid) {
        throw new Error("Aucune liste sélectionnée.");
      }

      await updateSharedTask(selectedList.id, taskId, updates, user.uid);
      await refreshSelectedTasks(selectedList.id);
    },
    [refreshSelectedTasks, selectedList?.id, user?.uid]
  );

  const handleDeleteTask = useCallback(
    async (taskId) => {
      if (!selectedList?.id || !user?.uid) {
        throw new Error("Aucune liste sélectionnée.");
      }

      await deleteSharedTask(selectedList.id, taskId, user.uid);
      await refreshSelectedTasks(selectedList.id);
    },
    [refreshSelectedTasks, selectedList?.id, user?.uid]
  );

  const handleUpdateMemberRole = useCallback(
    async (memberId, role) => {
      if (!selectedList?.id || !user?.uid) {
        throw new Error("Aucune liste sélectionnée.");
      }

      await updateMemberRole(selectedList.id, memberId, role, user.uid);
    },
    [selectedList?.id, user?.uid]
  );

  const requestDeleteList = useCallback((listId) => {
    setConfirmDeleteListId(listId);
  }, []);

  const cancelDeleteList = useCallback(() => {
    setConfirmDeleteListId(null);
  }, []);

  const confirmDeleteList = useCallback(async () => {
    if (!confirmDeleteListId) {
      return;
    }

    if (!user?.uid) {
      setError("Utilisateur non identifie.");
      setConfirmDeleteListId(null);
      return;
    }

    try {
      await deleteSharedList(confirmDeleteListId, user.uid);

      if (selectedListId === confirmDeleteListId) {
        handleBack();
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Erreur lors de la suppression de la liste.");
    } finally {
      setConfirmDeleteListId(null);
    }
  }, [confirmDeleteListId, handleBack, selectedListId, user?.uid]);

  const handleDeleteDialogKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        cancelDeleteList();
      }
    },
    [cancelDeleteList]
  );

  return (
    <AuthGuard>
      <section className="mx-auto w-full max-w-285 px-3 pb-28 pt-6 sm:px-4">
        {error ? (
          <div className="mb-5 rounded-3xl bg-red-500/15 p-4 text-red-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" role="alert">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : null}

        <header className="rounded-3xl bg-linear-to-br from-violet-600/20 via-slate-950 to-slate-900 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">TaskForce / Listes partagées</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Listes partagées
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
            Crée une liste, invite des personnes et collabore en temps réel sur les mêmes tâches.
          </p>
        </header>

        <div className="mt-5">
          <CreateListForm onCreateList={handleCreateList} />
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="rounded-3xl bg-white/4 p-8 text-center text-white/75 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-violet-200">Chargement</p>
              <p className="mt-3 text-base font-medium">Chargement de tes listes partagées...</p>
            </div>
          ) : selectedList ? (
            <SharedListView
              list={selectedList}
              tasks={currentTaskView}
              currentUserId={user?.uid || ""}
              currentUserRole={currentUserRole}
              members={selectedMembers}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onUpdateMemberRole={handleUpdateMemberRole}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onBack={handleBack}
            />
          ) : displayLists.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {displayLists.map((list) => (
                <SharedListCard
                  key={list.id}
                  list={list}
                  currentUserId={user?.uid || ""}
                  onOpen={() => handleOpenList(list.id)}
                  onDelete={() => requestDeleteList(list.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white/4 p-8 text-center text-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              Aucune liste partagée pour le moment. Crée la première pour commencer.
            </div>
          )}
        </div>

        {detailLoading && selectedList ? (
          <div className="mt-4 rounded-3xl bg-white/4 p-4 text-center text-sm font-semibold text-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            Chargement de la liste partagée...
          </div>
        ) : null}

        {confirmDeleteListId ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            aria-describedby="confirm-delete-description"
            onKeyDown={handleDeleteDialogKeyDown}
          >
            <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
              <h2 id="confirm-delete-title" className="text-xl font-extrabold tracking-tight text-white">
                Supprimer cette liste ?
              </h2>
              <p id="confirm-delete-description" className="mt-3 text-sm text-white/75">
                Cette action est irreversible. Toutes les taches de la liste seront supprimees.
              </p>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelDeleteList}
                  className="h-11 rounded-xl bg-white/10 px-4 text-sm font-bold uppercase tracking-[0.06em] text-white transition hover:bg-white/15"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteList}
                  className="h-11 rounded-xl bg-red-500/85 px-4 text-sm font-bold uppercase tracking-[0.06em] text-white transition hover:bg-red-500"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </AuthGuard>
  );
}
