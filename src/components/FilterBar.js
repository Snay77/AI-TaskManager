"use client";
import { memo } from "react";

const filters = [
  { id: "all", label: "Toutes" },
  { id: "active", label: "Actives" },
  { id: "completed", label: "Complétées" },
];

function DirectionIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      {direction === "asc" ? (
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
  );
}

function FilterBar({
  currentFilter,
  onFilterChange,
  sortOrder,
  onSortOrderChange,
  priorityDirection,
  onPriorityDirectionToggle,
  dateDirection,
  onDateDirectionToggle,
}) {
  return (
    <div className="space-y-3">
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

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="task-sort" className="sr-only">
          Trier les taches
        </label>
        <select
          id="task-sort"
          value={sortOrder}
          onChange={(event) => onSortOrderChange(event.target.value)}
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
            onClick={onPriorityDirectionToggle}
            aria-label={
              priorityDirection === "asc"
                ? "Passer le tri priorité en descendant"
                : "Passer le tri priorité en ascendant"
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/15"
          >
            {priorityDirection === "asc" ? "Ascendant" : "Descendant"}
            <DirectionIcon direction={priorityDirection} />
          </button>
        ) : null}

        {sortOrder === "date" ? (
          <button
            type="button"
            onClick={onDateDirectionToggle}
            aria-label={
              dateDirection === "asc"
                ? "Passer le tri date en descendant"
                : "Passer le tri date en ascendant"
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/15"
          >
            {dateDirection === "asc" ? "Date asc." : "Date desc."}
            <DirectionIcon direction={dateDirection} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default memo(FilterBar);
