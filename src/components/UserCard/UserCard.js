import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../Firebase/firebase";
import Profile from "../../pages/Profile/Profile"; 

import { Settings, Edit, LogOut, ChevronUp } from "lucide-react";

import "./UserCard.css";

export default function UserCard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setProfile(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setExpandedSection(null);
  };

  if (!user) return <p className="user-status">Not logged in</p>;

  const name = profile?.displayName || user.displayName || "User";
  const avatar =
    profile?.photoURL || user.photoURL || "https://via.placeholder.com/100";

  return (
    <div className="user-card">
      <img src={avatar} alt="User Avatar" className="user-avatar" />
      <h3 className="user-name">{name}</h3>

      {/* Action Buttons */}
      <div className="user-actions-inline">
        <button
          className={`user-action-btn ${expandedSection === "settings" ? "active" : ""}`}
          onClick={() =>
            setExpandedSection(expandedSection === "settings" ? null : "settings")
          }
        >
          <Settings className="user-action-icon" />
        </button>

        <button
          className={`user-action-btn ${expandedSection === "edit" ? "active" : ""}`}
          onClick={() =>
            setExpandedSection(expandedSection === "edit" ? null : "edit")
          }
        >
          <Edit className="user-action-icon" />
        </button>

        <button className="user-action-btn" onClick={handleLogout}>
          <LogOut className="user-action-icon" />
        </button>
      </div>

      {/* === Expandable Sections === */}
      <div
        className={`expandable-section ${
          expandedSection ? "expanded" : ""
        }`}
      >
        {expandedSection === "edit" && (
          <div className="expanded-content">
            <div className="section-header">
              <h3>Edit Profile</h3>
              <button
                className="close-section"
                onClick={() => setExpandedSection(null)}
              >
                <ChevronUp />
              </button>
            </div>
            {/* Your existing Profile.js rendered here */}
            <Profile />
          </div>
        )}

        {expandedSection === "settings" && (
          <div className="expanded-content">
            <div className="section-header">
              <h3>Settings</h3>
              <button
                className="close-section"
                onClick={() => setExpandedSection(null)}
              >
                <ChevronUp />
              </button>
            </div>
            <div className="settings-options">
              <label>
                <input type="checkbox" /> Enable Dark Mode (Coming soon)
              </label>
              <label>
                <input type="checkbox" /> Email Notifications
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
