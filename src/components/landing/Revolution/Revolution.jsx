import { Droplet, PieChart, Wind, TrafficCone, TrendingUp } from "lucide-react";
import "./Revolution.css";

const revolutionData = [
  {
    icon: Droplet,
    iconColor: "#3b82f6", // Blue
    iconBg: "#eff6ff",
    title: "Reduce Oil Dependency",
    desc: (
      <>
        &gt;85% of crude oil is imported. A significant amount of our fuel spend goes out of India. Carpooling can drastically <span style={{ color: "#3b82f6", fontWeight: "600" }}>reduce this dependency</span> and save national resources.
      </>
    )
  },
  {
    icon: PieChart,
    iconColor: "#10b981", // Green
    iconBg: "#ecfdf5",
    title: "Economic Boost",
    desc: (
      <>
        Removing just 5 lakh cars can save <span style={{ color: "#10b981", fontWeight: "600" }}>₹6,000 crore/year</span>. Redirecting this to "Made in India" products could boost the economy by approx <span style={{ color: "#10b981", fontWeight: "600" }}>₹60,000 crore</span>.
      </>
    )
  },
  {
    icon: Wind,
    iconColor: "#0ea5e9", // Cyan/Light Blue
    iconBg: "#f0f9ff",
    title: "Healthier Lives",
    desc: (
      <>
        Millions suffer from air pollution. Delhi became the asthma capital in 2020. Reducing cars through sharing leads to <span style={{ color: "#0ea5e9", fontWeight: "600" }}>cleaner air</span> and a healthier population.
      </>
    )
  },
  {
    icon: TrafficCone,
    iconColor: "#f59e0b", // Amber
    iconBg: "#fffbeb",
    title: "Decongest Cities",
    desc: (
      <>
        Fewer cars mean less traffic and better productivity. Bengaluru lost 50 crore liters of fuel in 2017. <span style={{ color: "#f59e0b", fontWeight: "600" }}>Find a ride</span> and be part of the solution.
      </>
    )
  }
];

export default function Revolution() {
  return (
    <section className="revolution-section">
      <div className="revolution-header">
        <p><TrendingUp size={16} /> Impact & Benefits</p>
        <h2>Why <span>Carpool Revolution?</span></h2>
        <div className="revolution-subtitle">
          Transforming India's commute culture for a sustainable and wealthier future.
        </div>
      </div>

      <div className="revolution-grid">
        {revolutionData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="revolution-card">
              <div 
                className="rev-icon-top" 
                style={{ backgroundColor: item.iconColor, color: "#fff", boxShadow: `0 8px 16px ${item.iconColor}40` }}
              >
                <IconComponent size={24} strokeWidth={2.5} />
              </div>
              
              <h3>{item.title}</h3>
              <p>{item.desc}</p>

              {/* The Hover Watermark */}
              <div 
                className="rev-icon-watermark" 
                style={{ color: item.iconColor }}
              >
                <IconComponent size={200} strokeWidth={1} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
