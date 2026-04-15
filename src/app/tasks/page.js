"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AddTaskForm from "../../components/AddTaskForm";
import AuthGuard from "../../components/AuthGuard";
import Dashboard from "../../components/Dashboard";
import FilterBar from "../../components/FilterBar";
import SearchBar from "../../components/SearchBar";
import TaskList from "../../components/TaskList";
import { useAuth } from "../../contexts/AuthContext";
import { addTask, deleteTask, subscribeToTasks, updateTask } from "../../services/taskService";

const priorityRank = {
  low: 1,
  medium: 2,
  high: 3,
};

function toComparableDate(value) {
  if (!value) {
    return new Date(0);
  }

  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(0);
  }

  return parsed;
}

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("priority");
  const [priorityDirection, setPriorityDirection] = useState("asc");
  const [dateDirection, setDateDirection] = useState("desc");

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = subscribeToTasks(
        user.uid,
        (freshTasks) => {
          setTasks(freshTasks);
          setLoading(false);
        },
        (message) => {
          setError(message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des taches.");
      setLoading(false);
    }
  }, [user?.uid]);

  const remainingCount = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks]
  );

  const searchedTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return tasks;
    }

    return tasks.filter((task) => 
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query))
    );
  }, [searchQuery, tasks]);

  const filteredByStatus = useMemo(() => {
    if (filter === "active") {
      return searchedTasks.filter((task) => !task.completed);
    }
    if (filter === "completed") {
      return searchedTasks.filter((task) => task.completed);
    }
    return searchedTasks;
  }, [filter, searchedTasks]);

  const filteredTasks = useMemo(() => {
    const copy = [...filteredByStatus];
    if (sortOrder === "date") {
      const sortedByDate = copy.sort((a, b) => {
        const aDate = toComparableDate(a.dueDate || a.createdAt);
        const bDate = toComparableDate(b.dueDate || b.createdAt);
        return bDate - aDate;
      });
      return dateDirection === "desc" ? sortedByDate : sortedByDate.reverse();
    }

    const sorted = copy.sort(
      (a, b) => (priorityRank[a.priority] || 99) - (priorityRank[b.priority] || 99)
    );
    return priorityDirection === "asc" ? sorted : sorted.reverse();
  }, [dateDirection, filteredByStatus, priorityDirection, sortOrder]);

  const toggleTask = useCallback(
    async (id) => {
      if (!user?.uid) return;

      try {
        const task = tasks.find((t) => t.id === id);
        if (task) {
          await updateTask(user.uid, id, { completed: !task.completed });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la mise a jour.");
      }
    },
    [tasks, user?.uid]
  );

  const handleDeleteTask = useCallback(
    async (id) => {
      if (!user?.uid) return;

      try {
        await deleteTask(user.uid, id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la suppression.");
      }
    },
    [user?.uid]
  );

  const handleEditTask = useCallback(
    async (id, updates) => {
      if (!user?.uid) {
        throw new Error("Utilisateur non identifie.");
      }

      await updateTask(user.uid, id, updates);
    },
    [user?.uid]
  );

  const handleAddTask = useCallback(
    async ({ title, priority, description, dueDate }) => {
      if (!user?.uid) throw new Error("Utilisateur non identifie.");

      try {
        await addTask(user.uid, { title, priority, description, dueDate });
      } catch (err) {
        throw err;
      }
    },
    [user?.uid]
  );

  const togglePriorityDirection = useCallback(() => {
    setPriorityDirection((current) => (current === "asc" ? "desc" : "asc"));
  }, []);

  const toggleDateDirection = useCallback(() => {
    setDateDirection((current) => (current === "asc" ? "desc" : "asc"));
  }, []);

  return (
    <AuthGuard>
      <section className="mx-auto w-full max-w-285 px-3 pb-28 pt-6 sm:px-4">
      {error ? (
        <div className="mb-5 rounded-3xl bg-red-500/15 p-4 text-red-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" role="alert">
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : null}

      <header className="rounded-3xl bg-linear-to-br from-violet-600/20 via-slate-950 to-slate-900 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">
          TaskForce / Liste des taches
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Tasks
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
          Suis toutes tes taches dans une vue unique. Coche pour terminer, supprime pour nettoyer.
        </p>
        <div className="mt-5 inline-flex rounded-2xl bg-lime-300 px-4 py-2 text-sm font-bold uppercase tracking-[0.06em] text-zinc-900">
          {remainingCount} en cours
        </div>
      </header>

      <AddTaskForm onAddTask={handleAddTask} />

      <div className="mt-4 sm:mt-5">
        <Dashboard tasks={tasks} />
      </div>

      <div className="mt-4 sm:mt-5">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher une tache..."
        />
      </div>

      <div className="mt-3">
        <FilterBar
          currentFilter={filter}
          onFilterChange={setFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          priorityDirection={priorityDirection}
          onPriorityDirectionToggle={togglePriorityDirection}
          dateDirection={dateDirection}
          onDateDirectionToggle={toggleDateDirection}
        />
      </div>

      <div className="mt-4 sm:mt-5">
        {loading ? (
          <div className="rounded-3xl bg-white/4 p-8 text-center text-white/75 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-violet-200">Chargement</p>
            <p className="mt-3 text-base font-medium">Chargement de tes taches...</p>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onToggle={toggleTask}
            onDelete={handleDeleteTask}
            onUpdate={handleEditTask}
          />
        )}
      </div>
      </section>
    </AuthGuard>
  );
}
