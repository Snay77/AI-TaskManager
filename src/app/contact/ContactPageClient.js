"use client";

import { useMemo, useState } from "react";
import ContactCard from "../../components/ContactCard";
import SearchBar from "../../components/SearchBar";

const contacts = [
  {
    name: "Ethan Barlet",
    email: "ethan.barlet@taskforce.app",
    phone: "06 30 30 52 25",
    avatarUrl: "https://sharebox.city/wp-content/uploads/2025/10/Ethan-signature.png",
  },
  {
    name: "Marie Dupont",
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

export default function ContactPageClient() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return contacts;
    }

    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <section className="contact-page">
      <div className="mb-5 sm:mb-6">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="contact-grid">
        {filteredContacts.map((contact) => (
          <ContactCard
            key={contact.email}
            name={contact.name}
            email={contact.email}
            phone={contact.phone}
            avatarUrl={contact.avatarUrl}
          />
        ))}
      </div>

      {!filteredContacts.length ? (
        <div className="mt-4 rounded-2xl bg-white/4 p-6 text-center text-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          Aucun contact trouve pour "{searchQuery}".
        </div>
      ) : null}
    </section>
  );
}
