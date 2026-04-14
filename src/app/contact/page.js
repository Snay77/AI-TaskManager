import ContactCard from "../../components/ContactCard";

export const metadata = {
  title: "Contact - TaskForce",
  description: "Page contact TaskForce",
};

export default function ContactPage() {
  const contacts = [
    {
      name: "Ethan Barlet",
      email: "ethan.barlet@taskforce.app",
      phone: "06 30 30 52 25",
      avatarUrl: "https://sharebox.city/wp-content/uploads/2025/10/Ethan-signature.png",
    },
    {
      name:"Marie Dupont",
      email: "marie@example.com",
      phone: "06 12 34 56 78",
      avatarUrl: "",
    },
    {
      name: "Jean Martin",
      email: "jean@example.com",
      phone: "06 98 76 54 32",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
    },
  ];

  return (
    <section className="contact-page">
      <div className="contact-grid">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.email}
            name={contact.name}
            email={contact.email}
            phone={contact.phone}
            avatarUrl={contact.avatarUrl}
          />
        ))}
      </div>
    </section>
  );
}
