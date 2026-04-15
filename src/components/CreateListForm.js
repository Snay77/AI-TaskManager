"use client";

import { useState } from "react";

export default function CreateListForm({ onCreateList }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanName = name.trim();

    if (!cleanName) {
      setError("Le nom de la liste est obligatoire.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onCreateList(cleanName);
      setName("");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Erreur lors de la création de la liste.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white/4 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-5"
      noValidate
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="shared-list-name">
          Nom de la liste
        </label>
        <input
          id="shared-list-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nom de la liste"
          disabled={loading}
          className="h-11 flex-1 rounded-xl bg-white/8 px-4 text-sm font-medium text-white outline-none ring-1 ring-white/10 placeholder:text-white/45 focus:ring-lime-300/60"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-xl bg-lime-300 px-5 text-sm font-extrabold uppercase tracking-[0.06em] text-zinc-950 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {loading ? "Création..." : "Créer"}
        </button>
      </div>

      {error ? (
        <p className="mt-3 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
