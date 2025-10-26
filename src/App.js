import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

// 🔹 Import pages
import WelcomePage from "./pages/WELLCOME/Welcome";
import AuthPage from "./pages/LoginSigup/Auth";
import Dashboard from "./pages/Dashboard/Dashboard";
import Onboarding from "./pages/Onboarding/Onboarding";
import Profile from "./pages/Profile/Profile";

// 🔹 Firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Firebase/firebase";

// 🔹 Simple Loading Screen (removed dots)
function Loading() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "1.2rem",
        color: "#4a8af4",
        fontWeight: "600",
      }}
    >
      Loading...
    </div>
  );
}

// 🔹 Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        toast.success(
          `Welcome back, ${currentUser.displayName || "SafeSpace User"}!`
        );
      } else {
        console.log("No user logged in.");
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <Loading />;

  return (
    <Router>
      <ScrollToTop />

      <Routes>
        {/* 🔓 Public Routes */}
        {!user && (
          <>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/auth" element={<AuthPage />} />
          </>
        )}

        {/* 🔐 Protected Routes */}
        {user && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </>
        )}

        {/* ✅ Fallback Redirect */}
        <Route
          path="*"
          element={<Navigate to={user ? "/profile" : "/"} replace />}
        />
      </Routes>

      {/* 🔔 Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#4a8af4",
            color: "#fff",
            borderRadius: "10px",
            padding: "10px 16px",
          },
          success: {
            iconTheme: { primary: "#fff", secondary: "#4a8af4" },
          },
          error: {
            iconTheme: { primary: "#fff", secondary: "#ff4d4f" },
          },
        }}
      />
    </Router>
  );
}

export default App;
