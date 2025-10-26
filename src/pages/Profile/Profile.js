import React, { useState, useEffect } from "react";
import { auth, db } from "../../Firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import toast from "react-hot-toast";
import "./profile.css";

export default function Profile() {
  const user = auth.currentUser;
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    phone: "",
    photoURL: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔹 Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setFormData(userDoc.data());
        } else {
          setFormData({
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            bio: "",
            phone: "",
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // 🔹 Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Handle image upload (convert to compressed Base64)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 250;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // ✅ compress to JPEG (quality 0.7)
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

        setFormData((prev) => ({ ...prev, photoURL: compressedBase64 }));

        try {
          await setDoc(
            doc(db, "users", user.uid),
            { ...formData, photoURL: compressedBase64 },
            { merge: true }
          );

          // Optionally update Auth profile display photo
          await updateProfile(user, { photoURL: compressedBase64 });

          toast.success("Profile picture updated!");
        } catch (err) {
          console.error("Error saving Base64 image:", err);
          toast.error("Failed to save image.");
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Save profile changes
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: formData.displayName });
      await setDoc(doc(db, "users", user.uid), formData, { merge: true });
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="profile-loading">
        <p>Loading profile...</p>
      </div>
    );

  return (
    <div className="profile-container">
      <h1 className="profile-title">My Profile</h1>

      <div className="profile-card">
        <div className="profile-avatar">
          <img
            src={
              formData.photoURL ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt="User avatar"
          />
          <label className="upload-btn">
            Change Photo
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          </label>
        </div>

        <div className="profile-fields">
          <label>Full Name</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="Enter your full name"
          />

          <label>Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Write something about yourself..."
          ></textarea>

          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />

          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
