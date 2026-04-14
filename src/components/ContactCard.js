"use client";
import { useEffect, useMemo, useState } from "react";

export default function ContactCard({ name, email, phone, avatarUrl }) {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const initials = useMemo(() => {
    const parts = (name || "").trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "??";
  }, [name]);

  const hasAvatar = Boolean(avatarUrl?.trim()) && !imageError;

  useEffect(() => {
    if (!copied) {
      return undefined;
    }
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopyEmail = async () => {
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("Clipboard API indisponible");
      }
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      alert(`Impossible de copier automatiquement. Email: ${email}`);
    }
  };

  return (
    <article className="contact-card">
      <div className="contact-avatar-wrap">
        {hasAvatar ? (
          <img src={avatarUrl} alt={name} className="contact-avatar" onError={() => setImageError(true)} />
        ) : (
          <div className="contact-avatar-fallback" aria-label={`Initiales de ${name}`}>
            {initials}
          </div>
        )}
      </div>

      <div className="contact-content">
        <p className="contact-kicker">Contact principal</p>
        <h2 className="contact-name">{name}</h2>

        <div className="contact-meta">
          <p>
            <span className="contact-meta-label">Email</span>
            <a href={`mailto:${email}`} className="contact-meta-value">
              {email}
            </a>
          </p>
          <p>
            <span className="contact-meta-label">Telephone</span>
            <a href={`tel:${phone.replace(/\s+/g, "")}`} className="contact-meta-value">
              {phone}
            </a>
          </p>
        </div>

        <button
          type="button"
          className="contact-copy-btn"
          onClick={handleCopyEmail}
          aria-label={`Copier l'email de ${name}`}
        >
          {copied ? "Copié !" : "Copier l'email"}
        </button>
      </div>
    </article>
  );
}