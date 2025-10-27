import React from "react";
import { motion } from "framer-motion";
import "./CenterCircle.css"; // 👈 Add this import

export default function CenterCircle({ activeFeature }) {
  return (
    <motion.div
      className="center-circle"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, duration: 3 }}
    >
  <div className="center-circle-content">
  <h2 className="circle-title">{activeFeature || "Stay Strong 💪"}</h2>
  <p className="circle-subtitle">
    You are not alone. <span className="highlight">SafeSpace</span> is here for you.
  </p>
</div>


    </motion.div>
  );
}
