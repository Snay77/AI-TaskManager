import SignupForm from "../../components/SignupForm";

export const metadata = {
  title: "Inscription - TaskForce",
  description: "Creation de compte TaskForce",
};

export default function SignupPage() {
  return (
    <section className="mx-auto w-full max-w-285 px-3 pb-28 pt-6 sm:px-4">
      <header className="rounded-3xl bg-linear-to-br from-violet-700/25 via-slate-950 to-black p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">TaskForce / Authentification</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Inscription</h1>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          Creez votre compte pour synchroniser vos taches et suivre votre progression.
        </p>
      </header>

      <div className="mx-auto mt-5 w-full max-w-xl sm:mt-6">
        <SignupForm />
      </div>
    </section>
  );
}
