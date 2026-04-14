import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bottom-nav-wrap" aria-label="Navigation rapide">
      <div className="bottom-nav">
        <Link href="/" className="is-active">
          Accueil
        </Link>
        <Link href="/tasks">Tasks</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/profile">Profil</Link>
      </div>
    </footer>
  );
}
