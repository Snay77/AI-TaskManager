"use client";

const filters = [
  { id: "toutes", label: "Toutes" },
  { id: "actives", label: "Actives" },
  { id: "completes", label: "Complétées" },
];

export default function FilterBar({ currentFilter, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Filtres des taches">
      {filters.map((filter) => {
        const isActive = currentFilter === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(filter.id)}
            aria-pressed={isActive}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-lime-300 text-zinc-950 shadow-[0_0_18px_rgba(223,255,0,0.28)]"
                : "bg-white/10 text-white/80 hover:bg-white/15"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
