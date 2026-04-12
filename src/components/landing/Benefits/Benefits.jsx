import { useEffect, useRef } from "react";
import "./Benefits.css";

import benefitMoney from "../../../assets/images/benefits/benefit_money.png";
import benefitHealth from "../../../assets/images/benefits/benefit_health.png";
import benefitTraffic from "../../../assets/images/benefits/benefit_traffic.png";
import benefitStress from "../../../assets/images/benefits/benefit_stress.png";
import benefitFriends from "../../../assets/images/benefits/benefit_friends.png";
import benefitSustainable from "../../../assets/images/benefits/benefit_sustainable.png";

const benefitsData = [
  {
    title: "Share Cost - Save Money",
    desc: "With our carpool app you can split expenses between carpoolers and seekers for fuel. On average a person can save INR 50K per annum by choosing not to go alone through rideshare services. Apart from fuel cost you can also split parking fees, tolls and wear and tears.",
    img: benefitMoney
  },
  {
    title: "Health Benefits",
    desc: "Delhi became the most polluted city in the world with pollution 65 times above WHO acceptable limit. As per Delhi Pollution survey 7 in 10 Families have at least 1 person suffering. Air pollution killed 2.1 million in India in 2021. Let's keep your car and bikes at home.",
    img: benefitHealth
  },
  {
    title: "Reduce Traffic Congestion",
    desc: "By reducing the number of cars on the road through carpooling transportation, traffic congestion can also be reduced, resulting in faster journeys. As per report published 42 crore manhours are lost in Bengaluru alone. Never-ending traffic jams are the result of small road sizes.",
    img: benefitTraffic
  },
  {
    title: "Reduced Stress & Fatigue",
    desc: "Daily commuting can be stressful, especially in congested cities. Using rideshare near me services can significantly reduce the stress and fatigue associated with driving in heavy traffic. Passengers can relax, read, or even catch up on work while someone else takes the wheel.",
    img: benefitStress
  },
  {
    title: "Make New Friends",
    desc: "Our car pooling app promotes interaction between people who share journeys, which can strengthen social relations and create bonds between work colleagues or travel companions. Commuting alone in heavy traffic can be stressful, while carpooling offers social engagement.",
    img: benefitFriends
  },
  {
    title: "Sustainable Future",
    desc: "Car pool india initiatives align with the goal of building a more sustainable and environmentally friendly future. By choosing to carpool, individuals contribute to the reduction of greenhouse gas emissions and the preservation of natural resources.",
    img: benefitSustainable
  }
];

export default function Benefits() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Stop observing once animated
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px" // triggers slightly before entering view
      }
    );

    const cards = document.querySelectorAll(".benefit-card");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="benefits-section">
      <div className="benefits-inner">
        <div className="benefits-header">
          <p>Core Features</p>
          <h2>Why Choose <span className="brand-urban">Urban</span><span className="brand-pool">Pool?</span></h2>
          <div className="benefits-subtitle">
            Experience savings, sustainability, and a stronger community through rideshare and carpool services.
          </div>
        </div>

        <div className="benefits-grid">
          {benefitsData.map((item, index) => (
            <div 
              key={index} 
              className="benefit-card"
              style={{ "--delay": `${index * 120}ms` }}
            >
              <div className="benefit-img-wrapper">
                <img src={item.img} alt={item.title} />
              </div>
              <div className="benefit-content">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
