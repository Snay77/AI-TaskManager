import Link from "next/link";
import Navigation from "./Navigation";

export default function Header() {
  return (
    <header className="top-nav">
      <div className="top-nav-inner app-container">
        <Link href="/" className="brand">
          TaskForce
        </Link>
        <Navigation />
      </div>
    </header>
  );
}
