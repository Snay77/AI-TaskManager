"use client";

import { useState } from "react";

export default function AddTaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("moyenne");

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      return;
    }

    onAddTask({
      title: cleanTitle,
      priority,
    });

    setTitle("");
    setPriority("moyenne");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-3xl bg-white/4 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] sm:mt-6 sm:p-5"
    >
      <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Titre de la tache"
          className="h-11 rounded-xl bg-white/8 px-4 text-sm font-medium text-white outline-none ring-1 ring-white/10 placeholder:text-white/45 focus:ring-lime-300/60"
          aria-label="Titre de la tache"
        />

        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          className="h-11 rounded-xl bg-white/8 px-3 text-sm font-semibold text-white outline-none ring-1 ring-white/10 focus:ring-lime-300/60"
          aria-label="Priorite de la tache"
        >
          <option value="haute" className="text-zinc-900">
            Haute
          </option>
          <option value="moyenne" className="text-zinc-900">
            Moyenne
          </option>
          <option value="basse" className="text-zinc-900">
            Basse
          </option>
        </select>

        <button
          type="submit"
          className="h-11 rounded-xl bg-lime-300 px-5 text-sm font-extrabold uppercase tracking-[0.06em] text-zinc-950 transition hover:brightness-95"
        >
          Ajouter
        </button>
      </div>
    </form>
  );
}
