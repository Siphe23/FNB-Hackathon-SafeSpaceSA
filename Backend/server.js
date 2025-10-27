// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve uploaded files

// --- Multer Setup ---
const upload = multer({ dest: "uploads/" });

// --- Initialize Firebase Admin ---
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://safespacesa-app-default-rtdb.firebaseio.com", // ✅ RTDB
  });
}

const rtdb = admin.database();

// --- Test route ---
app.get("/", (req, res) => res.send("✅ Backend running with Auth + Realtime DB!"));

// --- Upload Voice Recording ---
app.post("/api/upload-audio", upload.single("audio"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const localUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${file.filename}`;

    // ✅ Save metadata in Realtime DB
    const ref = rtdb.ref("recordings").push();
    await ref.set({
      url: localUrl,
      createdAt: Date.now(),
    });

    res.status(200).json({
      message: "✅ Audio saved locally and metadata stored in RTDB.",
      fileUrl: localUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ensure multer is already imported and upload is declared: const upload = multer({ dest: "uploads/" });

// Add this endpoint:
app.post("/api/upload-video", upload.single("video"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const localUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${file.filename}`;

    // Save metadata to RTDB using admin (assuming admin initialized with databaseURL)
    const rtdb = admin.database();
    const recordingsRef = rtdb.ref("videos").push();
    await recordingsRef.set({ url: localUrl, createdAt: Date.now() });

    res.status(200).json({ message: "✅ Video uploaded", fileUrl: localUrl });
  } catch (err) {
    console.error("video upload error", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// --- List all uploaded recordings ---
app.get("/api/list-audio", async (req, res) => {
  try {
    const snapshot = await rtdb.ref("recordings").once("value");
    const recordings = snapshot.val() || {};
    const list = Object.entries(recordings).map(([id, data]) => ({
      id,
      ...data,
    }));
    res.status(200).json(list);
  } catch (error) {
    console.error("List audio error:", error);
    res.status(500).json({ error: error.message });
  }
});
// --- List all uploaded videos ---
app.get("/api/list-videos", async (req, res) => {
  try {
    const snapshot = await rtdb.ref("videos").once("value");
    const videos = snapshot.val() || {};
    const list = Object.entries(videos).map(([id, data]) => ({
      id,
      ...data,
    }));
    res.status(200).json(list);
  } catch (error) {
    console.error("List videos error:", error);
    res.status(500).json({ error: error.message });
  }
});
