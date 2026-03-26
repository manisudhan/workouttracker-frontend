import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Use the environment variable for your AWS IP, or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Simple Dumbbell Icon for consistency
const DumbbellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#818cf8" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 6.5l-6 6" />
    <path d="M12 6.5l6 6" />
    <path d="M12 17.5l-6-6" />
    <path d="M12 17.5l6-6" />
    <path d="M4 12.5h16" />
    <path d="M3 6.5h3" />
    <path d="M18 6.5h3" />
    <path d="M3 17.5h3" />
    <path d="M18 17.5h3" />
  </svg>
);

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setMessage("✅ Registration successful! Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        const errorText = await response.text();
        setMessage(`❌ Registration failed: ${errorText}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server not reachable");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <DumbbellIcon />
          <h1 style={styles.heading}>Join the Gym</h1>
          <p style={styles.subheading}>Create your account to start tracking</p>
        </div>

        <form onSubmit={handleSignup} style={styles.form}>
          <input
            type="text"
            placeholder="Choose Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button 
            type="submit" 
            style={styles.button}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
          >
            Create Account
          </button>
        </form>

        {message && (
            <p style={{
                ...styles.message, 
                color: message.startsWith('✅') ? '#34d399' : '#f87171'
            }}>
                {message}
            </p>
        )}

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{" "}
            <span 
                onClick={() => navigate("/login")} 
                style={styles.footerLink}
            >
                Log In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#111827",
    color: "#f3f4f6",
    fontFamily: "system-ui, sans-serif",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "40rem", // Slightly wider for big text
    padding: "40px",
    backgroundColor: "#1f2937",
    borderRadius: "20px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  heading: {
    fontSize: "3.5rem", // MASSIVE
    fontWeight: "800",
    color: "#ffffff",
    margin: "20px 0 10px 0",
  },
  subheading: {
    fontSize: "1.5rem",
    color: "#9ca3af",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  input: {
    width: "100%",
    height: "70px", // Chunkier
    padding: "0 25px",
    fontSize: "1.5rem", // Bigger text
    backgroundColor: "#374151",
    border: "2px solid #4b5563",
    borderRadius: "12px",
    color: "#ffffff",
    boxSizing: "border-box",
  },
  button: {
    marginTop: "10px",
    height: "70px",
    fontSize: "1.5rem",
    fontWeight: "700",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  footer: {
    marginTop: "30px",
    textAlign: "center",
  },
  footerText: {
    fontSize: "1.25rem",
    color: "#9ca3af",
  },
  footerLink: {
    color: "#818cf8",
    fontWeight: "700",
    cursor: "pointer",
    textDecoration: "underline",
  },
  message: {
    marginTop: "25px",
    fontSize: "1.25rem",
    fontWeight: "600",
    textAlign: "center",
  },
};

export default Signup;