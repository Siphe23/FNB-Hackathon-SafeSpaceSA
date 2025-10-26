import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./onboarding.css";

// ✅ Import images from src/Images folder
import HelpImg from "../../Images/HELP.jpg";
import SpeakImg from "../../Images/Speak.jpg";
import ChangeImg from "../../Images/Change.jpg";

const slides = [
  {
    title: "Get Help Instantly",
    text: "Press one button to call, chat, or report bullying anytime, anywhere.",
    img: HelpImg,
  },
  {
    title: "Speak Up Safely",
    text: "You can report anonymously. We’ll make sure your story is heard safely.",
    img: SpeakImg,
  },
  {
    title: "Be the Change",
    text: "Join a community that supports and uplifts each other every day.",
    img: ChangeImg,
  },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      navigate("/auth");
    }
  };

  const { title, text, img } = slides[current];

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <img src={img} alt={title} className="onboarding-img" />
        <h2 className="onboarding-title">{title}</h2>
        <p className="onboarding-text">{text}</p>

        <button className="onboarding-btn" onClick={handleNext}>
          {current === slides.length - 1 ? "Get Started" : "Next"}
        </button>
      </div>

      {/* ✅ Updated dots container */}
      <div className="onboarding-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`onboard-dot ${index === current ? "active" : ""}`}
          ></span>
        ))}
      </div>
    </div>
  );
}
