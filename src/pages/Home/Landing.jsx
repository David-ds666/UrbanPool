import { useNavigate } from "react-router-dom";
import RideSearchCard from "../../components/landing/RideSearchCard/RideSearchCard";
import HeroImageStack from "../../components/landing/HeroImageStack/HeroImageStack";
import Suggestions from "../../components/landing/Suggestions/Suggestions";
import Benefits from "../../components/landing/Benefits/Benefits";
import Revolution from "../../components/landing/Revolution/Revolution";
import PlanForLater from "../../components/landing/PlanForLater/PlanForLater";
import "./Landing.css";
import ExploreSection from "../../components/landing/ExploreSection/ExploreSection";

function Landing() {
  const navigate = useNavigate();

  const handleSearch = (rideData) => {
    navigate("/search", {
      state: rideData,
    });
  };

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="hero">
        <div className="hero-inner">
          {/* LEFT */}
          <RideSearchCard onSearch={handleSearch} />

          {/* RIGHT */}
          <div className="hero-right">
            <HeroImageStack />
          </div>
        </div>
      </section>

      {/* ================= SUGGESTIONS ================= */}
      <section className="section">
        <Suggestions />
        <ExploreSection />

      </section>

      {/* ================= PLAN FOR LATER ================= */}
      <PlanForLater />

      {/* ================= BENEFITS ================= */}
      <Benefits />

      {/* ================= REVOLUTION ================= */}
      <Revolution />
    </>
  );
}

export default Landing;