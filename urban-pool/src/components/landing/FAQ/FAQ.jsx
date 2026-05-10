import { useState } from "react"
import "./faq.css"

const FAQ_DATA = [
  {
    question: "Can I request a ride that picks up friends from different locations?",
    answer:
      "Currently, Urban Pool supports one pickup and one drop location. Multi-stop rides will be available soon."
  },
  {
    question: "Is Urban Pool safe to use?",
    answer:
      "Yes. All users are verified and rides include ratings, reviews, and secure payments."
  },
  {
    question: "Can I offer a ride daily?",
    answer:
      "Absolutely. You can create recurring rides for your daily commute."
  },
  {
    question: "How do payments work?",
    answer:
      "Payments are handled securely inside the app. No cash required."
  }
]

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="faq">
      <h2>Frequently asked questions</h2>

      <div className="faq-list">
        {FAQ_DATA.map((item, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? "open" : ""}`}
            onClick={() => toggle(index)}
          >
            <div className="faq-question">
              <span>{item.question}</span>
              <span className="icon">{openIndex === index ? "−" : "+"}</span>
            </div>

            {openIndex === index && (
              <div className="faq-answer">{item.answer}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default FAQ