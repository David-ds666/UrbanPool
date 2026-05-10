import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, CONTACT_OPTIONS } from "./helpData";
import "./Help.css";

export default function Help() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  // Filter FAQs by search
  const filteredCategories = search.trim()
    ? CATEGORIES.map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase())
      ),
    })).filter((cat) => cat.faqs.length > 0)
    : CATEGORIES;

  const goToArticle = (catId, faqIndex) => {
    navigate(`/help/${catId}/${faqIndex}`);
  };

  return (
    <div className="help-page">
      {/* ── HERO ──────────────────────────────── */}
      <div className="help-hero">
        <h1>How can we help?</h1>
        <p>Search our help center or browse categories below</p>
        <div className="help-search">
          <span className="help-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for help topics..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveCategory(null);
            }}
          />
          {search && (
            <button className="help-search-clear" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── CATEGORIES ─────────────────────────── */}
      {!search && (
        <div className="help-categories">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`help-cat-card ${activeCategory === cat.id ? "help-cat-active" : ""}`}
              onClick={() =>
                setActiveCategory(activeCategory === cat.id ? null : cat.id)
              }
            >
              <span className="help-cat-icon">{cat.icon}</span>
              <h3>{cat.title}</h3>
              <p>{cat.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── FAQ LIST (links, not accordions) ───── */}
      <div className="help-faqs">
        {(search ? filteredCategories : activeCategory
          ? CATEGORIES.filter((c) => c.id === activeCategory)
          : CATEGORIES
        ).map((cat) => (
          <div key={cat.id} className="help-faq-group">
            <h2 className="help-faq-group-title">
              {cat.icon} {cat.title}
            </h2>
            {cat.faqs.map((faq, i) => {
              // Find original index in CATEGORIES for consistent routing
              const origCat = CATEGORIES.find((c) => c.id === cat.id);
              const origIdx = origCat
                ? origCat.faqs.findIndex((f) => f.q === faq.q)
                : i;

              return (
                <div
                  key={`${cat.id}-${i}`}
                  className="help-faq-link"
                  onClick={() => goToArticle(cat.id, origIdx)}
                >
                  <span>{faq.q}</span>
                  <span className="help-faq-arrow">→</span>
                </div>
              );
            })}
          </div>
        ))}

        {search && filteredCategories.length === 0 && (
          <div className="help-no-results">
            <span>🔍</span>
            <h3>No results found</h3>
            <p>Try different keywords or browse the categories above</p>
          </div>
        )}
      </div>

      {/* ── CONTACT SECTION ────────────────────── */}
      <div className="help-contact">
        <h2>Still need help?</h2>
        <p>Get in touch with our support team</p>
        <div className="help-contact-grid">
          {CONTACT_OPTIONS.map((opt) => (
            <div key={opt.title} className="help-contact-card">
              <span className="help-contact-icon">{opt.icon}</span>
              <h3>{opt.title}</h3>
              <p>{opt.desc}</p>
              <span className="help-contact-detail">{opt.detail}</span>
              <button className="help-contact-btn">{opt.action}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}