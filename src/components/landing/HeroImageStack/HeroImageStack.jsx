import { useEffect, useState } from "react";
import "./HeroImageStack.css";

import img1 from "../../../assets/hero/ride1.jpg";
import img2 from "../../../assets/hero/ride2.jpg";
import img3 from "../../../assets/hero/ride3.jpg";

const images = [img1, img2, img3];

function HeroImageStack() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-stack">
      {images.map((img, index) => {
        const position =
          index === active
            ? "active"
            : index === (active + 1) % images.length
              ? "next"
              : "back";

        return (
          <img
            key={index}
            src={img}
            alt="UrbanPool preview"
            className={`hero-img ${position}`}
          />
        );
      })}
    </div>
  );
}

export default HeroImageStack;