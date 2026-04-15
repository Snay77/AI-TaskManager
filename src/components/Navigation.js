"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import UserMenu from "./UserMenu";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/tasks", label: "Mes tâches" },
  { href: "/shared", label: "Listes partagées" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  const displayLinks = user ? [...links, { href: "/profile", label: "Profil" }] : [];

  return (
    <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
      {displayLinks.length ? (
        <nav className="flex flex-wrap items-center gap-2" aria-label="Navigation principale">
          {displayLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-lime-300 text-zinc-950 shadow-[0_0_18px_rgba(223,255,0,0.25)]"
                    : "bg-white/10 text-white/80 hover:bg-white/15"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      ) : null}

      <UserMenu />
    </div>
  );
}
