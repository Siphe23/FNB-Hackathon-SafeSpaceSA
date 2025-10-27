// src/components/VideoRecorder/VideoRecorder.jsx
import React, { useRef, useState, useEffect } from "react";
import "./VideoRecorder.css"; // small styles below

export default function VideoRecorder({ onUploadComplete, autoStopMs = 7000 }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [chunks, setChunks] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  // request camera + mic permission and show preview
  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.error("Camera permission error:", err);
      alert("Cannot access camera/microphone. Please allow permissions.");
    }
  }

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [stream, previewUrl]);

  async function startRecording() {
    if (!stream) {
      await startCamera();
      // small delay to allow video element to attach stream
      await new Promise((r) => setTimeout(r, 200));
    }
    const s = stream || (videoRef.current && videoRef.current.srcObject);
    if (!s) return alert("No camera available.");

    const recorder = new MediaRecorder(s, { mimeType: "video/webm; codecs=vp8,opus" });
    mediaRecorderRef.current = recorder;
    const localChunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size) localChunks.push(e.data);
    };

    recorder.onstop = async () => {
      setRecording(false);
      setChunks(localChunks);
      const blob = new Blob(localChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      // call parent to upload
      if (onUploadComplete) {
        try {
          await uploadBlobToServer(blob); // uses local upload helper below
          await onUploadComplete(url);
        } catch (err) {
          console.error("Upload failed:", err);
          alert("Upload failed. See console.");
        }
      }
    };

    recorder.start();
    setRecording(true);

    // optional auto-stop
    if (autoStopMs && autoStopMs > 0) {
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording")
          mediaRecorderRef.current.stop();
      }, autoStopMs);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  async function uploadBlobToServer(blob) {
    // change URL if backend hosted elsewhere
    const apiUrl = "http://localhost:5000/api/upload-video";
    const file = new File([blob], `video-${Date.now()}.webm`, { type: blob.type });
    const fd = new FormData();
    fd.append("video", file);

    const res = await fetch(apiUrl, { method: "POST", body: fd });
    if (!res.ok) throw new Error("upload failed");
    return res.json();
  }

  function openInNewTab() {
    // Open a small recorder page in a new tab that will prompt for camera
    const w = window.open("/record", "_blank", "noopener,noreferrer,width=800,height=600");
    if (!w) alert("Popup blocked. Allow popups to use the open-in-new-tab recorder.");
  }

  return (
    <div className="video-recorder">
      <div className="video-preview">
        <video ref={videoRef} autoPlay playsInline muted={!recording} controls={false} className="preview-video" />
        {previewUrl && (
          <div className="preview-playback">
            <h4>Preview</h4>
            <video src={previewUrl} controls className="playback-video" />
          </div>
        )}
      </div>

      <div className="recorder-controls">
        <button onClick={startCamera} className="btn">Open Camera</button>
        {!recording ? (
          <button onClick={startRecording} className="btn primary">Start Recording</button>
        ) : (
          <button onClick={stopRecording} className="btn danger">Stop</button>
        )}
        <button onClick={openInNewTab} className="btn">Open Recorder in New Tab</button>
      </div>
    </div>
  );
}
