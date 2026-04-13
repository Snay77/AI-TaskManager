// Page d'accueil épurée pour TaskManager
export default function Home() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans">
      {/* Titre principal */}
      <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4" tabIndex={0}>
        TaskManager
      </h1>
      {/* Sous-titre */}
      <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8" tabIndex={0}>
        Gérez vos tâches efficacement
      </p>
      {/* Bouton Commencer */}
      <a
        href="#"
        className="px-8 py-3 rounded-full bg-blue-600 text-white text-lg font-semibold shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        role="button"
        aria-label="Commencer à gérer vos tâches"
      >
        Commencer
      </a>
    </main>
  );
}
