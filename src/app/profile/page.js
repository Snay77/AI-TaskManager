import AuthGuard from "../../components/AuthGuard";
import ProfilePageClient from "../../components/ProfilePageClient";

export const metadata = {
  title: "Profil - TaskForce",
  description: "Profil utilisateur TaskForce",
};

export default function ProfilePage() {
  return (
    <AuthGuard>
      <section className="mx-auto w-full max-w-285 px-3 pb-28 pt-6 sm:px-4">
        <ProfilePageClient />
      </section>
    </AuthGuard>
  );
}
