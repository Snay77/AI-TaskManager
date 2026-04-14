"use client";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative rounded-2xl bg-white/5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
      <label htmlFor="contact-search" className="sr-only">
        Rechercher un contact
      </label>

      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/50">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>

      <input
        id="contact-search"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Rechercher un contact..."
        className="h-12 w-full rounded-2xl bg-transparent pl-12 pr-12 text-sm text-white outline-none ring-1 ring-transparent placeholder:text-white/45 focus:ring-violet-300/60 sm:text-base"
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Effacer la recherche"
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/60 transition hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6 18 18M18 6 6 18" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
