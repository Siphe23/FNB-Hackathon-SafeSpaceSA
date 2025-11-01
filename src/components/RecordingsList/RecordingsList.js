
import React, { useEffect, useRef, useState } from "react";
import { getDatabase, ref as dbRef, onValue, push, set } from "firebase/database";
import "./RecordingsList.css"; 

export default function RecordingsList() {
  const [recordings, setRecordings] = useState([]);      
  const [isRecording, setIsRecording] = useState(false); 
  const [isSaving, setIsSaving] = useState(false);       
  const [showPopup, setShowPopup] = useState(false);    
  const [latestRec, setLatestRec] = useState(null);       

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

 
  
  useEffect(() => {
    const db = getDatabase();
    const recRef = dbRef(db, "recordings");
    const unsub = onValue(recRef, (snap) => {
      const data = snap.val() || {};
    
      const map = new Map();
      Object.entries(data).forEach(([id, value]) => {
        if (value && value.url) {
          map.set(value.url, { id, ...value });
        }
      });
     
      const arr = Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setRecordings(arr);
    });
    return () => unsub();
  }, []);

  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size) chunksRef.current.push(e.data);
      };
      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.error("startRecording error:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;
    const mr = mediaRecorderRef.current;

    mr.onstop = async () => {
      
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const fileUrl = URL.createObjectURL(blob);
      setIsSaving(true);

      try {
       
        
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", file);

        const res = await fetch(`${process.env.REACT_APP_API_BASE || "http://localhost:5000"}/api/upload-audio`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

       

        
        try {
          const db = getDatabase();
          const newRef = push(dbRef(db, "recordings"));
          await set(newRef, { url: savedUrl, timestamp: Date.now() });
        } catch (dbErr) {
          console.error("RTDB save error:", dbErr);
       
        }

        
        setLatestRec(savedUrl);
        setShowPopup(true);

        // auto-close popup after 10s
        setTimeout(() => setShowPopup(false), 10000);
      } catch (err) {
        console.error("upload error:", err);
        alert("Upload failed.");
      } finally {
        setIsSaving(false);
      }
    
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      mediaRecorderRef.current = null;
      chunksRef.current = [];
      setIsRecording(false);
    };

    
    mr.stop();
  };


  
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="recordings-container">
      <h3 className="recordings-title">🎙 Voice Recorder</h3>

      <div className="recording-controls">
        {!isRecording ? (
          <button className="record-btn" onClick={startRecording} disabled={isSaving}>
            ⏺ Start Recording
          </button>
        ) : (
          <button className="stop-btn" onClick={stopRecording}>
            ⏹ Stop Recording
          </button>
        )}
      </div>

      {isSaving && <p className="saving-text">💾 Saving recording...</p>}

      <div className="recordings-list">
        {recordings.length === 0 ? (
          <p className="no-recordings">No saved recordings yet.</p>
        ) : (
          recordings.map((rec) => (
            <div className="record-card" key={rec.id}>
              <audio controls src={rec.url}></audio>
              <a className="download-link" href={rec.url} download>
                💾 Download
              </a>
            </div>
          ))
        )}
      </div>

  
      {showPopup && latestRec && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h4>✅ Recording Saved</h4>
            <audio controls src={latestRec} style={{ width: "100%" }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
              <a className="download-link" href={latestRec} download style={{ marginRight: 8 }}>
                ⬇️ Download
              </a>
              <button className="ok-btn" onClick={() => setShowPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
