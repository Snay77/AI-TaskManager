"use client";

import { useMemo, useState } from "react";
import AddTaskForm from "../../components/AddTaskForm";
import FilterBar from "../../components/FilterBar";
import SearchBar from "../../components/SearchBar";
import TaskList from "../../components/TaskList";

const initialTasks = [
  {
    id: 1,
    title: "Finaliser la proposition client",
    description: "Soumettre la version finale au client avant 17h.",
    date: "2026-04-18",
    priority: "haute",
    completed: false,
    createdAt: "2026-04-13T08:30:00.000Z",
  },
  {
    id: 2,
    title: "Revue UX mobile",
    description: "Verifier les interactions sur ecrans <= 640px.",
    date: "2026-04-20",
    priority: "moyenne",
    completed: false,
    createdAt: "2026-04-13T10:15:00.000Z",
  },
  {
    id: 3,
    title: "Nettoyer le backlog",
    description: "Fermer les tickets obsoletes et reprioriser les autres.",
    date: "2026-04-22",
    priority: "basse",
    completed: true,
    createdAt: "2026-04-12T16:45:00.000Z",
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("priority");
  const [priorityDirection, setPriorityDirection] = useState("asc");
  const [dateDirection, setDateDirection] = useState("desc");

  const remainingCount = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks]
  );

  const searchedTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return tasks;
    }

    return tasks.filter((task) => task.title.toLowerCase().includes(query));
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
    const priorityRank = {
      basse: 1,
      moyenne: 2,
      haute: 3,
    };

    const copy = [...filteredByStatus];
    if (sortOrder === "date") {
      const sortedByDate = copy.sort((a, b) => {
        const aDate = new Date(a.date || a.createdAt);
        const bDate = new Date(b.date || b.createdAt);
        return bDate - aDate;
      });
      return dateDirection === "desc" ? sortedByDate : sortedByDate.reverse();
    }

    const sorted = copy.sort(
      (a, b) => (priorityRank[a.priority] || 99) - (priorityRank[b.priority] || 99)
    );
    return priorityDirection === "asc" ? sorted : sorted.reverse();
  }, [dateDirection, filteredByStatus, priorityDirection, sortOrder]);

  const toggleTask = (id) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const addTask = ({ title, description, date, priority }) => {
    const newTask = {
      id: Date.now(),
      title,
      description: description || "Nouvelle tache ajoutee depuis le formulaire.",
      date: date || new Date().toISOString().slice(0, 10),
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((current) => [newTask, ...current]);
  };

  return (
    <section className="mx-auto w-full max-w-[1140px] px-3 pb-28 pt-6 sm:px-4">
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

      <AddTaskForm onAddTask={addTask} />

      <div className="mt-4 sm:mt-5">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher une tache..."
        />
      </div>

      <div className="mt-3">
        <FilterBar currentFilter={filter} onFilterChange={setFilter} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label htmlFor="task-sort" className="sr-only">
          Trier les taches
        </label>
        <select
          id="task-sort"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          className="h-11 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white outline-none ring-1 ring-white/10 focus:ring-violet-300/60"
        >
          <option value="priority" className="text-zinc-900">
            Trier par priorité
          </option>
          <option value="date" className="text-zinc-900">
            Trier par date
          </option>
        </select>

        {sortOrder === "priority" ? (
          <button
            type="button"
            onClick={() =>
              setPriorityDirection((current) => (current === "asc" ? "desc" : "asc"))
            }
            aria-label={
              priorityDirection === "asc"
                ? "Passer le tri priorité en descendant"
                : "Passer le tri priorité en ascendant"
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/15"
          >
            {priorityDirection === "asc" ? "Ascendant" : "Descendant"}
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {priorityDirection === "asc" ? (
                <>
                  <path d="M12 4v16" />
                  <path d="m7 9 5-5 5 5" />
                </>
              ) : (
                <>
                  <path d="M12 4v16" />
                  <path d="m7 15 5 5 5-5" />
                </>
              )}
            </svg>
          </button>
        ) : null}

        {sortOrder === "date" ? (
          <button
            type="button"
            onClick={() =>
              setDateDirection((current) => (current === "asc" ? "desc" : "asc"))
            }
            aria-label={
              dateDirection === "asc"
                ? "Passer le tri date en descendant"
                : "Passer le tri date en ascendant"
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/15"
          >
            {dateDirection === "asc" ? "Date asc." : "Date desc."}
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {dateDirection === "asc" ? (
                <>
                  <path d="M12 4v16" />
                  <path d="m7 9 5-5 5 5" />
                </>
              ) : (
                <>
                  <path d="M12 4v16" />
                  <path d="m7 15 5 5 5-5" />
                </>
              )}
            </svg>
          </button>
        ) : null}
      </div>

      <div className="mt-4 sm:mt-5">
        <TaskList tasks={filteredTasks} onToggle={toggleTask} onDelete={deleteTask} />
      </div>
    </section>
  );
}
