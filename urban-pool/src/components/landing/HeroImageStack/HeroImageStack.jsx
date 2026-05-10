import { useEffect, useState, useCallback } from "react";
import "./HeroImageStack.css";

import img1 from "../../../assets/hero/ride1.jpg";
import img2 from "../../../assets/hero/ride2.jpg";
import img3 from "../../../assets/hero/ride3.jpg";
import img4 from "../../../assets/hero/ride4.jpg";
import img5 from "../../../assets/hero/ride5.jpg";
import img6 from "../../../assets/hero/ride6.jpg";
import img7 from "../../../assets/hero/ride7.jpg";
import img8 from "../../../assets/hero/ride8.jpg";

const images = [img1, img2, img3, img4, img5, img6, img7, img8];

function HeroImageStack() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = images.length;

  const goToSlide = useCallback((index) => setActive(index), []);
  const goNext = useCallback(() => setActive((p) => (p + 1) % total), [total]);
  const goPrev = useCallback(() => setActive((p) => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(goNext, 4500);
    return () => clearInterval(id);
  }, [isPaused, goNext]);

  // Determine position class for each slide
  const getPosition = (index) => {
    if (index === active) return "center";
    if (index === (active - 1 + total) % total) return "left";
    if (index === (active + 1) % total) return "right";
    return "hidden";
  };

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="hero-carousel-track">
        {images.map((src, i) => {
          const pos = getPosition(i);
          return (
            <div
              key={i}
              className={`hero-card ${pos}`}
              onClick={() => {
                if (pos === "left") goPrev();
                else if (pos === "right") goNext();
              }}
            >
              <img src={src} alt={`UrbanPool ride ${i + 1}`} />
            </div>
          );
        })}
      </div>

      {/* Arrows */}
      <button className="hero-nav hero-nav-left" onClick={goPrev} aria-label="Previous">‹</button>
      <button className="hero-nav hero-nav-right" onClick={goNext} aria-label="Next">›</button>

      {/* Dots */}
      <div className="hero-dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === active ? "active" : ""}`}
            onClick={() => goToSlide(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroImageStack;