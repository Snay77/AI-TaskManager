import AuthGuard from "../../components/AuthGuard";
import ContactPageClient from "./ContactPageClient";

export const metadata = {
  title: "Contact - TaskForce",
  description: "Page contact TaskForce",
};

export default function ContactPage() {
  return (
    <AuthGuard>
      <ContactPageClient />
    </AuthGuard>
  );
}
