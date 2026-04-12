import { useParams, useNavigate } from "react-router-dom";
import { CATEGORIES } from "./helpData";
import "./HelpArticle.css";

export default function HelpArticle() {
    const { categoryId, faqIndex } = useParams();
    const navigate = useNavigate();

    const category = CATEGORIES.find((c) => c.id === categoryId);
    const faq = category?.faqs?.[Number(faqIndex)];

    if (!category || !faq) {
        return (
            <div className="ha-page">
                <div className="ha-empty">
                    <span>😕</span>
                    <h2>Article not found</h2>
                    <p>The help article you're looking for doesn't exist.</p>
                    <button className="ha-back-btn" onClick={() => navigate("/help")}>
                        Back to Help Center
                    </button>
                </div>
            </div>
        );
    }

    // Related questions = other FAQs in the same category (excluding current)
    const related = category.faqs
        .map((f, i) => ({ ...f, idx: i }))
        .filter((_, i) => i !== Number(faqIndex));

    return (
        <div className="ha-page">
            {/* Breadcrumb */}
            <div className="ha-breadcrumb">
                <span className="ha-breadcrumb-link" onClick={() => navigate("/help")}>
                    Help Center
                </span>
                <span className="ha-breadcrumb-sep">›</span>
                <span className="ha-breadcrumb-link" onClick={() => navigate("/help")}>
                    {category.icon} {category.title}
                </span>
                <span className="ha-breadcrumb-sep">›</span>
                <span className="ha-breadcrumb-current">Article</span>
            </div>

            {/* Main content */}
            <div className="ha-content">
                <div className="ha-main">
                    {/* Article */}
                    <article className="ha-article">
                        <div className="ha-category-badge">
                            {category.icon} {category.title}
                        </div>
                        <h1>{faq.q}</h1>
                        <div className="ha-answer">{faq.a}</div>

                        {/* Tips */}
                        {faq.tips && faq.tips.length > 0 && (
                            <div className="ha-tips">
                                <h3>💡 Quick Tips</h3>
                                <ul>
                                    {faq.tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Helpful? */}
                        <div className="ha-feedback">
                            <p>Was this article helpful?</p>
                            <div className="ha-feedback-btns">
                                <button
                                    className="ha-feedback-btn"
                                    onClick={() => {
                                        const btn = document.querySelector('.ha-feedback');
                                        btn.innerHTML = '<p class="ha-thank-you">Thanks for your feedback! 🎉</p>';
                                    }}
                                >
                                    👍 Yes
                                </button>
                                <button
                                    className="ha-feedback-btn"
                                    onClick={() => {
                                        const btn = document.querySelector('.ha-feedback');
                                        btn.innerHTML = '<p class="ha-thank-you">We\'ll work on improving this. Thanks! 🙏</p>';
                                    }}
                                >
                                    👎 No
                                </button>
                            </div>
                        </div>
                    </article>

                    {/* Sidebar — Related questions */}
                    <aside className="ha-sidebar">
                        <h3>Related questions</h3>
                        {related.map((r) => (
                            <div
                                key={r.idx}
                                className="ha-related-link"
                                onClick={() => navigate(`/help/${categoryId}/${r.idx}`)}
                            >
                                <span>{r.q}</span>
                                <span className="ha-related-arrow">→</span>
                            </div>
                        ))}

                        <div className="ha-sidebar-cta">
                            <h4>Can't find what you need?</h4>
                            <p>Our support team is available 24/7</p>
                            <button
                                className="ha-contact-btn"
                                onClick={() => navigate("/help")}
                            >
                                Contact Support
                            </button>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Back to help */}
            <div className="ha-bottom-nav">
                <button className="ha-back-btn" onClick={() => navigate("/help")}>
                    ← Back to Help Center
                </button>
            </div>
        </div>
    );
}
