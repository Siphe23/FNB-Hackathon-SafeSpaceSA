import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./MotivationalQuote.css";

const quotes = [
  "You are stronger than your fears.",
  "Every storm runs out of rain.",
  "Healing takes time, but you will get there.",
  "You deserve peace, love, and safety.",
];

export default function MotivationalQuote() {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="quote-box"
      key={quote}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      “{quote}”
    </motion.div>
  );
}
