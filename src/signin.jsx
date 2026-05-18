import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Use the environment variable for your AWS IP, or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Dumbbell icon scaled up 50% with dark stroke for white background consistency
const DumbbellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="84"
    height="84"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#111827" 
    strokeWidth="2.5"
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

  const styles = {
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "radial-gradient(circle at top, #ffffff 0%, #f3f4f6 100%)", 
      padding: "2rem",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      boxSizing: "border-box",
    },
    card: {
      width: "100%",
      maxWidth: "44rem", 
      padding: "5rem 4rem", 
      backgroundColor: "#ffffff", 
      borderRadius: "2rem", 
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 10px 20px -5px rgba(0, 0, 0, 0.03)",
      borderTop: "12px solid #5EF522", 
      boxSizing: "border-box",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "3.5rem",
    },
    heading: {
      marginTop: "1.75rem",
      fontSize: "3.5rem", 
      fontWeight: "900",
      textAlign: "center",
      color: "#111827", 
      letterSpacing: "-0.04em",
      textTransform: "uppercase",
      lineHeight: "1.1",
    },
    subheading: {
      marginTop: "1rem",
      textAlign: "center",
      fontSize: "1.75rem", 
      color: "#4b5563", 
      fontWeight: "400",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.75rem",
      marginBottom: "2.5rem",
    },
    input: {
      width: "100%",
      padding: "1.5rem 1.75rem", 
      fontSize: "1.75rem", 
      backgroundColor: "#ffffff",
      border: "2px solid #d1d5db", 
      borderRadius: "1rem",
      color: "#111827",
      boxSizing: "border-box",
      transition: "all 0.2s ease",
      outline: "none",
      fontWeight: "500",
    },
    button: {
      width: "100%",
      padding: "1.5rem 1.75rem", 
      fontSize: "1.75rem", 
      fontWeight: "900",
      color: "#111827", 
      backgroundColor: "#5EF522", 
      borderRadius: "1rem",
      boxShadow: "0 10px 25px -4px rgba(94, 245, 34, 0.45)", 
      border: "none",
      cursor: "pointer",
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginTop: "0.5rem",
    },
    message: {
      textAlign: "center",
      fontWeight: "700",
      fontSize: "1.5rem", 
      marginTop: "2rem",
      padding: "1.5rem",
      borderRadius: "1rem",
      boxSizing: "border-box",
    },
    messageError: {
      backgroundColor: "#fef2f2",
      color: "#ef4444",
      border: "2px solid #fecaca",
    },
    messageSuccess: {
      backgroundColor: "#ecfdf5",
      color: "#10b981",
      border: "2px solid #a7f3d0",
    },
    footer: {
      textAlign: "center",
      marginTop: "3.5rem",
      paddingTop: "3rem",
      borderTop: "2px solid #f3f4f6",
    },
    footerText: {
      fontSize: "1.5rem", 
      color: "#4b5563",
    },
    footerLink: {
      fontWeight: "800",
      color: "#111827",
      cursor: "pointer",
      textDecoration: "underline",
      textDecorationColor: "#5EF522", 
      textDecorationThickness: "4px", 
      textUnderlineOffset: "6px",
    },
  };

  const messageStyle = message.startsWith("✅")
    ? { ...styles.message, ...styles.messageSuccess }
    : { ...styles.message, ...styles.messageError };

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
            onFocus={(e) => {
              e.target.style.borderColor = "#5EF522";
              e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
          />
          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            onFocus={(e) => {
              e.target.style.borderColor = "#5EF522";
              e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
            onFocus={(e) => {
              e.target.style.borderColor = "#5EF522";
              e.target.style.boxShadow = "0 0 0 6px rgba(94, 245, 34, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
          />

          <button 
            type="submit" 
            style={styles.button}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#4fe313";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 14px 30px -2px rgba(94, 245, 34, 0.55)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#5EF522";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 25px -4px rgba(94, 245, 34, 0.45)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateY(1px)";
            }}
          >
            Create Account
          </button>
        </form>

        {message && (
          <p style={messageStyle}>
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

export default Signup;