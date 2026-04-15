"use client";

import { useMemo, useState } from "react";

export default function AddTaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const displayError = useMemo(() => error, [error]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("Le titre de la tache est obligatoire.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onAddTask({
        title: cleanTitle,
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
      });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout de la tache.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-3xl bg-white/4 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] sm:mt-6 sm:p-5"
      noValidate
    >
      {displayError ? (
        <p className="mb-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200" role="alert">
          {displayError}
        </p>
      ) : null}

      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Titre de la tache"
            className="h-11 rounded-xl bg-white/8 px-4 text-sm font-medium text-white outline-none ring-1 ring-white/10 placeholder:text-white/45 focus:ring-lime-300/60"
            aria-label="Titre de la tache"
            disabled={loading}
          />

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="h-11 rounded-xl bg-violet-600/30 px-3 text-sm font-semibold text-white outline-none ring-1 ring-violet-400/40 focus:ring-lime-300/60"
            aria-label="Priorite de la tache"
            disabled={loading}
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

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optionnelle)"
          className="w-full min-h-28 rounded-xl bg-white/8 px-4 py-3 text-sm font-medium text-white outline-none ring-1 ring-white/10 placeholder:text-white/45 focus:ring-lime-300/60 resize-none"
          aria-label="Description de la tache"
          disabled={loading}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="w-full h-11 rounded-xl bg-white/8 px-4 text-sm font-medium text-white outline-none ring-1 ring-white/10 focus:ring-lime-300/60"
          aria-label="Date d'echeance"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-lime-300 px-5 text-sm font-extrabold uppercase tracking-[0.06em] text-zinc-950 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {loading ? "Ajout en cours..." : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
