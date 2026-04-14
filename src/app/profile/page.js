export const metadata = {
  title: "Profil - TaskForce",
  description: "Profil utilisateur TaskForce",
};

export default function ProfilePage() {
  const user = {
    firstName: "Ethan",
    lastName: "Barlet",
    email: "ethan.barlet@taskforce.app",
  };

  const stats = {
    total: 128,
    finished: 84,
    notFinished: 44,
    inProgress: 12,
  };

  return (
    <section className="mx-auto w-full max-w-[1140px] px-3 pb-28 pt-6 sm:px-4">
      <header className="rounded-3xl bg-linear-to-br from-violet-700/25 via-slate-950 to-black p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">TaskForce / Profil</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Mon profil</h1>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          Vue globale de ton compte et de ta progression depuis le debut.
        </p>
      </header>

      <article className="mt-5 rounded-3xl bg-white/4 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Informations utilisateur</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/6 p-4">
            <dt className="text-xs font-semibold uppercase tracking-widest text-white/60">Nom</dt>
            <dd className="mt-2 text-lg font-bold text-white">{user.lastName}</dd>
          </div>
          <div className="rounded-2xl bg-white/6 p-4">
            <dt className="text-xs font-semibold uppercase tracking-widest text-white/60">Prenom</dt>
            <dd className="mt-2 text-lg font-bold text-white">{user.firstName}</dd>
          </div>
          <div className="rounded-2xl bg-white/6 p-4 sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-widest text-white/60">Email</dt>
            <dd className="mt-2 text-lg font-bold text-white">{user.email}</dd>
          </div>
        </dl>
      </article>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl bg-white/4 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Total des taches</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-white">{stats.total}</p>
        </article>
        <article className="rounded-2xl bg-emerald-500/20 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100/80">Taches finies</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-emerald-50">{stats.finished}</p>
        </article>
        <article className="rounded-2xl bg-amber-400/20 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-100/80">Taches pas finies</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-amber-50">{stats.notFinished}</p>
        </article>
        <article className="rounded-2xl bg-violet-600/25 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-100/85">Pas encore fini</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-violet-50">{stats.inProgress}</p>
        </article>
      </div>
    </section>
  );
}
