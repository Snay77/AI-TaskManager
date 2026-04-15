import Link from "next/link";
import UserMenu from "./UserMenu";

export default function Header() {
  return (
    <header className="top-nav">
      <div className="top-nav-inner app-container">
        <Link href="/" className="brand">
          TaskForce
        </Link>
        <nav className="nav-links" aria-label="Navigation principale">
          <Link href="/" className="nav-link">
            Accueil
          </Link>
          <Link href="/tasks" className="nav-link">
            Tasks
          </Link>
          <Link href="/contact" className="nav-link">
            Contact
          </Link>
          <Link href="/profile" className="nav-link">
            Profil
          </Link>
        </nav>
        <UserMenu />
      </div>
    </header>
  );
}
