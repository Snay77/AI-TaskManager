"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

const authenticatedLinks = [
  { href: "/", label: "Accueil" },
  { href: "/tasks", label: "Mes tâches" },
  { href: "/shared", label: "Listes partagées" },
  { href: "/profile", label: "Profil" },
];

const guestLinks = [
  { href: "/login", label: "Connexion" },
  { href: "/signup", label: "Inscription" },
];

export default function Footer() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = user ? authenticatedLinks : guestLinks;

  return (
    <footer className="bottom-nav-wrap" aria-label="Navigation rapide">
      <div className="bottom-nav">
        {links.map((link) => {
          const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

          return (
            <Link key={link.href} href={link.href} className={isActive ? "is-active" : undefined}>
              {link.label}
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
