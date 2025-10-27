import React, { useState } from "react";
import { motion } from "framer-motion";
import CenterCircle from "../../components/CenterCircle/CenterCircle";
import MotivationalQuote from "../../components/MotivationalQuote/MotivationalQuote";
import UserCard from "../../components/UserCard/UserCard";
import VideoRecorder from "../../components/VideoRecorder/VideoRecorder";

import { rtdb, ref, push, set } from "../../Firebase/firebase";

import ChatIcon from "../../assets/Chat.png";
import CallIcon from "../../assets/Call.png";
import VideoCallIcon from "../../assets/VideoCall.png";
import MicIcon from "../../assets/Record.png";
import VideoRecorderIcon from "../../assets/VideoRecord.png";
import SOSIcon from "../../assets/SOS.png";
import ShareLocationIcon from "../../assets/sharing.png";
import AIDetectorIcon from "../../assets/ai.png";

import "./Dashboard.css";
export default function Dashboard() {
  const [activeFeature, setActiveFeature] = useState("Welcome");
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);

  const circleFeatures = [
    { name: "Chat", icon: ChatIcon },
    { name: "Call", icon: CallIcon },
    { name: "Video Call", icon: VideoCallIcon },
    { name: "Voice Recorder", icon: MicIcon },
    { name: "Video Recorder", icon: VideoRecorderIcon },
    { name: "SOS Signal", icon: SOSIcon },
    { name: "Share Location", icon: ShareLocationIcon },
    { name: "AI Detector", icon: AIDetectorIcon },
  ];

  const radius =
    window.innerWidth < 480 ? 120 : window.innerWidth < 768 ? 160 : 200;
  const API_BASE = "http://localhost:5000/api";

  // 🎙 Voice Recorder (kept same)
  async function startVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        const formData = new FormData();
        formData.append("audio", file);

        const res = await fetch(`${API_BASE}/upload-audio`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          alert("✅ Audio uploaded successfully!");
          const newRef = push(ref(rtdb, "recordings"));
          await set(newRef, { url: data.fileUrl, timestamp: Date.now() });
        } else alert("❌ Upload failed!");
      };

      mediaRecorder.start();
      alert("🎙 Recording started — auto-stop in 5s.");
      setTimeout(() => mediaRecorder.stop(), 5000);
    } catch (err) {
      console.error("Voice error:", err);
      alert("❌ Cannot access microphone.");
    }
  }

  // 📍 Share Location
  async function shareLocation() {
    if (!navigator.geolocation) return alert("❌ Geolocation not supported.");

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      alert(`📍 Location shared:\n${mapsUrl}`);

      const newRef = push(ref(rtdb, "locations"));
      await set(newRef, { latitude, longitude, mapsUrl, timestamp: Date.now() });
    });
  }

  // 🚨 SOS
  async function sendSOS() {
    const newRef = push(ref(rtdb, "sos"));
    await set(newRef, { alert: "SOS Triggered!", timestamp: Date.now() });
    alert("🚨 SOS signal sent!");
  }
  // 💬 Open WhatsApp Chat
// 💬 Open WhatsApp Chat
function openChat() {
  const phone = prompt("📱 Enter phone number with country code (e.g., +15551234567):");
  if (!phone) return alert("No phone number entered.");

  const message = encodeURIComponent("Hello! 👋");
  const url = /Android|iPhone/i.test(navigator.userAgent)
    ? `whatsapp://send?phone=${phone}&text=${message}`
    : `https://wa.me/${phone}?text=${message}`;

  window.open(url, "_blank");
}

// 📞 Start WhatsApp Call (voice)
function startCall() {
  const phone = prompt("📞 Enter phone number with country code (e.g., +15551234567):");
  if (!phone) return alert("No phone number entered.");

  const url = /Android|iPhone/i.test(navigator.userAgent)
    ? `whatsapp://send?phone=${phone}`
    : `https://wa.me/${phone}`;
  window.open(url, "_blank");
}

// 🎥 Start WhatsApp Video Call (simulation)
function startVideoCall() {
  const phone = prompt("🎥 Enter phone number with country code (e.g., +15551234567):");
  if (!phone) return alert("No phone number entered.");

  const text = encodeURIComponent("Let's start a video call!");
  const url = /Android|iPhone/i.test(navigator.userAgent)
    ? `whatsapp://send?phone=${phone}&text=${text}`
    : `https://wa.me/${phone}?text=${text}`;
  window.open(url, "_blank");
}



function startVideoCall() {
  const phone = prompt("🎥 Enter phone number with country code (e.g., +15551234567):");
  if (!phone) return alert("No phone number entered.");

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(
    "Let's start a video call!"
  )}`;
  window.open(url, "_blank");
}

// 📍 Share Live Location (like WhatsApp)
async function shareLocation() {
  if (!navigator.geolocation) {
    alert("❌ Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    // Share via WhatsApp
    const shareText = encodeURIComponent(`📍 My location: ${mapsUrl}`);
    const url = `https://wa.me/?text=${shareText}`;
    window.open(url, "_blank");

    // Also save to Firebase Realtime DB
    const newRef = push(ref(rtdb, "locations"));
    await set(newRef, { latitude, longitude, mapsUrl, timestamp: Date.now() });
  });
}


 

  async function handleFeatureClick(name) {
  setActiveFeature(name);
  switch (name) {
    case "Chat":
      openChat();
      break;
    case "Call":
      startCall();
      break;
    case "Video Call":
      startVideoCall();
      break;
    case "Voice Recorder":
      startVoiceRecording();
      break;
    case "Video Recorder":
      setShowVideoRecorder(true);
      break;
    case "SOS Signal":
      sendSOS();
      break;
    case "Share Location":
      shareLocation();
      break;
    case "AI Detector":
      alert("🤖 AI Detector under construction 🚧");
      break;
    default:
      alert("Feature not implemented yet!");
  }
}


  return (
    <div className="dashboard-container">
      <div className="user-card-wrapper">
        <UserCard />
      </div>

      <div className="dashboard-circle-area">
        <CenterCircle activeFeature={activeFeature} />
        {circleFeatures.map((feature, index) => {
          const angle =
            (index / circleFeatures.length) * 2 * Math.PI - Math.PI / 2;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          return (
            <motion.div
              key={feature.name}
              className={`feature-icon-wrapper ${
                activeFeature === feature.name ? "active" : ""
              }`}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              onClick={() => handleFeatureClick(feature.name)}
            >
              <div className="icon-content">
                <motion.div
                  className={`icon-circle ${
                    activeFeature === feature.name ? "glow" : ""
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={feature.icon}
                    alt={feature.name}
                    className="icon-image"
                  />
                </motion.div>
                <p className="feature-name">{feature.name}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="quote-section">
        <MotivationalQuote />
      </div>

      {/* 🔹 Video Recorder Modal */}
      {showVideoRecorder && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              className="close-btn"
              onClick={() => setShowVideoRecorder(false)}
            >
              ✖ Close
            </button>

            <h2>🎥 Video Recorder</h2>

            <VideoRecorder
              onUploadComplete={async (url) => {
                const newRef = push(ref(rtdb, "videos"));
                await set(newRef, { url, timestamp: Date.now() });
                alert("✅ Video saved to Firebase Realtime DB!");
              }}
              autoStopMs={10000}
            />
          </div>
        </div>
      )}
    </div>
  );
}
