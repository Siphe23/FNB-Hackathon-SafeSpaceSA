import React, { useState } from "react";
import { motion } from "framer-motion";
import CenterCircle from "../../components/CenterCircle/CenterCircle";
import MotivationalQuote from "../../components/MotivationalQuote/MotivationalQuote";
import UserCard from "../../components/UserCard/UserCard";
import VideoRecorder from "../../components/VideoRecorder/VideoRecorder";
import RecordingsList from "../../components/RecordingsList/RecordingsList";

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
  const [showRecordingsList, setShowRecordingsList] = useState(false);

  // 🔹 Live location tracking state
  const [isSharingLiveLocation, setIsSharingLiveLocation] = useState(false);
  const [liveRef, setLiveRef] = useState(null);
  const [liveInterval, setLiveInterval] = useState(null);

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

  /* ------------------ Location + SOS Logic ------------------ */
  async function reverseGeocode(lat, lon) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
        { headers: { "User-Agent": "SafeSpaceApp/1.0" } }
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // ✅ Live Location Sharing (start/stop)
  async function shareLocation() {
    if (!navigator.geolocation)
      return alert("❌ Geolocation not supported on this device.");

    // 🟥 Stop sharing if already active
    if (isSharingLiveLocation && liveInterval) {
      clearInterval(liveInterval);
      setLiveInterval(null);
      setIsSharingLiveLocation(false);

      if (liveRef) {
        await set(liveRef, null);
        setLiveRef(null);
      }

      alert("🛑 Live location sharing stopped.");
      return;
    }

    // 🟢 Start sharing
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const geo = await reverseGeocode(latitude, longitude);
        const place =
          geo?.display_name ||
          `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

        const newRef = push(ref(rtdb, "liveLocations"));
        setLiveRef(newRef);

        await set(newRef, {
          latitude,
          longitude,
          place,
          mapsUrl,
          timestamp: Date.now(),
          active: true,
        });

        // WhatsApp message
        const waUrl = `https://wa.me/?text=${encodeURIComponent(
          `📍 I'm sharing my *live location*.\nTrack me here: ${mapsUrl}\n(Updates every 10 seconds)`
        )}`;
        window.open(waUrl, "_blank");

        alert("✅ Live location sharing started!");

        // Start auto-update every 10 seconds
        const interval = setInterval(async () => {
          navigator.geolocation.getCurrentPosition(async (p) => {
            const { latitude, longitude } = p.coords;
            const updatedUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            await set(newRef, {
              latitude,
              longitude,
              mapsUrl: updatedUrl,
              timestamp: Date.now(),
              active: true,
            });
          });
        }, 10000);

        setLiveInterval(interval);
        setIsSharingLiveLocation(true);
      },
      () => alert("❌ Could not get location."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function sendSOS() {
    const defaultEmergency = "112";
    const number =
      prompt("Enter emergency number (default 112):", defaultEmergency) ||
      defaultEmergency;
    try {
      const newRef = push(ref(rtdb, "sos"));
      await set(newRef, {
        alert: "🚨 SOS Triggered",
        number,
        timestamp: Date.now(),
      });
    } catch {}
    window.location.href = `tel:${number}`;
  }

  function openWhatsAppChat() {
    const phone = prompt("Enter phone number (+countrycode):");
    if (!phone) return;
    const url = `https://wa.me/${phone.replace(
      /[^\d+]/g,
      ""
    )}?text=${encodeURIComponent("Hello 👋")}`;
    window.open(url, "_blank");
  }

  function startPhoneCall() {
    const phone = prompt("Enter phone number (+countrycode):");
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  }

  function startVideoCallPlaceholder() {
    const phone = prompt("Enter phone number (+countrycode):");
    if (!phone) return;
    const url = `https://wa.me/${phone.replace(
      /[^\d+]/g,
      ""
    )}?text=${encodeURIComponent("Can we start a video call?")}`;
    window.open(url, "_blank");
  }

  /* ------------------ Dispatcher ------------------ */
  async function handleFeatureClick(name) {
    setActiveFeature(name);
    switch (name) {
      case "Chat":
        openWhatsAppChat();
        break;
      case "Call":
        startPhoneCall();
        break;
      case "Video Call":
        startVideoCallPlaceholder();
        break;
      case "Voice Recorder":
        setShowRecordingsList(true);
        break;
      case "Video Recorder":
        setShowVideoRecorder(true);
        break;
      case "SOS Signal":
        await sendSOS();
        break;
      case "Share Location":
        await shareLocation();
        break;
      case "AI Detector":
        alert("🤖 AI Detector: Under Construction 🚧");
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

      {/* 🎧 Voice Recorder Modal */}
      {showRecordingsList && (
        <div className="modal-overlay">
          <div className="modal responsive-modal">
            <button
              className="close-btn"
              onClick={() => setShowRecordingsList(false)}
            >
              ✖
            </button>
            <h2>🎙 Voice Recorder</h2>
            <RecordingsList />
          </div>
        </div>
      )}

      {/* 🎥 Video Recorder Modal */}
      {showVideoRecorder && (
        <div className="modal-overlay">
          <div className="modal responsive-modal">
            <button
              className="close-btn"
              onClick={() => setShowVideoRecorder(false)}
            >
              ✖
            </button>
            <h2>🎥 Video Recorder</h2>
            <VideoRecorder
              onUploadComplete={async (url) => {
                const newRef = push(ref(rtdb, "videos"));
                await set(newRef, { url, timestamp: Date.now() });
                alert("✅ Video saved!");
              }}
              autoStopMs={0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
