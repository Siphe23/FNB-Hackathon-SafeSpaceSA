import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../Firebase/firebase"; // ✅ Correct import
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./auth.css";

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔹 Handle login/signup
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        // ✅ Create new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        toast.success("🎉 Account created successfully!");
      } else {
        // ✅ Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("👋 Welcome back!");
      }

      // ✅ Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Auth Error:", error);

      // Handle Firebase Auth errors clearly
      let message = "Something went wrong!";
      if (error.code === "auth/user-not-found") message = "User not found. Please sign up.";
      if (error.code === "auth/wrong-password") message = "Incorrect password.";
      if (error.code === "auth/email-already-in-use") message = "Email already in use.";
      if (error.code === "auth/invalid-email") message = "Invalid email address.";
      if (error.code === "auth/configuration-not-found")
        message = "⚠️ Check your Firebase configuration or API key.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="auth-subtitle">
          {isSignup
            ? "Join SafeSpace SA and help build safer schools."
            : "Log in to continue spreading kindness."}
        </p>

        <form onSubmit={handleAuth} className="auth-form">
          {isSignup && (
            <input
              type="text"
              placeholder="Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>

        <p className="switch">
          {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
          <span onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Log In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
