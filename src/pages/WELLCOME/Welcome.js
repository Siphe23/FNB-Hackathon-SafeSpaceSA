import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/onboarding"); 
  };

  return (
    <div className="welcome-container">
      <h1 className="welcome-title">Welcome to SafeSpace SA</h1>

     
      <motion.div
        className="breathing-circle"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>

      <p className="welcome-text">
        Take a deep breath... <br /> you are in a safe space now.
      </p>

      <button className="continue-btn" onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
};

export default WelcomePage;
