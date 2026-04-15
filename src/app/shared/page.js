"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AuthGuard from "../../components/AuthGuard";
import CreateListForm from "../../components/CreateListForm";
import SharedListCard from "../../components/SharedListCard";
import SharedListView from "../../components/SharedListView";
import { useAuth } from "../../contexts/AuthContext";
import {
  addMemberToList,
  addSharedTask,
  createSharedList,
  deleteSharedList,
  deleteSharedTask,
  getSharedListTasks,
  removeMemberFromList,
  subscribeToSharedLists,
  subscribeToSharedTasks,
  updateSharedTask,
} from "../../services/sharedListService";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

function buildMemberProfiles(memberIds) {
  return Promise.all(
    memberIds.map(async (memberId) => {
      const snapshot = await getDoc(doc(db, "users", memberId));
      const data = snapshot.exists() ? snapshot.data() : null;

      return {
        id: memberId,
        email: data?.email || memberId,
      };
    })
  );
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

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = subscribeToSharedLists(user.uid, (lists) => {
        setSharedLists(lists);
        setLoading(false);
      });

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

      try {
        const statsEntries = await Promise.all(
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
          setListStats(Object.fromEntries(statsEntries));
        }
      } catch (statsError) {
        if (active) {
          setError(statsError instanceof Error ? statsError.message : "Impossible de calculer les statistiques des listes.");
        }
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
        const profiles = await buildMemberProfiles(memberIds);

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
      const unsubscribe = subscribeToSharedTasks(selectedBaseList.id, (tasks) => {
        if (!active) {
          return;
        }

        setSelectedTasks(tasks);
        setListStats((current) => ({
          ...current,
          [selectedBaseList.id]: {
            taskCount: tasks.length,
            completedTaskCount: tasks.filter((task) => task.completed).length,
          },
        }));
        setDetailLoading(false);
      });

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
      if (!selectedList?.id) {
        throw new Error("Aucune liste sélectionnée.");
      }

      await addMemberToList(selectedList.id, email);
    },
    [selectedList?.id]
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
      if (!selectedList?.id) {
        throw new Error("Aucune liste sélectionnée.");
      }

      await updateSharedTask(selectedList.id, taskId, updates);
      await refreshSelectedTasks(selectedList.id);
    },
    [refreshSelectedTasks, selectedList?.id]
  );

  const handleDeleteTask = useCallback(
    async (taskId) => {
      if (!selectedList?.id) {
        throw new Error("Aucune liste sélectionnée.");
      }

      await deleteSharedTask(selectedList.id, taskId);
      await refreshSelectedTasks(selectedList.id);
    },
    [refreshSelectedTasks, selectedList?.id]
  );

  const handleDeleteList = useCallback(
    async (listId) => {
      if (!user?.uid) {
        throw new Error("Utilisateur non identifie.");
      }

      const confirmed = window.confirm("Supprimer cette liste partagée et toutes ses tâches ?");
      if (!confirmed) {
        return;
      }

      await deleteSharedList(listId, user.uid);
      if (selectedListId === listId) {
        handleBack();
      }
    },
    [handleBack, selectedListId, user?.uid]
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
              members={selectedMembers}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
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
                  onDelete={() => handleDeleteList(list.id)}
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
      </section>
    </AuthGuard>
  );
}
